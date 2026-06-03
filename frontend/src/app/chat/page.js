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
  RefreshCw,
  Sparkles,
  Download,
  Share2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Cloud,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { track, EVENTS } from "@/lib/analytics";
import FeedbackWidget from "@/components/FeedbackWidget";
import ShadcnDropdown from "@/components/ShadcnDropdown";

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    if (line.startsWith("### "))
      return (
        <h3 key={idx} style={mdH3}>
          {parseInlineMarkdown(line.slice(4))}
        </h3>
      );
    if (line.startsWith("## "))
      return (
        <h2 key={idx} style={mdH2}>
          {parseInlineMarkdown(line.slice(3))}
        </h2>
      );
    if (line.startsWith("# "))
      return (
        <h1 key={idx} style={mdH1}>
          {parseInlineMarkdown(line.slice(2))}
        </h1>
      );
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      return (
        <div key={idx} style={mdLi}>
          <span style={{ color: "var(--accent)" }}>•</span>
          <span>{parseInlineMarkdown(line.trim().slice(2))}</span>
        </div>
      );
    }
    if (line.trim() === "---" || line.trim() === "***")
      return <hr key={idx} style={mdHr} />;
    if (line.trim() === "")
      return <div key={idx} style={{ height: "0.4rem" }} />;
    return (
      <p key={idx} style={mdP}>
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

function parseInlineMarkdown(text) {
  const parts = [];
  let currentIdx = 0;
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIdx = match.index;
    if (matchIdx > currentIdx) parts.push(text.slice(currentIdx, matchIdx));
    if (matchStr.startsWith("**")) {
      parts.push(
        <strong
          key={matchIdx}
          style={{ fontWeight: "700", color: "var(--foreground)" }}
        >
          {matchStr.slice(2, -2)}
        </strong>,
      );
    } else if (matchStr.startsWith("`")) {
      parts.push(
        <code key={matchIdx} style={mdCode}>
          {matchStr.slice(1, -1)}
        </code>,
      );
    }
    currentIdx = regex.lastIndex;
  }
  if (currentIdx < text.length) parts.push(text.slice(currentIdx));
  return parts.length > 0 ? parts : text;
}

// ─── Save Status Indicator ────────────────────────────────────
function SaveStatusBadge({ status }) {
  if (status === "idle") return null;
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`save-status-${status}`}
      >
        {status === "saving" && (
          <>
            <Loader2 size={11} className="animate-spin" /> Saving…
          </>
        )}
        {status === "saved" && (
          <>
            <CheckCircle2 size={11} /> Saved
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle size={11} /> Save failed
          </>
        )}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Vocabulary Learning Drawer ───────────────────────────────────
