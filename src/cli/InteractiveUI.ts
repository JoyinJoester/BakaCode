import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '../config/ConfigManager';
import { I18n } from '../i18n/I18n';
import { Agent } from '../agent';
import { Logger } from '../utils';
import * as path from 'path';
import * as os from 'os';

export class InteractiveUI {
  private configManager: ConfigManager;
  private i18n: I18n;
  private logger: Logger;

  constructor() {
    this.configManager = ConfigManager.getInstance();
    this.i18n = I18n.getInstance(this.configManager.getLocale());
    this.logger = Logger.getInstance();
  }

  public async start(): Promise<void> {
    this.showHeader();
    this.showTips();
    this.showFooter();
    await this.startChatLoop();
  }

  private showHeader(): void {
    // 创建类似 Gemini 的优雅 ASCII 艺术 (受 Gemini CLI 启发)
    const logo = `
 ██████╗  █████╗ ██╗  ██╗ █████╗  ██████╗ ██████╗ ██████╗ ███████╗
 ██╔══██╗██╔══██╗██║ ██╔╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝
 ██████╔╝███████║█████╔╝ ███████║██║     ██║   ██║██║  ██║█████╗  
 ██╔══██╗██╔══██║██╔═██╗ ██╔══██║██║     ██║   ██║██║  ██║██╔══╝  
 ██████╔╝██║  ██║██║  ██╗██║  ██║╚██████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝`;

    // 使用渐变色效果 (类似 Gemini CLI)
    console.log(chalk.cyan(logo));
    console.log('');
  }

  private showTips(): void {
    console.log(chalk.gray(this.i18n.t('ui.tips_header')));
    console.log(chalk.gray(`1. ${this.i18n.t('ui.tip_1')}`));
    console.log(chalk.gray(`2. ${this.i18n.t('ui.tip_2')}`));
    console.log(chalk.gray(`3. ${this.i18n.t('ui.tip_3')}`));
    console.log(chalk.gray(`4. ${this.i18n.t('ui.tip_4')}`));
    console.log('');
  }

  private showFooter(): void {
    const config = this.configManager.getConfig();
    const locale = this.i18n.getLocale();
    const currentDir = path.basename(process.cwd());
    const model = config.provider?.model || 'Not configured';
    
    // 根据提供商类型显示状态
    const isLocal = config.provider?.type === 'ollama';
    let status: string;
    
    if (!config.provider?.type) {
      status = '🔴'; // 未配置提供商
    } else if (isLocal) {
      status = '🟢'; // 本地模型总是可用
    } else {
      status = config.provider?.apiKey ? '🟢' : '🔴'; // 云端模型需要 API 密钥
    }
    
    // 显示状态栏（类似 Gemini CLI 的 Footer）
    const statusLine = `${chalk.cyan(currentDir)} | ${chalk.yellow(model)} | ${status} | ${chalk.gray(locale)}`;
    console.log(statusLine);
    console.log(chalk.gray('─'.repeat(80)));
    console.log('');
  }

  private async startChatLoop(): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    
    console.log(chalk.green(`💬 ${this.i18n.t('ui.start_chatting')}`));
    
