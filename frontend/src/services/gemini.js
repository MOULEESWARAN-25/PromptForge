import { searchVectorVocabulary } from './ragEngine';
import { themeStyles } from '../config/themeStyles';
import { resolveAccessibilitySpecs } from './accessibilitySpecs';
import { API_BASE_URL, apiUrl } from '../config/api';
import { devWarn } from '@/lib/logger';

/**
 * Main service to compile and enhance prompts using either the Google Gemini API (Free Tier)
 * or a highly sophisticated Local Prompt Compiler if offline or key is missing.
 * 
 * @param {object} params
 * @param {string} params.mode - "application" | "page" | "component" | "enhance"
 * @param {string} params.query - The user's input/raw description
 * @param {string} [params.theme] - Selected visual style (e.g., "Sleek Dark Glassmorphic")
 * @param {string} [params.category] - For application mode (e.g. "e-commerce")
 * @param {string} [params.pageType] - For page mode (e.g. "Dashboard")
 * @param {string[]} [params.components] - For page mode (selected component list)
 * @param {string} [params.componentName] - For component mode (e.g. "Command Palette")
 * @param {array} [params.history] - Array of { role: 'user'|'model', content: string }
 * @param {string} [params.apiKey] - Free Gemini API Key
 * @returns {Promise<{ prompt: string, ragDetails: object, source: string }>}
 */
export async function generateEnhancedPrompt({
  mode,
  query,
  theme,
  category,
  pageType,
  components = [],
  componentName,
  history = [],
  apiKey,
  codebaseContext,
  framework,
  modelProvider = 'gemini',
  vocabulary = [],
  projectName,
  projectDescription,
  frontendStack,
  backendStack,
  database,
  authOption,
  deployment,
  additionalFeatures = [],
  projectIntegration = 'new',
  customCategory,
  customComponentType,
  rawDescription,
  selectedQualities,
  selectedMotions,
  selectedTypography,
  clarifiedAudience,
  clarifiedDensity,
  clarifiedViewport,
  generationMode = 'professional'
}) {
  const startTime = Date.now();
  
  // 1. TRY CALLING DECOUPLED LANGCHAIN & SUPABASE BACKEND
  try {
    const controller = new AbortController();
    // Timeout driven by env var — set NEXT_PUBLIC_API_TIMEOUT_MS in .env.local
    // Dev default: 60s (pipeline cold starts can take 20-50s on free tier)
    const timeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 60000);
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const backendResponse = await fetch(apiUrl('/forge'), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        mode,
        query,
        theme,
        category,
        pageType,
        components,
        componentName,
        history,
        codebaseContext,
        framework,
        modelProvider,
        projectName,
        projectDescription,
        frontendStack,
        backendStack,
        database,
        authOption,
        deployment,
        additionalFeatures,
        projectIntegration,
        customCategory,
        customComponentType,
        rawDescription,
        selectedQualities,
        selectedMotions,
        selectedTypography,
        clarifiedAudience,
        clarifiedDensity,
        clarifiedViewport,
        generationMode
      })
    });

    clearTimeout(timeoutId);

    if (backendResponse.ok) {
      const responseJson = await backendResponse.json();
      const data = responseJson?.data ?? responseJson;
      return {
        prompt: data.prompt,
        qualityWarnings: data.qualityWarnings || [],
        ragDetails: data.ragDetails,
        source: data.source || "Veyntra Cloud Engine"
      };
    }
  } catch (error) {
    devWarn("Decoupled backend server offline or unavailable. Falling back to local RAG pipeline:", error);
  }
  
  // 2. CLIENT-SIDE LOCAL RAG FALLBACK
  // Construct a retrieval anchor combining query and choices to search our semantic DB
  const retrievalAnchor = `${query} ${category || ''} ${pageType || ''} ${componentName || ''} ${components.join(' ')}`;
  const searchResults = searchVectorVocabulary(retrievalAnchor, 3, null, vocabulary);
  
  // Extract retrieved technical terminology
  const retrievedTerms = searchResults.map(res => res.term);
  const ragDetails = {
    anchor: retrievalAnchor,
    results: searchResults.map(res => ({
      name: res.term.name,
      category: res.term.category,
      kb_type: res.term.kb_type || 'common',
      score: res.score,
      description: res.term.description
    })),
    latencyMs: Date.now() - startTime
  };

  // Resolve visual styles details
  const selectedThemeDetails = themeStyles[theme] || null;

  const resolvedApiKey = apiKey || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : '') || '';

  // 2. CHECK IF WE CAN USE GEMINI API
  if (resolvedApiKey && resolvedApiKey.trim() !== '') {
    try {
      return await executeGeminiGeneration({
        mode,
        query,
        theme: selectedThemeDetails,
        category,
        pageType,
        components,
        componentName,
        retrievedTerms,
        history,
        apiKey: resolvedApiKey,
        ragDetails,
        codebaseContext,
        framework
      });
    } catch (error) {
      devWarn("Gemini API call failed, falling back to Local Prompt Compiler:", error);
      // Fallback to local prompt builder on error
    }
  }

  // 3. OFFLINE FALLBACK: Sophisticated Local Prompt Compiler
  const compiledPrompt = compileLocalPrompt({
    mode,
    query,
    theme: selectedThemeDetails,
    category,
    pageType,
    components,
    componentName,
    retrievedTerms,
    history,
    codebaseContext,
    framework
  });

  return {
    prompt: compiledPrompt,
    qualityWarnings: [],
    ragDetails,
    source: "Offline Style Engine"
  };
}

