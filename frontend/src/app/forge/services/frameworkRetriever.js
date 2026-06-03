import frameworks from '@/data/knowledge/frameworks.json';

/**
 * Veyntra Phase 2 - Active CSS Framework & Stack Retriever
 * Resolves boilerplate syntax rules, required npm packages, and configurations for target UI libraries.
 */
export async function retrieveFrameworkBoilerplate(frameworkName) {
  console.log(`[Framework Retriever] Querying structural boilerplate for: "${frameworkName}"`);
  
  // Find framework matching selected stack
  const matchedFramework = frameworks.find(
    f => f.frameworkName.toLowerCase() === (frameworkName || '').toLowerCase()
  ) || frameworks[0];
  
  return {
    frameworkName: matchedFramework.frameworkName,
    rules: matchedFramework.rules,
    recommendedPatterns: matchedFramework.recommendedPatterns,
    requiredPackages: matchedFramework.requiredPackages,
    componentConventions: matchedFramework.componentConventions
  };
}
