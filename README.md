# Veyntra — Developer Intent Compiler

Veyntra is a premium, neo-noir inspired SaaS platform designed as a **Developer Intent Compiler**. It bridges the gap between raw developer intent and surgical execution in AI coding tools like Cursor, Lovable, v0, and Bolt. By transforming vague descriptions into highly optimized, context-aware architectural blueprints and specifications enriched with RAG-retrieved CSS design vocabulary, developers can build flawless interfaces and production-ready applications with unparalleled predictability.

---

## Key Pillars

* **Intent Compilation Engine**: Analyzes developer descriptions and maps them into clear directives, functional specifications, and architectural constraints.
* **RAG-Powered Design Vocabulary**: Seamlessly fetches optimal CSS tokens, layouts, and responsive guidelines using custom semantic matching vectors to instruct the coding AI on perfect aesthetics.
* **Blueprint Critique Agent**: Built-in dialog panel running critique loops on blueprints to flag ambiguities or underspecified requirements.
* **Component Workspace**: Access a rich database of 50+ premium design patterns and ready-to-use micro-frontend layouts.
* **RAG Inspector**: A real-time developer utility panel to inspect similarity weights, vector distances, and exact vocabulary database matches.

---

## Architecture & Tech Stack

### Frontend
* **Core Framework**: Next.js 16.2 (utilizing Turbopack)
* **Styling**: Tailwind CSS v4 + Vanilla CSS Custom Design Token Engine
* **Interactions & Motion**: Framer Motion (micro-animations, spring-based state sliders, glassmorphic effects)
* **Typography**: Plus Jakarta Sans (body, inputs) & Bricolage Grotesque (display, headers)
* **Icons & Notifications**: Lucide React + Sonner

### Backend
* **Core API Server**: Node.js & Express
* **Database & Auth**: Supabase (PostgreSQL database & Row-Level Security)
* **Schema Validation**: Zod
* **AI Engine**: Google Gemini API for intent compilation and automated blueprint critique

---

## Directory Structure

```
Veyntra/
├── package.json             # Root-level monorepo orchestrator
├── frontend/                # Next.js Frontend Application
│   ├── src/
│   │   ├── app/             # Next.js App Router (Layouts, Views, Page Routes)
│   │   │   ├── auth/        # Responsive Auth Flow (Login, Registration, Demo Access)
│   │   │   ├── chat/        # Autonomous Blueprint Critic Dialogue Screen
│   │   │   ├── component-forge/ # Premium Component Database & Selector Page
│   │   │   ├── forge/       # Primary Intent Translation Workspace Panel
│   │   │   └── learn/       # RAG Educational & Reference Panel
│   │   ├── components/      # Reusable UI Patterns (Aurora Background, Navigation, Drawer, RAG Inspector)
│   │   ├── context/         # Global App State Provider (API Key persistence, auth session)
│   │   ├── data/            # Local CSS Design Patterns & Vocabulary Database
│   │   └── services/        # Client Engines (Supabase Client, RAG Engine, Gemini SDK)
│   └── package.json
│
└── backend/                 # Node.js & Express pgvector RAG Backend
    ├── scripts/             # Database Seeding Utility Scripts (seed.js)
    ├── services/            # Backend Integrations (RAG Processor, Agent, Supabase)
    ├── supabase/            # Database schema tables, trigger functions, and indices
    ├── server.js            # Node Express API Server
    └── package.json
```

---

## Getting Started

### 1. Prerequisite Setup
Ensure you have [Node.js](https://nodejs.org) installed on your system.

### 2. Database & API Credentials
Create a `.env.local` file in the `frontend/` directory (and a `.env` file in the `backend/` folder) containing your Supabase and Gemini configurations:

```env
# Frontend /frontend/.env.local (Frontend configuration)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend /backend/.env (API configuration)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-google-gemini-api-key
PORT=8000
```

### 3. Database Initialization
Execute the SQL statements inside `backend/supabase/schema.sql` inside your Supabase SQL Editor. Once complete, run the seeding script to populate the custom design vocabulary database:

```bash
npm run seed
```

### 4. Running the Development Environments
Start both the Frontend and Backend servers simultaneously from the root directory:

```bash
# 1. Install all dependencies
npm run install:all

# 2. Run both dev servers concurrently
npm run dev
```

Alternatively, you can run them individually:

#### Frontend Development Server:
```bash
cd frontend
npm install
npm run dev
```

#### Backend API Server:
```bash
cd backend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) on your local browser to access Veyntra.

---

## Premium UX / UI Best Practices Used
* **Vibrant Neo-Noir Aesthetic**: Dark ambient tones mixed with selective gold highlights (`#fbbf24`) and soft glowing background gradients.
* **Zero Layout Shift**: Fixed layout wraps and container margins prevent content jitter.
* **Tactile Interactions**: Buttons and tabs dynamically spring on hover and scale down on click.
* **Fluid Mobile Responsiveness**: Entire application relies on flexible grid layouts and standard media queries using Tailwind's viewport directives.
