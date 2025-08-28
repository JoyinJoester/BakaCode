// 测试直接命令执行和目录切换
const { spawn } = require('child_process');

async function testDirectCommands() {
  console.log('🧪 测试直接命令执行和目录切换...\n');

  // 使用子进程模拟CLI交互
  const child = spawn('node', ['dist/cli/index.js'], {
    cwd: 'C:\\Users\\joyins\\Desktop',
    stdio: 'pipe'
  });

  let output = '';
  
  child.stdout.on('data', (data) => {
    output += data.toString();
  });

  child.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
  });

  // 等待CLI启动
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 测试序列
  const commands = [
    'pwd',                    // 1. 显示当前目录 (直接执行)
    'cd BakaCode',           // 2. 切换到BakaCode目录 (直接执行)  
    'pwd',                   // 3. 确认目录切换 (直接执行)
    'ls',                    // 4. 列出文件 (直接执行)
    'exit'                   // 5. 退出
  ];

  for (let i = 0; i < commands.length; i++) {
    console.log(`📋 执行命令 ${i + 1}: ${commands[i]}`);
    child.stdin.write(commands[i] + '\n');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  child.on('close', (code) => {
    console.log(`\n✅ 测试完成，退出码: ${code}`);
    console.log('📄 完整输出:');
    console.log(output);
  });

  // 超时保护
  setTimeout(() => {
    child.kill();
    console.log('⏰ 测试超时，强制退出');
  }, 10000);
}

testDirectCommands();
