#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ChatCommand } from './ChatCommand';
import { RunCommand } from './RunCommand';
import { WebSearchCommand } from './WebSearchCommand';
import { ConfigCommand } from './ConfigCommand';
import { LanguageCommand } from './LanguageCommand';
import { InteractiveUI } from './InteractiveUI';
import { Logger } from '../utils';
import { I18n } from '../i18n/I18n';
import { ConfigManager } from '../config/ConfigManager';

const program = new Command();

program
  .name('bakacode')
  .alias('bakac')
  .description('BakaCode - A powerful Node.js CLI AI Agent')
  .version('1.0.0')
  .option('-l, --language <locale>', 'Set interface language (en, zh-CN, zh-TW, ja, ko)', '')
  .hook('preAction', (thisCommand, actionCommand) => {
    // Handle global language option
    const options = thisCommand.opts();
    if (options.language) {
      const configManager = ConfigManager.getInstance();
      configManager.setLocale(options.language);
      console.log(`Language set to: ${options.language}`);
    }
  });

// Initialize i18n after potential language change
const configManager = ConfigManager.getInstance();
const i18n = I18n.getInstance(configManager.getLocale());

// Update description with i18n
program.description(i18n.t('cli.app_description'));

// Register commands
ChatCommand.register(program);
RunCommand.register(program);
WebSearchCommand.register(program);
ConfigCommand.register(program);
LanguageCommand.register(program);

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  const logger = Logger.getInstance();
  logger.error(i18n.t('errors.unhandled_rejection'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  const logger = Logger.getInstance();
  logger.error(i18n.t('errors.uncaught_exception'), error.message);
  process.exit(1);
});

// Check if we should show interactive UI or process direct chat input
const args = process.argv.slice(2);
const hasCommand = args.some(arg => 
  !arg.startsWith('-') && 
  ['chat', 'run', 'websearch', 'config', 'lang', 'language', 'help'].includes(arg)
);

const shouldShowInteractiveUI = args.length === 0 || 
  (!hasCommand && args.length === 2 && (args[0] === '-l' || args[0] === '--language'));

// Check for direct chat input (non-flag arguments that aren't commands)
// Only treat as chat input if there's no primary command
const chatInput = !hasCommand ? args.filter(arg => !arg.startsWith('-')).join(' ') : '';

if (shouldShowInteractiveUI) {
  // Handle language flag if present
  if (args.length === 2) {
    const configManager = ConfigManager.getInstance();
    configManager.setLocale(args[1]);
  }
  
  const ui = new InteractiveUI();
  ui.start().catch((error: any) => {
    const logger = Logger.getInstance();
    logger.error('Failed to start interactive UI:', error);
    process.exit(1);
  });
} else if (chatInput.trim() && !hasCommand) {
  // Process direct chat input
  import('./ChatCommand').then(({ ChatCommand }) => {
    // Create agent and process input directly
    import('../agent').then(({ Agent }) => {
      const agent = new Agent();
      agent.startNewConversation()
        .then(() => agent.sendMessage(chatInput))
        .then((response) => {
          console.log(chalk.blue('🤖 BakaCode:'));
          console.log(response.content);
        })
        .catch((error: any) => {
          const logger = Logger.getInstance();
          logger.error('Failed to process chat input:', error);
          process.exit(1);
        });
    });
  });
} else {
  // Parse command line arguments normally
  program.parse();
}
