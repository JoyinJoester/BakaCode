import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'yaml';
import * as dotenv from 'dotenv';
import { AgentConfig, ProviderConfig } from '../types';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AgentConfig;
  private configDir: string;

  private constructor() {
    this.configDir = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.bakacode');
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AgentConfig {
    // Load environment variables
    dotenv.config();

    // Default configuration
    const defaultConfig: AgentConfig = {
      provider: {
        type: 'ollama',
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api',
        model: process.env.DEFAULT_MODEL || 'qwen3:4b',
        maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        apiKey: process.env.OPENAI_API_KEY
      },
      tools: ['file', 'shell', 'http', 'websearch'],
      memory: {
        enabled: process.env.ENABLE_PERSISTENT_MEMORY === 'true',
        persistent: true,
        maxLength: parseInt(process.env.MAX_CONTEXT_LENGTH || '8192')
      },
      security: {
        allowedDirectories: (process.env.ALLOWED_DIRECTORIES || './,../').split(','),
        blockedCommands: (process.env.BLOCKED_COMMANDS || 'rm,del,format,shutdown,reboot').split(',')
      },
      system: {
        promptFile: process.env.BAKACODE_SYSTEM_PROMPT_FILE,
        useEnhancedPrompt: process.env.BAKACODE_USE_ENHANCED_PROMPT !== 'false' // 默认为true，除非明确设为false
      },
      locale: process.env.BAKACODE_LOCALE || this.detectSystemLocale()
    };

    // Try to load from config files
    const configFiles = [
      path.join(this.configDir, 'config.yaml'),
      path.join(this.configDir, 'config.yml'),
      path.join(this.configDir, 'config.json'),
      './bakacode.config.yaml',
      './bakacode.config.json'
    ];

    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        try {
          const content = fs.readFileSync(configFile, 'utf8');
          let fileConfig: Partial<AgentConfig>;

          if (configFile.endsWith('.json')) {
            fileConfig = JSON.parse(content);
          } else {
            fileConfig = yaml.parse(content);
          }

          return this.mergeConfig(defaultConfig, fileConfig);
        } catch (error) {
          console.warn(`Failed to load config from ${configFile}:`, error);
        }
      }
    }

    return defaultConfig;
  }

  private mergeConfig(defaultConfig: AgentConfig, fileConfig: Partial<AgentConfig>): AgentConfig {
    return {
      provider: { ...defaultConfig.provider, ...fileConfig.provider },
      tools: fileConfig.tools || defaultConfig.tools,
      memory: { ...defaultConfig.memory, ...fileConfig.memory },
      security: { ...defaultConfig.security, ...fileConfig.security },
      system: { ...defaultConfig.system, ...fileConfig.system },
      locale: fileConfig.locale || defaultConfig.locale
    };
  }

  private detectSystemLocale(): string {
    const locale = process.env.LANG || process.env.LANGUAGE || 'en';
    if (locale.startsWith('zh_CN') || locale.startsWith('zh-CN')) return 'zh-CN';
    if (locale.startsWith('zh_TW') || locale.startsWith('zh-TW')) return 'zh-TW';
    if (locale.startsWith('ja')) return 'ja';
    if (locale.startsWith('ko')) return 'ko';
    return 'en';
  }

  public getConfig(): AgentConfig {
    return this.config;
  }

  public updateConfig(updates: Partial<AgentConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
    this.saveConfig();
  }

  public setProvider(provider: Partial<ProviderConfig>): void {
    this.config.provider = { ...this.config.provider, ...provider };
    this.saveConfig();
  }

  public setBingKey(apiKey: string): void {
    process.env.BING_API_KEY = apiKey;
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      fs.ensureDirSync(this.configDir);
      const configFile = path.join(this.configDir, 'config.yaml');
      fs.writeFileSync(configFile, yaml.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save config:', error);
    }
  }

  public getProviderConfig(): ProviderConfig {
    return this.config.provider;
  }

  public getToolsConfig(): string[] {
    return this.config.tools;
  }

  public getMemoryConfig() {
    return this.config.memory;
  }

  public getSecurityConfig() {
    return this.config.security;
  }

  public getSystemConfig() {
    return this.config.system;
  }

  public getLocale(): string {
    return this.config.locale || 'en';
  }

  public setLocale(locale: string): void {
    this.config.locale = locale;
    this.saveConfig();
  }
}