/**
 * Makes an HTTP call to the free Gemini API
 */
async function executeGeminiGeneration({
  mode,
  query,
  theme,
  category,
  pageType,
  components,
  componentName,
  retrievedTerms,
  history,
  apiKey,
  ragDetails,
  codebaseContext,
  framework
}) {
  // Resolve component-aware accessibility specifications
  const a11yBlock = resolveAccessibilitySpecs({ mode, componentName, components, pageType, query: query || '' });

  let systemInstruction = `You are a Professional AI Prompt Architect & Frontend Intent Translator. Your goal is to take a user's rough, vague frontend development descriptions and translate them into incredibly detailed, high-fidelity prompts that AI tools like Lovable, Cursor, and v0 understand best.

You will use professional, highly precise UI/UX design language, components, visual styles, layouts, animations, and motion terminology to guarantee outstanding layout results.

Here is some RETRIEVED SEMANTIC DESIGN DOMAIN KNOWLEDGE that you MUST weave into your generated prompt:
${retrievedTerms.map(term => `- **${term.name}** (${term.category}): ${term.description}. CSS Property Example: \`${term.snippet}\``).join('\n')}

${theme ? `The user expects a **${theme.name}** theme. Style Keywords: ${theme.keywords}. Description: ${theme.description}.` : ''}

${framework ? `\nTarget UI Framework: ${framework}. Follow standard development patterns, class configurations, and semantic syntax for ${framework}.\n` : ''}

${codebaseContext ? `\nCRITICAL DIRECTIVE - EXISTING PROJECT INTEGRATION:\nThis UI element must integrate seamlessly into an existing codebase. Here is the user's codebase folder structure and styling patterns gathered from their IDE:\n---START CODEBASE CONTEXT---\n${codebaseContext}\n---END CODEBASE CONTEXT---\nYou MUST structure the generated prompt to strictly fit their current folders layout, reuse their existing styling variables/utilities, and respect their dependency rules.\n` : ''}

${a11yBlock}

  let systemInstruction = `You are a Professional AI Prompt Architect & Frontend Intent Translator. Your goal is to take a user's rough, vague frontend development descriptions and translate them into incredibly detailed, high-fidelity prompts that AI tools like Lovable, Cursor, and v0 understand best.

You will use professional, highly precise UI/UX design language, components, visual styles, layouts, animations, and motion terminology to guarantee outstanding layout results.

Here is some RETRIEVED SEMANTIC DESIGN DOMAIN KNOWLEDGE that you MUST weave into your generated prompt:
${retrievedTerms.map(term => `- **${term.name}** (${term.category}): ${term.description}. CSS Property Example: \`${term.snippet}\``).join('\n')}

${theme ? `The user expects a **${theme.name}** theme. Style Keywords: ${theme.keywords}. Description: ${theme.description}.` : ''}

${framework ? `\nTarget UI Framework: ${framework}. Follow standard development patterns, class configurations, and semantic syntax for ${framework}.\n` : ''}

