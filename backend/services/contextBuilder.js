import { LIMITS } from '../config/limits.js';
import { executeLlmTask } from './agentService.js';

/**
 * Helper to estimate token counts roughly (approx 4 characters per token).
 */
function estimateTokenCount(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Calculates a hybrid RAG score combining vector similarity, keyword match, metadata matches, and selections context.
 * FinalScore = 0.40 Embedding Similarity + 0.20 Keyword Overlap + 0.15 Metadata Match + 0.15 Project Context + 0.10 Freshness.
 */
function computeHybridScore(entity, queryText, mode, selections = {}) {
  const query = (queryText || "").toLowerCase();
  
  // 1. Vector similarity (0.40 weight)
  const vectorScore = entity.similarity || entity.score || 0.5;
  
  // 2. Keyword overlap (0.20 weight)
  let keywordOverlap = 0;
  const keywords = entity.keywords || [];
  if (keywords.length > 0) {
    const matches = keywords.filter(k => query.includes(k.toLowerCase()));
    keywordOverlap = matches.length / keywords.length;
  }
  
  // 3. Metadata match (0.15 weight)
  let metadataMatch = 0;
  const category = (entity.category || "").toLowerCase();
  if (mode === "application" && (category.includes("app") || category.includes("architecture"))) {
    metadataMatch = 1.0;
  } else if (mode === "page" && category.includes("page")) {
    metadataMatch = 1.0;
  } else if (mode === "component" && category.includes("component")) {
    metadataMatch = 1.0;
  }
  
  // 4. Project Context Match (0.15 weight)
  let projectContextMatch = 0;
  const framework = (selections.framework || "").toLowerCase();
  const database = (selections.database || "").toLowerCase();
  const overview = (entity.overview || "").toLowerCase();
  
  if (framework && (overview.includes(framework) || (entity.name || "").toLowerCase().includes(framework))) {
    projectContextMatch += 0.5;
  }
  if (database && (overview.includes(database) || (entity.name || "").toLowerCase().includes(database))) {
    projectContextMatch += 0.5;
  }
  if (query.includes((entity.name || "").toLowerCase())) {
    projectContextMatch = 1.0; // Perfect match on component/entity name
  }
  
  // 5. Freshness (0.10 weight)
  const freshness = 1.0; // Static design taxonomy default high freshness
  
  return (0.40 * vectorScore) + (0.20 * keywordOverlap) + (0.15 * metadataMatch) + (0.15 * projectContextMatch) + (0.10 * freshness);
}

/**
 * Generates detailed markdown for a single Knowledge Graph entity.
 */
function compileEntityMarkdown(ent) {
  const details = [];
  details.push(`#### ${ent.name} (${ent.id})`);
  if (ent.overview) details.push(`- **Overview**: ${ent.overview}`);
  if (ent.business_goals && ent.business_goals.length > 0) details.push(`- **Business Goals**: ${ent.business_goals.join(', ')}`);
  if (ent.target_users && ent.target_users.length > 0) details.push(`- **Target Users**: ${ent.target_users.join(', ')}`);
  if (ent.common_features && ent.common_features.length > 0) details.push(`- **Common Features**: ${ent.common_features.join(', ')}`);
  if (ent.security_considerations && ent.security_considerations.length > 0) details.push(`- **Security Considerations**: ${ent.security_considerations.join(', ')}`);
  if (ent.scalability_considerations && ent.scalability_considerations.length > 0) details.push(`- **Scalability Considerations**: ${ent.scalability_considerations.join(', ')}`);
  if (ent.accessibility_considerations && ent.accessibility_considerations.length > 0) details.push(`- **Accessibility (ARIA)**: ${ent.accessibility_considerations.join(', ')}`);
  if (ent.mobile_considerations && ent.mobile_considerations.length > 0) details.push(`- **Mobile / Responsive Layout**: ${ent.mobile_considerations.join(', ')}`);
  if (ent.integrations && ent.integrations.length > 0) details.push(`- **Integrations**: ${ent.integrations.join(', ')}`);
  if (ent.design_patterns && ent.design_patterns.length > 0) details.push(`- **Software Design Patterns**: ${ent.design_patterns.join(', ')}`);
  if (ent.implementation_guidelines && ent.implementation_guidelines.length > 0) {
    details.push(`- **Implementation Guidelines**:\n  ${ent.implementation_guidelines.map(g => `  * ${g}`).join('\n')}`);
  }
  if (ent.anti_patterns && ent.anti_patterns.length > 0) details.push(`- **Anti-Patterns / Pitfalls to Avoid**: ${ent.anti_patterns.join(', ')}`);

  if (ent.entity_type === 'wizard_step') {
    const stepDetails = [];
    stepDetails.push(`#### Wizard Step: ${ent.name}`);
    if (ent.purpose) stepDetails.push(`- **Purpose**: ${ent.purpose}`);
    if (ent.why_exists) stepDetails.push(`- **Why Exists**: ${ent.why_exists}`);
    if (ent.common_mistakes && ent.common_mistakes.length > 0) stepDetails.push(`- **Common Mistakes**: ${ent.common_mistakes.join(', ')}`);
    if (ent.impact_on_generation && ent.impact_on_generation.length > 0) stepDetails.push(`- **Impact on Prompt Generation**: ${ent.impact_on_generation.join(', ')}`);
    return stepDetails.join('\n');
  }

  const fragments = [];
  if (ent.prompt_fragments) {
    const pf = ent.prompt_fragments;
    if (Array.isArray(pf.architecture)) pf.architecture.forEach(f => fragments.push(`- [Architecture] [${ent.name}] ${f}`));
    if (Array.isArray(pf.ui)) pf.ui.forEach(f => fragments.push(`- [UI] [${ent.name}] ${f}`));
    if (Array.isArray(pf.backend)) pf.backend.forEach(f => fragments.push(`- [Backend] [${ent.name}] ${f}`));
    if (Array.isArray(pf.database)) pf.database.forEach(f => fragments.push(`- [Database] [${ent.name}] ${f}`));
    if (Array.isArray(pf.security)) pf.security.forEach(f => fragments.push(`- [Security] [${ent.name}] ${f}`));
    if (Array.isArray(pf.accessibility)) pf.accessibility.forEach(f => fragments.push(`- [Accessibility] [${ent.name}] ${f}`));
    if (Array.isArray(pf.performance)) pf.performance.forEach(f => fragments.push(`- [Performance] [${ent.name}] ${f}`));
  }

  let entityMd = details.join('\n');
  if (fragments.length > 0) {
    entityMd += `\n- **Prompt Fragments**:\n  ${fragments.join('\n  ')}`;
  }
  return entityMd;
}

/**
 * Context Builder Service
 * Synthesizes retrieved Knowledge Graph entities and chat history into a structured markdown context payload,
 * enforcing top-k retrieval thresholds, sliding window history summarization, and strict token budget bounds.
 */
export async function buildPromptContext(entities = [], history = [], requestId = null, queryText = "", mode = "", selections = {}) {
  const reqId = requestId || 'unknown';

  if (!entities || entities.length === 0) {
    return "No database design guides or technical terminology were retrieved for this query.";
  }

  // 1. Deduplication by ID
  const uniqueEntitiesMap = new Map();
  entities.forEach(ent => {
    if (ent && ent.id && !uniqueEntitiesMap.has(ent.id)) {
      uniqueEntitiesMap.set(ent.id, ent);
    }
  });
  const uniqueEntities = Array.from(uniqueEntitiesMap.values());

  // 2. Hybrid Context Scoring & Ranking
  const scoredEntities = uniqueEntities.map(ent => {
    const finalScore = computeHybridScore(ent, queryText, mode, selections);
    return { ...ent, finalScore };
  });

  // Sort by final score descending
  scoredEntities.sort((a, b) => b.finalScore - a.finalScore);

  // Enforce Top-K retrieval limit
  const topK = LIMITS.RAG_TOP_K || 5;
  const slicedEntities = scoredEntities.slice(0, topK);

  // 3. Assemble Sliding Window Chat History
  let conversationSummaryText = "";
  let recentMessagesText = "";

  if (history && history.length > 0) {
    const maxRecent = LIMITS.MAX_RECENT_MESSAGES || 10;

    if (history.length > maxRecent) {
      console.log(`[req:${reqId}] [context] History exceeds max recent limit. Triggering summarization...`);
      const olderMessages = history.slice(0, history.length - maxRecent);
      const recentMessages = history.slice(history.length - maxRecent);

      const systemInstruction = `You are a Conversation Summarizer. Summarize the following early conversation history between a user and an AI assistant into a brief, high-density summary of decisions, requirements, and constraints agreed upon. Avoid generic introductions. Return ONLY the summary text.`;
      const userMessage = olderMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content || m.message}`)
        .join('\n\n');

      try {
        conversationSummaryText = await executeLlmTask('conversation_summary', systemInstruction, userMessage, requestId);
      } catch (err) {
        console.warn(`[req:${reqId}] [context] LLM summarization failed: ${err.message}. Slicing manually.`);
        conversationSummaryText = olderMessages
          .slice(-3)
          .map(m => `[Earlier Chat] ${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content || m.message}`)
          .join('\n');
      }

      recentMessagesText = recentMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content || m.message}`)
        .join('\n\n');
    } else {
      recentMessagesText = history
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content || m.message}`)
        .join('\n\n');
    }
  }

  // 4. Bucketed Priority Context Builder
  // Priorities: SystemRules (never pruned) -> Metadata (never pruned) -> Knowledge Entities -> Chat History -> User Input
  const bucket1_System = "================================================================\nVEYNTRA KNOWLEDGE RETRIEVAL BOUNDARY CONTEXT\n==========================================================";
  const bucket2_Metadata = `\nMode: ${mode || 'Unknown'}\nQuery Keyword Reference: ${queryText || 'None'}\n`;
  
  let bucket3_Knowledge = "### 1. RETRIEVED KNOWLEDGE GRAPH ENTITIES\n";
  slicedEntities.forEach(ent => {
    bucket3_Knowledge += compileEntityMarkdown(ent) + "\n\n";
  });

  const bucket4_History = (conversationSummaryText || recentMessagesText)
    ? `### 2. CONVERSATION HISTORIES\n${conversationSummaryText}\n${recentMessagesText}\n`
    : "";

  const bucket5_Input = queryText ? `### 3. ACTIVE USER INPUT\n${queryText}\n` : "";

  // Token Budget Enforcement via Pruning lowest buckets first
  const maxLimit = LIMITS.MAX_CONTEXT_SIZE || 3500;
  
  let assembledContext = "";
  
  // Try assembling all buckets
  assembledContext = [bucket1_System, bucket2_Metadata, bucket3_Knowledge, bucket4_History, bucket5_Input].join('\n');
  let currentTokenCount = estimateTokenCount(assembledContext);
  
  if (currentTokenCount <= maxLimit) {
    return assembledContext;
  }

  // Incremental Pruning Logic:
  // Step A: Prune Knowledge bucket item-by-item (lowest score first)
  const dynamicEntities = [...slicedEntities];
  while (estimateTokenCount([bucket1_System, bucket2_Metadata, bucket3_Knowledge, bucket4_History, bucket5_Input].join('\n')) > maxLimit && dynamicEntities.length > 0) {
    console.log(`[req:${reqId}] [context] Exceeded token cap. Pruning lowest-scoring Knowledge entity: ${dynamicEntities[dynamicEntities.length - 1].name}`);
    dynamicEntities.pop();
    bucket3_Knowledge = "### 1. RETRIEVED KNOWLEDGE GRAPH ENTITIES\n";
    dynamicEntities.forEach(ent => {
      bucket3_Knowledge += compileEntityMarkdown(ent) + "\n\n";
    });
  }

  let finalContext = [bucket1_System, bucket2_Metadata, bucket3_Knowledge, bucket4_History, bucket5_Input].join('\n');
  if (estimateTokenCount(finalContext) <= maxLimit) {
    return finalContext;
  }

  // Step B: Prune History bucket (Bucket 4)
  console.log(`[req:${reqId}] [context] Still exceeds budget. Pruning chat history bucket.`);
  finalContext = [bucket1_System, bucket2_Metadata, bucket3_Knowledge, bucket5_Input].join('\n');
  if (estimateTokenCount(finalContext) <= maxLimit) {
    return finalContext;
  }

  // Step C: Prune active user input (Bucket 5)
  console.log(`[req:${reqId}] [context] Still exceeds budget. Truncating active user input.`);
  const truncatedInput = queryText.slice(0, 500) + "... [TRUNCATED DUE TO TOKEN BUDGET]";
  const bucket5_InputTruncated = `### 3. ACTIVE USER INPUT (Truncated)\n${truncatedInput}\n`;
  finalContext = [bucket1_System, bucket2_Metadata, bucket3_Knowledge, bucket5_InputTruncated].join('\n');
  return finalContext;
}
