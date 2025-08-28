#!/usr/bin/env node

console.log('🎉 BakaCode 新命令格式测试');
console.log('='.repeat(60));

const { spawn } = require('child_process');

async function runCommand(title, command) {
  console.log(`\n🧪 ${title}`);
  console.log('-'.repeat(50));
  
  return new Promise((resolve) => {
    const args = command.split(' ');
    const proc = spawn('node', ['dist/cli/index.js', ...args], {
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 测试通过');
      } else {
        console.log('❌ 测试失败');
      }
      resolve(code);
    });
  });
}

async function runTests() {
  console.log('开始新命令格式测试...\n');

  // 基本命令测试
  await runCommand('1. 显示帮助信息', '--help');
  
  // 语言管理测试
  await runCommand('2. 列出支持的语言', 'lang list');
  await runCommand('3. 显示当前语言', 'lang current');
  
  // 语言切换测试
  await runCommand('4. 设置中文界面', 'lang set zh-CN');
  await runCommand('5. 全局语言选项测试', '-l en lang current');
  
  // 任务执行测试
  await runCommand('6. 中文任务测试', '-l zh-CN run --task "用一句话介绍你自己"');
  await runCommand('7. 英文任务测试', '-l en run --task "Introduce yourself in one sentence"');
  await runCommand('8. 日文任务测试', '-l ja run --task "一言で自己紹介してください"');
  
  // 配置测试
  await runCommand('9. 显示配置信息', 'config show');

  console.log('\n🏁 新命令格式测试完成！');
  console.log('\n✨ 新功能总结:');
  console.log('  🚀 主命令: bakacode/bakac');
  console.log('  🌍 全局语言选项: -l/--language');
  console.log('  🛠️ 语言管理: bakac lang [命令]');
  console.log('  📋 多语言支持: 中英日韩');
  console.log('  🎯 本地模型优化: qwen3:4b');
  console.log('\n🎊 BakaCode 现在更加强大和易用！');
}

runTests().catch(console.error);
