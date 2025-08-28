import { Provider, CompletionOptions, Message, StreamChunk, ToolCall, Tool } from '../types';

export abstract class BaseProvider implements Provider {
  protected config: any;

  constructor(config: any) {
    this.config = config;
  }

  abstract complete(options: CompletionOptions): Promise<Message>;
  abstract stream(options: CompletionOptions): AsyncIterable<StreamChunk>;
  abstract toolCall(message: Message, tools: Tool[]): Promise<ToolCall[]>;

  protected generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected formatMessages(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  protected formatTools(tools?: Tool[]): any[] {
    if (!tools || tools.length === 0) return [];
    
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema
      }
    }));
  }
}
