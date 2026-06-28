import { createClient } from '@supabase/supabase-js';
import { devWarn, devError } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 1. Initialize the official Supabase Client
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// A state tracker to dynamically disable Supabase if database tables are not set up yet
let isDatabaseActive = !!supabase;

export function getSupabaseStatus() {
  return {
    initialized: !!supabase,
    active: isDatabaseActive,
    url: supabaseUrl
  };
}

/**
 * Tests if the target Supabase tables exist.
 * If tables are missing or database connection fails, it triggers the LocalStorage fallback seamlessly.
 */
export async function testDatabaseConnectivity() {
  if (!supabase) {
    isDatabaseActive = false;
    return false;
  }

  try {
    // Attempt a quick, lightweight query on the users table
    const { error } = await supabase.from('users').select('username').limit(1);
    
    if (error) {
      devWarn("[Supabase] Database schema check returned an error. Falling back to LocalStorage. Code: " + error.code + ", Msg: " + error.message);
      devWarn("[Supabase] To activate cloud storage, run the SQL migrations in your Supabase SQL Editor.");
      isDatabaseActive = false;
      return false;
    }
    
    isDatabaseActive = true;
    return true;
  } catch (e) {
    devError("[Supabase] Database connection failure:", e);
    isDatabaseActive = false;
    return false;
  }
}

// 2. AUTHENTICATION SERVICES
// Obsolete supabaseRegister and supabaseLogin functions have been removed. Firebase Auth is the unified provider.

// 3. PROMPT HISTORY SERVICES
export async function supabaseFetchHistory(username) {
  if (!isDatabaseActive) return null;

  try {
    const { data, error } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('username', username)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Map database fields to standard context camelCase fields
    return data.map(item => ({
      id: item.id,
      mode: item.mode,
      title: item.title,
      query: item.query,
      theme: item.theme,
      resolvedPrompt: item.resolved_prompt,
      chatMessages: item.chat_messages || [],
      ragDetails: item.rag_details || null,
      timestamp: Number(item.timestamp),
      category: item.category || '',
      pageType: item.page_type || '',
      components: item.components || [],
      componentName: item.component_name || ''
    }));
  } catch (err) {
    devError("Supabase fetch history error:", err.message || err.code || err);
    return null;
  }
}

export async function supabaseSavePrompt(username, record) {
  if (!isDatabaseActive) return false;

  try {
    // Self-healing database check: Ensure username exists in users table to prevent foreign key errors on out-of-sync sessions
    const { data: userExists, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (!checkError && !userExists) {
      // Auto-register the username on-the-fly to satisfy foreign key constraints
      await supabase
        .from('users')
        .insert([{ username, password: 'promptforge_autosync' }]);
    }

    // Map context fields to standard snake_case database schema
    const payload = {
      id: record.id,
      username: username,
      mode: record.mode,
      title: record.title,
      query: record.query,
      theme: record.theme,
      resolved_prompt: record.resolvedPrompt,
      chat_messages: record.chatMessages || [],
      rag_details: record.ragDetails || {},
      timestamp: record.timestamp,
      category: record.category || '',
      page_type: record.pageType || '',
      components: record.components || [],
      component_name: record.componentName || '',
      engine_version: record.ragDetails?.engine_version || 'phase2',
      telemetry_source: record.ragDetails?.telemetry_source || 'production'
    };

    const { error } = await supabase
      .from('prompt_history')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (err) {
    devError("Supabase save prompt error:", err.message || err.code || err);
    return false;
  }
}

export async function supabaseDeletePrompt(id) {
  if (!isDatabaseActive) return false;

  try {
    const { error } = await supabase
      .from('prompt_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    devError("Supabase delete prompt error:", err.message || err.code || err);
    return false;
  }
}
