import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dataset = null;
try {
  const jsonPath = path.join(__dirname, 'knowledgeGraphData.json');
  if (fs.existsSync(jsonPath)) {
    dataset = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
} catch (err) {
  console.error(`[localKb] Failed loading fallback dataset: ${err.message}`);
}

/**
 * Keyword-based fallback search directly on local JSON dataset.
 * Respects Context Isolation Filters and retrieves relationships.
 */
export function localVocabularySearch(queryText, allowedKbTypes, limit = 5) {
  if (!dataset || !dataset.entities) {
    return [];
  }

  const tokens = queryText.toLowerCase().split(/\W+/).filter(Boolean);
  if (tokens.length === 0) {
    return [];
  }

  // Filter candidates based on allowed types
  const candidates = dataset.entities.filter(ent => allowedKbTypes.includes(ent.kb_type));

  const scored = candidates.map(entity => {
    let score = 0;

    // Check exact name/ID matches
    if (entity.name.toLowerCase().includes(queryText.toLowerCase())) score += 10;
    if (entity.id.toLowerCase().includes(queryText.toLowerCase())) score += 10;

    // Check keywords matches
    if (entity.keywords) {
      entity.keywords.forEach(kw => {
        const lowerKw = kw.toLowerCase();
        if (lowerKw.includes(queryText.toLowerCase())) score += 5;
        tokens.forEach(t => {
          if (lowerKw.includes(t)) score += 2;
        });
      });
    }

    // Check overview
    const overview = (entity.overview || '').toLowerCase();
    tokens.forEach(t => {
      if (overview.includes(t)) score += 0.5;
    });

    const similarity = Math.min(0.95, parseFloat((score / (tokens.length + 1) / 10).toFixed(3)));

    return {
      ...entity,
      similarity
    };
  });

  return scored
    .filter(item => item.similarity > 0.05)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
