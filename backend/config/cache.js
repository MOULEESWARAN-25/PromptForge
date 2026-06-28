/**
 * Caching Configurations for Backend Services
 * ─────────────────────────────────────────────────────────────────
 * Defines the similarity match threshold and individual endpoint TTL policies (in seconds).
 */

export const CACHE_CONFIG = {
  /**
   * The threshold for hybrid semantic cache hits (vector similarity + keywords).
   * Default: 0.92 (92% confidence match).
   */
  CACHE_SIMILARITY_THRESHOLD: parseFloat(process.env.CACHE_SIMILARITY_THRESHOLD || '0.92'),

  /**
   * Cache Time-To-Live (TTL) definitions in seconds
   */
  ttls: {
    categories: parseInt(process.env.CACHE_TTL_CATEGORIES || '86400', 10), // 24 hours
    templates: parseInt(process.env.CACHE_TTL_TEMPLATES || '86400', 10),   // 24 hours
    components: parseInt(process.env.CACHE_TTL_COMPONENTS || '86400', 10), // 24 hours
    vocabulary: parseInt(process.env.CACHE_TTL_VOCABULARY || '600', 10),   // 10 minutes
    search: parseInt(process.env.CACHE_TTL_SEARCH || '300', 10),           // 5 minutes
    userHistory: 0,                                                         // Always dynamic (no cache)
  }
};
