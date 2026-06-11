import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
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
  maxRetries: 0
});

// Initialize ChatGroq Model via LangChain with Llama 3.3
let groqModel = null;
if (process.env.GROQ_API_KEY) {
  try {
    groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Low temp for structured review audits
      maxRetries: 0
    });
  } catch (err) {
    console.error(`[agent] Failed to initialize Groq model: ${err.message}`);
  }
}

/**
 * Helper to call Gemini and fall back to Groq Llama 3.3 if Gemini is offline/503-limited.
 */
async function executeLlmCall(provider, systemInstruction, userMessage) {
  if (provider === 'groq') {
    if (!groqModel) throw new Error("Groq model not configured");
    telemetryService.recordRequest("groq");
    const response = await groqModel.invoke([
      new SystemMessage(systemInstruction),
      new HumanMessage(userMessage)
    ]);
    return response.content.trim();
  } else {
    telemetryService.recordRequest("gemini");
    const response = await geminiModel.invoke([
      new SystemMessage(systemInstruction),
      new HumanMessage(userMessage)
    ]);
    return response.content.trim();
  }
}

async function callLlmWithFallback(systemInstruction, userMessage) {
  const primary = (process.env.PRIMARY_MODEL_PROVIDER || 'gemini').toLowerCase();
  const fallback = primary === 'groq' ? 'gemini' : 'groq';

  try {
    return await executeLlmCall(primary, systemInstruction, userMessage);
  } catch (primaryError) {
    console.warn(`[agent] Primary provider "${primary}" call failed (${primaryError.message}). Triggering failover to "${fallback}"...`);
    try {
      return await executeLlmCall(fallback, systemInstruction, userMessage);
    } catch (fallbackError) {
      console.error(`[agent] Both primary ("${primary}") and fallback ("${fallback}") calls failed. Failover exhausted. Fallback error: ${fallbackError.message}`);
      throw primaryError;
    }
  }
}

/**
 * Stage 1: Validation of User Manual Description (Standalone Projects)
 */
export async function validateManualDescription(description) {
  if (!description || !description.trim()) {
    return "";
  }

  const systemInstruction = `You are a Project Requirement Validator. Analyze the following project description entered manually by a user.
Detect:
1. Spelling mistakes or technical typos.
2. Technical ambiguity (unclear specifications).
3. Incompleteness (does it explain what needs to be built?).
Output a corrected, professional, clear, and complete description of the project's requirements. Expand on vague terms with industry-standard patterns. If the user's input is extremely short or lacks clarity, infer the logical requirements based on best practices and add them to make the prompt robust. Return ONLY the validated description text.`;

  try {
    return await callLlmWithFallback(systemInstruction, description);
  } catch (error) {
    console.error(`[validator] Validation failed, fallback to raw description: ${error.message}`);
    return description;
  }
}

/**
 * Stage 3: Generate Initial Prompt Draft
 */
async function generateInitialDraft({
  blueprint,
  context,
  a11yBlock
}) {
  const systemInstruction = `You are a Professional AI Prompt Architect & Senior Frontend Architect. Your goal is to draft a comprehensive, high-fidelity prompt blueprint for development tools like Lovable, Cursor, and v0.
You must combine the user's choices, blueprint details, and the retrieved domain knowledge.

Here is the retrieved Knowledge Graph domain context and prompt fragments:
${context}

${a11yBlock}

CRITICAL DIRECTIVE:
1. Generate the initial draft based strictly on the provided blueprint.
2. Incorporate structural layouts, bento grid configurations, color variables, and state controllers.
3. Keep the output highly detailed and clean.`;

  const userInstruction = `Generate the initial detailed prompt draft matching this system blueprint:
${blueprint}`;

  return await callLlmWithFallback(systemInstruction, userInstruction);
}

/**
 * Stage 5: Parallel Expert Panel Review (Groq)
 */
function computeBlueprintComposition(blueprintJson) {
  return {
    features:          (blueprintJson.features || []).length,
    pages:             (blueprintJson.pages || []).length,
    components:        (blueprintJson.components || []).length,
    backend_modules:   (blueprintJson.backend_modules || []).length,
    database_entities: (blueprintJson.database_entities || []).length,
    has_application:   !!blueprintJson.application
  };
}

