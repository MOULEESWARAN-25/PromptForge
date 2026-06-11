import { pipeline } from '@xenova/transformers';
import { supabase } from './supabaseClient.js';
import { localVocabularySearch } from './localKbFallback.js';

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    try {
      console.log("[BGE] Loading local feature extractor model for query embedding...");
      const loadPromise = pipeline('feature-extraction', 'Xenova/bge-large-en-v1.5');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("BGE model load timeout (offline or network-throttled)")), 8000)
      );
      extractor = await Promise.race([loadPromise, timeoutPromise]);
    } catch (err) {
      console.error(`[BGE] Failed loading ONNX BGE model: ${err.message}`);
      throw err;
    }
  }
  return extractor;
}

/**
 * Maps the active Mode to allowed KB Types to enforce strict context boundaries.
 */
function getAllowedKbTypes(mode) {
  const cleanMode = (mode || '').toLowerCase();
  switch (cleanMode) {
    case 'component':
      return ['component', 'common'];
    case 'page':
    case 'spa':
      return ['spa', 'component', 'common'];
    case 'application':
    case 'fullstack':
      return ['fullstack', 'spa', 'component', 'common'];
    default:
      return ['common'];
  }
}

/**
 * Unified RAG Retrieval Service with Configurable Graph Traversal and Telemetry Output.
 *
 * @param {object} options
 * @param {string} options.mode          - Generation mode (application, page, component)
 * @param {string} options.query         - Free-form query text for vector search
 * @param {string} options.theme         - Theme selection ID
 * @param {string} options.typography    - Typography selection ID
 * @param {object} options.selections    - Structured UI wizard selections
 * @param {object} options.decomposed    - Pre-decomposed prompt concepts (optional)
 * @param {number} options.limit         - Maximum entities returned after ranking (default: 8)
 *                                         Phase III-F.1 sensitivity study optimal: 8 (best Precis% = 34.38%)
 * @param {number} options.hopDepth      - Graph traversal depth for Phase 2 expansion (default: 2)
 *                                         Phase III-F.1 optimal: 2 (elbow at 8x2 — 0% purity gain from 8x2→8x3,
 *                                         ~11% lower latency). All existing callers use the default.
 */
export function inferQueryDomain(selections = {}, query = '', decomposed = null) {
  const text = `${selections.appCategory || ''} ${query || ''} ${decomposed?.inferred_app_type?.value || ''}`.toLowerCase();
  
  if (text.includes('saas') || text.includes('tenant') || text.includes('rbac') || text.includes('billing') || text.includes('subscription') || text.includes('invoice') || text.includes('organization') || text.includes('user_auth')) {
    return 'saas';
  }
  if (text.includes('commerce') || text.includes('store') || text.includes('shop') || text.includes('checkout') || text.includes('payment') || text.includes('stripe') || text.includes('cart')) {
    return 'ecommerce';
  }
  if (text.includes('realtime') || text.includes('collab') || text.includes('websocket') || text.includes('chat') || text.includes('cursor') || text.includes('presence')) {
    return 'realtime';
  }
  if (text.includes('analytics') || text.includes('dashboard') || text.includes('chart') || text.includes('metrics')) {
    return 'analytics';
  }
  if (text.includes('migration') || text.includes('database') || text.includes('schema') || text.includes('ddl') || text.includes('mysql') || text.includes('postgres')) {
    return 'migration';
  }
  if (text.includes('log') || text.includes('monitor') || text.includes('observability') || text.includes('cache') || text.includes('rate limit') || text.includes('flag')) {
    return 'platform';
  }
  return 'saas'; // default domain
}

export const DOMAIN_MULTIPLIERS = {
  SAME: 1.0,
  COMMON: 1.0,
  CROSS: 0.3
};

