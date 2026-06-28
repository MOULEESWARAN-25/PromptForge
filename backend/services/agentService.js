import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { resolveAccessibilitySpecs } from "./accessibilitySpecs.js";
import { telemetryService } from "./telemetryService.js";
import { AI_CONFIG } from "../config/ai.js";
import { INJECTION_PATTERNS, SECRET_PATTERNS } from "../config/security.js";
import { supabase } from "./supabaseClient.js";
import { CACHE_CONFIG } from "../config/cache.js";
import { loadPromptTemplate, PromptAssembler } from "./promptAssembler.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Cost-optimized Small Model Tier (gemini-2.5-flash)
const geminiFlashModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.7,
  maxOutputTokens: 4096,
  maxRetries: 0
});

// Flagship Large Model Tier (gemini-2.5-pro)
const geminiProModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-pro",
  temperature: 0.4,
  maxOutputTokens: 8192,
  maxRetries: 0
});

// Initialize ChatGroq Model via LangChain with Llama 3.3
let groqModel = null;
if (process.env.GROQ_API_KEY) {
  try {
    groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: AI_CONFIG.models.groq.name,
      temperature: AI_CONFIG.models.groq.temperature,
      maxRetries: 0
    });
  } catch (err) {
    console.error(`[agent] Failed to initialize Groq model: ${err.message}`);
  }
}

/**
 * Injection shield validation helper with Unicode normalization
 */
export function detectPromptInjection(text) {
  if (!text) return false;
  // Enforce Unicode normalization to prevent bypasses
  const normalized = text.normalize("NFKC");
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }
  return false;
}

/**
 * Sanitizes secret keys and API keys from prompt strings
 */
export function stripSecrets(text) {
  if (!text) return text;
  let sanitized = text;
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[STRIPPED_SECRET]");
  }
  return sanitized;
}

/**
 * Decoupled Intent Classifier
 * Classifies if the query is a design token request or a code generation request.
 */
export function classifyIntent(query, mode) {
  if (!query) return "generation_intent";
  
  const normalized = query.toLowerCase().trim();
  const designIndicators = [
    "spacing", "padding", "margin", "color scale", "color palette", 
    "typography", "font size", "border radius", "design token", 
    "folder path", "naming convention", "tailwind config", "theme token"
  ];
  
  const match = designIndicators.some(indicator => normalized.includes(indicator));
  if (match) {
    console.log(`[agent] Query classified as [design_intent]`);
    return "design_intent";
  }
  
  return "generation_intent";
}

/**
 * Decoupled Complexity Classifier
 * Analyzes multiple query signals to classify request complexity.
 */
export function classifyComplexity(query, mode, selections = {}) {
  let score = 0;
  
  if (mode === "application") score += 5;
  if (mode === "page") score += 2;
  
  // 1. Analyze word count
  const words = (query || "").trim().split(/\s+/).length;
  if (words > 40) score += 3;
  else if (words > 15) score += 1;
  
  // 2. Check selections complexity
  if (selections.components && selections.components.length > 3) score += 2;
  if (selections.framework && selections.framework !== "Tailwind CSS") score += 1;
  if (selections.database) score += 2;
  
  const complexity = score >= 4 ? "complex" : "simple";
  console.log(`[agent] Query complexity evaluated: [${complexity}] (Score: ${score})`);
  return complexity;
}

/**
 * Local Rule Compiler for 0-cost deterministic queries
 */
