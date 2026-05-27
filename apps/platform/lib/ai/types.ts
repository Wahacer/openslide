export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatCompletionOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

export type StreamChunk = {
  type: 'text' | 'done' | 'error';
  content: string;
};

export interface AIProvider {
  id: string;
  chat(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string>;
  stream(
    messages: ChatMessage[],
    options?: ChatCompletionOptions,
  ): AsyncIterable<StreamChunk>;
}

export type AIConfig = {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
};
