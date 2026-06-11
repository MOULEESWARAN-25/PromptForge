import { supabase } from './supabaseClient.js';

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
 * 
 * @param {string} entityId - The source entity ID (e.g. 'student_hub')
 * @param {string[]} resolvedEntityIds - List of resolved/retrieved target entity IDs
 * @param {object[]} [customRels] - Optional pre-defined relationship list for unit test fixtures
 * @returns {Promise<object>} The coverage scoring profile
 */
export async function calculateEntityCoverage(entityId, resolvedEntityIds = [], customRels = null) {
  let rels = [];
  if (customRels) {
    rels = customRels;
  } else {
    try {
      const { data, error } = await supabase
        .from('kb_relationships')
        .select('target_id, relation_type')
        .eq('source_id', entityId);
      if (error) throw error;
      rels = data || [];
    } catch (err) {
      console.error(`[coverageScorer] Failed to fetch relationships for ${entityId}: ${err.message}`);
      rels = [];
    }
  }

  // Group expected relationship targets by their types
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
      // Fixture D: Null represents layer not expected (avoid penalizing overall score)
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

      // Add to weighted overall score calculation
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
