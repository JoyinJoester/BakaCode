import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseTool } from './BaseTool';
import { ConfigManager } from '../config/ConfigManager';

export class FileTool extends BaseTool {
  public name = 'file';
  public description = 'Read, write, and manage files within allowed directories';
  public schema = {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['read', 'write', 'create', 'list', 'exists', 'delete', 'mkdir'],
        description: 'The file operation to perform. Use "create" to create empty files, "write" to write content.'
      },
      path: {
        type: 'string',
        description: 'The file or directory path'
      },
      content: {
        type: 'string',
        description: 'Content to write (for write action). If omitted, creates an empty file.'
      },
      encoding: {
        type: 'string',
        default: 'utf8',
        description: 'File encoding'
      }
    },
    required: ['action', 'path']
  };

  async execute(parameters: Record<string, any>): Promise<any> {
    this.validateParameters(parameters);

    const { action, path: filePath, content, encoding = 'utf8' } = parameters;
    const config = ConfigManager.getInstance().getSecurityConfig();
    const sanitizedPath = this.sanitizePath(filePath, config.allowedDirectories);

    try {
      switch (action) {
        case 'read':
          if (!await fs.pathExists(sanitizedPath)) {
            throw new Error(`File does not exist: ${filePath}`);
          }
          const fileContent = await fs.readFile(sanitizedPath, encoding);
          return {
            success: true,
            content: fileContent,
            size: fileContent.length
          };

        case 'create':
          // 创建空文件
          await fs.ensureDir(path.dirname(sanitizedPath));
          await fs.writeFile(sanitizedPath, '', encoding);
          return {
            success: true,
            message: `Empty file created successfully: ${filePath}`,
            bytesWritten: 0
          };

        case 'write':
          // 如果没有提供content，创建空文件
          const writeContent = content || '';
          await fs.ensureDir(path.dirname(sanitizedPath));
          await fs.writeFile(sanitizedPath, writeContent, encoding);
          const message = content 
            ? `File written successfully: ${filePath}`
            : `Empty file created successfully: ${filePath}`;
          return {
            success: true,
            message: message,
            bytesWritten: writeContent.length
          };

        case 'list':
          if (!await fs.pathExists(sanitizedPath)) {
            throw new Error(`Directory does not exist: ${filePath}`);
          }
          const stat = await fs.stat(sanitizedPath);
          if (!stat.isDirectory()) {
            throw new Error(`Path is not a directory: ${filePath}`);
          }
          const items = await fs.readdir(sanitizedPath);
          const details = await Promise.all(
            items.map(async (item: string) => {
              const itemPath = path.join(sanitizedPath, item);
              const itemStat = await fs.stat(itemPath);
              return {
                name: item,
                type: itemStat.isDirectory() ? 'directory' : 'file',
                size: itemStat.size,
                modified: itemStat.mtime
              };
            })
          );
          return {
            success: true,
            items: details
          };

        case 'exists':
          const exists = await fs.pathExists(sanitizedPath);
          return {
            success: true,
            exists
          };

        case 'delete':
          if (!await fs.pathExists(sanitizedPath)) {
            throw new Error(`Path does not exist: ${filePath}`);
          }
          await fs.remove(sanitizedPath);
          return {
            success: true,
            message: `Deleted successfully: ${filePath}`
          };

        case 'mkdir':
          await fs.ensureDir(sanitizedPath);
          return {
            success: true,
            message: `Directory created: ${filePath}`
          };

        default:
          throw new Error(`Unsupported file action: ${action}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