    while (true) {
      try {
        // 获取当前工作目录并格式化显示
        const currentPath = process.cwd();
        const displayPath = currentPath.length > 50 
          ? '...' + currentPath.slice(-47) 
          : currentPath;
        
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'message',
            message: chalk.gray(displayPath) + chalk.cyan(' > '),
            validate: (input: string) => {
              if (input.trim() === '') {
                return isZh ? '请输入消息或命令' : 'Please enter a message or command';
              }
              return true;
            }
          }
        ]);

        const message = answer.message.trim();
        
        // 处理特殊命令
        if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
          break;
        }
        
        if (message.startsWith('/')) {
          await this.handleSlashCommand(message);
        } else {
          await this.processChat(message);
        }
        
        console.log(''); // 添加空行分隔对话
      } catch (error: any) {
        if (error.name === 'ExitPromptError') {
          // 用户按了 Ctrl+C
          break;
        }
        throw error;
      }
    }

    this.showGoodbye();
  }

  private async handleSlashCommand(command: string): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    
    const cmd = command.substring(1).toLowerCase();
    
    switch (cmd) {
      case 'help':
        this.showHelp();
        break;
      case 'config':
        await this.showConfigMenu();
        break;
      case 'lang':
      case 'language':
        await this.showLanguageMenu();
        break;
      case 'history':
        await this.showHistory();
        break;
      case 'clear':
        console.clear();
        this.showHeader();
        this.showTips();
        this.showFooter();
        break;
      case 'status':
        this.showStatus();
        break;
      default:
        console.log(chalk.red(isZh ? `未知命令: ${command}` : `Unknown command: ${command}`));
        console.log(chalk.gray(isZh ? '输入 /help 查看可用命令' : 'Type /help to see available commands'));
    }
  }

  private showHelp(): void {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    
    if (isZh) {
      console.log(chalk.green('📚 可用命令:'));
      console.log(chalk.cyan('/help') + chalk.gray('     - 显示此帮助信息'));
      console.log(chalk.cyan('/config') + chalk.gray('   - 配置设置'));
      console.log(chalk.cyan('/lang') + chalk.gray('     - 语言设置'));
      console.log(chalk.cyan('/history') + chalk.gray('  - 查看对话历史'));
      console.log(chalk.cyan('/clear') + chalk.gray('    - 清屏'));
      console.log(chalk.cyan('/status') + chalk.gray('   - 显示状态信息'));
      console.log(chalk.cyan('exit') + chalk.gray('      - 退出程序'));
      console.log('');
      console.log(chalk.green('🚀 直接执行Shell命令:'));
      console.log(chalk.cyan('cd <目录>') + chalk.gray('  - 切换目录'));
      console.log(chalk.cyan('ls / dir') + chalk.gray('   - 列出文件'));
      console.log(chalk.cyan('pwd') + chalk.gray('       - 显示当前目录'));
      console.log(chalk.cyan('git <命令>') + chalk.gray(' - Git操作'));
      console.log(chalk.cyan('npm <命令>') + chalk.gray(' - NPM操作'));
      console.log(chalk.gray('💡 直接输入shell命令无需通过AI，立即执行'));
    } else {
      console.log(chalk.green('📚 Available commands:'));
      console.log(chalk.cyan('/help') + chalk.gray('     - Show this help message'));
      console.log(chalk.cyan('/config') + chalk.gray('   - Configuration settings'));
      console.log(chalk.cyan('/lang') + chalk.gray('     - Language settings'));
      console.log(chalk.cyan('/history') + chalk.gray('  - View conversation history'));
      console.log(chalk.cyan('/clear') + chalk.gray('    - Clear screen'));
      console.log(chalk.cyan('/status') + chalk.gray('   - Show status information'));
      console.log(chalk.cyan('exit') + chalk.gray('      - Exit program'));
      console.log('');
      console.log(chalk.green('🚀 Direct Shell Commands:'));
      console.log(chalk.cyan('cd <dir>') + chalk.gray('   - Change directory'));
      console.log(chalk.cyan('ls / dir') + chalk.gray('   - List files'));
      console.log(chalk.cyan('pwd') + chalk.gray('       - Show current directory'));
      console.log(chalk.cyan('git <cmd>') + chalk.gray('  - Git operations'));
      console.log(chalk.cyan('npm <cmd>') + chalk.gray('  - NPM operations'));
      console.log(chalk.gray('💡 Shell commands execute directly without AI processing'));
    }
  }

  private showStatus(): void {
    const config = this.configManager.getConfig();
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    
    console.log(chalk.green(isZh ? '📊 系统状态:' : '📊 System Status:'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(`${chalk.cyan(isZh ? '当前目录' : 'Directory')}: ${process.cwd()}`);
    console.log(`${chalk.cyan(isZh ? '用户' : 'User')}: ${os.userInfo().username}`);
    console.log(`${chalk.cyan(isZh ? '系统' : 'Platform')}: ${os.platform()} ${os.arch()}`);
    console.log(`${chalk.cyan(isZh ? '语言' : 'Language')}: ${locale}`);
    console.log(`${chalk.cyan(isZh ? 'API 提供商' : 'API Provider')}: ${config.provider?.type || 'Not configured'}`);
    console.log(`${chalk.cyan(isZh ? '模型' : 'Model')}: ${config.provider?.model || 'Not configured'}`);
    
    // 根据提供商类型显示 API 密钥状态
    const isLocal = config.provider?.type === 'ollama';
    if (isLocal) {
      console.log(`${chalk.cyan(isZh ? 'API 密钥' : 'API Key')}: ${chalk.gray(isZh ? '本地模型无需密钥' : 'Not required for local models')}`);
    } else {
      console.log(`${chalk.cyan(isZh ? 'API 密钥' : 'API Key')}: ${config.provider?.apiKey ? '✓ Configured' : '✗ Not configured'}`);
    }
  }

  private async processChat(message: string): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    
    // 检测是否为直接的shell命令
    if (this.isDirectShellCommand(message)) {
      await this.executeDirectShellCommand(message);
      return;
    }
    
    try {
      const config = this.configManager.getConfig();
      
      // 检查是否配置了提供商
      if (!config.provider?.type) {
        console.log(chalk.red(isZh ? '❌ 请先配置 API 提供商。使用 /config 进行设置。' : '❌ Please configure API provider first. Use /config to set up.'));
        return;
      }
      
      // 只有非本地模型才需要检查 API 密钥
      const isLocal = config.provider.type === 'ollama';
      if (!isLocal && !config.provider?.apiKey) {
        console.log(chalk.red(isZh ? '❌ 请先配置 API 密钥。使用 /config 进行设置。' : '❌ Please configure API key first. Use /config to set up.'));
        return;
      }
      
      const agent = new Agent();
      
      // 显示思考指示器
      const thinkingText = isZh ? '🤖 思考中...' : '🤖 Thinking...';
      console.log(chalk.gray(thinkingText));
      
      const response = await agent.sendMessage(message);
      
      // 清除思考指示器行并显示回复
      process.stdout.write('\x1b[1A\x1b[2K'); // 移动到上一行并清除
      console.log(chalk.blue('🤖 BakaCode:'));
      console.log(chalk.white(response.content));
      
    } catch (error: any) {
      console.log(chalk.red(`❌ ${isZh ? '错误' : 'Error'}: ${error.message}`));
    }
  }

  // 检测是否为直接的shell命令
  private isDirectShellCommand(message: string): boolean {
    const trimmed = message.trim();
    
    // 基本shell命令模式
    const shellCommandPatterns = [
      /^cd(\s+.*)?$/,     // cd 或 cd 目录
      /^ls(\s|$)/,        // ls
      /^dir(\s|$)/,       // dir (Windows)
      /^pwd(\s|$)/,       // pwd
      /^mkdir\s+/,        // mkdir
      /^touch\s+/,        // touch
      /^echo\s+/,         // echo
      /^cat\s+/,          // cat
      /^type\s+/,         // type (Windows)
      /^find\s+/,         // find
      /^grep\s+/,         // grep
      /^git\s+/,          // git命令
      /^npm\s+/,          // npm命令
      /^node\s+/,         // node命令
      /^python\s+/,       // python命令
      /^pip\s+/,          // pip命令
    ];

    return shellCommandPatterns.some(pattern => pattern.test(trimmed));
  }

  // 直接执行shell命令
  private async executeDirectShellCommand(command: string): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    
    try {
      console.log(chalk.gray(`$ ${command}`));
      
      // 特殊处理cd命令
      if (command.trim().startsWith('cd ') || command.trim() === 'cd') {
        const targetPath = command.trim() === 'cd' ? '' : command.trim().substring(3).trim();
        await this.changeDirectory(targetPath);
        return;
      }

      // Windows命令兼容性处理
      let actualCommand = command;
      if (process.platform === 'win32') {
        if (command.trim() === 'ls' || command.trim().startsWith('ls ')) {
          actualCommand = command.replace(/^ls/, 'dir');
          console.log(chalk.yellow(isZh ? '💡 已转换为Windows命令: dir' : '💡 Converted to Windows command: dir'));
        }
        if (command.trim() === 'pwd') {
          actualCommand = 'cd';
          console.log(chalk.yellow(isZh ? '💡 已转换为Windows命令: cd' : '💡 Converted to Windows command: cd'));
        }
      }

      // 执行其他命令
      const { spawn } = await import('child_process');
      
      const child = spawn(actualCommand, [], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command exited with code ${code}`));
          }
        });

        child.on('error', (error) => {
          reject(error);
        });
      });

    } catch (error: any) {
      if (error.message.includes('ENOENT')) {
        console.log(chalk.red(isZh ? `❌ 命令未找到: ${command}` : `❌ Command not found: ${command}`));
      } else {
        console.log(chalk.red(`❌ ${isZh ? '执行错误' : 'Execution error'}: ${error.message}`));
      }
    }
  }

  // 处理目录切换
  private async changeDirectory(targetPath: string): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    
    try {
      const path = await import('path');
      const fs = await import('fs');
      
      let newPath: string;
      
      if (!targetPath || targetPath === '~') {
        // 切换到用户主目录
        newPath = process.env.HOME || process.env.USERPROFILE || process.cwd();
      } else if (path.isAbsolute(targetPath)) {
        newPath = targetPath;
      } else {
        newPath = path.resolve(process.cwd(), targetPath);
      }

      // 检查目录是否存在
      if (!fs.existsSync(newPath)) {
        console.log(chalk.red(isZh ? `❌ 目录不存在: ${newPath}` : `❌ Directory does not exist: ${newPath}`));
        return;
      }

      // 检查是否为目录
      const stats = fs.statSync(newPath);
      if (!stats.isDirectory()) {
        console.log(chalk.red(isZh ? `❌ 不是目录: ${newPath}` : `❌ Not a directory: ${newPath}`));
        return;
      }

      // 切换目录
      const oldPath = process.cwd();
      process.chdir(newPath);
      const actualNewPath = process.cwd();
      
      console.log(chalk.green(isZh ? `✅ 已切换到: ${actualNewPath}` : `✅ Changed to: ${actualNewPath}`));
      
    } catch (error: any) {
      console.log(chalk.red(`❌ ${isZh ? '切换目录失败' : 'Failed to change directory'}: ${error.message}`));
    }
  }

  private async showConfigMenu(): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    const config = this.configManager.getConfig();

    console.log(chalk.green(`⚙️  ${isZh ? '配置设置' : 'Configuration Settings'}:`));
    console.log(chalk.gray('─'.repeat(50)));
    
    console.log(`${chalk.cyan(isZh ? 'API 提供商' : 'API Provider')}: ${config.provider?.type || 'Not set'}`);
    
    // 根据提供商类型显示 API 密钥状态
    const isLocal = config.provider?.type === 'ollama';
    if (isLocal) {
      console.log(`${chalk.cyan(isZh ? 'API 密钥' : 'API Key')}: ${chalk.gray(isZh ? '本地模型无需密钥' : 'Not required for local models')}`);
    } else {
      console.log(`${chalk.cyan(isZh ? 'API 密钥' : 'API Key')}: ${config.provider?.apiKey ? '✓ Configured' : '✗ Not configured'}`);
    }
    
    console.log(`${chalk.cyan(isZh ? '模型' : 'Model')}: ${config.provider?.model || 'Not set'}`);

    // 根据提供商类型动态生成选项
    const choices = isZh ? [
      ...(isLocal ? [] : [{ name: '🔑 设置 API 密钥', value: 'apikey' }]),
      { name: '🔧 设置 API 提供商', value: 'provider' },
      { name: '📊 查看所有配置', value: 'view' },
      { name: '⬅️  返回', value: 'back' }
    ] : [
      ...(isLocal ? [] : [{ name: '🔑 Set API Key', value: 'apikey' }]),
      { name: '🔧 Set API Provider', value: 'provider' },
      { name: '📊 View All Settings', value: 'view' },
      { name: '⬅️  Back', value: 'back' }
    ];

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'configAction',
        message: isZh ? '选择配置操作:' : 'Choose configuration action:',
        choices
      }
    ]);

    await this.handleConfigChoice(answer.configAction);
  }

  private async handleConfigChoice(action: string): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');

    switch (action) {
      case 'apikey':
        const keyAnswer = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: isZh ? '输入 API 密钥:' : 'Enter API Key:',
            mask: '*'
          }
        ]);
        
        this.configManager.setProvider({ apiKey: keyAnswer.apiKey });
        console.log(chalk.green(`✅ ${isZh ? 'API 密钥已设置' : 'API Key configured'}`));
        break;

      case 'provider':
        const providerAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'provider',
            message: isZh ? '选择 API 提供商:' : 'Choose API Provider:',
            choices: [
              { name: 'OpenAI', value: 'openai' },
              { name: 'Ollama', value: 'ollama' }
            ]
          }
        ]);
        
        this.configManager.setProvider({ type: providerAnswer.provider });
        console.log(chalk.green(`✅ ${isZh ? 'API 提供商已设置' : 'API Provider configured'}`));
        break;

      case 'view':
        const config = this.configManager.getConfig();
        console.log(chalk.cyan('\n' + JSON.stringify(config, null, 2)));
        break;

      case 'back':
        return;
    }
  }

  private async showLanguageMenu(): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: isZh ? '选择界面语言:' : 'Choose interface language:',
        choices: [
          { name: '🇺🇸 English', value: 'en' },
          { name: '🇨🇳 简体中文', value: 'zh-CN' },
          { name: '🇹🇼 繁體中文', value: 'zh-TW' },
          { name: '🇯🇵 日本語', value: 'ja' },
          { name: '🇰🇷 한국어', value: 'ko' },
          { name: '⬅️  ' + (isZh ? '返回' : 'Back'), value: 'back' }
        ]
      }
    ]);

    if (answer.language === 'back') {
      return;
    }

    this.configManager.setLocale(answer.language);
    this.i18n = I18n.getInstance(answer.language);
    console.log(chalk.green(`\n✅ ${isZh ? '语言已切换' : 'Language changed'}: ${answer.language}`));
    
    // 重新显示界面
    console.clear();
    this.showHeader();
    this.showTips();
    this.showFooter();
  }

  private async showHistory(): Promise<void> {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');

    try {
      const agent = new Agent();
      const conversations = await agent.listConversations();

      if (conversations.length === 0) {
        console.log(chalk.yellow(`📋 ${isZh ? '暂无历史记录' : 'No conversation history found'}`));
        return;
      }

      console.log(chalk.green(`📋 ${isZh ? '对话历史记录' : 'Conversation History'}:`));
      conversations.forEach((conv, index) => {
        const title = conv.id;
        const timestamp = conv.metadata.created;
        console.log(chalk.cyan(`${index + 1}. ${title} - ${timestamp.toLocaleString()}`));
      });
    } catch (error: any) {
      console.log(chalk.red(`❌ ${isZh ? '错误' : 'Error'}: ${error.message}`));
    }
  }

  private showGoodbye(): void {
    const locale = this.i18n.getLocale();
    const isZh = locale.startsWith('zh');
    
    console.log(chalk.cyan(`\n👋 ${isZh ? '感谢使用 BakaCode！再见！' : 'Thank you for using BakaCode! Goodbye!'}`));
  }
}
