#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎉 BakaCode 最终功能测试');
console.log('='.repeat(60));

async function runTest(title, command, args = []) {
  console.log(`\n🧪 ${title}`);
  console.log('-'.repeat(40));
  
  return new Promise((resolve) => {
    const proc = spawn('node', ['dist/cli/index.js', ...command.split(' '), ...args], {
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
  console.log('开始全面功能测试...\n');

  // 配置测试
  await runTest('1. 显示当前配置', 'config show');
  
  // 语言切换测试
  await runTest('2. 设置中文界面', 'config set locale zh-CN');
  await runTest('3. 验证中文配置', 'config show');
  
  // 本地模型测试
  await runTest('4. 中文对话测试', 'run --task "用中文简单介绍一下你自己"');
  
  // 工具调用测试
  await runTest('5. 文件工具测试', 'run --task "创建一个测试文件 hello.txt，内容是 Hello from BakaCode"');
  
  // 多语言测试
  await runTest('6. 英文界面测试', 'config set locale en');
  await runTest('7. 英文对话测试', 'run --task "Introduce yourself briefly in English"');
  
  console.log('\n🏁 测试完成！');
  console.log('如果所有测试都通过，说明 BakaCode 已经完全可用。');
  console.log('\n💡 接下来你可以：');
  console.log('  • 运行 node dist/cli/index.js chat 开始交互式聊天');
  console.log('  • 设置你喜欢的语言界面');
  console.log('  • 配置 Bing API 密钥以使用搜索功能');
  console.log('  • 尝试各种工具和任务');
}

runTests().catch(console.error);
