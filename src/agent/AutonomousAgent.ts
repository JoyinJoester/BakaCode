import { Agent } from './Agent';
import { Logger } from '../utils';
import { I18n } from '../i18n/I18n';
import { ConfigManager } from '../config/ConfigManager';

export interface TaskPlan {
  goal: string;
  steps: TaskStep[];
  currentStep: number;
  completed: boolean;
  workingDirectory: string;
}

export interface TaskStep {
  id: string;
  description: string;
  type: 'file_create' | 'file_write' | 'compile' | 'test' | 'fix' | 'analyze';
  status: 'pending' | 'running' | 'completed' | 'failed';
  retries: number;
  maxRetries: number;
  result?: string;
  error?: string;
}

export class AutonomousAgent extends Agent {
  private logger: Logger;
  private autonomousI18n: I18n;
  private currentPlan?: TaskPlan;

  constructor() {
    super();
    this.logger = Logger.getInstance();
    const config = ConfigManager.getInstance();
    this.autonomousI18n = I18n.getInstance(config.getLocale());
  }

  /**
   * 执行长期代理任务
   */
  public async executeAutonomousTask(goal: string): Promise<boolean> {
    this.logger.info(`🎯 开始自主代理任务: ${goal}`);
    
    try {
      // 1. 创建新的对话会话
      await this.startNewConversation();
      
      // 2. 分析目标并创建计划
      const plan = await this.createTaskPlan(goal);
      this.currentPlan = plan;
      
      this.logger.info(`📋 任务计划已创建，共 ${plan.steps.length} 个步骤`);
      this.printTaskPlan(plan);
      
      // 3. 执行计划
      const success = await this.executePlan(plan);
      
      if (success) {
        this.logger.success('🎉 自主代理任务完成！');
        return true;
      } else {
        this.logger.error('❌ 自主代理任务失败');
        return false;
      }
      
    } catch (error: any) {
      this.logger.error('自主代理执行失败:', error.message);
      return false;
    }
  }

  /**
   * 创建任务执行计划
   */
  private async createTaskPlan(goal: string): Promise<TaskPlan> {
    const planningPrompt = `
作为一个自主代理，我需要分析以下目标并创建详细的执行计划：

目标: ${goal}

请分析这个目标，并创建一个分步执行计划。考虑以下几点：
1. 需要创建哪些文件和目录结构？
2. 需要写什么代码？
3. 如何编译/构建项目？
4. 如何测试验证？
5. 如果出现错误如何修复？

请将计划分解为具体的步骤，每个步骤都应该是可执行的原子操作。
`;

    const response = await this.sendMessage(planningPrompt);
    
    // 解析响应并创建计划结构
    const plan: TaskPlan = {
      goal,
      steps: await this.parseStepsFromResponse(response.content),
      currentStep: 0,
      completed: false,
      workingDirectory: process.cwd()
    };

    return plan;
  }

  /**
   * 从AI响应中解析步骤
   */
  private async parseStepsFromResponse(response: string): Promise<TaskStep[]> {
    // 使用AI来解析自己的响应并提取结构化的步骤
    const structurePrompt = `
请将以下计划转换为结构化的JSON格式步骤列表：

${response}

返回格式应该是一个JSON数组，每个步骤包含：
- id: 唯一标识符
- description: 步骤描述
- type: 步骤类型 (file_create, file_write, compile, test, fix, analyze)

请只返回JSON数组，不要其他解释。
`;

    const structureResponse = await this.sendMessage(structurePrompt);
    
    try {
      // 尝试解析JSON
      const parsed = JSON.parse(structureResponse.content);
      return parsed.map((step: any, index: number) => ({
        id: step.id || `step_${index + 1}`,
        description: step.description || `步骤 ${index + 1}`,
        type: step.type || 'analyze',
        status: 'pending' as const,
        retries: 0,
        maxRetries: 3
      }));
    } catch (error) {
      // 如果解析失败，创建通用步骤
      this.logger.warn('无法解析步骤结构，使用默认计划');
      return [
        {
          id: 'step_1',
          description: '分析需求并设计解决方案',
          type: 'analyze',
          status: 'pending',
          retries: 0,
          maxRetries: 3
        },
        {
          id: 'step_2', 
          description: '创建项目结构',
          type: 'file_create',
          status: 'pending',
          retries: 0,
          maxRetries: 3
        },
        {
          id: 'step_3',
          description: '实现核心功能',
          type: 'file_write',
          status: 'pending',
          retries: 0,
          maxRetries: 3
        },
        {
          id: 'step_4',
          description: '编译和构建',
          type: 'compile',
          status: 'pending',
          retries: 0,
          maxRetries: 3
        },
        {
          id: 'step_5',
          description: '测试验证',
          type: 'test',
          status: 'pending',
          retries: 0,
          maxRetries: 3
        }
      ];
    }
  }

  /**
   * 执行任务计划
   */
  private async executePlan(plan: TaskPlan): Promise<boolean> {
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      plan.currentStep = i;
      
      this.logger.info(`🔄 执行步骤 ${i + 1}/${plan.steps.length}: ${step.description}`);
      
      const success = await this.executeStep(step);
      
      if (success) {
        step.status = 'completed';
        this.logger.success(`✅ 步骤 ${i + 1} 完成`);
      } else {
        this.logger.error(`❌ 步骤 ${i + 1} 失败`);
        
        // 尝试修复
        if (step.retries < step.maxRetries) {
          this.logger.info(`🔧 尝试修复步骤 ${i + 1} (重试 ${step.retries + 1}/${step.maxRetries})`);
          step.retries++;
          step.status = 'pending';
          i--; // 重试当前步骤
          continue;
        } else {
          step.status = 'failed';
          // 尝试智能修复
          const fixed = await this.attemptSmartFix(step, plan);
          if (!fixed) {
            return false;
          }
        }
      }
    }
    
