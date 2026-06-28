"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
  Keyboard,
  Wifi,
  WifiOff,
  TrendingUp,
  Shield,
  Mail,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { track, EVENTS } from "../lib/analytics";
import { toast } from "sonner";
import { BRAND } from "../config/brand";
import { cn } from "@/lib/cn";
import { CONTENT } from "../config/contentRegistry";
import { KEYBOARD_SHORTCUTS } from "@/config/keyboardShortcuts";

export default function SettingsDrawer({ isOpen, onClose }) {
  const {
    user,
    theme,
    toggleTheme,
    dbConnected,
    logout,
    getUsageStats,
    generationMode,
    setGenerationMode,
  } = useApp();
  const router = useRouter();

  // Email notifications preferences states
  const [emailWelcome, setEmailWelcome] = useState(true);
  const [emailDraftRecovery, setEmailDraftRecovery] = useState(true);
  const [emailAnalytics, setEmailAnalytics] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!user) return null;

  const initials = user.username ? user.username.slice(0, 2).toUpperCase() : (user.email?.slice(0, 2).toUpperCase() || "PF");
  const isDark = theme === "dark";
  const usage = getUsageStats();

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace("/auth");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/45 backdrop-blur-[6px] z-1000 flex justify-end"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Account Settings"
        >
          <motion.div
            className="w-full max-w-[400px] h-screen bg-card border-l border-border shadow-[-8px_0_32px_rgba(0,0,0,0.4)] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Drawer Header */}
            <div className="p-[1.25rem_1.5rem] border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-[0.65rem]">
                <Settings size={18} className="text-accent" strokeWidth={1.75} />
                <h2 className="text-[1.05rem] font-bold font-display text-foreground tracking-tight m-0">{CONTENT.settings.title}</h2>
              </div>
              <motion.button
                className="bg-transparent border-none text-muted-foreground cursor-pointer p-1 rounded-[6px] flex items-center justify-center min-w-[32px] min-h-[32px] hover:bg-input transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close settings"
              >
                <X size={20} strokeWidth={1.75} />
              </motion.button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {/* ── Profile Card ── */}
              <div className="bg-card border border-border rounded-[12px] p-[1rem_1.1rem] flex flex-col gap-[0.65rem]">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-accent" strokeWidth={1.75} />
                  <span className="text-[0.84rem] font-bold text-foreground font-display">Profile</span>
                </div>
                <div className="flex items-center gap-[0.85rem] py-[0.1rem]">
                  <div className="w-10 h-10 rounded-full bg-accent text-white text-[0.85rem] font-bold flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="flex flex-col gap-[0.15rem]">
                    <span className="text-[0.92rem] font-bold text-foreground">{user.username || user.email}</span>
                    <span className="text-[0.76rem] text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Workspaces Compiled ── */}
              <div className="bg-card border border-border rounded-[12px] p-[1rem_1.1rem] flex flex-col gap-[0.65rem]">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-accent" strokeWidth={1.75} />
                  <span className="text-[0.84rem] font-bold text-foreground font-display">Workspaces</span>
                  <span className="ml-auto text-[0.72rem] text-muted-foreground font-semibold">
                    {usage.used} active
                  </span>
                </div>
                <p className="text-[0.8rem] text-muted-foreground leading-normal m-0">
                  You have compiled {usage.used} architecture blueprints. {BRAND.name}
                  is completely free, so build as many workspaces as you want!
                </p>
              </div>

              {/* ── Theme ── */}
              <div className="bg-card border border-border rounded-[12px] p-[1rem_1.1rem] flex flex-col gap-[0.65rem]">
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <Moon size={15} className="text-accent" strokeWidth={1.75} />
                  ) : (
                    <Sun size={15} className="text-accent" strokeWidth={1.75} />
                  )}
                  <span className="text-[0.84rem] font-bold text-foreground font-display">Appearance</span>
                </div>
                <button
                  className="flex items-center justify-between p-[0.6rem_0.8rem] rounded-[10px] cursor-pointer bg-input border border-border w-full font-sans transition-all duration-200"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  <div className="flex items-center gap-[0.6rem]">
                    {isDark ? (
                      <Moon size={16} className="text-accent" strokeWidth={1.75} />
                    ) : (
                      <Sun size={16} className="text-accent" strokeWidth={1.75} />
                    )}
                    <span className="text-[0.85rem] font-semibold text-foreground">
                      {isDark ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  <div className={cn("w-9 h-5 rounded-full bg-muted relative transition-colors duration-250 shrink-0", isDark ? "bg-accent" : "bg-muted")}>
                    <div className={cn("w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] left-[3px] transition-transform duration-200 ease-out shadow-[0_1px_3px_rgba(0,0,0,0.3)]", isDark ? "translate-x-[16px]" : "translate-x-0")} />
                  </div>
                </button>
              </div>

              {/* ── Generation Speed ── */}
              <div className="bg-card border border-border rounded-[12px] p-[1rem_1.1rem] flex flex-col gap-[0.65rem]">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-accent" strokeWidth={1.75} />
                  <span className="text-[0.84rem] font-bold text-foreground font-display">Generation Speed</span>
                </div>
                <p className="text-[0.76rem] text-muted-foreground leading-normal m-0 font-sans">
                  {generationMode === "fast" ? CONTENT.settings.modeFastDesc : CONTENT.settings.modeProDesc}
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    className={cn(
                      "flex-1 py-2 px-3 rounded-[8px] text-[0.8rem] font-semibold transition-all duration-200 border cursor-pointer",
                      generationMode === "fast"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-input text-foreground border-border hover:bg-muted"
                    )}
                    onClick={() => {
                      setGenerationMode("fast");
                      toast.success(`Generation speed mode set to ${CONTENT.settings.modeFastLabel}`);
                    }}
                  >
                    {CONTENT.settings.modeFastLabel}
                  </button>
                  <button
                    className={cn(
                      "flex-1 py-2 px-3 rounded-[8px] text-[0.8rem] font-semibold transition-all duration-200 border cursor-pointer",
                      generationMode === "professional"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-input text-foreground border-border hover:bg-muted"
                    )}
                    onClick={() => {
                      setGenerationMode("professional");
                      toast.success(`Generation speed mode set to ${CONTENT.settings.modeProLabel}`);
                    }}
                  >
                    {CONTENT.settings.modeProLabel}
                  </button>
                </div>
              </div>

              {/* ── Email Notification Settings (SaaS Retention Loops) ── */}
              <div className="bg-card border border-border rounded-[12px] p-[1rem_1.1rem] flex flex-col gap-[0.65rem]">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-accent" strokeWidth={1.75} />
                  <span className="text-[0.84rem] font-bold text-foreground font-display">Email Notifications</span>
                </div>
                <p className="text-[0.8rem] text-muted-foreground leading-normal m-0">
                  Customize lifecycle emails, recovery prompts and tips.
                </p>
                <div className="flex flex-col gap-[0.6rem] mt-2">
                  <button
                    className="flex items-center justify-between w-full bg-transparent border-none py-1.5 cursor-pointer text-left font-sans"
                    onClick={() => {
                      setEmailWelcome(!emailWelcome);
                      toast.success("Preference updated!");
                    }}
                  >
                    <span className="text-[0.78rem] text-foreground font-medium">
                      Welcome tips & guides
                    </span>
                    <div className={cn("w-9 h-5 rounded-full bg-muted relative transition-colors duration-250 shrink-0", emailWelcome ? "bg-accent" : "bg-muted")}>
                      <div className={cn("w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] left-[3px] transition-transform duration-200 ease-out shadow-[0_1px_3px_rgba(0,0,0,0.3)]", emailWelcome ? "translate-x-[16px]" : "translate-x-0")} />
                    </div>
                  </button>
                  <button
                    className="flex items-center justify-between w-full bg-transparent border-none py-1.5 cursor-pointer text-left font-sans"
                    onClick={() => {
                      setEmailDraftRecovery(!emailDraftRecovery);
                      toast.success("Preference updated!");
                    }}
                  >
                    <span className="text-[0.78rem] text-foreground font-medium">
                      Draft recovery reminders
                    </span>
                    <div className={cn("w-9 h-5 rounded-full bg-muted relative transition-colors duration-250 shrink-0", emailDraftRecovery ? "bg-accent" : "bg-muted")}>
                      <div className={cn("w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] left-[3px] transition-transform duration-200 ease-out shadow-[0_1px_3px_rgba(0,0,0,0.3)]", emailDraftRecovery ? "translate-x-[16px]" : "translate-x-0")} />
                    </div>
                  </button>
                  <button
                    className="flex items-center justify-between w-full bg-transparent border-none py-1.5 cursor-pointer text-left font-sans"
                    onClick={() => {
                      setEmailAnalytics(!emailAnalytics);
                      toast.success("Preference updated!");
                    }}
                  >
                    <span className="text-[0.78rem] text-foreground font-medium">
                      Weekly prompt summaries
                    </span>
                    <div className={cn("w-9 h-5 rounded-full bg-muted relative transition-colors duration-250 shrink-0", emailAnalytics ? "bg-accent" : "bg-muted")}>
                      <div className={cn("w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] left-[3px] transition-transform duration-200 ease-out shadow-[0_1px_3px_rgba(0,0,0,0.3)]", emailAnalytics ? "translate-x-[16px]" : "translate-x-0")} />
                    </div>
                  </button>
                </div>
              </div>

              {/* ── DB Status ── */}
              <div className="bg-card border border-border rounded-[12px] p-[1rem_1.1rem] flex flex-col gap-[0.65rem]">
                <div className="flex items-center gap-2">
                  {dbConnected ? (
                    <Wifi size={15} className="text-(--success)" strokeWidth={1.75} />
                  ) : (
                    <WifiOff size={15} className="text-muted-foreground" strokeWidth={1.75} />
                  )}
                  <span className="text-[0.84rem] font-bold text-foreground font-display">Sync Status</span>
                  <span className={cn("ml-auto text-[0.7rem] font-semibold", dbConnected ? "text-(--success)" : "text-muted-foreground")}>
                    {dbConnected ? "● Cloud Sync Active" : "○ Local Only"}
                  </span>
                </div>
                <p className="text-[0.8rem] text-muted-foreground leading-normal m-0">
                  {dbConnected
                    ? "Your prompts are synced to the cloud and accessible across devices."
                    : "Cloud unavailable. Prompts are saved locally on this device only."}
                </p>
              </div>

              {/* ── Keyboard Shortcuts ── */}
              <div className="bg-card border border-border rounded-[12px] p-[1rem_1.1rem] flex flex-col gap-[0.65rem]">
                <div className="flex items-center gap-2">
                  <Keyboard size={15} className="text-accent" strokeWidth={1.75} />
                  <span className="text-[0.84rem] font-bold text-foreground font-display">Keyboard Shortcuts</span>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {KEYBOARD_SHORTCUTS.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[0.8rem] text-muted-foreground">
                        {s.label}
                      </span>
                      <div className="flex gap-1">
                        {s.keys.map((k, j) => (
                          <kbd key={j} className="font-mono text-[0.65rem] padding-[2px_6px] bg-input border border-border rounded-[4px] text-foreground">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Security / Device Trust ── */}
              <div className="bg-card border border-border rounded-[12px] p-[1rem_1.1rem] flex flex-col gap-[0.65rem]">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-accent" strokeWidth={1.75} />
                  <span className="text-[0.84rem] font-bold text-foreground font-display">Security & Sessions</span>
                </div>
                <p className="text-[0.8rem] text-muted-foreground leading-normal m-0">
                  Manage active browser sessions and device authorizations.
                </p>
                <div className="flex flex-col gap-2.5 bg-input border border-border rounded-[8px] p-[0.65rem_0.75rem] mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-(--success) shrink-0" />
                    <div className="flex flex-col gap-px">
                      <span className="text-[0.78rem] font-bold text-foreground">
                        Chrome on Windows (Current)
                      </span>
                      <span className="text-[0.68rem] text-muted-foreground">
                        IP: 192.168.1.45 — Active now
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                    <div className="flex flex-col gap-px">
                      <span className="text-[0.78rem] font-bold text-foreground">
                        Safari on iPhone 16 Pro
                      </span>
                      <span className="text-[0.68rem] text-muted-foreground">
                        IP: 172.56.21.90 — 3 hours ago
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="inline-flex items-center justify-center p-[0.45rem_1rem] rounded-[8px] bg-transparent border border-border hover:bg-input text-foreground text-[0.76rem] font-bold cursor-pointer transition-all mt-2 w-full font-sans"
                  onClick={() => {
                    toast.success("Successfully signed out all other devices!");
                    track("other_sessions_terminated");
                  }}
                >
                  Sign out all other devices
                </button>
              </div>

              {/* ── Sign Out ── */}
              <button 
                className="flex items-center justify-center gap-2 p-[0.7rem_1rem] rounded-[10px] cursor-pointer bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-500 text-[0.85rem] font-bold font-sans transition-all duration-200 mt-2 hover:bg-red-500/20"
                onClick={handleLogout}
              >
                <LogOut size={15} strokeWidth={1.75} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
