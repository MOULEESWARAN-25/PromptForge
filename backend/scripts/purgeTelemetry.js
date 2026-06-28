import { supabase } from '../services/supabaseClient.js';
import { LIMITS } from '../config/limits.js';

/**
 * Data Purge Task
 * Cleans up telemetry log records older than configured retention period (default: 90 days).
 */
async function purgeTelemetryLogs() {
  const retentionDays = LIMITS.OBSERVABILITY_RETENTION_DAYS || 90;
  console.log(`================================================================`);
  console.log(` Starting Telemetry Retention Purge (Policy: ${retentionDays} Days)`);
  console.log(`================================================================`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const cutoffIso = cutoffDate.toISOString();
  const cutoffDateString = cutoffIso.split('T')[0];

  console.log(`Cutoff date for purging: ${cutoffDateString} (${cutoffIso})`);

  try {
    // 1. Purge from prompt_history (telemetry and RAG execution history)
    console.log(`[purge] Purging records from "prompt_history"...`);
    const { data: promptData, error: promptErr, count: promptCount } = await supabase
      .from('prompt_history')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffIso);

    if (promptErr) {
      console.error(`[purge] Error cleaning prompt_history: ${promptErr.message}`);
    } else {
      console.log(`[purge] Cleaned prompt_history. Rows removed: ${promptCount ?? 0}`);
    }

    // 2. Purge from entity_coverage_history (coverage snapshots over time)
    console.log(`[purge] Purging records from "entity_coverage_history"...`);
    const { data: coverageData, error: coverageErr, count: coverageCount } = await supabase
      .from('entity_coverage_history')
      .delete({ count: 'exact' })
      .lt('snapshot_date', cutoffDateString);

    if (coverageErr) {
      console.error(`[purge] Error cleaning entity_coverage_history: ${coverageErr.message}`);
    } else {
      console.log(`[purge] Cleaned entity_coverage_history. Rows removed: ${coverageCount ?? 0}`);
    }

    // 3. Purge from knowledge_metrics_daily (aggregated health records)
    console.log(`[purge] Purging records from "knowledge_metrics_daily"...`);
    const { data: dailyData, error: dailyErr, count: dailyCount } = await supabase
      .from('knowledge_metrics_daily')
      .delete({ count: 'exact' })
      .lt('date', cutoffDateString);

    if (dailyErr) {
      console.error(`[purge] Error cleaning knowledge_metrics_daily: ${dailyErr.message}`);
    } else {
      console.log(`[purge] Cleaned knowledge_metrics_daily. Rows removed: ${dailyCount ?? 0}`);
    }

    console.log(`================================================================`);
    console.log(` Telemetry Retention Purge Task Completed Successfully`);
    console.log(`================================================================`);
  } catch (error) {
    console.error(`CRITICAL: Purge task encountered unhandled execution error: ${error.message}`);
    process.exit(1);
  }
}

purgeTelemetryLogs().then(() => process.exit(0));
