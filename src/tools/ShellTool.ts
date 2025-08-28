import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseTool } from './BaseTool';
import { ConfigManager } from '../config/ConfigManager';

export class ShellTool extends BaseTool {
  public name = 'shell';
  public description = 'Execute shell commands with security restrictions';
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
      }
    },
    required: ['command']
  };

  async execute(parameters: Record<string, any>): Promise<any> {
    this.validateParameters(parameters);

    const { command, cwd, timeout = 30000 } = parameters;
    const config = ConfigManager.getInstance().getSecurityConfig();

    // Check for blocked commands
    if (this.isCommandBlocked(command, config.blockedCommands)) {
      return {
        success: false,
        error: `Command blocked for security reasons: ${command}`
      };
    }

    // Special handling for cd command
    if (this.isCdCommand(command)) {
      return await this.handleCdCommand(command, config.allowedDirectories);
    }

    // Validate working directory if provided
    let workingDir = process.cwd();
    if (cwd) {
      try {
        workingDir = this.sanitizePath(cwd, config.allowedDirectories);
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        };
      }
    }

    return new Promise((resolve) => {
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'cmd.exe' : '/bin/sh';
      const args = isWindows ? ['/c', command] : ['-c', command];

      const child = spawn(shell, args, {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          exitCode: code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          command,
          cwd: workingDir
        });
      });

      child.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          command,
          cwd: workingDir
        });
      });

      // Handle timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({
          success: false,
          error: `Command timed out after ${timeout}ms`,
          command,
          cwd: workingDir
        });
      }, timeout);

      child.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
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
        const requestedPath = parts.slice(1).join(' ').replace(/['"]/g, ''); // Remove quotes
        
        if (path.isAbsolute(requestedPath)) {
          targetPath = requestedPath;
        } else {
          targetPath = path.resolve(process.cwd(), requestedPath);
        }
      }

      // Normalize path
      targetPath = path.normalize(targetPath);

      // Check if directory exists
      if (!await fs.pathExists(targetPath)) {
        return {
          success: false,
          error: `Directory does not exist: ${targetPath}`,
          command,
          cwd: process.cwd()
        };
      }

      // Check if it's actually a directory
      const stats = await fs.stat(targetPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: `Not a directory: ${targetPath}`,
          command,
          cwd: process.cwd()
        };
      }

      // Security check - validate against allowed directories
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

      // Change the process working directory
      const oldCwd = process.cwd();
      process.chdir(targetPath);
      const newCwd = process.cwd();

      return {
        success: true,
        exitCode: 0,
        stdout: `Changed directory from ${oldCwd} to ${newCwd}`,
        stderr: '',
        command,
        cwd: newCwd,
        oldCwd: oldCwd
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
