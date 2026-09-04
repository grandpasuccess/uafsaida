// UAFSAIDA — AI Provider Abstraction
export interface AIProvider {
  name: string;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  stream(prompt: string, options?: GenerateOptions): AsyncGenerator<string>;
  validateConfig(): boolean;
}

export interface GenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

// ═══════════════════════════════════════════════════════════════
// Anthropic Provider
// ═══════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: options?.model || 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens || 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  async *stream(prompt: string, options?: GenerateOptions): AsyncGenerator<string> {
    const stream = await this.client.messages.stream({
      model: options?.model || 'claude-sonnet-4-20250514',
      max_tokens: options?.maxTokens || 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  validateConfig(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }
}

// ═══════════════════════════════════════════════════════════════
// OpenAI Provider
// ═══════════════════════════════════════════════════════════════

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o',
        messages: [
          ...(options?.system ? [{ role: 'system', content: options.system }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: options?.maxTokens || 4000,
        temperature: options?.temperature || 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async *stream(prompt: string, options?: GenerateOptions): AsyncGenerator<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.choices?.[0]?.delta?.content;
            if (text) yield text;
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }

  validateConfig(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }
}

// ═══════════════════════════════════════════════════════════════
// Custom/Local Provider (Ollama, etc.)
// ═══════════════════════════════════════════════════════════════

export class CustomProvider implements AIProvider {
  name = 'custom';
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.CUSTOM_AI_URL || 'http://localhost:11434';
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'llama3',
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response || '';
  }

  async *stream(prompt: string, options?: GenerateOptions): AsyncGenerator<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'llama3',
        prompt,
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) yield data.response;
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  validateConfig(): boolean {
    return !!process.env.CUSTOM_AI_URL;
  }
}

// ═══════════════════════════════════════════════════════════════
// Provider Factory
// ═══════════════════════════════════════════════════════════════

export type ProviderType = 'anthropic' | 'openai' | 'custom';

export function createProvider(type: ProviderType): AIProvider {
  switch (type) {
    case 'anthropic':
      return new AnthropicProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'custom':
      return new CustomProvider();
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

export function getAvailableProviders(): ProviderType[] {
  const providers: ProviderType[] = [];
  
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.CUSTOM_AI_URL) providers.push('custom');
  
  return providers;
}
