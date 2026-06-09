"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  testDatabaseConnectivity,
  supabaseFetchHistory,
  supabaseSavePrompt,
  supabaseDeletePrompt,
} from "../services/supabase";
import { track, EVENTS } from "../lib/analytics";
import { FREE_TIER_LIMITS } from "../styles/tokens";
import { toast } from "sonner";
import { auth, googleProvider } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendEmailVerification,
  onAuthStateChanged
} from "firebase/auth";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
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

  // Helper to establish server session via Next.js API Route
  const establishSession = async (firebaseUser, onboardingDetails = {}) => {
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
  };

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

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // Fetch vocabulary dynamically
      try {
        setVocabLoading(true);
        const res = await fetch(`${backendUrl}/api/vocabulary`);
        if (res.ok) {
          const data = await res.json();
          setVocabulary(data);
          setVocabError(false);
        } else {
          setVocabError(true);
        }
      } catch (e) {
        console.error("Failed to fetch vocabulary from backend:", e);
        setVocabError(true);
      } finally {
        setVocabLoading(false);
      }

      // Fetch global statistics
      try {
        const res = await fetch(`${backendUrl}/api/vocabulary/stats`);
        if (res.ok) {
          const data = await res.json();
          setGlobalStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch global statistics:", e);
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
          console.warn("Failed to fetch mock user profile:", e);
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
            console.warn("Failed to fetch session profile:", e);
          }

          // If no active session was returned, attempt to establish it automatically
          if (!sessionActive) {
            console.log("Session not active or expired, establishing session automatically...");
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
              console.error("Failed to auto-establish session, signing out:", sessionResult.message);
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
          console.warn("Failed to fetch backend demo session:", e);
        }

        setUser(null);
        loadLocalHistory();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync verification status automatically when tab becomes active or visibility change occurs
  useEffect(() => {
    if (!user || user.emailVerified) return;

    let fallbackInterval;

    const syncStatus = () => {
      console.log("Window/Visibility focus change - checking verification status...");
      checkVerificationStatus();
    };

    // 1. Focus listener
    window.addEventListener("focus", syncStatus);

    // 2. Visibility change listener
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        syncStatus();
      }
    });

    // 3. Low-frequency fallback polling (every 45 seconds)
    fallbackInterval = setInterval(() => {
      console.log("Fallback verification check running...");
      checkVerificationStatus();
    }, 45000);

    return () => {
      window.removeEventListener("focus", syncStatus);
      document.removeEventListener("visibilitychange", syncStatus);
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [user]);

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
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
    setUser(null);
    localStorage.removeItem("promptforge_session");
    localStorage.removeItem("promptforge_session_mock");
    track(EVENTS.USER_LOGGED_OUT);
  };

  const checkVerificationStatus = async () => {
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
      setVocabLoading(true);
      setVocabError(false);
      const res = await fetch(`${backendUrl}/api/vocabulary`);
      if (res.ok) {
        const data = await res.json();
        setVocabulary(data);
        setVocabError(false);
        
        // Also reload global stats
        const statsRes = await fetch(`${backendUrl}/api/vocabulary/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setGlobalStats(statsData);
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