export function compileLocalRulePrompt(query, selections = {}) {
  const themeName = selections.theme || "Sleek Dark Glassmorphic";
  const typography = selections.typography || "Inter";
  
  return `### Compiled UI Specification (Deterministic Local Compiler)
Generated via Local Rule Engine. Model provider calls bypassed.

#### 1. Theme Configuration: ${themeName}
- **Typography Scale**: Primary application font set to ${typography}.
- **Spacing Scale Variables**:
  - \`--space-xs\`: 4px (Chips, margins)
  - \`--space-sm\`: 8px (Input inner margins)
  - \`--space-md\`: 12px (Borders, card paddings)
  - \`--space-lg\`: 16px (Card margins)
  - \`--space-xl\`: 24px (Layout wrappers)
- **Radius Tokens**:
  - \`--radius-sm\`: 6px
  - \`--radius-md\`: 8px
  - \`--radius-lg\`: 12px

#### 2. Layout Structure & Naming Guidelines
- Folder Hierarchy: Use standard \`src/components/ui/\` for design primitives.
- Code Style: Modular functional components, clean CSS classes.
- Accessibilities: Full keyboard arrow navigation and focus indicators.
`;
}

// Provider dynamic health status tracking (ADR compliant)
const providerHealth = {
  gemini: { healthy: true, lastErrorTime: 0 },
  groq: { healthy: true, lastErrorTime: 0 }
};
const HEALTH_COOLDOWN_MS = 60000; // 1 minute cooldown before retrying an unhealthy model provider

function updateProviderHealth(provider, isHealthy) {
  if (providerHealth[provider]) {
    providerHealth[provider].healthy = isHealthy;
    if (!isHealthy) {
      providerHealth[provider].lastErrorTime = Date.now();
    }
  }
}

function isProviderHealthy(provider) {
  const status = providerHealth[provider];
  if (!status) return true;
  if (!status.healthy) {
    if (Date.now() - status.lastErrorTime > HEALTH_COOLDOWN_MS) {
      status.healthy = true; // Auto-recover cooldown elapsed
      return true;
    }
    return false;
  }
  return true;
}

async function executeLlmCall(provider, systemInstruction, userMessage, modelTier = 'large', requestId) {
  const reqId = requestId || 'unknown';
  
  const sanitizedUserMessage = stripSecrets(userMessage);
  const sanitizedSystemInstruction = stripSecrets(systemInstruction);
  const startTime = Date.now();

  try {
    if (provider === 'groq') {
      if (!groqModel) throw new Error("Groq model not configured");
      telemetryService.recordRequest("groq");
      const response = await groqModel.invoke([
        new SystemMessage(sanitizedSystemInstruction),
        new HumanMessage(sanitizedUserMessage)
      ]);
      const duration = Date.now() - startTime;
      telemetryService.recordSuccess("groq", duration);
      return response.content.trim();
    } else {
      telemetryService.recordRequest("gemini");
      const modelInstance = modelTier === 'small' ? geminiFlashModel : geminiProModel;
      const response = await modelInstance.invoke([
        new SystemMessage(sanitizedSystemInstruction),
        new HumanMessage(sanitizedUserMessage)
      ]);
      const duration = Date.now() - startTime;
      telemetryService.recordSuccess("gemini", duration);
      return response.content.trim();
    }
  } catch (err) {
    telemetryService.recordFailure(provider, err.message);
    throw err;
  }
}

/**
 * Task-based routing mapping LLM calls to respective provider configurations with Health Failovers and Cooldowns
 */
