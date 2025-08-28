import axios from 'axios';
import { BaseProvider } from './BaseProvider';
import { CompletionOptions, Message, StreamChunk, ToolCall, Tool, ProviderConfig } from '../types';

export class OllamaProvider extends BaseProvider {
  private baseUrl: string;
  private model: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl;
    this.model = config.model;
  }

  async complete(options: CompletionOptions): Promise<Message> {
    const { messages, tools, maxTokens, temperature } = options;

    const payload: any = {
      model: this.model,
      messages: this.formatMessages(messages),
      stream: false,
      options: {
        num_predict: maxTokens || this.config.maxTokens,
        temperature: temperature || this.config.temperature
      }
    };

    // Add tools if provided
    if (tools && tools.length > 0) {
      payload.tools = this.formatTools(tools);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/chat`, payload);
      
      const messageContent = response.data.message?.content || '';
      const toolCalls = this.parseToolCalls(response.data.message?.tool_calls);

      return {
        id: this.generateMessageId(),
        role: 'assistant',
        content: messageContent,
        timestamp: new Date(),
        toolCalls
      };
    } catch (error: any) {
      throw new Error(`Ollama API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async *stream(options: CompletionOptions): AsyncIterable<StreamChunk> {
    const { messages, tools, maxTokens, temperature } = options;

    const payload: any = {
      model: this.model,
      messages: this.formatMessages(messages),
      stream: true,
      options: {
        num_predict: maxTokens || this.config.maxTokens,
        temperature: temperature || this.config.temperature
      }
    };

    if (tools && tools.length > 0) {
      payload.tools = this.formatTools(tools);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/chat`, payload, {
        responseType: 'stream'
      });

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              const content = data.message?.content || '';
              const toolCalls = this.parseToolCalls(data.message?.tool_calls);
              const done = data.done || false;

              yield {
                content,
                toolCalls,
                done
              };

              if (done) return;
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Ollama streaming error: ${error.response?.data?.error || error.message}`);
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
      name: call.function?.name || call.name,
      parameters: call.function?.arguments || call.arguments || {}
    }));
  }
}