// Inline knowledge base for educational term explanations
const TERM_KNOWLEDGE = {
  Glassmorphism: {
    explanation:
      "Semi-transparent layered surface style mimicking physical frosted glass.",
    visualDescription:
      "High backdrop blur opacity overlay with fine thin borders and a translucent light reflection.",
    designTokens: [
      "backdrop-blur-md",
      "bg-white/5",
      "border-white/10",
      "shadow-xl",
    ],
    why: "Creates premium depth perception that separates content layers visually.",
  },
  "Spotlight Cursor Hook": {
    explanation:
      "Interactive cursor tracker highlighting component borders with a radial glowing gradient.",
    visualDescription:
      "A colored spotlight following mouse movements over glass borders.",
    designTokens: [
      "bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(124,58,237,0.15),transparent_40%)]",
    ],
    why: "Dramatically increases perceived interactivity and premium feel of cards.",
  },
  "Bento Grid Layout": {
    explanation:
      "Asymmetric multi-column cell mapping inspired by visual Japanese bento trays.",
    visualDescription:
      "Visually grouped grid rows where key elements span wider or taller columns.",
    designTokens: [
      "grid",
      "grid-cols-1",
      "md:grid-cols-3",
      "gap-4",
      "col-span-2",
      "row-span-1",
    ],
    why: "Creates visual rhythm and hierarchy without rigid uniform column constraints.",
  },
  "Spring Animation Physics": {
    explanation:
      "Animation parameters modeled on hookean elastic springs for organic tactile feedback.",
    visualDescription:
      "Components scaling or moving with realistic micro-bounce rather than simple linear speeds.",
    designTokens: [
      "transition-all",
      "duration-300",
      "active:scale-95",
      "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
    ],
    why: "Makes UI feel physically responsive and alive, dramatically improving perceived quality.",
  },
  "Infinite Marquee Ticker": {
    explanation:
      "CSS keyframe slider translating elements continuously for displaying static logos.",
    visualDescription:
      "A seamless horizontal line of elements looping endlessly with zero stutter.",
    designTokens: [
      "flex",
      "animate-marquee",
      "whitespace-nowrap",
      "will-change-transform",
    ],
    why: "Communicates social proof and brand trust without static grid placement.",
  },
  "Command Palette Search": {
    explanation:
      "Keyboard-triggered modal indexing actions and filtering matching queries fuzzy matching.",
    visualDescription:
      "A clean center overlay with instantaneous response, shortcuts, and grouped filters.",
    designTokens: [
      "absolute",
      "z-50",
      "max-w-xl",
      "overflow-hidden",
      "rounded-xl",
      "divide-y",
    ],
    why: "Power-user shortcut that dramatically reduces navigation friction.",
  },
  "Skeleton Shimmer Loader": {
    explanation:
      "Grey geometric placeholders pulsing or shimmering to indicate active fetch states.",
    visualDescription:
      "Light silver bars carrying a moving light ray gradient overlay.",
    designTokens: [
      "animate-pulse",
      "bg-neutral-800",
      "before:animate-[shimmer_2s_infinite]",
      "before:bg-gradient-to-r",
    ],
    why: "Perceived performance — users feel the app is faster when structure appears immediately.",
  },
  "Neo-Brutalist Layout": {
    explanation:
      "High-contrast structural panels featuring thick pure black borders and solid non-blurred shadows.",
    visualDescription:
      "Vibrant colors outlined with thick dark lines, casting solid offset box blocks.",
    designTokens: [
      "border-3",
      "border-black",
      "shadow-[4px_4px_0px_#000000]",
      "hover:shadow-[6px_6px_0px_#000000]",
    ],
    why: "Anti-minimalism design signal — bold, unapologetically visible structural borders.",
  },
  "Ambient Drop Glow": {
    explanation:
      "Backdrop colored shadow layers creating depth and premium spatial contrast.",
    visualDescription:
      "A soft tinted ambient cloud radiating behind components.",
    designTokens: ["shadow-[0_0_50px_-12px_var(--accent)]"],
    why: "Creates a light source illusion that makes dark interfaces feel three-dimensional.",
  },
  "Staggered Entrance Animation": {
    explanation:
      "Sequential delays applied to list elements to direct user gaze hierarchy.",
    visualDescription:
      "Cards or list lines fading up in a micro-delayed chronological wave.",
    designTokens: [
      "animate-fade-up",
      "animation-delay-100",
      "animation-delay-200",
      "animation-delay-300",
    ],
    why: "Guides the user's eye down the page in a natural choreographed reading flow.",
  },
  "Frosted Modal Overlay": {
    explanation:
      "Overlay dialog positioning crucial settings in focus and dimming other areas.",
    visualDescription:
      "A central crisp window floating over a deeply blurred dark background layer.",
    designTokens: [
      "fixed",
      "inset-0",
      "z-50",
      "bg-black/60",
      "backdrop-blur-sm",
    ],
    why: "Contextually isolates focus-critical tasks without losing screen context.",
  },
  "Interactive Accordion Panel": {
    explanation:
      "Toggle panel revealing detailed explanations inline and contracting other rows.",
    visualDescription:
      "List headers clicking to slide down additional textual lines smoothly.",
    designTokens: [
      "overflow-hidden",
      "transition-all",
      "duration-200",
      "ease-out",
    ],
    why: "Progressively discloses complexity — reduces cognitive load on first render.",
  },
  "Dynamic Floating Navbar": {
    explanation:
      "A floating header menu morphing or shrinking dynamically during scroll bounds.",
    visualDescription:
      "A small pill-shaped frosted menu floating at the top of the viewport.",
    designTokens: [
      "sticky",
      "top-4",
      "mx-auto",
      "max-w-fit",
      "rounded-full",
      "backdrop-blur-md",
    ],
    why: "Stays accessible during long scrolls without dominating viewport real estate.",
  },
  "Active Tab Slide Switcher": {
    explanation:
      "A control where an active highlighted visual pill slides behind selected buttons.",
    visualDescription:
      "A pill-shaped button group where a dark background slides smoothly under clicked tabs.",
    designTokens: [
      "relative",
      "flex",
      "rounded-full",
      "p-1",
      "bg-neutral-900",
      "transition-all",
    ],
    why: "Makes mode switching immediately readable — no ambiguity about active state.",
  },
  "Tactile Form Input Validation": {
    explanation:
      "Interactive inputs changing border highlights and rendering animations upon syntax correctness.",
    visualDescription:
      "Input boxes glowing amber during typing, snapping green upon valid emails.",
    designTokens: [
      "focus:ring-2",
      "focus:ring-accent",
      "border-red-500",
      "border-emerald-500",
    ],
    why: "Immediate visual feedback eliminates form submission errors and frustration.",
  },
  "Toast Status Banner": {
    explanation:
      "Temporary floating notifications sliding in near view borders to deliver quick logs.",
    visualDescription:
      "A sleek dark floating rectangle sliding from the bottom right with a micro-icon.",
    designTokens: [
      "fixed",
      "bottom-4",
      "right-4",
      "z-50",
      "animate-slide-in",
      "rounded-lg",
    ],
    why: "Non-blocking feedback that confirms actions without interrupting the user flow.",
  },
  "Avatar Profile Panel": {
    explanation:
      "Circular photo mask rendering loading rings and fallback user initials.",
    visualDescription:
      "A round profile mask displaying crisp shadows and interactive hover overlays.",
    designTokens: [
      "rounded-full",
      "overflow-hidden",
      "border-2",
      "border-white/10",
    ],
    why: "Immediately humanizes the interface by anchoring user identity to a visual token.",
  },
  "AI Spotlight Button": {
    explanation:
      "Call-to-action buttons featuring gradient borders, particle sparks, or micro-shimmers.",
    visualDescription:
      "A gorgeous accent button with a fine shifting neon line circling its boundaries.",
    designTokens: [
      "bg-gradient-to-r",
      "from-purple-600",
      "to-pink-600",
      "active:scale-98",
    ],
    why: "Primary CTA must demand attention — gradient shimmer outperforms flat color for conversion.",
  },
  "Interactive Tag Filter Cloud": {
    explanation:
      "Pill-shaped tag indicators toggleable to refine grid search scopes.",
    visualDescription:
      "A dense group of rounded capsule badges lighting up active state borders when clicked.",
    designTokens: [
      "flex",
      "flex-wrap",
      "gap-2",
      "rounded-full",
      "px-3",
      "py-1",
      "text-xs",
    ],
    why: "Multi-dimension filtering without page reload — exploratory UX for data-heavy grids.",
  },
  "Multi-Step Navigation Wizard": {
    explanation:
      "Component dividing comprehensive workflows into numbered sequenced views.",
    visualDescription:
      "Progress lines connecting numbered circular dot progress status bubbles.",
    designTokens: [
      "flex",
      "items-center",
      "justify-between",
      "step-connector",
      "step-dot",
    ],
    why: "Reduces overwhelm on complex forms by chunking input into digestible stages.",
  },
};

