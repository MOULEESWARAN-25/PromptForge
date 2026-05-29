/**
 * PromptForge — Lightweight Analytics
 * Privacy-first, localStorage-based event tracking.
 * Forwards to cloud analytics if NEXT_PUBLIC_ANALYTICS_KEY is set.
 */

const MAX_EVENTS = 500;
const STORAGE_KEY = 'pf_analytics';

/**
 * Track a product analytics event.
 * @param {string} event - Event name (e.g. 'forge_submitted')
 * @param {object} properties - Event metadata
 */
export function track(event, properties = {}) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = {
      event,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        ts: Date.now(),
      },
    };

    // Keep last MAX_EVENTS only
    const updated = [...stored, entry].slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Forward to cloud if key is configured
    if (
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_ANALYTICS_KEY
    ) {
      // PostHog / Mixpanel forwarding placeholder
      // posthog.capture(event, properties);
    }

    // Dev logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }
  } catch (e) {
    // Never throw — analytics should never break the app
  }
}

/**
 * Get all stored analytics events (for debugging / admin view).
 */
export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear analytics event log.
 */
export function clearEvents() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Predefined event constants ────────────────────────────────
export const EVENTS = {
  // Auth
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  DEMO_ACTIVATED: 'demo_activated',

  // Onboarding
  DASHBOARD_VIEWED: 'dashboard_viewed',
  FIRST_FORGE_STARTED: 'first_forge_started',

  // Forge Wizard
  FORGE_STARTED: 'forge_started',
  FORGE_CATEGORY_SELECTED: 'forge_category_selected',
  FORGE_THEME_SELECTED: 'forge_theme_selected',
  FORGE_SUBMITTED: 'forge_submitted',
  FORGE_DRAFT_RECOVERED: 'forge_draft_recovered',
  FORGE_DRAFT_DISCARDED: 'forge_draft_discarded',

  // Prompt Results
  PROMPT_GENERATED: 'prompt_generated',
  PROMPT_COPIED: 'prompt_copied',
  PROMPT_EXPORTED_MD: 'prompt_exported_md',
  PROMPT_EXPORTED_TXT: 'prompt_exported_txt',
  PROMPT_SHARED: 'prompt_shared',
  PROMPT_REGENERATED: 'prompt_regenerated',
  PROMPT_REFINED: 'prompt_refined',
  PROMPT_FAVORITED: 'prompt_favorited',

  // Navigation
  COMMAND_PALETTE_OPENED: 'command_palette_opened',
  COMMAND_PALETTE_NAVIGATED: 'command_palette_navigated',

  // Conversion
  UPGRADE_CLICKED: 'upgrade_clicked',
  SETTINGS_OPENED: 'settings_opened',

  // Errors
  FORGE_ERROR: 'forge_error',
  AUTH_ERROR: 'auth_error',
};
