/**
 * promptCompiler.js
 * 
 * Compiles a validated JSON Architecture Blueprint conforming to blueprint_v1.md 
 * into clear, structured markdown system blocks for prompt enhancement.
 */

/**
 * Three-stage directive compression and deduplication:
 * 1. Exact duplicate removal (Set)
 * 2. Case-insensitive exact normalization
 * 3. Substring containment pruning (keeping the longest/most dominant directive)
 */
export function deduplicateAndCompressDirectives(arr) {
  if (!Array.isArray(arr)) return [];
  
  // Clean and trim
  const cleaned = arr.map(s => String(s).trim()).filter(Boolean);
  
  // Remove exact duplicates
  const unique = Array.from(new Set(cleaned));
  
  // Sort by length descending (longest first)
  unique.sort((a, b) => b.length - a.length);
  
  const retained = [];
  
  for (const current of unique) {
    const lowerCurrent = current.toLowerCase();
    
    // Check if the current (shorter) string is a case-insensitive substring
    // of any already retained (longer) string
    const isContained = retained.some(existing => 
      existing.toLowerCase().includes(lowerCurrent)
    );
    
    if (!isContained) {
      retained.push(current);
    }
  }
  
  // Return sorted alphabetically for deterministic output
  return retained.sort();
}

/**
 * Translates a JSON blueprint into deterministic markdown blocks.
 * 
 * @param {object} blueprint - The blueprint JSON object to compile
 * @returns {string} Compiled markdown blueprint prompt block
 * @throws {Error} If blueprint version is invalid
 */
