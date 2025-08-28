import { Command } from 'commander';
import { Agent } from '../agent';
import { WebSearchTool } from '../tools/WebSearchTool';
import { Logger } from '../utils';
import { I18n } from '../i18n/I18n';

export class WebSearchCommand {
  public static register(program: Command): void {
    const i18n = I18n.getInstance();
    
    program
      .command('websearch')
      .description(i18n.t('cli.websearch_description'))
      .argument('<query>', 'Search query')
      .option('-c, --count <number>', 'Number of results to return', '10')
      .option('-m, --market <market>', 'Market for search results', 'en-US')
      .option('--safe-search <level>', 'Safe search setting (Off|Moderate|Strict)', 'Moderate')
      .option('--summarize', 'Use AI to summarize search results')
      .action(async (query, options) => {
        await this.execute(query, options);
      });
  }

  private static async execute(query: string, options: any): Promise<void> {
    const logger = Logger.getInstance();

    if (!process.env.BING_API_KEY) {
      logger.error('Bing API key is not configured. Please set BING_API_KEY environment variable.');
      process.exit(1);
    }

    try {
      const webSearchTool = new WebSearchTool();
      
      logger.info(`Searching for: ${query}`);
      
      const result = await webSearchTool.execute({
        query,
        count: parseInt(options.count),
        market: options.market,
        safeSearch: options.safeSearch
      });

      if (!result.success) {
        logger.error('Search failed:', result.error);
        process.exit(1);
      }

      if (options.summarize) {
        // Use AI to summarize results
        const agent = new Agent();
        await agent.startNewConversation();
        
        const searchSummary = webSearchTool.summarizeResults(result.results, 10);
        const prompt = `Based on the following search results for "${query}", provide a comprehensive summary:\n\n${searchSummary}`;
        
        logger.info('Generating AI summary...');
        console.log('\n--- AI Summary ---\n');
        
        for await (const chunk of agent.streamMessage(prompt)) {
          if (chunk.content) {
            process.stdout.write(chunk.content);
          }
          if (chunk.done) {
            console.log('\n');
            break;
          }
        }
      } else {
        // Display raw results
        console.log(`\nFound ${result.totalResults} results for "${query}":\n`);
        
        result.results.forEach((searchResult: any, index: number) => {
          console.log(`${index + 1}. ${searchResult.title}`);
          console.log(`   ${searchResult.url}`);
          console.log(`   ${searchResult.snippet}`);
          console.log(`   Source: ${searchResult.source}\n`);
        });

        if (result.relatedSearches && result.relatedSearches.length > 0) {
          console.log('Related searches:');
          result.relatedSearches.forEach((related: string) => {
            console.log(`  - ${related}`);
          });
          console.log('');
        }
      }

      logger.success('Search completed successfully.');
    } catch (error: any) {
      logger.error('Search failed:', error.message);
      process.exit(1);
    }
  }
}
