// Memory-based backend telemetry system for Veyntra monitoring & observability
import { supabase } from "./supabaseClient.js";

const stats = {
  gemini: {
    requests: 0,
    successes: 0,
    failures: 0,
    failovers: 0,
    lastLatencyMs: 0,
    avgLatencyMs: 0,
    status: "Operational", // "Operational" | "Quota Exhausted (429)" | "Degraded" | "Offline"
  },
  groq: {
    requests: 0,
    successes: 0,
    failures: 0,
    lastLatencyMs: 0,
    avgLatencyMs: 0,
    status: "Operational", // "Operational" | "Inactive" | "Degraded" | "Offline"
  },
  supabase: {
    requests: 0,
    successes: 0,
    failures: 0,
    lastLatencyMs: 0,
    avgLatencyMs: 0,
    status: "Operational",
  },
  localRag: {
    requests: 0,
    successes: 0,
    lastLatencyMs: 0,
    status: "Active",
  },
  uptimeStart: Date.now(),
  cacheHits: 0,
  retries: 0,
  promptSizes: [],
  responseSizes: [],
};

// Helper to update moving average latency
function updateLatency(provider, latencyMs) {
  const p = stats[provider];
  p.lastLatencyMs = latencyMs;
  if (p.avgLatencyMs === 0) {
    p.avgLatencyMs = latencyMs;
  } else {
    p.avgLatencyMs = Math.round((p.avgLatencyMs * 9 + latencyMs) / 10);
  }
}

export const telemetryService = {
  recordRequest(provider) {
    if (stats[provider]) {
      stats[provider].requests++;
    }
  },

  recordSuccess(provider, latencyMs) {
    if (stats[provider]) {
      stats[provider].successes++;
      stats[provider].status = "Operational";
      if (latencyMs !== undefined) {
        updateLatency(provider, latencyMs);
      }
    }
  },

  recordFailure(provider, errorMsg) {
    if (stats[provider]) {
      stats[provider].failures++;
      const msg = (errorMsg || "").toLowerCase();
      if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted")) {
        stats[provider].status = "Quota Exhausted (429)";
      } else {
        stats[provider].status = "Degraded";
      }
    }
  },

  recordFailover(provider) {
    if (stats[provider]) {
      stats[provider].failovers++;
    }
  },

  recordCacheHit() {
    stats.cacheHits++;
  },

  recordRetry() {
    stats.retries++;
  },

  recordPromptSize(size) {
    if (typeof size === 'number') {
      stats.promptSizes.push(size);
    }
  },

  recordResponseSize(size) {
    if (typeof size === 'number') {
      stats.responseSizes.push(size);
    }
  },

  getDerivedMetrics() {
    const totalRuns = stats.gemini.requests + stats.groq.requests;
    const totalGenerations = totalRuns + stats.cacheHits;

    const cacheHitPct = totalGenerations > 0 ? Math.round((stats.cacheHits / totalGenerations) * 100) : 0;
    const retryPct = totalRuns > 0 ? Math.round((stats.retries / totalRuns) * 100) : 0;
    
    const avgPromptSize = stats.promptSizes.length > 0
      ? Math.round(stats.promptSizes.reduce((acc, v) => acc + v, 0) / stats.promptSizes.length)
      : 0;

    const avgResponseSize = stats.responseSizes.length > 0
      ? Math.round(stats.responseSizes.reduce((acc, v) => acc + v, 0) / stats.responseSizes.length)
      : 0;

    return {
      avgLatencyGeminiMs: stats.gemini.avgLatencyMs,
      avgLatencyGroqMs: stats.groq.avgLatencyMs,
      cacheHitPercentage: cacheHitPct,
      retryPercentage: retryPct,
      averagePromptSizeCharacters: avgPromptSize,
      averageResponseSizeCharacters: avgResponseSize,
      totalCacheHits: stats.cacheHits,
      totalRetries: stats.retries
    };
  },

  async getStats() {
    // Dynamically verify Supabase latency
    const start = Date.now();
    try {
      this.recordRequest("supabase");
      const { data, error } = await supabase.from("design_vocabulary").select("id").limit(1);
      if (error) throw error;
      this.recordSuccess("supabase", Date.now() - start);
    } catch (err) {
      this.recordFailure("supabase", err.message);
      stats.supabase.status = "Offline";
    }

    // Verify dynamic active statuses
    if (!process.env.GEMINI_API_KEY) {
      stats.gemini.status = "Offline (Key Missing)";
    }
    if (!process.env.GROQ_API_KEY) {
      stats.groq.status = "Offline (Key Missing)";
    }

    return {
      ...stats,
      derived: this.getDerivedMetrics(),
      uptimeSeconds: Math.round((Date.now() - stats.uptimeStart) / 1000),
      timestamp: new Date(),
    };
  }
};
