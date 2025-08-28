import { FileTool } from './FileTool';
import { ShellTool } from './ShellTool';
import { EnhancedShellTool } from './EnhancedShellTool';
import { HttpTool } from './HttpTool';
import { WebSearchTool } from './WebSearchTool';
import { BaseTool } from './BaseTool';
import { Tool } from '../types';

export class ToolManager {
  private tools: Map<string, Tool> = new Map();
  private enhancedShellTool: EnhancedShellTool;

  constructor() {
    this.enhancedShellTool = new EnhancedShellTool();
    this.registerDefaultTools();
  }

  private registerDefaultTools(): void {
    const defaultTools = [
      new FileTool(),
      new ShellTool(),
      this.enhancedShellTool,
      new HttpTool(),
      new WebSearchTool()
    ];

    for (const tool of defaultTools) {
      this.registerTool(tool);
    }
  }

  public registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  public getAvailableTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  public getToolsByNames(names: string[]): Tool[] {
    return names
      .map(name => this.getTool(name))
      .filter((tool): tool is Tool => tool !== undefined);
  }

  // 增强的shell命令执行，支持确认机制
  public async executeShellCommand(
    command: string, 
    options: {
      cwd?: string;
      timeout?: number;
      requireConfirmation?: boolean;
      autoApprove?: boolean;
    } = {}
  ): Promise<any> {
    // 优先使用增强的Shell工具
    const enhancedShell = this.enhancedShellTool;
    
    // 检查是否需要用户确认
    if (options.requireConfirmation && !options.autoApprove) {
      const root = command.trim().split(/\s+/)[0];
      const allowedCommands = enhancedShell.getAllowedCommands();
      
      if (!allowedCommands.includes(root)) {
        return {
          success: false,
          error: `Command '${root}' requires user confirmation. Please confirm this command is safe to execute.`,
          command,
          needsConfirmation: true,
          rootCommand: root
        };
      }
    }

    return await enhancedShell.execute({
      command,
      cwd: options.cwd,
      timeout: options.timeout,
      confirmationRequired: options.requireConfirmation ?? true
    });
  }

  // 允许用户确认特定命令
  public approveShellCommand(command: string): void {
    this.enhancedShellTool.allowCommand(command);
  }

  // 获取已批准的shell命令列表
  public getApprovedShellCommands(): string[] {
    return this.enhancedShellTool.getAllowedCommands();
  }

  public async executeTool(name: string, parameters: Record<string, any>): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      // 对于shell工具，使用增强的执行逻辑
      if (name === 'shell' && parameters.command) {
        return await this.executeShellCommand(parameters.command, {
          cwd: parameters.cwd,
          timeout: parameters.timeout,
          requireConfirmation: parameters.confirmationRequired,
          autoApprove: false
        });
      }

      return await tool.execute(parameters);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        tool: name
      };
    }
  }
}

export { BaseTool, FileTool, ShellTool, EnhancedShellTool, HttpTool, WebSearchTool };
