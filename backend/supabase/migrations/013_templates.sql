-- Migration: 013_templates.sql
-- Version: 1.0.0
-- Author: Antigravity AI
-- Created Date: 2026-06-26
-- Purpose: Create page_templates database table to store page scaffolding specs.

CREATE TABLE IF NOT EXISTS page_templates (
  id VARCHAR PRIMARY KEY,
  label VARCHAR NOT NULL,
  desc TEXT NOT NULL,
  image VARCHAR,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