${codebaseContext ? `\nCRITICAL DIRECTIVE - EXISTING PROJECT INTEGRATION:\nThis UI element must integrate seamlessly into an existing codebase. Here is the user's codebase folder structure and styling patterns gathered from their IDE:\n---START CODEBASE CONTEXT---\n${codebaseContext}\n---END CODEBASE CONTEXT---\nYou MUST structure the generated prompt to strictly fit their current folders layout, reuse their existing styling variables/utilities, and respect their dependency rules.\n` : ''}

${a11yBlock}

CRITICAL FORMATTING INSTRUCTIONS:
1. Output ONLY the copyable prompt inside a single code block starting with \`\`\`prompt and ending with \`\`\`.
2. Do NOT write any conversational greetings, introductions, explanations, summaries, or postscripts. Start your response immediately with \`\`\`prompt.
3. Do not include any text outside the code block.
4. ACCESSIBILITY MANDATE: Every component in the generated prompt MUST include its specific ARIA roles, keyboard navigation pattern, focus management strategy, and the rationale explaining WHY each accessibility requirement exists. Do not omit accessibility — it is a first-class requirement.`;

  // Construct context prompt for first generation
  let promptText = "";
  if (mode === "application") {
    promptText = `Generate a comprehensive end-to-end frontend prompt to build an entire application.
Application Category: ${category || 'SaaS Web App'}
User Idea Description: ${query}
Theme Style: ${theme ? theme.name : 'Sleek Modern Dark Mode'}

The prompt should define the complete layout framework (collapsible navigation bar, stickies), state manager structure, mock pages to seed, and details on functional features. Incorporate the retrieved design terms.`;
  } else if (mode === "page") {
    promptText = `Generate a highly precise frontend prompt to build a complete page.
Page Type: ${pageType}
Components to Include: ${components.length > 0 ? components.join(', ') : 'Default Recommended components'}
User Idea Description: ${query}
Theme Style: ${theme ? theme.name : 'Sleek Modern Dark Mode'}

The prompt should cover structural layout zones, responsive behaviors (mobile-first), bento-grid widgets, and detailed visual elements. Incorporate the retrieved design terms.`;
  } else if (mode === "component") {
    promptText = `Generate a precise, reusable component prompt.
Component Name: ${componentName}
User Idea Description: ${query}
Theme Style: ${theme ? theme.name : 'Sleek Modern Dark Mode'}

The prompt should cover component API properties, accessibility criteria (ARIA), validation transitions, focus states, and spring animations. Incorporate the retrieved design terms.`;
  } else {
    // raw prompt enhance
    promptText = `Enhance the following raw user prompt:
"${query}"
Theme Style: ${theme ? theme.name : 'Sleek Modern Dark Mode'}

Stitch in premium effects, UX characteristics, micro-interactions, responsive tags, and advanced animations. Make it structurally robust and highly detailed.`;
  }

  // Format contents for Gemini generateContent endpoint
  // Translate history into Gemini API contents structure
  const contents = [];
  
  // Add past history
  history.forEach(msg => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  });

  // Add the current query
  contents.push({
    role: 'user',
    parts: [{ text: promptText }]
  });

  // Call official Gemini Beta API
  // Using gemini-3.1-pro for flagship performance and high accuracy
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API HTTP Error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawModelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawModelResponse) {
    throw new Error("Invalid response format from Gemini API");
  }

  return {
    prompt: rawModelResponse,
    qualityWarnings: [],
    ragDetails,
    source: "Google Gemini 2.5 Flash API"
  };
}

/**
 * Sophisticated Offline rule-based compiler.
 * Generates highly descriptive professional prompts based on configuration.
 */
