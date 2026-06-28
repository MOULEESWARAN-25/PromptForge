/**
 * Cost, Rate, and Context Limits Configuration for the Backend
 * ─────────────────────────────────────────────────────────────────
 * All limits are derived from environment variables with safe defaults.
 * No inline constant for these values is permitted in components or services.
 */

export const LIMITS = {
  /**
   * Maximum number of LLM API calls allowed per single client request.
   */
  MAX_LLM_CALLS_PER_REQUEST: parseInt(process.env.MAX_LLM_CALLS_PER_REQUEST || '3', 10),

  /**
   * Maximum number of vector embedding searches per request.
   */
  MAX_EMBEDDINGS_PER_REQUEST: parseInt(process.env.MAX_EMBEDDINGS_PER_REQUEST || '5', 10),

  /**
   * Maximum number of retry attempts on LLM timeout or 5xx before escalating to fallback.
   */
  MAX_RETRIES_PER_LLM_TIMEOUT: parseInt(process.env.MAX_RETRIES_PER_LLM_TIMEOUT || '2', 10),

  /**
   * Maximum token budget for the full assembled context payload (hard cap: 3500).
   */
  MAX_CONTEXT_SIZE: Math.min(
    parseInt(process.env.MAX_CONTEXT_SIZE || '3500', 10),
    3500,
  ),

  /**
   * Maximum estimated cost per request in USD.
   */
  MAX_COST_PER_REQUEST: parseFloat(process.env.MAX_COST_PER_REQUEST || '0.05'),

  /**
   * Maximum number of recent messages to retain in the sliding window
   * before summarization is triggered.
   */
  MAX_RECENT_MESSAGES: parseInt(process.env.MAX_RECENT_MESSAGES || '10', 10),

  /**
   * Top-k retrieval limit for vector search results.
   */
  RAG_TOP_K: parseInt(process.env.RAG_TOP_K || '5', 10),

  /**
   * Observability telemetry retention in days.
   */
  OBSERVABILITY_RETENTION_DAYS: parseInt(process.env.OBSERVABILITY_RETENTION_DAYS || '90', 10),
};
