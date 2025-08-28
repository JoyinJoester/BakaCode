#!/usr/bin/env node

console.log('🎉 BakaCode 新命令演示');
console.log('='.repeat(50));

console.log('\n📋 新的命令格式:');
console.log('  主命令: bakacode 或 bakac');
console.log('  语言切换: -l 或 --language');
console.log('');

console.log('💡 快速语言切换示例:');
console.log('  bakac -l zh-CN    # 切换到简体中文');
console.log('  bakac -l en       # 切换到英语');
console.log('  bakac -l ja       # 切换到日语');
console.log('  bakac -l ko       # 切换到韩语');
console.log('');

console.log('🌍 语言管理命令:');
console.log('  bakac lang list     # 列出所有支持的语言');
console.log('  bakac lang current  # 显示当前语言');
console.log('  bakac lang set zh-CN # 设置语言');
console.log('');

console.log('🚀 使用示例:');
console.log('  # 中文聊天');
console.log('  bakac -l zh-CN chat');
console.log('');
console.log('  # 英文任务');
console.log('  bakac -l en run --task "Create a Python script"');
console.log('');
console.log('  # 日文任务');
console.log('  bakac -l ja run --task "日本語で説明してください"');
console.log('');
console.log('  # 韩文搜索');
console.log('  bakac -l ko websearch "AI 기술"');
console.log('');

console.log('⚙️ 配置管理:');
console.log('  bakac config show      # 显示配置');
console.log('  bakac config set provider.model qwen3:4b');
console.log('  bakac config set locale zh-CN');
console.log('');

console.log('🎯 快速测试:');
console.log('  bakac -l zh-CN run --task "用中文介绍BakaCode"');
console.log('  bakac -l en run --task "Introduce BakaCode in English"');

console.log('\n✨ 新功能亮点:');
console.log('  ✅ 统一的命令格式 (bakacode/bakac)');
console.log('  ✅ 全局语言选项 (-l/--language)');
console.log('  ✅ 专门的语言管理命令');
console.log('  ✅ 更好的用户体验');

console.log('\n🎊 现在就试试吧！');
