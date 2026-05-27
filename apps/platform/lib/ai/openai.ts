import type { AIProvider, ChatCompletionOptions, ChatMessage, StreamChunk } from './types';

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: { apiKey: string; baseUrl?: string; defaultModel?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
    this.defaultModel = config.defaultModel ?? 'gpt-4o';
  }

  async chat(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string> {
    const body = this.buildBody(messages, options);
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content ?? '';
  }

  async *stream(
    messages: ChatMessage[],
    options?: ChatCompletionOptions,
  ): AsyncIterable<StreamChunk> {
    const body = this.buildBody(messages, options, true);
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      yield { type: 'error', content: `OpenAI API error ${res.status}` };
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      yield { type: 'error', content: 'No response body' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') {
          yield { type: 'done', content: '' };
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield { type: 'text', content };
        } catch {}
      }
    }
    yield { type: 'done', content: '' };
  }

  private buildBody(
    messages: ChatMessage[],
    options?: ChatCompletionOptions,
    stream = false,
  ) {
    const model = options?.model ?? this.defaultModel;
    const allMessages = options?.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...messages]
      : messages;

    return {
      model,
      messages: allMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      stream,
    };
  }
}