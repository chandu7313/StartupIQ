import { z } from 'zod';

// ============================================================
// AI Provider Abstraction Layer — VentureForge AI
// Allows swapping LLM providers without modifying agent code.
// ============================================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiProviderUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiProviderResponse<T = string> {
  data: T;
  usage: AiProviderUsage;
  model: string;
  durationMs: number;
}

/**
 * AiProvider — Contract for any LLM integration.
 * Agents inject this interface so the underlying model can be
 * replaced (Gemini → Claude → Llama) without code changes.
 */
export interface AiProvider {
  /**
   * Generate a structured JSON response validated against a Zod schema.
   * Uses the LLM's native JSON mode when available.
   */
  generateStructuredJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<T>>;

  /**
   * Generate free-form text (for explanations, summaries, narratives).
   */
  generateText(
    prompt: string,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<string>>;

  /**
   * Multi-turn chat conversation.
   */
  chat(
    messages: ChatMessage[],
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<AiProviderResponse<string>>;
}

/**
 * Search result from a real-time search provider (Tavily, Serper, etc.)
 */
export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

/**
 * SearchProvider — Contract for real-time web search integration.
 */
export interface SearchProvider {
  search(query: string, options?: { maxResults?: number; searchDepth?: 'basic' | 'advanced'; topic?: 'general' | 'news' }): Promise<SearchResult[]>;
}
