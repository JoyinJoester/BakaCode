import { Agent } from './Agent';
import { Logger } from '../utils';
import { ConfigManager } from '../config/ConfigManager';

/**
 * 任务步骤类型 - 基于先进代理系统设计
 */
export type TaskStepType = 
  | 'discovery'    // 智能发现阶段 - 探索项目结构和上下文
  | 'analyze'      // 深度分析需求和技术栈
  | 'plan'         // 制定详细执行计划
  | 'setup'        // 项目初始化和环境配置
  | 'implement'    // 核心功能实现
  | 'integrate'    // 模块集成和连接
  | 'build'        // 构建和编译
  | 'test'         // 测试验证
  | 'optimize'     // 性能优化和代码改进
  | 'validate'     // 最终验证和质量检查
  | 'fix';         // 错误修复和问题解决

/**
 * 任务步骤状态
 */
export type TaskStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * 执行上下文
 */
export interface ExecutionContext {
  projectType?: string;
  technologies?: string[];
  dependencies?: string[];
  requirements?: string[];
  constraints?: string[];
  existingFiles?: string[];
  buildCommands?: string[];
  testCommands?: string[];
}

/**
 * 智能任务步骤
 */
export interface SmartTaskStep {
  id: string;
  description: string;
  type: TaskStepType;
  status: TaskStepStatus;
  priority: number;         // 优先级 1-10
  estimatedDuration: number; // 预估时间(秒)
  dependencies: string[];   // 依赖的步骤ID
  canRunInParallel: boolean; // 是否支持并行执行
  retries: number;
  maxRetries: number;
  error?: string;
  result?: any;
  startTime?: Date;
  endTime?: Date;
  tools?: string[];         // 预期使用的工具列表
}

/**
 * 智能任务计划
 */
export interface SmartTaskPlan {
  id: string;
  goal: string;
  context: ExecutionContext;
  steps: SmartTaskStep[];
  currentPhase: string;
  completed: boolean;
  workingDirectory: string;
  metadata: {
    createdAt: Date;
    estimatedTotalTime: number;
    actualStartTime?: Date;
    actualEndTime?: Date;
    successRate: number;
  };
  metrics: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    skippedSteps: number;
    parallelExecutions: number;
  };
}

/**
 * 增强型自主代理 - 基于最先进的代理系统架构
 * 
 * 核心特性：
 * 1. 智能发现和上下文理解
 * 2. 并行执行优化
 * 3. 状态驱动的任务管理
 * 4. 自适应错误处理和修复
 * 5. 实时进度跟踪和反馈
 */
export class EnhancedAutonomousAgent extends Agent {
  private currentPlan?: SmartTaskPlan;
  private logger: Logger;
  private isInterrupted: boolean = false;
  private parallelExecutor: Map<string, Promise<boolean>> = new Map();

  constructor() {
    super();
    this.logger = Logger.getInstance();
  }

  /**
   * 执行智能自主代理任务
   */
  public async executeSmartTask(goal: string): Promise<boolean> {
    try {
      this.logger.info(`🎯 启动智能自主代理: ${goal}`);
      
      // 1. 初始化对话会话
      await this.startNewConversation();
      
      // 2. 智能发现阶段 - 探索项目结构和上下文
      const context = await this.performIntelligentDiscovery(goal);
      
      // 3. 创建智能任务计划
      const plan = await this.createSmartTaskPlan(goal, context);
      this.currentPlan = plan;
      
      this.logger.info(`📋 智能计划已创建，共 ${plan.steps.length} 个步骤`);
      this.displayTaskPlan(plan);
      
      // 4. 执行智能计划（支持并行优化）
      const success = await this.executeSmartPlan(plan);
      
      if (success) {
        this.logger.success('🎉 智能代理任务完成！');
        this.displayFinalSummary(plan);
        return true;
      } else {
        this.logger.error('❌ 智能代理任务失败');
        return false;
      }
      
    } catch (error: any) {
      this.logger.error('智能代理执行失败:', error.message);
      return false;
    }
  }

