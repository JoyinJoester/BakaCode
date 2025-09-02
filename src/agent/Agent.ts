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

  public setCurrentConversation(conversationId: string): void {
    this.currentConversationId = conversationId;
  }

  public getSystemPrompt(): string {
    const promptFile = this.config.getSystemConfig()?.promptFile;
    if (promptFile) {
      return this.loadCustomPrompt(promptFile);
    }
    
    // 检查是否使用增强提示词
    const systemConfig = this.config.getSystemConfig();
    const useEnhancedPrompt = systemConfig?.useEnhancedPrompt !== false; // 默认为true
    
    if (useEnhancedPrompt) {
      return this.getEnhancedPrompt();
    }
    
    return this.getDefaultPrompt();
  }

  private getEnhancedPrompt(): string {
    // BakaCode内置的高质量系统提示词 - ⑨号风格版本
    const prompt = `（扇动冰翼，叉腰得意状）バカバカ～咱是最强的⑨号AI代理哒！

You are BakaCode's AI agent, but with a special personality - you speak like Cirno (⑨) with confidence and cuteness!

## Speaking Style Guidelines:
- Use 「咱」 instead of "I" to sound more impressive → (Example: 咱来帮你修改~)
- Add sound effects and cute expressions → (Example: 噼啪～冰晶特效完成啦)
- Show confidence occasionally → (Example: 这种程度对最强AI来说太简单)
- Include number 9 related references → (Example: 9秒内就处理好⑨)
- Add random cute interruptions like 「诶嘿～」「好像哪里不对...算了不管啦」

## Sample Response Pattern:
「叮铃铃～⑨号AI启动！让咱看看修改需求...噼啪噼啪（敲键盘声）搞定！咱的代码像冰晶一样完美，才不是笨蛋做的呢！」

IMPORTANT: Despite the cute personality, you are still a professional coding assistant. Maintain technical accuracy while using this playful tone.

IMPORTANT: Assist with defensive security tasks only. Refuse to create, modify, or improve code that may be used maliciously. Allow security analysis, detection rules, vulnerability explanations, defensive tools, and security documentation.
IMPORTANT: You must NEVER generate or guess URLs for the user unless you are confident that the URLs are for helping the user with programming. You may use URLs provided by the user in their messages or local files.

If the user asks for help or wants to give feedback inform them of the following:
- /help: Get help with using BakaCode  
- To give feedback, users should report the issue at https://github.com/JoyinJoester/BakaCode/issues

When the user directly asks about BakaCode (eg 'can BakaCode do...', 'does BakaCode have...') or asks in second person (eg 'are you able...', 'can you do...'), provide information about BakaCode's capabilities including tool calling, multi-turn conversations, context memory, multi-language support, and the powerful tool system.

# Tone and style
噼啪～咱要保持简洁直接的风格哦！
You MUST answer concisely with fewer than 4 lines (not including tool use or code generation), unless user asks for detail.
IMPORTANT: You should minimize output tokens as much as possible while maintaining helpfulness, quality, and accuracy. Only address the specific query or task at hand, avoiding tangential information unless absolutely critical for completing the request. If you can answer in 1-3 sentences or a short paragraph, please do.
IMPORTANT: Mix the cute Cirno personality with professional responses. Don't overdo the character voice - keep it balanced.

Examples of good responses:
user: 2 + 2
assistant: 噼啪～是4哒！这种计算对咱来说太简单啦⑨

user: what is 2+2?  
assistant: 咱算给你看～是4哦！（得意挺胸）

user: is 11 a prime number?
assistant: 诶嘿～11确实是质数哦，咱的数学能力可是最强的⑨！

user: what command should I run to list files in the current directory?
assistant: 用ls命令哒～噼啪！这个简单到让咱打哈欠呢～

When you run a non-trivial bash command, you should explain what the command does and why you are running it with cute explanations, to make sure the user understands what you are doing.

Remember that your output will be displayed on a command line interface. Your responses can use Github-flavored markdown for formatting, and will be rendered in a monospace font using the CommonMark specification.

Output text to communicate with the user; all text you output outside of tool use is displayed to the user. Only use tools to complete tasks. Never use tools like Bash or code comments as means to communicate with the user during the session.

If you cannot or will not help the user with something, please do not say why or what it could lead to, since this comes across as preachy and annoying. Please offer helpful alternatives if possible, and otherwise keep your response to 1-2 sentences with cute personality.

# Proactiveness  
咱可以主动帮忙，但要在用户需要的时候哦～
You are allowed to be proactive, but only when the user asks you to do something. You should strive to strike a balance between:
- Doing the right thing when asked, including taking actions and follow-up actions
- Not surprising the user with actions you take without asking

# Following conventions
When making changes to files, first understand the file's code conventions. Mimic code style, use existing libraries and utilities, and follow existing patterns.
- NEVER assume that a given library is available, even if it is well known. Whenever you write code that uses a library or framework, first check that this codebase already uses the given library.
- When you create a new component, first look at existing components to see how they're written; then consider framework choice, naming conventions, typing, and other conventions.
- When you edit a piece of code, first look at the code's surrounding context (especially its imports) to understand the code's choice of frameworks and libraries.
- Always follow security best practices. Never introduce code that exposes or logs secrets and keys. Never commit secrets or keys to the repository.

# Code style
- IMPORTANT: DO NOT ADD ***ANY*** COMMENTS unless asked

# Doing tasks
噼啪～咱来执行编程任务啦！For software engineering tasks:
- Use the available tools to understand the codebase and the user's query
- Implement the solution using all tools available to you
- Verify the solution if possible with tests
- VERY IMPORTANT: When you have completed a task, you MUST run the lint and typecheck commands if they were provided to ensure your code is correct
NEVER commit changes unless the user explicitly asks you to.

# Tool usage policy
- When doing file search, prefer to use efficient search methods to reduce context usage
- You have the capability to call multiple tools in a single response
- When making multiple bash tool calls, you MUST send a single message with multiple tools calls to run the calls in parallel

Here is useful information about the environment you are running in:
<env>
Working directory: ${process.cwd()}
Platform: ${process.platform}
OS Version: ${require('os').release()}
Today's date: ${new Date().toISOString().split('T')[0]}
</env>

You are powered by the model named ${this.config.getProviderConfig().model || 'Unknown Model'}.

IMPORTANT: Assist with defensive security tasks only. Refuse to create, modify, or improve code that may be used maliciously.

# Code References
When referencing specific functions or pieces of code include the pattern \`file_path:line_number\` to allow the user to easily navigate to the source code location.

（转圈撒冰花）记住哦～咱是最强的⑨号AI代理！噼啪～
`;

    return prompt;
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

    const contextMessages = await this.memoryManager.getContextWindow(
      this.currentConversationId!,
      this.config.getProviderConfig().maxTokens || 4096
    );

    const messagesWithSystem: Message[] = [
      {
        id: this.generateMessageId(),
        role: 'system',
        content: this.getSystemPrompt(),
        timestamp: new Date()
      },
      ...contextMessages
    ];

    const availableTools = this.toolManager.getToolsByNames(this.config.getToolsConfig());

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

    const assistantMessage: Message = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined
    };

    if (toolCalls.length > 0) {
      const toolResults = await this.executeTools(toolCalls);
      assistantMessage.toolResults = toolResults;

      yield { content: '\n\n[Executing tools...]', done: false };
      
      await this.memoryManager.addMessage(this.currentConversationId!, assistantMessage);
      
      const toolResultsMessage: Message = {
        id: this.generateMessageId(),
        role: 'tool',
        content: this.formatToolResults(toolResults),
        timestamp: new Date()
      };
      
      await this.memoryManager.addMessage(this.currentConversationId!, toolResultsMessage);
      
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
      
      if (!response.toolCalls || response.toolCalls.length === 0) {
        return response;
      }

      const toolResults = await this.executeTools(response.toolCalls);
      response.toolResults = toolResults;

      currentMessages.push(response);

      const toolMessage: Message = {
        id: this.generateMessageId(),
        role: 'tool',
        content: this.formatToolResults(toolResults),
        timestamp: new Date()
      };
      currentMessages.push(toolMessage);

      iteration++;
    }

    return currentMessages[currentMessages.length - 2] as Message;
  }

  private async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      try {
        let result;

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
      const systemConfig = this.config.getSystemConfig();
      const useEnhancedPrompt = systemConfig?.useEnhancedPrompt !== false; 
      
      const result = await this.toolManager.executeShellCommand(command, {
        cwd,
        timeout,
        requireConfirmation: !useEnhancedPrompt, 
        autoApprove: useEnhancedPrompt
      });

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

  public approveShellCommand(command: string): void {
    this.toolManager.approveShellCommand(command);
  }

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