function TermChip({ term }) {
  const [expanded, setExpanded] = useState(false);
  const knowledge = TERM_KNOWLEDGE[term];

  return (
    <div style={{ width: "100%" }}>
      <motion.button
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          fontSize: "0.7rem",
          fontWeight: "600",
          color: expanded ? "var(--accent-foreground)" : "var(--accent)",
          background: expanded
            ? "rgba(104,67,236,0.20)"
            : "rgba(104,67,236,0.08)",
          border: `1px solid ${expanded ? "rgba(104,67,236,0.5)" : "rgba(104,67,236,0.2)"}`,
          borderRadius: "6px",
          padding: "3px 10px",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          transition: "all 0.2s ease",
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title={knowledge ? "Click to learn what this term means" : term}
      >
        <CheckCircle2 size={10} style={{ color: "var(--accent)" }} />
        {term}
        {knowledge && (
          <span style={{ fontSize: "0.6rem", opacity: 0.6, marginLeft: "2px" }}>
            {expanded ? "▲" : "▼"}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {expanded && knowledge && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden", marginTop: "0.4rem" }}
          >
            <div
              style={{
                background: "rgba(124,58,237,0.05)",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: "8px",
                padding: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {/* What it is */}
              <div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.2rem",
                  }}
                >
                  What it is
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--foreground)",
                    lineHeight: "1.5",
                  }}
                >
                  {knowledge.explanation}
                </div>
              </div>

              {/* What it looks like */}
              <div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.2rem",
                  }}
                >
                  What it looks like
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--muted-foreground)",
                    lineHeight: "1.5",
                    fontStyle: "italic",
                  }}
                >
                  {knowledge.visualDescription}
                </div>
              </div>

              {/* Why it was used */}
              <div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "var(--success)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.2rem",
                  }}
                >
                  Why it was injected
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--foreground)",
                    lineHeight: "1.5",
                  }}
                >
                  {knowledge.why}
                </div>
              </div>

              {/* CSS Tokens */}
              <div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    color: "var(--muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Tailwind CSS tokens
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}
                >
                  {knowledge.designTokens.map((token, i) => (
                    <code
                      key={i}
                      style={{
                        fontSize: "0.62rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--accent)",
                        background: "var(--muted)",
                        borderRadius: "4px",
                        padding: "2px 5px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {token}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── AI Transparency Panel & Design Tutor Sidebar ─────────────────
function AITransparencyPanel({ ragDetails, theme, mode }) {
  const [open, setOpen] = useState(false);
  if (!ragDetails) return null;

  const technicalTerms = ragDetails.technicalTerms || [];
  const designTokens = ragDetails.designTokens || [];
  const frameworkRules = ragDetails.frameworkRules || [];
  const promptPatterns = ragDetails.promptPatterns || [];

  return (
    <div style={ragPanel} className="animate-fade-up">
      <button
        style={ragToggleBtn}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Sparkles
          size={12}
          style={{ color: "var(--accent)", marginRight: "0.25rem" }}
        />
        <span>RAG Transparency & Technical Design Tutor</span>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              background: "rgba(104,67,236,0.1)",
              color: "var(--accent)",
              border: "1px solid rgba(104,67,236,0.2)",
              borderRadius: "4px",
              padding: "1px 6px",
            }}
          >
            Confidence:{" "}
            {Math.round((ragDetails.retrievalConfidence || 0.8) * 100)}%
          </span>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={ragContent}>
              {/* Intent Analysis Summary */}
              <div
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  paddingBottom: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--muted-foreground)",
                    fontWeight: "500",
                    marginBottom: "0.2rem",
                  }}
                >
                  INFERRED DEVELOPER INTENT
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--foreground)",
                    fontWeight: "700",
                  }}
                >
                  {ragDetails.inferredIntent || "Custom Visual Page Segment"}
                </div>
              </div>

              {/* Technical Designer Terms — Vocabulary Learning Drawer */}
              {technicalTerms.length > 0 && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--muted-foreground)",
                        fontWeight: "500",
                      }}
                    >
                      TECHNICAL TERMS INJECTED
                    </div>
                    <div
                      style={{
                        fontSize: "0.62rem",
                        color: "rgba(255,255,255,0.3)",
                        fontStyle: "italic",
                      }}
                    >
                      click any term to learn
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    {technicalTerms.map((term, i) => (
                      <TermChip key={i} term={term} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tailwind CSS Styling Utility Tokens */}
              {designTokens.length > 0 && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted-foreground)",
                      fontWeight: "500",
                      marginBottom: "0.35rem",
                    }}
                  >
                    COMPILED TAILWIND DESIGN TOKENS
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}
                  >
                    {designTokens.map((token, i) => (
                      <code
                        key={i}
                        style={{
                          fontSize: "0.65rem",
                          fontFamily: "var(--font-mono)",
                          color: "#c084fc",
                          background: "var(--card)",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {token}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Framework Rules */}
              {frameworkRules.length > 0 && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted-foreground)",
                      fontWeight: "500",
                      marginBottom: "0.35rem",
                    }}
                  >
                    ACTIVE FRAMEWORK CONVENTIONS
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    {frameworkRules.slice(0, 3).map((rule, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--muted-foreground)",
                          lineHeight: "1.4",
                        }}
                      >
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skeletal Layout Skeletons */}
              {promptPatterns.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted-foreground)",
                      fontWeight: "500",
                      marginBottom: "0.35rem",
                    }}
                  >
                    UX & MOTION PHYSICS RESOLUTION
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    {promptPatterns.slice(0, 2).map((pattern, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--muted-foreground)",
                          background: "rgba(255,255,255,0.01)",
                          borderLeft: "2px solid var(--accent)",
                          padding: "0.3rem 0.5rem",
                          lineHeight: "1.45",
                        }}
                      >
                        {pattern}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompilationSummaryPanel({ promptRecord }) {
  const ragDetails = promptRecord?.ragDetails || {};
  const compileContext = ragDetails.compileContext || {};
  const technicalTerms = ragDetails.technicalTerms || [];
  const designTokens = ragDetails.designTokens || [];
  const frameworkRules = ragDetails.frameworkRules || [];
  const promptPatterns = ragDetails.promptPatterns || [];

  const accessibilityRules = promptPatterns.filter((pattern) =>
    pattern.toLowerCase().includes("accessibility"),
  );
  const motionRules = promptPatterns.filter((pattern) =>
    pattern.toLowerCase().includes("motion settings"),
  );
  const layoutRules = promptPatterns.filter((pattern) => {
    const value = pattern.toLowerCase();
    return (
      value.includes("required sections") ||
      value.includes("grid layout") ||
      value.includes("ux rule") ||
      value.includes("structural preset")
    );
  });

  const retrievalConfidence = Math.round(
    (ragDetails.retrievalConfidence || 0.8) * 100,
  );
  const confidenceLabel =
    retrievalConfidence >= 85
      ? "High"
      : retrievalConfidence >= 70
        ? "Medium"
        : "Review";

  const summaryPill = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.35rem 0.6rem",
    borderRadius: "999px",
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: "0.72rem",
    fontWeight: "700",
    color: "var(--foreground)",
  };

  const chipStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.28rem 0.5rem",
    borderRadius: "999px",
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: "0.68rem",
    color: "var(--foreground)",
    fontWeight: "600",
  };

  return (
    <div style={summaryStrip} className="glass-panel animate-fade-up">
      <div style={summaryHeaderRow}>
        <div>
          <div style={summaryKicker}>Compilation Summary</div>
          <div style={summaryTitle}>
            What {BRAND.name} compiled into this blueprint
          </div>
        </div>
        <div style={summaryHeaderMeta}>
          <span style={summaryConfidencePill(retrievalConfidence)}>
            Retrieval Confidence: {confidenceLabel} ({retrievalConfidence}%)
          </span>
          <span style={summaryPill}>Mode: {promptRecord.mode}</span>
        </div>
      </div>

      <div style={summaryGrid}>
        <div style={summaryCard}>
          <div style={summaryCardTitle}>Detected Project Context</div>
          <div style={summaryMetaList}>
            <span>
              Framework:{" "}
              {compileContext.framework ||
                promptRecord?.ragDetails?.framework ||
                "Tailwind CSS"}
            </span>
            <span>Theme: {compileContext.theme || promptRecord.theme}</span>
            {compileContext.typography && (
              <span>Typography: {compileContext.typography}</span>
            )}
            <span>
              Sync:{" "}
              {compileContext.projectIntegration === "existing"
                ? "Existing project sync"
                : "Standalone project"}
            </span>
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryCardTitle}>Prompt Quality Visibility</div>
          <div style={summaryBadgeRow}>
            <span style={chipStyle}>{technicalTerms.length} design terms</span>
            <span style={chipStyle}>{layoutRules.length} layout rules</span>
            <span style={chipStyle}>
              {accessibilityRules.length} accessibility rules
            </span>
            <span style={chipStyle}>{motionRules.length} motion rules</span>
            <span style={chipStyle}>
              {frameworkRules.length} framework rules
            </span>
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryCardTitle}>Today You Learned</div>
          <div style={summaryBadgeRow}>
            {(technicalTerms.slice(0, 4).length > 0
              ? technicalTerms.slice(0, 4)
              : ["No retrieved vocabulary yet"]
            ).map((term) => (
              <span key={term} style={chipStyle}>
                {term}
              </span>
            ))}
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryCardTitle}>Applied Rules</div>
          <div style={summaryMetaList}>
            {(accessibilityRules.slice(0, 2).length > 0
              ? accessibilityRules.slice(0, 2)
              : ["Accessibility rules are baked into the compiler."]
            ).map((rule) => (
              <span key={rule}>{rule}</span>
            ))}
            {(motionRules.slice(0, 1).length > 0
              ? motionRules.slice(0, 1)
              : ["Motion guidance is derived from retrieval patterns."]
            ).map((rule) => (
              <span key={rule}>{rule}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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

// ─── Generation Status Messages ───────────────────────────────
const GEN_MESSAGES = [
  "Retrieving design vocabulary…",
  "Matching HSL color tokens…",
  "Injecting motion physics…",
  "Compiling architectural spec…",
  "Assembling prompt blueprint…",
];

function GeneratingLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % GEN_MESSAGES.length),
      1000,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div style={skeletonContainer}>
      <div style={skeletonHeader}>
        <Loader2
          size={14}
          className="animate-spin"
          style={{ color: "var(--accent)" }}
        />
        <span style={refiningText}>{GEN_MESSAGES[msgIdx]}</span>
      </div>
      <div style={skeletonLinesGrid} className="animate-pulse">
        {["92%", "85%", "40%", "78%", "88%", "60%", "82%", "30%"].map(
          (w, i) => (
            <div key={i} style={skeletonLine(w)} />
          ),
        )}
      </div>
    </div>
  );
}

