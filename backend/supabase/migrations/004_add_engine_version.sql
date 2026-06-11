-- Migration: 004_add_engine_version
-- Purpose: Add engine_version to prompt_history and telemetry_validity_rate to snapshots

ALTER TABLE prompt_history ADD COLUMN IF NOT EXISTS engine_version VARCHAR DEFAULT 'phase2';
ALTER TABLE prompt_history ADD COLUMN IF NOT EXISTS telemetry_source VARCHAR DEFAULT 'production';

-- Backfill legacy records before Sprint 1 release
UPDATE prompt_history
SET engine_version = 'legacy', telemetry_source = 'production'
WHERE created_at < '2026-06-10T00:00:00.000Z';

-- Add telemetry_validity_rate columns to daily, weekly, and monthly snapshots
ALTER TABLE knowledge_metrics_daily ADD COLUMN IF NOT EXISTS telemetry_validity_rate NUMERIC(5, 2) DEFAULT 100.00 NOT NULL;
ALTER TABLE knowledge_metrics_weekly ADD COLUMN IF NOT EXISTS telemetry_validity_rate NUMERIC(5, 2) DEFAULT 100.00 NOT NULL;
ALTER TABLE knowledge_metrics_monthly ADD COLUMN IF NOT EXISTS telemetry_validity_rate NUMERIC(5, 2) DEFAULT 100.00 NOT NULL;