export async function executeLlmTask(taskType, systemInstruction, userMessage, modelTierOrRequestId = 'large', requestId) {
  let modelTier = 'large';
  let reqId = typeof modelTierOrRequestId === 'string' && modelTierOrRequestId.includes('-') ? modelTierOrRequestId : requestId;
  if (modelTierOrRequestId === 'small' || modelTierOrRequestId === 'large') {
    modelTier = modelTierOrRequestId;
  }
  
  const actualReqId = reqId || 'unknown';
  let primary, fallback;

  if (taskType === 'expert_review') {
    primary = AI_CONFIG.ReviewProvider;
    fallback = AI_CONFIG.PrimaryGenerationProvider;
  } else {
    primary = AI_CONFIG.PrimaryGenerationProvider;
    fallback = AI_CONFIG.ReviewProvider;
  }

  // Dynamic Routing Swap if primary is registered as unhealthy
  if (!isProviderHealthy(primary) && isProviderHealthy(fallback)) {
    console.warn(`[req:${actualReqId}] [agent] Primary provider "${primary}" is flagged unhealthy. Routing dynamically to healthy fallback "${fallback}"...`);
    const temp = primary;
    primary = fallback;
    fallback = temp;
  }

  console.log(`[req:${actualReqId}] [agent] Task "${taskType}" routed to provider: ${primary} (Model Tier: ${modelTier})`);

  try {
    const result = await executeLlmCall(primary, systemInstruction, userMessage, modelTier, actualReqId);
    updateProviderHealth(primary, true);
    return result;
  } catch (primaryError) {
    updateProviderHealth(primary, false);
    console.warn(`[req:${actualReqId}] [agent] Task "${taskType}" provider "${primary}" failed (${primaryError.message}). Triggering failover to "${fallback}"...`);
    try {
      const result = await executeLlmCall(fallback, systemInstruction, userMessage, modelTier, actualReqId);
      updateProviderHealth(fallback, true);
      return result;
    } catch (fallbackError) {
      updateProviderHealth(fallback, false);
      console.error(`[req:${actualReqId}] [agent] Both primary ("${primary}") and fallback ("${fallback}") calls failed for task "${taskType}". Error: ${fallbackError.message}`);
      throw primaryError;
    }
  }
}

/**
 * Stage 1: Validation of User Manual Description (Standalone Projects)
 */
export async function validateManualDescription(description, requestId) {
  if (!description || !description.trim()) {
    return "";
  }

  if (detectPromptInjection(description)) {
    const err = new Error("Prompt injection attempt detected in project description.");
    err.errorCode = "PROMPT_VALIDATION_FAILED";
    throw err;
  }

  const systemInstruction = `You are a Project Requirement Validator. Analyze the following project description entered manually by a user.
Detect:
1. Spelling mistakes or technical typos.
2. Technical ambiguity (unclear specifications).
3. Incompleteness (does it explain what needs to be built?).
Output a corrected, professional, clear, and complete description of the project's requirements. Expand on vague terms with industry-standard patterns. If the user's input is extremely short or lacks clarity, infer the logical requirements based on best practices and add them to make the prompt robust. Return ONLY the validated description text.`;

  try {
    return await executeLlmTask('validation', systemInstruction, description, 'small', requestId);
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
  a11yBlock,
  requestId,
  selections,
  themeDetails
}) {
  const baseTemplate = loadPromptTemplate("generation", "v1.md");
  
  const assembled = PromptAssembler.assemble({
    baseTemplate,
    blueprint,
    context,
    a11yBlock,
    themeDetails,
    framework: selections.framework
  });

  const complexity = classifyComplexity(blueprint, selections.mode, selections);
  const isProfessionalMode = selections.generationMode === "professional";
  const modelTier = (complexity === "complex" || isProfessionalMode) ? "large" : "small";

  return await executeLlmTask('drafting', assembled.systemInstruction, assembled.userMessage, modelTier, requestId);
}

