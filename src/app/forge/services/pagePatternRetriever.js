import pagePatterns from '@/data/knowledge/pagePatterns.json';

/**
 * PromptForge Phase 2 - Page Pattern Retriever Service
 * Resolves high-level webpage architectures into layout grids,
 * UX hierarchical guides, and critical structural sections.
 */
export async function retrievePagePatternSpecs(pageType) {
  console.log(`[Page Pattern Retriever] Querying structural layout rules for: "${pageType}"`);
  
  if (!pageType) {
    return null;
  }

  // Find page pattern matching selected layout type (case-insensitive substring)
  const pattern = pagePatterns.find(
    p => p.pageType.toLowerCase().includes(pageType.toLowerCase()) ||
         pageType.toLowerCase().includes(p.pageType.toLowerCase())
  );

  if (!pattern) {
    return {
      pageType,
      requiredSections: [],
      layoutPatterns: [],
      uxGuidelines: [
        "Incorporate responsive grid columns and mobile viewport accommodations."
      ]
    };
  }

  return {
    pageType: pattern.pageType,
    requiredSections: pattern.requiredSections,
    layoutPatterns: pattern.layoutPatterns,
    uxGuidelines: pattern.uxGuidelines
  };
}
