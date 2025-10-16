// OpenRouter Client for AI API Integration
export interface OpenRouterConfig {
  apiKey: string;
  appName?: string;
  siteUrl?: string;
  model?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  model?: string;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private config: OpenRouterConfig;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(config: OpenRouterConfig) {
    this.config = {
      model: 'openai/gpt-4o-mini', // Default cost-effective model
      ...config
    };
  }

  async createChatCompletion(
    messages: ChatMessage[], 
    options?: ChatCompletionOptions
  ): Promise<OpenRouterResponse> {
    const requestBody = {
      model: options?.model || this.config.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 3000,
      top_p: options?.top_p,
      frequency_penalty: options?.frequency_penalty,
      presence_penalty: options?.presence_penalty,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.config.siteUrl || '',
        'X-Title': this.config.appName || 'WON Workout Generator',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  async listModels(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    return response.json();
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.createChatCompletion([
        {
          role: 'user',
          content: 'Hello, respond with just "OK" to test the connection.'
        }
      ], {
        max_tokens: 10,
        temperature: 0
      });

      return response.choices?.[0]?.message?.content?.includes('OK') || false;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
let openRouterInstance: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient | null {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('OPENROUTER_API_KEY not found in environment variables');
    return null;
  }

  if (!openRouterInstance) {
    openRouterInstance = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY,
      appName: process.env.OPENROUTER_APP_NAME,
      siteUrl: process.env.OPENROUTER_SITE_URL,
      model: 'openai/gpt-4o-mini', // Default model
    });
  }

  return openRouterInstance;
}