/**
 * Stage 5: Parallel Expert Panel Review (Groq Llama 3.3)
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
  const composition = blueprintJson ? computeBlueprintComposition(blueprintJson) : { components: 0, pages: 0, backend_modules: 0 };
  const candidates = [];

  if (composition.features >= 4 || composition.has_application) {
    candidates.push({
      role: "System Architect",
      score: 5,
      instruction: "Evaluate the initial prompt draft. Analyze system modularity, folder configurations, and deployment strategies. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  if (composition.backend_modules >= 3) {
    candidates.push({
      role: "Backend & API Engineer",
      score: 4,
      instruction: "Evaluate the initial prompt draft. Analyze backend APIs, database schemas, tables, relationships, indexes, and ORM operations. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  if (composition.components >= 4) {
    candidates.push({
      role: "Design System Expert",
      score: 4,
      instruction: "Evaluate the initial prompt draft. Analyze style variables (HSL colors, border blurs), design token consistency, and visual themes. Return a JSON containing missing_items, improvements, and risks."
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 2);
}

async function runParallelExpertReview(draft, mode, blueprintJson = null, requestId) {
  const reqId = requestId || 'unknown';
  const expertRoles = selectExperts(mode, blueprintJson);

  console.log(`[req:${reqId}] [agent] Running parallel review with ${expertRoles.length} experts...`);

  const baseReviewPrompt = loadPromptTemplate("review", "v1.md");

  const promises = expertRoles.map(async (expert) => {
    const systemPrompt = baseReviewPrompt.replace("Expert Role Name", expert.role);
    const userMessage = `Audit this prompt draft:\n"${draft}"\n\nSpecific Directive: ${expert.instruction}`;

    try {
      const responseContent = await executeLlmTask('expert_review', systemPrompt, userMessage, requestId);
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/) || [null, responseContent];
      const parsed = JSON.parse(jsonMatch[1].trim());
      
      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Expert review output is not a JSON object");
      }
      return parsed;
    } catch (err) {
      console.error(`[req:${reqId}] [expert-review] ${expert.role} failed: ${err.message}`);
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
  context,
  requestId
}) {
  const systemInstruction = loadPromptTemplate("consolidation", "v1.md")
    .replace("${reviews}", JSON.stringify(reviews, null, 2))
    .replace("${context}", context || "");

  const userMessage = `Here is the system blueprint:\n${blueprint}\n\nHere is the initial draft prompt:\n"${draft}"\n\nConsolidate and compile the final enhanced prompt.`;

  return await executeLlmTask('consolidation', systemInstruction, userMessage, requestId);
}

/**
 * Stage 7: Prompt Quality Evaluator
 */
async function evaluatePromptQuality(promptText, requestId) {
  const reqId = requestId || 'unknown';
  const systemInstruction = loadPromptTemplate("evaluation", "v1.md");

  try {
    const responseContent = await executeLlmTask('quality_evaluation', systemInstruction, promptText, requestId);
    const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || responseContent.match(/```\n([\s\S]*?)\n```/) || [null, responseContent];
    const parsed = JSON.parse(jsonMatch[1].trim());
    
    if (!parsed || typeof parsed !== 'object' || typeof parsed.score !== 'number') {
      throw new Error("Quality evaluator output must contain a numeric 'score' field");
    }
    return parsed;
  } catch (error) {
    console.warn(`[req:${reqId}] [evaluator] Quality evaluation failed: ${error.message}`);
    return { score: 85, missing: [] };
  }
}

/**
 * Hybrid Semantic Cache Lookup
 * Evaluates keyword overlap, intent, and workspace selectors (Mode, Theme, Category, Framework, Component)
 */
export async function checkSemanticCache({
  query,
  mode,
  selections = {},
  threshold,
  requestId
}) {
  const reqId = requestId || 'unknown';
  try {
    const { data: pastRecords, error } = await supabase
      .from('prompt_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.warn(`[req:${reqId}] [cache] Supabase history fetch failed: ${error.message}`);
      return null;
    }

    if (!pastRecords || pastRecords.length === 0) return null;

    const finalThreshold = threshold || CACHE_CONFIG.CACHE_SIMILARITY_THRESHOLD || 0.92;

    for (const record of pastRecords) {
      // 1. Structural filters (Workspace mode, theme, category, component name)
      if (record.mode !== mode) continue;
      if (record.category !== (selections.category || selections.appCategory || "")) continue;
      if (record.page_type !== (selections.pageType || "")) continue;
      if (record.component_name !== (selections.componentName || selections.componentType || "")) continue;

      // 2. Query similarity (exact check)
      const q1 = (query || "").toLowerCase().trim();
      const q2 = (record.query || "").toLowerCase().trim();

      if (q1 === q2) {
        console.log(`[req:${reqId}] [cache] Exact match semantic cache hit: "${record.title}"`);
        return record.resolved_prompt;
      }

      // 3. Keyword / Jaccard similarity check
      const tokens1 = q1.split(/\s+/).filter(Boolean);
      const tokens2 = q2.split(/\s+/).filter(Boolean);
      if (tokens1.length === 0 || tokens2.length === 0) continue;

      const set1 = new Set(tokens1);
      const set2 = new Set(tokens2);

      const intersection = tokens1.filter(t => set2.has(t));
      const JaccardScore = intersection.length / Math.max(set1.size, set2.size);

      if (JaccardScore >= finalThreshold) {
        console.log(`[req:${reqId}] [cache] Hybrid Jaccard cache hit: similarity score ${JaccardScore.toFixed(3)} >= ${finalThreshold}`);
        return record.resolved_prompt;
      }
    }
  } catch (err) {
    console.warn(`[req:${reqId}] [cache] Semantic cache error: ${err.message}`);
  }
  return null;
}

