import { Tool } from '../types';

export abstract class BaseTool implements Tool {
  public abstract name: string;
  public abstract description: string;
  public abstract schema: Record<string, any>;

  abstract execute(parameters: Record<string, any>): Promise<any>;

  protected validateParameters(parameters: Record<string, any>): void {
    // Basic validation - could be enhanced with Joi schema validation
    const requiredProps = this.schema.required || [];
    for (const prop of requiredProps) {
      if (!(prop in parameters)) {
        throw new Error(`Missing required parameter: ${prop}`);
      }
    }
  }

  protected sanitizePath(filePath: string, allowedDirectories: string[]): string {
    const path = require('path');
    const resolvedPath = path.resolve(filePath);
    
    const isAllowed = allowedDirectories.some(dir => {
      const allowedPath = path.resolve(dir);
      return resolvedPath.startsWith(allowedPath);
    });

    if (!isAllowed) {
      throw new Error(`Access denied: Path ${filePath} is not in allowed directories`);
    }

    return resolvedPath;
  }

  protected isCommandBlocked(command: string, blockedCommands: string[]): boolean {
    const cmd = command.toLowerCase().trim();
    return blockedCommands.some(blocked => 
      cmd.startsWith(blocked.toLowerCase()) || 
      cmd.includes(` ${blocked.toLowerCase()}`)
    );
  }
}
