import { InMemoryManager } from '../../src/memory/InMemoryManager';
import { Message } from '../../src/types';

describe('InMemoryManager', () => {
  let memoryManager: InMemoryManager;

  beforeEach(() => {
    memoryManager = new InMemoryManager();
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const conversationId = await memoryManager.createConversation('ollama', 'llama3');
      expect(conversationId).toBeDefined();
      expect(typeof conversationId).toBe('string');
      expect(conversationId).toMatch(/^conv_/);
    });
  });

  describe('getConversation', () => {
    it('should return conversation if exists', async () => {
      const conversationId = await memoryManager.createConversation('ollama', 'llama3');
      const conversation = await memoryManager.getConversation(conversationId);
      
      expect(conversation).toBeDefined();
      expect(conversation!.id).toBe(conversationId);
      expect(conversation!.metadata.provider).toBe('ollama');
      expect(conversation!.metadata.model).toBe('llama3');
    });

    it('should return null if conversation does not exist', async () => {
      const conversation = await memoryManager.getConversation('non-existent');
      expect(conversation).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('should add message to existing conversation', async () => {
      const conversationId = await memoryManager.createConversation('ollama', 'llama3');
      const message: Message = {
        id: 'msg1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      };

      await memoryManager.addMessage(conversationId, message);
      const messages = await memoryManager.getMessages(conversationId);
      
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    it('should throw error if conversation does not exist', async () => {
      const message: Message = {
        id: 'msg1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      };

      await expect(memoryManager.addMessage('non-existent', message))
        .rejects.toThrow('Conversation not found');
    });
  });

  describe('getMessages', () => {
    it('should return messages for conversation', async () => {
      const conversationId = await memoryManager.createConversation('ollama', 'llama3');
      const messages: Message[] = [
        {
          id: 'msg1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date()
        },
        {
          id: 'msg2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date()
        }
      ];

      for (const message of messages) {
        await memoryManager.addMessage(conversationId, message);
      }

      const retrievedMessages = await memoryManager.getMessages(conversationId);
      expect(retrievedMessages).toHaveLength(2);
    });

    it('should return empty array for non-existent conversation', async () => {
      const messages = await memoryManager.getMessages('non-existent');
      expect(messages).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const conversationId = await memoryManager.createConversation('ollama', 'llama3');
      const messages: Message[] = [
        { id: 'msg1', role: 'user', content: 'Hello 1', timestamp: new Date() },
        { id: 'msg2', role: 'assistant', content: 'Hi 1', timestamp: new Date() },
        { id: 'msg3', role: 'user', content: 'Hello 2', timestamp: new Date() },
        { id: 'msg4', role: 'assistant', content: 'Hi 2', timestamp: new Date() }
      ];

      for (const message of messages) {
        await memoryManager.addMessage(conversationId, message);
      }

      const limitedMessages = await memoryManager.getMessages(conversationId, 2);
      expect(limitedMessages).toHaveLength(2);
      expect(limitedMessages[0].id).toBe('msg3');
      expect(limitedMessages[1].id).toBe('msg4');
    });
  });

  describe('listConversations', () => {
    it('should return all conversations sorted by update time', async () => {
      const conv1 = await memoryManager.createConversation('ollama', 'llama3');
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const conv2 = await memoryManager.createConversation('openai', 'gpt-4');
      
      const conversations = await memoryManager.listConversations();
      expect(conversations).toHaveLength(2);
      // Check that conversations are sorted by most recent first
      expect(conversations[0].metadata.updated.getTime()).toBeGreaterThanOrEqual(conversations[1].metadata.updated.getTime());
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      const conversationId = await memoryManager.createConversation('ollama', 'llama3');
      await memoryManager.deleteConversation(conversationId);
      
      const conversation = await memoryManager.getConversation(conversationId);
      expect(conversation).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all conversations', async () => {
      await memoryManager.createConversation('ollama', 'llama3');
      await memoryManager.createConversation('openai', 'gpt-4');
      
      await memoryManager.clearAll();
      
      const conversations = await memoryManager.listConversations();
      expect(conversations).toHaveLength(0);
    });
  });
});
