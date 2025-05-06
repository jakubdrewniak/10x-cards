import { OPENROUTER_API_KEY, OPENROUTER_API_URL, OPENROUTER_DEFAULT_MODEL } from "astro:env/server";

// Schema for flashcard generation
export const FLASHCARD_GENERATION_SCHEMA: JsonSchemaValue = {
  type: "array",
  items: {
    type: "object",
    properties: {
      front: { type: "string" },
      back: { type: "string" },
      source: { type: "string", enum: ["ai-full"] },
    },
    required: ["front", "back", "source"],
  },
};

// Types for OpenRouter service
interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  [key: string]: number | undefined;
}

interface JsonSchemaValue {
  type: string;
  properties?: Record<string, JsonSchemaValue>;
  items?: JsonSchemaValue;
  required?: string[];
  [key: string]: unknown;
}

interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterPayload {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: {
    type: string;
    schema: JsonSchemaValue;
  };
  [key: string]: unknown;
}

interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: JsonSchemaValue;
  };
}

interface OpenRouterConfig {
  apiKey: string;
  apiUrl: string;
  defaultModelName: string;
  defaultModelParameters?: ModelParameters;
  systemMessage?: string;
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly defaultModelName: string;
  private readonly defaultModelParameters: ModelParameters;
  private systemMessage: string;
  private userMessage: string | null = null;
  private responseFormat: ResponseFormat | null = null;
  private currentModelName: string;
  private currentModelParameters: ModelParameters;
  private readonly retryCount: number = 3;
  private readonly timeout: number = 30000;
  private readonly errorLog: Error[] = [];

  constructor(config?: Partial<OpenRouterConfig>) {
    // Initialize service with config or environment variables
    this.apiKey = config?.apiKey ?? OPENROUTER_API_KEY;
    this.apiUrl = config?.apiUrl ?? OPENROUTER_API_URL;
    this.defaultModelName = config?.defaultModelName ?? OPENROUTER_DEFAULT_MODEL;
    this.defaultModelParameters = config?.defaultModelParameters ?? {
      temperature: 0.7,
      max_tokens: 1024,
    };
    this.systemMessage = config?.systemMessage ?? "You are a helpful assistant.";
    this.currentModelName = this.defaultModelName;
    this.currentModelParameters = { ...this.defaultModelParameters };
  }

  // Public methods for message handling
  public setSystemMessage(message: string): void {
    if (!message.trim()) {
      throw new Error("System message cannot be empty");
    }
    this.systemMessage = message;
  }

  public setUserMessage(message: string): void {
    if (!message.trim()) {
      throw new Error("User message cannot be empty");
    }
    this.userMessage = message;
  }

  // Public methods for model configuration
  public setResponseFormat(format: ResponseFormat): void {
    if (!format.json_schema?.schema) {
      throw new Error("Invalid response format: missing JSON schema");
    }
    this.responseFormat = format;
  }

  public setModelParameters(parameters: Partial<ModelParameters>): void {
    this.currentModelParameters = {
      ...this.defaultModelParameters,
      ...parameters,
    };
  }

  public setModelName(modelName: string): void {
    if (!modelName.trim()) {
      throw new Error("Model name cannot be empty");
    }
    this.currentModelName = modelName;
  }

  // Private method to validate API configuration
  private validateApiConfig(): void {
    if (!this.apiKey || !this.apiUrl || !this.defaultModelName) {
      throw new Error("Invalid API configuration. Required fields: apiKey, apiUrl, defaultModelName");
    }
  }

  // Core chat method
  public async sendChat<T = unknown>(): Promise<T> {
    this.validateApiConfig();

    if (!this.userMessage) {
      throw new Error("User message is required before sending chat");
    }

    const payload = this.preparePayload();

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API request failed: ${error}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      this.logError(error as Error);
      throw error;
    }
  }

  // Helper method to prepare API payload
  private preparePayload(): OpenRouterPayload {
    const messages = [
      { role: "system", content: this.systemMessage },
      { role: "user", content: this.userMessage },
    ];

    const payload: OpenRouterPayload = {
      model: this.currentModelName,
      messages,
      ...this.currentModelParameters,
    };

    if (this.responseFormat) {
      payload.response_format = {
        type: "json_schema",
        schema: this.responseFormat.json_schema.schema,
      };
    }

    return payload;
  }

  // Simple error logging
  private logError(error: Error): void {
    this.errorLog.push(error);
    console.error("[OpenRouterService Error]:", error.message);
  }
}
