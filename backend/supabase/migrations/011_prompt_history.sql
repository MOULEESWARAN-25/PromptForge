-- Migration: 011_prompt_history.sql
-- Version: 1.0.0
-- Author: Antigravity AI
-- Created Date: 2026-06-26
-- Purpose: Create prompt_history table to persist generated developer prompts with rich analytics metadata.

CREATE TABLE IF NOT EXISTS prompt_history (
  id VARCHAR PRIMARY KEY,
  username VARCHAR REFERENCES users(username) ON DELETE CASCADE,
  mode VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  query TEXT NOT NULL,
  theme VARCHAR NOT NULL,
  resolved_prompt TEXT NOT NULL,
  chat_messages JSONB DEFAULT '[]'::jsonb,
  rag_details JSONB DEFAULT '{}'::jsonb,
  timestamp BIGINT NOT NULL,
  category VARCHAR,
  page_type VARCHAR,
  components TEXT[] DEFAULT '{}'::text[],
  component_name VARCHAR,
  engine_version VARCHAR DEFAULT 'phase2',
  telemetry_source VARCHAR DEFAULT 'production',
  -- Analytics Metadata Columns
  provider VARCHAR,
  model_tier VARCHAR,
  generation_mode VARCHAR,
  cache_status VARCHAR,
  prompt_version VARCHAR,
  latency INTEGER,
  estimated_tokens INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for username lookup
CREATE INDEX IF NOT EXISTS idx_prompt_history_username ON prompt_history(username);
