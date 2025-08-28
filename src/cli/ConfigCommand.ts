import { Command } from 'commander';
import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils';
import { I18n } from '../i18n/I18n';

export class ConfigCommand {
  public static register(program: Command): void {
    const i18n = I18n.getInstance();
    
    const configCmd = program
      .command('config')
      .description(i18n.t('cli.config_description'));

    configCmd
      .command('set')
      .description('Set a configuration value')
      .argument('<key>', 'Configuration key (e.g., bing_key, provider.model)')
      .argument('<value>', 'Configuration value')
      .action(async (key, value) => {
        await this.set(key, value);
      });

    configCmd
      .command('get')
      .description('Get a configuration value')
      .argument('<key>', 'Configuration key')
      .action(async (key) => {
        await this.get(key);
      });

    configCmd
      .command('show')
      .description('Show all configuration')
      .action(async () => {
        await this.show();
      });

    configCmd
      .command('reset')
      .description('Reset configuration to defaults')
      .action(async () => {
        await this.reset();
      });

    configCmd
      .command('prompt')
      .description('Configure system prompt settings')
      .option('--enhanced', 'Use enhanced BakaCode prompt (default)')
      .option('--file <path>', 'Use custom prompt file')
      .option('--default', 'Use basic BakaCode prompt')
      .option('--show', 'Show current prompt configuration')
      .action(async (options) => {
        await this.configurePrompt(options);
      });
  }

  private static async set(key: string, value: string): Promise<void> {
    const logger = Logger.getInstance();
    const config = ConfigManager.getInstance();

    try {
      // Handle special keys
      if (key === 'bing_key') {
        config.setBingKey(value);
        logger.success('Bing API key updated');
        return;
      }

      if (key === 'locale') {
        config.setLocale(value);
        logger.success(`Updated language to ${value}`);
        return;
      }

      // Handle nested keys (e.g., provider.model, system.useClaudeStyle)
      const parts = key.split('.');
      if (parts.length === 2 && parts[0] === 'provider') {
        const providerConfig = config.getProviderConfig();
        const updatedConfig = { ...providerConfig };
        
        switch (parts[1]) {
          case 'type':
            if (!['ollama', 'openai'].includes(value)) {
              logger.error('Provider type must be "ollama" or "openai"');
              return;
            }
            updatedConfig.type = value as 'ollama' | 'openai';
            break;
          case 'model':
            updatedConfig.model = value;
            break;
          case 'baseUrl':
            updatedConfig.baseUrl = value;
            break;
          case 'apiKey':
            updatedConfig.apiKey = value;
            break;
          case 'maxTokens':
            updatedConfig.maxTokens = parseInt(value);
            break;
          case 'temperature':
            updatedConfig.temperature = parseFloat(value);
            break;
          default:
            logger.error(`Unknown provider config key: ${parts[1]}`);
            return;
        }
        
        config.setProvider(updatedConfig);
        logger.success(`Updated ${key} to ${value}`);
      } else if (parts.length === 2 && parts[0] === 'system') {
        const currentConfig = config.getConfig();
        const systemConfig = { ...(currentConfig.system || {}) };
        
        switch (parts[1]) {
          case 'useEnhancedPrompt':
            systemConfig.useEnhancedPrompt = value === 'true';
            break;
          case 'promptFile':
            systemConfig.promptFile = value || undefined;
            break;
          default:
            logger.error(`Unknown system config key: ${parts[1]}`);
            return;
        }
        
        config.updateConfig({ system: systemConfig });
        logger.success(`Updated ${key} to ${value}`);
      } else {
        logger.error(`Unknown configuration key: ${key}`);
      }
    } catch (error: any) {
      logger.error('Failed to set configuration:', error.message);
    }
  }

  private static async get(key: string): Promise<void> {
    const logger = Logger.getInstance();
    const config = ConfigManager.getInstance();

    try {
      if (key === 'bing_key') {
        const value = process.env.BING_API_KEY;
        console.log(value ? '[HIDDEN]' : 'Not set');
        return;
      }

      const parts = key.split('.');
      if (parts.length === 2 && parts[0] === 'provider') {
        const providerConfig = config.getProviderConfig();
        const value = (providerConfig as any)[parts[1]];
        
        if (parts[1] === 'apiKey') {
          console.log(value ? '[HIDDEN]' : 'Not set');
        } else {
          console.log(value ?? 'Not set');
        }
      } else {
        logger.error(`Unknown configuration key: ${key}`);
      }
    } catch (error: any) {
      logger.error('Failed to get configuration:', error.message);
    }
  }