  /**
   * 智能发现阶段 - 探索和理解项目上下文
   */
  private async performIntelligentDiscovery(goal: string): Promise<ExecutionContext> {
    this.logger.info('🔍 开始智能发现阶段...');
    
    const discoveryPrompt = `
作为一个智能代理，我需要分析以下目标并进行深度发现：

目标: ${goal}
工作目录: ${process.cwd()}

请执行以下智能发现任务：
1. 分析目标确定项目类型和技术栈
2. 探索现有文件结构（如果有）
3. 识别所需依赖和工具
4. 评估技术要求和约束
5. 确定最佳实施策略

请使用并行工具调用来高效收集信息。
`;

    const response = await this.sendMessage(discoveryPrompt);
    
    // 解析发现结果并构建执行上下文
    const context: ExecutionContext = {
      projectType: this.extractProjectType(response.content),
      technologies: this.extractTechnologies(response.content),
      requirements: this.extractRequirements(goal),
      existingFiles: [], // 将通过工具调用获取
      buildCommands: [],
      testCommands: []
    };
    
    this.logger.success('✅ 智能发现完成');
    return context;
  }

  /**
   * 创建智能任务计划
   */
  private async createSmartTaskPlan(goal: string, context: ExecutionContext): Promise<SmartTaskPlan> {
    const planningPrompt = `
基于智能发现的结果，为以下目标创建详细的执行计划：

目标: ${goal}
项目类型: ${context.projectType}
技术栈: ${context.technologies?.join(', ')}
要求: ${context.requirements?.join(', ')}

请创建一个智能的、可并行执行的任务计划。考虑：
1. 步骤之间的依赖关系
2. 可以并行执行的操作
3. 错误处理和恢复策略
4. 性能优化机会
5. 质量验证检查点

每个步骤应该是原子的、可测试的、可恢复的。
`;

    const response = await this.sendMessage(planningPrompt);
    
    // 创建智能计划结构
    const plan: SmartTaskPlan = {
      id: `plan_${Date.now()}`,
      goal,
      context,
      steps: await this.parseSmartStepsFromResponse(response.content, context),
      currentPhase: 'planning',
      completed: false,
      workingDirectory: process.cwd(),
      metadata: {
        createdAt: new Date(),
        estimatedTotalTime: 0,
        successRate: 0.95 // 初始预期成功率
      },
      metrics: {
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        parallelExecutions: 0
      }
    };

    // 计算预估时间和设置指标
    plan.metadata.estimatedTotalTime = plan.steps.reduce((total, step) => total + step.estimatedDuration, 0);
    plan.metrics.totalSteps = plan.steps.length;
    
    return plan;
  }

  /**
   * 解析智能步骤（改进版本）
   */
  private async parseSmartStepsFromResponse(content: string, context: ExecutionContext): Promise<SmartTaskStep[]> {
    // 基于项目类型和技术栈智能生成步骤
    const projectType = context.projectType?.toLowerCase();
    
    if (projectType?.includes('python')) {
      return this.createPythonProjectSteps(context);
    } else if (projectType?.includes('web') || projectType?.includes('html')) {
      return this.createWebProjectSteps(context);
    } else if (projectType?.includes('node') || projectType?.includes('javascript')) {
      return this.createNodeProjectSteps(context);
    } else {
      return this.createGenericProjectSteps(context);
    }
  }

