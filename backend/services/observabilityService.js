import { supabase } from './supabaseClient.js';
import { calculateEntityCoverage } from './coverageScorer.js';

// Standardized classifications
const STRUCTURAL_TYPES = ['application', 'feature', 'page', 'backend_module', 'database_entity'];
const LEAF_TYPES = ['component', 'typography', 'theme', 'wizard_step'];

const LAYER_WEIGHTS = {
  has_feature: 0.30,
  renders_page: 0.20,
  contains_component: 0.20,
  requires_backend: 0.15,
  uses_db_model: 0.15
};

/**
 * Calculates layer-by-layer and weighted overall coverage for a given entity
 * based on its expected relationships and the set of resolved entities.
 */
function calculateEntityCoverageSync(entityId, resolvedEntityIds, entityRels) {
  const rels = entityRels || [];
  
  const expectedByLayer = {
    has_feature: [],
    renders_page: [],
    contains_component: [],
    requires_backend: [],
    uses_db_model: []
  };

  rels.forEach(rel => {
    const type = rel.relation_type;
    if (expectedByLayer[type] !== undefined) {
      expectedByLayer[type].push(rel.target_id);
    }
  });

  const coverageByLayer = {};
  let weightedScoreSum = 0;
  let totalActiveWeight = 0;

  Object.keys(expectedByLayer).forEach(layer => {
    const expectedTargets = expectedByLayer[layer];
    const totalExpected = expectedTargets.length;

    if (totalExpected === 0) {
      coverageByLayer[layer] = null;
    } else {
      let resolvedCount = 0;
      expectedTargets.forEach(targetId => {
        if (resolvedEntityIds.includes(targetId)) {
          resolvedCount++;
        }
      });

      const layerScore = parseFloat(((resolvedCount / totalExpected) * 100).toFixed(2));
      coverageByLayer[layer] = layerScore;

      const weight = LAYER_WEIGHTS[layer];
      weightedScoreSum += layerScore * weight;
      totalActiveWeight += weight;
    }
  });

  let overallScore = 100.00;
  if (totalActiveWeight > 0) {
    overallScore = parseFloat((weightedScoreSum / totalActiveWeight).toFixed(2));
  }

  return {
    entity_id: entityId,
    overall_score: overallScore,
    coverage_by_layer: coverageByLayer
  };
}

/**
 * Calculates coverage for all entities using cached values when available,
 * falling back to dynamic calculation when missing.
 */
async function getAllEntityCoverages() {
  // 1. Fetch all active entities
  const { data: entities, error: entErr } = await supabase
    .from('kb_entities')
    .select('id, name, entity_type, is_active')
    .eq('is_active', true);

  if (entErr) throw entErr;

  // 2. Fetch cached metrics from entity_coverage_metrics
  const { data: cachedMetrics } = await supabase
    .from('entity_coverage_metrics')
    .select('entity_id, coverage_score');

  const cacheMap = {};
  if (cachedMetrics) {
    cachedMetrics.forEach(c => {
      cacheMap[c.entity_id] = parseFloat(c.coverage_score);
    });
  }

  // 3. Fetch production phase2 runs to calculate missing metrics
  const { data: runs } = await supabase
    .from('prompt_history')
    .select('category, rag_details')
    .eq('engine_version', 'phase2')
    .eq('telemetry_source', 'production');

  // 4. Batch fetch all relationships for missing cache calculations
  const { data: allRels, error: relsErr } = await supabase
    .from('kb_relationships')
    .select('source_id, target_id, relation_type');

  if (relsErr) throw relsErr;

  const relsBySource = {};
  if (allRels) {
    allRels.forEach(rel => {
      if (!relsBySource[rel.source_id]) {
        relsBySource[rel.source_id] = [];
      }
      relsBySource[rel.source_id].push(rel);
    });
  }

  const results = [];

  for (const entity of entities) {
    let score = cacheMap[entity.id];

    if (score === undefined) {
      // Missing in cache, calculate dynamically in-memory
      const resolvedIds = new Set();
      if (runs) {
        runs.forEach(run => {
          if (run.category === entity.id || run.category === entity.name) {
            const rag = run.rag_details;
            if (rag && Array.isArray(rag.results)) {
              rag.results.forEach(ent => {
                if (ent && ent.id) resolvedIds.add(ent.id);
              });
            }
          }
        });
      }
      const profile = calculateEntityCoverageSync(entity.id, Array.from(resolvedIds), relsBySource[entity.id]);
      score = profile.overall_score;
    }

    results.push({
      id: entity.id,
      name: entity.name,
      entity_type: entity.entity_type,
      coverage_score: score
    });
  }

  return results;
}

