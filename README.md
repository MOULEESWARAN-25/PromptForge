# Veyntra — Developer Intent Compiler

Veyntra is a premium, neo-noir inspired SaaS platform designed as a **Developer Intent Compiler**. It bridges the gap between raw developer intent and surgical execution in AI coding compilers like Cursor, Lovable, v0, and Bolt. By transforming vague developer prompts into highly optimized, context-aware architectural blueprints and specifications enriched with RAG-retrieved CSS design vocabulary, developers can build flawless interfaces and production-ready applications with unmatched predictability.

---

## 🌟 Key Pillars

* **Intent Compilation Engine**: Analyzes rough developer descriptions and maps them into clear structural directives, page schemas, functional specifications, and architectural boundaries.
* **Resilient Dual-Layer RAG System**: Fetches optimal CSS tokens, page layout parameters, and responsive design guidelines using semantic vector matching. Automatically falls back to a local keyword cosine overlap match system if API limits are reached.
* **Component-Aware Accessibility Specification Engine**: Auto-injects strict WCAG AA standards (ARIA roles, states, keyboard focus trapping rules, etc.) and explanations of *why* they matter into prompt specifications so AI compilers generate accessible designs from day one.
* **Blueprint Critique Agent**: Performs multi-step internal draft-and-critique loops to flag underspecified requirements, screen layouts, or styling gaps.
* **Real-time Observability Telemetry**: Tracks requests, latencies, success rates, and failovers across Gemini, Groq, Supabase, and local engines in memory.
* **Visual Design Token Library**: Provides a central dashboard to browse layout grid configurations, animation physics presets, and visual styling theme keywords.

---

## 🛠️ Architecture & Tech Stack

