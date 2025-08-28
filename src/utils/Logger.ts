import chalk from 'chalk';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private static instance: Logger;
  private level: LogLevel;

  private constructor() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    this.level = LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(chalk.red('[ERROR]'), message, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(chalk.yellow('[WARN]'), message, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.info(chalk.blue('[INFO]'), message, ...args);
    }
  }

  public debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(chalk.gray('[DEBUG]'), message, ...args);
    }
  }

  public success(message: string, ...args: any[]): void {
    console.log(chalk.green('[SUCCESS]'), message, ...args);
  }
}
