import { ConfigManager } from '../../src/config/ConfigManager';
import { AgentConfig } from '../../src/types';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    // Reset singleton instance for each test
    (ConfigManager as any).instance = undefined;
    configManager = ConfigManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getConfig', () => {
    it('should return default configuration', () => {
      const config = configManager.getConfig();
      expect(config).toBeDefined();
      expect(config.provider).toBeDefined();
      expect(config.tools).toBeDefined();
      expect(config.memory).toBeDefined();
      expect(config.security).toBeDefined();
    });
  });

  describe('setProvider', () => {
    it('should update provider configuration', () => {
      const newProvider = {
        type: 'openai' as const,
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4',
        apiKey: 'test-key'
      };

      configManager.setProvider(newProvider);
      const config = configManager.getProviderConfig();
      
      expect(config.type).toBe('openai');
      expect(config.model).toBe('gpt-4');
      expect(config.apiKey).toBe('test-key');
    });
  });

  describe('getProviderConfig', () => {
    it('should return provider configuration', () => {
      const providerConfig = configManager.getProviderConfig();
      expect(providerConfig).toBeDefined();
      expect(providerConfig.type).toBeDefined();
      expect(providerConfig.model).toBeDefined();
      expect(providerConfig.baseUrl).toBeDefined();
    });
  });

  describe('getToolsConfig', () => {
    it('should return tools configuration', () => {
      const tools = configManager.getToolsConfig();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('getMemoryConfig', () => {
    it('should return memory configuration', () => {
      const memoryConfig = configManager.getMemoryConfig();
      expect(memoryConfig).toBeDefined();
      expect(typeof memoryConfig.enabled).toBe('boolean');
      expect(typeof memoryConfig.persistent).toBe('boolean');
      expect(typeof memoryConfig.maxLength).toBe('number');
    });
  });

  describe('getSecurityConfig', () => {
    it('should return security configuration', () => {
      const securityConfig = configManager.getSecurityConfig();
      expect(securityConfig).toBeDefined();
      expect(Array.isArray(securityConfig.allowedDirectories)).toBe(true);
      expect(Array.isArray(securityConfig.blockedCommands)).toBe(true);
    });
  });
});
