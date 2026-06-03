import components from '@/data/knowledge/components.json';

/**
 * Veyntra Phase 2 - Component Specification Retriever Service
 * Resolves high-level visual widgets into keyboard accessibility checklists,
 * standard ARIA parameters, and responsive flex grid layouts.
 */
export async function retrieveComponentSpecs(componentName) {
  console.log(`[Component Retriever] Querying structural parameters for widget: "${componentName}"`);
  
  if (!componentName) {
    return null;
  }

  // Find component matching selected archetype (case-insensitive substring)
  const compSpec = components.find(
    c => c.componentName.toLowerCase().includes(componentName.toLowerCase()) ||
         componentName.toLowerCase().includes(c.componentName.toLowerCase())
  );

  if (!compSpec) {
    return {
      componentName,
      accessibilityGuidelines: [
        "Ensure standard keyboard navigations and visual hover triggers operate correctly."
      ],
      responsiveGridPresets: "Fluid layouts matching parent container grids."
    };
  }

  return {
    componentName: compSpec.componentName,
    accessibilityGuidelines: compSpec.accessibilityGuidelines,
    responsiveGridPresets: compSpec.responsiveGridPresets
  };
}
