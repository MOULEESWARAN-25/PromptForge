import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

// Initialize ChatGoogleGenerativeAI Model via LangChain
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-3.5-flash",
  temperature: 0.7,
  maxOutputTokens: 2048,
});

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
  retrievedTerms = []
}) {
  try {
    // 1. Construct LangChain System Message
    const systemInstruction = `You are a Professional AI Prompt Architect & Frontend Intent Translator. Your goal is to take a user's rough, vague frontend development descriptions and translate them into incredibly detailed, high-fidelity prompts that AI tools like Lovable, Cursor, and v0 understand best.

You will use professional, highly precise UI/UX design language, components, visual styles, layouts, animations, and motion terminology to guarantee outstanding layout results.

Here is some RETRIEVED SEMANTIC DESIGN DOMAIN KNOWLEDGE from our Supabase Vector Database that you MUST weave into your generated prompt:
${retrievedTerms.map(term => `- **${term.name}** (${term.category}): ${term.description}. CSS Property Example: \`${term.snippet}\``).join('\n')}

${theme ? `The user expects a **${theme.name}** theme. Style Keywords: ${theme.keywords}. Description: ${theme.description}.` : ''}

CRITICAL FORMATTING INSTRUCTIONS:
1. ALWAYS output your final generated enhanced prompt in a single, distinct code block starting with \`\`\`prompt. Do not use normal markdown backticks or python labels, use ONLY \`\`\`prompt as the opening.
2. In your normal chat dialogue, explain the changes or architectural decisions you made, and outline the technical terminology you injected.
3. Be professional, supportive, and act as a senior software architect. Encourage the user to chat with you to refine details (e.g. colors, transitions, typography).`;

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

    // 4. Run LangChain invocation
    const response = await model.invoke(messages);
    
    return response.content;

  } catch (error) {
    console.error("Error running LangChain prompt agent:", error);
    throw error;
  }
}
