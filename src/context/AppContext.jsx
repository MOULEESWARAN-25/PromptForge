"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  testDatabaseConnectivity,
  supabaseLogin,
  supabaseRegister,
  supabaseFetchHistory,
  supabaseSavePrompt,
  supabaseDeletePrompt
} from '../services/supabase';
import { track, EVENTS } from '../lib/analytics';
import { FREE_TIER_LIMITS } from '../styles/tokens';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTheme, setActiveTheme] = useState('Sleek Dark Glassmorphic');
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  // ── Save status: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle');

  // 1. Load persisted states & connect to Supabase database
  useEffect(() => {
    // Sync dark/light mode classes
    const savedTheme = localStorage.getItem('promptforge_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    async function initializeApp() {
      // Check database schema & tables connectivity
      const isDbLive = await testDatabaseConnectivity();
      setDbConnected(isDbLive);

      // Gemini API Key (load env default first, then check localStorage overrides)
      const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      const savedKey = localStorage.getItem('promptforge_apikey');
      setApiKey(savedKey || envKey);

      // Auth Session
      const activeSession = localStorage.getItem('promptforge_session');

      if (activeSession) {
        setUser({ username: activeSession });
        // Synchronize cookie for middleware protection
        document.cookie = `promptforge_session=${activeSession}; path=/; max-age=31536000; SameSite=Lax`;

        // Fetch History from Supabase if connected, otherwise read local storage
        if (isDbLive) {
          const cloudHistory = await supabaseFetchHistory(activeSession);
          if (cloudHistory) {
            setHistory(cloudHistory);
            localStorage.setItem('promptforge_history', JSON.stringify(cloudHistory));
          } else {
            loadLocalHistory();
          }
        } else {
          loadLocalHistory();
        }
      } else {
        loadLocalHistory();
      }

      setLoading(false);
    }

    initializeApp();
  }, []);

  const loadLocalHistory = () => {
    const savedHistory = localStorage.getItem('promptforge_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error loading local prompt history", e);
      }
    }
  };

  // Sync state & local storage log representation
  const syncHistoryState = (updatedHistory) => {
    setHistory(updatedHistory);
    localStorage.setItem('promptforge_history', JSON.stringify(updatedHistory));
  };

  // 2. Authentication Logic (With dynamic Supabase + LocalStorage Fallback)
  const login = async (username, password) => {
    if (!username || !password) return { success: false, message: "Please fill in all fields." };

    // Try cloud authentication first
    if (dbConnected) {
      const result = await supabaseLogin(username, password);
      if (result.success) {
        setUser({ username });
        localStorage.setItem('promptforge_session', username);
        document.cookie = `promptforge_session=${username}; path=/; max-age=31536000; SameSite=Lax`;

        // Fetch cloud user history
        const cloudHistory = await supabaseFetchHistory(username);
        if (cloudHistory) syncHistoryState(cloudHistory);

        track(EVENTS.USER_LOGGED_IN, { method: 'cloud' });
        return { success: true };
      } else if (!result.fallback) {
        track(EVENTS.AUTH_ERROR, { reason: result.message });
        return { success: false, message: result.message };
      }
    }

    // LOCAL STORAGE FALLBACK AUTH
    const db = JSON.parse(localStorage.getItem('promptforge_users') || '[]');
    const existing = db.find(u => u.username === username);

    if (existing && existing.password !== password) {
      track(EVENTS.AUTH_ERROR, { reason: 'invalid_password' });
      return { success: false, message: "That password doesn't match. Try again or use the demo account." };
    }

    if (!existing) {
      db.push({ username, password });
      localStorage.setItem('promptforge_users', JSON.stringify(db));
    }

    setUser({ username });
    localStorage.setItem('promptforge_session', username);
    document.cookie = `promptforge_session=${username}; path=/; max-age=31536000; SameSite=Lax`;
    loadLocalHistory();
    track(EVENTS.USER_LOGGED_IN, { method: 'local' });
    return { success: true };
  };

  const register = async (username, password) => {
    if (!username || !password) return { success: false, message: "Please fill in all fields." };

    // Try cloud registration first
    if (dbConnected) {
      const result = await supabaseRegister(username, password);
      if (result.success) {
        setUser({ username });
        localStorage.setItem('promptforge_session', username);
        document.cookie = `promptforge_session=${username}; path=/; max-age=31536000; SameSite=Lax`;
        syncHistoryState([]); // New user has empty cloud history
        track(EVENTS.USER_REGISTERED, { method: 'cloud' });
        return { success: true };
      } else if (!result.fallback) {
        return { success: false, message: result.message };
      }
    }

    // LOCAL STORAGE FALLBACK REGISTRATION
    const db = JSON.parse(localStorage.getItem('promptforge_users') || '[]');
    const existing = db.find(u => u.username === username);

    if (existing) {
      return { success: false, message: "That username is already taken. Try a different one or sign in instead." };
    }

    db.push({ username, password });
    localStorage.setItem('promptforge_users', JSON.stringify(db));

    setUser({ username });
    localStorage.setItem('promptforge_session', username);
    document.cookie = `promptforge_session=${username}; path=/; max-age=31536000; SameSite=Lax`;
    syncHistoryState([]);
    track(EVENTS.USER_REGISTERED, { method: 'local' });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('promptforge_session');
    document.cookie = 'promptforge_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    track(EVENTS.USER_LOGGED_OUT);
  };

  // 3. API Key Management
  const updateApiKey = (key) => {
    setApiKey(key || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    localStorage.setItem('promptforge_apikey', key);
  };

  // 4. Usage limits (free tier)
  const getUsageStats = () => {
    const used = history.length;
    const max = FREE_TIER_LIMITS.maxWorkspaces;
    const isAtLimit = used >= max;
    const isNearLimit = used >= max - 1;
    return { used, max, isAtLimit, isNearLimit, percent: Math.min((used / max) * 100, 100) };
  };

  // 5. Prompt History CRUD Operations
  const savePromptRecord = async (record) => {
    setSaveStatus('saving');
    try {
      const newRecord = {
        id: record.id || Math.random().toString(36).substring(2, 9),
        mode: record.mode,
        title: record.title || "Untitled Prompt",
        query: record.query || '',
        theme: record.theme || activeTheme,
        resolvedPrompt: record.resolvedPrompt,
        chatMessages: record.chatMessages || [],
        ragDetails: record.ragDetails || null,
        timestamp: Date.now(),
        category: record.category || '',
        pageType: record.pageType || '',
        components: record.components || [],
        componentName: record.componentName || '',
        revisions: record.revisions || [], // Prompt version history revisions
        collection: record.collection || '' // Folder collection assignment
      };

      const updatedHistory = [newRecord, ...history];
      syncHistoryState(updatedHistory);

      // Sync to Supabase in background
      if (dbConnected && user) {
        await supabaseSavePrompt(user.username, newRecord);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);

      track(EVENTS.PROMPT_GENERATED, { mode: record.mode, theme: record.theme });
      return newRecord;
    } catch (err) {
      setSaveStatus('error');
      throw err;
    }
  };

  const updatePromptChat = async (id, chatMessages, updatedPrompt, updatedRagDetails) => {
    setSaveStatus('saving');
    try {
      let targetRecord = null;
      const updatedHistory = history.map(item => {
        if (item.id === id) {
          // Push revision of previous resolvedPrompt if it was changed
          const revisions = item.revisions || [];
          const isPromptChanged = item.resolvedPrompt !== updatedPrompt;
          const updatedRevisions = isPromptChanged
            ? [...revisions, { timestamp: item.timestamp, resolvedPrompt: item.resolvedPrompt }]
            : revisions;

          targetRecord = {
            ...item,
            chatMessages,
            resolvedPrompt: updatedPrompt,
            ragDetails: updatedRagDetails || item.ragDetails,
            timestamp: Date.now(),
            revisions: updatedRevisions
          };
          return targetRecord;
        }
        return item;
      });

      syncHistoryState(updatedHistory);

      // Sync update to Supabase in background
      if (dbConnected && user && targetRecord) {
        await supabaseSavePrompt(user.username, targetRecord);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      throw err;
    }
  };

  const deletePromptRecord = async (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    syncHistoryState(updatedHistory);

    // Sync deletion to Supabase
    if (dbConnected) {
      await supabaseDeletePrompt(id);
    }
  };

  const clearHistory = async () => {
    // Delete items individually from database
    if (dbConnected) {
      for (const item of history) {
        await supabaseDeletePrompt(item.id);
      }
    }
    syncHistoryState([]);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('promptforge_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const updatePromptCollection = async (id, collection) => {
    setSaveStatus('saving');
    try {
      let targetRecord = null;
      const updatedHistory = history.map(item => {
        if (item.id === id) {
          targetRecord = { ...item, collection };
          return targetRecord;
        }
        return item;
      });
      syncHistoryState(updatedHistory);
      if (dbConnected && user && targetRecord) {
        await supabaseSavePrompt(user.username, targetRecord);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      toast.success(`Prompt moved to folder: ${collection || 'Root'}`);
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      apiKey,
      history,
      activeTheme,
      theme,
      toggleTheme,
      loading,
      dbConnected,
      saveStatus,
      login,
      register,
      logout,
      updateApiKey,
      setActiveTheme,
      savePromptRecord,
      updatePromptChat,
      deletePromptRecord,
      clearHistory,
      getUsageStats,
      updatePromptCollection,
    }}>
      <div className={`${theme} theme-container`}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
