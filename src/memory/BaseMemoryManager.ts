import { Message, ConversationContext } from '../types';

export interface MemoryManager {
  addMessage(conversationId: string, message: Message): Promise<void>;
  getMessages(conversationId: string, limit?: number): Promise<Message[]>;
  getConversation(conversationId: string): Promise<ConversationContext | null>;
  createConversation(provider: string, model: string): Promise<string>;
  listConversations(): Promise<ConversationContext[]>;
  deleteConversation(conversationId: string): Promise<void>;
  clearAll(): Promise<void>;
  getContextWindow(conversationId: string, maxTokens: number): Promise<Message[]>;
}

export abstract class BaseMemoryManager implements MemoryManager {
  protected maxContextLength: number;

  constructor(maxContextLength: number = 8192) {
    this.maxContextLength = maxContextLength;
  }

  abstract addMessage(conversationId: string, message: Message): Promise<void>;
  abstract getMessages(conversationId: string, limit?: number): Promise<Message[]>;
  abstract getConversation(conversationId: string): Promise<ConversationContext | null>;
  abstract createConversation(provider: string, model: string): Promise<string>;
  abstract listConversations(): Promise<ConversationContext[]>;
  abstract deleteConversation(conversationId: string): Promise<void>;
  abstract clearAll(): Promise<void>;

  public async getContextWindow(conversationId: string, maxTokens: number): Promise<Message[]> {
    const messages = await this.getMessages(conversationId);
    
    // Simple token estimation (roughly 4 characters per token)
    let tokenCount = 0;
    const contextMessages: Message[] = [];
    
    // Process messages in reverse order (most recent first)
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = Math.ceil(message.content.length / 4);
      
      if (tokenCount + messageTokens > maxTokens) {
        break;
      }
      
      contextMessages.unshift(message);
      tokenCount += messageTokens;
    }
    
    return contextMessages;
  }

  protected generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected estimateTokens(text: string): number {
    // Simple estimation: roughly 4 characters per token
    return Math.ceil(text.length / 4);
  }
}
