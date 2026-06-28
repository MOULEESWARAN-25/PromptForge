-- Migration: 012_categories.sql
-- Version: 1.0.0
-- Author: Antigravity AI
-- Created Date: 2026-06-26
-- Purpose: Create app_categories database table to support dynamic frontend wizard setups.

CREATE TABLE IF NOT EXISTS app_categories (
  id VARCHAR PRIMARY KEY,
  label VARCHAR NOT NULL,
  desc TEXT NOT NULL,
  icon VARCHAR,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
