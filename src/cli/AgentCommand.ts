import { Command } from 'commander';
import { AutonomousAgent } from '../agent/AutonomousAgent';
import { Logger } from '../utils';
import { I18n } from '../i18n/I18n';
import { ConfigManager } from '../config/ConfigManager';

export class AgentCommand {
  public static register(program: Command): void {
    const config = ConfigManager.getInstance();
    const i18n = I18n.getInstance(config.getLocale());
    
    const agentCmd = program
      .command('agent')
      .description('长期自主代理模式')
      .alias('auto');

    agentCmd
      .command('run')
      .description('运行长期自主代理任务')
      .option('-g, --goal <goal>', '目标描述')
      .option('-w, --workspace <path>', '工作目录', process.cwd())
      .option('-v, --verbose', '详细输出')
      .action(async (options) => {
        await this.runAutonomousTask(options);
      });

    agentCmd
      .command('examples')
      .description('显示自主代理任务示例')
      .action(async () => {
        this.showExamples();
      });
  }

  private static async runAutonomousTask(options: any): Promise<void> {
    const logger = Logger.getInstance();
    
    if (!options.goal) {
      logger.error('需要指定目标。使用 --goal 选项。');
      console.log('\\n示例:');
      console.log('bakac agent run --goal "创建一个Python计算器程序"');
      console.log('bakac agent run --goal "写一个Node.js Web API服务器"');
      console.log('bakac agent run --goal "制作一个React待办事项应用"');
      process.exit(1);
    }

    try {
      // 切换到指定工作目录
      if (options.workspace !== process.cwd()) {
        process.chdir(options.workspace);
        logger.info(`切换工作目录到: ${options.workspace}`);
      }

      console.log('🤖 启动自主代理模式...');
      console.log('='.repeat(80));
      console.log(`🎯 目标: ${options.goal}`);
      console.log(`📁 工作目录: ${process.cwd()}`);
      console.log('='.repeat(80));
      
      const agent = new AutonomousAgent();
      
      // 设置中断处理
      let interrupted = false;
      process.on('SIGINT', async () => {
        if (!interrupted) {
          interrupted = true;
          console.log('\\n\\n⚠️ 检测到中断信号，正在安全停止...');
          await agent.interruptTask();
          process.exit(0);
        }
      });

      // 开始执行自主任务
      const success = await agent.executeAutonomousTask(options.goal);
      
      if (success) {
        console.log('\\n🎉 自主代理任务成功完成！');
        console.log('✨ 您的程序已经准备就绪。');
        
        // 显示最终状态
        const plan = agent.getCurrentPlan();
        if (plan) {
          console.log('\\n📊 任务完成状态:');
          const completed = plan.steps.filter(s => s.status === 'completed').length;
          console.log(`✅ 已完成步骤: ${completed}/${plan.steps.length}`);
        }
      } else {
        console.log('\\n❌ 自主代理任务失败');
        console.log('💡 建议：检查错误信息并手动修复，或重新运行任务');
        process.exit(1);
      }
      
    } catch (error: any) {
      logger.error('自主代理执行失败:', error.message);
      process.exit(1);
    }
  }

  private static showExamples(): void {
    console.log('\\n🤖 自主代理任务示例:\\n');
    
    console.log('📝 编程项目:');
    console.log('  bakac agent run --goal "创建一个Python计算器程序，支持基本运算和科学计算"');
    console.log('  bakac agent run --goal "写一个Node.js Express API服务器，包含用户管理和文件上传"');
    console.log('  bakac agent run --goal "制作一个React待办事项应用，支持增删改查和本地存储"');
    console.log('  bakac agent run --goal "开发一个Python数据分析脚本，读取CSV文件并生成可视化图表"');
    
    console.log('\\n🌐 Web开发:');
    console.log('  bakac agent run --goal "创建一个简单的博客网站，使用HTML/CSS/JavaScript"');
    console.log('  bakac agent run --goal "开发一个Vue.js单页应用，包含路由和状态管理"');
    console.log('  bakac agent run --goal "制作一个响应式的企业官网，包含首页、关于我们、联系我们页面"');
    
    console.log('\\n🔧 工具开发:');
    console.log('  bakac agent run --goal "写一个文件批量重命名工具"');
    console.log('  bakac agent run --goal "创建一个日志分析脚本，统计访问量和错误率"');
    console.log('  bakac agent run --goal "开发一个简单的密码生成器CLI工具"');
    
    console.log('\\n🎮 游戏开发:');
    console.log('  bakac agent run --goal "制作一个控制台贪吃蛇游戏"');
    console.log('  bakac agent run --goal "创建一个简单的猜数字游戏网页版"');
    console.log('  bakac agent run --goal "开发一个文字冒险游戏"');
    
    console.log('\\n💡 提示:');
    console.log('  - 目标描述越详细，代理执行效果越好');
    console.log('  - 代理会自动创建文件、编写代码、编译测试');
    console.log('  - 遇到错误时会自动尝试修复');
    console.log('  - 使用 Ctrl+C 可以安全中断任务');
    console.log('  - 使用 --workspace 指定工作目录');
    console.log();
  }
}