/**
 * Endpoint 1: Dashboard Overview Summary
 */
export async function getObservabilitySummary() {
  // Get active entities count and relationships count
  const entityCountPromise = supabase.from('kb_entities').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const relCountPromise = supabase.from('kb_relationships').select('*', { count: 'exact', head: true });
  const openGapsPromise = supabase.from('knowledge_gaps').select('*', { count: 'exact', head: true }).neq('status', 'resolved');
  const latestDailyPromise = supabase.from('knowledge_metrics_daily').select('telemetry_validity_rate').order('date', { ascending: false }).limit(1).maybeSingle();

  const [entRes, relRes, gapRes, dailyRes] = await Promise.all([
    entityCountPromise,
    relCountPromise,
    openGapsPromise,
    latestDailyPromise
  ]);

  const totalEntities = entRes.count || 0;
  const totalRelationships = relRes.count || 0;
  const openGapsCount = gapRes.count || 0;
  const telemetryValidityRate = dailyRes.data ? parseFloat(dailyRes.data.telemetry_validity_rate) : 100.00;

  // Active Applications count
  const { count: activeAppsCount } = await supabase
    .from('kb_entities')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('entity_type', 'application');

  // Coverage calculations
  const coverages = await getAllEntityCoverages();
  const structuralCoverages = coverages.filter(c => STRUCTURAL_TYPES.includes(c.entity_type));
  const leafCoverages = coverages.filter(c => LEAF_TYPES.includes(c.entity_type));

  const avgStructuralCoverage = structuralCoverages.length > 0
    ? parseFloat((structuralCoverages.reduce((sum, c) => sum + c.coverage_score, 0) / structuralCoverages.length).toFixed(2))
    : 100.00;

  const avgLeafCoverage = leafCoverages.length > 0
    ? parseFloat((leafCoverages.reduce((sum, c) => sum + c.coverage_score, 0) / leafCoverages.length).toFixed(2))
    : 100.00;

  return {
    totalEntities,
    totalRelationships,
    activeApplications: activeAppsCount || 0,
    avgStructuralCoverage,
    avgLeafCoverage,
    openGapsCount,
    telemetryValidityRate
  };
}

/**
 * Endpoint 2: Coverage Analytics details
 */
export async function getObservabilityAnalytics() {
  const coverages = await getAllEntityCoverages();

  // 1. Coverage Distribution buckets
  const distribution = {
    under20: 0,
    under40: 0,
    under60: 0,
    under80: 0,
    over80: 0
  };

  coverages.forEach(c => {
    const score = c.coverage_score;
    if (score < 20) distribution.under20++;
    else if (score < 40) distribution.under40++;
    else if (score < 60) distribution.under60++;
    else if (score < 80) distribution.under80++;
    else distribution.over80++;
  });

  // 2. Lowest and Highest Coverage Applications (only entity_type === 'application')
  const apps = coverages.filter(c => c.entity_type === 'application');
  const sortedApps = [...apps].sort((a, b) => a.coverage_score - b.coverage_score);

  const lowestCoverageApps = sortedApps.slice(0, 5);
  const highestCoverageApps = [...sortedApps].reverse().slice(0, 5);

  // 3. Coverage by Layer (averaged across all active entities)
  // Fetch layers from cached entity_coverage_metrics
  const { data: metrics } = await supabase
    .from('entity_coverage_metrics')
    .select('coverage_by_layer');

  const layerSums = {
    has_feature: 0,
    renders_page: 0,
    contains_component: 0,
    requires_backend: 0,
    uses_db_model: 0
  };
  const layerCounts = {
    has_feature: 0,
    renders_page: 0,
    contains_component: 0,
    requires_backend: 0,
    uses_db_model: 0
  };

  if (metrics) {
    metrics.forEach(m => {
      const layers = m.coverage_by_layer || {};
      Object.keys(layerSums).forEach(layer => {
        if (layers[layer] !== null && layers[layer] !== undefined) {
          layerSums[layer] += parseFloat(layers[layer]);
          layerCounts[layer]++;
        }
      });
    });
  }

  const coverageByLayer = {};
  Object.keys(layerSums).forEach(layer => {
    coverageByLayer[layer] = layerCounts[layer] > 0
      ? parseFloat((layerSums[layer] / layerCounts[layer]).toFixed(2))
      : 100.00; // default if layer is unused
  });

  return {
    coverageDistribution: distribution,
    lowestCoverageApps,
    highestCoverageApps,
    coverageByLayer
  };
}

