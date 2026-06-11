-- Migration: 003_create_metrics_tables
-- Purpose: Deploy database tables for Phase II: Knowledge Intelligence & Observability

-- Create daily snapshot metrics aggregation table
CREATE TABLE IF NOT EXISTS knowledge_metrics_daily (
  date DATE PRIMARY KEY,
  aggregation_version INTEGER DEFAULT 1 NOT NULL,
  avg_prompt_score NUMERIC(5, 2) NOT NULL,
  avg_coverage_score NUMERIC(5, 2) NOT NULL,
  avg_vector_similarity NUMERIC(5, 4) NOT NULL,
  avg_latency_ms INTEGER NOT NULL,
  total_generations INTEGER NOT NULL,
  patch_count INTEGER NOT NULL,
  gap_count INTEGER NOT NULL,
  active_entity_count INTEGER NOT NULL,
  retrieved_entity_count INTEGER NOT NULL,
  utilization_rate NUMERIC(5, 2) NOT NULL,
  coverage_by_layer JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create weekly snapshot metrics aggregation table
CREATE TABLE IF NOT EXISTS knowledge_metrics_weekly (
  week_start_date DATE PRIMARY KEY,
  aggregation_version INTEGER DEFAULT 1 NOT NULL,
  avg_prompt_score NUMERIC(5, 2) NOT NULL,
  avg_coverage_score NUMERIC(5, 2) NOT NULL,
  avg_vector_similarity NUMERIC(5, 4) NOT NULL,
  avg_latency_ms INTEGER NOT NULL,
  total_generations INTEGER NOT NULL,
  patch_count INTEGER NOT NULL,
  gap_count INTEGER NOT NULL,
  active_entity_count INTEGER NOT NULL,
  retrieved_entity_count INTEGER NOT NULL,
  utilization_rate NUMERIC(5, 2) NOT NULL,
  coverage_by_layer JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create monthly snapshot metrics aggregation table
CREATE TABLE IF NOT EXISTS knowledge_metrics_monthly (
  month_start_date DATE PRIMARY KEY,
  aggregation_version INTEGER DEFAULT 1 NOT NULL,
  avg_prompt_score NUMERIC(5, 2) NOT NULL,
  avg_coverage_score NUMERIC(5, 2) NOT NULL,
  avg_vector_similarity NUMERIC(5, 4) NOT NULL,
  avg_latency_ms INTEGER NOT NULL,
  total_generations INTEGER NOT NULL,
  patch_count INTEGER NOT NULL,
  gap_count INTEGER NOT NULL,
  active_entity_count INTEGER NOT NULL,
  retrieved_entity_count INTEGER NOT NULL,
  utilization_rate NUMERIC(5, 2) NOT NULL,
  coverage_by_layer JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create knowledge gaps backlog table
CREATE TABLE IF NOT EXISTS knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_type VARCHAR NOT NULL,             -- 'MISSING_ENTITY', 'WEAK_ENTITY', 'INCOMPLETE_ENTITY', 'STALE_ENTITY', 'INVALID_RELATIONSHIP', 'LOW_COVERAGE'
  source VARCHAR NOT NULL,               -- 'retrieval_engine', 'coverage_engine', 'evaluator', 'staleness_checker', 'manual_review'
  entity_name VARCHAR NOT NULL,
  frequency INTEGER DEFAULT 1 NOT NULL,
  first_seen_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMP DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMP,
  status VARCHAR DEFAULT 'backlog' NOT NULL, -- 'backlog', 'in_progress', 'resolved'
  priority VARCHAR DEFAULT 'medium' NOT NULL, -- 'low', 'medium', 'high', 'critical'
  resolution_notes TEXT,
  metadata JSONB
);

-- Create indexes on knowledge gaps for dashboard querying
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_status ON knowledge_gaps(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_priority ON knowledge_gaps(priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_gaps_entity_name ON knowledge_gaps(entity_name);

-- Add reviewed_at column to kb_entities table for staleness tracking
ALTER TABLE kb_entities ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP DEFAULT NOW() NOT NULL;
