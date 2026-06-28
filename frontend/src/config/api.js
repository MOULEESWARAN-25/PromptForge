/**
 * API Base URL Configuration
 * ─────────────────────────────────────────────────────────────────
 * All client API routes are versioned under /api/v1/.
 *
 * ADR Reference: docs/adr/0005-api-versioning.md
 */

const getApiBaseUrl = () => {
  // Explicit environment variable always takes priority
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // In the browser, map hostname to backend environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname === 'veyntra.vercel.app' || hostname === 'www.veyntra.vercel.app') {
      return 'https://veyntra-backend.vercel.app';
    }
  }

  // Local development fallback
  return 'http://localhost:8000';
};

/**
 * Base URL for all API calls.
 * All routes must be prefixed with /api/v1/.
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * API version prefix.
 * Appended to API_BASE_URL for all versioned routes.
 * To upgrade to v2, update this constant and create new route handlers.
 */
export const API_VERSION = '/api/v1';

/**
 * Helper to build a versioned API path.
 *
 * @param {string} path - Route path (e.g. '/prompts', '/vocabulary/search')
 * @returns {string} Full URL (e.g. 'http://localhost:8000/api/v1/prompts')
 *
 * @example
 * const url = apiUrl('/prompts'); // → http://localhost:8000/api/v1/prompts
 */
export const apiUrl = (path) => `${API_BASE_URL}${API_VERSION}${path}`;

if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
  if (typeof window !== 'undefined') {
    console.warn(
      `⚠️ NEXT_PUBLIC_API_URL not configured. API calls routed to: ${API_BASE_URL}`,
    );
  }
}
