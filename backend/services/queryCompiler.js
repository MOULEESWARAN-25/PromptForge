/**
 * Deterministic Query Compiler
 * Programmatically constructs a structured search and context blueprint from UI selections.
 */
export function compileDeterministicQuery({
  mode,
  projectName = 'my-awesome-project',
  projectDescription = 'A premium web application',
  appCategory,
  customCategory,
  selectedFeatures = [],
  pageType,
  selectedComponents = [],
  componentType,
  customComponentType,
  selectedTheme = 'Sleek Dark Glassmorphic',
  selectedTypography = 'Inter',
  projectIntegration = 'new',
  framework = 'Tailwind CSS',
  ideResponseContext = '',
  additionalFeatures = []
}) {
  let targetEntity = "";
  let subEntities = [];
  
  if (mode === "application") {
    targetEntity = appCategory === "Custom" ? customCategory : appCategory;
    subEntities = selectedFeatures;
  } else if (mode === "page") {
    targetEntity = pageType;
    subEntities = selectedComponents;
  } else if (mode === "component") {
    targetEntity = componentType === "Custom Component" ? customComponentType : componentType;
  }

  const sections = [];
  sections.push(`### DETERMINISTIC SYSTEM BLUEPRINT`);
  sections.push(`- **Mode**: ${mode.toUpperCase()}`);
  sections.push(`- **Target Entity**: ${targetEntity}`);
  if (subEntities.length > 0) {
    sections.push(`- **Selected Sub-Entities**: ${subEntities.join(', ')}`);
  }
  
  sections.push(`\n### PROJECT ARCHITECTURE SETUP`);
  sections.push(`- **Project Name**: ${projectName}`);
  sections.push(`- **Project Description**: ${projectDescription}`);
  sections.push(`- **Setup Type**: ${projectIntegration === 'existing' ? 'Existing Project Integration' : 'Standalone Project Boilerplate'}`);
  sections.push(`- **Target Framework/Library**: ${framework}`);
  if (additionalFeatures.length > 0) {
    sections.push(`- **Ecosystem Additions**: ${additionalFeatures.join(', ')}`);
  }
  if (projectIntegration === 'existing' && ideResponseContext) {
    sections.push(`- **Codebase Context / Paths**: ${ideResponseContext}`);
  }

  sections.push(`\n### DESIGN SYSTEM & DESIGN TOKENS`);
  sections.push(`- **Aesthetic Style Theme**: ${selectedTheme}`);
  sections.push(`- **Typography pairing**: ${selectedTypography}`);

  return sections.join('\n');
}
