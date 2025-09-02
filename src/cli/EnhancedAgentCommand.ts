import { Command } from 'commander';
import { EnhancedAutonomousAgent } from '../agent/EnhancedAutonomousAgent';
import { Logger } from '../utils';

export class EnhancedAgentCommand {
  public static register(program: Command): void {
    const agentCmd = program
      .command('agent')
      .description('🤖 智能自主代理模式 - 基于先进的代理系统架构');

    agentCmd
      .command('run')
      .description('执行智能自主代理任务')
      .option('-g, --goal <goal>', '任务目标描述')
      .option('--parallel', '启用并行执行优化 (默认启用)')
      .option('--debug', '启用调试模式')
      .action(async (options) => {
        if (!options.goal) {
          console.log('❌ 请指定任务目标');
          console.log('使用方式: bakac agent run --goal "你的任务描述"');
          console.log('\n例如:');
          console.log('  bakac agent run --goal "创建一个Python计算器程序"');
          process.exit(1);
        }
        
        await this.runSmartAgent(options.goal, options);
      });

    agentCmd
      .command('examples')
      .alias('demo')
      .description('显示智能代理任务示例')
      .action(() => {
        this.showAdvancedExamples();
      });
  }

  private static async runSmartAgent(goal: string, options: any): Promise<void> {
    const logger = Logger.getInstance();
    
    try {
      console.log('🤖 启动智能自主代理模式...');
      console.log('='.repeat(80));
      console.log(`🎯 目标: ${goal}`);
      console.log(`📁 工作目录: ${process.cwd()}`);
      console.log('='.repeat(80));
      
      const agent = new EnhancedAutonomousAgent();
      
      // 设置中断处理
      const handleInterrupt = () => {
        console.log('\n⚠️ 检测到中断信号，正在安全停止...');
        agent.interruptTask();
        process.exit(0);
      };
      
      process.on('SIGINT', handleInterrupt);
      process.on('SIGTERM', handleInterrupt);
      
      // 执行智能代理任务
      const success = await agent.executeSmartTask(goal);
      
      if (success) {
        console.log('\n🎉 智能自主代理任务成功完成！');
        console.log('✨ 您的项目已经准备就绪。');
        
        // 显示完成状态
        const plan = agent.getCurrentPlan();
        if (plan) {
          console.log('\n📊 任务完成状态:');
          console.log(`✅ 已完成步骤: ${plan.metrics.completedSteps}/${plan.metrics.totalSteps}`);
          console.log(`⚡ 并行执行: ${plan.metrics.parallelExecutions} 次`);
          if (plan.metadata.actualStartTime && plan.metadata.actualEndTime) {
            const duration = Math.round((plan.metadata.actualEndTime.getTime() - plan.metadata.actualStartTime.getTime()) / 1000);
            console.log(`⏱️  总耗时: ${duration} 秒`);
          }
        }
      } else {
        console.log('\n❌ 智能自主代理任务失败');
        console.log('💡 建议：检查错误信息并手动修复，或重新运行任务');
        process.exit(1);
      }
      
    } catch (error: any) {
      logger.error('智能代理执行失败:', error.message);
      process.exit(1);
    }
  }

  private static showAdvancedExamples(): void {
    console.log('\n🤖 智能自主代理任务示例:\n');
    
    console.log('📝 智能编程项目:');
    console.log('  bakac agent run --goal "创建一个Python机器学习项目，包含数据预处理和模型训练"');
    console.log('  bakac agent run --goal "开发一个React全栈应用，包含前端界面和后端API"');
    console.log('  bakac agent run --goal "制作一个Vue.js电商网站，支持商品展示和购物车功能"');
    console.log('  bakac agent run --goal "构建一个Node.js微服务架构，包含用户管理和订单系统"');
    
    console.log('\n🌐 智能Web开发:');
    console.log('  bakac agent run --goal "创建一个现代化的企业官网，响应式设计和SEO优化"');
    console.log('  bakac agent run --goal "开发一个在线博客平台，支持markdown编辑和评论系统"');
    console.log('  bakac agent run --goal "制作一个数据可视化仪表板，集成图表和实时数据"');
    
    console.log('\n🔧 智能工具开发:');
    console.log('  bakac agent run --goal "编写一个智能代码分析工具，支持多种编程语言"');
    console.log('  bakac agent run --goal "创建一个自动化部署脚本，支持Docker和Kubernetes"');
    console.log('  bakac agent run --goal "开发一个API测试框架，包含自动化测试和报告生成"');
    
    console.log('\n🎮 创新项目:');
    console.log('  bakac agent run --goal "制作一个HTML5游戏，包含物理引擎和音效系统"');
    console.log('  bakac agent run --goal "开发一个AI聊天机器人，支持自然语言处理"');
    console.log('  bakac agent run --goal "创建一个区块链投票系统，确保透明性和安全性"');
    
    console.log('\n📊 数据科学项目:');
    console.log('  bakac agent run --goal "构建一个数据分析管道，从数据收集到可视化展示"');
    console.log('  bakac agent run --goal "开发一个预测模型，包含特征工程和模型评估"');
    console.log('  bakac agent run --goal "制作一个实时数据流处理系统，支持大数据分析"');
    
    console.log('\n🚀 特性说明:');
    console.log('  • ⚡ 智能并行执行 - 自动优化执行效率');
    console.log('  • 🔍 深度上下文理解 - 智能分析项目需求');
    console.log('  • 🛠️  自适应错误修复 - 自动诊断和解决问题');
    console.log('  • 📈 实时进度跟踪 - 详细的执行状态反馈');
    console.log('  • 🎯 目标驱动执行 - 确保高质量的最终结果');
    
    console.log('\n💡 使用技巧:');
    console.log('  • 描述越具体，结果越精确');
    console.log('  • 可以指定技术栈和框架偏好');
    console.log('  • 支持复杂的多模块项目');
    console.log('  • 自动处理依赖安装和环境配置');
  }
}
