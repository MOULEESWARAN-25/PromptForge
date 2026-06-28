import { evaluateIntentClarity } from './intentAnalyzer';
import { retrieveTechnicalTerminology } from './terminologyRetriever';
import { retrieveFrameworkBoilerplate } from './frameworkRetriever';
import { retrieveThemeStyleGuide } from './themeRetriever';
import { retrievePagePatternSpecs } from './pagePatternRetriever';
import { retrieveComponentSpecs } from './componentRetriever';
import { retrieveMotionPhysics } from './motionRetriever';

// Global configurable threshold
export const INTENT_CONFIDENCE_THRESHOLD = 0.70;

/**
 * Veyntra Phase 2 - Unified RAG Retrieval Orchestrator
 * Links hooks directly to this centralized controller, resolving intents,
 * themes, syntax frameworks, webpage patterns, components, and animations.
 */
export async function runRetrievalPipeline(rawPrompt, options = {}) {

  // 1. Analyze user design intent & clarity score
  const intentResult = evaluateIntentClarity(rawPrompt);

  // 2. Fetch technical designer terminology & styling tokens
  const terminologyResult = await retrieveTechnicalTerminology(rawPrompt);

  // 3. Resolve active UI framework templates
  let frameworkResult = { frameworkName: '', rules: [], recommendedPatterns: [], requiredPackages: [], componentConventions: [] };
  if (options.framework) {
    frameworkResult = await retrieveFrameworkBoilerplate(options.framework);
  }

  // 4. Resolve selected theme visual HSL variables
  let themeResult = { themeTokens: {}, layoutGuidelines: [] };
  if (options.theme) {
    themeResult = await retrieveThemeStyleGuide(options.theme);
  }

  // 5. Query structural page skeletons or modular component specs using dedicated retrievers
  const promptPatterns = [];

  if (options.pageType) {
    const pageSpecs = await retrievePagePatternSpecs(options.pageType);
    if (pageSpecs && pageSpecs.requiredSections.length > 0) {
      promptPatterns.push(`Required Sections: ${pageSpecs.requiredSections.join(', ')}.`);
      promptPatterns.push(`Grid Layout System: ${pageSpecs.layoutPatterns.join(' ')}.`);
      pageSpecs.uxGuidelines.forEach(ux => promptPatterns.push(`UX Rule: ${ux}`));
    }
  }

  if (options.componentName) {
    const compSpecs = await retrieveComponentSpecs(options.componentName);
    if (compSpecs && Array.isArray(compSpecs.accessibilityGuidelines) && compSpecs.accessibilityGuidelines.length > 0) {
      promptPatterns.push(`Structural Preset: ${compSpecs.responsiveGridPresets}`);
      compSpecs.accessibilityGuidelines.forEach(acc => promptPatterns.push(`Accessibility Guideline: ${acc}`));
    }
  }

  // 6. Query mathematical spring physics and framer motion configurations
  const motionSpecs = await retrieveMotionPhysics(rawPrompt);
  if (motionSpecs) {
    promptPatterns.push(
      `Motion Settings: Preset "${motionSpecs.motionPreset}" using parameters Stiffness: ${motionSpecs.framerMotionCurves.stiffness}, Damping: ${motionSpecs.framerMotionCurves.damping}, Mass: ${motionSpecs.framerMotionCurves.mass || 1}. Scale transition: ${motionSpecs.hoverScaleSpecs.scale || 1}.`
    );
  }

  // Inject general pattern descriptions if no specific match
  if (promptPatterns.length === 0) {
    promptPatterns.push("Incorporate structured responsive grid layouts matching standard front-end viewport paradigms.");
  }

  // Determine if clarification questionnaire deck is required
  const requiresClarification = 
    intentResult.clarityScore < INTENT_CONFIDENCE_THRESHOLD || 
    intentResult.requiresClarification;

  // Compute total consolidated retrieval confidence
  const totalConfidence = parseFloat(
    ((intentResult.clarityScore + terminologyResult.retrievalConfidence) / 2).toFixed(2)
  );

  // Consolidated output contract matching visual-to-technical architecture specifications
  return {
    clarityScore: intentResult.clarityScore,
    retrievalConfidence: totalConfidence,
    inferredIntent: intentResult.inferredIntent,
    requiresClarification,
    technicalTerms: terminologyResult.technicalTerms,
    designTokens: terminologyResult.designTokens,
    themeTokens: themeResult.themeTokens,
    frameworkRules: frameworkResult.rules.concat(frameworkResult.componentConventions),
    promptPatterns
  };
}
