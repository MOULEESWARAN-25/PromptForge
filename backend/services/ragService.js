import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { supabase } from "./supabaseClient.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize LangChain Google Generative AI Embeddings
// NOTE: Use 'model' not 'modelName' — 'modelName' is deprecated in @langchain/google-genai
// CRITICAL: The Supabase pgvector table was seeded with 3072-dimension vectors from
// gemini-embedding-001. Do NOT change model or add outputDimensionality — must match DB.
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-001", // 3072 dims — matches seeded DB vectors
});

/**
 * Generates vector embedding for a given text query.
 * @param {string} text 
 * @returns {Promise<number[]>} embedding vector
 */
export async function generateEmbedding(text) {
  try {
    return await embeddings.embedQuery(text);
  } catch (error) {
    console.error("Error generating vector embedding:", error);
    throw error;
  }
}

/**
 * Searches the Supabase Vector database using cosine similarity match RPC function.
 * 
 * @param {string} query The user raw description or search query
 * @param {number} limit Max matches to return (default: 3)
 * @param {string} [boostCategory] Optional category to boost (e.g. "Component")
 * @returns {Promise<Array<{term: object, score: number}>>}
 */
export async function searchVectorVocabulary(queryText, limit = 3, boostCategory = null) {
  const startTime = Date.now();
  try {
    // 1. Generate Query Vector Embedding
    const queryEmbedding = await generateEmbedding(queryText);

    // 2. Perform pgvector Cosine Similarity Match via Supabase RPC
    const { data: matches, error } = await supabase.rpc("match_design_vocabulary", {
      query_embedding: queryEmbedding,
      match_threshold: 0.05,
      match_count: limit,
      boost_category: boostCategory || null
    });

    if (error) {
      console.error("Supabase RPC error querying design vocabulary:", error);
      throw error;
    }

    // 3. Format into the standard RAG output format expected by Frontend (flat structure)
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
      latencyMs: Date.now() - startTime
    };

  } catch (error) {
    console.error("RAG Service Search error, falling back to empty results:", error);
    return {
      results: [],
      latencyMs: Date.now() - startTime,
      error: error.message
    };
  }
}
