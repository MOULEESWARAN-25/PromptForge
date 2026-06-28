"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useSearchParams, useRouter } from "next/navigation";
import { BRAND } from "@/config/brand";
import { generateEnhancedPrompt } from "@/services/gemini";
import {
  Send,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Download,
  Share2,
  RotateCcw,
  Loader2,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { track, EVENTS } from "@/lib/analytics";
import FeedbackWidget from "@/components/FeedbackWidget";
import ShadcnDropdown from "@/components/ShadcnDropdown";

// Imported extracted subcomponents
import SaveStatusBadge from "@/components/chat/SaveStatusBadge";
import GeneratingLoader from "@/components/chat/GeneratingLoader";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { CONTENT } from "@/config/contentRegistry";

// ─── Smart Suggestions Helper ─────────────────────────────────
function getSmartSuggestions(record) {
  if (!record) return [];
  const text = `${record.title} ${record.query}`.toLowerCase();

  if (
    text.includes("commerce") ||
    text.includes("store") ||
    text.includes("shop") ||
    text.includes("checkout") ||
    text.includes("cart") ||
    text.includes("stripe")
  ) {
    return [
      {
        label: "Generate Stripe Integration Plan",
        prompt:
          "Extend this blueprint by adding a comprehensive Stripe Checkout & Webhook Integration Plan with payment flow details.",
      },
      {
        label: "Generate Checkout Flow Design",
        prompt:
          "Extend this blueprint with a detailed UX and component layout specification for a secure, 3-step checkout flow.",
      },
      {
        label: "Generate Product Catalog Schema",
        prompt:
          "Extend this blueprint with a PostgreSQL database schema definition for products, categories, inventory, and price models.",
      },
      {
        label: "Generate Admin Sales Dashboard",
        prompt:
          "Extend this blueprint with a visual dashboard layout for managing order fulfillment and inventory tracking.",
      },
    ];
  }

  if (
    text.includes("dash") ||
    text.includes("board") ||
    text.includes("panel") ||
    text.includes("analytic") ||
    text.includes("metric") ||
    text.includes("kpi") ||
    text.includes("chart")
  ) {
    return [
      {
        label: "Generate KPI Metric Cards Spec",
        prompt:
          "Extend this blueprint by detailing the exact grid layout, HSL alert colors, and spring hover animations for high-level KPI cards.",
      },
      {
        label: "Generate API Layout",
        prompt:
          "Extend this blueprint with a detailed REST and WebSockets API architecture proposal for real-time dashboard data feeds.",
      },
      {
        label: "Generate Real-Time Activity Log",
        prompt:
          "Extend this blueprint with a feed-style component spec for historical event auditing with collapsible trace logs.",
      },
      {
        label: "Generate Collapsible Navigation",
        prompt:
          "Extend this blueprint with a highly tactile, collapsible vertical sidebar navigation design system spec.",
      },
    ];
  }

  if (
    text.includes("login") ||
    text.includes("auth") ||
    text.includes("signup") ||
    text.includes("security")
  ) {
    return [
      {
        label: "Generate OTP Auth Flow Spec",
        prompt:
          "Extend this blueprint with a multi-step OTP authentication flow layout, auto-focus inputs, and spring validation checks.",
      },
      {
        label: "Generate OAuth Social Credentials",
        prompt:
          "Extend this blueprint by describing layout grids and HSL color designs for Google, GitHub, and Apple login buttons.",
      },
      {
        label: "Generate Session Management rules",
        prompt:
          "Extend this blueprint with precise security controls, cookie configurations, and auth middleware rules.",
      },
    ];
  }

  return [
    {
      label: "Generate Database Schema",
      prompt:
        "Extend this blueprint by compiling a production-grade relational SQL database schema for core entities.",
    },
    {
      label: "Generate Component Tree",
      prompt:
        "Extend this blueprint by cataloging a complete structural directory structure and component tree hierarchy.",
    },
    {
      label: "Generate API Design",
      prompt:
        "Extend this blueprint with a highly structured REST API schema outlining request/response payloads.",
    },
    {
      label: "Generate Cursor Prompt rules",
      prompt:
        "Transform this spec into a highly descriptive `.cursorrules` system instruction file for immediate IDE use.",
    },
  ];
}

// ─── LastEditedBadge (hydration-safe) ─────────────────────────
function LastEditedBadge({ timestamp }) {
  const relativeTime = useRelativeTime(timestamp);
  if (!timestamp) return null;
  return (
    <span className="text-[11px] text-muted-foreground bg-muted border border-border rounded px-2 py-0.5 font-mono shrink-0">
      {relativeTime}
    </span>
  );
}

// ─── Main Chat Content ────────────────────────────────────────
function ChatContent() {
  const { user, history, updatePromptChat, apiKey, saveStatus, vocabulary } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  // Deterministic relative time via shared hook (resolves hydration warnings)
  const promptId = searchParams.get("id");

  const [promptRecord, setPromptRecord] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (promptId && history.length > 0) {
      const record = history.find((h) => h.id === promptId);
      if (record) {
        setPromptRecord(record);
        setChatMessages(record.chatMessages);
        let rawPrompt = record.resolvedPrompt;
        let promptMatch = rawPrompt.match(/```prompt\n([\s\S]*?)\n```/);
        setCurrentPrompt(promptMatch ? promptMatch[1] : rawPrompt);
      } else {
        router.push("/dashboard");
      }
    }
  }, [promptId, history, user, router]);

  const handleSendMessage = useCallback(async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isGenerating || !promptRecord) return;
    const userMessage = chatInput;
    setChatInput("");
    setIsGenerating(true);
    const updatedMessages = [
      ...chatMessages,
      { role: "user", content: userMessage },
    ];
    setChatMessages(updatedMessages);
    try {
      const apiHistory = updatedMessages.slice(0, -1);
      const response = await generateEnhancedPrompt({
        mode: promptRecord.mode,
        query: userMessage,
        theme: promptRecord.theme,
        category: promptRecord.category,
        pageType: promptRecord.pageType,
        components: promptRecord.components,
        componentName: promptRecord.componentName,
        history: apiHistory,
        apiKey,
        modelProvider: promptRecord.ragDetails?.modelProvider || "gemini",
        vocabulary,
      });
      const finalMessages = [
        ...updatedMessages,
        { role: "model", content: response.prompt },
      ];
      setChatMessages(finalMessages);
      let promptMatch = response.prompt.match(/```prompt\n([\s\S]*?)\n```/);
      setCurrentPrompt(promptMatch ? promptMatch[1] : response.prompt);
      updatePromptChat(
        promptRecord.id,
        finalMessages,
        response.prompt,
        response.ragDetails,
      );
      track(EVENTS.PROMPT_REFINED, { mode: promptRecord.mode });
    } catch (err) {
      console.error(err);
      toast.error("Refinement failed", {
        description:
          "We couldn't process your refinement. Your current prompt is safe.",
        action: {
          label: "Try again",
          onClick: () => {
            setChatInput(userMessage);
          },
        },
      });
    } finally {
      setIsGenerating(false);
    }
  }, [chatInput, isGenerating, promptRecord, chatMessages, apiKey, vocabulary, updatePromptChat]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (chatInput.trim() && !isGenerating) {
          handleSendMessage(e);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [chatInput, isGenerating, handleSendMessage]);

  const handleRegenerate = async () => {
    if (!promptRecord || isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await generateEnhancedPrompt({
        mode: promptRecord.mode,
        query: promptRecord.query,
        theme: promptRecord.theme,
        category: promptRecord.category,
        pageType: promptRecord.pageType,
        components: promptRecord.components,
        apiKey,
        modelProvider: promptRecord.ragDetails?.modelProvider || "gemini",
        vocabulary,
      });
      const regenMessages = [
        ...chatMessages,
        { role: "user", content: "[Regenerated]" },
        { role: "model", content: response.prompt },
      ];
      setChatMessages(regenMessages);
      let promptMatch = response.prompt.match(/```prompt\n([\s\S]*?)\n```/);
      setCurrentPrompt(promptMatch ? promptMatch[1] : response.prompt);
      updatePromptChat(
        promptRecord.id,
        regenMessages,
        response.prompt,
        response.ragDetails,
      );
      toast.success("Prompt regenerated!");
      track(EVENTS.PROMPT_REGENERATED, { mode: promptRecord.mode });
    } catch (err) {
      toast.error("Regeneration failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    try {
      localStorage.setItem("pf_has_copied_prompt", "true");
      window.dispatchEvent(new Event("storage"));
    } catch {}
    track(EVENTS.PROMPT_COPIED, { source: "chat" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format) => {
    const content =
      format === "md"
        ? `# ${promptRecord?.title}\n\n${currentPrompt}`
        : currentPrompt;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(promptRecord?.title || "prompt").replace(/\s+/g, "-")}.${format === "md" ? "md" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as .${format === "md" ? "md" : "txt"}`);
    track(
      format === "md" ? EVENTS.PROMPT_EXPORTED_MD : EVENTS.PROMPT_EXPORTED_TXT,
    );
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied! Share it with anyone.");
    track(EVENTS.PROMPT_SHARED);
  };

  if (!promptRecord) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground min-h-[400px]">
        <Loader2
          size={24}
          strokeWidth={1.75}
          className="animate-spin text-accent"
        />
        <span>Loading workspace…</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-[calc(100dvh-140px)] min-h-[600px] pt-1 pb-3 w-full max-w-[1280px] mx-auto px-6 relative z-10 ${
        promptRecord.theme === "Wes Anderson"
          ? "theme-wes-anderson"
          : promptRecord.theme === "Cyberpunk Neon"
            ? "theme-cyberpunk"
            : promptRecord.theme === "Brutalist Bold"
              ? "theme-brutalist"
              : promptRecord.theme === "Minimalist Typography"
                ? "theme-minimal"
                : ""
      }`}
    >
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)] glass-panel">
        {/* HEADER */}
        <div className="p-4 md:px-6 border-b border-border flex justify-between items-center flex-wrap gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <motion.button
              className="bg-muted border border-border rounded-[7px] text-foreground text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 font-sans transition-all duration-200 w-fit"
              onClick={() => router.back()}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.96 }}
            >
              <ArrowLeft size={12} strokeWidth={1.75} /> Back
            </motion.button>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold font-display text-foreground tracking-tight m-0">{promptRecord.title}</h2>
              <span className="text-[11px] font-semibold text-accent bg-accent/8 border border-accent/20 rounded-full px-2 py-0.5">{promptRecord.theme}</span>
              <SaveStatusBadge status={saveStatus} />
              {/* Last edited indicator — persistence signal (hydration-safe) */}
              <LastEditedBadge timestamp={promptRecord.timestamp} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Regenerate */}
            <motion.button
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer bg-muted border border-border text-foreground text-xs font-semibold font-sans transition-all duration-200 h-[34px] whitespace-nowrap"
              disabled={isGenerating}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Regenerate prompt with same parameters"
            >
              <RotateCcw size={13} strokeWidth={1.75} />
              <span className="text-xs">Regenerate</span>
            </motion.button>

            {/* Export MD */}
            <motion.button
              onClick={() => handleExport("md")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer bg-muted border border-border text-foreground text-xs font-semibold font-sans transition-all duration-200 h-[34px] whitespace-nowrap"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Export as Markdown"
            >
              <Download size={13} strokeWidth={1.75} />
              <span className="text-xs">.md</span>
            </motion.button>

            {/* Export TXT */}
            <motion.button
              onClick={() => handleExport("txt")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer bg-muted border border-border text-foreground text-xs font-semibold font-sans transition-all duration-200 h-[34px] whitespace-nowrap"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Export as plain text"
            >
              <Download size={13} strokeWidth={1.75} />
              <span className="text-xs">.txt</span>
            </motion.button>

            {/* Share */}
            <motion.button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer bg-muted border border-border text-foreground text-xs font-semibold font-sans transition-all duration-200 h-[34px] whitespace-nowrap"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Copy share link"
            >
              <Share2 size={13} strokeWidth={1.75} />
              <span className="text-xs">Share</span>
            </motion.button>

            {/* Copy */}
            <motion.button
              onClick={handleCopy}
              className="px-4 py-2 text-xs h-[36px] rounded-lg inline-flex items-center justify-center gap-1.5 font-semibold btn-accent shine-effect"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {copied ? (
                <Check size={14} strokeWidth={1.75} />
              ) : (
                <Copy size={14} strokeWidth={1.75} />
              )}
              {copied ? "Copied!" : "Copy Prompt"}
            </motion.button>
          </div>
        </div>

        {/* PROMPT BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-background relative">
          {isGenerating ? (
            <GeneratingLoader />
          ) : (
            <div className="font-sans whitespace-normal w-full">
              {/* Revision History Dropdown */}
              {promptRecord?.revisions && promptRecord.revisions.length > 0 && (
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 mb-4 w-fit">
                  <History size={12} strokeWidth={1.75} className="text-accent" />
                  <span className="text-xs font-bold text-muted-foreground">Revision History:</span>
                  <ShadcnDropdown
                    value={currentPrompt}
                    onChange={(val) => {
                      setCurrentPrompt(val);
                      toast.success("Restored prompt version!");
                      track("prompt_revision_restored", {
                        id: promptRecord.id,
                      });
                    }}
                    options={[
                      {
                        label: `Latest Revision (Revision ${promptRecord.revisions.length + 1})`,
                        value: promptRecord.resolvedPrompt,
                      },
                      ...promptRecord.revisions.map((rev, index) => ({
                        label: `Revision ${index + 1} (${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(rev.timestamp))})`,
                        value: rev.resolvedPrompt,
                      })),
                    ]}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      fontWeight: "700",
                      color: "var(--foreground)",
                      fontSize: "0.75rem",
                      fontFamily: "var(--font-sans)",
                      minWidth: "150px",
                    }}
                  />
                </div>
              )}

              <MarkdownRenderer text={currentPrompt} />

              {/* Smart Suggested Next Steps */}
              {!isGenerating && (
                <div className="mt-6 mb-4 p-5 rounded-xl bg-muted border border-border glass-panel animate-fade-up">
                  <div className="flex items-center gap-2 mb-3.5">
                    <Sparkles size={13} strokeWidth={1.75} className="text-accent" />
                    <span className="text-sm font-bold text-foreground font-display tracking-wide">
                      Suggested Next Steps
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {getSmartSuggestions(promptRecord).map(
                      (suggestion, idx) => (
                        <motion.button
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-card border border-border rounded-lg text-xs font-semibold text-foreground cursor-pointer text-left transition-all duration-200 hover:border-accent hover:bg-muted"
                          onClick={() => {
                            setChatInput(suggestion.prompt);
                            track("smart_suggestion_clicked", {
                              label: suggestion.label,
                            });
                            setTimeout(() => {
                              const btn = document.querySelector(
                                'form button[type="submit"]',
                              );
                              if (btn) btn.click();
                            }, 100);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {suggestion.label} →
                        </motion.button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Embedded User Feedback Loop */}
              {!isGenerating && <FeedbackWidget contextId={promptRecord.id} />}
            </div>
          )}
        </div>

        {/* CHAT INPUT */}
        <form
          onSubmit={handleSendMessage}
          className={`p-4 md:px-6 border-t flex items-center gap-3 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] safe-bottom ${
            inputFocused
              ? "border-accent shadow-[0_-4px_24px_rgba(104,67,236,0.08)]"
              : "border-border"
          }`}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border shrink-0">
            <Sparkles size={16} strokeWidth={1.75} className="text-accent" />
          </div>
          <input
            type="text"
            placeholder="Refine your prompt… (Ctrl+Enter to send)"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            className="flex-1 glass-input"
            disabled={isGenerating}
            aria-label="Prompt refinement input"
          />
          <motion.button
            type="submit"
            className="h-[38px] w-[38px] rounded-lg p-0 shrink-0 inline-flex items-center justify-center btn-accent shine-effect"
            disabled={isGenerating || !chatInput.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} strokeWidth={1.75} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground min-h-[400px]">
          <Loader2
            size={24}
            strokeWidth={1.75}
            className="animate-spin text-accent"
          />
          <span>Loading workspace…</span>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
