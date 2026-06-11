/**
 * blueprintBuilder.js
 * 
 * Dynamically maps Graph RAG selections, database relationships, and retrieved 
 * knowledge graph entities into a structured JSON Architecture Blueprint conforming to blueprint_v1.md.
 */

import { supabase } from './supabaseClient.js';
import { calculateEntityCoverage } from './coverageScorer.js';
import { validateBlueprintV1 } from './blueprintValidator.js';

/**
 * Performs graph materialization closure in memory.
 * Resolves structural dependencies and containment relationships.
 * 
 * @param {object[]} retrievedEntities - List of initial RAG entities
 * @param {object[]} allRelations - Complete list of relationships from database
 * @returns {object} Closure resolution details
 */
export function resolveBlueprintClosure(retrievedEntities, allRelations) {
  const closedIds = new Set(retrievedEntities.map(e => e.id));
  const materializedRelations = [];

  const closureSources = {
    requires_backend: 0,
    uses_db_model: 0,
    parent_page: 0,
    renders_page: 0,
    has_feature: 0,
    contains_component: 0
  };

  const outRelsMap = {};
  const inRelsMap = {};
  allRelations.forEach(rel => {
    if (!outRelsMap[rel.source_id]) outRelsMap[rel.source_id] = [];
    outRelsMap[rel.source_id].push(rel);

    if (!inRelsMap[rel.target_id]) inRelsMap[rel.target_id] = [];
    inRelsMap[rel.target_id].push(rel);
  });

  const entityTypeMap = {};
  retrievedEntities.forEach(e => {
    entityTypeMap[e.id] = e.entity_type;
  });

  let currentGeneration = Array.from(closedIds);
  let closureDepth = 0;

  while (currentGeneration.length > 0) {
    const nextGeneration = [];
    let addedInThisDepth = false;

    currentGeneration.forEach(id => {
      const sourceType = entityTypeMap[id];
      if (sourceType === 'theme' || sourceType === 'typography' || sourceType === 'design_token') {
        return;
      }

      // Outbound structural relationships
      const outRels = outRelsMap[id] || [];
      outRels.forEach(rel => {
        const structuralRelTypes = new Set([
          'requires_backend',
          'uses_db_model',
          'renders_page',
          'contains_component',
          'requires_auth',
          'requires_security',
          'requires_compliance',
          'requires_billing',
          'depends_on_provider'
        ]);

        if (structuralRelTypes.has(rel.relation_type)) {
          materializedRelations.push(rel);
          if (!closedIds.has(rel.target_id)) {
            closedIds.add(rel.target_id);
            nextGeneration.push(rel.target_id);
            closureSources[rel.relation_type] = (closureSources[rel.relation_type] || 0) + 1;
            addedInThisDepth = true;
          }
        }
      });

      // Inbound parent page relationships (specifically component -> page)
      const inRels = inRelsMap[id] || [];
      inRels.forEach(rel => {
        if (rel.relation_type === 'contains_component') {
          materializedRelations.push(rel);
          if (!closedIds.has(rel.source_id)) {
            closedIds.add(rel.source_id);
            nextGeneration.push(rel.source_id);
            closureSources['parent_page'] = (closureSources['parent_page'] || 0) + 1;
            addedInThisDepth = true;
          }
        }
      });
    });

    if (addedInThisDepth) {
      closureDepth++;
    }
    currentGeneration = nextGeneration;
  }

  return {
    closedIds,
    closureSources,
    closureDepth,
    materializedRelations
  };
}

/**
 * Assembles a JSON Architecture Blueprint structure from entities and relations.
 */
