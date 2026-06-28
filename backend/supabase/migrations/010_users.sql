-- Migration: 010_users.sql
-- Version: 1.0.0
-- Author: Antigravity AI
-- Created Date: 2026-06-26
-- Purpose: Create baseline users authentication table to track user sessions.

CREATE TABLE IF NOT EXISTS users (
  username VARCHAR PRIMARY KEY,
  password VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
