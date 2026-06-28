import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * AI Provider Configurations for Backend Services
 */
export const AI_CONFIG = {
  // Primary generative engine (defaults to gemini)
  PrimaryGenerationProvider: (process.env.PRIMARY_MODEL_PROVIDER || 'gemini').toLowerCase(),
  
  // Secondary review / expert panel engine (defaults to groq)
  ReviewProvider: (process.env.REVIEW_MODEL_PROVIDER || 'groq').toLowerCase(),
  
  // Model specifications
  models: {
    gemini: {
      name: 'gemini-2.5-flash',
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
    groq: {
      name: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      maxOutputTokens: 4096,
    }
  }
};
