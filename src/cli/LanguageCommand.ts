import { Command } from 'commander';
import { ConfigManager } from '../config/ConfigManager';
import { I18n } from '../i18n/I18n';
import { Logger } from '../utils';

export class LanguageCommand {
  public static register(program: Command): void {
    const i18n = I18n.getInstance();
    
    const langCmd = program
      .command('lang')
      .alias('language')
      .description('Language management commands');

    langCmd
      .command('set <locale>')
      .description('Set interface language')
      .action(async (locale: string) => {
        await this.setLanguage(locale);
      });

    langCmd
      .command('list')
      .description('List available languages')
      .action(async () => {
        await this.listLanguages();
      });

    langCmd
      .command('current')
      .description('Show current language')
      .action(async () => {
        await this.currentLanguage();
      });
  }

  private static async setLanguage(locale: string): Promise<void> {
    const logger = Logger.getInstance();
    const configManager = ConfigManager.getInstance();
    const i18n = I18n.getInstance();

    try {
      const supportedLocales = i18n.getSupportedLocales();
      if (!supportedLocales.includes(locale)) {
        logger.error(`Unsupported language: ${locale}`);
        logger.info(`Supported languages: ${supportedLocales.join(', ')}`);
        return;
      }

      configManager.setLocale(locale);
      i18n.setLocale(locale);
      
      logger.success(`Language set to: ${locale}`);
      console.log(`🌍 ${i18n.t('cli.app_description')}`);
    } catch (error: any) {
      logger.error('Failed to set language:', error.message);
    }
  }

  private static async listLanguages(): Promise<void> {
    const logger = Logger.getInstance();
    const i18n = I18n.getInstance();

    try {
      const locales = [
        { code: 'en', name: 'English' },
        { code: 'zh-CN', name: '简体中文' },
        { code: 'zh-TW', name: '繁體中文' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' }
      ];

      console.log('\n📋 Available Languages:');
      console.log('='.repeat(40));
      
      locales.forEach(locale => {
        const current = i18n.getLocale() === locale.code ? ' (current)' : '';
        console.log(`  ${locale.code.padEnd(8)} - ${locale.name}${current}`);
      });
      console.log('');
    } catch (error: any) {
      logger.error('Failed to list languages:', error.message);
    }
  }

  private static async currentLanguage(): Promise<void> {
    const logger = Logger.getInstance();
    const configManager = ConfigManager.getInstance();
    const i18n = I18n.getInstance();

    try {
      const currentLocale = configManager.getLocale();
      const languageNames: { [key: string]: string } = {
        'en': 'English',
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        'ja': '日本語',
        'ko': '한국어'
      };

      console.log(`🌍 Current language: ${currentLocale} (${languageNames[currentLocale] || 'Unknown'})`);
      console.log(`📖 Description: ${i18n.t('cli.app_description')}`);
    } catch (error: any) {
      logger.error('Failed to get current language:', error.message);
    }
  }
}
