#!/usr/bin/env node

const { ConfigManager } = require('./dist/config/ConfigManager');
const { OllamaProvider } = require('./dist/providers/OllamaProvider');
const { I18n } = require('./dist/i18n/I18n');

async function testLocalModel() {
  try {
    // Initialize i18n
    const configManager = ConfigManager.getInstance();
    const i18n = I18n.getInstance(configManager.getLocale());
    
    console.log('🌍', i18n.t('common.info'), '语言设置:', i18n.getLocale());
    console.log('🌍', i18n.t('common.info'), 'Language setting:', i18n.getLocale());
    
    // Test different locales
    console.log('\n--- 测试多语言支持 ---');
    i18n.setLocale('zh-CN');
    console.log('中文:', i18n.t('cli.app_description'));
    
    i18n.setLocale('ja');
    console.log('日語:', i18n.t('cli.app_description'));
    
    i18n.setLocale('ko');
    console.log('한국어:', i18n.t('cli.app_description'));
    
    i18n.setLocale('en');
    console.log('English:', i18n.t('cli.app_description'));
    
    // Test Ollama provider
    console.log('\n--- 测试本地模型 ---');
    const config = configManager.getConfig();
    console.log('当前配置:', {
      provider: config.provider.type,
      model: config.provider.model,
      baseUrl: config.provider.baseUrl
    });
    
    const provider = new OllamaProvider(config.provider);
    
    console.log('正在测试本地模型响应...');
    const response = await provider.complete({
      messages: [{
        id: '1',
        role: 'user',
        content: '你好，请用中文回复我。',
        timestamp: new Date()
      }]
    });
    
    console.log('✅ 本地模型响应成功:');
    console.log('回复:', response.content);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testLocalModel();
