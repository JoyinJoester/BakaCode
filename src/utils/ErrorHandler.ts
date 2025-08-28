export class ErrorHandler {
  public static handle(error: any, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    
    if (error instanceof Error) {
      console.error(`${timestamp} ${contextStr}Error: ${error.message}`);
      if (error.stack && process.env.NODE_ENV === 'development') {
        console.error('Stack trace:', error.stack);
      }
    } else if (typeof error === 'string') {
      console.error(`${timestamp} ${contextStr}Error: ${error}`);
    } else {
      console.error(`${timestamp} ${contextStr}Error:`, error);
    }
  }

  public static createError(message: string, cause?: Error): Error {
    const error = new Error(message);
    if (cause) {
      (error as any).cause = cause;
    }
    return error;
  }

  public static async safeExecute<T>(
    fn: () => Promise<T>,
    fallback: T,
    context?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      ErrorHandler.handle(error, context);
      return fallback;
    }
  }

  public static safeExecuteSync<T>(
    fn: () => T,
    fallback: T,
    context?: string
  ): T {
    try {
      return fn();
    } catch (error) {
      ErrorHandler.handle(error, context);
      return fallback;
    }
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ProviderError extends Error {
  constructor(message: string, public provider?: string) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ToolError extends Error {
  constructor(message: string, public tool?: string) {
    super(message);
    this.name = 'ToolError';
  }
}
