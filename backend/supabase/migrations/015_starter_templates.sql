-- Migration: 015_starter_templates.sql
-- Version: 1.0.0
-- Author: Antigravity AI
-- Created Date: 2026-06-26
-- Purpose: Create starter_templates database table to support dynamic starter configurations in the dashboard.

CREATE TABLE IF NOT EXISTS starter_templates (
  id VARCHAR PRIMARY KEY,
  label VARCHAR NOT NULL,
  desc TEXT NOT NULL,
  mode VARCHAR NOT NULL,
  prompt TEXT NOT NULL,
  image VARCHAR,
  icon VARCHAR,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Seed starting template data
INSERT INTO starter_templates (id, label, desc, mode, prompt, image, icon)
VALUES
  ('saas', 'SaaS Dashboard', 'Pre-configured prompt for admin panels', 'application', 'Create a comprehensive SaaS admin dashboard with a sidebar navigation, a top header with user profile and search, and a main content area containing data cards, a line chart for revenue, and a recent transactions table. Use a clean, modern aesthetic with a primary blue accent.', '/pages/dashboard.webp', 'LayoutTemplate'),
  ('ai', 'AI Chat Interface', 'Ready-to-compile conversational UI', 'application', 'Build an AI chat interface similar to ChatGPT. Include a sidebar for chat history, a main chat area with distinct user and AI message bubbles, and a sticky input area at the bottom with a submit button and attachment icon.', '/pages/login.webp', 'Sparkles'),
  ('portfolio', 'Developer Portfolio', 'Personal site with project galleries', 'page', 'Design a sleek, minimalist developer portfolio. Include a hero section with a brief introduction, a skills grid, a projects gallery with cards, and a contact form. Use a dark theme with neon accents.', '/pages/profile.webp', 'Box'),
  ('docs', 'Documentation Hub', 'Markdown-ready docs with sidebar navigation', 'page', 'Create a documentation hub layout. Include a persistent left sidebar for nested navigation, a top bar with global search, and a main content area with typography optimized for long-form reading and code blocks.', '/pages/settings.webp', 'FileText'),
  ('ecommerce', 'E-commerce Storefront', 'Product grid, cart, and filtering', 'application', 'Develop an e-commerce storefront. The home page should feature a promotional hero banner, a category sidebar with filters, and a responsive product grid. Include a shopping cart slide-out panel.', '/pages/landing.webp', 'ShoppingBag'),
  ('admin', 'Internal Tool', 'Data management and CRUD UI', 'application', 'Build an internal CRUD tool for employee management. The interface should have a large data table with sorting and filtering, and a slide-out modal for adding or editing employee records.', '/pages/dashboard.webp', 'TerminalSquare')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  desc = EXCLUDED.desc,
  mode = EXCLUDED.mode,
  prompt = EXCLUDED.prompt,
  image = EXCLUDED.image,
  icon = EXCLUDED.icon;
