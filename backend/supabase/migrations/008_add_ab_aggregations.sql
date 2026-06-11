-- Migration: 008_add_ab_aggregations
-- Purpose: Create ab_benchmark_metrics table to aggregate Legacy vs Blueprint-Guided runs

CREATE TABLE IF NOT EXISTS ab_benchmark_metrics (
  date DATE NOT NULL,
  generation_type VARCHAR NOT NULL, -- 'legacy_rag', 'blueprint_guided'
  pipeline_version INTEGER DEFAULT 1 NOT NULL,
  avg_quality_score NUMERIC(5, 2) NOT NULL,
  avg_latency_ms INTEGER NOT NULL,
  patch_count INTEGER NOT NULL,
  retrieval_utilization_rate NUMERIC(5, 2) NOT NULL,
  blueprint_completion_rate NUMERIC(5, 2) NOT NULL,
  total_runs INTEGER NOT NULL,
  rubric_dimensions JSONB NOT NULL, -- Averages of the 6 dimensions
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  PRIMARY KEY (date, generation_type, pipeline_version)
);

-- Indexing for fast search and aggregation
CREATE INDEX IF NOT EXISTS idx_ab_benchmark_metrics_date ON ab_benchmark_metrics(date);
CREATE INDEX IF NOT EXISTS idx_ab_benchmark_metrics_gen_type ON ab_benchmark_metrics(generation_type);