    plan.completed = true;
    return true;
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(step: TaskStep): Promise<boolean> {
    step.status = 'running';
    
    try {
      const executionPrompt = this.createStepExecutionPrompt(step);
      
      // 显示执行步骤
      console.log(`\n📝 执行: ${step.description}`);
      console.log('─'.repeat(50));
      
      // 使用Agent的完整消息处理（包括工具调用）
      const response = await this.sendMessage(executionPrompt);
      
      // 显示AI的思考过程和响应
      if (response.content) {
        console.log(response.content);
      }
      
      console.log('─'.repeat(50));
      
      // 检查执行结果
      if (step.type === 'compile' || step.type === 'test') {
        return await this.verifyStepSuccess(step);
      }
      
      return true; // 其他类型的步骤认为成功
      
    } catch (error: any) {
      step.error = error.message;
      this.logger.error(`步骤执行出错: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建步骤执行提示词
   */
  private createStepExecutionPrompt(step: TaskStep): string {
    const context = this.currentPlan ? `
当前项目目标: ${this.currentPlan.goal}
工作目录: ${this.currentPlan.workingDirectory}
当前步骤: ${step.description}
` : '';

    switch (step.type) {
      case 'file_create':
        return `${context}
请创建必要的文件和目录结构。使用file工具来创建文件。
专注于: ${step.description}`;

      case 'file_write':
        return `${context}
请编写代码实现所需功能。使用file工具来写入代码文件。
专注于: ${step.description}`;

      case 'compile':
        return `${context}
请编译/构建项目。使用shell工具执行构建命令。
专注于: ${step.description}
如果遇到编译错误，请分析错误信息。`;

      case 'test':
        return `${context}
请测试验证功能。使用shell工具执行测试命令。
专注于: ${step.description}`;

      case 'fix':
        return `${context}
前一步骤失败，请分析问题并修复。错误信息: ${step.error}
专注于: ${step.description}`;

      case 'analyze':
      default:
        return `${context}
请分析当前状况并执行相应操作。
专注于: ${step.description}`;
    }
  }

  /**
   * 验证步骤成功
   */
  private async verifyStepSuccess(step: TaskStep): Promise<boolean> {
    if (step.type === 'compile') {
      // 检查是否有编译产物
      const checkPrompt = `
请检查编译是否成功。查看是否有编译产物生成，或者运行编译命令查看是否有错误。
如果编译失败，请回答"编译失败"并说明原因。
如果编译成功，请回答"编译成功"。
`;
      
      const response = await this.sendMessage(checkPrompt);
      return !response.content.includes('编译失败') && !response.content.includes('compile failed');
    }
    
    if (step.type === 'test') {
      // 检查测试是否通过
      const checkPrompt = `
请检查测试是否通过。运行测试命令并查看结果。
如果测试失败，请回答"测试失败"并说明原因。
如果测试通过，请回答"测试通过"。
`;
      
      const response = await this.sendMessage(checkPrompt);
      return !response.content.includes('测试失败') && !response.content.includes('test failed');
    }
    
    return true;
  }

  /**
   * 智能修复失败的步骤
   */
  private async attemptSmartFix(step: TaskStep, plan: TaskPlan): Promise<boolean> {
    this.logger.info(`🤖 尝试智能修复: ${step.description}`);
    
    const fixPrompt = `
步骤执行失败，需要智能修复：

失败步骤: ${step.description}
错误信息: ${step.error || '未知错误'}
项目目标: ${plan.goal}

请分析失败原因并尝试修复。可能的解决方案：
1. 检查代码语法错误
2. 安装缺失的依赖
3. 修正配置文件
4. 调整编译参数
5. 修复逻辑错误

请执行修复操作，然后重新验证。
`;

    try {
      for await (const chunk of this.streamMessage(fixPrompt)) {
        if (chunk.content) {
          process.stdout.write(chunk.content);
        }
        if (chunk.done) {
          break;
        }
      }
      
      // 重新验证
      return await this.verifyStepSuccess(step);
      
    } catch (error: any) {
      this.logger.error(`智能修复失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 打印任务计划
   */
  private printTaskPlan(plan: TaskPlan): void {
    console.log('\n📋 任务执行计划:');
    console.log('='.repeat(60));
    console.log(`🎯 目标: ${plan.goal}`);
    console.log(`📁 工作目录: ${plan.workingDirectory}`);
    console.log('─'.repeat(60));
    
    plan.steps.forEach((step, index) => {
      const statusIcon = step.status === 'completed' ? '✅' : 
                        step.status === 'running' ? '🔄' : 
                        step.status === 'failed' ? '❌' : '⏳';
      console.log(`${statusIcon} ${index + 1}. [${step.type}] ${step.description}`);
    });
    
    console.log('='.repeat(60));
  }

  /**
   * 获取当前计划状态
   */
  public getCurrentPlan(): TaskPlan | undefined {
    return this.currentPlan;
  }

  /**
   * 中断当前任务
   */
  public async interruptTask(): Promise<void> {
    if (this.currentPlan) {
      this.logger.warn('⚠️ 任务被用户中断');
      this.currentPlan.completed = false;
    }
  }
}
