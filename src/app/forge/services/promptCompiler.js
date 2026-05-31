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
  selectedTypography,
  clarificationActive,
  clarifiedAudience,
  clarifiedDensity,
  clarifiedViewport,
  projectName,
  projectDescription,
  projectType,
  frontendStack,
  backendStack,
  database,
  authOption,
  deployment,
  additionalFeatures,
  apiKey,
  modelProvider = 'gemini'
}) {
  let finalQuery = '';
  let title = '';

  // Typography system specification injected into all prompt modes
  const TYPOGRAPHY_SIGNALS = {
    'Inter':             'Use Inter for all body copy and UI controls. Optimize hierarchy for information-dense, functional interfaces. font-weight 400-600.',
    'Geist':             'Use Geist for all typography. Apply mono-inspired precision with tight letter-spacing. Ideal for developer-facing SaaS tools.',
    'Manrope':           'Use Manrope for all typography. Apply geometric, approachable styling with comfortable line-height for readable dashboards.',
    'Poppins':           'Use Poppins for all typography. Apply rounded, consumer-facing warmth. font-weight 500-700 for headings. Friendly modern SaaS.',
    'DM Sans':           'Use DM Sans for all typography. Apply compact, information-dense hierarchy. Excellent for data-rich admin panels.',
    'Outfit':            'Use Outfit for all typography. Apply bold editorial display with high-contrast heading weights. Design-forward, expressive.',
    'Plus Jakarta Sans': 'Use Plus Jakarta Sans for all typography. Apply elegant neo-grotesque structure with clean curve terminals and wide lettering, popular in modern SaaS platforms.',
    'Space Grotesk':     'Use Space Grotesk for headings and tech fonts. Apply quirky geometric details that pop. Energetic, Web3, and highly tech-forward.',
    'Sora':              'Use Sora for high-visibility digital UI typography. Apply broad, high-character shapes and high-visibility weighting.',
    'Nunito':            'Use Nunito for soft, approachable healthcare and educational apps. Apply rounded geometric curves for visual comfort.',
    'Urbanist':          'Use Urbanist for creative and lifestyle SaaS. Apply geometric sans-serif shapes with soft modern curves.',
    'IBM Plex Sans':     'Use IBM Plex Sans for technical systems and dashboards. Blends scientific precision and clear letter spacing for a high-performance look.',
    'JetBrains Mono':    'Use JetBrains Mono for monospace code blocks and developer telemetry layouts. Clean, structured, highly readable monospace coding font.',
    'Recursive':         'Use Recursive for sandbox environments. Apply a casual, brush-like handwriting character with monospace spacing.',
    'Syne':              'Use Syne for avant-garde, creative, and highly design-forward headers. Bold and uniquely wide display layouts.',
    'Playfair Display':  'Use Playfair Display for classic high-prestige editorial serif layouts. Evokes high authority, trust, and premium newsprint styles.',
    'Lexend':            'Use Lexend for highly accessible SaaS tools. Specifically engineered to improve visual readability, reading fluency, and visual cognitive ease.'
  };
  const typographyInstruction = TYPOGRAPHY_SIGNALS[selectedTypography] || TYPOGRAPHY_SIGNALS['Inter'];

  const projectSetupDetails = `
[PROJECT ARCHITECTURE & SETUP]:
- Project Name: ${projectName || 'my-awesome-project'}
- Project Description: ${projectDescription || 'A premium web application'}
- Project Type: ${projectType || 'SaaS Platform'}
- Frontend Stack: ${frontendStack || 'Next.js'}
- Backend Stack: ${backendStack || 'Serverless'}
- Database: ${database || 'PostgreSQL'}
- Authentication: ${authOption || 'NextAuth.js'}
- Deployment Target: ${deployment || 'Vercel'}
- Development Stack Additions: ${(additionalFeatures || []).join(', ')}`;

  if (activeMode === 'application') {
    const finalCategory = appCategory === 'Custom' ? customCategory : appCategory;
    title = `Application: ${finalCategory}`;
    finalQuery = `Create a premium full-stack ${finalCategory} web application using the theme style "${selectedTheme || 'Sleek Dark Glassmorphic'}". Typography System: ${typographyInstruction}
${projectSetupDetails}
Selected Application Features to implement: ${selectedFeatures.join(', ')}`;
  } else if (activeMode === 'page') {
    title = `Page: ${pageType}`;
    if (projectIntegration === 'existing') {
      finalQuery = `Create a highly polished, responsive page for a "${pageType}" that integrates perfectly into an existing project. Style Theme: "${selectedTheme || 'Sleek Dark Glassmorphic'}". Typography System: ${typographyInstruction}. Implement these grid components: ${selectedComponents.join(', ')}. Tech Stack / Framework: "${framework}". Codebase Context & Directory guidelines: ${ideResponseContext || 'No details provided'}.
${projectSetupDetails}`;
    } else {
      finalQuery = `Create a standalone, highly polished, responsive page for a "${pageType}" with the theme style "${selectedTheme || 'Sleek Dark Glassmorphic'}". Typography System: ${typographyInstruction}. Implement these grid components: ${selectedComponents.join(', ')}.
${projectSetupDetails}`;
    }
  } else if (activeMode === 'component') {
    const finalCompType = componentType === 'Custom Component' ? customComponentType : componentType;
    title = `Component: ${finalCompType}`;
    if (projectIntegration === 'existing') {
      finalQuery = `Create an interactive, accessible React component for a "${finalCompType}" that integrates perfectly into an existing project. Style Theme: "${selectedTheme || 'Sleek Dark Glassmorphic'}". Typography System: ${typographyInstruction}. Tech Stack / Framework: "${framework}". Codebase Context & Directory guidelines: ${ideResponseContext || 'No details provided'}.
${projectSetupDetails}`;
    } else {
      finalQuery = `Create a standalone, reusable, accessible React component for a "${finalCompType}" with the theme style "${selectedTheme || 'Sleek Dark Glassmorphic'}". Typography System: ${typographyInstruction}. Ensure strict keyboard accessibility and premium transition properties.
${projectSetupDetails}`;
    }
  } else if (activeMode === 'enhance') {
    title = `Enhanced: ${rawDescription.slice(0, 24)}...`;
    let extraQualitiesText = `\n- Visual Qualities: ${selectedQualities.join(', ')}\n- Transitions & Motion: ${selectedMotions.join(', ')}`;
    if (clarificationActive) {
      extraQualitiesText += `\n- Target Audience: ${clarifiedAudience || 'Developer/SaaS Builder'}\n- Layout Density: ${clarifiedDensity}\n- Viewport Layout: ${clarifiedViewport}`;
    }
    finalQuery = `${rawDescription}\n\n[INJECT TECHNICAL MODIFIERS]:\n- Theme Style: ${selectedTheme || 'Sleek Dark Glassmorphic'}\n- Typography System: ${typographyInstruction}${extraQualitiesText}
${projectSetupDetails}`;
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
    apiKey,
    modelProvider
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
