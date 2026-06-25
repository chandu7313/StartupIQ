import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import {
  AiProvider,
  AiProviderResponse,
  ChatMessage,
} from './ai-provider.interface';

/**
 * GeminiProvider — Centralized Google Gemini client for VentureForge AI.
 *
 * All agents inject this provider instead of instantiating their own LLM clients.
 * Supports structured JSON output, free-form text, and multi-turn chat.
 *
 * Features:
 * - Configurable model via GEMINI_MODEL env var (defaults to gemini-2.5-flash)
 * - Structured JSON mode with Zod validation
 * - Automatic retry with exponential backoff
 * - Token usage tracking
 */
@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenerativeAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.config.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
    this.logger.log(`[GeminiProvider] Initialized with model: ${this.model}`);
  }

  /**
   * Generate a structured JSON response validated against a Zod schema.
   * Uses Gemini's native JSON response mode for reliable structured output.
   */
  async generateStructuredJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<T>> {
    const startTime = Date.now();
    const maxAttempts = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const currentPrompt =
          attempt > 1
            ? `${prompt}\n\nIMPORTANT: Your previous response was invalid JSON or did not match the required schema. Return ONLY the raw JSON object. No markdown fences, no explanation text. Strictly follow the requested structure.`
            : prompt;

        const model = this.client.getGenerativeModel({ model: this.model });
        const response = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: currentPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: options?.maxTokens || 8192,
            temperature: options?.temperature ?? 0.7,
          },
        });

        const rawText = response.response.text() || '';

        // Parse JSON — handle potential markdown fences
        const jsonMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/) || rawText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch?.[1] || jsonMatch?.[0] || rawText;

        const parsed = JSON.parse(jsonStr);
        const validated = schema.parse(parsed);

        const durationMs = Date.now() - startTime;
        const usage = {
          inputTokens: response.response.usageMetadata?.promptTokenCount || 0,
          outputTokens: response.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.response.usageMetadata?.totalTokenCount || 0,
        };

        this.logger.debug(
          `[GeminiProvider] JSON generation SUCCESS (attempt ${attempt}/${maxAttempts}). ` +
            `Duration: ${durationMs}ms. Tokens: ${usage.totalTokens}`,
        );

        return { data: validated, usage, model: this.model, durationMs };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(
          `[GeminiProvider] JSON generation attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`,
        );

        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 500;
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    throw new Error(
      `[GeminiProvider] All ${maxAttempts} JSON generation attempts failed. Last error: ${lastError?.message}`,
    );
  }

  /**
   * Generate free-form text (summaries, explanations, narratives).
   */
  async generateText(
    prompt: string,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<string>> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options?.maxTokens || 4096,
          temperature: options?.temperature ?? 0.7,
        },
      });

      const text = response.response.text() || '';
      const durationMs = Date.now() - startTime;
      const usage = {
        inputTokens: response.response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.response.usageMetadata?.totalTokenCount || 0,
      };

      this.logger.debug(
        `[GeminiProvider] Text generation SUCCESS. Duration: ${durationMs}ms. Tokens: ${usage.totalTokens}`,
      );

      return { data: text, usage, model: this.model, durationMs };
    } catch (err) {
      this.logger.error(`[GeminiProvider] Text generation failed: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Multi-turn chat conversation.
   */
  async chat(
    messages: ChatMessage[],
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<string>> {
    const startTime = Date.now();

    try {
      // Convert ChatMessage[] to Gemini's content format
      const systemInstruction = messages
        .filter((m) => m.role === 'system')
        .map((m) => m.content)
        .join('\n');

      const history = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
          parts: [{ text: m.content }],
        }));

      // The last message should be sent as the current turn
      const lastMessage = history.pop();

      const generativeModel = this.client.getGenerativeModel({ 
        model: this.model,
        systemInstruction: systemInstruction || undefined,
      });

      const chat = generativeModel.startChat({
        generationConfig: {
          maxOutputTokens: options?.maxTokens || 4096,
          temperature: options?.temperature ?? 0.7,
        },
        history: history.length > 0 ? history : undefined,
      });

      const response = await chat.sendMessage(lastMessage?.parts?.[0]?.text || '');

      const text = response.response.text() || '';
      const durationMs = Date.now() - startTime;
      const usage = {
        inputTokens: response.response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.response.usageMetadata?.totalTokenCount || 0,
      };

      return { data: text, usage, model: this.model, durationMs };
    } catch (err) {
      this.logger.error(`[GeminiProvider] Chat failed: ${(err as Error).message}`);
      throw err;
    }
  }
}