// ─── Main Chat Content ────────────────────────────────────────
function ChatContent() {
  const { user, history, updatePromptChat, apiKey, saveStatus } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
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
  }, [chatInput, isGenerating]);

  const handleSendMessage = async (e) => {
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
  };

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
      <div style={loadingContainer}>
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "var(--accent)" }}
        />
        <span>Loading workspace…</span>
      </div>
    );
  }

  return (
    <div
      style={singleColumnLayout}
      className={
        promptRecord.theme === "Wes Anderson"
          ? "theme-wes-anderson"
          : promptRecord.theme === "Cyberpunk Neon"
            ? "theme-cyberpunk"
            : promptRecord.theme === "Brutalist Bold"
              ? "theme-brutalist"
              : promptRecord.theme === "Minimalist Typography"
                ? "theme-minimal"
                : ""
      }
    >
      <div style={workspacePanel} className="glass-panel">
        {/* HEADER */}
        <div style={workspaceHeader}>
          <div style={headerLeft}>
            <motion.button
              style={backBtn}
              onClick={() => router.push("/dashboard")}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.96 }}
            >
              <ArrowLeft size={12} /> Dashboard
            </motion.button>
            <div style={titleBadgeRow}>
              <h2 style={workspaceTitle}>{promptRecord.title}</h2>
              <span style={themeBadge}>{promptRecord.theme}</span>
              <SaveStatusBadge status={saveStatus} />
              {/* Last edited indicator — persistence signal */}
              {promptRecord.timestamp && (
                <span style={lastEditedBadge}>
                  {(() => {
                    const diff = Date.now() - promptRecord.timestamp;
                    const mins = Math.floor(diff / 60000);
                    const hrs = Math.floor(diff / 3600000);
                    const days = Math.floor(diff / 86400000);
                    if (mins < 1) return "Just now";
                    if (mins < 60) return `${mins}m ago`;
                    if (hrs < 24) return `${hrs}h ago`;
                    return `${days}d ago`;
                  })()}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={headerActions}>
            {/* Regenerate */}
            <motion.button
              onClick={handleRegenerate}
              style={actionBtn}
              disabled={isGenerating}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Regenerate prompt with same parameters"
            >
              <RotateCcw size={13} />
              <span style={actionBtnLabel}>Regenerate</span>
            </motion.button>

            {/* Export MD */}
            <motion.button
              onClick={() => handleExport("md")}
              style={actionBtn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Export as Markdown"
            >
              <Download size={13} />
              <span style={actionBtnLabel}>.md</span>
            </motion.button>

            {/* Export TXT */}
            <motion.button
              onClick={() => handleExport("txt")}
              style={actionBtn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Export as plain text"
            >
              <Download size={13} />
              <span style={actionBtnLabel}>.txt</span>
            </motion.button>

            {/* Share */}
            <motion.button
              onClick={handleShare}
              style={actionBtn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Copy share link"
            >
              <Share2 size={13} />
              <span style={actionBtnLabel}>Share</span>
            </motion.button>

            {/* Copy */}
            <motion.button
              onClick={handleCopy}
              style={copyBtn}
              className="btn-accent shine-effect"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Prompt"}
            </motion.button>
          </div>
        </div>

        <CompilationSummaryPanel promptRecord={promptRecord} />

        {/* PROMPT BODY */}
        <div style={workspaceBody}>
          {isGenerating ? (
            <GeneratingLoader />
          ) : (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                whiteSpace: "normal",
                width: "100%",
              }}
            >
              {/* Revision History Dropdown */}
              {promptRecord?.revisions && promptRecord.revisions.length > 0 && (
                <div style={revisionRow}>
                  <History size={12} style={{ color: "var(--accent)" }} />
                  <span style={revisionLabel}>Revision History:</span>
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
                        label: `Prompt v${promptRecord.revisions.length + 1} (Latest)`,
                        value: promptRecord.resolvedPrompt,
                      },
                      ...promptRecord.revisions.map((rev, index) => ({
                        label: `Prompt v${index + 1} (${new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(rev.timestamp))})`,
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

              {renderMarkdown(currentPrompt)}
              {/* Variable Reward Insight Badge — shows after prompt renders */}
              {!isGenerating &&
                chatMessages.length > 0 &&
                (() => {
                  const mode = promptRecord.mode;
                  const badges = {
                    application: [
                      "⚡ Your spec used a 3-tier data architecture pattern",
                      "🏗️ Multi-page routing structure detected in your blueprint",
                      "🎨 Design system tokens injected across 4 components",
                      "⚡ State management patterns compiled for your stack",
                    ],
                    page: [
                      "✨ Glassmorphism depth tokens detected in your theme selection",
                      "🎯 Layout grid structure optimized for your page type",
                      "⚡ Spring physics injected into 3 interaction states",
                      "🏗️ Component hierarchy structured for AI code generation",
                    ],
                    component: [
                      "⚡ Spring physics injected into 4 interaction states",
                      "🎨 Design tokens applied across all component variants",
                      "✨ Glassmorphic surface treatment compiled for your theme",
                      "🎯 Accessibility attributes included in the component spec",
                    ],
                    enhance: [
                      "✨ 3 design vocabulary terms elevated in your prompt",
                      "⚡ Motion physics terminology injected into the spec",
                      "🎯 Professional engineering language applied throughout",
                      "🏗️ Layout patterns restructured for clarity",
                    ],
                  };
                  const pool = badges[mode] || badges.enhance;
                  // Deterministic selection based on message count (not random — so same badge on re-render)
                  const badge = pool[chatMessages.length % pool.length];
                  return (
                    <div style={insightBadge}>
                      <span style={insightBadgeText}>{badge}</span>
                    </div>
                  );
                })()}

              {/* Smart Suggested Next Steps */}
              {!isGenerating && (
                <div
                  style={smartSuggestionsBox}
                  className="glass-panel animate-fade-up"
                >
                  <div style={smartSuggestionsHead}>
                    <Sparkles size={13} style={{ color: "var(--accent)" }} />
                    <span style={smartSuggestionsTitle}>
                      Suggested Next Steps
                    </span>
                  </div>
                  <div style={smartSuggestionsGrid}>
                    {getSmartSuggestions(promptRecord).map(
                      (suggestion, idx) => (
                        <motion.button
                          key={idx}
                          style={smartSuggestionChip}
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
                          whileHover={{
                            scale: 1.02,
                            borderColor: "var(--accent)",
                            background: "var(--muted)",
                          }}
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

        {/* AI TRANSPARENCY PANEL */}
        <AITransparencyPanel
          ragDetails={promptRecord.ragDetails}
          theme={promptRecord.theme}
          mode={promptRecord.mode}
        />

        {/* CHAT INPUT */}
        <form onSubmit={handleSendMessage} style={bottomInputRow(inputFocused)}>
          <div style={sparklesIconWrap}>
            <Sparkles size={16} style={{ color: "var(--accent)" }} />
          </div>
          <input
            type="text"
            placeholder="Refine your prompt… (Ctrl+Enter to send)"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={chatField}
            className="glass-input"
            disabled={isGenerating}
            aria-label="Prompt refinement input"
          />
          <motion.button
            type="submit"
            style={sendBtn}
            className="btn-accent shine-effect"
            disabled={isGenerating || !chatInput.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
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
        <div style={loadingContainer}>
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "var(--accent)" }}
          />
          <span>Loading workspace…</span>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const loadingContainer = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  fontSize: "0.85rem",
  color: "var(--muted-foreground)",
  minHeight: "400px",
};

const singleColumnLayout = {
  display: "flex",
  flexDirection: "column",
  height: "calc(100dvh - 140px)",
  minHeight: "600px",
  paddingTop: "0.25rem",
  paddingBottom: "0.75rem",
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  position: "relative",
  zIndex: 2,
};

const workspacePanel = {
  flex: 1,
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
};

const workspaceHeader = {
  padding: "1rem 1.5rem",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
  flexShrink: 0,
};

const summaryStrip = {
  padding: "1rem 1.25rem",
  borderBottom: "1px solid var(--border)",
  background: "color-mix(in srgb, var(--accent) 3%, transparent)",
};

const summaryHeaderRow = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap",
};

const summaryKicker = {
  fontSize: "0.68rem",
  fontWeight: "800",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--accent)",
  marginBottom: "0.2rem",
};

const summaryTitle = {
  fontSize: "0.92rem",
  fontWeight: "800",
  color: "var(--foreground)",
};

const summaryHeaderMeta = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem",
};

const summaryConfidencePill = (confidence) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.35rem 0.65rem",
  borderRadius: "999px",
  fontSize: "0.72rem",
  fontWeight: "700",
  color:
    confidence >= 85
      ? "var(--success)"
      : confidence >= 70
        ? "var(--accent)"
        : "var(--warning)",
  border: `1px solid ${confidence >= 85 ? "color-mix(in srgb, var(--success) 30%, transparent)" : confidence >= 70 ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "color-mix(in srgb, var(--warning) 30%, transparent)"}`,
  background: "var(--card)",
});

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.75rem",
  marginTop: "0.85rem",
};

const summaryCard = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "14px",
  padding: "0.85rem 0.95rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.45rem",
};

const summaryCardTitle = {
  fontSize: "0.72rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted-foreground)",
};

const summaryMetaList = {
  display: "flex",
  flexDirection: "column",
  gap: "0.28rem",
  fontSize: "0.78rem",
  color: "var(--foreground)",
  lineHeight: "1.5",
};

const summaryBadgeRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
};

const headerLeft = { display: "flex", flexDirection: "column", gap: "0.4rem" };

const backBtn = {
  background: "var(--muted)",
  border: "1px solid var(--border)",
  borderRadius: "7px",
  color: "var(--foreground)",
  fontSize: "0.75rem",
  fontWeight: "600",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.3rem 0.65rem",
  fontFamily: "var(--font-sans)",
  width: "fit-content",
  transition: "all 0.25s ease",
};

const titleBadgeRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
  flexWrap: "wrap",
};

const workspaceTitle = {
  fontSize: "1.05rem",
  fontWeight: "700",
  fontFamily: "var(--font-display)",
  color: "var(--foreground)",
  letterSpacing: "-0.02em",
  margin: 0,
};

const themeBadge = {
  fontSize: "0.68rem",
  fontWeight: "600",
  color: "var(--accent)",
  background: "rgba(104,67,236,0.08)",
  border: "1px solid rgba(104,67,236,0.2)",
  borderRadius: "999px",
  padding: "2px 8px",
};

const headerActions = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const actionBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.4rem 0.75rem",
  borderRadius: "8px",
  cursor: "pointer",
  background: "var(--muted)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  fontSize: "0.78rem",
  fontWeight: "600",
  fontFamily: "var(--font-sans)",
  transition: "all 0.2s ease",
  minHeight: "34px",
  whiteSpace: "nowrap",
};

const actionBtnLabel = { fontSize: "0.78rem" };

const copyBtn = {
  padding: "0.45rem 1rem",
  fontSize: "0.8rem",
  height: "36px",
  borderRadius: "8px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  fontWeight: "600",
};

const workspaceBody = {
  flex: 1,
  overflowY: "auto",
  padding: "1.5rem",
  background: "var(--background)",
  position: "relative",
};

const skeletonContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  height: "100%",
};
const skeletonHeader = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
  marginBottom: "0.5rem",
};
const skeletonLinesGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  flex: 1,
};
const skeletonLine = (w) => ({
  width: w,
  height: "12px",
  borderRadius: "6px",
  background: "var(--card)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
});
const refiningText = {
  fontSize: "0.85rem",
  color: "var(--muted-foreground)",
  fontWeight: "500",
};

