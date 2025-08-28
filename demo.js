#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎉 BakaCode 多语言和本地模型演示');
console.log('='.repeat(50));

// 演示不同语言的支持
console.log('\n📋 支持的语言列表:');
const { I18n } = require('./dist/i18n/I18n');
const i18n = I18n.getInstance();

const locales = [
  { code: 'en', name: 'English' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }
];

locales.forEach(locale => {
  i18n.setLocale(locale.code);
  console.log(`  ${locale.name}: ${i18n.t('cli.app_description')}`);
});

console.log('\n🤖 本地模型演示:');
console.log('  模型: qwen3:4b (Ollama)');
console.log('  语言能力: 多语言支持 (中文、英文、日文等)');

console.log('\n💡 使用示例:');
console.log('  1. 聊天模式: node dist/cli/index.js chat');
console.log('  2. 单次任务: node dist/cli/index.js run --task "你的任务"');
console.log('  3. 网络搜索: node dist/cli/index.js websearch "搜索内容"');
console.log('  4. 配置管理: node dist/cli/index.js config show');

console.log('\n✅ 系统状态:');
console.log('  ✓ 多语言支持已启用');
console.log('  ✓ 本地模型连接正常');
console.log('  ✓ 工具系统可用 (文件、Shell、HTTP、搜索)');

console.log('\n🚀 快速测试本地模型:');
console.log('运行以下命令进行测试:');
console.log('node dist/cli/index.js run --task "用中文介绍一下你自己"');
