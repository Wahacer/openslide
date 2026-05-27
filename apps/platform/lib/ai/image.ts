export type ImageGenerationOptions = {
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
  n?: number;
};

export type ImageGenerationResult = {
  url: string;
  revisedPrompt?: string;
};

export interface ImageProvider {
  id: string;
  generate(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>;
}

export class OpenAIImageProvider implements ImageProvider {
  id = 'openai-image';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: { apiKey: string; baseUrl?: string; model?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-image-1';
  }

  async generate(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const res = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        n: options?.n || 1,
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        style: options?.style || 'natural',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Image generation failed: ${(err as { error?: { message?: string } }).error?.message || res.statusText}`,
      );
    }

    const data = await res.json();
    return {
      url: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
    };
  }
}