### Frontend
* **Core Framework**: [Next.js 16.2](https://nextjs.org) (App Router configuration)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Vanilla CSS Custom Design Token Engine
* **Interactions & Motion**: [Framer Motion v12](https://www.framer.com/motion/) (micro-animations, glassmorphic spring sliders) & [GSAP v3](https://gsap.com) (ScrollTrigger page reveals, conveyor pipeline animations)
* **Typography**: Dynamic design system font loaders supporting **Work Sans** (body & inputs) and **Darker Grotesque** (display titles) as primary fonts, plus 16 alternative Google Fonts
* **Icons & Notifications**: Lucide React + Sonner

### Backend
* **Core API Server**: Node.js & Express
* **Database**: Supabase (PostgreSQL with `pgvector` extension)
* **AI Orchestration**: LangChain integration
* **Primary LLM**: Google Gemini (`gemini-2.5-flash` for generation & `gemini-embedding-001` for RAG)
* **Fallback LLM**: Groq (`llama-3.3-70b-versatile`) for immediate fail-fast failover redundancy

---

## 📂 Directory Structure

```
PromptForge/                  # Monorepo Root Directory (PromptForge Workspace)
├── package.json              # Root-level monorepo package manager (concurrent dev orchestration)
├── package-lock.json         # Root lockfile
│
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Layouts, Pages, Routes)
│   │   │   ├── api/          # Next.js client-side API endpoints
│   │   │   ├── auth/         # Responsive Auth Flow (Login, Registration, Demo Access)
│   │   │   ├── chat/         # Autonomous Blueprint Critic dialogue interface
│   │   │   ├── component-forge/ # Modular Component Database Catalog
│   │   │   ├── dashboard/    # Primary developer workspace dashboard
│   │   │   ├── features/     # Dynamic SEO landing detail pages for core features
│   │   │   │   └── [slug]/   # Dynamic routes (SaaS Architect, Design Vocabulary, Code Catalog)
│   │   │   ├── forge/        # Core intent translation workspace and mode configurations
│   │   │   ├── vocabulary/   # RAG design token vector database browser
│   │   │   ├── globals.css   # Global styles (ambient neon glows, prefers-reduced-motion triggers)
│   │   │   └── layout.js     # Root Next.js layout (custom font loader, toaster, theme initializer)
│   │   ├── components/       # Shared UI components (AuroraBackground, CommandPalette, Navigation, OfflineBanner)
│   │   ├── config/           # Branding configuration properties (brand.js)
│   │   ├── context/          # AppContext provider (persisting theme, auth sessions, and workspace state)
│   │   ├── data/             # Local static fallback CSS design patterns
│   │   ├── lib/              # Client typography loaders
│   │   └── services/         # Client engines (Supabase Client, RAG Engine, Gemini SDK)
│   └── package.json          # Frontend packages (Next.js, Tailwind v4, Framer Motion, GSAP)
│
└── backend/                  # Node.js & Express pgvector RAG Backend
    ├── server.js             # Node Express API Server (ports search query & forge compiler endpoints)
    ├── scripts/              # Database seeding utilities
    │   └── seed.js           # Generates 3072-dim embeddings via gemini-embedding-001 & seeds Supabase
    ├── services/             # Core Backend Services
    │   ├── accessibilitySpecs.js # Component-aware accessibility directives and human rationales
    │   ├── agentService.js   # LangChain LLM coordinator with Groq failover and self-critique loop
    │   ├── ragService.js     # Vector semantic search (Supabase pgvector) + local TF-IDF fallback search
    │   ├── supabaseClient.js # Initialized Supabase client wrapper
    │   ├── telemetryService.js # Memory-based API observability tracking stats
    │   ├── terminology.json  # Local design terminology dictionary corpus
    │   └── themeData.js      # Visual theme design config definitions
    ├── supabase/             # Database schema setup files
    │   ├── migrations/       # SQL database migration scripts (001_add_vector_indexes.sql)
    │   └── schema.sql        # Vector tables, indices, RLS policies, match_design_vocabulary RPC function
    └── package.json          # Backend packages (Express, LangChain, Gemini SDK, Groq SDK, ws)
```

---

## ⚡ Getting Started

### 1. Prerequisite Setup
Ensure you have [Node.js](https://nodejs.org) (v18+ recommended) installed on your system.

### 2. Database & API Credentials
Create a `.env.local` file in the `frontend/` directory and a `.env` file in the `backend/` directory:

#### Frontend (`/frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_DOMAIN=veyntra.vercel.app
NEXT_PUBLIC_APP_BACKEND_DOMAIN=veyntra-backend.vercel.app
```

#### Backend (`/backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-google-gemini-api-key
GROQ_API_KEY=your-groq-api-key-optional
PORT=8000
```

### 3. Database Initialization
1. Execute the SQL statements inside `backend/supabase/schema.sql` within your Supabase SQL Editor. This enables the `vector` extension, sets up the table structure, creates Row-Level Security (RLS) policies, and defines the `match_design_vocabulary` RPC similarity function.
2. Run the seeding script to generate embeddings for design tokens and populate the database:
   ```bash
   npm run seed
   ```

> [!NOTE]
> **Vector Indexing Design Note**:
> HNSW vector indexes are intentionally omitted in the current database schema. pgvector's HNSW operator supports a maximum of 2,000 dimensions. Since Gemini's `gemini-embedding-001` generates 3,072-dimensional vectors, attempting to apply HNSW will error. At the current corpus size (~30-100 rows), a sequential cosine similarity scan takes <10ms. For future scaling beyond 5,000 rows, a `halfvec(3072)` column type or switching to a 1,536-dimensional embedding model is outlined in the migrations file.

### 4. Running the Development Servers
Start both the Frontend and Backend servers simultaneously from the root directory:

```bash
# 1. Install all dependencies across both packages
npm run install:all

# 2. Run both dev servers concurrently
npm run dev
```

#### Running individually:

* **Frontend**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) to view the Veyntra application interface.

* **Backend**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
  The backend server will run on [http://localhost:8000](http://localhost:8000). You can check its health at `/health`.

---

## 🛡️ Robustness & Fallback Design

* **AI Provider Failover**: The prompt generation system uses a primary agent running on Gemini. If Gemini API limits or network issues occur, the backend automatically intercepts the error and routes the payload to Groq's Llama 3.3 model.
* **Semantic DB Fallback**: If the Supabase vector database query or Gemini embedding service fails, the RAG query engine falls back to a TF-IDF/Keyword Cosine overlap algorithm searching against the localized `terminology.json` file.
* **Pre-baked CSS Snippets**: Design token specifications are embedded with bulletproof raw fallback CSS styles (gradients, flexboxes, transition parameters) inside the database and fallback JSON so layout properties resolve even during offline operations.

---

## 🎨 Premium UI/UX Design Standards

* **Glassmorphic Obsidian Aesthetic**: Implements a deep ambient dark mode (`#0a0516`) accented by subtle violet glows (`#6843EC`) and frosted transparent card panels.
* **Motion Physics Engine**: Dynamic hover scaling and tactile active button press springs mapped via Framer Motion, with high-performance scrolling timelines managed by GSAP ScrollTrigger.
* **Access Guidelines**: Dynamic focus outlines, accessibility banners, skip-to-content links, keyboard navigation traps, and strict compliance with `prefers-reduced-motion` media queries.
