import type { AIConfig, AIProvider } from './types';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';

export type { AIProvider, ChatMessage, ChatCompletionOptions, StreamChunk, AIConfig } from './types';

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;

  const provider = process.env.AI_PROVIDER ?? 'openai';
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error('AI_API_KEY environment variable is required');
  }

  const config: AIConfig = {
    provider: provider as AIConfig['provider'],
    apiKey,
    baseUrl: process.env.AI_BASE_URL || undefined,
    defaultModel: process.env.AI_MODEL || undefined,
  };

  _provider = createProvider(config);
  return _provider;
}

export function createProvider(config: AIConfig): AIProvider {
  switch (config.provider) {
    case 'anthropic':
      return new AnthropicProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        defaultModel: config.defaultModel,
      });
    case 'openai':
    default:
      return new OpenAIProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        defaultModel: config.defaultModel,
      });
  }
}
