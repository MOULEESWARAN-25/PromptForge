/**
 * blueprintValidator.js
 * 
 * Enforces schema requirements and architectural rules (V101 - V111) 
 * for JSON Architecture Blueprints prior to prompt generation.
 */

const ALLOWED_COMMON_TYPES = new Set(['theme', 'typography', 'design_token', 'layout_pattern', 'wizard_step']);

/**
 * Validates a JSON blueprint according to v1/v2 specifications.
 * 
 * @param {object} blueprint - The blueprint JSON object to validate
 * @param {object} [options={}] - Validation options
 * @param {boolean} [options.isProduction] - Enforce warning failover for production mode instead of error aborts
 * @returns {object} Validation result containing scores and diagnostics
 */
export function validateBlueprintV1(blueprint, options = {}) {
  const errors = [];
  const warnings = [];
  const isProduction = options.isProduction ?? (process.env.NODE_ENV === 'production');

  if (!blueprint) {
    return {
      valid: false,
      errors: [{ code: "V101", msg: "Blueprint is empty or null." }],
      warnings: [],
      validationScore: 0,
      validation_score: 0,
      structural_score: 0,
      knowledge_score: 0,
      governance_score: 0,
      coverage_score: 0
    };
  }

  const mode = (blueprint.mode || '').toLowerCase();

  // V101: blueprint_version check
  if (blueprint.blueprint_version !== 1) {
    errors.push({ code: "V101", msg: `Blueprint version '${blueprint.blueprint_version}' is invalid. Must be exactly 1.` });
  }

  // V102: design_system tokens check
  if (!blueprint.design_system || !blueprint.design_system.theme || !blueprint.design_system.typography) {
    errors.push({ code: "V102", msg: "Design system theme and typography must be defined." });
  }

  // Compile full entity list from blueprint structures to evaluate rules
  const allEntitiesList = [];
  if (blueprint.application) {
    allEntitiesList.push({
      ...blueprint.application,
      default_kb_type: 'fullstack',
      default_entity_type: 'application'
    });
  }
  (blueprint.features || []).forEach(f => {
    allEntitiesList.push({
      ...f,
      default_kb_type: 'fullstack',
      default_entity_type: 'feature'
    });
  });
  (blueprint.pages || []).forEach(p => {
    allEntitiesList.push({
      ...p,
      default_kb_type: 'spa',
      default_entity_type: 'page'
    });
  });
  (blueprint.components || []).forEach(c => {
    allEntitiesList.push({
      ...c,
      default_kb_type: 'spa',
      default_entity_type: 'component'
    });
  });
  (blueprint.backend_modules || []).forEach(b => {
    allEntitiesList.push({
      ...b,
      default_kb_type: 'fullstack',
      default_entity_type: 'backend_module'
    });
  });
  (blueprint.database_entities || []).forEach(d => {
    allEntitiesList.push({
      ...d,
      default_kb_type: 'fullstack',
      default_entity_type: 'database_entity'
    });
  });

  // V103: Component parent page check
  const pageIds = new Set((blueprint.pages || []).map(p => p.id));
  (blueprint.components || []).forEach(comp => {
    if (!pageIds.has(comp.parent_page)) {
      errors.push({
        code: "V103",
        msg: `Component '${comp.name || comp.id}' references missing parent_page '${comp.parent_page}'.`
      });
    }
  });

  // V104: Feature-to-backend check (Conditional warnings)
  const backendIds = new Set((blueprint.backend_modules || []).map(b => b.id));
  (blueprint.features || []).forEach(feat => {
    if (feat.requires_backend === true) {
      const hasBackend = Array.isArray(feat.depends_on) && feat.depends_on.some(depId => backendIds.has(depId));
      if (!hasBackend) {
        warnings.push({
          code: "V104",
          msg: `Feature '${feat.name || feat.id}' requires a backend but lacks a matching backend module.`
        });
      }
    }
  });

  // V105: Backend module to database table check (Conditional warnings)
  const dbEntities = blueprint.database_entities || [];
  const dbIds = new Set(dbEntities.map(d => d.id));
  (blueprint.backend_modules || []).forEach(back => {
    if (back.storage_type === 'database') {
      const hasDb = Array.isArray(back.depends_on) && back.depends_on.some(depId => {
        // Explicitly verify the dependency is a database entity in the blueprint
        return dbIds.has(depId);
      });
      if (!hasDb) {
        warnings.push({
          code: "V105",
          msg: `Backend module '${back.name || back.id}' has storage_type = 'database' but lacks a matching database entity.`
        });
      }
    }
  });

  // V106: Selection Matching Check
  const allBlueprintIds = new Set();
  allEntitiesList.forEach(ent => {
    if (ent.id) allBlueprintIds.add(ent.id);
  });
  if (blueprint.design_system) {
    if (blueprint.design_system.theme) allBlueprintIds.add(blueprint.design_system.theme);
    if (blueprint.design_system.typography) allBlueprintIds.add(blueprint.design_system.typography);
  }

  (blueprint.retrieval_metadata?.selected_entities || []).forEach(selectedId => {
    const isDesignSystemEntity = selectedId.includes('theme') || selectedId.includes('typography') || selectedId.includes('font');
    if (!allBlueprintIds.has(selectedId) && !isDesignSystemEntity) {
      errors.push({
        code: "V106",
        msg: `Selected entity '${selectedId}' is listed in retrieval metadata but missing from blueprint contents.`
      });
    }
  });

  // V107: Coverage Range Check
  const score = blueprint.coverage?.score;
  if (score !== undefined && (typeof score !== 'number' || score < 0 || score > 100)) {
    errors.push({
      code: "V107",
      msg: `Coverage score '${score}' is out of bounds (must be between 0 and 100).`
    });
  }

  // V108: Mode Consistency Check
  const hasPages = (blueprint.pages || []).length > 0;
  const hasComponents = (blueprint.components || []).length > 0;
  const hasBackend = (blueprint.backend_modules || []).length > 0;
  const hasDb = (blueprint.database_entities || []).length > 0;

  if (mode === 'component') {
    if (hasPages || hasBackend || hasDb) {
      warnings.push({ code: "V108", msg: "Component Mode blueprint contains structural web page, backend, or database metadata." });
    }
  } else if (mode === 'page') {
    if (hasBackend || hasDb) {
      warnings.push({ code: "V108", msg: "Page Mode blueprint contains backend or database metadata." });
    }
  } else if (mode === 'fullstack') {
    if (!hasPages && !hasComponents && !hasBackend && !hasDb) {
      warnings.push({ code: "V108", msg: "Fullstack Mode blueprint is completely empty of structural architecture." });
    }
  }

  // V109: Knowledge Completeness Check
  allEntitiesList.forEach(ent => {
    if (!ent.overview || typeof ent.overview !== 'string' || ent.overview.trim().length === 0) {
      warnings.push({
        code: "V109",
        msg: `Entity '${ent.name || ent.id}' is missing descriptive knowledge context (overview is empty).`
      });
    }
  });

  // V110: Common Domain Governance Check (Enforces ERROR in dev, WARNING + flag in production)
  let v110ViolationCount = 0;
  allEntitiesList.forEach(ent => {
    const kbType = ent.kb_type;
    const entityType = ent.entity_type || ent.default_entity_type;
    if (kbType === 'common' && !ALLOWED_COMMON_TYPES.has(entityType)) {
      v110ViolationCount++;
      const msg = `Governance Breach: Entity '${ent.name || ent.id}' categorized as 'common' has structural type '${entityType}'.`;
      if (isProduction) {
        warnings.push({
          code: "V110",
          msg,
          telemetry_flag: "governance_breach"
        });
      } else {
        errors.push({
          code: "V110",
          msg
        });
      }
    }
  });

  // V111: Mode Boundary Enforcement Check
  const allowedKbTypes = new Set();
  if (mode === 'component') {
    allowedKbTypes.add('component');
    allowedKbTypes.add('common');
  } else if (mode === 'page') {
    allowedKbTypes.add('spa');
    allowedKbTypes.add('component');
    allowedKbTypes.add('common');
  } else if (mode === 'fullstack') {
    allowedKbTypes.add('fullstack');
    allowedKbTypes.add('spa');
    allowedKbTypes.add('component');
    allowedKbTypes.add('common');
  } else {
    allowedKbTypes.add('common');
  }

  allEntitiesList.forEach(ent => {
    const kbType = ent.kb_type || ent.default_kb_type;
    if (kbType && !allowedKbTypes.has(kbType)) {
      errors.push({
        code: "V111",
        msg: `Context Isolation Breach: Mode '${mode}' does not permit entity '${ent.name || ent.id}' of kb_type '${kbType}'.`
      });
    }
  });

  // V112: Dependency ID Validity Check
  const validBlueprintIds = new Set();
  allEntitiesList.forEach(ent => {
    if (ent.id) validBlueprintIds.add(ent.id);
  });
  if (blueprint.design_system) {
    if (blueprint.design_system.theme) validBlueprintIds.add(blueprint.design_system.theme);
    if (blueprint.design_system.typography) validBlueprintIds.add(blueprint.design_system.typography);
  }

  let v112BreachCount = 0;
  allEntitiesList.forEach(ent => {
    if (Array.isArray(ent.depends_on)) {
      ent.depends_on.forEach(depId => {
        if (!validBlueprintIds.has(depId)) {
          v112BreachCount++;
          errors.push({
            code: "V112",
            msg: `Dependency Integrity Breach: Entity '${ent.name || ent.id}' depends on missing entity '${depId}'.`
          });
        }
      });
    }
  });

  // V113: Secure transactions module check (Conditional warnings)
  allEntitiesList.forEach(ent => {
    const nameLower = (ent.name || '').toLowerCase();
    const idLower = (ent.id || '').toLowerCase();
    if (nameLower.includes('checkout') || nameLower.includes('payment') || idLower.includes('checkout') || idLower.includes('payment')) {
      const hasCompliance = Array.isArray(ent.depends_on) && ent.depends_on.some(depId => 
        depId.toLowerCase().includes('compliance') || depId.toLowerCase().includes('security') || depId.toLowerCase().includes('pci')
      );
      if (!hasCompliance) {
        warnings.push({
          code: "V113",
          msg: `Transaction sensitive entity '${ent.name || ent.id}' should depend on a security/compliance standard helper.`
        });
      }
    }
  });

  // V114: Billing entities dependencies check (Conditional warnings)
  allEntitiesList.forEach(ent => {
    const nameLower = (ent.name || '').toLowerCase();
    const idLower = (ent.id || '').toLowerCase();
    const isBilling = nameLower.includes('billing') || idLower.includes('billing') || idLower.includes('stripe') || nameLower.includes('stripe');
    if (isBilling && ent.entity_type !== 'theme' && ent.entity_type !== 'typography') {
      const hasProvider = Array.isArray(ent.depends_on) && ent.depends_on.some(depId => 
        depId.toLowerCase().includes('provider') || depId.toLowerCase().includes('stripe') || depId.toLowerCase().includes('razorpay') || depId.toLowerCase().includes('paypal')
      );
      if (!hasProvider && !idLower.includes('provider') && !idLower.includes('stripe') && !idLower.includes('razorpay') && !idLower.includes('paypal')) {
        warnings.push({
          code: "V114",
          msg: `Billing entity '${ent.name || ent.id}' lacks connection to a designated payment provider.`
        });
      }
    }
  });

  // V115: Domain Boundary Drift Check (Conditional warnings)
  const activeDomain = blueprint.retrieval_metadata?.active_domain || 'saas';
  if (activeDomain === 'saas') {
    const totalCount = allEntitiesList.length;
    if (totalCount > 0) {
      let otherDomainCount = 0;
      allEntitiesList.forEach(ent => {
        const primaryDomain = ent.primary_domain || ent.metadata?.primary_domain || 'common';
        if (primaryDomain === 'ecommerce' || primaryDomain === 'analytics') {
          otherDomainCount++;
        }
      });
      const ratio = otherDomainCount / totalCount;
      if (ratio > 0.75) {
        warnings.push({
          code: "V115",
          msg: `Domain Boundary Drift detected: Blueprint active domain is 'saas', but ${(ratio * 100).toFixed(1)}% of nodes are Ecommerce/Analytics.`
        });
      }
    }
  }

  // V116: Domain Orphan Detection (Conditional warnings)
  allEntitiesList.forEach(ent => {
    const primaryDomain = ent.primary_domain || ent.metadata?.primary_domain || 'common';
    if (primaryDomain !== 'common') {
      const entityId = ent.id;
      let isConnected = false;
      
      // 1. Check depends_on
      if (Array.isArray(ent.depends_on) && ent.depends_on.length > 0) {
        isConnected = true;
      }
      
      // 2. Check if other entities depend on this entity
      if (!isConnected) {
        isConnected = allEntitiesList.some(other => 
          other.id !== entityId && Array.isArray(other.depends_on) && other.depends_on.includes(entityId)
        );
      }
      
      // 3. Check component-to-page references
      if (!isConnected) {
        if (ent.entity_type === 'component' && ent.parent_page) {
          isConnected = true;
        } else if (ent.entity_type === 'page') {
          isConnected = allEntitiesList.some(other => other.entity_type === 'component' && other.parent_page === entityId);
        }
      }

      if (!isConnected) {
        warnings.push({
          code: "V116",
          msg: `Domain Orphan: Entity '${ent.name || ent.id}' of domain '${primaryDomain}' is disconnected from the blueprint graph.`
        });
      }
    }
  });

  // ==========================================
  // SUB-SCORING BREAKDOWNS (v2 Specification)
  // ==========================================
  const hasV101Error = blueprint.blueprint_version !== 1;
  const hasV102Error = !blueprint.design_system || !blueprint.design_system.theme || !blueprint.design_system.typography;
  const v103ErrorCount = (blueprint.components || []).filter(comp => !pageIds.has(comp.parent_page)).length;
  const hasV108Warning = warnings.some(w => w.code === "V108");
  const v109WarningCount = allEntitiesList.filter(ent => !ent.overview || typeof ent.overview !== 'string' || ent.overview.trim().length === 0).length;
  const v111BreachCount = allEntitiesList.filter(ent => {
    const kbType = ent.kb_type || ent.default_kb_type;
    return kbType && !allowedKbTypes.has(kbType);
  }).length;
  const hasV107Error = score !== undefined && (typeof score !== 'number' || score < 0 || score > 100);

  // 1. Structural Score: bounds checks on layouts, component linkages, modes, and dependencies
  const structural_score = Math.max(0, 100 - (hasV101Error ? 30 : 0) - (v103ErrorCount * 40) - (hasV108Warning ? 15 : 0) - (v112BreachCount * 20));

  // 2. Knowledge Score: checks presence of explanatory details
  const knowledge_score = Math.max(0, 100 - (v109WarningCount * 10));

  // 3. Governance Score: checks theme styling and category boundaries
  const governance_score = Math.max(0, 100 - (hasV102Error ? 30 : 0) - (v110ViolationCount * 40) - (v111BreachCount * 30));

  // 4. Coverage Score: reflects actual relationship resolution against graph expectations
  let coverage_score = 100;
  if (score !== undefined && typeof score === 'number') {
    coverage_score = score;
  }
  if (hasV107Error) {
    coverage_score = 0;
  }

  // 5. Architectural Surface Score (conceptual size metrics)
  const featureCount = (blueprint.features || []).length;
  const pageCount = (blueprint.pages || []).length;
  const componentCount = (blueprint.components || []).length;
  const backendCount = (blueprint.backend_modules || []).length;
  const dbCount = (blueprint.database_entities || []).length;
  const architectural_surface_score = (featureCount * 8) + (pageCount * 12) + (componentCount * 5) + (backendCount * 10) + (dbCount * 8);

  // 6. Completion Rate against dynamic expected contexts
  const expected = blueprint.expected_context || { features: 0, pages: 0, components: 0, backend_modules: 0, database_entities: 0 };
  const expectedTotal = (expected.features || 0) + (expected.pages || 0) + (expected.components || 0) + (expected.backend_modules || 0) + (expected.database_entities || 0);
  const resolvedTotal = featureCount + pageCount + componentCount + backendCount + dbCount;
  const blueprint_completion_rate = expectedTotal > 0 ? Math.min(100.00, parseFloat(((resolvedTotal / expectedTotal) * 100).toFixed(2))) : 100.00;

  // Calculate overall validation score (original index)
  const validationScore = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validationScore,
    validation_score: validationScore,
    structural_score,
    knowledge_score,
    governance_score,
    coverage_score,
    blueprint_complexity_score: architectural_surface_score,
    complexity_score: architectural_surface_score,
    architectural_surface_score,
    blueprint_completion_rate
  };
}
