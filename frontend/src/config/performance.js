/**
 * Performance Budgets & Lighthouse Targets
 * ─────────────────────────────────────────────────────────────────
 * Defines all performance measurement targets used in CI validation
 * and as reference limits during development.
 *
 * These are NOT enforced at runtime — they are consumed by CI pipeline
 * scripts and Lighthouse configuration.
 */

export const PERFORMANCE_BUDGETS = {
  /**
   * Lighthouse score minimums (0–100 scale).
   */
  lighthouse: {
    accessibility: 95,
    performance:   90,
    seo:           95,
    bestPractices: 90,
  },

  /**
   * Core Web Vitals targets.
   */
  webVitals: {
    /** First Contentful Paint (ms) */
    FCP: 1500,
    /** Largest Contentful Paint (ms) */
    LCP: 2500,
    /** Cumulative Layout Shift (unitless) */
    CLS: 0.1,
    /** Interaction to Next Paint (ms) */
    INP: 100,
  },

  /**
   * Backend API response time budget (ms).
   */
  apiResponseTime: 500,

  /**
   * JS bundle size budgets (gzipped kilobytes).
   */
  bundles: {
    /** Initial JS bundle loaded on first page visit */
    initialKB: 250,
    /** Maximum size of any single route bundle */
    routeKB:   50,
    /** Maximum size of any single lazy-loaded chunk */
    lazyChunkKB: 75,
  },

  /**
   * Asset size budgets (kilobytes, uncompressed unless noted).
   */
  assets: {
    /** Maximum single image size (WebP) */
    imageKB: 200,
    /** Maximum total font payload across all families */
    totalFontKB: 100,
  },
};
