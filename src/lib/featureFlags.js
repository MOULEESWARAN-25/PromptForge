/**
 * PromptForge — Feature Flag Engine
 * Allows dynamic control of advanced SaaS options, rollouts, and kill-switches.
 */

const DEFAULT_FLAGS = {
  commandPalette: true,
  aiTransparency: true,
  premiumUpsell: true,
  feedbackWidget: true,
  templateLibrary: true,
  localAutosave: true,
  errorMonitoring: true,
};

/**
 * Get active feature flags.
 * Merges default configurations with any developer overrides in localStorage.
 */
export function getFeatureFlags() {
  if (typeof window === 'undefined') return DEFAULT_FLAGS;
  try {
    const overrides = JSON.parse(localStorage.getItem('pf_feature_flags') || '{}');
    return { ...DEFAULT_FLAGS, ...overrides };
  } catch {
    return DEFAULT_FLAGS;
  }
}

/**
 * Check if a specific feature is enabled.
 * @param {string} flagName
 */
export function isFeatureEnabled(flagName) {
  const flags = getFeatureFlags();
  return !!flags[flagName];
}

/**
 * Set an override for a feature flag.
 * @param {string} flagName
 * @param {boolean} value
 */
export function setFeatureFlagOverride(flagName, value) {
  if (typeof window === 'undefined') return;
  try {
    const overrides = JSON.parse(localStorage.getItem('pf_feature_flags') || '{}');
    overrides[flagName] = value;
    localStorage.setItem('pf_feature_flags', JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to save feature flag override', e);
  }
}
