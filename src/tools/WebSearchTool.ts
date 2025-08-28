import axios from 'axios';
import { BaseTool } from './BaseTool';
import { SearchResult } from '../types';

export class WebSearchTool extends BaseTool {
  public name = 'websearch';
  public description = 'Search the web using Bing Search API';
  public schema = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query'
      },
      count: {
        type: 'number',
        default: 10,
        minimum: 1,
        maximum: 50,
        description: 'Number of search results to return'
      },
      market: {
        type: 'string',
        default: 'en-US',
        description: 'Market for search results'
      },
      safeSearch: {
        type: 'string',
        enum: ['Off', 'Moderate', 'Strict'],
        default: 'Moderate',
        description: 'Safe search setting'
      }
    },
    required: ['query']
  };

  async execute(parameters: Record<string, any>): Promise<any> {
    this.validateParameters(parameters);

    const { query, count = 10, market = 'en-US', safeSearch = 'Moderate' } = parameters;
    const apiKey = process.env.BING_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: 'Bing API key is not configured. Please set BING_API_KEY environment variable.'
      };
    }

    try {
      const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'User-Agent': 'BakaCode-Agent/1.0'
        },
        params: {
          q: query,
          count,
          mkt: market,
          safeSearch,
          textDecorations: false,
          textFormat: 'Raw'
        },
        timeout: 10000
      });

      const searchData = response.data;
      const results: SearchResult[] = [];

      // Process web pages
      if (searchData.webPages?.value) {
        for (const page of searchData.webPages.value) {
          results.push({
            title: page.name,
            url: page.url,
            snippet: page.snippet || '',
            source: 'web'
          });
        }
      }

      // Process news results
      if (searchData.news?.value) {
        for (const news of searchData.news.value) {
          results.push({
            title: news.name,
            url: news.url,
            snippet: news.description || '',
            source: 'news'
          });
        }
      }

      // Process related searches
      const relatedSearches = searchData.relatedSearches?.value?.map((rs: any) => rs.text) || [];

      return {
        success: true,
        query,
        totalResults: searchData.webPages?.totalEstimatedMatches || 0,
        results,
        relatedSearches,
        searchTime: new Date().toISOString()
      };
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          error: `Bing API error: ${error.response.status} ${error.response.statusText}`,
          details: error.response.data
        };
      } else {
        return {
          success: false,
          error: `Search failed: ${error.message}`
        };
      }
    }
  }

  // Helper method to summarize search results
  public summarizeResults(results: SearchResult[], maxResults: number = 5): string {
    if (!results || results.length === 0) {
      return 'No search results found.';
    }

    const topResults = results.slice(0, maxResults);
    let summary = `Found ${results.length} search results. Here are the top ${topResults.length}:\n\n`;

    topResults.forEach((result, index) => {
      summary += `${index + 1}. **${result.title}**\n`;
      summary += `   URL: ${result.url}\n`;
      summary += `   ${result.snippet}\n`;
      summary += `   Source: ${result.source}\n\n`;
    });

    return summary;
  }
}
