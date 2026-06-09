-- Migration: 002_add_metadata_columns
-- Purpose: Add difficulty, tags, and design_tokens to design_vocabulary for dynamic ingestion.

ALTER TABLE design_vocabulary 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS design_tokens JSONB;
