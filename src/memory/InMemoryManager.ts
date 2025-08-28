import { BaseMemoryManager } from './BaseMemoryManager';
import { Message, ConversationContext } from '../types';

export class InMemoryManager extends BaseMemoryManager {
  private conversations: Map<string, ConversationContext> = new Map();

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
          break; // Don't remove system messages
        }
      }
    }
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
    return id;
  }

  async listConversations(): Promise<ConversationContext[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.metadata.updated.getTime() - a.metadata.updated.getTime());
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);
  }

  async clearAll(): Promise<void> {
    this.conversations.clear();
  }
}
