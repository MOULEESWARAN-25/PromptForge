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

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTheme, setActiveTheme] = useState('Sleek Dark Glassmorphic');
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  // 1. Load persisted states & connect to Supabase database
  useEffect(() => {
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
    if (!username || !password) return { success: false, message: "Fields cannot be empty." };

    // Try cloud authentication first
    if (dbConnected) {
      const result = await supabaseLogin(username, password);
      if (result.success) {
        setUser({ username });
        localStorage.setItem('promptforge_session', username);
        
        // Fetch cloud user history
        const cloudHistory = await supabaseFetchHistory(username);
        if (cloudHistory) syncHistoryState(cloudHistory);
        
        return { success: true };
      } else if (!result.fallback) {
        return { success: false, message: result.message };
      }
    }

    // LOCAL STORAGE FALLBACK AUTH
    const db = JSON.parse(localStorage.getItem('promptforge_users') || '[]');
    const existing = db.find(u => u.username === username);
    
    if (existing && existing.password !== password) {
      return { success: false, message: "Invalid password credentials." };
    }

    if (!existing) {
      db.push({ username, password });
      localStorage.setItem('promptforge_users', JSON.stringify(db));
    }

    setUser({ username });
    localStorage.setItem('promptforge_session', username);
    loadLocalHistory();
    return { success: true };
  };

  const register = async (username, password) => {
    if (!username || !password) return { success: false, message: "Fields cannot be empty." };

    // Try cloud registration first
    if (dbConnected) {
      const result = await supabaseRegister(username, password);
      if (result.success) {
        setUser({ username });
        localStorage.setItem('promptforge_session', username);
        syncHistoryState([]); // New user has empty cloud history
        return { success: true };
      } else if (!result.fallback) {
        return { success: false, message: result.message };
      }
    }

    // LOCAL STORAGE FALLBACK REGISTRATION
    const db = JSON.parse(localStorage.getItem('promptforge_users') || '[]');
    const existing = db.find(u => u.username === username);
    
    if (existing) {
      return { success: false, message: "Username already exists." };
    }

    db.push({ username, password });
    localStorage.setItem('promptforge_users', JSON.stringify(db));
    
    setUser({ username });
    localStorage.setItem('promptforge_session', username);
    syncHistoryState([]);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('promptforge_session');
  };

  // 3. API Key Management
  const updateApiKey = (key) => {
    setApiKey(key || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    localStorage.setItem('promptforge_apikey', key);
  };

  // 4. Prompt History CRUD Operations
  const savePromptRecord = async (record) => {
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
      componentName: record.componentName || ''
    };

    const updatedHistory = [newRecord, ...history];
    syncHistoryState(updatedHistory);

    // Sync to Supabase in background
    if (dbConnected && user) {
      await supabaseSavePrompt(user.username, newRecord);
    }

    return newRecord;
  };

  const updatePromptChat = async (id, chatMessages, updatedPrompt, updatedRagDetails) => {
    let targetRecord = null;
    const updatedHistory = history.map(item => {
      if (item.id === id) {
        targetRecord = {
          ...item,
          chatMessages,
          resolvedPrompt: updatedPrompt,
          ragDetails: updatedRagDetails || item.ragDetails,
          timestamp: Date.now()
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

  return (
    <AppContext.Provider value={{
      user,
      apiKey,
      history,
      activeTheme,
      loading,
      dbConnected,
      login,
      register,
      logout,
      updateApiKey,
      setActiveTheme,
      savePromptRecord,
      updatePromptChat,
      deletePromptRecord,
      clearHistory
    }}>
      {children}
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