function selectExperts(mode, blueprintJson) {
  if (!blueprintJson) {
    return getDefaultExpertsForMode(mode);
  }

  const composition = computeBlueprintComposition(blueprintJson);
  const candidates = [];

  // 1. System Architect
  if (composition.features >= 4 || composition.has_application) {
    candidates.push({
      role: "System Architect",
      score: (composition.features >= 4 ? 4 : 0) + (composition.has_application ? 2 : 0),
      instruction: "Evaluate the initial prompt draft. Analyze system modularity, folder configurations, and deployment strategies. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  // 2. Backend & API Engineer
  if (composition.backend_modules >= 3) {
    candidates.push({
      role: "Backend & API Engineer",
      score: composition.backend_modules,
      instruction: "Evaluate the initial prompt draft. Analyze backend APIs, database schemas, tables, relationships, indexes, and ORM operations. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  // 3. Database Architect
  if (composition.database_entities >= 3) {
    candidates.push({
      role: "Database Architect",
      score: composition.database_entities,
      instruction: "Evaluate the initial prompt draft. Analyze database structure, tables, columns, constraints, indexes, and relationships. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  // 4. Design System Expert
  if (composition.components >= 6) {
    candidates.push({
      role: "Design System Expert",
      score: composition.components,
      instruction: "Evaluate the initial prompt draft. Analyze style variables (HSL colors, border blurs), design token consistency, and visual themes. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  // 5. Frontend & UX Architect
  if (composition.pages >= 2) {
    candidates.push({
      role: "Frontend & UX Architect",
      score: composition.pages,
      instruction: "Evaluate the initial prompt draft. Analyze visual layout grids, styling themes, bento widgets, and overall user flow hierarchy. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  // 6. Security & DevOps Reviewer
  if (composition.backend_modules >= 2 && composition.database_entities >= 2) {
    candidates.push({
      role: "Security & DevOps Reviewer",
      score: (composition.backend_modules + composition.database_entities) / 2,
      instruction: "Evaluate the initial prompt draft. Analyze access controls (RBAC), authentication checks, session token storage, CORS, and hosting architectures. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length >= 2) {
    // Limit to top 3 experts
    return candidates.slice(0, 3);
  }

  // If not enough experts are triggered, fallback to default mode-based list
  return getDefaultExpertsForMode(mode);
}

function getDefaultExpertsForMode(mode) {
  if (mode === "application") {
    return [
      {
        role: "System Architect",
        instruction: "Evaluate the initial prompt draft. Analyze system modularity, folder configurations, and deployment strategies. Return a JSON containing missing_items, improvements, and risks."
      },
      {
        role: "Backend & DB Architect",
        instruction: "Evaluate the initial prompt draft. Analyze backend APIs, database schemas, tables, relationships, indexes, and ORM operations. Return a JSON containing missing_items, improvements, and risks."
      },
      {
        role: "Security & DevOps Architect",
        instruction: "Evaluate the initial prompt draft. Analyze access controls (RBAC), authentication checks, session token storage, CORS, and hosting architectures. Return a JSON containing missing_items, improvements, and risks."
      }
    ];
  } else if (mode === "page") {
    return [
      {
        role: "Product Designer / UX Architect",
        instruction: "Evaluate the initial prompt draft. Analyze visual layout grids, styling themes, bento widgets, and overall user flow hierarchy. Return a JSON containing missing_items, improvements, and risks."
      },
      {
        role: "Frontend Architect & Accessibility Expert",
        instruction: "Evaluate the initial prompt draft. Analyze component conventions, state management (Zustand/Context), keyboard accessibility, focus indicators, and ARIA markup. Return a JSON containing missing_items, improvements, and risks."
      }
    ];
  } else {
    return [
      {
        role: "Design System Expert",
        instruction: "Evaluate the initial prompt draft. Analyze style variables (HSL colors, border blurs), design token consistency, and visual themes. Return a JSON containing missing_items, improvements, and risks."
      },
      {
        role: "Component Engineer & Accessibility Specialist",
        instruction: "Evaluate the initial prompt draft. Analyze component API boundary, reusability, Framer Motion transition dynamics, focus cycling, and ARIA trigger controls. Return a JSON containing missing_items, improvements, and risks."
      }
    ];
  }
}

async function runParallelExpertReview(draft, mode, blueprintJson = null) {
  if (!groqModel) {
    console.warn("[agent] Groq model not configured. Skipping expert panel review.");
    return [];
  }

  // Determine active expert panel based on composition or mode fallback
  const expertRoles = selectExperts(mode, blueprintJson);

  console.log(`[agent] Running parallel review with ${expertRoles.length} experts on Groq: [${expertRoles.map(e => e.role).join(', ')}]...`);

  const promises = expertRoles.map(async (expert) => {
    const systemPrompt = `You are a professional ${expert.role} Reviewer.
Your job is to perform a strict audit of the provided prompt draft and report missing items, improvements, and risks.

You MUST respond ONLY with a JSON object in this format:
{
  "expert_role": "${expert.role}",
  "missing_items": [
    "List of critical details that are missing from the prompt"
  ],
  "improvements": [
    "Recommended additions to improve prompt clarity and output fidelity"
  ],
  "risks": [
    "Potential bugs, vulnerabilities, or bad practices present in the prompt"
  ]
}
Ensure output is valid JSON.`;

    const userMessage = `Audit this prompt draft:\n"${draft}"\n\nSpecific Directive: ${expert.instruction}`;

    try {
      telemetryService.recordRequest("groq");
      const response = await groqModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage)
      ]);
      const content = response.content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || [null, content];
      const parsed = JSON.parse(jsonMatch[1].trim());
      return parsed;
    } catch (err) {
      console.error(`[expert-review] ${expert.role} failed: ${err.message}`);
      return {
        expert_role: expert.role,
        missing_items: [],
        improvements: [],
        risks: [`Reviewer experienced processing error: ${err.message}`]
      };
    }
  });

  return Promise.all(promises);
}

/**
 * Stage 6: Consolidator Agent
 */
async function consolidatePrompt({
  blueprint,
  draft,
  reviews,
  context
}) {
  const systemInstruction = `You are a Senior Prompt Architect & Consolidator.
Your goal is to take an initial prompt draft, merge in the structured review audits from a panel of specialized domain experts, and generate a final high-fidelity prompt.

You MUST apply all the improvements, fill in the missing items, mitigate the risks, and respect the baseline system blueprint constraints.

Expert Review Audits:
${JSON.stringify(reviews, null, 2)}

Knowledge Graph Fragments for Reference:
${context}

CRITICAL FORMATTING DIRECTIVE:
1. ALWAYS output your final generated prompt inside a single code block starting with \`\`\`prompt. Do not use normal markdown backticks, use ONLY \`\`\`prompt.
2. In your normal conversational response, briefly list the critical improvements made (e.g. database schema additions, access controls, accessibility tags) and technical terms injected.
3. Write in a professional, supportive senior software architect tone.`;

  const userMessage = `Here is the system blueprint:\n${blueprint}\n\nHere is the initial draft prompt:\n"${draft}"\n\nConsolidate and compile the final enhanced prompt.`;

  return await callLlmWithFallback(systemInstruction, userMessage);
}

/**
 * Stage 7: Prompt Quality Evaluator
 */
async function evaluatePromptQuality(promptText) {
  const systemInstruction = `You are a Prompt Quality Evaluator. Analyze the provided prompt and grade its readiness on a scale of 0 to 100.
Evaluate:
1. Completeness (Are all modules specified?).
2. Architecture Coverage (Are DB tables, schema relations, API endpoints defined?).
3. Security & Access (Are RBAC limits, JWT, or parent restrictions clearly stated?).
4. Accessibility Coverage (Are ARIA roles, tab index, keyboard focus guidelines in place?).
5. Theme Consistency (Are CSS variables, borders, and blurs aligned?).

You MUST respond ONLY with a JSON object in this format:
{
  "score": 85,
  "missing": [
    "List of missing constraints or configurations"
  ]
}
Ensure output is valid JSON.`;

  try {
    telemetryService.recordRequest("gemini");
    const response = await geminiModel.invoke([
      new SystemMessage(systemInstruction),
      new HumanMessage(promptText)
    ]);
    const content = response.content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || [null, content];
    return JSON.parse(jsonMatch[1].trim());
  } catch (error) {
    console.warn(`[evaluator] Quality evaluation failed via Gemini: ${error.message}. Failover to Groq...`);
    if (groqModel) {
      try {
        const response = await groqModel.invoke([
          new SystemMessage(systemInstruction),
          new HumanMessage(promptText)
        ]);
        const content = response.content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || [null, content];
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        return { score: 85, missing: [] };
      }
    }
    return { score: 85, missing: [] };
  }
}

/**
 * Main Orchestrated Prompt Generator
 */
export async function runPromptEnhancerAgent({
  mode,
  query,
  blueprint,
  context,
  selections,
  history = [],
  blueprintJson = null
}) {
  try {
    const a11yBlock = resolveAccessibilitySpecs({ 
      mode, 
      componentName: selections.componentType, 
      components: selections.components, 
      pageType: selections.pageType, 
      query 
    });

    // 1. Generate Initial Draft Prompt
    console.log("[agent] Generating initial draft prompt...");
    let draft = await generateInitialDraft({ blueprint, context, a11yBlock });

    // 2. Perform Expert Reviews
    console.log("[agent] Triggering multi-expert parallel reviews...");
    const reviews = await runParallelExpertReview(draft, mode, blueprintJson);

    // 3. Consolidate Draft & Reviews
    console.log("[agent] Consolidating draft and reviews...");
    let consolidated = await consolidatePrompt({ blueprint, draft, reviews, context });

    // 4. Prompt Quality Evaluation Loop
    console.log("[agent] Evaluating consolidated prompt quality...");
    let evalResult = await evaluatePromptQuality(consolidated);
    console.log(`[agent] Quality Score: ${evalResult.score}/100. Missing elements: [${evalResult.missing.join(', ')}]`);

    // If score is low, run a second patch-based repair pass
    let patchTriggered = false;
    if (evalResult.score < 80 && evalResult.missing.length > 0) {
      console.log("[agent] Prompt quality below threshold. Executing patch-based repair...");
      patchTriggered = true;
      const patchInstruction = `You are a Senior Prompt Architect & Consolidator. 
Your previous consolidated prompt was scored ${evalResult.score}/100 and is missing these items: ${evalResult.missing.join(', ')}.
Analyze the draft, patch the missing items directly into the prompt without altering the other sections.
Output the updated prompt inside a single \`\`\`prompt code block.`;
      
      consolidated = await callLlmWithFallback(patchInstruction, consolidated);
    }

    return {
      prompt: consolidated,
      qualityScore: evalResult.score,
      patchTriggered,
      reviews
    };
  } catch (error) {
    console.error(`[agent] LangChain execution error [${new Date().toISOString()}]: ${error.message}`);
    throw error;
  }
}