/**
 * Run non-blocking visual content quality check on enhanced prompt string.
 * Detects structural or stylistic anomalies like repetitions, list gaps, unfinished strings.
 */
export function contentQualityCheck(promptText) {
  if (!promptText) return [];
  const warnings = [];
  const lines = promptText.split('\n');
  
  // 1. Repetitive paragraphs
  const seenParagraphs = new Set();
  // 2. Duplicate headings
  const seenHeadings = new Set();
  // 3. Repeated bullet points
  const seenBullets = new Set();

  let expectedNum = 1;
  let inNumberedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }

    // A. Check repetitive paragraphs (ignore short titles/labels/headings/bullets)
    if (line.length > 50 && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*') && !/^\d+\./.test(line)) {
      if (seenParagraphs.has(line)) {
        warnings.push(`Repetitive paragraph detected on line ${i + 1}: "${line.slice(0, 40)}..."`);
      } else {
        seenParagraphs.add(line);
      }
    }

    // B. Check duplicate headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[2].trim().toLowerCase();
      if (seenHeadings.has(headingText)) {
        warnings.push(`Duplicate heading section detected on line ${i + 1}: "${headingMatch[2]}"`);
      } else {
        seenHeadings.add(headingText);
      }
      inNumberedList = false;
    }

    // C. Check repeated bullet points
    const bulletMatch = line.match(/^(\s*[-*+]\s+)(.+)$/);
    if (bulletMatch) {
      const bulletText = bulletMatch[2].trim().toLowerCase();
      if (seenBullets.has(bulletText)) {
        warnings.push(`Repeated bullet point content detected on line ${i + 1}: "${bulletMatch[2].slice(0, 30)}..."`);
      } else {
        seenBullets.add(bulletText);
      }
      inNumberedList = false;
    }

    // D. Check unfinished sections or ... placeholders
    if (line.endsWith('...') || line.endsWith('etc.')) {
      if (line.match(/\b(and so on\.\.\.|etc\.\.\.|\.\.\.)$/i) || line === '...') {
        warnings.push(`Line ${i + 1} contains unfinished syntax placeholder or trail: "${line.slice(0, 35)}..."`);
      }
    }
    if (/\b(TBD|COMING SOON|UNDER DEVELOPMENT|LOREM IPSUM)\b/i.test(line)) {
      warnings.push(`Line ${i + 1} contains draft placeholder: "${line.slice(0, 35)}..."`);
    }

    // E. Check inconsistent numbering
    const numMatch = line.match(/^(\d+)\.\s+/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      if (!inNumberedList) {
        inNumberedList = true;
        expectedNum = num;
      }
      if (num !== expectedNum) {
        warnings.push(`Inconsistent list numbering on line ${i + 1}: Expected "${expectedNum}.", found "${num}."`);
        expectedNum = num; // self-correct
      }
      expectedNum++;
    } else if (!line.startsWith('-') && !line.startsWith('*')) {
      inNumberedList = false;
    }
  }

  return warnings;
}

