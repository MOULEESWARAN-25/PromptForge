import motions from '@/data/knowledge/motions.json';

/**
 * PromptForge Phase 2 - Motion Physics Dynamics Retriever Service
 * Resolves developer-friendly descriptors into stiffness, damping, mass coordinates,
 * and Framer Motion spring curve configurations.
 */
export async function retrieveMotionPhysics(promptQuery) {
  console.log(`[Motion Retriever] Analyzing prompt text for mathematical spring animation parameters...`);
  
  const normalizedQuery = (promptQuery || '').toLowerCase();
  
  // Dynamic scanning check
  const matchedMotion = motions.find(m => 
    normalizedQuery.includes(m.motionPreset.toLowerCase()) ||
    m.motionPreset.split(' ').some(word => normalizedQuery.includes(word))
  );

  // Return the resolved spring physics, or fall back to baseline spring
  const finalMotion = matchedMotion || motions[0];

  return {
    motionPreset: finalMotion.motionPreset,
    framerMotionCurves: finalMotion.framerMotionCurves,
    hoverScaleSpecs: finalMotion.hoverScaleSpecs
  };
}
