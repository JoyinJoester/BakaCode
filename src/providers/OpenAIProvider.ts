import axios from 'axios';
import { BaseProvider } from './BaseProvider';
import { CompletionOptions, Message, StreamChunk, ToolCall, Tool, ProviderConfig } from '../types';

export class OpenAIProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model;

    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  async complete(options: CompletionOptions): Promise<Message> {
    const { messages, tools, maxTokens, temperature } = options;

    const payload: any = {
      model: this.model,
      messages: this.formatMessages(messages),
      max_tokens: maxTokens || this.config.maxTokens,
      temperature: temperature || this.config.temperature
    };

    if (tools && tools.length > 0) {
      payload.tools = this.formatTools(tools);
      payload.tool_choice = 'auto';
    }

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const choice = response.data.choices[0];
      const messageContent = choice.message.content || '';
      const toolCalls = this.parseToolCalls(choice.message.tool_calls);

      return {
        id: this.generateMessageId(),
        role: 'assistant',
        content: messageContent,
        timestamp: new Date(),
        toolCalls
      };
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async *stream(options: CompletionOptions): AsyncIterable<StreamChunk> {
    const { messages, tools, maxTokens, temperature } = options;

    const payload: any = {
      model: this.model,
      messages: this.formatMessages(messages),
      max_tokens: maxTokens || this.config.maxTokens,
      temperature: temperature || this.config.temperature,
      stream: true
    };

    if (tools && tools.length > 0) {
      payload.tools = this.formatTools(tools);
      payload.tool_choice = 'auto';
    }

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              yield { done: true };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0]?.delta;
              
              if (delta) {
                const content = delta.content || '';
                const toolCalls = this.parseToolCalls(delta.tool_calls);
                
                yield {
                  content,
                  toolCalls,
                  done: false
                };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`OpenAI streaming error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async toolCall(message: Message, tools: Tool[]): Promise<ToolCall[]> {
    if (!message.toolCalls || message.toolCalls.length === 0) {
      return [];
    }

    return message.toolCalls;
  }

  private parseToolCalls(toolCalls: any[]): ToolCall[] | undefined {
    if (!toolCalls || !Array.isArray(toolCalls)) {
      return undefined;
    }

    return toolCalls.map(call => ({
      id: call.id || `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: call.function?.name,
      parameters: typeof call.function?.arguments === 'string' 
        ? JSON.parse(call.function.arguments) 
        : call.function?.arguments || {}
    }));
  }
}