function compileLocalPrompt({
  mode,
  query,
  theme,
  category,
  pageType,
  components,
  componentName,
  retrievedTerms,
  history,
  codebaseContext,
  framework
}) {
  // If we are in interactive chat refinement, simulate a chatbot response
  if (history.length > 0) {
    const lastUserFeedback = query;
    const previousPrompt = history.find(msg => msg.role === 'model')?.content || '';
    
    // Extract code block content from previous model output if present
    let promptMatch = previousPrompt.match(/```prompt\n([\s\S]*?)\n```/);
    let currentPromptText = promptMatch ? promptMatch[1] : previousPrompt;

    return `I have refined the prompt architecture based on your instructions: *"Considers: ${lastUserFeedback}"*.

### Injected Refinements:
- **Refinement Vector**: Parsed feedback instructions and updated the prompt rules.
- **Enhanced Interactions**: Incorporated micro-interactions and transitions to match your custom request.

\`\`\`prompt
${currentPromptText}

[REFINEMENT UPDATE]:
- Incorporate user adjustments: "${lastUserFeedback}".
- Ensure advanced CSS styling triggers and transitions are aligned with the new instructions.
\`\`\`

You can continue modifying the details in this chat room. I will update the blueprint instantly!`;
  }

  // First time generation compile
  const termsText = retrievedTerms.map(t => `- **${t.name}**: ${t.description} (\`${t.snippet.split('\n')[0]}\`)`).join('\n');
  const themeName = theme ? theme.name : "Sleek Modern Dark Mode";
  const themeKeywords = theme ? theme.keywords : "glassmorphism, ambient aurora shadows, sleek dark mode transitions";

  let compiledText = "";
  let preamble = "";

  if (mode === "application") {
    preamble = `Here is a complete, enterprise-grade architecture blueprint to build an entire **${category.toUpperCase()}** application.

I analyzed your design intent and compiled high-fidelity styling patterns to form a production-ready blueprint.

### Architecture Highlights:
1. **Layout Shell**: Implements a sticky top navigation, collapsible left navigation sidebar, and dynamic content cards.
2. **Visual Palette**: Anchored strictly on the **${themeName}** design language.
3. **Design Tokens Injected**:
${termsText}

Here is your copyable, highly optimized prompt:`;

    compiledText = `Create a fully responsive, modern end-to-end ${category} application utilizing React, Next.js, and custom Vanilla CSS. The interface must exhibit a highly premium, polished **${themeName}** styling, incorporating the following keywords: [${themeKeywords}].

### 1. Structural Architecture & Page Layout
- **App Shell Framework**: Implement a sticky top-header navbar and a collapsible sidebar navigation panel providing fluid toggle transitions.
- **Responsive Navigation**: Use a mobile-first bottom-navigation container for screen sizes under 768px.
- **Primary Page Views**:
  - **Landing Hub**: A high-impact hero segment featuring vibrant background beams and smooth text reveal.
  - **Main Dashboard**: A balanced Bento Grid widget dashboard containing fluid charts and sortable data-tables.
  - **Auth Center**: Sleek login cards incorporating glassmorphism blur and subtle floating perimeter glows.

### 2. UI/UX Design System & Tokens
- **Theme Palette**: Align colors with [${themeKeywords}]. Provide a seamless, dark-mode-first HSL system.
- **Design System Tokens**:
${retrievedTerms.map(t => `  - **${t.name}**: ${t.description}`).join('\n')}

### 3. State Management & Data
- Implement local mock database seeds to populate all dashboard lists.
- Render animated skeleton shimmer loaders while asynchronous states are fetching.
- Trigger responsive toast notifications on successful database updates (e.g. form submission).

### 4. Interactive Micro-animations
- Apply Framer Motion spring physics to all buttons and cards.
- Add magnetic follow cursor effects to primary CTA buttons.
- Integrate interactive Spotlight cards that track mouse movement in grids.`;

  } else if (mode === "page") {
    const componentList = components.length > 0 ? components : ["collapsible sidebar", "KPI metric cards", "data table", "command palette"];
    preamble = `I have compiled a professional-grade prompt to engineer a custom **${pageType}** layout.

By evaluating the specifications you requested, the prompt builder mapped relevant layout guidelines to construct a production-ready component structure.

### Layout Details:
- **Active Grid**: Designed specifically as a structured canvas.
- **Selected Components**: ${componentList.join(', ')}.
- **Design Tokens Injected**:
${termsText}

Here is your copyable page prompt:`;

    compiledText = `Create a responsive, high-end **${pageType}** page using Tailwind CSS or Vanilla CSS. The entire design must be styled around the **${themeName}** theme, incorporating details like [${themeKeywords}].

### 1. Structural Wireframe & Grid
- **Page Container**: Full-screen 100vh height viewport, fluid flex/grid container layout.
- **Component Layout List**:
${componentList.map(c => `  - **${c}**: Positioned with optimal responsive spacing, smooth transitions, and exact HSL hover states.`).join('\n')}

### 2. Design System and Visual Quality
- Implement a highly polished visual hierarchy using standard elevation shadows.
- Frost card elements with backdrop-filter blur effects.
- **Design Tokens Injected**:
${retrievedTerms.map(t => `  - **${t.name}**: ${t.description}. CSS hint: \`${t.snippet.split('\n')[0]}\``).join('\n')}