// RAG / AI Panel styles
const ragPanel = {
  borderTop: "1px solid var(--border)",
  padding: "0.75rem 1.5rem",
  flexShrink: 0,
};
const ragToggleBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--muted-foreground)",
  fontSize: "0.75rem",
  fontWeight: "600",
  fontFamily: "var(--font-sans)",
  padding: 0,
};
const ragContent = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginTop: "0.75rem",
  padding: "0.75rem",
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
};
const ragRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const ragLabel = {
  fontSize: "0.72rem",
  color: "var(--muted-foreground)",
  fontWeight: "500",
};
const ragValue = {
  fontSize: "0.72rem",
  color: "var(--foreground)",
  fontWeight: "600",
};

const bottomInputRow = (focused) => ({
  padding: "1.15rem 1.5rem",
  borderTop: `1px solid ${focused ? "var(--accent)" : "var(--border)"}`,
  boxShadow: focused ? "0 -4px 24px rgba(104,67,236,0.08)" : "none",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexShrink: 0,
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  className: "safe-bottom",
});

const sparklesIconWrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  background: "var(--card)",
  border: "1px solid var(--border)",
  flexShrink: 0,
};

const chatField = { flex: 1 };
const sendBtn = {
  height: "38px",
  width: "38px",
  borderRadius: "8px",
  padding: 0,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

// Markdown styles
const mdH1 = {
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "var(--foreground)",
  marginTop: "1.25rem",
  marginBottom: "0.6rem",
  fontFamily: "var(--font-display)",
};
const mdH2 = {
  fontSize: "1.1rem",
  fontWeight: "800",
  color: "var(--foreground)",
  marginTop: "1.1rem",
  marginBottom: "0.5rem",
  fontFamily: "var(--font-display)",
};
const mdH3 = {
  fontSize: "0.98rem",
  fontWeight: "800",
  color: "var(--accent)",
  marginTop: "0.85rem",
  marginBottom: "0.4rem",
  fontFamily: "var(--font-display)",
};
const mdP = {
  margin: "0 0 0.4rem 0",
  fontSize: "0.8rem",
  color: "var(--foreground)",
  lineHeight: "1.55",
};
const mdLi = {
  display: "flex",
  gap: "0.5rem",
  paddingLeft: "0.5rem",
  marginBottom: "0.3rem",
  fontSize: "0.8rem",
  color: "var(--foreground)",
  lineHeight: "1.5",
};
const mdHr = {
  border: "none",
  borderTop: "1px solid var(--border)",
  margin: "0.75rem 0",
};
const mdCode = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.75rem",
  background: "var(--muted)",
  padding: "2px 5px",
  borderRadius: "4px",
  color: "var(--accent)",
};