export async function runContextIsolatedRetrieval({
  mode,
  query,
  theme,
  typography,
  selections = {},
  decomposed = null,
  limit = 8,
  hopDepth = 2,
  domain = null
}) {
  const startTime = Date.now();
  const allowedKbTypes = getAllowedKbTypes(mode);
  console.log(`[retrieval] Scope boundary enabled for mode [${mode}]. Allowed KB Types: ${allowedKbTypes.join(', ')}`);

  const directMatchIds = new Set();
  const vectorQueryTexts = [];

  // Parse structured selections from frontend UI wizard
  if (selections.appCategory) directMatchIds.add(selections.appCategory);
  if (selections.pageType) directMatchIds.add(selections.pageType);
  if (selections.componentType) directMatchIds.add(selections.componentType);
  if (selections.theme) directMatchIds.add(selections.theme);
  if (selections.typography) directMatchIds.add(selections.typography);
  if (Array.isArray(selections.features)) {
    selections.features.forEach(f => directMatchIds.add(f));
  }
  if (Array.isArray(selections.components)) {
    selections.components.forEach(c => directMatchIds.add(c));
  }

  // Parse decomposed concepts from raw prompt analyzer (Enhance Mode)
  if (decomposed) {
    const { inferred_app_type, features = [], pages = [], components = [], theme: decTheme, typography: decTypo } = decomposed;

    if (inferred_app_type && inferred_app_type.confidence > 0.75) {
      directMatchIds.add(inferred_app_type.value);
    } else if (inferred_app_type && inferred_app_type.confidence >= 0.50) {
      vectorQueryTexts.push(inferred_app_type.value);
    }

    features.forEach(f => {
      if (f.confidence > 0.75) directMatchIds.add(f.name);
      else if (f.confidence >= 0.50) vectorQueryTexts.push(f.name);
    });

    pages.forEach(p => {
      if (p.confidence > 0.75) directMatchIds.add(p.name);
      else if (p.confidence >= 0.50) vectorQueryTexts.push(p.name);
    });

    components.forEach(c => {
      if (c.confidence > 0.75) directMatchIds.add(c.name);
      else if (c.confidence >= 0.50) vectorQueryTexts.push(c.name);
    });

    if (decTheme && decTheme.confidence > 0.75) directMatchIds.add(decTheme.value);
    if (decTypo && decTypo.confidence > 0.75) directMatchIds.add(decTypo.value);
  }

  // Fallback direct additions for visual style themes
  if (theme) directMatchIds.add(theme);
  if (typography) directMatchIds.add(typography);

  // If a main free-form query/description text was entered, run vector search for it
  if (query && query.trim()) {
    vectorQueryTexts.push(query.trim());
  }

  const resolvedEntities = new Map();
  const selectedEntitiesTelemetry = [];
  const expandedEntitiesTelemetry = [];
  const vectorHitsTelemetry = [];

  // ==========================================
  // PHASE 1: DIRECT RETRIEVAL
  // ==========================================
  const directIdArray = Array.from(directMatchIds).filter(Boolean);
  if (directIdArray.length > 0) {
    try {
      console.log(`[retrieval] Phase 1: Direct fetching ${directIdArray.length} selected nodes...`);
      let directEntities = [];
      let directErr = null;

      // 1. Fetch by ID list
      const activeRes = await supabase
        .from('kb_entities')
        .select('*')
        .eq('is_active', true)
        .in('id', directIdArray);

      if (activeRes.error && activeRes.error.message.includes('is_active')) {
        console.log(`[retrieval] Column 'is_active' not found. Falling back to query without it.`);
        const fallbackRes = await supabase
          .from('kb_entities')
          .select('*')
          .in('id', directIdArray);
        directEntities = fallbackRes.data || [];
        directErr = fallbackRes.error;
      } else {
        directEntities = activeRes.data || [];
        directErr = activeRes.error;
      }

      if (directErr) throw directErr;

      // 2. Name Fallback Check: If any requested selections were display names and thus not matched by ID
      if (directEntities.length < directIdArray.length) {
        const foundIds = new Set(directEntities.map(e => e.id));
        const foundNames = new Set(directEntities.map(e => e.name));
        const remainingToFind = directIdArray.filter(x => !foundIds.has(x) && !foundNames.has(x));

        if (remainingToFind.length > 0) {
          const nameRes = await supabase
            .from('kb_entities')
            .select('*')
            .eq('is_active', true)
            .in('name', remainingToFind);

          let nameEntities = [];
          let nameErr = null;

          if (nameRes.error && nameRes.error.message.includes('is_active')) {
            const fallbackNameRes = await supabase
              .from('kb_entities')
              .select('*')
              .in('name', remainingToFind);
            nameEntities = fallbackNameRes.data || [];
            nameErr = fallbackNameRes.error;
          } else {
            nameEntities = nameRes.data || [];
            nameErr = nameRes.error;
          }

          if (!nameErr && nameEntities && nameEntities.length > 0) {
            directEntities = [...directEntities, ...nameEntities];
          }
        }
      }

      (directEntities || []).forEach(ent => {
        if (allowedKbTypes.includes(ent.kb_type)) {
          resolvedEntities.set(ent.id, {
            ...ent,
            direct_match: true,
            similarity: 0.95,
            hop_count: 0
          });
          selectedEntitiesTelemetry.push(ent.id);
        } else {
          console.warn(`[retrieval] Context Leak Blocked (Phase 1 Direct): Entity "${ent.id}" of type "${ent.kb_type}" is not allowed in mode "${mode}"`);
        }
      });
    } catch (err) {
      console.warn(`[retrieval] Phase 1 Supabase fetch failed. Falling back to local search. Error: ${err.message}`);
    }
  }

  // ==========================================
  // PHASE 2: GRAPH EXPANSION (CONFIGURABLE DEPTH)
  // Traverses up to hopDepth hops from the initial selection.
  // Each hop follows outbound relationships from the previous hop's entities.
  // The loop replaces the former hardcoded Hop 1 / Hop 2 / Hop 3 nested blocks.
  // ==========================================
  let currentHopIds = Array.from(resolvedEntities.keys());
  if (currentHopIds.length > 0) {
    try {
      for (let hop = 1; hop <= hopDepth; hop++) {
        if (currentHopIds.length === 0) break;

        console.log(`[retrieval] Phase 2 (Hop ${hop}): Expanding Graph for: [${currentHopIds.join(', ')}]`);

        const { data: rels, error: relErr } = await supabase
          .from('kb_relationships')
          .select('*')
          .in('source_id', currentHopIds);

        if (relErr) throw relErr;
        if (!rels || rels.length === 0) break;

        const hopTargetIds = rels.map(r => r.target_id).filter(id => !resolvedEntities.has(id));
        if (hopTargetIds.length === 0) break;

        let hopEntities;
        let hopErr;
        const activeRes = await supabase
          .from('kb_entities')
          .select('*')
          .eq('is_active', true)
          .in('id', hopTargetIds);

        if (activeRes.error && activeRes.error.message.includes('is_active')) {
          const fallbackRes = await supabase
            .from('kb_entities')
            .select('*')
            .in('id', hopTargetIds);
          hopEntities = fallbackRes.data;
          hopErr = fallbackRes.error;
        } else {
          hopEntities = activeRes.data;
          hopErr = activeRes.error;
        }

        if (hopErr) throw hopErr;

        const nextHopIds = [];
        (hopEntities || []).forEach(ent => {
          if (allowedKbTypes.includes(ent.kb_type)) {
            const relInfo = rels.find(r => r.target_id === ent.id);
            resolvedEntities.set(ent.id, {
              ...ent,
              feature_match: true,
              similarity: 0.95,
              relation_type: relInfo ? relInfo.relation_type : `hop${hop}_dependency`,
              hop_count: hop
            });
            expandedEntitiesTelemetry.push(ent.id);
            nextHopIds.push(ent.id);
          } else {
            console.warn(`[retrieval] Context Leak Blocked (Phase 2 Hop ${hop}): Entity "${ent.id}" of type "${ent.kb_type}" is not allowed in mode "${mode}"`);
          }
        });

        currentHopIds = nextHopIds;
      }
    } catch (err) {
      console.warn(`[retrieval] Phase 2 Supabase relation fetch failed. Error: ${err.message}`);
    }
  }

  // ==========================================
  // PHASE 3: VECTOR SEARCH
  // ==========================================
  const filteredVectorTexts = vectorQueryTexts.filter(Boolean);
  if (filteredVectorTexts.length > 0) {
    try {
      console.log(`[retrieval] Phase 3: Executing BGE vector search for: "${filteredVectorTexts.join(' | ')}"`);
      const ext = await getExtractor();

      for (const queryText of filteredVectorTexts) {
        const output = await ext(queryText, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);

        // Perform pgvector search in Supabase
        const { data: matches, error: rpcErr } = await supabase.rpc('match_kb_entities', {
          query_embedding: embedding,
          match_threshold: 0.05,
          match_count: limit,
          allowed_kb_types: allowedKbTypes
        });

        if (rpcErr) throw rpcErr;

        (matches || []).forEach(match => {
          if (!resolvedEntities.has(match.id)) {
            resolvedEntities.set(match.id, {
              id: match.id,
              kb_type: match.kb_type,
              entity_type: match.entity_type,
              name: match.name,
              overview: match.overview,
              keywords: match.keywords,
              similarity: match.similarity,
              vector_match: true,
              hop_count: 0,
              primary_domain: match.primary_domain || 'common',
              domains: match.domains || ['common'],
              subdomain: match.subdomain || 'general'
            });
            vectorHitsTelemetry.push(match.id);
          } else {
            const existing = resolvedEntities.get(match.id);
            if (match.similarity > existing.similarity) {
              existing.similarity = match.similarity;
            }
          }
        });
      }
    } catch (err) {
      console.warn(`[retrieval] Phase 3 Semantic search failed: ${err.message}. Invoking local RAG fallback...`);
      // Local RAG Fallback search on static JSON file
      const localMatches = localVocabularySearch(filteredVectorTexts.join(' '), allowedKbTypes, limit);
      localMatches.forEach(match => {
        if (!resolvedEntities.has(match.id)) {
          resolvedEntities.set(match.id, {
            ...match,
            vector_match: true,
            hop_count: 0
          });
          vectorHitsTelemetry.push(match.id);
        }
      });
    }
  }

  // Load detailed properties for incomplete entities
  const incompleteIds = Array.from(resolvedEntities.values())
    .filter(e => !e.prompt_fragments)
    .map(e => e.id);

  if (incompleteIds.length > 0) {
    try {
      const { data: detailedRows } = await supabase
        .from('kb_entities')
        .select('*')
        .in('id', incompleteIds);

      if (detailedRows) {
        detailedRows.forEach(row => {
          const existing = resolvedEntities.get(row.id);
          if (existing) {
            resolvedEntities.set(row.id, { ...existing, ...row });
          }
        });
      }
    } catch (err) {
      console.error(`[retrieval] Failed fetching detailed row structures: ${err.message}`);
    }
  }

  // ==========================================
  // PHASE 4: MERGE & WEIGHTED RANKING
  // ==========================================

  const activeDomain = domain || inferQueryDomain(selections, query, decomposed);
  console.log(`[retrieval] Active domain for weighting: [${activeDomain}]`);

  // Hop weights decay with distance — configurable as graph topology evolves.
  // Hop 4 added to support Phase III-D.7 sensitivity study configurations.
  const HOP_WEIGHTS = {
    0: 1.0,
    1: 1.0,
    2: 0.8,
    3: 0.6,
    4: 0.5
  };

  /**
   * Sprint G.1 — Entity-Type Ranking Multiplier
   */
  const ENTITY_TYPE_WEIGHTS = {
    application:     1.0,
    feature:         1.0,
    page:            1.0,
    component:       1.0,
    backend_module:  1.0,
    database_entity: 1.0,
    theme:           0.80,
    typography:      0.80,
    design_token:    0.35   // penalized — broad embeddings, not semantically targeted
  };

  const candidates = Array.from(resolvedEntities.values());

  // Capture pool size before ranking/slicing
  const candidatePoolSize = candidates.length;

  const ranked = candidates.map(candidate => {
    const isDirect = candidate.direct_match === true;
    const isGraph = candidate.feature_match === true;
    const isTheme = candidate.entity_type === 'theme';
    const isTypography = candidate.entity_type === 'typography';

    // Scoring Weights: 40% Direct, 30% Graph expansion, 10% Theme, 5% Typography, 15% Vector similarity
    const directWeight = isDirect ? 0.40 : 0;
    const graphWeight = isGraph ? 0.30 : 0;
    const themeWeight = isTheme ? 0.10 : 0;
    const typographyWeight = isTypography ? 0.05 : 0;
    const similarityWeight = (candidate.similarity || 0.5) * 0.15;

    const consolidatedScore = parseFloat((directWeight + graphWeight + themeWeight + typographyWeight + similarityWeight).toFixed(3));
    const hopWeight = HOP_WEIGHTS[candidate.hop_count ?? 0] ?? 0.5;

    // G.1: Apply entity-type weight multiplier
    const entityTypeWeight = ENTITY_TYPE_WEIGHTS[candidate.entity_type] ?? 1.0;

    // Calculate domain weight multiplier (configurable soft boundary penalty)
    let domainWeight = DOMAIN_MULTIPLIERS.CROSS; // default cross-domain penalty
    const entityPrimaryDomain = (candidate.primary_domain || 'common').toLowerCase();
    
    // Support string array or single value checks safely
    const entityDomains = Array.isArray(candidate.domains) 
      ? candidate.domains.map(d => String(d).toLowerCase()) 
      : [entityPrimaryDomain];

    if (entityPrimaryDomain === 'common' || candidate.kb_type === 'common') {
      domainWeight = DOMAIN_MULTIPLIERS.COMMON;
    } else if (entityPrimaryDomain === activeDomain || entityDomains.includes(activeDomain)) {
      domainWeight = DOMAIN_MULTIPLIERS.SAME;
    }

    const finalScore = parseFloat((consolidatedScore * hopWeight * entityTypeWeight * domainWeight).toFixed(3));

    return {
      ...candidate,
      consolidated_score: finalScore,
      entity_type_weight: entityTypeWeight,
      domain_weight: domainWeight,
      active_domain: activeDomain
    };
  });

  const finalResult = ranked
    .sort((a, b) => b.consolidated_score - a.consolidated_score)
    .slice(0, limit);

  // Build entity-type breakdown for the retrieved result set (telemetry)
  const entityTypeBreakdown = {};
  finalResult.forEach(e => {
    const t = e.entity_type || 'unknown';
    entityTypeBreakdown[t] = (entityTypeBreakdown[t] || 0) + 1;
  });

  // Return telemetry alongside matched entities list
  return {
    results: finalResult,
    telemetry: {
      selected_entities: selectedEntitiesTelemetry,
      expanded_entities: expandedEntitiesTelemetry,
      vector_hits: vectorHitsTelemetry,
      scores: finalResult.map(e => ({ id: e.id, score: e.consolidated_score })),
      candidate_pool_size_before_ranking: candidatePoolSize,
      entity_type_breakdown: entityTypeBreakdown,
      active_domain: activeDomain
    }
  };
}
