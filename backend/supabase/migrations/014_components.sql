-- Migration: 014_components.sql
-- Version: 1.0.0
-- Author: Antigravity AI
-- Created Date: 2026-06-26
-- Purpose: Create components database table to store component templates dynamic listings.

CREATE TABLE IF NOT EXISTS components (
  id VARCHAR PRIMARY KEY,
  label VARCHAR NOT NULL,
  desc TEXT NOT NULL,
  image VARCHAR,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
