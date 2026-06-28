/**
 * Feature Flag Configuration
 * ─────────────────────────────────────────────────────────────────
 * Controls which features are active in the current environment.
 * All flags default to a safe, minimal state (off) unless explicitly enabled.
 *
 * Flags are read from environment variables to allow per-environment control
 * without code changes or redeployment.
 *
 * Usage:
 *   import { FEATURE_FLAGS } from '@/config/featureFlags';
 *   if (FEATURE_FLAGS.VECTOR_SEARCH_ENABLED) { ... }
 */

const flag = (envKey, defaultValue = false) =>
  process.env[envKey] === 'true' || (process.env[envKey] === undefined && defaultValue);

export const FEATURE_FLAGS = {
  /**
   * Enables pgvector-powered vocabulary search.
   * Falls back to static JSON cache when false.
   */
  VECTOR_SEARCH_ENABLED: flag('FEATURE_VECTOR_SEARCH', true),

  /**
   * Enables the RAG (Retrieval-Augmented Generation) context pipeline.
   * When false, only direct LLM calls are made without vector retrieval.
   */
  RAG_ENABLED: flag('FEATURE_RAG', true),

  /**
   * Enables conversation summarization for long chat sessions.
   * When false, the full message history is sent (up to MAX_CONTEXT_SIZE).
   */
  CONVERSATION_SUMMARIZATION: flag('FEATURE_CONVERSATION_SUMMARY', true),

  /**
   * Enables the prompt injection shield on all incoming user inputs.
   * Should only be disabled in trusted internal testing environments.
   */
  INJECTION_SHIELD_ENABLED: flag('FEATURE_INJECTION_SHIELD', true),

  /**
   * Enables secret stripping from outgoing AI prompt payloads.
   */
  SECRET_STRIPPING_ENABLED: flag('FEATURE_SECRET_STRIPPING', true),

  /**
   * Enables the observability telemetry recording pipeline.
   * Disabling this stops all backend performance and cost logging.
   */
  OBSERVABILITY_ENABLED: flag('FEATURE_OBSERVABILITY', true),

  /**
   * Enables the command palette (⌘K) in the application shell.
   */
  COMMAND_PALETTE_ENABLED: flag('FEATURE_COMMAND_PALETTE', true),

  /**
   * Enables the Workspace Quality Panel (internal name for Observability page).
   * When false, the page returns a 404.
   */
  QUALITY_PANEL_ENABLED: flag('FEATURE_QUALITY_PANEL', false),

  /**
   * Enables cost-per-request guard checks.
   * When false, MAX_COST_PER_REQUEST limits are not enforced.
   */
  COST_GUARD_ENABLED: flag('FEATURE_COST_GUARD', true),
};