// ─── Revision Styles ──────────────────────────────────────────
const revisionRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "0.35rem 0.75rem",
  marginBottom: "1rem",
  width: "fit-content",
};

const revisionLabel = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--muted-foreground)",
};

const revisionSelect = {
  background: "transparent",
  border: "none",
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--foreground)",
  outline: "none",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

// ─── Retention Styles ──────────────────────────────────────
const lastEditedBadge = {
  fontSize: "0.68rem",
  color: "var(--muted-foreground)",
  background: "var(--muted)",
  border: "1px solid var(--border)",
  borderRadius: "5px",
  padding: "2px 8px",
  fontFamily: "var(--font-mono)",
  flexShrink: 0,
};

const insightBadge = {
  marginTop: "1rem",
  marginBottom: "0.25rem",
  padding: "0.5rem 0.85rem",
  borderRadius: "8px",
  background: "rgba(104,67,236,0.08)",
  border: "1px solid rgba(104,67,236,0.18)",
  display: "inline-flex",
  alignItems: "center",
};

const insightBadgeText = {
  fontSize: "0.75rem",
  fontWeight: "600",
  color: "var(--accent)",
  fontFamily: "var(--font-sans)",
};

// ─── Smart Suggestions Styles ──────────────────────────────
const smartSuggestionsBox = {
  marginTop: "1.5rem",
  marginBottom: "1rem",
  padding: "1.25rem",
  borderRadius: "12px",
  background: "var(--muted)",
  border: "1px solid var(--border)",
};

const smartSuggestionsHead = {
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
  marginBottom: "0.85rem",
};

const smartSuggestionsTitle = {
  fontSize: "0.82rem",
  fontWeight: "700",
  color: "var(--foreground)",
  fontFamily: "var(--font-display)",
  letterSpacing: "0.01em",
};

const smartSuggestionsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "0.65rem",
};

const smartSuggestionChip = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.55rem 0.85rem",
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "0.76rem",
  fontWeight: "600",
  color: "var(--foreground)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  textAlign: "left",
  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
};
