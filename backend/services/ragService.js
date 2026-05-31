import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { supabase } from "./supabaseClient.js";
import { telemetryService } from "./telemetryService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize LangChain Google Generative AI Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-001", // 3072 dims — matches seeded DB vectors
});

// Load static design vocabulary from local JSON for bulletproof RAG fallback
let localVocabulary = [];
try {
  const vocabularyPath = path.join(__dirname, "terminology.json");
  if (fs.existsSync(vocabularyPath)) {
    const rawData = fs.readFileSync(vocabularyPath, "utf-8");
    localVocabulary = JSON.parse(rawData);
  }
} catch (err) {
  console.error(`[rag] Failed to load local vocabulary fallback data: ${err.message}`);
}

/**
 * Generates vector embedding for a given text query.
 * @param {string} text 
 * @returns {Promise<number[]>} embedding vector
 */
export async function generateEmbedding(text) {
  try {
    telemetryService.recordRequest("gemini");
    const start = Date.now();
    const result = await embeddings.embedQuery(text);
    telemetryService.recordSuccess("gemini", Date.now() - start);
    return result;
  } catch (error) {
    telemetryService.recordFailure("gemini", error.message);
    console.error(`[rag] Error generating vector embedding: ${error.message}`);
    throw error;
  }
}

/**
 * High-fidelity local vocabulary search fallback (TF-IDF/Keyword Cosine overlap)
 */
function localVocabularySearch(queryText, limit = 3, boostCategory = null) {
  telemetryService.recordRequest("localRag");
  const startTime = Date.now();
  const tokens = queryText.toLowerCase().split(/\W+/).filter(Boolean);
  
  if (tokens.length === 0) {
    return [];
  }

  const scored = localVocabulary.map(item => {
    let score = 0;
    
    // Check technical terms
    item.technicalTerms.forEach(term => {
      const lowerTerm = term.toLowerCase();
      if (lowerTerm.includes(queryText.toLowerCase())) score += 5;
      tokens.forEach(tok => {
        if (lowerTerm.includes(tok)) score += 2;
      });
    });

    // Check synonyms
    if (item.synonyms) {
      item.synonyms.forEach(syn => {
        const lowerSyn = syn.toLowerCase();
        if (lowerSyn.includes(queryText.toLowerCase())) score += 3;
        tokens.forEach(tok => {
          if (lowerSyn.includes(tok)) score += 1;
        });
      });
    }

    // Check explanation & visual description
    const expl = (item.explanation || "").toLowerCase();
    const desc = (item.visualDescription || "").toLowerCase();
    tokens.forEach(tok => {
      if (expl.includes(tok)) score += 0.5;
      if (desc.includes(tok)) score += 0.3;
    });

    // Apply category boost
    if (boostCategory && item.category && item.category.toLowerCase() === boostCategory.toLowerCase()) {
      score *= 1.25;
    }

    return {
      name: item.technicalTerms[0] || "Design Token",
      category: item.category || "Layout",
      score: Math.min(0.95, parseFloat((score / (tokens.length + 1)).toFixed(3))),
      description: item.explanation || "",
      snippet: (item.designTokens || []).join(" "),
      examplePrompt: item.visualDescription || "",
      id: Math.random().toString(36).substr(2, 9),
      keywords: item.synonyms || []
    };
  });

  // Filter out zero matching scores and sort
  const matches = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  telemetryService.recordSuccess("localRag", Date.now() - startTime);
  return matches;
}

/**
 * Searches the Supabase Vector database using cosine similarity match RPC function.
 * Falls back to local keyword search dynamically if embeddings fail (e.g. rate-limits).
 * 
 * @param {string} query The user raw description or search query
 * @param {number} limit Max matches to return (default: 3)
 * @param {string} [boostCategory] Optional category to boost (e.g. "Component")
 * @returns {Promise<Array<{term: object, score: number}>>}
 */
export async function searchVectorVocabulary(queryText, limit = 3, boostCategory = null) {
  const startTime = Date.now();
  try {
    // 1. Generate Query Vector Embedding (attempts API, handles failure)
    const queryEmbedding = await generateEmbedding(queryText);

    // 2. Perform pgvector Cosine Similarity Match via Supabase RPC
    const { data: matches, error } = await supabase.rpc("match_design_vocabulary", {
      query_embedding: queryEmbedding,
      match_threshold: 0.05,
      match_count: limit,
      boost_category: boostCategory || null
    });

    if (error) {
      console.error(`[rag] Supabase RPC error: ${error.message}`);
      throw error;
    }

    // 3. Format into the standard RAG output format expected by Frontend
    const formattedResults = (matches || []).map(item => ({
      name: item.name,
      category: item.category,
      score: parseFloat(item.similarity.toFixed(3)),
      description: item.description,
      snippet: item.snippet,
      examplePrompt: item.example_prompt,
      id: item.id,
      keywords: item.keywords
    }));

    return {
      results: formattedResults,
      latencyMs: Date.now() - startTime,
      source: "pgvector"
    };

  } catch (error) {
    console.warn(`[rag] Semantic vector search failed (${error.message}). Invoking Local RAG search fallback...`);
    telemetryService.recordFailover("localRag");
    
    const localMatches = localVocabularySearch(queryText, limit, boostCategory);
    
    return {
      results: localMatches,
      latencyMs: Date.now() - startTime,
      source: "Local RAG Fallback System",
      warning: "AI rate-limited or database offline. Grounded by Local RAG."
    };
  }
}

