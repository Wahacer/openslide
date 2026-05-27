import type { AIProvider, ChatCompletionOptions, ChatMessage, StreamChunk } from './types';

export class AnthropicProvider implements AIProvider {
  id = 'anthropic';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: { apiKey: string; baseUrl?: string; defaultModel?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://api.anthropic.com';
    this.defaultModel = config.defaultModel ?? 'claude-sonnet-4-20250514';
  }

  async chat(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string> {
    const { system, msgs } = this.splitSystem(messages, options);
    const res = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options?.model ?? this.defaultModel,
        system,
        messages: msgs,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? '';
  }

  async *stream(
    messages: ChatMessage[],
    options?: ChatCompletionOptions,
  ): AsyncIterable<StreamChunk> {
    const { system, msgs } = this.splitSystem(messages, options);
    const res = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options?.model ?? this.defaultModel,
        system,
        messages: msgs,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!res.ok) {
      yield { type: 'error', content: `Anthropic API error ${res.status}` };
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
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'content_block_delta' && event.delta?.text) {
            yield { type: 'text', content: event.delta.text };
          } else if (event.type === 'message_stop') {
            yield { type: 'done', content: '' };
            return;
          }
        } catch {}
      }
    }
    yield { type: 'done', content: '' };
  }

  private splitSystem(messages: ChatMessage[], options?: ChatCompletionOptions) {
    const systemParts: string[] = [];
    if (options?.systemPrompt) systemParts.push(options.systemPrompt);

    const msgs: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemParts.push(msg.content);
      } else {
        msgs.push({ role: msg.role, content: msg.content });
      }
    }

    return {
      system: systemParts.length > 0 ? systemParts.join('\n\n') : undefined,
      msgs,
    };
  }
}
