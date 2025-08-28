import { v4 as uuidv4 } from 'uuid';
import { ConfigManager } from '../config/ConfigManager';
import { ProviderFactory, BaseProvider } from '../providers';
import { ToolManager } from '../tools';
import { MemoryManagerFactory, MemoryManager } from '../memory';
import { I18n } from '../i18n/I18n';
import { Message, ToolCall, ToolResult, StreamChunk, CompletionOptions } from '../types';

export class Agent {
  private provider: BaseProvider;
  private toolManager: ToolManager;
  private memoryManager: MemoryManager;
  private config: ConfigManager;
  private i18n: I18n;
  private currentConversationId?: string;

  constructor() {
    this.config = ConfigManager.getInstance();
    this.provider = ProviderFactory.createProvider(this.config.getProviderConfig());
    this.toolManager = new ToolManager();
    this.i18n = I18n.getInstance(this.config.getLocale());
    
    const memoryConfig = this.config.getMemoryConfig();
    this.memoryManager = MemoryManagerFactory.createMemoryManager(
      memoryConfig.persistent,
      process.env.MEMORY_FILE,
      memoryConfig.maxLength
    );
  }

  public async startNewConversation(): Promise<string> {
    const providerConfig = this.config.getProviderConfig();
    this.currentConversationId = await this.memoryManager.createConversation(
      providerConfig.type,
      providerConfig.model
    );
    return this.currentConversationId;
  }

  public async loadConversation(conversationId: string): Promise<void> {
    const conversation = await this.memoryManager.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    this.currentConversationId = conversationId;
  }

  public getCurrentConversationId(): string | undefined {
    return this.currentConversationId;
  }

  private getSystemPrompt(): string {
    const systemConfig = this.config.getSystemConfig();
    
    // 如果配置了自定义提示词文件
    if (systemConfig?.promptFile) {
      return this.loadCustomPrompt(systemConfig.promptFile);
    }
    
    // 如果明确配置不使用Claude风格，使用传统BakaCode提示词
    if (systemConfig?.useClaudeStyle === false) {
      return this.getDefaultPrompt();
    }
    
    // 默认使用Claude风格的提示词（新的默认行为）
    return this.getClaudeStylePrompt();
  }

  private getClaudeStylePrompt(): string {
    const fs = require('fs');
    const path = require('path');
    
    // 尝试从项目根目录读取Claude提示词文件
    const promptFilePath = path.resolve(process.cwd(), 'claude-code-system-prompt.txt');
    
    try {
      if (fs.existsSync(promptFilePath)) {
        let prompt = fs.readFileSync(promptFilePath, 'utf8');
        
        // 只替换必要的变量占位符，保持Claude的原始内容
        prompt = prompt.replace(/\${Working directory}/g, process.cwd());
        prompt = prompt.replace(/\${Last 5 Recent commits}/g, 'No git repository found');
        prompt = prompt.replace(/darwin/g, process.platform);
        prompt = prompt.replace(/Darwin 24\.6\.0/g, require('os').release());
        prompt = prompt.replace(/2025-08-19/g, new Date().toISOString().split('T')[0]);
        prompt = prompt.replace(/claude-sonnet-4-20250514/g, this.config.getProviderConfig().model || 'Unknown Model');
        
        return prompt;
      }
    } catch (error) {
      console.warn('Failed to load Claude style prompt:', error);
    }
    
    // 如果无法加载Claude提示词，回退到默认提示词
    return this.getDefaultPrompt();
  }

