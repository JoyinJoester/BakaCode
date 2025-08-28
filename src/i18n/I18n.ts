export interface LocaleMessages {
  [key: string]: string | LocaleMessages;
}

export class I18n {
  private static instance: I18n;
  private currentLocale: string;
  private messages: { [locale: string]: LocaleMessages } = {};

  private constructor(locale: string = 'en') {
    this.currentLocale = locale;
    this.loadMessages();
  }

  public static getInstance(locale?: string): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n(locale || 'en');
    } else if (locale && I18n.instance.currentLocale !== locale) {
      I18n.instance.setLocale(locale);
    }
    return I18n.instance;
  }

  private loadMessages(): void {
    try {
      // Load messages for supported locales
      const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'vi'];
      
      for (const locale of locales) {
        try {
          const messages = require(`./locales/${locale}.json`);
          this.messages[locale] = messages;
        } catch (error) {
          console.warn(`Failed to load locale ${locale}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to load i18n messages:', error);
    }
  }

  public setLocale(locale: string): void {
    if (this.getSupportedLocales().includes(locale)) {
      this.currentLocale = locale;
    } else {
      console.warn(`Unsupported locale: ${locale}, falling back to English`);
      this.currentLocale = 'en';
    }
  }

  public getLocale(): string {
    return this.currentLocale;
  }

  public getSupportedLocales(): string[] {
    return ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'vi'];
  }

  public t(key: string, interpolations: Record<string, string> = {}): string {
    const keys = key.split('.');
    let message: any = this.messages[this.currentLocale];

    // Fallback to English if current locale not found
    if (!message) {
      message = this.messages['en'];
    }

    // Navigate through nested keys
    for (const k of keys) {
      if (message && typeof message === 'object' && k in message) {
        message = message[k];
      } else {
        // Fallback to English
        message = this.messages['en'];
        for (const fallbackKey of keys) {
          if (message && typeof message === 'object' && fallbackKey in message) {
            message = message[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    if (typeof message !== 'string') {
      return key;
    }

    // Replace interpolations
    let result = message;
    for (const [placeholder, value] of Object.entries(interpolations)) {
      result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), value);
    }

    return result;
  }

  public detectSystemLocale(): string {
    const locale = process.env.LANG || process.env.LANGUAGE || 'en';
    
    if (locale.includes('zh_CN') || locale.includes('zh-CN')) return 'zh-CN';
    if (locale.includes('zh_TW') || locale.includes('zh-TW')) return 'zh-TW';
    if (locale.includes('ja')) return 'ja';
    if (locale.includes('ko')) return 'ko';
    if (locale.includes('vi') || locale.includes('VN')) return 'vi';
    
    return 'en';
  }
}
