-- Migration: 006_create_coverage_metrics_table
-- Purpose: Create entity_coverage_metrics and entity_coverage_history tables for detailed completeness audits and trend tracking.

-- Table for active/latest coverage metrics
CREATE TABLE IF NOT EXISTS entity_coverage_metrics (
    entity_id VARCHAR PRIMARY KEY,
    entity_name VARCHAR NOT NULL,
    entity_type VARCHAR NOT NULL,
    coverage_version INTEGER NOT NULL DEFAULT 1,
    coverage_score NUMERIC(5,2) NOT NULL,
    coverage_by_layer JSONB NOT NULL,
    retrieval_count INTEGER NOT NULL DEFAULT 0,
    avg_similarity NUMERIC(5,4),
    last_calculated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table for historical coverage snapshots
CREATE TABLE IF NOT EXISTS entity_coverage_history (
    entity_id VARCHAR NOT NULL,
    snapshot_date DATE NOT NULL,
    coverage_version INTEGER NOT NULL DEFAULT 1,
    coverage_score NUMERIC(5,2) NOT NULL,
    coverage_by_layer JSONB NOT NULL,
    retrieval_count INTEGER NOT NULL DEFAULT 0,
    avg_similarity NUMERIC(5,4),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (entity_id, snapshot_date)
);

-- Indexing for fast search and aggregation
CREATE INDEX IF NOT EXISTS idx_entity_coverage_metrics_score ON entity_coverage_metrics(coverage_score);
CREATE INDEX IF NOT EXISTS idx_entity_coverage_history_date ON entity_coverage_history(snapshot_date);
