import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Agent } from '../agent';
import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils';
import { I18n } from '../i18n/I18n';

export class ChatCommand {
  public static register(program: Command): void {
    const i18n = I18n.getInstance();
    
    program
      .command('chat [message...]')
      .description(i18n.t('cli.chat_description'))
      .option('-m, --model <model>', 'Model to use')
      .option('-p, --provider <provider>', 'Provider to use (ollama|openai)')
      .option('-c, --conversation <id>', 'Continue existing conversation')
      .option('--no-stream', 'Disable streaming output')
      .option('--max-tokens <number>', 'Maximum tokens for response')
      .option('--temperature <number>', 'Temperature for response generation')
      .action(async (messageArgs, options) => {
        const message = messageArgs?.join(' ') || '';
        await this.execute(options, message);
      });
  }

  private static async execute(options: any, directMessage?: string): Promise<void> {
    const logger = Logger.getInstance();
    const config = ConfigManager.getInstance();

    try {
      // Update config with CLI options
      if (options.provider || options.model) {
        const providerConfig = config.getProviderConfig();
        config.setProvider({
          ...providerConfig,
          type: options.provider || providerConfig.type,
          model: options.model || providerConfig.model,
          maxTokens: options.maxTokens ? parseInt(options.maxTokens) : providerConfig.maxTokens,
          temperature: options.temperature ? parseFloat(options.temperature) : providerConfig.temperature
        });
      }

      const agent = new Agent();
      
      // Load or start conversation
      if (options.conversation) {
        await agent.loadConversation(options.conversation);
        logger.info(`Loaded conversation: ${options.conversation}`);
      } else {
        const conversationId = await agent.startNewConversation();
        logger.info(`Started new conversation: ${conversationId}`);
      }

      // If direct message is provided, process it and exit
      if (directMessage && directMessage.trim()) {
        try {
          console.log(chalk.blue('🤖 BakaCode:'));
          
          if (options.stream !== false) {
            // Streaming response
            for await (const chunk of agent.streamMessage(directMessage.trim())) {
              if (chunk.content) {
                process.stdout.write(chunk.content);
              }
              if (chunk.done) {
                console.log('\n');
                break;
              }
            }
          } else {
            // Non-streaming response
            const response = await agent.sendMessage(directMessage.trim());
            console.log(response.content);
          }
        } catch (error: any) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
        return; // Exit after processing direct message
      }

      // Interactive chat mode
      logger.info('Chat session started. Type "exit" to quit, "help" for commands.');
      logger.info(`Using ${config.getProviderConfig().type} with model ${config.getProviderConfig().model}`);

      // Interactive chat loop
      while (true) {
        const { message } = await inquirer.prompt([
          {
            type: 'input',
            name: 'message',
            message: chalk.blue('You:'),
            validate: (input) => input.trim().length > 0 || 'Please enter a message'
          }
        ]);

        const trimmedMessage = message.trim();

        if (trimmedMessage === 'exit') {
          break;
        }

        if (trimmedMessage === 'help') {
          this.showHelp();
          continue;
        }

        if (trimmedMessage === 'clear') {
          console.clear();
          continue;
        }

        if (trimmedMessage.startsWith('/conversations')) {
          await this.handleConversationsCommand(agent, trimmedMessage);
          continue;
        }

        try {
          console.log(chalk.green('\nAssistant:'));
          
          if (options.stream !== false) {
            // Streaming response
            let responseContent = '';
            for await (const chunk of agent.streamMessage(trimmedMessage)) {
              if (chunk.content) {
                process.stdout.write(chunk.content);
                responseContent += chunk.content;
              }
              if (chunk.done) {
                console.log('\n');
                break;
              }
            }
          } else {
            // Non-streaming response
            const response = await agent.sendMessage(trimmedMessage);
            console.log(response.content);
          }
        } catch (error: any) {
          console.error(chalk.red('Error:'), error.message);
        }
      }

      logger.info('Chat session ended.');
    } catch (error: any) {
      logger.error('Failed to start chat session:', error.message);
      process.exit(1);
    }
  }

  private static showHelp(): void {
    console.log(chalk.yellow('\nAvailable commands:'));
    console.log('  help - Show this help message');
    console.log('  exit - Exit the chat session');
    console.log('  clear - Clear the screen');
    console.log('  /conversations list - List all conversations');
    console.log('  /conversations delete <id> - Delete a conversation');
    console.log('  /conversations switch <id> - Switch to a conversation');
    console.log('');
  }

  private static async handleConversationsCommand(agent: Agent, command: string): Promise<void> {
    const parts = command.split(' ');
    
    if (parts.length < 2) {
      console.log(chalk.yellow('Usage: /conversations <list|delete|switch> [id]'));
      return;
    }

    const action = parts[1];

    try {
      switch (action) {
        case 'list':
          const conversations = await agent.listConversations();
          if (conversations.length === 0) {
            console.log(chalk.yellow('No conversations found.'));
          } else {
            console.log(chalk.blue('\nConversations:'));
            conversations.forEach((conv) => {
              const current = conv.id === agent.getCurrentConversationId() ? chalk.green('(current)') : '';
              console.log(`  ${conv.id} - ${conv.metadata.provider}/${conv.metadata.model} - ${conv.metadata.updated.toLocaleString()} ${current}`);
            });
          }
          break;

        case 'delete':
          if (parts.length < 3) {
            console.log(chalk.red('Usage: /conversations delete <id>'));
            return;
          }
          await agent.deleteConversation(parts[2]);
          console.log(chalk.green(`Deleted conversation: ${parts[2]}`));
          break;

        case 'switch':
          if (parts.length < 3) {
            console.log(chalk.red('Usage: /conversations switch <id>'));
            return;
          }
          await agent.loadConversation(parts[2]);
          console.log(chalk.green(`Switched to conversation: ${parts[2]}`));
          break;

        default:
          console.log(chalk.red(`Unknown action: ${action}`));
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
    }
  }
}