  /**
   * 创建Python项目步骤
   */
  private createPythonProjectSteps(context: ExecutionContext): SmartTaskStep[] {
    return [
      {
        id: 'discovery_python',
        description: '探索Python环境和依赖',
        type: 'discovery',
        status: 'pending',
        priority: 10,
        estimatedDuration: 30,
        dependencies: [],
        canRunInParallel: true,
        retries: 0,
        maxRetries: 2,
        tools: ['shell', 'file']
      },
      {
        id: 'setup_structure',
        description: '创建Python项目结构',
        type: 'setup',
        status: 'pending',
        priority: 9,
        estimatedDuration: 15,
        dependencies: ['discovery_python'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'implement_main',
        description: '实现主要功能代码',
        type: 'implement',
        status: 'pending',
        priority: 8,
        estimatedDuration: 60,
        dependencies: ['setup_structure'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'test_functionality',
        description: '测试Python程序功能',
        type: 'test',
        status: 'pending',
        priority: 7,
        estimatedDuration: 30,
        dependencies: ['implement_main'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['shell']
      },
      {
        id: 'validate_final',
        description: '最终验证和优化',
        type: 'validate',
        status: 'pending',
        priority: 6,
        estimatedDuration: 20,
        dependencies: ['test_functionality'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 2,
        tools: ['shell', 'file']
      }
    ];
  }

  /**
   * 创建Web项目步骤
   */
  private createWebProjectSteps(context: ExecutionContext): SmartTaskStep[] {
    return [
      {
        id: 'setup_web_structure',
        description: '创建Web项目结构',
        type: 'setup',
        status: 'pending',
        priority: 10,
        estimatedDuration: 20,
        dependencies: [],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'create_html',
        description: '创建HTML结构',
        type: 'implement',
        status: 'pending',
        priority: 9,
        estimatedDuration: 30,
        dependencies: ['setup_web_structure'],
        canRunInParallel: true,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'create_css',
        description: '创建CSS样式',
        type: 'implement',
        status: 'pending',
        priority: 8,
        estimatedDuration: 40,
        dependencies: ['setup_web_structure'],
        canRunInParallel: true,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'create_js',
        description: '添加JavaScript功能',
        type: 'implement',
        status: 'pending',
        priority: 7,
        estimatedDuration: 45,
        dependencies: ['create_html'],
        canRunInParallel: true,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'test_web_app',
        description: '测试Web应用功能',
        type: 'test',
        status: 'pending',
        priority: 6,
        estimatedDuration: 25,
        dependencies: ['create_html', 'create_css', 'create_js'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['shell']
      }
    ];
  }

  /**
   * 创建Node.js项目步骤
   */
  private createNodeProjectSteps(context: ExecutionContext): SmartTaskStep[] {
    return [
      {
        id: 'init_node_project',
        description: '初始化Node.js项目',
        type: 'setup',
        status: 'pending',
        priority: 10,
        estimatedDuration: 30,
        dependencies: [],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['shell', 'file']
      },
      {
        id: 'install_dependencies',
        description: '安装项目依赖',
        type: 'setup',
        status: 'pending',
        priority: 9,
        estimatedDuration: 60,
        dependencies: ['init_node_project'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['shell']
      },
      {
        id: 'implement_core',
        description: '实现核心功能',
        type: 'implement',
        status: 'pending',
        priority: 8,
        estimatedDuration: 90,
        dependencies: ['install_dependencies'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'build_project',
        description: '构建项目',
        type: 'build',
        status: 'pending',
        priority: 7,
        estimatedDuration: 45,
        dependencies: ['implement_core'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['shell']
      },
      {
        id: 'test_application',
        description: '测试应用程序',
        type: 'test',
        status: 'pending',
        priority: 6,
        estimatedDuration: 40,
        dependencies: ['build_project'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['shell']
      }
    ];
  }

  /**
   * 创建通用项目步骤
   */
  private createGenericProjectSteps(context: ExecutionContext): SmartTaskStep[] {
    return [
      {
        id: 'analyze_requirements',
        description: '分析项目需求',
        type: 'analyze',
        status: 'pending',
        priority: 10,
        estimatedDuration: 30,
        dependencies: [],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 2,
        tools: ['file']
      },
      {
        id: 'create_project_structure',
        description: '创建项目结构',
        type: 'setup',
        status: 'pending',
        priority: 9,
        estimatedDuration: 25,
        dependencies: ['analyze_requirements'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'implement_features',
        description: '实现核心功能',
        type: 'implement',
        status: 'pending',
        priority: 8,
        estimatedDuration: 60,
        dependencies: ['create_project_structure'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['file']
      },
      {
        id: 'test_and_validate',
        description: '测试和验证',
        type: 'test',
        status: 'pending',
        priority: 7,
        estimatedDuration: 30,
        dependencies: ['implement_features'],
        canRunInParallel: false,
        retries: 0,
        maxRetries: 3,
        tools: ['shell']
      }
    ];
  }

  /**
   * 执行智能计划（支持并行执行）
   */
  private async executeSmartPlan(plan: SmartTaskPlan): Promise<boolean> {
    plan.metadata.actualStartTime = new Date();
    
    // 创建依赖图并确定执行顺序
    const executionGroups = this.createExecutionGroups(plan.steps);
    
    for (const group of executionGroups) {
      if (this.isInterrupted) {
        this.logger.warn('⚠️ 任务被中断');
        return false;
      }
      
      // 并行执行当前组中的所有步骤
      const groupPromises = group.map(step => this.executeSmartStep(step, plan));
      const results = await Promise.allSettled(groupPromises);
      
      // 检查执行结果
      let groupSuccess = true;
      results.forEach((result, index) => {
        const step = group[index];
        if (result.status === 'fulfilled' && result.value) {
          step.status = 'completed';
          plan.metrics.completedSteps++;
        } else {
          step.status = 'failed';
          plan.metrics.failedSteps++;
          groupSuccess = false;
          
          if (result.status === 'rejected') {
            step.error = result.reason?.message || 'Unknown error';
          }
        }
      });
      
      // 如果关键步骤失败，尝试智能修复
      if (!groupSuccess) {
        const criticalFailures = group.filter(s => s.status === 'failed' && s.priority >= 8);
        if (criticalFailures.length > 0) {
          const fixSuccess = await this.attemptIntelligentFix(criticalFailures, plan);
          if (!fixSuccess) {
            return false;
          }
        }
      }
    }
    
    plan.completed = true;
    plan.metadata.actualEndTime = new Date();
    return plan.metrics.failedSteps === 0;
  }

  /**
   * 创建执行组（基于依赖关系的并行优化）
   */
  private createExecutionGroups(steps: SmartTaskStep[]): SmartTaskStep[][] {
    const groups: SmartTaskStep[][] = [];
    const completed = new Set<string>();
    const remaining = [...steps];
    
    while (remaining.length > 0) {
      const currentGroup: SmartTaskStep[] = [];
      
      // 找出当前可以执行的步骤（所有依赖都已完成）
      for (let i = remaining.length - 1; i >= 0; i--) {
        const step = remaining[i];
        const canExecute = step.dependencies.every(dep => completed.has(dep));
        
        if (canExecute) {
          currentGroup.push(step);
          remaining.splice(i, 1);
        }
      }
      
      if (currentGroup.length === 0) {
        // 检测到循环依赖，强制执行剩余步骤
        this.logger.warn('⚠️ 检测到循环依赖，强制执行剩余步骤');
        currentGroup.push(...remaining);
        remaining.length = 0;
      }
      
      groups.push(currentGroup);
      currentGroup.forEach(step => completed.add(step.id));
    }
    
    return groups;
  }

  /**
   * 执行单个智能步骤
   */
  private async executeSmartStep(step: SmartTaskStep, plan: SmartTaskPlan): Promise<boolean> {
    step.status = 'running';
    step.startTime = new Date();
    
    this.logger.info(`🔄 执行步骤: ${step.description} (优先级: ${step.priority})`);
    
    try {
      const executionPrompt = this.createSmartExecutionPrompt(step, plan);
      
      console.log(`\n📝 执行: ${step.description}`);
      console.log('─'.repeat(50));
      
      // 使用Agent的完整消息处理（包括工具调用）
      const response = await this.sendMessage(executionPrompt);
      
      // 显示执行结果
      if (response.content) {
        console.log(response.content);
      }
      
      console.log('─'.repeat(50));
      
      step.endTime = new Date();
      step.result = response.content;
      
      // 根据步骤类型进行验证
      const isValid = await this.validateStepResult(step, plan);
      
      if (isValid) {
        this.logger.success(`✅ 步骤完成: ${step.description}`);
        return true;
      } else {
        this.logger.error(`❌ 步骤验证失败: ${step.description}`);
        return false;
      }
      
    } catch (error: any) {
      step.error = error.message;
      step.endTime = new Date();
      this.logger.error(`步骤执行出错: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建智能执行提示词
   */
  private createSmartExecutionPrompt(step: SmartTaskStep, plan: SmartTaskPlan): string {
    const baseContext = `
智能代理执行上下文:
- 项目目标: ${plan.goal}
- 项目类型: ${plan.context.projectType}
- 工作目录: ${plan.workingDirectory}
- 当前步骤: ${step.description}
- 步骤类型: ${step.type}
- 优先级: ${step.priority}
- 预期工具: ${step.tools?.join(', ')}
`;

    switch (step.type) {
      case 'discovery':
        return `${baseContext}

请执行智能发现任务：
1. 并行探索项目结构和环境
2. 识别现有资源和依赖
3. 评估技术约束和机会
4. 收集实施所需的关键信息

使用并行工具调用来最大化效率。`;

      case 'setup':
        return `${baseContext}

请执行项目设置任务：
1. 创建必要的目录结构
2. 初始化配置文件
3. 设置开发环境
4. 准备项目基础架构

专注于: ${step.description}`;

      case 'implement':
        return `${baseContext}

请执行核心实现任务：
1. 编写高质量、可维护的代码
2. 遵循最佳实践和设计模式
3. 确保代码的可读性和扩展性
4. 添加必要的注释和文档

专注于: ${step.description}`;

      case 'build':
        return `${baseContext}

请执行构建任务：
1. 运行构建命令
2. 检查构建输出和错误
3. 优化构建过程
4. 确保构建成功

如果遇到构建错误，请分析并尝试修复。`;

      case 'test':
        return `${baseContext}

请执行测试验证任务：
1. 运行测试命令或程序
2. 验证功能是否正常工作
3. 检查输出是否符合预期
4. 记录测试结果

专注于: ${step.description}`;

      case 'validate':
        return `${baseContext}

请执行最终验证任务：
1. 全面检查项目完整性
2. 验证所有功能正常工作
3. 检查代码质量和标准
4. 确认项目达到目标要求

专注于: ${step.description}`;

      default:
        return `${baseContext}

请执行任务: ${step.description}
确保高质量完成，必要时使用多个工具并行操作。`;
    }
  }

  /**
   * 验证步骤执行结果
   */
  private async validateStepResult(step: SmartTaskStep, plan: SmartTaskPlan): Promise<boolean> {
    // 基于步骤类型进行不同的验证策略
    switch (step.type) {
      case 'build':
      case 'test':
        // 对于构建和测试步骤，检查是否有错误指示
        return !step.result?.toLowerCase().includes('error') && 
               !step.result?.toLowerCase().includes('failed');
      
      case 'implement':
      case 'setup':
        // 对于实现和设置步骤，检查是否有文件创建的证据
        return step.result !== undefined && step.result.trim().length > 0;
      
      default:
        return true; // 其他步骤认为成功
    }
  }

  /**
   * 智能修复失败的步骤
   */
  private async attemptIntelligentFix(failedSteps: SmartTaskStep[], plan: SmartTaskPlan): Promise<boolean> {
    this.logger.info(`🔧 尝试智能修复 ${failedSteps.length} 个失败步骤`);
    
    for (const step of failedSteps) {
      if (step.retries >= step.maxRetries) {
        continue;
      }
      
      const fixPrompt = `
智能错误诊断和修复:

失败步骤: ${step.description}
错误信息: ${step.error}
项目上下文: ${plan.context.projectType}

请分析错误原因并执行智能修复：
1. 诊断根本问题
2. 制定修复策略
3. 执行修复操作
4. 验证修复结果

使用最适合的工具和方法来解决问题。
`;

      try {
        const response = await this.sendMessage(fixPrompt);
        step.retries++;
        
        // 重新验证步骤
        const isFixed = await this.validateStepResult(step, plan);
        if (isFixed) {
          step.status = 'completed';
          plan.metrics.completedSteps++;
          plan.metrics.failedSteps--;
          this.logger.success(`✅ 步骤修复成功: ${step.description}`);
        }
      } catch (error: any) {
        this.logger.error(`修复失败: ${error.message}`);
      }
    }
    
    return plan.metrics.failedSteps === 0;
  }

  /**
   * 显示任务计划
   */
  private displayTaskPlan(plan: SmartTaskPlan): void {
    console.log('\n📋 智能任务执行计划:');
    console.log('='.repeat(70));
    console.log(`🎯 目标: ${plan.goal}`);
    console.log(`📁 工作目录: ${plan.workingDirectory}`);
    console.log(`🏗️  项目类型: ${plan.context.projectType}`);
    console.log(`⚡ 技术栈: ${plan.context.technologies?.join(', ')}`);
    console.log(`⏱️  预估时间: ${Math.round(plan.metadata.estimatedTotalTime / 60)} 分钟`);
    console.log('─'.repeat(70));
    
    plan.steps.forEach((step, index) => {
      const statusIcon = step.status === 'completed' ? '✅' : 
                        step.status === 'running' ? '🔄' : 
                        step.status === 'failed' ? '❌' : '⏳';
      const parallelIcon = step.canRunInParallel ? '⚡' : '🔗';
      console.log(`${statusIcon} ${index + 1}. [${step.type}] ${step.description} ${parallelIcon} (P${step.priority})`);
    });
    
    console.log('='.repeat(70));
  }

  /**
   * 显示最终摘要
   */
  private displayFinalSummary(plan: SmartTaskPlan): void {
    const duration = plan.metadata.actualEndTime && plan.metadata.actualStartTime
      ? Math.round((plan.metadata.actualEndTime.getTime() - plan.metadata.actualStartTime.getTime()) / 1000)
      : 0;
    
    console.log('\n🎉 智能代理任务完成摘要:');
    console.log('='.repeat(60));
    console.log(`✨ 项目已成功创建并准备就绪`);
    console.log(`📊 执行统计:`);
    console.log(`   • 总步骤: ${plan.metrics.totalSteps}`);
    console.log(`   • 成功: ${plan.metrics.completedSteps}`);
    console.log(`   • 失败: ${plan.metrics.failedSteps}`);
    console.log(`   • 并行执行: ${plan.metrics.parallelExecutions}`);
    console.log(`⏱️  实际耗时: ${duration} 秒`);
    console.log(`🎯 成功率: ${Math.round((plan.metrics.completedSteps / plan.metrics.totalSteps) * 100)}%`);
    console.log('='.repeat(60));
  }

  /**
   * 辅助方法：提取项目类型
   */
  private extractProjectType(content: string): string {
    const types = ['python', 'javascript', 'typescript', 'web', 'html', 'node', 'react', 'vue', 'angular'];
    for (const type of types) {
      if (content.toLowerCase().includes(type)) {
        return type;
      }
    }
    return 'generic';
  }

  /**
   * 辅助方法：提取技术栈
   */
  private extractTechnologies(content: string): string[] {
    const techs = ['python', 'javascript', 'html', 'css', 'react', 'vue', 'angular', 'node', 'express', 'fastapi'];
    return techs.filter(tech => content.toLowerCase().includes(tech));
  }

  /**
   * 辅助方法：提取需求
   */
  private extractRequirements(goal: string): string[] {
    // 简单的需求提取逻辑
    const requirements: string[] = [];
    
    if (goal.includes('计算器')) {
      requirements.push('数学运算功能', '用户界面', '错误处理');
    } else if (goal.includes('网页') || goal.includes('网站')) {
      requirements.push('HTML结构', 'CSS样式', '响应式设计');
    } else if (goal.includes('API')) {
      requirements.push('RESTful接口', '数据验证', '错误处理');
    }
    
    return requirements;
  }

  /**
   * 获取当前计划
   */
  public getCurrentPlan(): SmartTaskPlan | undefined {
    return this.currentPlan;
  }

  /**
   * 中断当前任务
   */
  public async interruptTask(): Promise<void> {
    this.isInterrupted = true;
    if (this.currentPlan) {
      this.logger.warn('⚠️ 智能代理任务被用户中断');
      this.currentPlan.completed = false;
    }
  }
}
