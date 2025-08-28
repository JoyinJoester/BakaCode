import { spawn } from 'child_process';
import { TextDecoder } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { BaseTool } from './BaseTool';
import { ConfigManager } from '../config/ConfigManager';

interface ShellExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  error: Error | null;
  aborted: boolean;
  command: string;
  cwd: string;
  pid?: number;
}

interface ShellExecutionHandle {
  pid: number | undefined;
  result: Promise<ShellExecutionResult>;
}

export class EnhancedShellTool extends BaseTool {
  public name = 'enhanced_shell';
  public description = 'Execute shell commands with enhanced reliability and security';
  public schema = {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The shell command to execute'
      },
      cwd: {
        type: 'string',
        description: 'Working directory for the command'
      },
      timeout: {
        type: 'number',
        default: 30000,
        description: 'Command timeout in milliseconds'
      },
      confirmationRequired: {
        type: 'boolean',
        default: true,
        description: 'Whether to require user confirmation for potentially dangerous commands'
      }
    },
    required: ['command']
  };

  private allowedCommands = new Set<string>();
  private readonly SIGKILL_TIMEOUT_MS = 200;

  private getCommandRoot(command: string): string {
    const trimmed = command.trim();
    const firstWord = trimmed.split(/\s+/)[0];
    return firstWord || '';
  }

  private isCommandSafe(command: string): boolean {
    const root = this.getCommandRoot(command);
    // 安全的基本命令白名单
    const safeCommands = [
      'ls', 'dir', 'pwd', 'cd', 'echo', 'cat', 'type', 'find', 'grep', 
      'git', 'npm', 'node', 'python', 'pip', 'which', 'whereis',
      'head', 'tail', 'wc', 'sort', 'uniq', 'tree', 'stat'
    ];
    return safeCommands.includes(root) || this.allowedCommands.has(root);
  }

  private isDangerousCommand(command: string): boolean {
    const root = this.getCommandRoot(command);
    const dangerousCommands = [
      'rm', 'del', 'rmdir', 'rd', 'format', 'fdisk', 'chmod', 'chown',
      'sudo', 'su', 'passwd', 'useradd', 'userdel', 'kill', 'pkill',
      'shutdown', 'reboot', 'halt', 'poweroff', 'dd', 'mount', 'umount'
    ];
    return dangerousCommands.includes(root);
  }

  private executeShellCommand(
    command: string,
    cwd: string,
    timeout: number = 30000,
    abortSignal?: AbortSignal
  ): ShellExecutionHandle {
    const isWindows = os.platform() === 'win32';

    const child = spawn(command, [], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows ? true : 'bash',
      detached: !isWindows,
      env: {
        ...process.env,
        BAKACODE_CLI: '1',
      },
    });

    const result = new Promise<ShellExecutionResult>((resolve) => {
      let stdout = '';
      let stderr = '';
      let error: Error | null = null;
      let exited = false;

      // 使用更智能的编码检测
      const stdoutDecoder = new TextDecoder('utf-8', { fatal: false });
      const stderrDecoder = new TextDecoder('utf-8', { fatal: false });

      const handleOutput = (data: Buffer, stream: 'stdout' | 'stderr') => {
        try {
          const decodedChunk = stream === 'stdout' 
            ? stdoutDecoder.decode(data, { stream: true })
            : stderrDecoder.decode(data, { stream: true });

          if (stream === 'stdout') {
            stdout += decodedChunk;
          } else {
            stderr += decodedChunk;
          }
        } catch (decodeError) {
          // 如果解码失败，记录原始数据
          const fallback = data.toString('latin1');
          if (stream === 'stdout') {
            stdout += fallback;
          } else {
            stderr += fallback;
          }
        }
      };

      child.stdout?.on('data', (data) => handleOutput(data, 'stdout'));
      child.stderr?.on('data', (data) => handleOutput(data, 'stderr'));

      child.on('error', (err) => {
        error = err;
        cleanup();
        resolve({
          success: false,
          stdout: stdout + stdoutDecoder.decode(),
          stderr: stderr + stderrDecoder.decode(),
          exitCode: 1,
          signal: null,
          error,
          aborted: false,
          command,
          cwd,
          pid: child.pid,
        });
      });

      const abortHandler = async () => {
        if (child.pid && !exited) {
          if (isWindows) {
            // Windows: 使用 taskkill 终止进程树
            spawn('taskkill', ['/pid', child.pid.toString(), '/f', '/t'], { 
              detached: true,
              stdio: 'ignore'
            });
          } else {
            try {
              // Unix: 先发送 SIGTERM，然后 SIGKILL
              process.kill(-child.pid, 'SIGTERM');
              await new Promise((res) => setTimeout(res, this.SIGKILL_TIMEOUT_MS));
              if (!exited) {
                process.kill(-child.pid, 'SIGKILL');
              }
            } catch {
              // 回退到只杀死主进程
              if (!exited) child.kill('SIGKILL');
            }
          }
        }
      };

      if (abortSignal) {
        abortSignal.addEventListener('abort', abortHandler, { once: true });
      }

      // 设置超时
      const timeoutId = setTimeout(() => {
        if (!exited) {
          abortHandler();
        }
      }, timeout);

      child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        cleanup();
        clearTimeout(timeoutId);

        const finalStdout = stdout + stdoutDecoder.decode();
        const finalStderr = stderr + stderrDecoder.decode();

        resolve({
          success: code === 0,
          stdout: finalStdout,
          stderr: finalStderr,
          exitCode: code,
          signal,
          error,
          aborted: abortSignal?.aborted || false,
          command,
          cwd,
          pid: child.pid,
        });
      });

      function cleanup() {
        exited = true;
        if (abortSignal) {
          abortSignal.removeEventListener('abort', abortHandler);
        }
      }
    });

    return { pid: child.pid, result };
  }

  async execute(parameters: Record<string, any>): Promise<any> {
    this.validateParameters(parameters);

    const { 
      command, 
      cwd, 
      timeout = 30000, 
      confirmationRequired = true 
    } = parameters;
    
    const config = ConfigManager.getInstance().getSecurityConfig();

    // 检查被阻止的命令
    if (this.isCommandBlocked(command, config.blockedCommands)) {
      return {
        success: false,
        error: `Command blocked for security reasons: ${command}`,
        command,
        cwd: process.cwd()
      };
    }

    // 特殊处理cd命令
    if (this.isCdCommand(command)) {
      return await this.handleCdCommand(command, config.allowedDirectories);
    }

    // 安全检查
    if (confirmationRequired && this.isDangerousCommand(command)) {
      if (!this.isCommandSafe(command)) {
        return {
          success: false,
          error: `Dangerous command requires explicit approval: ${command}. Use allowCommand() to whitelist it.`,
          command,
          cwd: process.cwd()
        };
      }
    }

    // 验证工作目录
    let workingDir = process.cwd();
    if (cwd) {
      try {
        workingDir = this.sanitizePath(cwd, config.allowedDirectories);
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          command,
          cwd: process.cwd()
        };
      }
    }

    try {
      const handle = this.executeShellCommand(command, workingDir, timeout);
      const result = await handle.result;

      // 格式化输出
      let output = '';
      if (result.stdout) {
        output += result.stdout;
      }

      if (result.stderr) {
        output += output ? `\n[STDERR]:\n${result.stderr}` : result.stderr;
      }

      if (result.aborted) {
        output += '\n[Command was aborted]';
      }

      if (result.signal) {
        output += `\n[Terminated by signal: ${result.signal}]`;
      }

      return {
        ...result,
        output: output || '[No output]'
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Execution failed: ${error.message}`,
        command,
        cwd: workingDir
      };
    }
  }

  // 允许用户确认后的命令
  allowCommand(command: string): void {
    const root = this.getCommandRoot(command);
    this.allowedCommands.add(root);
  }

  // 获取当前白名单
  getAllowedCommands(): string[] {
    return Array.from(this.allowedCommands);
  }

  private isCdCommand(command: string): boolean {
    const trimmed = command.trim().toLowerCase();
    return trimmed === 'cd' || trimmed.startsWith('cd ') || trimmed.startsWith('chdir ');
  }

  private async handleCdCommand(command: string, allowedDirectories: string[]): Promise<any> {
    try {
      const parts = command.trim().split(/\s+/);
      let targetPath: string;

      if (parts.length === 1) {
        // cd without arguments - go to home directory
        targetPath = process.env.HOME || process.env.USERPROFILE || process.cwd();
      } else {
        // cd with path argument
        const requestedPath = parts.slice(1).join(' ').replace(/['"]/g, '');
        
        if (path.isAbsolute(requestedPath)) {
          targetPath = requestedPath;
        } else {
          targetPath = path.resolve(process.cwd(), requestedPath);
        }
      }

      // 规范化路径
      targetPath = path.normalize(targetPath);

      // 检查目录是否存在
      if (!await fs.pathExists(targetPath)) {
        return {
          success: false,
          error: `Directory does not exist: ${targetPath}`,
          command,
          cwd: process.cwd()
        };
      }

      // 检查是否为目录
      const stats = await fs.stat(targetPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: `Not a directory: ${targetPath}`,
          command,
          cwd: process.cwd()
        };
      }

      // 安全检查
      try {
        this.sanitizePath(targetPath, allowedDirectories);
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          command,
          cwd: process.cwd()
        };
      }

      // 更改工作目录
      const oldCwd = process.cwd();
      process.chdir(targetPath);
      const newCwd = process.cwd();

      return {
        success: true,
        exitCode: 0,
        stdout: `Directory changed from ${oldCwd} to ${newCwd}`,
        stderr: '',
        command,
        cwd: newCwd,
        oldCwd: oldCwd,
        output: `Directory changed from ${oldCwd} to ${newCwd}`
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Failed to change directory: ${error.message}`,
        command,
        cwd: process.cwd()
      };
    }
  }
}
