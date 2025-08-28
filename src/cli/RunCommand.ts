import { Command } from 'commander';
import { Agent } from '../agent';
import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils';
import { I18n } from '../i18n/I18n';

export class RunCommand {
  public static register(program: Command): void {
    const i18n = I18n.getInstance();
    
    program
      .command('run')
      .description(i18n.t('cli.run_description'))
      .option('-t, --task <task>', 'Task description to execute')
      .option('-m, --model <model>', 'Model to use')
      .option('-p, --provider <provider>', 'Provider to use (ollama|openai)')
      .option('--no-stream', 'Disable streaming output')
      .option('--max-tokens <number>', 'Maximum tokens for response')
      .option('--temperature <number>', 'Temperature for response generation')
      .action(async (options) => {
        await this.execute(options);
      });
  }

  private static async execute(options: any): Promise<void> {
    const logger = Logger.getInstance();
    const config = ConfigManager.getInstance();

    if (!options.task) {
      logger.error('Task description is required. Use --task option.');
      process.exit(1);
    }

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
      const conversationId = await agent.startNewConversation();
      
      logger.info(`Executing task: ${options.task}`);
      logger.info(`Using ${config.getProviderConfig().type} with model ${config.getProviderConfig().model}`);

      if (options.stream !== false) {
        // Streaming response
        for await (const chunk of agent.streamMessage(options.task)) {
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
        const response = await agent.sendMessage(options.task);
        console.log(response.content);
      }

      logger.success('Task completed successfully.');
    } catch (error: any) {
      logger.error('Failed to execute task:', error.message);
      process.exit(1);
    }
  }
}