/**
 * Layered programmatic validation pipeline checking the AI prompt output.
 * Output ➔ Schema validator ➔ Required sections validator ➔ Developer terminology validator ➔ Placeholder validator ➔ Markdown validator ➔ Length validator ➔ Return
 */
export function validatePromptOutput(promptText) {
  const errors = [];
  if (!promptText) {
    return { isValid: false, errors: ["Prompt output is empty."] };
  }

  // 1. Schema validator
  const hasPromptWrapper = promptText.includes("```prompt") || promptText.includes("```");
  if (!hasPromptWrapper) {
    errors.push("Schema Validation Error: Output must contain standard markdown code block fences (```prompt).");
  }
  
  // Extracts any nested ```json ... ``` blocks and parses them to ensure valid JSON
  const jsonRegex = /```json\n([\s\S]*?)\n```/g;
  let match;
  let blockIndex = 1;
  while ((match = jsonRegex.exec(promptText)) !== null) {
    const jsonContent = match[1].trim();
    try {
      JSON.parse(jsonContent);
    } catch (err) {
      errors.push(`Schema Validation Error: Embedded JSON block #${blockIndex} is not parseable JSON: ${err.message}`);
    }
    blockIndex++;
  }

  const promptLower = promptText.toLowerCase();

  // 2. Required sections validator
  const requiredSections = [
    "overview",
    "folder structure",
    "hsl",
    "state flow",
    "api contract",
    "accessibility"
  ];
  requiredSections.forEach(section => {
    if (!promptLower.includes(section)) {
      errors.push(`Required Sections Validation Error: Missing section keyword "${section}".`);
    }
  });

  // 3. Developer terminology validator (Internal Leakage Shield)
  // Treats "no internal implementation details" as a general policy
  const internalFilenames = /\b(server\.js|agentService\.js|telemetryService\.js|supabaseClient\.js|databaseClient\.js|purgeTelemetry\.js|evaluate-prompts\.js|seed\.js|regression-test\.js|config\/[a-zA-Z0-9_-]+\.js|\d{3}_[\w-]+\.sql)\b/i;
  if (internalFilenames.test(promptText)) {
    errors.push("Developer Terminology Leakage Error: Internal source filename or sql migration filename is exposed.");
  }

  const serviceNames = /\b(telemetryService|observabilityService|agentService|contextBuilder)\b/i;
  if (serviceNames.test(promptText)) {
    errors.push("Developer Terminology Leakage Error: Internal service agent/builder name is exposed.");
  }

  const databaseTables = /\b(prompt_history|app_categories|page_templates|components|starter_templates|users)\b/i;
  if (databaseTables.test(promptText)) {
    errors.push("Developer Terminology Leakage Error: Internal database table schema names are exposed.");
  }

  // Model provider IDs/names
  const providerNames = /\b(gemini|groq|llama|openai|claude|anthropic|gemini-2\.5-flash|gemini-2\.5-pro)\b/i;
  if (providerNames.test(promptText)) {
    errors.push("Developer Terminology Leakage Error: Internal AI model engine or provider ID is exposed.");
  }

  // Internal telemetry/cache/retry parameters
  const telemetryParams = /\b(avgLatency|cacheHitPercentage|retryPercentage|retry_count|cache_hit|telemetry_source|engine_version|latency_ms)\b/i;
  if (telemetryParams.test(promptText)) {
    errors.push("Developer Terminology Leakage Error: Internal telemetry, cache stats, or validation parameter names are exposed.");
  }

  // Stack traces and raw errors
  const stackTraces = /(stack trace|exception thrown|debug metadata|at\s+[\w.-]+\s+\([\w.-]+:\d+:\d+\))/i;
  if (stackTraces.test(promptText)) {
    errors.push("Developer Terminology Leakage Error: System exception stack traces or debug metadata are exposed.");
  }

  // Internal routing patterns
  const internalRoutes = /\/api\/v1\/(observability|telemetry|admin|cache-clear)\b/i;
  if (internalRoutes.test(promptText)) {
    errors.push("Developer Terminology Leakage Error: Internal API endpoints/routes are exposed.");
  }

  // 4. Placeholder validator
  const placeholders = /\b(todo|coming soon|lorem ipsum|mock data|insert here|insert_here|<insert|\[insert)\b/i;
  if (placeholders.test(promptText)) {
    errors.push("Placeholder Validation Error: Prompt contains unresolved draft placeholders (e.g. TODO, LOREM IPSUM, COMING SOON).");
  }

  // 5. Markdown validator
  const backtickCount = (promptText.match(/```/g) || []).length;
  if (backtickCount % 2 !== 0) {
    errors.push("Markdown Validation Error: Unbalanced or unclosed code block fences (```).");
  }

  // 6. Length validator
  const maxLength = 15000;
  if (promptText.length > maxLength) {
    errors.push(`Length Validation Error: Assembled output exceeds maximum budget length of ${maxLength} chars (got ${promptText.length}).`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
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
  blueprintJson = null,
  requestId
}) {
  const reqId = requestId || 'unknown';

  // 1. AI Injection Shield Check
  if (detectPromptInjection(query)) {
    const err = new Error("Prompt injection attempt detected. Architectural governance rules violated.");
    err.errorCode = "PROMPT_VALIDATION_FAILED";
    throw err;
  }

  // 1.5 Hybrid Semantic Cache Hit Check (highest priority routing fast-path)
  const cachedPrompt = await checkSemanticCache({
    query,
    mode,
    selections,
    requestId
  });
  if (cachedPrompt) {
    console.log(`[req:${reqId}] [agent] Returning cached response. LLM execution bypassed.`);
    telemetryService.recordCacheHit();
    console.log(`[req:${reqId}] [observability] Derived metric recorded: Cache Hit (Bypassed LLM).`);
    return {
      prompt: cachedPrompt,
      qualityScore: 100,
      patchTriggered: false,
      reviews: [],
      qualityWarnings: []
    };
  }

  // 2. Decouple Intent Classification
  const intent = classifyIntent(query, mode);
  if (intent === "design_intent") {
    console.log(`[req:${reqId}] [agent] Bypassing LLM call via Local Rule Compiler fast-path.`);
    const compiled = compileLocalRulePrompt(query, selections);
    return {
      prompt: compiled,
      qualityScore: 100,
      patchTriggered: false,
      reviews: [],
      qualityWarnings: []
    };
  }

  // 3. Complexity Classification
  const complexity = classifyComplexity(query, mode, selections);
  const startTime = Date.now();
  telemetryService.recordPromptSize(query ? query.length : 0);

  try {
    const a11yBlock = resolveAccessibilitySpecs({ 
      mode, 
      componentName: selections.componentType, 
      components: selections.components, 
      pageType: selections.pageType, 
      query 
    });

    // 4. Generate Initial Draft Prompt
    console.log(`[req:${reqId}] [agent] Generating initial draft prompt...`);
    let draft = await generateInitialDraft({ 
      blueprint, 
      context, 
      a11yBlock, 
      requestId, 
      selections, 
      themeDetails: selections.themeDetails 
    });

    // 5. Expert Review Panel (Skip if simple complexity or Fast Mode)
    let reviews = [];
    const isProfessionalMode = selections.generationMode === "professional";
    if (complexity === "complex" && isProfessionalMode) {
      console.log(`[req:${reqId}] [agent] Professional Mode & Complex request. Running expert panel review...`);
      reviews = await runParallelExpertReview(draft, mode, blueprintJson, requestId);
    } else {
      console.log(`[req:${reqId}] [agent] Skipping expert reviews (complexity: "${complexity}", mode: "${selections.generationMode || 'fast'}").`);
    }

    // 6. Consolidate Draft & Reviews
    console.log(`[req:${reqId}] [agent] Consolidating draft and reviews...`);
    let consolidated = await consolidatePrompt({ blueprint, draft, reviews, context, requestId });

    // 7. Layered Programmatic Validation Pipeline (Schema ➔ Sections ➔ Leakage ➔ Placeholders ➔ Markdown ➔ Length)
    console.log(`[req:${reqId}] [agent] Running layered validation pipeline...`);
    let validationResult = validatePromptOutput(consolidated);
    
    let patchTriggered = false;
    if (!validationResult.isValid) {
      console.log(`[req:${reqId}] [agent] Validation check failed. Errors:`, validationResult.errors);
      patchTriggered = true;
      telemetryService.recordRetry();
      
      const patchInstruction = `You are a Senior Prompt Architect. The previous generated prompt failed production validation with the following errors:
${validationResult.errors.map(e => `- ${e}`).join("\n")}

Please repair the prompt structure, verify required sections exist, remove all forbidden developer terminology / internal implementation details (filenames, database table names, stack traces, provider IDs, internal API routes) and placeholders. Output ONLY the repaired prompt in a single \`\`\`prompt code block.`;
      
      consolidated = await executeLlmTask('patch_repair', patchInstruction, consolidated, requestId);
      
      // Re-run validation on repaired prompt
      validationResult = validatePromptOutput(consolidated);
      console.log(`[req:${reqId}] [agent] Validation check after repair: ${validationResult.isValid ? "Passed" : "Failed"}`);
    }

    // 8. Prompt Quality Evaluation Loop
    console.log(`[req:${reqId}] [agent] Evaluating consolidated prompt quality...`);
    let evalResult = await evaluatePromptQuality(consolidated, requestId);
    console.log(`[req:${reqId}] [agent] Quality Score: ${evalResult.score}/100.`);


    // Record response size & duration telemetry metrics
    telemetryService.recordResponseSize(consolidated ? consolidated.length : 0);
    const duration = Date.now() - startTime;
    const stats = telemetryService.getDerivedMetrics();

    console.log(`[req:${reqId}] [observability] Enhanced generation complete.`);
    console.log(`  - Duration: ${duration}ms`);
    console.log(`  - Classification: Intent=${intent}, Complexity=${complexity}`);
    console.log(`  - Cache Hit Status: Miss`);
    console.log(`  - Retries Triggered: ${patchTriggered ? "Yes" : "No"}`);
    console.log(`  - Current Aggregate Telemetry Status:`);
    console.log(`    * Average Gemini Latency: ${stats.avgLatencyGeminiMs}ms`);
    console.log(`    * Average Groq Latency:   ${stats.avgLatencyGroqMs}ms`);
    console.log(`    * Cache Hit rate:        ${stats.cacheHitPercentage}%`);
    console.log(`    * Retry rate:            ${stats.retryPercentage}%`);
    console.log(`    * Average Prompt size:    ${stats.averagePromptSizeCharacters} chars`);
    console.log(`    * Average Response size:  ${stats.averageResponseSizeCharacters} chars`);

    const qualityWarnings = contentQualityCheck(consolidated);

    return {
      prompt: consolidated,
      qualityScore: evalResult.score,
      patchTriggered,
      reviews,
      qualityWarnings
    };
  } catch (error) {
    console.error(`[req:${reqId}] [agent] LangChain execution error: ${error.message}`);
    // Health failover: If LLM fails, look for lower threshold cached template fallback
    try {
      const fallbackCached = await checkSemanticCache({
        query,
        mode,
        selections,
        threshold: 0.60,
        requestId
      });
      if (fallbackCached) {
        console.warn(`[req:${reqId}] [agent] Dynamic LLM routing failed. Reverting to cached fallback template.`);
        telemetryService.recordCacheHit();
        return {
          prompt: fallbackCached,
          qualityScore: 70,
          patchTriggered: false,
          reviews: [],
          isFallbackCached: true,
          qualityWarnings: []
        };
      }
    } catch (cacheErr) {
      console.error(`[req:${reqId}] [agent] Fallback cache retrieval failed: ${cacheErr.message}`);
    }
    throw error;
  }
}
