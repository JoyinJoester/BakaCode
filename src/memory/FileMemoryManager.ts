import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseMemoryManager } from './BaseMemoryManager';
import { Message, ConversationContext } from '../types';

export class FileMemoryManager extends BaseMemoryManager {
  private memoryFile: string;
  private conversations: Map<string, ConversationContext> = new Map();
  private saveTimeout: NodeJS.Timeout | null = null;
  private isSaving: boolean = false;

  constructor(memoryFile?: string, maxContextLength?: number) {
    super(maxContextLength);
    this.memoryFile = memoryFile || path.join(
      process.env.HOME || process.env.USERPROFILE || '.', 
      '.bakacode', 
      'memory.json'
    );
    this.loadFromFile();
  }

  private async loadFromFile(): Promise<void> {
    try {
      if (await fs.pathExists(this.memoryFile)) {
        const data = await fs.readJson(this.memoryFile);
        
        // Convert plain objects back to Map and Date objects
        for (const [id, conv] of Object.entries(data.conversations || {})) {
          const conversation = conv as any;
          this.conversations.set(id, {
            ...conversation,
            metadata: {
              ...conversation.metadata,
              created: new Date(conversation.metadata.created),
              updated: new Date(conversation.metadata.updated)
            },
            messages: conversation.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          });
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.warn('Memory file is corrupted, creating backup and starting fresh...');
        try {
          // Create backup of corrupted file
          const backupFile = this.memoryFile + '.backup.' + Date.now();
          await fs.copy(this.memoryFile, backupFile);
          console.warn(`Corrupted file backed up to: ${backupFile}`);
          
          // Initialize with empty memory
          this.conversations.clear();
          this.debouncedSave();
        } catch (backupError) {
          console.warn('Failed to create backup:', backupError);
        }
      } else {
        console.warn('Failed to load memory from file:', error);
      }
    }
  }

  private async saveToFile(): Promise<void> {
    if (this.isSaving) return;
    
    try {
      this.isSaving = true;
      await fs.ensureDir(path.dirname(this.memoryFile));
      
      const data = {
        conversations: Object.fromEntries(this.conversations),
        lastSaved: new Date().toISOString()
      };
      
      await fs.writeJson(this.memoryFile, data, { spaces: 2 });
    } catch (error) {
      console.warn('Failed to save memory to file:', error);
    } finally {
      this.isSaving = false;
    }
  }

  private debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveToFile();
    }, 100); // 延迟100ms保存，避免频繁操作
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    let conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    conversation.messages.push(message);
    conversation.metadata.updated = new Date();
    
    // Trim messages if they exceed context length
    const totalTokens = conversation.messages.reduce(
      (sum: number, msg: Message) => sum + this.estimateTokens(msg.content), 
      0
    );
    
    if (totalTokens > this.maxContextLength) {
      // Remove oldest messages (keeping system messages)
      while (conversation.messages.length > 1 && 
             this.estimateTokens(conversation.messages.map((m: Message) => m.content).join('')) > this.maxContextLength) {
        const removed = conversation.messages.find((msg: Message) => msg.role !== 'system');
        if (removed) {
          const index = conversation.messages.indexOf(removed);
          conversation.messages.splice(index, 1);
        } else {
          break;
        }
      }
    }

    this.debouncedSave();
  }

  async getMessages(conversationId: string, limit?: number): Promise<Message[]> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return [];
    }

    const messages = conversation.messages;
    return limit ? messages.slice(-limit) : messages;
  }

  async getConversation(conversationId: string): Promise<ConversationContext | null> {
    return this.conversations.get(conversationId) || null;
  }

  async createConversation(provider: string, model: string): Promise<string> {
    const id = this.generateConversationId();
    const conversation: ConversationContext = {
      id,
      messages: [],
      metadata: {
        created: new Date(),
        updated: new Date(),
        provider,
        model
      }
    };
    
    this.conversations.set(id, conversation);
    this.debouncedSave();
    return id;
  }

  async listConversations(): Promise<ConversationContext[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.metadata.updated.getTime() - a.metadata.updated.getTime());
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);
    this.debouncedSave();
  }

  async clearAll(): Promise<void> {
    this.conversations.clear();
    this.debouncedSave();
  }
}
