"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LayoutTemplate, Sparkles, Box, FileText, ShoppingBag, TerminalSquare } from "lucide-react";

const iconMap = {
  LayoutTemplate,
  Sparkles,
  Box,
  FileText,
  ShoppingBag,
  TerminalSquare
};

const fallbackStarterTemplates = [
  { id: 'saas',       icon: LayoutTemplate, title: 'SaaS Dashboard',       desc: 'Pre-configured prompt for admin panels',         mode: 'application', prompt: 'Create a comprehensive SaaS admin dashboard with a sidebar navigation, a top header with user profile and search, and a main content area containing data cards, a line chart for revenue, and a recent transactions table. Use a clean, modern aesthetic with a primary blue accent.' },
  { id: 'ai',         icon: Sparkles,       title: 'AI Chat Interface',     desc: 'Ready-to-compile conversational UI',              mode: 'application', prompt: 'Build an AI chat interface similar to ChatGPT. Include a sidebar for chat history, a main chat area with distinct user and AI message bubbles, and a sticky input area at the bottom with a submit button and attachment icon.' },
  { id: 'portfolio',  icon: Box,            title: 'Developer Portfolio',   desc: 'Personal site with project galleries',            mode: 'page',        prompt: 'Design a sleek, minimalist developer portfolio. Include a hero section with a brief introduction, a skills grid, a projects gallery with cards, and a contact form. Use a dark theme with neon accents.' },
  { id: 'docs',       icon: FileText,       title: 'Documentation Hub',     desc: 'Markdown-ready docs with sidebar navigation',     mode: 'page',        prompt: 'Create a documentation hub layout. Include a persistent left sidebar for nested navigation, a top bar with global search, and a main content area with typography optimized for long-form reading and code blocks.' },
  { id: 'ecommerce',  icon: ShoppingBag,    title: 'E-commerce Storefront', desc: 'Product grid, cart, and filtering',               mode: 'application', prompt: 'Develop an e-commerce storefront. The home page should feature a promotional hero banner, a category sidebar with filters, and a responsive product grid. Include a shopping cart slide-out panel.' },
  { id: 'admin',      icon: TerminalSquare, title: 'Internal Tool',         desc: 'Data management and CRUD UI',                     mode: 'application', prompt: 'Build an internal CRUD tool for employee management. The interface should have a large data table with sorting and filtering, and a slide-out modal for adding or editing employee records.' }
];