### 3. Motion & Micro-interactions
- Wire all triggers with micro-interaction hover scaling.
- Set up spring physics page entrance stagger animations.
- Show animated shimmering ghost loaders when cards are in a loading state.`;

  } else if (mode === "component") {
    preamble = `I have compiled an advanced component specification for an interactive **${componentName}**.

This prompt is optimized to generate reusable component assets adhering strictly to premium accessibility and performance criteria.

### Component Features:
- **Target**: Reusable react component.
- **Aesthetic**: Integrated **${themeName}** guidelines.
- **Design Tokens Injected**:
${termsText}

Here is your copyable prompt:`;

    compiledText = `Create a highly reusable, accessible (WAI-ARIA compliant) **${componentName}** component in React using custom Vanilla CSS or CSS Modules. Design it to align with the **${themeName}** theme, incorporating style tokens like [${themeKeywords}].

### 1. Component Interface (API Properties)
- Accept dynamic configuration props including active state, size variants, custom icons, and interactive callback triggers.
- Support comprehensive keyboard navigability (Arrow key focus cycles, Escape dismissals, Enter execution).

### 2. Custom Visual Styling
- Use HSL custom variables to handle theme adaptability.
- Implement glassmorphism overlays and ambient border highlights.
- **Design Tokens Injected**:
${retrievedTerms.map(t => `  - **${t.name}**: ${t.description}. Property rule: \`${t.snippet.split('\n')[0]}\``).join('\n')}

### 3. Dynamic Motion & Feedback
- Trigger micro-interaction scale feedback on toggle click events.
- Smoothly transition focus rings, error validation states, and active state switches.
- Support spring-based entry animations (slide-up, spring bounce).`;

  } else {
    // RAW ENHANCE
    preamble = `I have completed a thorough rewrite and enhancement of your raw development ideas.

I analyzed your raw input: *""${query}""* and enriched it with professional design tokens and micro-interactions.

### Enhancement Summary:
- **Language Level**: Upgraded from standard raw description to a Professional Frontend Prompt.
- **Design Elements**: Added layout structural grid instructions, custom transition definitions, and structural HSL color tokens.
- **Design Tokens Injected**:
${termsText}

Here is your copyable enhanced prompt:`;

    compiledText = `Create a premium, modern user interface based on the following functional guidelines: "${query}". Style the entire interface using the **${themeName}** visual system, executing HSL variables matching [${themeKeywords}].

### 1. Structural Wireframe & Layout Grid
- Implement a modern bento-grid dynamic structure with fluid margins and full-screen layouts.
- Integrate collapsible navigations and collapsible panels to maintain content cleanliness.

### 2. Design Vocabulary & High-End Effects
${retrievedTerms.map(t => `- **${t.name}**: ${t.description}. Implement using: \`${t.snippet}\``).join('\n')}

### 3. UX Guidelines & Quality
- Ensure full keyboard accessibility and keyboard navigable paths.
- Design responsive mobile-first adapters for smooth portable viewing.
- Render animated skeleton placeholders during data load events.

### 4. Interactive Micro-interactions
- Bouncy spring animations on hovering grid panels.
- Add glowing spotlights that chase cursor movement.
- Infinite marquee loop ticker for logo lists.`;
  }

  let codebaseInjectText = "";
  if (framework) {
    codebaseInjectText += `\n\n### 5. UI Framework Directive\n- Strict Framework target: **${framework}**. Conforms to ${framework}'s component structure, design guidelines, and code conventions.`;
  }
  if (codebaseContext) {
    codebaseInjectText += `\n\n### 6. IDE Codebase Integration guidelines\n- Reuse existing styling properties, file configurations, and folder structure. Folder Sync details:\n\`\`\`\n${codebaseContext}\n\`\`\``;
  }

  return `${preamble}

\`\`\`prompt
${compiledText}${codebaseInjectText}
\`\`\`

You can continue chatting with me to refine this prompt! Ask me to add features, modify colors, adjust themes, or inject specific animations.`;
}
