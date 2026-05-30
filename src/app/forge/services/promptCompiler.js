import { generateEnhancedPrompt } from '@/services/gemini';
import { track, EVENTS } from '@/lib/analytics';
import { runRetrievalPipeline } from './retrievalPipeline';
import { evaluateIntentClarity } from './intentAnalyzer';

/**
 * Orchestrates and compiles enhanced development prompts.
 * Decouples raw state parameters from prompt synthesis engines.
 */
export async function compileForgePrompt({
  activeMode,
  appCategory,
  customCategory,
  selectedFeatures,
  pageType,
  selectedComponents,
  projectIntegration,
  framework,
  ideResponseContext,
  componentType,
  customComponentType,
  rawDescription,
  selectedQualities,
  selectedMotions,
  selectedTheme,
  clarificationActive,
  clarifiedAudience,
  clarifiedDensity,
  clarifiedViewport,
  apiKey
}) {
  let finalQuery = '';
  let title = '';

  if (activeMode === 'application') {
    const finalCategory = appCategory === 'Custom' ? customCategory : appCategory;
    title = `Application: ${finalCategory}`;
    finalQuery = `Create a premium full-stack ${finalCategory} web application using the theme style "${selectedTheme || 'Sleek Dark Glassmorphic'}". Ensure it incorporates the following features: ${selectedFeatures.join(', ')}.`;
  } else if (activeMode === 'page') {
    title = `Page: ${pageType}`;
    if (projectIntegration === 'existing') {
      finalQuery = `Create a highly polished, responsive page for a "${pageType}" that integrates perfectly into an existing project. Style Theme: "${selectedTheme || 'Sleek Dark Glassmorphic'}". Implement these grid components: ${selectedComponents.join(', ')}. Tech Stack / Framework: "${framework}". Codebase Context & Directory guidelines: ${ideResponseContext || 'No details provided'}.`;
    } else {
      finalQuery = `Create a standalone, highly polished, responsive page for a "${pageType}" with the theme style "${selectedTheme || 'Sleek Dark Glassmorphic'}". Implement these grid components: ${selectedComponents.join(', ')}.`;
    }
  } else if (activeMode === 'component') {
    const finalCompType = componentType === 'Custom Component' ? customComponentType : componentType;
    title = `Component: ${finalCompType}`;
    if (projectIntegration === 'existing') {
      finalQuery = `Create an interactive, accessible React component for a "${finalCompType}" that integrates perfectly into an existing project. Style Theme: "${selectedTheme || 'Sleek Dark Glassmorphic'}". Tech Stack / Framework: "${framework}". Codebase Context & Directory guidelines: ${ideResponseContext || 'No details provided'}.`;
    } else {
      finalQuery = `Create a standalone, reusable, accessible React component for a "${finalCompType}" with the theme style "${selectedTheme || 'Sleek Dark Glassmorphic'}". Ensure strict keyboard accessibility and premium transition properties.`;
    }
  } else if (activeMode === 'enhance') {
    title = `Enhanced: ${rawDescription.slice(0, 24)}...`;
    let extraQualitiesText = `\n- Visual Qualities: ${selectedQualities.join(', ')}\n- Transitions & Motion: ${selectedMotions.join(', ')}`;
    if (clarificationActive) {
      extraQualitiesText += `\n- Target Audience: ${clarifiedAudience || 'Developer/SaaS Builder'}\n- Layout Density: ${clarifiedDensity}\n- Viewport Layout: ${clarifiedViewport}`;
    }
    finalQuery = `${rawDescription}\n\n[INJECT TECHNICAL MODIFIERS]:\n- Theme Style: ${selectedTheme || 'Sleek Dark Glassmorphic'}${extraQualitiesText}`;
  }

  // CENTRALIZED PHASE 2A RAG RETRIEVAL PIPELINE LOOKUP
  const componentName = activeMode === 'component' ? (componentType === 'Custom Component' ? customComponentType : componentType) : null;
  const pipelineResult = await runRetrievalPipeline(finalQuery, {
    framework: projectIntegration === 'existing' ? framework : 'Tailwind CSS',
    theme: selectedTheme || 'Sleek Dark Glassmorphic',
    pageType: activeMode === 'page' ? pageType : null,
    componentName
  });

  // Stitch the retrieved specifications directly into the prompt query
  const enrichedQuery = `${finalQuery}

[RETRIEVED DESIGN SYSTEM SPECIFICATIONS]:
- Inferred Intent: ${pipelineResult.inferredIntent}
- Retrieval Confidence: ${pipelineResult.retrievalConfidence}
- Required Technical Terms: ${pipelineResult.technicalTerms.join(', ')}
- Matching Tailwind Design Tokens: ${pipelineResult.designTokens.join(', ')}
- Active Framework Conventions: ${pipelineResult.frameworkRules.join(' | ')}
- Page / Component Structural Blueprints: ${pipelineResult.promptPatterns.join(' | ')}
`;

  const generationParams = {
    mode: activeMode,
    query: enrichedQuery,
    theme: selectedTheme || 'Sleek Dark Glassmorphic',
    apiKey
  };

  if (activeMode === 'application') {
    generationParams.category = appCategory === 'Custom' ? customCategory : appCategory;
  } else if (activeMode === 'page') {
    generationParams.pageType = pageType;
    generationParams.components = selectedComponents;
  } else if (activeMode === 'component') {
    generationParams.componentName = componentName;
  }

  if (projectIntegration === 'existing') {
    generationParams.codebaseContext = ideResponseContext;
    generationParams.framework = framework;
  }

  const response = await generateEnhancedPrompt(generationParams);

  // Return the resolved prompts along with enriched visual dictionary details for UI renderers
  return {
    title,
    query: finalQuery,
    resolvedPrompt: response.prompt,
    ragDetails: {
      ...response.ragDetails,
      inferredIntent: pipelineResult.inferredIntent,
      retrievalConfidence: pipelineResult.retrievalConfidence,
      technicalTerms: pipelineResult.technicalTerms,
      designTokens: pipelineResult.designTokens,
      frameworkRules: pipelineResult.frameworkRules,
      promptPatterns: pipelineResult.promptPatterns
    }
  };
}

/**
 * Centralized intent clarity check using refined heuristics.
 */
export function analyzePromptAmbiguity(text) {
  const result = evaluateIntentClarity(text);
  return result.requiresClarification;
}
