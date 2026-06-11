-- Migration: 007_add_integrity_metrics
-- Purpose: Add integrity_metrics column to knowledge_metrics_daily, weekly, and monthly tables to cache graph validation scans.

ALTER TABLE knowledge_metrics_daily ADD COLUMN IF NOT EXISTS integrity_metrics JSONB;
ALTER TABLE knowledge_metrics_weekly ADD COLUMN IF NOT EXISTS integrity_metrics JSONB;
ALTER TABLE knowledge_metrics_monthly ADD COLUMN IF NOT EXISTS integrity_metrics JSONB;
