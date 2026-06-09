import { generateEmbedding } from '../services/ragService.js';
import { supabase } from '../services/supabaseClient.js';
import { designVocabulary } from '../../frontend/src/data/designVocabulary.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log("🚀 Starting Supabase pgvector Seeding Process...");
  console.log(`Loaded ${designVocabulary.length} items from frontend designVocabulary.js`);
  let successCount = 0;

  for (const item of designVocabulary) {
    try {
      console.log(`\n---------------------------------------------------------`);
      console.log(`[SEED] Processing item: "${item.name}" (${item.id})`);

      // 1. Construct representative semantic string to embed
      const textToEmbed = `Name: ${item.name}. Category: ${item.category}. Keywords: ${item.keywords.join(', ')}. Description: ${item.description}.`;
      
      console.log(`[EMBED] Generating 3072d vector embedding...`);
      const embedding = await generateEmbedding(textToEmbed);
      
      if (!embedding || embedding.length !== 3072) {
        throw new Error(`Invalid embedding vector returned (length: ${embedding?.length || 0})`);
      }

      console.log(`[UPLOAD] Inserting record into Supabase "design_vocabulary"...`);
      const payload = {
        id: item.id,
        name: item.name,
        category: item.category,
        keywords: item.keywords,
        description: item.description,
        snippet: item.snippet || '',
        example_prompt: item.examplePrompt || '',
        difficulty: item.difficulty || 'Beginner',
        tags: item.tags || [],
        design_tokens: item.designTokens || {},
        embedding: embedding
      };

      const { error } = await supabase
        .from('design_vocabulary')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      console.log(`✨ Success: "${item.name}" is now vectorized in Supabase!`);
      successCount++;

    } catch (error) {
      console.error(`❌ Failed seeding item "${item.id}":`, error.message);
    }
  }

  console.log(`\n=========================================================`);
  console.log(`✅ Seeding complete! Successfully indexed ${successCount}/${designVocabulary.length} design documents.`);
  console.log(`=========================================================`);
  process.exit(0);
}

seed();