export function compileBlueprintToPrompt(blueprint) {
  if (!blueprint) {
    throw new Error("[compiler] Blueprint cannot be null or empty.");
  }

  if (blueprint.blueprint_version !== 1) {
    throw new Error(`[compiler] Blueprint version '${blueprint.blueprint_version}' is invalid. Compiler strictly expects version 1.`);
  }

  const sections = [];

  // 1. Header Block
  sections.push("================================================================");
  sections.push("🛡️ DETERMINISTIC SYSTEM ARCHITECTURE BLUEPRINT");
  sections.push("================================================================");
  sections.push(`- **Active Architectural Mode**: ${blueprint.mode.toUpperCase()}`);
  sections.push(`- **Design System Theme**: ${blueprint.design_system?.theme || 'Sleek Dark Glassmorphic'}`);
  sections.push(`- **Design System Typography**: ${blueprint.design_system?.typography || 'Inter'}`);
  sections.push(`- **Setup Target**: ${blueprint.constraints?.standalone_project ? 'Standalone Boilerplate Layout' : 'Existing Codebase Integration'}`);
  sections.push(`- **Knowledge Retrieval Score**: ${blueprint.coverage?.score ?? 100}%`);
  sections.push("");

  // Accumulate global prompt engineering directives (raw arrays for deduplication)
  const allPromptPatternsRaw = new Map(); // name -> array of guidelines
  const allReasoningRaw = [];
  const allConstraintsRaw = [];
  const allChecksRaw = [];
  const allFailurePatternsRaw = [];
  const allImplementationNotesRaw = [];
  const allPitfallsRaw = [];

  function accumulate(node) {
    if (!node) return;
    if (Array.isArray(node.prompt_patterns)) {
      node.prompt_patterns.forEach(pat => {
        if (!pat || !pat.name) return;
        if (!allPromptPatternsRaw.has(pat.name)) {
          allPromptPatternsRaw.set(pat.name, []);
        }
        if (Array.isArray(pat.guidelines)) {
          pat.guidelines.forEach(g => allPromptPatternsRaw.get(pat.name).push(g));
        }
      });
    }
    if (Array.isArray(node.reasoning_patterns)) {
      node.reasoning_patterns.forEach(r => allReasoningRaw.push(r));
    }
    if (Array.isArray(node.generation_constraints)) {
      node.generation_constraints.forEach(c => allConstraintsRaw.push(c));
    }
    if (Array.isArray(node.quality_checks)) {
      node.quality_checks.forEach(q => allChecksRaw.push(q));
    }
    if (Array.isArray(node.failure_patterns)) {
      node.failure_patterns.forEach(f => allFailurePatternsRaw.push(f));
    }
    if (Array.isArray(node.implementation_notes)) {
      node.implementation_notes.forEach(n => allImplementationNotesRaw.push(n));
    }
    if (Array.isArray(node.pitfalls)) {
      node.pitfalls.forEach(p => allPitfallsRaw.push(p));
    }
  }

  // Accumulate from all layers:
  if (blueprint.application) accumulate(blueprint.application);
  if (blueprint.features) blueprint.features.forEach(accumulate);
  if (blueprint.pages) blueprint.pages.forEach(accumulate);
  if (blueprint.components) blueprint.components.forEach(accumulate);
  if (blueprint.backend_modules) blueprint.backend_modules.forEach(accumulate);
  if (blueprint.database_entities) blueprint.database_entities.forEach(accumulate);

  // Compress and deduplicate the accumulated arrays
  const allPromptPatterns = new Map();
  for (const [name, guidelines] of allPromptPatternsRaw.entries()) {
    allPromptPatterns.set(name, deduplicateAndCompressDirectives(guidelines));
  }
  const allReasoning = deduplicateAndCompressDirectives(allReasoningRaw);
  const allConstraints = deduplicateAndCompressDirectives(allConstraintsRaw);
  const allChecks = deduplicateAndCompressDirectives(allChecksRaw);
  const allFailurePatterns = deduplicateAndCompressDirectives(allFailurePatternsRaw);
  const allImplementationNotes = deduplicateAndCompressDirectives(allImplementationNotesRaw);
  const allPitfalls = deduplicateAndCompressDirectives(allPitfallsRaw);

  // Helper to append prompt intelligence fields for local rendering
  function renderLocalIntelligence(node, targetSections) {
    // Disabled in Phase IV-A for prompt compression and directive deduplication.
    // All prompt intelligence directives (prompt_patterns, reasoning, constraints, checks, failures)
    // are consolidated and deduplicated globally in the "## Global Prompt Engineering Directives" section.
  }

  const truncate = (s, len = 95) => {
    if (typeof s !== 'string') return '';
    const trimmed = s.trim();
    return trimmed.length > len ? trimmed.slice(0, len).trim() + '...' : trimmed;
  };

  // 1.5 Global Prompt Engineering Directives Section
  if (
    allPromptPatterns.size > 0 || 
    allReasoning.length > 0 || 
    allConstraints.length > 0 || 
    allChecks.length > 0 || 
    allFailurePatterns.length > 0 ||
    allImplementationNotes.length > 0 ||
    allPitfalls.length > 0
  ) {
    sections.push("## Global Prompt Engineering Directives");
    sections.push("These accumulated directives guide how the model must reason, validate, and structure code outputs.");
    sections.push("");

    if (allPromptPatterns.size > 0) {
      sections.push("### Prompts & Naming Patterns");
      for (const [name, guidelines] of allPromptPatterns.entries()) {
        if (guidelines.length > 0) {
          sections.push(`- **Pattern [${name}]**:`);
          guidelines.forEach(g => sections.push(`  - ${truncate(g, 95)}`));
        }
      }
      sections.push("");
    }

    if (allReasoning.length > 0) {
      sections.push("### Reasoning Guidelines");
      allReasoning.forEach(r => sections.push(`- 🤔 ${truncate(r, 95)}`));
      sections.push("");
    }

    if (allConstraints.length > 0) {
      sections.push("### Strict Generation Constraints");
      allConstraints.forEach(c => sections.push(`- 🛑 ${truncate(c, 95)}`));
      sections.push("");
    }

    if (allChecks.length > 0) {
      sections.push("### Output Quality Verification Checks");
      allChecks.forEach(q => sections.push(`- ✅ ${truncate(q, 95)}`));
      sections.push("");
    }

    if (allFailurePatterns.length > 0) {
      sections.push("### Failure Patterns & Mistakes to Avoid");
      allFailurePatterns.forEach(f => sections.push(`- ⚠️  ${truncate(f, 95)}`));
      sections.push("");
    }

    if (allImplementationNotes.length > 0) {
      sections.push("### General Implementation Guidelines");
      allImplementationNotes.forEach(n => sections.push(`  - ${truncate(n, 95)}`));
      sections.push("");
    }

    if (allPitfalls.length > 0) {
      sections.push("### Specific Architectural Pitfalls");
      allPitfalls.forEach(p => sections.push(`  - ⚠️ ${truncate(p, 95)}`));
      sections.push("");
    }
  }

  // 2. Application Layer
  if (blueprint.application) {
    sections.push("## 1. Application Profile");
    sections.push(`- **ID**: ${blueprint.application.id}`);
    sections.push(`- **Name**: ${blueprint.application.name}`);
    sections.push(`- **Functional Description**: ${blueprint.application.overview}`);
    if (blueprint.application.depends_on && blueprint.application.depends_on.length > 0) {
      sections.push(`- **Depends On**: ${blueprint.application.depends_on.join(', ')}`);
    }
    renderLocalIntelligence(blueprint.application, sections);
    sections.push('');
  }

  // 3. Features
  if (blueprint.features && blueprint.features.length > 0) {
    sections.push("## 2. Target Features Specifications");
    blueprint.features.forEach((feat, index) => {
      sections.push(`### [Feature ${index + 1}] ${feat.name} (${feat.id})`);
      sections.push(`- **Category Domain**: ${feat.category}`);
      sections.push(`- **Requires Backend Module**: ${feat.requires_backend ? 'Yes' : 'No'}`);
      sections.push(`- **Requirements/Rationale**: ${feat.overview}`);
      if (feat.depends_on && feat.depends_on.length > 0) {
        sections.push(`- **Depends On**: ${feat.depends_on.join(', ')}`);
      }
      renderLocalIntelligence(feat, sections);
      sections.push('');
    });
  }

  // 4. Web Pages & Layout Structure
  if (blueprint.pages && blueprint.pages.length > 0) {
    sections.push("## 3. Web Pages & Layout Structure");
    blueprint.pages.forEach((page, index) => {
      sections.push(`### [Page ${index + 1}] ${page.name} (${page.id})`);
      sections.push(`- **Layout Pattern**: ${page.layout}`);
      sections.push(`- **Overview & UX Flow**: ${page.overview}`);
      if (page.depends_on && page.depends_on.length > 0) {
        sections.push(`- **Depends On**: ${page.depends_on.join(', ')}`);
      }
      renderLocalIntelligence(page, sections);
      sections.push('');
    });
  }

  // 5. UI Components
  if (blueprint.components && blueprint.components.length > 0) {
    sections.push("## 4. UI Components Catalog");
    blueprint.components.forEach((comp, index) => {
      sections.push(`### [Component ${index + 1}] ${comp.name} (${comp.id})`);
      sections.push(`- **Parent Page Attachment**: ${comp.parent_page}`);
      sections.push(`- **Functional Requirements**: ${comp.overview}`);
      if (comp.depends_on && comp.depends_on.length > 0) {
        sections.push(`- **Depends On**: ${comp.depends_on.join(', ')}`);
      }
      renderLocalIntelligence(comp, sections);
      sections.push('');
    });
  }

  // 6. Backend Modules / Endpoints
  if (blueprint.backend_modules && blueprint.backend_modules.length > 0) {
    sections.push("## 5. Backend REST Services & APIs");
    blueprint.backend_modules.forEach((bm, index) => {
      sections.push(`### [Backend API ${index + 1}] ${bm.name} (${bm.id})`);
      sections.push(`- **REST Endpoint**: ${bm.endpoint}`);
      sections.push(`- **Storage Engine Adapter**: ${bm.storage_type}`);
      sections.push(`- **Implementation Guideline**: ${bm.overview}`);
      if (bm.depends_on && bm.depends_on.length > 0) {
        sections.push(`- **Depends On**: ${bm.depends_on.join(', ')}`);
      }
      renderLocalIntelligence(bm, sections);
      sections.push('');
    });
  }

  // 7. Database Entities
  if (blueprint.database_entities && blueprint.database_entities.length > 0) {
    sections.push("## 6. Database Relational Tables");
    blueprint.database_entities.forEach((db, index) => {
      sections.push(`### [DB Entity ${index + 1}] ${db.name} (${db.id})`);
      sections.push(`- **Schema Definitions & Fields**: ${db.overview}`);
      if (db.depends_on && db.depends_on.length > 0) {
        sections.push(`- **Depends On**: ${db.depends_on.join(', ')}`);
      }
      renderLocalIntelligence(db, sections);
      sections.push('');
    });
  }

  sections.push("================================================================");
  sections.push("END OF BLUEPRINT SPECIFICATION CONSTRAINTS");
  sections.push("================================================================");

  return sections.join("\n");
}