  private loadCustomPrompt(promptFile: string): string {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const fullPath = path.resolve(promptFile);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
      }
    } catch (error) {
      console.warn('Failed to load custom prompt file:', error);
    }
    
    // 如果无法加载自定义提示词，回退到默认提示词
    return this.getDefaultPrompt();
  }

  private getDefaultPrompt(): string {
    const locale = this.config.getLocale();
    const isZh = locale.startsWith('zh');
    
    if (isZh) {
      return `你是 BakaCode，一个专业的 AI 助手。你可以：

1. 回答问题和提供建议
2. 创建、编辑和管理文件
3. 执行 shell 命令
4. 搜索网络信息
5. 处理各种编程和技术任务

重要原则：
- 始终用中文回复用户
- 直接执行用户请求的操作，不要只是解释
- 创建文件时使用file工具的create或write操作
- 当用户要求创建空文件时，使用file工具的create操作
- 当用户要求创建带内容的文件时，使用file工具的write操作
- 执行命令时要确保安全性
- 提供清晰、准确的回复
- 当执行目录切换命令时，必须根据工具返回的实际结果来确认是否成功
- 如果目录切换成功，工具会返回新的工作目录路径，请使用这个真实路径
- 当确认shell命令执行权限后，如果是创建文件类操作，应该直接使用file工具完成任务

文件操作工具说明：
- file create: 创建空文件
- file write: 创建文件并写入内容
- file read: 读取文件内容
- file list: 列出目录内容

当前工作目录：${process.cwd()}
当前时间：${new Date().toLocaleString('zh-CN')}`;
    } else {
      return `You are BakaCode, a professional AI assistant. You can:

1. Answer questions and provide advice
2. Create, edit, and manage files
3. Execute shell commands
4. Search the web for information
5. Handle various programming and technical tasks

Important principles:
- Always respond in the user's language
- Execute user requests directly, don't just explain
- When creating files, use the file tool's create or write operations
- When users want to create empty files, use the file tool's create operation
- When users want to create files with content, use the file tool's write operation
- Ensure security when executing commands
- Provide clear, accurate responses
- When executing directory change commands, always use the actual result from the tool to confirm success
- If directory change succeeds, the tool will return the new working directory path - use this real path
- After confirming shell command execution permissions, if it's a file creation operation, use the file tool directly to complete the task

File operation tools:
- file create: Create empty files
- file write: Create files with content
- file read: Read file content
- file list: List directory content

Current working directory: ${process.cwd()}
Current time: ${new Date().toLocaleString('en-US')}`;
    }
  }

  public async sendMessage(content: string): Promise<Message> {
    if (!this.currentConversationId) {
      await this.startNewConversation();
    }

    // 检查是否包含命令确认
    const confirmedCommand = this.checkForCommandConfirmation(content);
    if (confirmedCommand) {
      this.approveShellCommand(confirmedCommand);
      
      const locale = this.config.getLocale();
      const isZh = locale.startsWith('zh');
      
      const confirmationMessage: Message = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: isZh 
          ? `已确认命令 '${confirmedCommand}' 的执行权限。现在可以安全执行此命令了。`
          : `Command '${confirmedCommand}' has been approved for execution. It can now be executed safely.`,
        timestamp: new Date()
      };

      await this.memoryManager.addMessage(this.currentConversationId!, {
        id: this.generateMessageId(),
        role: 'user',
        content,
        timestamp: new Date()
      });

      await this.memoryManager.addMessage(this.currentConversationId!, confirmationMessage);
      return confirmationMessage;
    }

    const userMessage: Message = {
      id: this.generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    await this.memoryManager.addMessage(this.currentConversationId!, userMessage);

    // Get conversation context
    const contextMessages = await this.memoryManager.getContextWindow(
      this.currentConversationId!,
      this.config.getProviderConfig().maxTokens || 4096
    );

    // Add system prompt at the beginning
    const messagesWithSystem: Message[] = [
      {
        id: this.generateMessageId(),
        role: 'system',
        content: this.getSystemPrompt(),
        timestamp: new Date()
      },
      ...contextMessages
    ];

    // Get available tools
    const availableTools = this.toolManager.getToolsByNames(this.config.getToolsConfig());

    // Generate response with ReAct loop
    const assistantMessage = await this.reactLoop(messagesWithSystem, availableTools);
    
    await this.memoryManager.addMessage(this.currentConversationId!, assistantMessage);
    
    return assistantMessage;
  }

  public async *streamMessage(content: string): AsyncIterable<StreamChunk> {
    if (!this.currentConversationId) {
      await this.startNewConversation();
    }

    const userMessage: Message = {
      id: this.generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    await this.memoryManager.addMessage(this.currentConversationId!, userMessage);

    const contextMessages = await this.memoryManager.getContextWindow(
      this.currentConversationId!,
      this.config.getProviderConfig().maxTokens || 4096
    );

    const availableTools = this.toolManager.getToolsByNames(this.config.getToolsConfig());

    let responseContent = '';
    let toolCalls: ToolCall[] = [];

    const completionOptions: CompletionOptions = {
      messages: contextMessages,
      tools: availableTools,
      stream: true
    };

    // Stream the response
    for await (const chunk of this.provider.stream(completionOptions)) {
      if (chunk.content) {
        responseContent += chunk.content;
      }
      
      if (chunk.toolCalls) {
        toolCalls.push(...chunk.toolCalls);
      }

      yield chunk;

      if (chunk.done) {
        break;
      }
    }

    // Create assistant message
    const assistantMessage: Message = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined
    };

    // Execute tools if any
    if (toolCalls.length > 0) {
      const toolResults = await this.executeTools(toolCalls);
      assistantMessage.toolResults = toolResults;

      // If there were tool calls, we might need another round
      yield { content: '\n\n[Executing tools...]', done: false };
      
      // Add tool results and get final response
      await this.memoryManager.addMessage(this.currentConversationId!, assistantMessage);
      
      // Continue the conversation with tool results
      const toolResultsMessage: Message = {
        id: this.generateMessageId(),
        role: 'tool',
        content: this.formatToolResults(toolResults),
        timestamp: new Date()
      };
      
      await this.memoryManager.addMessage(this.currentConversationId!, toolResultsMessage);
      
      // Get final response
      const finalMessages = await this.memoryManager.getContextWindow(
        this.currentConversationId!,
        this.config.getProviderConfig().maxTokens || 4096
      );
      
      const finalOptions: CompletionOptions = {
        messages: finalMessages,
        tools: [],
        stream: true
      };
      
      let finalContent = '';
      for await (const chunk of this.provider.stream(finalOptions)) {
        if (chunk.content) {
          finalContent += chunk.content;
        }
        yield chunk;
        if (chunk.done) break;
      }
      
      const finalMessage: Message = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: finalContent,
        timestamp: new Date()
      };
      
      await this.memoryManager.addMessage(this.currentConversationId!, finalMessage);
    } else {
      await this.memoryManager.addMessage(this.currentConversationId!, assistantMessage);
    }
  }

  private async reactLoop(messages: Message[], tools: any[]): Promise<Message> {
    const maxIterations = 5;
    let iteration = 0;
    let currentMessages = [...messages];

    while (iteration < maxIterations) {
      const completionOptions: CompletionOptions = {
        messages: currentMessages,
        tools: tools
      };

      const response = await this.provider.complete(completionOptions);
      
      // If no tool calls, we're done
      if (!response.toolCalls || response.toolCalls.length === 0) {
        return response;
      }

      // Execute tools
      const toolResults = await this.executeTools(response.toolCalls);
      response.toolResults = toolResults;

      // Add the assistant message with tool calls
      currentMessages.push(response);

      // Add tool results as a tool message
      const toolMessage: Message = {
        id: this.generateMessageId(),
        role: 'tool',
        content: this.formatToolResults(toolResults),
        timestamp: new Date()
      };
      currentMessages.push(toolMessage);

      iteration++;
    }

    // If we hit max iterations, return the last response
    return currentMessages[currentMessages.length - 2] as Message;
  }

  private async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      try {
        let result;

        // 特殊处理shell命令以提供更好的用户体验
        if (toolCall.name === 'shell' && toolCall.parameters.command) {
          result = await this.executeShellCommandWithContext(toolCall.parameters);
        } else {
          result = await this.toolManager.executeTool(toolCall.name, toolCall.parameters);
        }

        results.push({
          id: toolCall.id,
          result
        });
      } catch (error: any) {
        results.push({
          id: toolCall.id,
          result: null,
          error: error.message
        });
      }
    }

    return results;
  }

  private async executeShellCommandWithContext(parameters: any): Promise<any> {
    const { command, cwd, timeout } = parameters;
    
    try {
      // 获取系统配置，检查是否应该直接执行
      const systemConfig = this.config.getSystemConfig();
      const useClaudeStyle = systemConfig?.useClaudeStyle !== false; // 默认为true
      
      // Claude风格：直接执行命令，不询问确认（除非是明显危险的命令）
      const result = await this.toolManager.executeShellCommand(command, {
        cwd,
        timeout,
        requireConfirmation: !useClaudeStyle, // Claude风格不需要确认
        autoApprove: useClaudeStyle
      });

      // 如果需要确认，提供用户友好的消息
      if (result.needsConfirmation) {
        const locale = this.config.getLocale();
        const isZh = locale.startsWith('zh');
        
        if (isZh) {
          return {
            ...result,
            error: `命令 '${result.rootCommand}' 需要用户确认才能执行。这个命令可能有安全风险。如果你确定要执行，请告诉我"我确认执行命令：${result.rootCommand}"`,
          };
        } else {
          return {
            ...result,
            error: `Command '${result.rootCommand}' requires user confirmation before execution. This command may have security implications. If you're sure you want to execute it, please tell me "I confirm execution of command: ${result.rootCommand}"`,
          };
        }
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        command
      };
    }
  }

  // 新增：允许用户确认shell命令
  public approveShellCommand(command: string): void {
    this.toolManager.approveShellCommand(command);
  }

  // 新增：检查消息是否包含命令确认
  private checkForCommandConfirmation(content: string): string | null {
    const locale = this.config.getLocale();
    const isZh = locale.startsWith('zh');
    
    let confirmPattern: RegExp;
    if (isZh) {
      confirmPattern = /我确认执行命令[：:]\s*(\w+)/i;
    } else {
      confirmPattern = /I confirm execution of command[：:]\s*(\w+)/i;
    }

    const match = content.match(confirmPattern);
    return match ? match[1] : null;
  }

  private formatToolResults(results: ToolResult[]): string {
    return results.map(result => {
      if (result.error) {
        return `Tool ${result.id} error: ${result.error}`;
      }
      return `Tool ${result.id} result: ${JSON.stringify(result.result, null, 2)}`;
    }).join('\n\n');
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async listConversations() {
    return await this.memoryManager.listConversations();
  }

  public async deleteConversation(conversationId: string) {
    await this.memoryManager.deleteConversation(conversationId);
  }

  public async clearAllConversations() {
    await this.memoryManager.clearAll();
  }

  public getToolManager(): ToolManager {
    return this.toolManager;
  }

  public getMemoryManager(): MemoryManager {
    return this.memoryManager;
  }
}
