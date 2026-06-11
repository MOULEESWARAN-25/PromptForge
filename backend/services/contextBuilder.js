/**
 * Context Builder Service
 * Synthesizes retrieved Knowledge Graph entities into a structured markdown context payload.
 */
export function buildPromptContext(entities = []) {
  if (entities.length === 0) {
    return "No database design guides or technical terminology were retrieved for this query.";
  }

  const sections = {
    WIZARD_STEPS: [],
    APPLICATION: [],
    FEATURES: [],
    PAGES: [],
    COMPONENTS: [],
    BACKEND: [],
    DATABASE: [],
    SECURITY: [],
    SCALABILITY: [],
    THEME: [],
    TYPOGRAPHY: [],
    PROMPT_FRAGMENTS: {
      architecture: [],
      ui: [],
      backend: [],
      database: [],
      security: [],
      accessibility: [],
      performance: []
    }
  };

  entities.forEach(ent => {
    // 1. Group entities by category
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

    // Handle Wizard Step specifics
    if (ent.entity_type === 'wizard_step') {
      const stepDetails = [];
      stepDetails.push(`#### Wizard Step: ${ent.name}`);
      if (ent.purpose) stepDetails.push(`- **Purpose**: ${ent.purpose}`);
      if (ent.why_exists) stepDetails.push(`- **Why Exists**: ${ent.why_exists}`);
      if (ent.common_mistakes && ent.common_mistakes.length > 0) stepDetails.push(`- **Common Mistakes**: ${ent.common_mistakes.join(', ')}`);
      if (ent.impact_on_generation && ent.impact_on_generation.length > 0) stepDetails.push(`- **Impact on Prompt Generation**: ${ent.impact_on_generation.join(', ')}`);
      sections.WIZARD_STEPS.push(stepDetails.join('\n'));
    } else if (ent.entity_type === 'application') {
      sections.APPLICATION.push(details.join('\n'));
    } else if (ent.entity_type === 'feature') {
      sections.FEATURES.push(details.join('\n'));
    } else if (ent.entity_type === 'page') {
      sections.PAGES.push(details.join('\n'));
    } else if (ent.entity_type === 'component') {
      sections.COMPONENTS.push(details.join('\n'));
    } else if (ent.entity_type === 'backend_module') {
      sections.BACKEND.push(details.join('\n'));
    } else if (ent.entity_type === 'database_entity') {
      sections.DATABASE.push(details.join('\n'));
    } else if (ent.entity_type === 'theme') {
      sections.THEME.push(details.join('\n'));
    } else if (ent.entity_type === 'typography') {
      sections.TYPOGRAPHY.push(details.join('\n'));
    }

    // 2. Extract and categorize prompt fragments
    if (ent.prompt_fragments) {
      const frags = ent.prompt_fragments;
      if (Array.isArray(frags.architecture)) frags.architecture.forEach(f => sections.PROMPT_FRAGMENTS.architecture.push(`- [${ent.name}] ${f}`));
      if (Array.isArray(frags.ui)) frags.ui.forEach(f => sections.PROMPT_FRAGMENTS.ui.push(`- [${ent.name}] ${f}`));
      if (Array.isArray(frags.backend)) frags.backend.forEach(f => sections.PROMPT_FRAGMENTS.backend.push(`- [${ent.name}] ${f}`));
      if (Array.isArray(frags.database)) frags.database.forEach(f => sections.PROMPT_FRAGMENTS.database.push(`- [${ent.name}] ${f}`));
      if (Array.isArray(frags.security)) frags.security.forEach(f => sections.PROMPT_FRAGMENTS.security.push(`- [${ent.name}] ${f}`));
      if (Array.isArray(frags.accessibility)) frags.accessibility.forEach(f => sections.PROMPT_FRAGMENTS.accessibility.push(`- [${ent.name}] ${f}`));
      if (Array.isArray(frags.performance)) frags.performance.forEach(f => sections.PROMPT_FRAGMENTS.performance.push(`- [${ent.name}] ${f}`));
    }
  });

  // Compile final markdown layout
  const markdown = [];
  markdown.push(`================================================================`);
  markdown.push(`RETRIEVED KNOWLEDGE GRAPH CONTEXT`);
  markdown.push(`================================================================\n`);

  if (sections.WIZARD_STEPS.length > 0) {
    markdown.push(`### 1. WIZARD STEPS META-CONTEXT\n${sections.WIZARD_STEPS.join('\n\n')}\n`);
  }
  if (sections.APPLICATION.length > 0) {
    markdown.push(`### 2. APPLICATION TARGET SCHEMA\n${sections.APPLICATION.join('\n\n')}\n`);
  }
  if (sections.FEATURES.length > 0) {
    markdown.push(`### 3. ACTIVE FEATURES SCHEMA\n${sections.FEATURES.join('\n\n')}\n`);
  }
  if (sections.PAGES.length > 0) {
    markdown.push(`### 4. PAGE WIREFRAME GUIDELINES\n${sections.PAGES.join('\n\n')}\n`);
  }
  if (sections.COMPONENTS.length > 0) {
    markdown.push(`### 5. INTERACTIVE COMPONENTS SPECIFICATION\n${sections.COMPONENTS.join('\n\n')}\n`);
  }
  if (sections.THEME.length > 0) {
    markdown.push(`### 6. VISUAL STYLE STYLE-GUIDE\n${sections.THEME.join('\n\n')}\n`);
  }
  if (sections.TYPOGRAPHY.length > 0) {
    markdown.push(`### 7. TYPOGRAPHY SYSTEM RULES\n${sections.TYPOGRAPHY.join('\n\n')}\n`);
  }

  // Inject categorized prompt fragments
  markdown.push(`================================================================`);
  markdown.push(`PROMPT CONSTRUCT BLUEPRINT FRAGMENTS`);
  markdown.push(`================================================================`);
  
  const pf = sections.PROMPT_FRAGMENTS;
  if (pf.architecture.length > 0) markdown.push(`\n#### ARCHITECTURE & DIRECTORY RULES:\n${pf.architecture.join('\n')}`);
  if (pf.ui.length > 0) markdown.push(`\n#### USER INTERFACE & CSS variables:\n${pf.ui.join('\n')}`);
  if (pf.backend.length > 0) markdown.push(`\n#### BACKEND API & CONTROLLER SCHEMAS:\n${pf.backend.join('\n')}`);
  if (pf.database.length > 0) markdown.push(`\n#### DATABASE SCHEMA & MOCK DATA ENTRIES:\n${pf.database.join('\n')}`);
  if (pf.security.length > 0) markdown.push(`\n#### SECURITY & ACCESS CONTROL DIRECTIVES:\n${pf.security.join('\n')}`);
  if (pf.accessibility.length > 0) markdown.push(`\n#### WAI-ARIA ACCESSIBILITY INSTRUCTION BLOCKS:\n${pf.accessibility.join('\n')}`);
  if (pf.performance.length > 0) markdown.push(`\n#### PERFORMANCE & CACHING STRATEGIES:\n${pf.performance.join('\n')}`);

  return markdown.join('\n');
}
