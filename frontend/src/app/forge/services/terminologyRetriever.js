import terminology from '@/data/knowledge/terminology.json';

/**
 * Veyntra Phase 2 - Visual-to-Technical Design System Terminology Retriever
 * Translates visual layman terms into developer design vocabularies and low-level tokens.
 */
export async function retrieveTechnicalTerminology(query) {
  
  const normalizedQuery = (query || '').toLowerCase();
  
  const matchedTechnicalTerms = new Set();
  const matchedDesignTokens = new Set();
  const matchedGuidelineDetails = [];

  // Match synonyms deterministically
  terminology.forEach(entry => {
    const hasMatch = entry.synonyms.some(
      synonym => normalizedQuery.includes(synonym.toLowerCase())
    );

    if (hasMatch) {
      entry.technicalTerms.forEach(t => matchedTechnicalTerms.add(t));
      entry.designTokens.forEach(d => matchedDesignTokens.add(d));
      matchedGuidelineDetails.push({
        technicalTerm: entry.technicalTerms[0],
        explanation: entry.explanation,
        visualDescription: entry.visualDescription
      });
    }
  });

  // Calculate retrieval confidence based on matching counts
  const matchesCount = matchedTechnicalTerms.size;
  const baseConfidence = matchesCount > 0 ? 0.70 : 0.50;
  const retrievalConfidence = Math.min(1.0, baseConfidence + (matchesCount * 0.05));

  return {
    retrievalConfidence,
    technicalTerms: Array.from(matchedTechnicalTerms),
    designTokens: Array.from(matchedDesignTokens),
    matchedGuidelineDetails
  };
}
