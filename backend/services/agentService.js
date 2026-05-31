import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { resolveAccessibilitySpecs } from "./accessibilitySpecs.js";
import { telemetryService } from "./telemetryService.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize ChatGoogleGenerativeAI Model via LangChain with fail-fast maxRetries: 0
const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.7,
  maxOutputTokens: 4096,
  maxRetries: 0, // Fail fast to trigger immediate failover
});

// Initialize ChatGroq Model via LangChain with fail-fast maxRetries: 0
let groqModel = null;
if (process.env.GROQ_API_KEY) {
  try {
    groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      maxRetries: 0, // Fail fast to trigger immediate failover
    });
  } catch (err) {
    console.error(`[agent] Failed to initialize Groq model: ${err.message}`);
  }
}

/**
 * Orchestrates prompt engineering agent workflow via LangChain.
 * Integrates user intents with RAG retrieved design vectors and visual themes.
 * 
 * @param {object} params
 * @param {string} params.mode
 * @param {string} params.query
 * @param {object} [params.theme]
 * @param {string} [params.category]
 * @param {string} [params.pageType]
 * @param {string[]} [params.components]
 * @param {string} [params.componentName]
 * @param {Array<{role: string, content: string}>} [params.history]
 * @param {object[]} params.retrievedTerms
 * @param {string} [params.modelProvider] - 'gemini' | 'groq'
 * @returns {Promise<string>} Enhanced copiable prompt
 */
export async function runPromptEnhancerAgent({
  mode,
  query,
  theme,
  category,
  pageType,
  components = [],
  componentName,
  history = [],
  retrievedTerms = [],
  codebaseContext,
  framework,
  modelProvider = 'gemini'
}) {
  try {
    // 0. Resolve component-aware accessibility specifications
    const a11yBlock = resolveAccessibilitySpecs({ mode, componentName, components, pageType, query });

    // 1. Construct LangChain System Message with a built-in Self-Critique & Refinement loop directive
    let systemInstruction = `You are a Professional AI Prompt Architect & Senior Frontend Architect. Your goal is to take a user's rough, vague frontend development descriptions and translate them into incredibly detailed, high-fidelity prompts that AI tools like Lovable, Cursor, and v0 understand best.

You will execute a rigorous MULTI-STEP REFINEMENT & CRITIQUE LOOP internally to craft the final output:
1. INTERNAL DRAFTING: Draft a comprehensive UI blueprint layout based on the user's input.
2. SYSTEMATIC CRITIQUE: Critique the draft against the retrieved semantic design tokens and accessibility specifications. Ensure zero placeholders are used.
3. FINAL BLUEPRINT GENERATION: Synthesize the critique and compile a premium production-ready prompt.

You will use professional, highly precise UI/UX design language, components, visual styles, layouts, animations, and motion terminology to guarantee outstanding layout results.

Here is some RETRIEVED SEMANTIC DESIGN DOMAIN KNOWLEDGE from our Supabase Vector Database that you MUST weave into your generated prompt:
${retrievedTerms.map(term => `- **${term.name}** (${term.category}): ${term.description}. CSS Property Example: \`${term.snippet}\``).join('\n')}

${theme ? `The user expects a **${theme.name}** theme. Style Keywords: ${theme.keywords}. Description: ${theme.description}.` : ''}

${framework ? `\nTarget UI Framework: ${framework}. Follow standard development patterns, class configurations, and semantic syntax for ${framework}.\n` : ''}

${codebaseContext ? `\nCRITICAL DIRECTIVE - EXISTING PROJECT INTEGRATION:\nThis UI element must integrate seamlessly into an existing codebase. Here is the user's codebase folder structure and styling patterns gathered from their IDE:\n---START CODEBASE CONTEXT---\n${codebaseContext}\n---END CODEBASE CONTEXT---\nYou MUST structure the generated prompt to strictly fit their current folders layout, reuse their existing styling variables/utilities, and respect their dependency rules.\n` : ''}

${a11yBlock}

