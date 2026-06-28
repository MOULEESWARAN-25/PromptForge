/**
 * Veyntra Phase 2 - Intent Vagueness Analyzer
 * Parses semantic properties to determine developer vision alignment and trigger clarifications.
 */
export function evaluateIntentClarity(rawPrompt) {
  
  const text = (rawPrompt || '').trim();
  const normalizedText = text.toLowerCase();
  
  // Rule-based heuristic scores
  let clarityScore = 0.50; // default base clarity
  let requiresClarification = false;
  let inferredIntent = "Custom Front-End Control";

  if (!text) {
    return {
      clarityScore: 0.0,
      requiresClarification: true,
      inferredIntent: "Empty Request"
    };
  }

  // 1. Length-based heuristics
  if (text.length > 250) {
    clarityScore += 0.20;
  } else if (text.length > 100) {
    clarityScore += 0.10;
  } else if (text.length < 50) {
    clarityScore -= 0.15;
  }

  // 2. Specific visual-term check heuristics
  const hasVisualDescriptors = [
    'glass', 'blur', 'glow', 'shadow', 'border', 'padding', 'color', 
    'pastel', 'dark', 'neon', 'rounded', 'spring', 'animation', 'hover', 
    'tactile', 'bento', 'responsive', 'flex', 'grid'
  ].some(term => normalizedText.includes(term));

  if (hasVisualDescriptors) {
    clarityScore += 0.25;
  }

  // 3. Inferred Intent discovery
  if (normalizedText.includes('dashboard') || normalizedText.includes('admin') || normalizedText.includes('panel')) {
    inferredIntent = "SaaS Admin Dashboard Panel";
    clarityScore += 0.10;
  } else if (normalizedText.includes('landing') || normalizedText.includes('homepage') || normalizedText.includes('product')) {
    inferredIntent = "Product Landing Page / Presentation";
    clarityScore += 0.10;
  } else if (normalizedText.includes('login') || normalizedText.includes('signup') || normalizedText.includes('auth')) {
    inferredIntent = "Security Gate / Authentication Form";
    clarityScore += 0.15;
  } else if (normalizedText.includes('pricing') || normalizedText.includes('billing')) {
    inferredIntent = "Subscription Billing Spotlight Tiers";
    clarityScore += 0.15;
  } else if (normalizedText.includes('settings') || normalizedText.includes('preferences')) {
    inferredIntent = "Personal Account Settings Panel";
    clarityScore += 0.10;
  }

  // Cap clarity score bounds
  clarityScore = Math.max(0.0, Math.min(1.0, clarityScore));

  return {
    clarityScore: parseFloat(clarityScore.toFixed(2)),
    requiresClarification: clarityScore < 0.70, // threshold comparison
    inferredIntent
  };
}