function assembleBlueprintJson({
  normalizedMode,
  projectName,
  projectDescription,
  projectIntegration,
  theme,
  typography,
  entities,
  relations,
  retrievedIds,
  anchorEntityId
}) {
  const requiresBackendIds = new Set();
  const parentPageMap = new Map();
  
  relations.forEach(rel => {
    if (rel.relation_type === 'requires_backend') {
      requiresBackendIds.add(rel.source_id);
    } else if (rel.relation_type === 'contains_component') {
      parentPageMap.set(rel.target_id, rel.source_id);
    }
  });

  const materializedIds = new Set(entities.map(e => e.id));

  function getDependencies(entityId, entityType, parentPage = null) {
    const deps = new Set();
    relations.forEach(rel => {
      if (rel.source_id === entityId && materializedIds.has(rel.target_id)) {
        deps.add(rel.target_id);
      }
    });
    if (entityType === 'component' && parentPage && materializedIds.has(parentPage)) {
      deps.add(parentPage);
    }
    return Array.from(deps);
  }

  function extractPurposeAndNotes(ent) {
    // purpose: prefer dedicated field → business_goals → why (from enrichment) → fallback
    let purpose = ent.purpose || '';
    if (!purpose && Array.isArray(ent.business_goals) && ent.business_goals.length > 0) {
      purpose = ent.business_goals.join(' ');
    }
    if (!purpose && ent.prompt_fragments?.why) {
      purpose = ent.prompt_fragments.why;
    }
    if (!purpose) {
      purpose = `Serves as the key domain controller for ${ent.name || ent.id} configurations.`;
    }

    // implementation_notes: prefer implementation_guidelines → best_practices (from enrichment) → prompt_fragments arrays
    let implementation_notes = [];
    if (Array.isArray(ent.implementation_guidelines) && ent.implementation_guidelines.length > 0) {
      implementation_notes = [...ent.implementation_guidelines];
    }
    if (implementation_notes.length === 0 && Array.isArray(ent.prompt_fragments?.best_practices)) {
      implementation_notes = [...ent.prompt_fragments.best_practices];
    }
    if (implementation_notes.length === 0) {
      implementation_notes = ['Standard implementation guidelines apply.'];
    }

    // Phase III-E.1 enrichment fields
    const pitfalls     = Array.isArray(ent.prompt_fragments?.pitfalls)     ? ent.prompt_fragments.pitfalls     : [];
    const when_to_use  = ent.prompt_fragments?.when_to_use                 || null;
    const alternatives = Array.isArray(ent.prompt_fragments?.alternatives) ? ent.prompt_fragments.alternatives : [];

    // Phase III-F.2 prompt intelligence fields
    const prompt_patterns       = Array.isArray(ent.prompt_fragments?.prompt_patterns)       ? ent.prompt_fragments.prompt_patterns       : [];
    const reasoning_patterns    = Array.isArray(ent.prompt_fragments?.reasoning_patterns)    ? ent.prompt_fragments.reasoning_patterns    : [];
    const generation_constraints = Array.isArray(ent.prompt_fragments?.generation_constraints) ? ent.prompt_fragments.generation_constraints : [];
    const quality_checks        = Array.isArray(ent.prompt_fragments?.quality_checks)        ? ent.prompt_fragments.quality_checks        : [];
    const failure_patterns      = Array.isArray(ent.prompt_fragments?.failure_patterns)      ? ent.prompt_fragments.failure_patterns      : [];

    return { 
      purpose, 
      implementation_notes, 
      pitfalls, 
      when_to_use, 
      alternatives,
      prompt_patterns,
      reasoning_patterns,
      generation_constraints,
      quality_checks,
      failure_patterns
    };
  }

  const blueprint = {
    blueprint_version: 1,
    mode: normalizedMode
  };

  if (normalizedMode === 'fullstack') {
    const app = entities.find(e => e.entity_type === 'application') || {
      id: anchorEntityId || 'custom_app',
      name: projectName,
      overview: projectDescription
    };
    const { 
      purpose, implementation_notes, pitfalls, when_to_use, alternatives,
      prompt_patterns, reasoning_patterns, generation_constraints, quality_checks, failure_patterns
    } = extractPurposeAndNotes(app);
    blueprint.application = {
      id: app.id,
      name: app.name,
      overview: app.overview || '',
      purpose,
      when_to_use,
      implementation_notes,
      pitfalls,
      alternatives,
      prompt_patterns,
      reasoning_patterns,
      generation_constraints,
      quality_checks,
      failure_patterns,
      depends_on: getDependencies(app.id, 'application'),
      source: retrievedIds.includes(app.id) ? 'graph' : 'user'
    };
    if (app.kb_type) {
      blueprint.application.kb_type = app.kb_type;
    }
  }

  blueprint.features = [];
  entities.forEach(ent => {
    if (ent.entity_type === 'feature') {
      const { 
        purpose, implementation_notes, pitfalls, when_to_use, alternatives,
        prompt_patterns, reasoning_patterns, generation_constraints, quality_checks, failure_patterns
      } = extractPurposeAndNotes(ent);
      const feat = {
        id: ent.id,
        name: ent.name,
        category: ent.category || 'core',
        requires_backend: requiresBackendIds.has(ent.id) || ent.prompt_fragments?.requires_backend === true || false,
        overview: ent.overview || '',
        purpose,
        when_to_use,
        implementation_notes,
        pitfalls,
        alternatives,
        prompt_patterns,
        reasoning_patterns,
        generation_constraints,
        quality_checks,
        failure_patterns,
        depends_on: getDependencies(ent.id, 'feature'),
        source: retrievedIds.includes(ent.id) ? 'graph' : 'inference'
      };
      if (ent.kb_type) feat.kb_type = ent.kb_type;
      blueprint.features.push(feat);
    }
  });

  blueprint.pages = [];
  entities.forEach(ent => {
    if (ent.entity_type === 'page') {
      let layout = 'Standard Layout';
      if (ent.prompt_fragments) {
        if (ent.prompt_fragments.layout) {
          layout = ent.prompt_fragments.layout;
        } else if (Array.isArray(ent.prompt_fragments.architecture)) {
          const found = ent.prompt_fragments.architecture.find(a => a.toLowerCase().includes('layout:'));
          if (found) {
            layout = found.replace(/^layout:\s*/i, '');
          }
        }
      }
      const { 
        purpose, implementation_notes, pitfalls, when_to_use, alternatives,
        prompt_patterns, reasoning_patterns, generation_constraints, quality_checks, failure_patterns
      } = extractPurposeAndNotes(ent);
      const page = {
        id: ent.id,
        name: ent.name,
        layout,
        overview: ent.overview || '',
        purpose,
        when_to_use,
        implementation_notes,
        pitfalls,
        alternatives,
        prompt_patterns,
        reasoning_patterns,
        generation_constraints,
        quality_checks,
        failure_patterns,
        depends_on: getDependencies(ent.id, 'page'),
        source: retrievedIds.includes(ent.id) ? 'graph' : 'inference'
      };
      if (ent.kb_type) page.kb_type = ent.kb_type;
      blueprint.pages.push(page);
    }
  });

  blueprint.components = [];
  entities.forEach(ent => {
    if (ent.entity_type === 'component') {
      let parentPage = parentPageMap.get(ent.id);
      if (!parentPage) {
        const firstPage = entities.find(e => e.entity_type === 'page');
        parentPage = firstPage ? firstPage.id : 'dashboard_page';
      }
      const { 
        purpose, implementation_notes, pitfalls, when_to_use, alternatives,
        prompt_patterns, reasoning_patterns, generation_constraints, quality_checks, failure_patterns
      } = extractPurposeAndNotes(ent);
      const comp = {
        id: ent.id,
        name: ent.name,
        parent_page: parentPage,
        overview: ent.overview || '',
        purpose,
        when_to_use,
        implementation_notes,
        pitfalls,
        alternatives,
        prompt_patterns,
        reasoning_patterns,
        generation_constraints,
        quality_checks,
        failure_patterns,
        depends_on: getDependencies(ent.id, 'component', parentPage),
        source: retrievedIds.includes(ent.id) ? 'graph' : 'inference'
      };
      if (ent.kb_type) comp.kb_type = ent.kb_type;
      blueprint.components.push(comp);
    }
  });

  blueprint.backend_modules = [];
  entities.forEach(ent => {
    if (ent.entity_type === 'backend_module') {
      let endpoint = `GET /api/${ent.id.replace(/(_api|_backend|_server)/g, '')}`;
      let storageType = 'memory';

      if (ent.prompt_fragments) {
        if (ent.prompt_fragments.endpoint) endpoint = ent.prompt_fragments.endpoint;
        if (ent.prompt_fragments.storage_type) storageType = ent.prompt_fragments.storage_type;
      }

      const usesDb = relations.some(r => r.source_id === ent.id && r.relation_type === 'uses_db_model');
      if (usesDb) {
        storageType = 'database';
      }

      const { 
        purpose, implementation_notes, pitfalls, when_to_use, alternatives,
        prompt_patterns, reasoning_patterns, generation_constraints, quality_checks, failure_patterns
      } = extractPurposeAndNotes(ent);
      const bm = {
        id: ent.id,
        name: ent.name,
        endpoint,
        storage_type: storageType,
        overview: ent.overview || '',
        purpose,
        when_to_use,
        implementation_notes,
        pitfalls,
        alternatives,
        prompt_patterns,
        reasoning_patterns,
        generation_constraints,
        quality_checks,
        failure_patterns,
        depends_on: getDependencies(ent.id, 'backend_module'),
        source: retrievedIds.includes(ent.id) ? 'graph' : 'inference'
      };
      if (ent.kb_type) bm.kb_type = ent.kb_type;
      blueprint.backend_modules.push(bm);
    }
  });

  blueprint.database_entities = [];
  entities.forEach(ent => {
    if (ent.entity_type === 'database_entity') {
      const { 
        purpose, implementation_notes, pitfalls, when_to_use, alternatives,
        prompt_patterns, reasoning_patterns, generation_constraints, quality_checks, failure_patterns
      } = extractPurposeAndNotes(ent);
      const db = {
        id: ent.id,
        name: ent.name,
        overview: ent.overview || '',
        purpose,
        when_to_use,
        implementation_notes,
        pitfalls,
        alternatives,
        prompt_patterns,
        reasoning_patterns,
        generation_constraints,
        quality_checks,
        failure_patterns,
        depends_on: getDependencies(ent.id, 'database_entity'),
        source: retrievedIds.includes(ent.id) ? 'graph' : 'inference'
      };
      if (ent.kb_type) db.kb_type = ent.kb_type;
      blueprint.database_entities.push(db);
    }
  });

  blueprint.design_system = {
    theme,
    typography
  };

  blueprint.constraints = {
    standalone_project: projectIntegration !== 'existing',
    existing_project: projectIntegration === 'existing'
  };

  return blueprint;
}

