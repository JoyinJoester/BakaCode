export interface ProviderConfig {
  type: 'ollama' | 'openai';
  baseUrl: string;
  apiKey?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
}

export interface ToolResult {
  id: string;
  result: any;
  error?: string;
}

export interface Tool {
  name: string;
  description: string;
  schema: Record<string, any>;
  execute(parameters: Record<string, any>): Promise<any>;
}

export interface StreamChunk {
  content?: string;
  toolCalls?: ToolCall[];
  done: boolean;
}

export interface CompletionOptions {
  messages: Message[];
  tools?: Tool[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface Provider {
  complete(options: CompletionOptions): Promise<Message>;
  stream(options: CompletionOptions): AsyncIterable<StreamChunk>;
  toolCall(message: Message, tools: Tool[]): Promise<ToolCall[]>;
}

export interface AgentConfig {
  provider: ProviderConfig;
  tools: string[];
  memory: {
    enabled: boolean;
    persistent: boolean;
    maxLength: number;
  };
  security: {
    allowedDirectories: string[];
    blockedCommands: string[];
  };
  system?: {
    promptFile?: string;
    useClaudeStyle?: boolean;
  };
  locale?: string;
}

export interface ConversationContext {
  id: string;
  messages: Message[];
  metadata: {
    created: Date;
    updated: Date;
    provider: string;
    model: string;
  };
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}