CRITICAL FORMATTING INSTRUCTIONS:
1. ALWAYS output your final generated enhanced prompt in a single, distinct code block starting with \`\`\`prompt. Do not use normal markdown backticks or python labels, use ONLY \`\`\`prompt as the opening.
2. In your normal chat dialogue, explain the changes or architectural decisions you made, and outline the technical terminology you injected.
3. Be professional, supportive, and act as a senior software architect. Encourage the user to chat with you to refine details (e.g. colors, transitions, typography).
4. ACCESSIBILITY MANDATE: Every component in the generated prompt MUST include its specific ARIA roles, keyboard navigation pattern, focus management strategy, and the rationale explaining WHY each accessibility requirement exists. Do not omit accessibility — it is a first-class requirement.`;

    // 2. Format User query based on active mode
    let userPromptText = "";
    if (mode === "application") {
      userPromptText = `Generate a comprehensive end-to-end frontend prompt to build an entire application.
Application Category: ${category || 'SaaS Web App'}
User Idea Description: ${query}
Theme Style: ${theme ? theme.name : 'Sleek Modern Dark Mode'}

The prompt should define the complete layout framework (collapsible navigation bar, stickies), state manager structure, mock pages to seed, and details on functional features. Incorporate the retrieved design terms.`;
    } else if (mode === "page") {
      userPromptText = `Generate a highly precise frontend prompt to build a complete page.
Page Type: ${pageType}
Components to Include: ${components.length > 0 ? components.join(', ') : 'Default Recommended components'}
User Idea Description: ${query}
Theme Style: ${theme ? theme.name : 'Sleek Modern Dark Mode'}

The prompt should cover structural layout zones, responsive behaviors (mobile-first), bento-grid widgets, and detailed visual elements. Incorporate the retrieved design terms.`;
    } else if (mode === "component") {
      userPromptText = `Generate a precise, reusable component prompt.
Component Name: ${componentName}
User Idea Description: ${query}
Theme Style: ${theme ? theme.name : 'Sleek Modern Dark Mode'}

The prompt should cover component API properties, accessibility criteria (ARIA), validation transitions, focus states, and spring animations. Incorporate the retrieved design terms.`;
    } else {
      // Enhance mode
      userPromptText = `Enhance the following raw user prompt:
"${query}"
Theme Style: ${theme ? theme.name : 'Sleek Modern Dark Mode'}

Stitch in premium effects, UX characteristics, micro-interactions, responsive tags, and advanced animations. Make it structurally robust and highly detailed.`;
    }

    // 3. Assemble LangChain messages
    const messages = [];

    // Add System Instruction
    messages.push(new SystemMessage(systemInstruction));

    // Convert past history into LangChain messages
    history.forEach(msg => {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else {
        messages.push(new AIMessage(msg.content));
      }
    });

    // Add the current user instruction
    messages.push(new HumanMessage(userPromptText));

    // 4. Select and Invoke LLM model with fallback handling
    let primaryProvider = modelProvider;
    let secondaryProvider = modelProvider === 'gemini' ? 'groq' : 'gemini';

    let primaryModel = primaryProvider === 'gemini' ? geminiModel : groqModel;
    let secondaryModel = secondaryProvider === 'gemini' ? geminiModel : groqModel;

    // Default back to gemini if groq is missing or not configured
    if (primaryProvider === 'groq' && !groqModel) {
      primaryModel = geminiModel;
      primaryProvider = 'gemini';
    }

    const start = Date.now();
    try {
      telemetryService.recordRequest(primaryProvider);
      const response = await primaryModel.invoke(messages);
      telemetryService.recordSuccess(primaryProvider, Date.now() - start);
      return response.content;
    } catch (primaryError) {
      console.warn(`[agent] Primary AI provider ${primaryProvider} failed (${primaryError.message}). Triggering failover to ${secondaryProvider}...`);
      telemetryService.recordFailure(primaryProvider, primaryError.message);
      telemetryService.recordFailover(secondaryProvider);

      if (secondaryModel) {
        const secondaryStart = Date.now();
        try {
          telemetryService.recordRequest(secondaryProvider);
          const response = await secondaryModel.invoke(messages);
          telemetryService.recordSuccess(secondaryProvider, Date.now() - secondaryStart);
          return response.content;
        } catch (secondaryError) {
          telemetryService.recordFailure(secondaryProvider, secondaryError.message);
          console.error(`[agent] Both AI providers failed. Fallback chains exhausted.`);
          throw secondaryError;
        }
      } else {
        console.error(`[agent] Failover model (${secondaryProvider}) is not initialized or configured.`);
        throw primaryError;
      }
    }

  } catch (error) {
    console.error(`[agent] LangChain execution error [${new Date().toISOString()}]: ${error.message}`);
    throw error;
  }
}