/**
 * Endpoint 3: Filtered Knowledge Gaps
 */
export async function getObservabilityGaps(filters = {}) {
  const { status, priority, type, limit = 50 } = filters;

  let query = supabase
    .from('knowledge_gaps')
    .select('*')
    .order('first_seen_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }
  if (priority) {
    query = query.eq('priority', priority);
  }
  if (type) {
    query = query.eq('gap_type', type);
  }

  query = query.limit(parseInt(limit));

  const { data: gaps, error } = await query;
  if (error) throw error;
  return gaps || [];
}

/**
 * Endpoint 4: Historical Trends (Immutable time-series dates)
 */
export async function getObservabilityTrends() {
  // Query snapshots from entity_coverage_history
  const { data: history, error } = await supabase
    .from('entity_coverage_history')
    .select('snapshot_date, coverage_score')
    .order('snapshot_date', { ascending: true });

  if (error) throw error;

  // Group scores by date to calculate average coverage over time
  const datesMap = {};
  if (history) {
    history.forEach(h => {
      const date = h.snapshot_date;
      if (!datesMap[date]) datesMap[date] = [];
      datesMap[date].push(parseFloat(h.coverage_score));
    });
  }

  const points = Object.keys(datesMap).map(date => {
    const scores = datesMap[date];
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return {
      date,
      coverage: parseFloat(avg.toFixed(2))
    };
  });

  // Query gaps over time (grouped by created/first_seen date)
  const { data: gapHistory } = await supabase
    .from('knowledge_gaps')
    .select('first_seen_at');

  const gapsMap = {};
  if (gapHistory) {
    gapHistory.forEach(g => {
      const date = new Date(g.first_seen_at).toISOString().split('T')[0];
      gapsMap[date] = (gapsMap[date] || 0) + 1;
    });
  }

  const gapPoints = Object.keys(gapsMap).map(date => ({
    date,
    count: gapsMap[date]
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Determine trend history sufficiency
  const uniqueDatesCount = points.length;
  const insufficientHistory = uniqueDatesCount < 3; // require at least 3 days for a true trend chart

  return {
    points,
    gapPoints,
    uniqueDatesCount,
    insufficient_history: insufficientHistory
  };
}

/**
 * Endpoint 5: Cached Integrity Validation Results
 */
export async function getObservabilityIntegrity() {
  // 1. Cache-first check: Try to fetch the latest cached integrity metrics
  const { data: latestDaily, error } = await supabase
    .from('knowledge_metrics_daily')
    .select('integrity_metrics')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!error && latestDaily?.integrity_metrics) {
    console.log("[observabilityService] Returning cached integrity validation results.");
    return latestDaily.integrity_metrics;
  }

  // 2. Fallback: Run full DFS scan dynamically if cache is empty
  console.log("[observabilityService] Cache empty. Running dynamic graph integrity calculations...");
  const { data: allEntities } = await supabase.from('kb_entities').select('id, name, entity_type');
  const { data: allRels } = await supabase.from('kb_relationships').select('source_id, target_id, relation_type');

  if (!allEntities || !allRels) {
    return {
      orphans: [],
      duplicate_slugs_count: 0,
      broken_relationships_count: 0,
      circular_relationships: [],
      invalid_relationship_types_count: 0,
      last_run_at: new Date().toISOString()
    };
  }

  const currentEntityIds = new Set(allEntities.map(e => e.id));
  const entityTypeMap = {};
  allEntities.forEach(e => { entityTypeMap[e.id] = e.entity_type; });

  // Orphans
  const outgoingCounts = {};
  const incomingCounts = {};
  allEntities.forEach(e => {
    outgoingCounts[e.id] = 0;
    incomingCounts[e.id] = 0;
  });
  allRels.forEach(r => {
    if (outgoingCounts[r.source_id] !== undefined) outgoingCounts[r.source_id]++;
    if (incomingCounts[r.target_id] !== undefined) incomingCounts[r.target_id]++;
  });

  const orphansList = [];
  allEntities.forEach(e => {
    if (outgoingCounts[e.id] + incomingCounts[e.id] === 0) {
      orphansList.push(e.id);
    }
  });

  // Duplicates
  const nameCounts = {};
  allEntities.forEach(e => {
    if (e.name) {
      nameCounts[e.name] = (nameCounts[e.name] || 0) + 1;
    }
  });
  const duplicateNames = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);

  // Broken links
  const brokenRels = allRels.filter(r => !currentEntityIds.has(r.source_id) || !currentEntityIds.has(r.target_id));

  // Cycles
  const adj = {};
  allEntities.forEach(e => { adj[e.id] = []; });
  allRels.forEach(r => {
    if (adj[r.source_id]) adj[r.source_id].push(r.target_id);
  });

  const cycles = [];
  const visited = {};
  const recStack = {};

  const detectCyclesDFS = (node, path = []) => {
    visited[node] = true;
    recStack[node] = true;
    path.push(node);

    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      if (!visited[neighbor]) {
        detectCyclesDFS(neighbor, [...path]);
      } else if (recStack[neighbor]) {
        const cycleStartIndex = path.indexOf(neighbor);
        const cycle = path.slice(cycleStartIndex);
        cycle.push(neighbor);
        cycles.push(cycle.join(' -> '));
      }
    }
    recStack[node] = false;
  };

  allEntities.forEach(e => {
    if (!visited[e.id]) {
      detectCyclesDFS(e.id);
    }
  });

  // Invalid types
  const validRelTypes = new Set(['has_feature', 'renders_page', 'contains_component', 'requires_backend', 'uses_db_model', 'implements_pattern']);
  const invalidTypesCount = allRels.filter(r => !validRelTypes.has(r.relation_type)).length;

  return {
    orphans: orphansList.map(id => ({
      id,
      is_valid: ['typography', 'theme', 'wizard_step'].includes(entityTypeMap[id]) || id.startsWith('design_token')
    })),
    duplicate_slugs_count: duplicateNames.length,
    broken_relationships_count: brokenRels.length,
    circular_relationships: cycles,
    invalid_relationship_types_count: invalidTypesCount,
    last_run_at: new Date().toISOString(),
    labels: {
      orphans: "Independent Design Elements",
      duplicate_slugs_count: "Duplicate Identifiers",
      broken_relationships_count: "Dangling References",
      circular_relationships: "Recursive Reference Loops",
      invalid_relationship_types_count: "Invalid Reference Types"
    }
  };
}

/**
 * Endpoint 6: A/B Benchmark Evaluation comparison stats
 */
export async function getObservabilityAbComparison() {
  const { data: runs, error } = await supabase
    .from('prompt_history')
    .select('*')
    .eq('telemetry_source', 'synthetic_test');

  if (error) throw error;

  // Let's compute pairwise comparisons
  const pairwiseMap = {};
  runs.forEach(run => {
    const rag = run.rag_details || {};
    const benchmarkId = rag.benchmark_id || run.title?.replace('AB Eval [Legacy] - ', '')?.replace('AB Eval [Blueprint] - ', '') || 'unknown';
    const genType = rag.generation_type;

    if (!pairwiseMap[benchmarkId]) {
      pairwiseMap[benchmarkId] = {
        benchmark_id: benchmarkId,
        query: run.query,
        mode: run.mode,
        legacy: null,
        blueprint: null
      };
    }

    const tv2 = rag.telemetry_v2 || {};

    const runInfo = {
      id: run.id,
      latency_ms: tv2.latency_ms || rag.latencyMs || 0,
      quality_score: tv2.llm_evaluation_score || tv2.overall_quality_score || 0,
      patch_count: tv2.patch_count || 0,
      rubric: tv2.evaluation_rubric || null,
      utilization_rate: tv2.retrieval_utilization_rate || 0,
      completion_rate: tv2.blueprint_completion_rate || 0,
      structural_accuracy: tv2.structural_accuracy || null,
      structural_accuracy_score: tv2.structural_accuracy_score || 0,
      blueprint_version: tv2.blueprint_version || null,
      expected_context: tv2.expected_context || null,
      timestamp: run.timestamp
    };

    if (genType === 'legacy_rag') {
      pairwiseMap[benchmarkId].legacy = runInfo;
    } else if (genType === 'blueprint_guided') {
      pairwiseMap[benchmarkId].blueprint = runInfo;
    }
  });

  const pairwise = Object.values(pairwiseMap).filter(p => p.legacy || p.blueprint);

  // Compute aggregate comparison statistics dynamically
  const aggregates = {
    legacy: {
      avg_quality_score: 0,
      avg_latency_ms: 0,
      total_patches: 0,
      avg_structural_accuracy_score: 0,
      total_runs: 0
    },
    blueprint: {
      avg_quality_score: 0,
      avg_latency_ms: 0,
      total_patches: 0,
      avg_utilization: 0,
      avg_completion: 0,
      avg_structural_accuracy_score: 0,
      total_runs: 0
    }
  };

  let legacyCount = 0;
  let blueprintCount = 0;

  pairwise.forEach(p => {
    if (p.legacy) {
      aggregates.legacy.avg_quality_score += p.legacy.quality_score;
      aggregates.legacy.avg_latency_ms += p.legacy.latency_ms;
      aggregates.legacy.total_patches += p.legacy.patch_count;
      aggregates.legacy.avg_structural_accuracy_score += (p.legacy.structural_accuracy_score || 0);
      legacyCount++;
    }
    if (p.blueprint) {
      aggregates.blueprint.avg_quality_score += p.blueprint.quality_score;
      aggregates.blueprint.avg_latency_ms += p.blueprint.latency_ms;
      aggregates.blueprint.total_patches += p.blueprint.patch_count;
      aggregates.blueprint.avg_utilization += p.blueprint.utilization_rate;
      aggregates.blueprint.avg_completion += p.blueprint.completion_rate;
      aggregates.blueprint.avg_structural_accuracy_score += (p.blueprint.structural_accuracy_score || 0);
      blueprintCount++;
    }
  });

  if (legacyCount > 0) {
    aggregates.legacy.avg_quality_score = parseFloat((aggregates.legacy.avg_quality_score / legacyCount).toFixed(2));
    aggregates.legacy.avg_latency_ms = Math.round(aggregates.legacy.avg_latency_ms / legacyCount);
    aggregates.legacy.avg_structural_accuracy_score = parseFloat((aggregates.legacy.avg_structural_accuracy_score / legacyCount).toFixed(2));
    aggregates.legacy.total_runs = legacyCount;
  }
  if (blueprintCount > 0) {
    aggregates.blueprint.avg_quality_score = parseFloat((aggregates.blueprint.avg_quality_score / blueprintCount).toFixed(2));
    aggregates.blueprint.avg_latency_ms = Math.round(aggregates.blueprint.avg_latency_ms / blueprintCount);
    aggregates.blueprint.avg_utilization = parseFloat((aggregates.blueprint.avg_utilization / blueprintCount).toFixed(2));
    aggregates.blueprint.avg_completion = parseFloat((aggregates.blueprint.avg_completion / blueprintCount).toFixed(2));
    aggregates.blueprint.avg_structural_accuracy_score = parseFloat((aggregates.blueprint.avg_structural_accuracy_score / blueprintCount).toFixed(2));
    aggregates.blueprint.total_runs = blueprintCount;
  }

  // Also query the ab_benchmark_metrics table to get historical time-series if available
  let history = [];
  try {
    const { data: dbHistory } = await supabase
      .from('ab_benchmark_metrics')
      .select('*')
      .order('date', { ascending: true });
    if (dbHistory) history = dbHistory;
  } catch (err) {
    console.warn("[observabilityService] ab_benchmark_metrics table not queried:", err.message);
  }

  return {
    aggregates,
    pairwise,
    history
  };
}