import {
  testDatabaseConnectivity,
  supabaseFetchHistory,
  supabaseSavePrompt,
  supabaseDeletePrompt,
} from "../services/supabase";
import { track, EVENTS } from "../lib/analytics";
import { FREE_TIER_LIMITS } from "../styles/tokens";
import { API_BASE_URL, apiUrl } from "../config/api";
import { toast } from "sonner";
import { auth, googleProvider } from "../lib/firebase";
import { designVocabulary } from "../data/designVocabulary";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendEmailVerification,
  onAuthStateChanged
} from "firebase/auth";
import { APP_CATEGORIES, CATEGORY_FEATURES, AI_FEATURE_SUGGESTIONS } from "../app/forge/constants/appCategories";
import { PAGE_TYPES, PAGE_COMPONENTS } from "../app/forge/constants/pageTemplates";
import { COMPONENT_TYPES } from "../app/forge/constants/components";
import { devLog, devWarn, devError } from "@/lib/logger";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const isLoggingOutRef = useRef(false);
  const [apiKey, setApiKey] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTheme, setActiveTheme] = useState("Sleek Dark Glassmorphic");
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  // ── Save status: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState("idle");
  // ── Dynamic vocabulary and global stats
  const [vocabulary, setVocabulary] = useState(null);
  const [vocabLoading, setVocabLoading] = useState(true);
  const [vocabError, setVocabError] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    total_specifications_compiled: 12400,
    total_design_patterns: 60,
    ai_tools_supported: 8
  });
  // ── Activity tracking (replaces streak — utility tool, not daily habit)
  const [activityStats, setActivityStats] = useState({
    sessionsThisMonth: 0,
    blueprintsThisMonth: 0,
    totalSessions: 0,
  });
  // ── First blueprint flag (drives aha moment + success screen)
  const [showFirstBlueprintSuccess, setShowFirstBlueprintSuccess] =
    useState(false);

  // ── State buckets for dynamic wizard config
  const [categories, setCategories] = useState({
    APP_CATEGORIES,
    CATEGORY_FEATURES,
    AI_FEATURE_SUGGESTIONS
  });
  const [templates, setTemplates] = useState({
    PAGE_TYPES,
    PAGE_COMPONENTS
  });
  const [components, setComponents] = useState({
    COMPONENT_TYPES
  });
  const [generationMode, setGenerationMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("promptforge_generation_mode") || "professional";
    }
    return "professional";
  });

  const [drafts, setDrafts] = useState([]);
  const [starterTemplates, setStarterTemplates] = useState(fallbackStarterTemplates);

  // Load drafts on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadDrafts = () => {
        try {
          const found = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key === 'promptforge_draft' || key.startsWith('promptforge_draft_'))) {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.mode) {
                  found.push({
                    key,
                    title: parsed.projectName || (
                      parsed.mode === 'application' ? 'SaaS Application Blueprint' :
                        parsed.mode === 'page' ? 'Web Page Design Blueprint' :
                          parsed.mode === 'component' ? 'Single Component Blueprint' : 'Prompt Enhancement'
                    ),
                    mode: parsed.mode,
                    savedAt: parsed.savedAt || Date.now(),
                    details: parsed,
                  });
                }
              }
            }
          }
          found.sort((a, b) => b.savedAt - a.savedAt);
          setDrafts(found);
        } catch (e) {
          devError("Failed to load drafts in context:", e);
        }
      };
      loadDrafts();
      // Listen to storage events to keep drafts in sync
      window.addEventListener('storage', loadDrafts);
      return () => window.removeEventListener('storage', loadDrafts);
    }
  }, []);

  const discardDraft = (key) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
      setDrafts(prev => prev.filter(d => d.key !== key));
    }
  };

  const workspaceMetrics = useMemo(() => {
    const promptsCount = history.length;
    const totalLines = history.reduce((acc, h) => acc + (h.resolvedPrompt ? h.resolvedPrompt.split('\n').length : 0), 0);
    const formattedLines = totalLines >= 1000 ? `${(totalLines / 1000).toFixed(1)}k` : totalLines.toString();

    const nowMs = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();

    const promptsToday = history.filter(h => h.timestamp >= todayStartMs).length;
    const promptsChangeTodayText = promptsToday > 0 ? `+${promptsToday} today` : 'No compilations today';

    const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgoMs = nowMs - 14 * 24 * 60 * 60 * 1000;

    const linesThisWeek = history.filter(h => h.timestamp >= sevenDaysAgoMs).reduce((acc, h) => acc + (h.resolvedPrompt ? h.resolvedPrompt.split('\n').length : 0), 0);
    const linesLastWeek = history.filter(h => h.timestamp < sevenDaysAgoMs && h.timestamp >= fourteenDaysAgoMs).reduce((acc, h) => acc + (h.resolvedPrompt ? h.resolvedPrompt.split('\n').length : 0), 0);

    let linesChangePct = 0;
    if (linesLastWeek > 0) {
      linesChangePct = Math.round(((linesThisWeek - linesLastWeek) / linesLastWeek) * 100);
    } else if (linesThisWeek > 0) {
      linesChangePct = 100;
    }
    const linesChangeText = linesChangePct >= 0 ? `+${linesChangePct}% this week` : `${linesChangePct}% this week`;

    // Heatmap data (30 days)
    const heatmapData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      d.setHours(0, 0, 0, 0);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const count = history.filter(h => h.timestamp >= dayStart && h.timestamp < dayEnd).length;
      let intensity = 0;
      if (count === 1) intensity = 1;
      else if (count >= 2 && count <= 3) intensity = 2;
      else if (count >= 4 && count <= 5) intensity = 3;
      else if (count >= 6) intensity = 4;
      return { date: d, count, intensity };
    });

    const totalIntentsThisMonth = history.filter(h => h.timestamp >= nowMs - 30 * 24 * 60 * 60 * 1000).length;

    // Merge history and drafts for Continue Working
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const continueWorkingItems = [
      ...drafts.map(d => ({ ...d, isDraft: true, timestamp: d.savedAt, id: d.key })),
      ...sortedHistory.map(h => ({ ...h, isDraft: false, title: h.title || 'Untitled Blueprint' }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    return {
      promptsCount,
      totalLines,
      formattedLines,
      promptsToday,
      promptsChangeTodayText,
      linesThisWeek,
      linesLastWeek,
      linesChangeText,
      heatmapData,
      totalIntentsThisMonth,
      continueWorkingItems
    };
  }, [history, drafts]);


  // Helper to establish server session via Next.js API Route
  const establishSession = useCallback(async (firebaseUser, onboardingDetails = {}) => {
    try {
      // Force token refresh so we get updated claims (e.g. emailVerified)
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name: onboardingDetails.name,
          role: onboardingDetails.role,
          primaryTool: onboardingDetails.primaryTool
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to establish session");
      }
      return { success: true, user: data.user };
    } catch (err) {
      console.error("establishSession error:", err);
      return { success: false, message: err.message };
    }
  }, []);

  const checkVerificationStatus = useCallback(async () => {
    if (!auth.currentUser) return { success: false, message: "No active user found." };
    
    try {
      await auth.currentUser.reload();
      const firebaseUser = auth.currentUser;

      if (firebaseUser.emailVerified) {
        let onboardingDetails = {};
        try {
          const cached = localStorage.getItem("pf_onboarding_details");
          if (cached) onboardingDetails = JSON.parse(cached);
        } catch {}

        const sessionResult = await establishSession(firebaseUser, onboardingDetails);
        if (sessionResult.success) {
          track(EVENTS.VERIFICATION_COMPLETED);
          localStorage.removeItem("pf_onboarding_details");
          setUser({
            uid: firebaseUser.uid,
            username: sessionResult.user?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            emailVerified: true,
            role: sessionResult.user?.role,
            primaryTool: sessionResult.user?.primaryTool || sessionResult.user?.primary_tool
          });
          localStorage.setItem("promptforge_session", firebaseUser.email);
          
          const isDbLive = await testDatabaseConnectivity();
          if (isDbLive) {
            const cloudHistory = await supabaseFetchHistory(firebaseUser.email);
            if (cloudHistory) syncHistoryState(cloudHistory);
          }
          return { success: true };
        } else {
          return { success: false, message: sessionResult.message };
        }
      }
      return { success: false, message: "Email is still unverified. Please check your inbox." };
    } catch (err) {
      console.error("checkVerificationStatus error:", err);
      return { success: false, message: err.message };
    }
  }, [establishSession]);

  // 1. Load persisted states & connect to Supabase database
  useEffect(() => {
    // Sync dark/light mode classes
    const savedTheme = localStorage.getItem("promptforge_theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    async function initDb() {
      const isDbLive = await testDatabaseConnectivity();
      setDbConnected(isDbLive);

      // Fetch vocabulary dynamically
      try {
        setVocabLoading(true);
        const res = await fetch(apiUrl('/vocabulary'));
        if (res.ok) {
          const data = await res.json();
          const vocabData = data?.data ?? data;
          setVocabulary(vocabData);
          setVocabError(false);
        } else {
          devWarn("Backend vocabulary offline, falling back to static vocabulary.");
          setVocabulary(designVocabulary);
          setVocabError(false);
        }
      } catch (e) {
        devWarn("Failed to fetch vocabulary from backend, falling back to static vocabulary. Error:", e.message);
        setVocabulary(designVocabulary);
        setVocabError(false);
      } finally {
        setVocabLoading(false);
      }

      // Fetch global statistics
      try {
        const res = await fetch(apiUrl('/vocabulary/stats'));
        if (res.ok) {
          const data = await res.json();
          const statsData = data?.data ?? data;
          setGlobalStats(statsData);
        }
      } catch (e) {
        devWarn("Failed to fetch global statistics:", e.message);
      }

      // Fetch dynamic categories
      try {
        const res = await fetch(apiUrl('/forge/categories'));
        if (res.ok) {
          const data = await res.json();
          const payload = data?.data ?? data;
          if (payload && payload.APP_CATEGORIES) {
            setCategories(payload);
          } else if (Array.isArray(payload)) {
            setCategories({
              APP_CATEGORIES: payload,
              CATEGORY_FEATURES: CATEGORY_FEATURES,
              AI_FEATURE_SUGGESTIONS: AI_FEATURE_SUGGESTIONS
            });
          }
        }
      } catch (e) {
        devWarn("Failed to fetch dynamic categories:", e.message);
      }

      // Fetch dynamic templates
      try {
        const res = await fetch(apiUrl('/forge/templates'));
        if (res.ok) {
          const data = await res.json();
          const payload = data?.data ?? data;
          if (payload && payload.PAGE_TYPES) {
            setTemplates(payload);
          } else if (Array.isArray(payload)) {
            setTemplates({
              PAGE_TYPES: payload,
              PAGE_COMPONENTS: PAGE_COMPONENTS
            });
          }
        }
      } catch (e) {
        devWarn("Failed to fetch dynamic templates:", e.message);
      }

      // Fetch dynamic components
      try {
        const res = await fetch(apiUrl('/forge/components'));
        if (res.ok) {
          const data = await res.json();
          const payload = data?.data ?? data;
          if (payload && payload.COMPONENT_TYPES) {
            setComponents(payload);
          } else if (Array.isArray(payload)) {
            setComponents({
              COMPONENT_TYPES: payload
            });
          }
        }
      } catch (e) {
        devWarn("Failed to fetch dynamic components:", e.message);
      }

      // Fetch dynamic starter templates
      try {
        const res = await fetch(apiUrl('/forge/starter-templates'));
        if (res.ok) {
          const data = await res.json();
          const payload = data?.data ?? data;
          if (Array.isArray(payload)) {
            const mapped = payload.map(t => ({
              ...t,
              icon: iconMap[t.icon] || Sparkles
            }));
            setStarterTemplates(mapped);
          } else {
            setStarterTemplates(fallbackStarterTemplates);
          }
        } else {
          setStarterTemplates(fallbackStarterTemplates);
        }
      } catch (e) {
        devWarn("Failed to fetch dynamic starter templates from backend, falling back to static cache:", e.message);
        setStarterTemplates(fallbackStarterTemplates);
      }
    }

    initDb();

    // Gemini API Key
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const savedKey = localStorage.getItem("promptforge_apikey");
    setApiKey(savedKey || envKey);

    // Mock auth bypass for local development/screenshot capturing
    const mockEmail = typeof window !== 'undefined' && localStorage.getItem("promptforge_session_mock");
    if (process.env.NODE_ENV === 'development' && mockEmail) {
      const loadHistory = async () => {
        let mockUser = {
          uid: 'test-uid-verification-2026',
          username: mockEmail === 'mouleeswaran.cs23@bitsathy.ac.in' ? 'Moulee' : 'Verification Admin',
          email: mockEmail,
          emailVerified: true
        };
        try {
          const res = await fetch(`/api/auth/session?mockEmail=${encodeURIComponent(mockEmail)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              mockUser = {
                uid: data.user.uid,
                username: data.user.name || mockUser.username,
                email: data.user.email,
                emailVerified: true,
                role: data.user.role,
                primaryTool: data.user.primary_tool || data.user.primaryTool
              };
            }
          }
        } catch (e) {
          devWarn("Failed to fetch mock user profile:", e);
        }
        setUser(mockUser);

        const isDbLive = await testDatabaseConnectivity();
        if (isDbLive) {
          const cloudHistory = await supabaseFetchHistory(mockEmail);
          if (cloudHistory) {
            setHistory(cloudHistory);
            localStorage.setItem("promptforge_history", JSON.stringify(cloudHistory));
          } else {
            loadLocalHistory();
          }
        } else {
          loadLocalHistory();
        }
        setLoading(false);
      };
      loadHistory();
      return;
    }

    // Bind Firebase state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isLoggingOutRef.current) {
        devLog("Auth state change ignored during sign-out.");
        return;
      }
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          let profileUser = { 
            uid: firebaseUser.uid, 
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0], 
            email: firebaseUser.email, 
            emailVerified: true 
          };

          let sessionActive = false;
          try {
            const res = await fetch("/api/auth/session");
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.user) {
                profileUser = {
                  uid: data.user.uid,
                  username: data.user.name || profileUser.username,
                  email: data.user.email,
                  emailVerified: true,
                  role: data.user.role,
                  primaryTool: data.user.primary_tool || data.user.primaryTool,
                  isDemo: false
                };
                sessionActive = true;
              }
            }
          } catch (e) {
            devWarn("Failed to fetch session profile:", e);
          }

          // If no active session was returned, attempt to establish it automatically
          if (!sessionActive) {
            devLog("Session not active or expired, establishing session automatically...");
            const sessionResult = await establishSession(firebaseUser);
            if (sessionResult.success) {
              profileUser = {
                uid: firebaseUser.uid,
                username: sessionResult.user?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
                email: firebaseUser.email,
                emailVerified: true,
                role: sessionResult.user?.role,
                primaryTool: sessionResult.user?.primaryTool || sessionResult.user?.primary_tool,
                isDemo: false
              };
            } else {
              devError("Failed to auto-establish session, signing out:", sessionResult.message);
              await signOut(auth);
              setUser(null);
              setLoading(false);
              return;
            }
          }

          setUser(profileUser);
          localStorage.setItem("promptforge_session", firebaseUser.email);
          
          const isDbLive = await testDatabaseConnectivity();
          if (isDbLive) {
            const cloudHistory = await supabaseFetchHistory(firebaseUser.email);
            if (cloudHistory) {
              setHistory(cloudHistory);
              localStorage.setItem("promptforge_history", JSON.stringify(cloudHistory));
            } else {
              loadLocalHistory();
            }
          } else {
            loadLocalHistory();
          }
        } else {
          setUser({ uid: firebaseUser.uid, username: firebaseUser.email, email: firebaseUser.email, emailVerified: false });
        }
      } else {
        // No Firebase user. Check if there's a backend demo session active
        try {
          const res = await fetch("/api/auth/session");
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user && data.user.isDemo) {
              setUser({
                uid: data.user.uid,
                username: data.user.name || 'Demo User',
                email: data.user.email,
                emailVerified: true,
                isDemo: true,
                role: data.user.role,
                primaryTool: data.user.primary_tool || data.user.primaryTool
              });

              // Load demo history
              const isDbLive = await testDatabaseConnectivity();
              if (isDbLive) {
                const cloudHistory = await supabaseFetchHistory(data.user.email);
                if (cloudHistory) {
                  setHistory(cloudHistory);
                  localStorage.setItem("promptforge_history", JSON.stringify(cloudHistory));
                } else {
                  loadLocalHistory();
                }
              } else {
                loadLocalHistory();
              }
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          devWarn("Failed to fetch backend demo session:", e);
        }

        setUser(null);
        loadLocalHistory();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [establishSession]);

  // Sync verification status automatically when tab becomes active or visibility change occurs
  useEffect(() => {
    if (!user || user.emailVerified) return;

    let fallbackInterval;

    const syncStatus = () => {
      devLog("Window/Visibility focus change - checking verification status...");
      checkVerificationStatus();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncStatus();
      }
    };

    // 1. Focus listener
    window.addEventListener("focus", syncStatus);

    // 2. Visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Low-frequency fallback polling (every 45 seconds)
    fallbackInterval = setInterval(() => {
      devLog("Fallback verification check running...");
      checkVerificationStatus();
    }, 45000);

    return () => {
      window.removeEventListener("focus", syncStatus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [user, checkVerificationStatus]);

  const loadLocalHistory = () => {
    const savedHistory = localStorage.getItem("promptforge_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error loading local prompt history", e);
      }
    }
  };

  // ── Record a building activity session (call from dashboard on mount)
  const recordActivity = () => {
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const stored = JSON.parse(localStorage.getItem("pf_active_days") || "[]");
      // Add today if not already recorded
      const updated = stored.includes(today) ? stored : [...stored, today];
      localStorage.setItem("pf_active_days", JSON.stringify(updated));

      // Compute sessions this month
      const thisMonth = today.slice(0, 7); // YYYY-MM
      const sessionsThisMonth = updated.filter((d) =>
        d.startsWith(thisMonth),
      ).length;
      const totalSessions = updated.length;

      setActivityStats((prev) => ({
        ...prev,
        sessionsThisMonth,
        totalSessions,
      }));

      if (!stored.includes(today)) {
        track(EVENTS.ACTIVITY_SESSION_RECORDED, { sessionsThisMonth });
      }
    } catch {}
  };

  // ── Compute blueprints created this calendar month
  const getBlueprintsThisMonth = (hist = history) => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return hist.filter(
      (h) => new Date(h.timestamp).toISOString().slice(0, 7) === thisMonth,
    ).length;
  };

  // Sync state & local storage log representation
  const syncHistoryState = (updatedHistory) => {
    setHistory(updatedHistory);
    localStorage.setItem("promptforge_history", JSON.stringify(updatedHistory));
  };

  // 2. Authentication Logic
  const login = async (email, password) => {
    if (!email || !password)
      return { success: false, message: "Please fill in all fields." };

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser);
        setUser({ uid: firebaseUser.uid, username: firebaseUser.email, email: firebaseUser.email, emailVerified: false });
        track(EVENTS.AUTH_ERROR, { reason: "email_unverified" });
        return { success: false, message: "Please verify your email address. A new verification link has been sent to your inbox.", verificationRequired: true };
      }

      const sessionResult = await establishSession(firebaseUser);
      if (!sessionResult.success) {
        return sessionResult;
      }

      setUser({
        uid: firebaseUser.uid,
        username: sessionResult.user?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        emailVerified: true,
        role: sessionResult.user?.role,
        primaryTool: sessionResult.user?.primaryTool || sessionResult.user?.primary_tool
      });
      localStorage.setItem("promptforge_session", firebaseUser.email);
      
      const isDbLive = await testDatabaseConnectivity();
      if (isDbLive) {
        const cloudHistory = await supabaseFetchHistory(firebaseUser.email);
        if (cloudHistory) syncHistoryState(cloudHistory);
      } else {
        loadLocalHistory();
      }

      track(EVENTS.USER_LOGGED_IN, { method: "email" });
      return { success: true };
    } catch (err) {
      console.error("Firebase Login Error:", err);
      let errMsg = "Invalid email or password. Please try again.";
      if (err.code === "auth/invalid-credential") {
        errMsg = "That password doesn't match or the user was not found.";
      } else if (err.code === "auth/user-disabled") {
        errMsg = "This user account has been disabled.";
      } else if (err.code === "auth/too-many-requests") {
        errMsg = "Too many failed login attempts. Please try again later.";
      }
      track(EVENTS.AUTH_ERROR, { reason: err.code || err.message });
      return { success: false, message: errMsg };
    }
  };

  const register = async (email, password, profileDetails = {}) => {
    if (!email || !password)
      return { success: false, message: "Please fill in all fields." };

    track(EVENTS.REGISTRATION_STARTED);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      track(EVENTS.REGISTRATION_COMPLETED);
      await sendEmailVerification(firebaseUser);
      localStorage.setItem("pf_onboarding_details", JSON.stringify(profileDetails));

      setUser({ uid: firebaseUser.uid, username: firebaseUser.email, email: firebaseUser.email, emailVerified: false });
      
      track(EVENTS.USER_REGISTERED, { method: "email" });
      return { success: true, verificationRequired: true };
    } catch (err) {
      console.error("Firebase Register Error:", err);
      let errMsg = "Account creation failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered. Try signing in instead.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      }
      return { success: false, message: errMsg };
    }
  };

  const googleLogin = async (profileDetails = {}) => {
    track(EVENTS.GOOGLE_SIGNIN_STARTED);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const sessionResult = await establishSession(firebaseUser, profileDetails);
      if (!sessionResult.success) {
        return sessionResult;
      }

      track(EVENTS.GOOGLE_SIGNIN_SUCCESS);

      setUser({
        uid: firebaseUser.uid,
        username: sessionResult.user?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        emailVerified: true,
        role: sessionResult.user?.role,
        primaryTool: sessionResult.user?.primaryTool || sessionResult.user?.primary_tool
      });
      localStorage.setItem("promptforge_session", firebaseUser.email);

      const isDbLive = await testDatabaseConnectivity();
      if (isDbLive) {
        const cloudHistory = await supabaseFetchHistory(firebaseUser.email);
        if (cloudHistory) syncHistoryState(cloudHistory);
      } else {
        loadLocalHistory();
      }

      track(EVENTS.USER_LOGGED_IN, { method: "google" });
      return { success: true };
    } catch (err) {
      console.error("Firebase Google Login Error:", err);
      return { success: false, message: "Google Sign-In failed or was cancelled." };
    }
  };

  const logout = async () => {
    isLoggingOutRef.current = true;
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("promptforge_session");
      localStorage.removeItem("promptforge_session_mock");
      isLoggingOutRef.current = false;
    }
    track(EVENTS.USER_LOGGED_OUT);
  };

  const resendVerification = async () => {
    if (!auth.currentUser) return { success: false, message: "No active user found." };
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err) {
      console.error("resendVerification error:", err);
      return { success: false, message: err.message };
    }
  };

  const changeEmailAddress = async (newEmail) => {
    if (!auth.currentUser) return { success: false, message: "No active user found." };
    try {
      const { updateEmail } = await import("firebase/auth");
      await updateEmail(auth.currentUser, newEmail);
      await sendEmailVerification(auth.currentUser);
      setUser(prev => ({ ...prev, username: newEmail, email: newEmail }));
      return { success: true };
    } catch (err) {
      console.error("changeEmailAddress error:", err);
      let errMsg = err.message;
      if (err.code === "auth/requires-recent-login") {
        errMsg = "This action requires recent authentication. Please sign out and sign back in to change your email.";
      }
      return { success: false, message: errMsg };
    }
  };

  const loginAsDemo = async () => {
    track(EVENTS.DEMO_STARTED);
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemo: true })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403 || (data.error && data.error.includes("limit"))) {
          track(EVENTS.DEMO_LIMIT_REACHED);
        }
        throw new Error(data.error || "Failed to establish demo session");
      }

      setUser({
        uid: data.user.uid,
        username: data.user.name || 'Demo User',
        email: data.user.email,
        emailVerified: true,
        isDemo: true,
        role: data.user.role,
        primaryTool: data.user.primary_tool || data.user.primaryTool
      });

      localStorage.setItem("promptforge_session", data.user.email);
      
      // Store count & details in localStorage for UX tracking
      const currentCount = Number(localStorage.getItem("pf_demo_sessions_count") || "0");
      localStorage.setItem("pf_demo_sessions_count", String(data.demoSessionsUsed || (currentCount + 1)));

      const demoUserIds = JSON.parse(localStorage.getItem("pf_demo_user_ids") || "[]");
      demoUserIds.push(data.user.uid);
      localStorage.setItem("pf_demo_user_ids", JSON.stringify(demoUserIds));

      setHistory([]);
      localStorage.removeItem("promptforge_history"); // Clear previous history for clean isolated workspace

      track(EVENTS.USER_LOGGED_IN, { method: "demo", sessionCount: data.demoSessionsUsed });
      return { success: true };
    } catch (err) {
      console.error("Demo login error:", err);
      return { success: false, message: err.message };
    }
  };

  // 3. API Key Management
  const updateApiKey = (key) => {
    setApiKey(key || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    localStorage.setItem("promptforge_apikey", key);
  };

  // 4. Usage limits (free tier)
  const getUsageStats = () => {
    const used = history.length;
    const max = FREE_TIER_LIMITS.maxWorkspaces;
    const isAtLimit = used >= max;
    const isNearLimit = used >= max - 1;
    return {
      used,
      max,
      isAtLimit,
      isNearLimit,
      percent: Math.min((used / max) * 100, 100),
    };
  };

  // 5. Prompt History CRUD Operations
  const savePromptRecord = async (record) => {
    setSaveStatus("saving");
    try {
      const isFirstBlueprint = history.length === 0;

      const newRecord = {
        id: record.id || Math.random().toString(36).substring(2, 9),
        mode: record.mode,
        title: record.title || "Untitled Prompt",
        query: record.query || "",
        theme: record.theme || activeTheme,
        resolvedPrompt: record.resolvedPrompt,
        chatMessages: record.chatMessages || [],
        ragDetails: record.ragDetails || null,
        timestamp: Date.now(),
        category: record.category || "",
        pageType: record.pageType || "",
        components: record.components || [],
        componentName: record.componentName || "",
        revisions: record.revisions || [], // Prompt version history revisions
        collection: record.collection || "", // Folder collection assignment
      };

      const updatedHistory = [newRecord, ...history];
      syncHistoryState(updatedHistory);

      // Sync to Supabase in background
      if (dbConnected && user) {
        await supabaseSavePrompt(user.username, newRecord);
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);

      // ── Aha moment — first ever blueprint
      if (isFirstBlueprint) {
        track(EVENTS.AHA_MOMENT_REACHED, { mode: record.mode });
        track(EVENTS.FIRST_BLUEPRINT_SUCCESS, { mode: record.mode });
        setShowFirstBlueprintSuccess(true);
        if (user && user.isDemo) {
          track(EVENTS.DEMO_COMPLETED);
        }
      }

      // Update blueprints this month in activity stats
      const blueprintsThisMonth = getBlueprintsThisMonth(updatedHistory);
      setActivityStats((prev) => ({ ...prev, blueprintsThisMonth }));

      track(EVENTS.PROMPT_GENERATED, {
        mode: record.mode,
        theme: record.theme,
      });
      return newRecord;
    } catch (err) {
      setSaveStatus("error");
      throw err;
    }
  };

  const updatePromptChat = async (
    id,
    chatMessages,
    updatedPrompt,
    updatedRagDetails,
  ) => {
    setSaveStatus("saving");
    try {
      let targetRecord = null;
      const updatedHistory = history.map((item) => {
        if (item.id === id) {
          // Push revision of previous resolvedPrompt if it was changed
          const revisions = item.revisions || [];
          const isPromptChanged = item.resolvedPrompt !== updatedPrompt;
          const updatedRevisions = isPromptChanged
            ? [
                ...revisions,
                {
                  timestamp: item.timestamp,
                  resolvedPrompt: item.resolvedPrompt,
                },
              ]
            : revisions;

          targetRecord = {
            ...item,
            chatMessages,
            resolvedPrompt: updatedPrompt,
            ragDetails: {
              ...(item.ragDetails || {}),
              ...(updatedRagDetails || {}),
            },
            timestamp: Date.now(),
            revisions: updatedRevisions,
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

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      throw err;
    }
  };

  const deletePromptRecord = async (id) => {
    const updatedHistory = history.filter((item) => item.id !== id);
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
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("promptforge_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const updatePromptCollection = async (id, collection) => {
    setSaveStatus("saving");
    try {
      let targetRecord = null;
      const updatedHistory = history.map((item) => {
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
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      toast.success(`Prompt moved to folder: ${collection || "Root"}`);
    } catch {
      setSaveStatus("error");
    }
  };

  const reloadVocabulary = async () => {
    try {
      setVocabLoading(true);
      setVocabError(false);
      const res = await fetch(apiUrl('/vocabulary'));
      if (res.ok) {
        const data = await res.json();
        const vocabData = data?.data ?? data;
        setVocabulary(vocabData);
        setVocabError(false);
        
        // Also reload global stats
        const statsRes = await fetch(apiUrl('/vocabulary/stats'));
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const statsVal = statsData?.data ?? statsData;
          setGlobalStats(statsVal);
        }
        return true;
      } else {
        setVocabError(true);
        return false;
      }
    } catch (e) {
      console.error("Failed to reload vocabulary:", e);
      setVocabError(true);
      return false;
    } finally {
      setVocabLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
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
        googleLogin,
        logout,
        checkVerificationStatus,
        resendVerification,
        changeEmailAddress,
        loginAsDemo,
        updateApiKey,
        setActiveTheme,
        savePromptRecord,
        updatePromptChat,
        deletePromptRecord,
        clearHistory,
        getUsageStats,
        updatePromptCollection,
        // ── Activity & Gamification
        activityStats,
        recordActivity,
        getBlueprintsThisMonth,
        // ── Aha Moment / First Blueprint
        showFirstBlueprintSuccess,
        dismissFirstBlueprintSuccess: () => setShowFirstBlueprintSuccess(false),
        // ── Dynamic vocabulary and global stats
        vocabulary,
        vocabLoading,
        vocabError,
        globalStats,
        reloadVocabulary,
        // ── Dynamic wizard configs & generation mode
        categories,
        templates,
        components,
        generationMode,
        setGenerationMode: (mode) => {
          setGenerationMode(mode);
          if (typeof window !== "undefined") {
            localStorage.setItem("promptforge_generation_mode", mode);
          }
        },
        drafts,
        discardDraft,
        starterTemplates,
        workspaceMetrics,

      }}
    >
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