  private static async show(): Promise<void> {
    const logger = Logger.getInstance();
    const config = ConfigManager.getInstance();

    try {
      const providerConfig = config.getProviderConfig();
      const memoryConfig = config.getMemoryConfig();
      const securityConfig = config.getSecurityConfig();
      const systemConfig = config.getSystemConfig();

      console.log('\n--- Configuration ---\n');
      
      console.log('Provider:');
      console.log(`  type: ${providerConfig.type}`);
      console.log(`  model: ${providerConfig.model}`);
      console.log(`  baseUrl: ${providerConfig.baseUrl}`);
      console.log(`  apiKey: ${providerConfig.apiKey ? '[HIDDEN]' : 'Not set'}`);
      console.log(`  maxTokens: ${providerConfig.maxTokens}`);
      console.log(`  temperature: ${providerConfig.temperature}`);
      
      console.log('\nSystem Prompt:');
      if (systemConfig?.promptFile) {
        console.log(`  mode: Custom file`);
        console.log(`  file: ${systemConfig.promptFile}`);
      } else if (systemConfig?.useEnhancedPrompt === false) {
        console.log(`  mode: Basic BakaCode prompt`);
      } else {
        console.log(`  mode: Enhanced BakaCode prompt (default)`);
        console.log(`  status: Built-in high-quality prompt system`);
      }
      
      console.log('\nMemory:');
      console.log(`  enabled: ${memoryConfig.enabled}`);
      console.log(`  persistent: ${memoryConfig.persistent}`);
      console.log(`  maxLength: ${memoryConfig.maxLength}`);
      
      console.log('\nSecurity:');
      console.log(`  allowedDirectories: ${securityConfig.allowedDirectories.join(', ')}`);
      console.log(`  blockedCommands: ${securityConfig.blockedCommands.join(', ')}`);
      
      console.log('\nEnvironment:');
      console.log(`  locale: ${config.getLocale()}`);
      console.log(`  BING_API_KEY: ${process.env.BING_API_KEY ? '[HIDDEN]' : 'Not set'}`);
      console.log('');
    } catch (error: any) {
      logger.error('Failed to show configuration:', error.message);
    }
  }

  private static async reset(): Promise<void> {
    const logger = Logger.getInstance();
    
    try {
      // This would reset to default configuration
      // For now, just show a warning
      logger.warn('Configuration reset is not yet implemented.');
      logger.info('To reset configuration, delete the config file at ~/.bakacode/config.yaml');
    } catch (error: any) {
      logger.error('Failed to reset configuration:', error.message);
    }
  }

  private static async configurePrompt(options: any): Promise<void> {
    const logger = Logger.getInstance();
    const config = ConfigManager.getInstance();
    const fs = require('fs');
    const path = require('path');

    try {
      if (options.show) {
        const systemConfig = config.getSystemConfig();
        console.log('\n--- System Prompt Configuration ---\n');
        
        if (systemConfig?.promptFile) {
          console.log('Current mode: Custom prompt file');
          console.log(`Prompt file: ${systemConfig.promptFile}`);
          console.log(`File exists: ${fs.existsSync(systemConfig.promptFile) ? 'Yes' : 'No'}`);
        } else if (systemConfig?.useEnhancedPrompt === false) {
          console.log('Current mode: Basic BakaCode prompt');
        } else {
          console.log('Current mode: Enhanced BakaCode prompt (default)');
          console.log(`Status: Built-in high-quality prompt system`);
        }
        return;
      }

      if (options.enhanced) {
        await this.set('system.useEnhancedPrompt', 'true');
        await this.set('system.promptFile', '');
        console.log('✅ Configured to use Enhanced BakaCode prompt');
        console.log(`📄 Using built-in high-quality prompt system`);
        
      } else if (options.file) {
        const customFile = path.resolve(options.file);
        if (!fs.existsSync(customFile)) {
          logger.error(`Custom prompt file not found: ${customFile}`);
          return;
        }
        
        await this.set('system.useEnhancedPrompt', 'false');
        await this.set('system.promptFile', customFile);
        console.log('✅ Configured to use custom prompt file');
        console.log(`📄 Using prompt file: ${customFile}`);
        
      } else if (options.default) {
        await this.set('system.useEnhancedPrompt', 'false');
        await this.set('system.promptFile', '');
        console.log('✅ Configured to use basic BakaCode prompt');
        
      } else {
        console.log('\nSystem Prompt Configuration Options:\n');
        console.log('  --enhanced   Use enhanced BakaCode prompt (default)');
        console.log('  --file PATH  Use custom prompt file');
        console.log('  --default    Use basic BakaCode prompt');
        console.log('  --show       Show current prompt configuration');
        console.log('\nExamples:');
        console.log('  bakac config prompt --enhanced');
        console.log('  bakac config prompt --file ./my-custom-prompt.txt');
        console.log('  bakac config prompt --default');
        console.log('  bakac config prompt --show');
      }

    } catch (error: any) {
      logger.error('Failed to configure prompt:', error.message);
    }
  }
}
