import { AnthropicProvider } from './anthropic';
import { OpenAIImageProvider } from './image';
import { OpenAIProvider } from './openai';
import type { AIConfig, AIProvider } from './types';

export type { ImageGenerationOptions, ImageGenerationResult, ImageProvider } from './image';
export type {
  AIConfig,
  AIProvider,
  ChatCompletionOptions,
  ChatMessage,
  StreamChunk,
} from './types';

let _provider: AIProvider | null = null;
let _imageProvider: OpenAIImageProvider | null = null;

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

export function getImageProvider(): OpenAIImageProvider {
  if (_imageProvider) return _imageProvider;

  const apiKey = process.env.IMAGE_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('IMAGE_API_KEY or AI_API_KEY environment variable is required');
  }

  _imageProvider = new OpenAIImageProvider({
    apiKey,
    baseUrl: process.env.IMAGE_API_BASE_URL || process.env.AI_BASE_URL || undefined,
    model: process.env.IMAGE_MODEL || 'gpt-image-1',
  });

  return _imageProvider;
}

export function createProvider(config: AIConfig): AIProvider {
  switch (config.provider) {
    case 'anthropic':
      return new AnthropicProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        defaultModel: config.defaultModel,
      });
    default:
      return new OpenAIProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        defaultModel: config.defaultModel,
      });
  }
}
