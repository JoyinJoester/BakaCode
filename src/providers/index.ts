import { ProviderConfig } from '../types';
import { OllamaProvider } from './OllamaProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { BaseProvider } from './BaseProvider';

export class ProviderFactory {
  static createProvider(config: ProviderConfig): BaseProvider {
    switch (config.type) {
      case 'ollama':
        return new OllamaProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${config.type}`);
    }
  }
}

export { BaseProvider, OllamaProvider, OpenAIProvider };
