import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchVectorVocabulary } from './services/ragService.js';
import { runPromptEnhancerAgent } from './services/agentService.js';
import { themeStyles } from './services/themeData.js'; // Keep visual design definitions consistent
import { telemetryService } from './services/telemetryService.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for the Next.js frontend (localhost:3000) and JSON parsing
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Visual styles catalog for prompt references
const localThemeStyles = themeStyles || {
  "Sleek Dark Glassmorphic": {
    name: "Sleek Dark Glassmorphic",
    description: "Deep obsidian backdrops, frosted semi-transparent containers, neon-violet glow highlights, and minimal card borders.",
    keywords: "glassmorphism, dark obsidian background, backdrop-filter blur, subtle neon border glow, premium dark mode, rich transparency effects"
  }
};

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date(), service: 'Veyntra RAG Agent Server' });
});

// System Status & Observability Telemetry Stats
app.get('/api/telemetry/stats', async (req, res) => {
  try {
    const stats = await telemetryService.getStats();
    res.json(stats);
  } catch (error) {
    console.error(`[telemetry] Stats retrieval failed: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve telemetry stats' });
  }
});

/**
 * Endpoint for Vector Semantic search (used in Learn Sandbox playground)
 */
app.post('/api/search', async (req, res) => {
  const { query, limit = 3, boostCategory = null } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const searchData = await searchVectorVocabulary(query, limit, boostCategory);
    res.json(searchData);
  } catch (error) {
    console.error(`[search] Vector search error [${new Date().toISOString()}]: ${error.message}`);
    res.status(500).json({ error: 'Internal server search error' });
  }
});

/**
 * Main prompt architect and generator endpoint (grounded by RAG)
 */
app.post('/api/forge', async (req, res) => {
  const {
    mode,
    query,
    theme,
    category,
    pageType,
    components = [],
    componentName,
    history = [],
    codebaseContext,
    framework,
    modelProvider = 'gemini'
  } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Description query is required' });
  }

  const startTime = Date.now();

  try {
    // 1. Construct semantic retrieval anchor to search vector DB
    const retrievalAnchor = `${query} ${category || ''} ${pageType || ''} ${componentName || ''} ${components.join(' ')}`;
    
    // 2. Perform Supabase pgvector search
    const boostCat = mode === 'component' ? 'Component' : (mode === 'page' ? 'Layout' : null);
    const ragResult = await searchVectorVocabulary(retrievalAnchor, 3, boostCat);
    
    const retrievedTerms = ragResult.results;
    const latencyMs = Date.now() - startTime;

    const ragDetails = {
      anchor: retrievalAnchor,
      results: ragResult.results,
      latencyMs: ragResult.latencyMs
    };

    // 3. Resolve visual styles details
    const selectedThemeDetails = localThemeStyles[theme] || null;

    // 4. Run LangChain Prompt Generation Agent
    const generatedPrompt = await runPromptEnhancerAgent({
      mode,
      query,
      theme: selectedThemeDetails,
      category,
      pageType,
      components,
      componentName,
      history,
      retrievedTerms,
      codebaseContext,
      framework,
      modelProvider
    });

    res.json({
      prompt: generatedPrompt,
      ragDetails,
      source: modelProvider === 'groq' ? "Groq Llama 3.3 70B via LangChain Backend" : "Google Gemini 2.5 Flash via LangChain Backend"
    });

  } catch (error) {
    console.error(`[forge] Agent execution error [${new Date().toISOString()}]: ${error.message}`);
    res.status(500).json({ error: 'Internal prompt agent execution failed' });
  }
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` Veyntra Decoupled RAG Backend running on http://localhost:${PORT}`);
  console.log(` Database: Connecting to Supabase Vector DB (pgvector)`);
  console.log(` AI Orchestration: LangChain + Google Gemini 2.5 Flash API`);
  console.log(`================================================================`);
});
