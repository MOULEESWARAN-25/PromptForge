/**
 * PromptForge — A/B Testing & Experimentation Framework
 * Enables assigning users to variants, persisting choices, and tracking conversions.
 */
import { track } from './analytics';

/**
 * Assign or retrieve a variant for an experiment.
 * @param {string} experimentName
 * @param {Object} variantsMap - e.g. { A: "Start Building Free", B: "Generate Your First Prompt" }
 */
export function getExperimentVariant(experimentName, variantsMap) {
  if (typeof window === 'undefined') return Object.keys(variantsMap)[0];
  try {
    const key = `pf_exp_${experimentName}`;
    let assigned = localStorage.getItem(key);

    if (!assigned || !variantsMap[assigned]) {
      const keys = Object.keys(variantsMap);
      assigned = keys[Math.floor(Math.random() * keys.length)];
      localStorage.setItem(key, assigned);
      track('experiment_assigned', { experimentName, variant: assigned });
    }

    return assigned;
  } catch {
    return Object.keys(variantsMap)[0];
  }
}

/**
 * Track a conversion event for a given experiment.
 * @param {string} experimentName
 */
export function trackExperimentConversion(experimentName) {
  if (typeof window === 'undefined') return;
  try {
    const key = `pf_exp_${experimentName}`;
    const assigned = localStorage.getItem(key);
    if (assigned) {
      track('experiment_converted', { experimentName, variant: assigned });
    }
  } catch {}
}