/**
 * Configurable set of dependency/containment edge types used for
 * transitive chain marking during closure selectivity calculations.
 * Extend this array to include additional relationship types as the
 * graph grows (e.g., 'extends', 'depends_on') without rewriting scoring logic.
 */
const DEPENDENCY_EDGES = ['depends_on', 'parent_page'];

/**
 * Builds a JSON Architecture Blueprint from retrieved RAG entities.
 */
export async function buildBlueprint({
  mode,
  projectName = 'my-awesome-project',
  projectDescription = 'A premium web application',
  projectIntegration = 'new',
  framework = 'Tailwind CSS',
  theme = 'Sleek Dark Glassmorphic',
  typography = 'Inter Sans',
  retrievedEntities = [],
  telemetry = {},
  expectationSource = 'graph',
  externalExpectations = null
}) {
  // Normalize mode to conform to blueprint spec: fullstack, page, component
  let normalizedMode = 'fullstack';
  const cleanMode = (mode || '').toLowerCase();
  if (cleanMode === 'component') {
    normalizedMode = 'component';
  } else if (cleanMode === 'page' || cleanMode === 'spa') {
    normalizedMode = 'page';
  } else {
    normalizedMode = 'fullstack';
  }

  const initialEntities = [...retrievedEntities];
  const initialRetrievedIds = initialEntities.map(e => e.id);

  // Fetch all graph relationships to resolve transitive blueprint closure in memory (Phase III-D.6A)
  let allRelations = [];
  try {
    const { data, error } = await supabase
      .from('kb_relationships')
      .select('*');
    if (!error && data) {
      allRelations = data;
    }
  } catch (err) {
    console.warn(`[blueprintBuilder] Could not query graph relationships: ${err.message}.`);
  }

  // Pre-process relationships for pre-closure calculations
  const preRequiresBackendIds = new Set();
  const preParentPageMap = new Map();
  allRelations.forEach(rel => {
    if (rel.relation_type === 'requires_backend') {
      preRequiresBackendIds.add(rel.source_id);
    } else if (rel.relation_type === 'contains_component') {
      preParentPageMap.set(rel.target_id, rel.source_id);
    }
  });

  // Calculate Expected Context Expectations
  const expectedFeatures = new Set();
  const expectedPages = new Set();
  const expectedComponents = new Set();
  const expectedBackendModules = new Set();
  const expectedDatabaseEntities = new Set();

  const appEnt = retrievedEntities.find(e => e.entity_type === 'application');

  if (appEnt) {
    allRelations.forEach(rel => {
      if (rel.source_id === appEnt.id && rel.relation_type === 'has_feature') {
        expectedFeatures.add(rel.target_id);
      }
    });
  }
  if (telemetry && telemetry.selected_entities) {
    retrievedEntities.forEach(ent => {
      if (ent.entity_type === 'feature' && telemetry.selected_entities.includes(ent.id)) {
        expectedFeatures.add(ent.id);
      }
    });
  }
  if (expectedFeatures.size === 0) {
    retrievedEntities.forEach(ent => {
      if (ent.entity_type === 'feature') expectedFeatures.add(ent.id);
    });
  }

  expectedFeatures.forEach(featId => {
    allRelations.forEach(rel => {
      if (rel.source_id === featId) {
        if (rel.relation_type === 'renders_page') {
          expectedPages.add(rel.target_id);
        } else if (rel.relation_type === 'requires_backend') {
          expectedBackendModules.add(rel.target_id);
        }
      }
    });
  });

  expectedPages.forEach(pageId => {
    allRelations.forEach(rel => {
      if (rel.source_id === pageId && rel.relation_type === 'contains_component') {
        expectedComponents.add(rel.target_id);
      }
    });
  });

  expectedBackendModules.forEach(bmId => {
    allRelations.forEach(rel => {
      if (rel.source_id === bmId && rel.relation_type === 'uses_db_model') {
        expectedDatabaseEntities.add(rel.target_id);
      }
    });
  });


  const expected_context = {
    source: expectationSource,
    features: externalExpectations ? (externalExpectations.expected_features ?? externalExpectations.features ?? 0) : expectedFeatures.size,
    pages: externalExpectations ? (externalExpectations.expected_pages ?? externalExpectations.pages ?? 0) : expectedPages.size,
    components: externalExpectations ? (externalExpectations.expected_components ?? externalExpectations.components ?? 0) : expectedComponents.size,
    backend_modules: externalExpectations ? (externalExpectations.expected_backend_modules ?? externalExpectations.backend_modules ?? 0) : expectedBackendModules.size,
    database_entities: externalExpectations ? (externalExpectations.expected_database_entities ?? externalExpectations.database_entities ?? 0) : expectedDatabaseEntities.size
  };

  const expectedTotal = 
    (expected_context.features || 0) +
    (expected_context.pages || 0) +
    (expected_context.components || 0) +
    (expected_context.backend_modules || 0) +
    (expected_context.database_entities || 0);

  // Determine the primary/anchor entity for coverage score
  let anchorEntityId = null;
  if (normalizedMode === 'fullstack') {
    if (appEnt) anchorEntityId = appEnt.id;
  } else if (normalizedMode === 'page') {
    const pageEnt = retrievedEntities.find(e => e.entity_type === 'page');
    if (pageEnt) anchorEntityId = pageEnt.id;
  } else if (normalizedMode === 'component') {
    const compEnt = retrievedEntities.find(e => e.entity_type === 'component');
    if (compEnt) anchorEntityId = compEnt.id;
  }

  if (!anchorEntityId && telemetry.selected_entities && telemetry.selected_entities.length > 0) {
    anchorEntityId = telemetry.selected_entities[0];
  }

  const anchorIds = new Set();
  if (telemetry.selected_entities) {
    telemetry.selected_entities.forEach(id => anchorIds.add(id));
  }
  if (anchorEntityId) {
    anchorIds.add(anchorEntityId);
  }

  // 1. Assemble temporary pre-closure blueprint using only initial retrieved entities
  const preClosureBlueprint = assembleBlueprintJson({
    normalizedMode,
    projectName,
    projectDescription,
    projectIntegration,
    theme,
    typography,
    entities: initialEntities,
    relations: allRelations,
    retrievedIds: initialRetrievedIds,
    anchorEntityId
  });

  // 2. Validate pre-closure blueprint to get baseline errors/warnings
  const preValidation = validateBlueprintV1(preClosureBlueprint);
  const pre_closure_validator_failures = preValidation.errors.length + preValidation.warnings.length;

  // Perform transitive materialization closure in memory using resolveBlueprintClosure
  const {
    closedIds,
    closureSources,
    closureDepth,
    materializedRelations
  } = resolveBlueprintClosure(retrievedEntities, allRelations);

  const closureAdditions = {
    features: [],
    pages: [],
    components: [],
    backend_modules: [],
    database_entities: []
  };

  // Batch fetch missing entities from the database
  const missingIds = Array.from(closedIds).filter(id => !retrievedEntities.some(e => e.id === id));
  if (missingIds.length > 0) {
    try {
      console.log(`[blueprintBuilder] Batch fetching ${missingIds.length} missing closure entities: [${missingIds.join(', ')}]`);
      const { data: missingEntities, error } = await supabase
        .from('kb_entities')
        .select('*')
        .in('id', missingIds);

      if (!error && missingEntities) {
        missingEntities.forEach(ent => {
          retrievedEntities.push(ent);

          if (ent.entity_type === 'feature') closureAdditions.features.push(ent.id);
          else if (ent.entity_type === 'page') closureAdditions.pages.push(ent.id);
          else if (ent.entity_type === 'component') closureAdditions.components.push(ent.id);
          else if (ent.entity_type === 'backend_module') closureAdditions.backend_modules.push(ent.id);
          else if (ent.entity_type === 'database_entity') closureAdditions.database_entities.push(ent.id);
        });
      }
    } catch (err) {
      console.error(`[blueprintBuilder] Batch fetching missing entities failed: ${err.message}`);
    }
  }

  // Relations array used to build dependencies in blueprint is now all materialized relations
  let relations = materializedRelations;

  // 3. Assemble final post-closure blueprint containing all additions
  const postClosureBlueprint = assembleBlueprintJson({
    normalizedMode,
    projectName,
    projectDescription,
    projectIntegration,
    theme,
    typography,
    entities: retrievedEntities,
    relations,
    retrievedIds: initialRetrievedIds,
    anchorEntityId
  });

  // 4. Validate final post-closure blueprint
  const postValidation = validateBlueprintV1(postClosureBlueprint);
  const post_closure_validator_failures = postValidation.errors.length + postValidation.warnings.length;

  // Dynamic coverage score calculation
  let coverageScore = 100.00;
  if (anchorEntityId) {
    try {
      const cov = await calculateEntityCoverage(anchorEntityId, initialRetrievedIds);
      coverageScore = cov.overall_score;
    } catch (err) {
      console.warn(`[blueprintBuilder] Coverage score calculation failed: ${err.message}. Defaulting to 100.`);
    }
  }

  // Calculate pre and post resolved counts (excluding application block if mapped in counts)
  const preFeatureCount = (preClosureBlueprint.features || []).length;
  const prePageCount = (preClosureBlueprint.pages || []).length;
  const preComponentCount = (preClosureBlueprint.components || []).length;
  const preBackendCount = (preClosureBlueprint.backend_modules || []).length;
  const preDbCount = (preClosureBlueprint.database_entities || []).length;
  const preResolvedTotal = preFeatureCount + prePageCount + preComponentCount + preBackendCount + preDbCount;

  const postFeatureCount = (postClosureBlueprint.features || []).length;
  const postPageCount = (postClosureBlueprint.pages || []).length;
  const postComponentCount = (postClosureBlueprint.components || []).length;
  const postBackendCount = (postClosureBlueprint.backend_modules || []).length;
  const postDbCount = (postClosureBlueprint.database_entities || []).length;
  const postResolvedTotal = postFeatureCount + postPageCount + postComponentCount + postBackendCount + postDbCount;
  const finalAppCount = postClosureBlueprint.application ? 1 : 0;
  const finalResolvedTotal = postResolvedTotal + finalAppCount;

  // retrieval_completion_rate — cap each layer at expected count so rate stays in [0, 100].
  // Graph expansion may retrieve MORE entities than expected; we measure "how many expected
  // slots were filled", not "how many total entities were retrieved".
  const cappedPreFeature = Math.min(preFeatureCount, expected_context.features || 0);
  const cappedPrePage = Math.min(prePageCount, expected_context.pages || 0);
  const cappedPreComponent = Math.min(preComponentCount, expected_context.components || 0);
  const cappedPreBackend = Math.min(preBackendCount, expected_context.backend_modules || 0);
  const cappedPreDb = Math.min(preDbCount, expected_context.database_entities || 0);
  const cappedPreTotal = cappedPreFeature + cappedPrePage + cappedPreComponent + cappedPreBackend + cappedPreDb;
  const retrieval_completion_rate = expectedTotal > 0 ? parseFloat(((cappedPreTotal / expectedTotal) * 100).toFixed(2)) : 100.00;

  // closure_completion_rate — same per-layer capping
  const cappedPostFeature = Math.min(postFeatureCount, expected_context.features || 0);
  const cappedPostPage = Math.min(postPageCount, expected_context.pages || 0);
  const cappedPostComponent = Math.min(postComponentCount, expected_context.components || 0);
  const cappedPostBackend = Math.min(postBackendCount, expected_context.backend_modules || 0);
  const cappedPostDb = Math.min(postDbCount, expected_context.database_entities || 0);
  const cappedPostTotal = cappedPostFeature + cappedPostPage + cappedPostComponent + cappedPostBackend + cappedPostDb;
  const closure_completion_rate = expectedTotal > 0 ? parseFloat(((cappedPostTotal / expectedTotal) * 100).toFixed(2)) : 100.00;

  // expectedIds collection for dependency metrics and precision
  const expectedIds = new Set([
    ...expectedFeatures,
    ...expectedPages,
    ...expectedComponents,
    ...expectedBackendModules,
    ...expectedDatabaseEntities
  ]);
  if (appEnt) expectedIds.add(appEnt.id);
  if (theme) expectedIds.add(theme);
  if (typography) expectedIds.add(typography);


  // retrieval_dependency_coverage
  const requiredDependencies = new Set(
    Array.from(expectedIds).filter(id => !anchorIds.has(id))
  );
  const retrievedDependencies = Array.from(requiredDependencies).filter(id => initialRetrievedIds.includes(id));
  const retrieval_dependency_coverage = requiredDependencies.size > 0 
    ? parseFloat(((retrievedDependencies.length / requiredDependencies.size) * 100).toFixed(2)) 
    : 100.00;

  // retrieval_purity_rate
  let finalFromInitial = 0;
  if (postClosureBlueprint.application && initialRetrievedIds.includes(postClosureBlueprint.application.id)) {
    finalFromInitial++;
  }
  postClosureBlueprint.features.forEach(f => { if (initialRetrievedIds.includes(f.id)) finalFromInitial++; });
  postClosureBlueprint.pages.forEach(p => { if (initialRetrievedIds.includes(p.id)) finalFromInitial++; });
  postClosureBlueprint.components.forEach(c => { if (initialRetrievedIds.includes(c.id)) finalFromInitial++; });
  postClosureBlueprint.backend_modules.forEach(b => { if (initialRetrievedIds.includes(b.id)) finalFromInitial++; });
  postClosureBlueprint.database_entities.forEach(d => { if (initialRetrievedIds.includes(d.id)) finalFromInitial++; });
  const retrieval_purity_rate = finalResolvedTotal > 0 ? parseFloat(((finalFromInitial / finalResolvedTotal) * 100).toFixed(2)) : 100.00;

  // closure_nodes_used_by_validator (Transitive Dependency Chain Selectivity)
  const closureAddedSet = new Set([
    ...closureAdditions.features,
    ...closureAdditions.pages,
    ...closureAdditions.components,
    ...closureAdditions.backend_modules,
    ...closureAdditions.database_entities
  ]);
  const closureAddedCount = closureAddedSet.size;

  const finalBlueprintIds = new Set();
  if (postClosureBlueprint.application) finalBlueprintIds.add(postClosureBlueprint.application.id);
  postClosureBlueprint.features.forEach(f => finalBlueprintIds.add(f.id));
  postClosureBlueprint.pages.forEach(p => finalBlueprintIds.add(p.id));
  postClosureBlueprint.components.forEach(c => finalBlueprintIds.add(c.id));
  postClosureBlueprint.backend_modules.forEach(b => finalBlueprintIds.add(b.id));
  postClosureBlueprint.database_entities.forEach(d => finalBlueprintIds.add(d.id));

  const requiredNodes = new Set();
  const queue = [];
  expectedIds.forEach(id => {
    if (finalBlueprintIds.has(id)) {
      requiredNodes.add(id);
      queue.push(id);
    }
  });
  anchorIds.forEach(id => {
    if (finalBlueprintIds.has(id) && !requiredNodes.has(id)) {
      requiredNodes.add(id);
      queue.push(id);
    }
  });

  const blueprintEntitiesMap = new Map();
  if (postClosureBlueprint.application) blueprintEntitiesMap.set(postClosureBlueprint.application.id, postClosureBlueprint.application);
  postClosureBlueprint.features.forEach(f => blueprintEntitiesMap.set(f.id, f));
  postClosureBlueprint.pages.forEach(p => blueprintEntitiesMap.set(p.id, p));
  postClosureBlueprint.components.forEach(c => blueprintEntitiesMap.set(c.id, c));
  postClosureBlueprint.backend_modules.forEach(b => blueprintEntitiesMap.set(b.id, b));
  postClosureBlueprint.database_entities.forEach(d => blueprintEntitiesMap.set(d.id, d));

  while (queue.length > 0) {
    const currentId = queue.shift();
    const entity = blueprintEntitiesMap.get(currentId);
    if (!entity) continue;

    DEPENDENCY_EDGES.forEach(edge => {
      const val = entity[edge];
      if (Array.isArray(val)) {
        val.forEach(depId => {
          if (finalBlueprintIds.has(depId) && !requiredNodes.has(depId)) {
            requiredNodes.add(depId);
            queue.push(depId);
          }
        });
      } else if (val) {
        if (finalBlueprintIds.has(val) && !requiredNodes.has(val)) {
          requiredNodes.add(val);
          queue.push(val);
        }
      }
    });
  }

  let closureNodesUsed = 0;
  closureAddedSet.forEach(id => {
    if (requiredNodes.has(id)) {
      closureNodesUsed++;
    }
  });
  const closure_selectivity_rate = closureAddedCount > 0 ? parseFloat(((closureNodesUsed / closureAddedCount) * 100).toFixed(2)) : 100.00;

  // closure_added_ratio
  const closure_added_ratio = finalResolvedTotal > 0 ? parseFloat(((closureAddedCount / finalResolvedTotal) * 100).toFixed(2)) : 0.00;

  // closure_efficiency_ratio
  const completion_gain = closure_completion_rate - retrieval_completion_rate;
  const closure_efficiency_ratio = closureAddedCount > 0 ? parseFloat((completion_gain / closureAddedCount).toFixed(2)) : 0.00;

  // Compute retrieval_utilization_rate
  const usedMaterializedIds = new Set();
  if (postClosureBlueprint.application && initialRetrievedIds.includes(postClosureBlueprint.application.id)) {
    usedMaterializedIds.add(postClosureBlueprint.application.id);
  }
  postClosureBlueprint.features.forEach(f => { if (initialRetrievedIds.includes(f.id)) usedMaterializedIds.add(f.id); });
  postClosureBlueprint.pages.forEach(p => { if (initialRetrievedIds.includes(p.id)) usedMaterializedIds.add(p.id); });
  postClosureBlueprint.components.forEach(c => { if (initialRetrievedIds.includes(c.id)) usedMaterializedIds.add(c.id); });
  postClosureBlueprint.backend_modules.forEach(b => { if (initialRetrievedIds.includes(b.id)) usedMaterializedIds.add(b.id); });
  postClosureBlueprint.database_entities.forEach(d => { if (initialRetrievedIds.includes(d.id)) usedMaterializedIds.add(d.id); });

  const retrieval_utilization_rate = initialEntities.length > 0 ? parseFloat(((usedMaterializedIds.size / initialEntities.length) * 100).toFixed(2)) : 100.00;

  const retrievedExpectedIds = initialRetrievedIds.filter(id => expectedIds.has(id));
  const retrieval_precision_rate = initialEntities.length > 0
    ? parseFloat(((retrievedExpectedIds.length / initialEntities.length) * 100).toFixed(2))
    : 100.00;

  // Verification & Metrics details
  postClosureBlueprint.coverage = {
    score: parseFloat(coverageScore.toFixed(2)),
    retrieval_utilization_rate,
    retrieval_precision_rate,
    retrieval_completion_rate,
    closure_completion_rate,
    retrieval_dependency_coverage,
    retrieval_purity_rate,
    closure_selectivity_rate,
    closure_added_ratio,
    closure_efficiency_ratio,
    pre_closure_validator_failures,
    post_closure_validator_failures,
    closure_added_nodes: closureAddedCount,
    dependency_closure_additions: {
      features: closureAdditions.features.length,
      pages: closureAdditions.pages.length,
      components: closureAdditions.components.length,
      backend_modules: closureAdditions.backend_modules.length,
      database_entities: closureAdditions.database_entities.length
    },
    closure_sources: closureSources,
    closure_depth: closureDepth
  };

  // Stable expected context counts
  postClosureBlueprint.expected_context = expected_context;

  // Extract optional recommendations
  const recommendations = [];
  if (Array.isArray(allRelations)) {
    allRelations.forEach(rel => {
      if (rel.relation_type === 'recommended_with' && finalBlueprintIds.has(rel.source_id)) {
        recommendations.push({
          source_id: rel.source_id,
          target_id: rel.target_id
        });
      }
    });
  }

  postClosureBlueprint.retrieval_metadata = {
    selected_entities: telemetry.selected_entities || [],
    expanded_entities: telemetry.expanded_entities || [],
    recommendations: recommendations
  };

  return postClosureBlueprint;
}
