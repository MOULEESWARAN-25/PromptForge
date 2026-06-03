"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Monitor,
  Code2,
  Wand2,
  Shield,
  Zap,
  Database,
  Check,
  Cpu,
  FileText,
  ArrowRightLeft,
  BookOpen,
  Layers,
  RefreshCw,
  Users,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  X,
  Copy,
  Sun,
  Moon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { designVocabulary } from "@/data/designVocabulary";
import { toast } from "sonner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP ScrollTrigger client-side only
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const getAccessibleColor = (color, isDark) => {
  if (isDark) {
    if (color === "var(--accent)") return "#6843EC";
    return color;
  }
  switch (color) {
    case "#D2FF3A":
      return "#15803d";
    case "#10b981":
      return "#16a34a";
    case "#0ea5e9":
      return "#0284c7";
    case "#a855f7":
      return "#7c3aed";
    case "var(--accent)":
      return "#6843EC";
    default:
      return color;
  }
};

// ─── Workspace Modes Config ──────────────────────────────────────
const WORKSPACE_TABS = [
  {
    id: "application",
    title: "Application Architect",
    desc: "Map out full-stack multi-page applications complete with folder setups, state routing, and mock configurations.",
    img: "/pages/dashboard_fresh.webp",
    tag: "Full-Stack Specs",
  },
  {
    id: "page",
    title: "Page Planner",
    desc: "Design individual layouts, bento dashboard grids, and visual typography spacing systems.",
    img: "/pages/forge_raw.webp",
    tag: "Layout Planner",
  },
  {
    id: "component",
    title: "Component Generator",
    desc: "Configure modular buttons, sheets, accordions, and dropdown select matrices optimized for modern component-compilers.",
    img: "/pages/chat_raw.webp",
    tag: "Interface Controls",
  },
  {
    id: "enhance",
    title: "Prompt Enhancer",
    desc: "Input draft prompts to semantically enrich them with advanced design vocabulary tokens and physics presets.",
    img: "/pages/vocabulary_raw.webp",
    tag: "Token Optimiser",
  },
];

const TAB_CAPTIONS = {
  application: "Full-Stack Setup: Guides selection of frontend/backend stacks, database options, serverless deployments, and secure auth session duration rules.",
  page: "Interface Mapping: Scaffolds design frameworks like bento layouts, spacing scales, typography setups, and responsive grid columns.",
  component: "Granular Controls: Configures button states, form matrices, accordions, and focus outline properties for maximum accessibility.",
  enhance: "Terminology Optimization: Takes basic input drafts and injects high-fidelity designer terms and HSL styling parameters automatically.",
};

// ─── Target Audience Config ──────────────────────────────────────
const AUDIENCES = [
  {
    title: "Cursor & Bolt Users",
    desc: "Feed AI compilers highly structured prompt models that build accurate layouts on the very first try.",
  },
  {
    title: "Indie Hackers",
    desc: "Ship production-ready SaaS landing pages and dashboard foundations with zero design debt.",
  },
  {
    title: "Frontend Engineers",
    desc: "Inject precise HSL design systems, spacing grids, and custom motion variables into codebase codebases.",
  },
  {
    title: "Students & Builders",
    desc: "Master advanced visual design jargon and semantic terms while engineering application blueprints.",
  },
];

export default function PremiumLandingPage() {
  const { theme, user, toggleTheme } = useApp();
  const isDark = theme === "dark";

  // Interactive Drawer & Tab States
  const [activeTab, setActiveTab] = useState("application");
  const [selectedToken, setSelectedToken] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // GSAP Animation Refs
  const heroRef = useRef(null);
  const translationRef = useRef(null);
  const beforeAfterRef = useRef(null);
  const proofRef = useRef(null);
  const moatRef = useRef(null);
  const workspaceRef = useRef(null);
  const syncRef = useRef(null);
  const vocRef = useRef(null);
  const addsRef = useRef(null);
  const targetRef = useRef(null);
  const ctaRef = useRef(null);
  const drawerRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  // Copy helper
  const handleCopy = (id, text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Prompt block copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard navigation & accessibility helpers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track drawer trigger element to restore focus on close
  useEffect(() => {
    if (drawerOpen) {
      lastActiveElementRef.current = document.activeElement;
    } else if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }
  }, [drawerOpen]);

  // Focus trap inside drawer
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]',
      );
      if (focusableElements.length > 0) {
        // Focus close button or first interactive element
        setTimeout(() => {
          focusableElements[0].focus();
        }, 50);
      }

      const handleTabKey = (e) => {
        if (e.key === "Tab") {
          const focusable = Array.from(focusableElements);
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener("keydown", handleTabKey);
      return () => window.removeEventListener("keydown", handleTabKey);
    }
  }, [drawerOpen]);

  // Arrow navigation for Workspace tabs
  const handleTabKeyDown = (e, index) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      const nextIndex = (index + 1) % WORKSPACE_TABS.length;
      setActiveTab(WORKSPACE_TABS[nextIndex].id);
      setTimeout(() => {
        const buttons = document.querySelectorAll(".workspace-tab-btn");
        if (buttons[nextIndex]) {
          buttons[nextIndex].focus();
        }
      }, 20);
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      const prevIndex =
        (index - 1 + WORKSPACE_TABS.length) % WORKSPACE_TABS.length;
      setActiveTab(WORKSPACE_TABS[prevIndex].id);
      setTimeout(() => {
        const buttons = document.querySelectorAll(".workspace-tab-btn");
        if (buttons[prevIndex]) {
          buttons[prevIndex].focus();
        }
      }, 20);
      e.preventDefault();
    }
  };

  // ─── GSAP ScrollTrigger Integration ───────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Hero Reveal Timeline
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .fromTo(
        ".hero-title-line",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
      )
      .fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4",
      )
      .fromTo(
        ".hero-stepper-item",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        "-=0.3",
      )
      .fromTo(
        ".hero-stepper-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, transformOrigin: "left center" },
        "-=0.6",
      )
      .fromTo(
        ".hero-cta-btn",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
        "-=0.4",
      )
      .fromTo(
        ".hero-visual-frame",
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        "-=0.5",
      );

    // 2. Section Reveals
    const sections = [
      { ref: translationRef, selector: ".anim-translation" },
      { ref: beforeAfterRef, selector: ".anim-beforeafter" },
      { ref: proofRef, selector: ".anim-proof" },
      { ref: moatRef, selector: ".anim-moat" },
      { ref: workspaceRef, selector: ".anim-workspace" },
      { ref: syncRef, selector: ".anim-sync" },
      { ref: vocRef, selector: ".anim-voc" },
      { ref: addsRef, selector: ".anim-adds" },
      { ref: targetRef, selector: ".anim-target" },
      { ref: ctaRef, selector: ".anim-cta" },
    ];

    sections.forEach(({ ref, selector }) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current.querySelectorAll(selector),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    });

    // 3. Translation Pipeline Conveyor Dot Animation
    let conveyorAnim = null;
    if (translationRef.current) {
      conveyorAnim = gsap.fromTo(
        ".pipeline-flow-dot",
        { left: "0%" },
        {
          left: "100%",
          duration: 3,
          repeat: -1,
          ease: "none",
        },
      );
    }

    return () => {
      heroTl.kill();
      if (conveyorAnim) conveyorAnim.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Design constants for Before / After Compare
  const rawInputCode = `"make a modern dashboard with dark visual glassmorphism cards and smooth spring physics motions."`;

  const structuredPromptOutput = `<!-- Compiled by PromptForge RAG Compiler v3.0 -->
<design_system>
  <theme>Sleek Dark Glassmorphic</theme>
  <tokens>
    <background>#0a0516</background>
    <card_bg>rgba(255, 255, 255, 0.05)</card_bg>
    <backdrop_blur>12px</backdrop_blur>
    <border>1px solid rgba(255, 255, 255, 0.1)</border>
    <accent>#6843EC</accent>
  </tokens>
  <layout>
    <grid>Bento Grid Layout (3x2 matrix, compact spacing)</grid>
  </layout>
  <motion_curves>
    <transition type="spring" stiffness={260} damping={20} />
  </motion_curves>
  <accessibility>
    <container role="region" aria-label="Metrics Dashboard" />
    <element tabIndex={0} skipLink={true} />
  </accessibility>
</design_system>`;

  return (
    <div style={containerStyle}>
      {/* ── STYLING AUDITS OVERRIDES (RESPONSIVENESS & ACCESSIBILITY) ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* General Accessibility Focus Rings */
        .btn-focus:focus-visible, .chip-focus:focus-visible {
          outline: 2px solid var(--accent) !important;
          outline-offset: 2px !important;
        }

        /* ── prefers-reduced-motion Support ── */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-delay: 0s !important;
            animation-duration: 0s !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0s !important;
            scroll-behavior: auto !important;
            transform: none !important;
          }
          .pipeline-flow-dot {
            display: none !important;
          }
          .hero-visual-frame {
            transform: none !important;
            opacity: 1 !important;
          }
        }

        /* ── Responsive Viewport Adjustments (Mobile, Tablet, Desktop) ── */
        @media (max-width: 1140px) {
          .hero-mockup-split-layout {
            grid-template-columns: 1fr !important;
          }
          .comparison-split-grid {
            grid-template-columns: 1fr !important;
          }
          .moat-flow-wrapper {
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
          .moat-flow-arrow-wrap {
            transform: rotate(90deg) !important;
          }
        }

        @media (max-width: 900px) {
          .adds-bento-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .sync-split-layout {
            grid-template-columns: 1fr !important;
            padding: 2rem !important;
          }
        }

        @media (max-width: 768px) {
          .workflow-stepper-box {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            padding: 0 1rem !important;
          }
          .hero-stepper-line {
            display: none !important;
          }
          .hero-stepper-line-segment {
            display: none !important;
          }
          .pipeline-wrapper {
            flex-direction: column !important;
            gap: 2rem !important;
          }
          .pipeline-flow-track {
            width: 2px !important;
            height: 50px !important;
          }
          .pipeline-flow-dot {
            top: 0% !important;
            left: -3px !important;
            animation: pipelineVerticalDot 3s infinite linear !important;
          }
          .audience-grid-style {
            grid-template-columns: 1fr !important;
          }
          .tab-meta-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 520px) {
          .adds-bento-grid {
            grid-template-columns: 1fr !important;
          }
          .chips-wrap-grid {
            justify-content: flex-start !important;
            padding: 0 1rem !important;
          }
          .drawer-content-box {
            padding: 1.5rem 1rem !important;
            max-width: 100% !important;
          }
        }

        @keyframes pipelineVerticalDot {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `,
        }}
      />

      {/* ── SECTION 1: DEVELOPER-FIRST HERO SECTION ── */}
      <section ref={heroRef} style={heroSectionStyle}>
        <div style={panelOrb} />
        <motion.button
          type="button"
          onClick={toggleTheme}
          className="btn-focus active-scale-95"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
          style={landingThemeToggleBtn(isDark)}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </motion.button>

        <div style={heroHeaderWrap}>
          <div
            className="premium-badge animate-pulse-slow"
            style={{ marginBottom: "1.25rem" }}
          >
            <Sparkles size={11} className="text-purple-400" />
            <span>PROMPT COMPILER v3.0</span>
          </div>

          <h1 className="hero-headline" style={heroHeadline}>
            <span className="hero-title-line" style={{ display: "block" }}>
              Turn vague ideas
            </span>
            <span
              className="hero-title-line hero-gradient"
              style={{ display: "block" }}
            >
              into surgical
            </span>
            <span className="hero-title-line" style={{ display: "block" }}>
              AI prompts.
            </span>
          </h1>

          <p className="hero-subtitle" style={heroSubParagraph}>
            Stop typing generic instructions. PromptForge translates developer
            intentions into structured layouts, HSL theme configurations, and
            Framer Motion physics that AI compilers compile flawlessly on the
            first run.
          </p>

          {/* Stepper Workflow Diagram */}
          <div className="workflow-stepper-box" style={workflowStepperBox}>
            <div className="hero-stepper-line" style={stepperBgTrack} />

            {[
              {
                id: "1",
                step: "Idea Draft",
                detail: '"make dashboard"',
                icon: FileText,
                color: "#a855f7",
              },
              {
                id: "2",
                step: "PromptForge Compiler",
                detail: "Semantic RAG mapping",
                icon: Cpu,
                color: "#6843EC",
              },
              {
                id: "3",
                step: "Technical Spec",
                detail: "XML design tokens",
                icon: Code2,
                color: "#D2FF3A",
              },
              {
                id: "4",
                step: "AI Coder Integration",
                detail: "Cursor / Lovable / Bolt",
                icon: Wand2,
                color: "#0ea5e9",
              },
              {
                id: "5",
                step: "Production App",
                detail: "Zero layout shift UI",
                icon: Monitor,
                color: "#10b981",
              },
            ].map((node, i, arr) => {
              const NodeIcon = node.icon;
              const resolvedColor = getAccessibleColor(node.color, isDark);
              return (
                <div
                  key={node.id}
                  className="hero-stepper-item"
                  style={stepperNodeWrap}
                >
                  <div style={stepperBadge(resolvedColor, isDark)}>
                    <NodeIcon size={14} style={{ color: resolvedColor }} />
                  </div>
                  <span style={stepperLabelText}>{node.step}</span>
                  <span style={stepperSubText}>{node.detail}</span>
                  {i < arr.length - 1 && (
                     <div
                       className="hero-stepper-line-segment"
                       style={stepperLineBetween(resolvedColor)}
                     />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action CTAs (Conversion Optimization: Go straight to high-value forge wizard page) */}
          <div style={ctaRowStyle}>
            <Link
              href={user ? "/forge" : "/auth?redirect=/forge"}
              className="hero-cta-btn btn-accent shine-effect active-scale-95 btn-focus"
              style={primaryCtaBtn}
              aria-label="Launch Workspace to compile app specifications"
            >
              Launch Forge Workspace
              <ArrowRight size={15} />
            </Link>
            <a
              href="#how-it-works"
              className="hero-cta-btn btn-secondary active-scale-95 btn-focus"
              style={secondaryCtaBtn}
              aria-label="Learn about PromptForge pipeline"
            >
              See Pipeline
            </a>
          </div>
        </div>

        {/* Audit: Spacious Dominant Visuals (Occupies 60% fold height) */}
        <div className="hero-visual-frame" style={browserFrameStyle}>
          <div style={browserHeader}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
            </div>
            <div style={browserUrl}>promptforge.ai/workspace</div>
          </div>
          <div
            className="hero-mockup-split-layout"
            style={heroMockupSplitLayout}
          >
            {/* Left Column: Workspace Preview */}
            <div style={heroMockupCol}>
              <div style={mockupImgLabel}>
                <Monitor size={12} style={{ color: "var(--accent)" }} />
                <span>Full-Stack Forge Workbench</span>
              </div>
              <Image
                src="/pages/dashboard_fresh.webp"
                alt="PromptForge dashboard-style interface preview for the full-stack compile workspace"
                width={900}
                height={550}
                style={mockupImg}
                priority
              />
              <div style={mockupCaptionStyle}>
                Workspace preview displaying the step-by-step layout compiler, framework setups, and live retrieval confidence indicators.
              </div>
            </div>
            {/* Right Column: Design Terminology Preview */}
            <div style={heroMockupCol}>
              <div style={mockupImgLabel}>
                <BookOpen size={12} style={{ color: "var(--accent-green)" }} />
                <span>Design Vocabulary Library</span>
              </div>
              <Image
                src="/pages/vocabulary_raw.webp"
                alt="PromptForge profile-style interface preview for the design vocabulary library"
                width={900}
                height={550}
                style={mockupImg}
                priority
              />
              <div style={mockupCaptionStyle}>
                Education console mapping semantic design tokens, HSL visual themes, and customized Framer Motion physics variables.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: VALUE PROOF (BEFORE VS AFTER) ── */}
      <section ref={beforeAfterRef} style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label anim-beforeafter">SURGICAL ACCURACY</p>
          <h2 className="anim-beforeafter" style={sectionTitle}>
            Before vs After Comparison
          </h2>
          <p className="anim-beforeafter" style={sectionSubTextParagraph}>
            Observe the difference between feeding an AI generator a vague
            layout statement versus PromptForge's complete structural spec.
          </p>
        </div>

        <div
          className="anim-beforeafter comparison-split-grid"
          style={comparisonSplitGrid}
        >
          {/* Vague Statement card */}
          <div
            style={comparisonCardStyle(false, isDark)}
            className="glass-panel"
          >
            <div style={comparisonHeaderWrap}>
              <span style={comparisonBadgeStyle(false, isDark)}>
                VAGUE DEVELOPER PROMPT
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#ef4444",
                  fontWeight: 600,
                }}
              >
                Unpredictable Layout
              </span>
            </div>
            <div style={comparisonPromptBox}>
              <p
                style={{
                  fontStyle: "italic",
                  color: "var(--muted-foreground)",
                  fontSize: "0.95rem",
                }}
              >
                {rawInputCode}
              </p>
            </div>
            <div style={comparisonResultMeta}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <span style={badProofRow}>
                  <X size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <span>Default components (often generic light buttons)</span>
                </span>
                <span style={badProofRow}>
                  <X size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <span>Massive whitespace gaps / unpredictable margins</span>
                </span>
                <span style={badProofRow}>
                  <X size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <span>Missing accessibility hooks and semantic HTML tags</span>
                </span>
                <span style={badProofRow}>
                  <X size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <span>Static linear animations or aggressive bounces</span>
                </span>
              </div>
            </div>
          </div>

          {/* Surgical Spec card */}
          <div
            style={comparisonCardStyle(true, isDark)}
            className="glass-panel"
          >
            <div style={comparisonHeaderWrap}>
              <span style={comparisonBadgeStyle(true, isDark)}>
                PROMPTFORGE COMPILED SPEC
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--accent-green)",
                  fontWeight: 600,
                }}
              >
                Production-Ready App
              </span>
            </div>
            <div style={comparisonPromptBoxCode}>
              <pre style={codeSpecPre}>{structuredPromptOutput}</pre>
            </div>
            <div style={comparisonResultMeta}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <span style={goodProofRow}>
                  <Check size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <span>Semantically locked layout variables</span>
                </span>
                <span style={goodProofRow}>
                  <Check size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <span>Spacing patterns defined for Bento grids</span>
                </span>
                <span style={goodProofRow}>
                  <Check size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <span>Motion curves mapped with accurate spring parameters</span>
                </span>
                <span style={goodProofRow}>
                  <Check size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <span>Auto-injected ARIA accessibility landmarks</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PROMPTFORGE TRANSLATION ENGINE ── */}
      <section ref={translationRef} id="how-it-works" style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label anim-translation">TRANSFORMING INTENT</p>
          <h2 className="anim-translation" style={sectionTitle}>
            The Retrieval & Compiler Engine
          </h2>
          <p className="anim-translation" style={sectionSubTextParagraph}>
            AI models fail because they lack layout context. PromptForge bridges
            the gap by structuring raw sentences into complete visual
            blueprints.
          </p>
        </div>

        <div
          className="anim-translation pipeline-wrapper"
          style={pipelineWrapper}
        >
          {/* Left panel: Raw input */}
          <div style={pipelineCard} className="glass-panel">
            <div style={pipelineCardHeader}>
              <span style={pipelineCardIndicator("#ef4444")} />
              <span>Raw Text Idea</span>
            </div>
            <div style={pipelineCardBody}>
              <p style={pipelineInputText}>
                "Build a premium dark-mode SaaS dashboard with glassmorphism
                cards and smooth entrance motions."
              </p>
            </div>
          </div>

          {/* Flow path track */}
          <div className="pipeline-flow-track" style={pipelineFlowTrack}>
            <div className="pipeline-flow-dot" style={pipelineFlowDot} />
            <div style={pipelineCoreIconWrap}>
              <Zap size={20} style={{ color: "var(--accent)" }} />
            </div>
          </div>

          {/* Right panel: Enhanced technical prompt */}
          <div style={pipelineCard} className="glass-panel">
            <div style={pipelineCardHeader}>
              <span style={pipelineCardIndicator("#10b981")} />
              <span>Surgical XML Prompt Block</span>
            </div>
            <div style={pipelineCardBodyCode}>
              <pre style={codePreText}>
                <span style={{ color: "#a855f7" }}>&lt;design_system&gt;</span>
                {`\n`}
                &nbsp;&nbsp;
                <span style={{ color: "#0ea5e9" }}>&lt;theme&gt;</span>Sleek
                Dark Glassmorphic
                <span style={{ color: "#0ea5e9" }}>&lt;/theme&gt;</span>
                {`\n`}
                &nbsp;&nbsp;
                <span style={{ color: "#a855f7" }}>&lt;tokens&gt;</span>
                {`\n`}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span style={{ color: "#f43f5e" }}>&lt;card_bg&gt;</span>
                rgba(255,255,255,0.05)
                <span style={{ color: "#f43f5e" }}>&lt;/card_bg&gt;</span>
                {`\n`}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span style={{ color: "#f43f5e" }}>&lt;blur&gt;</span>12px
                <span style={{ color: "#f43f5e" }}>&lt;/blur&gt;</span>
                {`\n`}
                &nbsp;&nbsp;
                <span style={{ color: "#a855f7" }}>&lt;/tokens&gt;</span>
                {`\n`}
                <span style={{ color: "#a855f7" }}>&lt;/design_system&gt;</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3.5: REAL GENERATED RESULT (THE KEY VISUAL PROOF PROOF) ── */}
      <section ref={proofRef} style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label anim-proof">UNDENIABLE VISUAL PROOF</p>
          <h2 className="anim-proof" style={sectionTitle}>
            Real Generated Result
          </h2>
          <p className="anim-proof" style={sectionSubTextParagraph}>
            See exactly how Cursor, Bolt, or Lovable render a layout block when
            compile instructions are enriched by PromptForge design tokens.
          </p>
        </div>

        <div className="anim-proof glass-panel" style={realResultLayoutBox}>
          <div style={realResultHeader}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div style={greenPulseDot} />
              <span style={resultHeaderText}>
                AI Generation Blueprint Output
              </span>
            </div>
            <div style={realResultTechBadge(isDark)}>
              Generated in Lovable / Cursor
            </div>
          </div>

          <div style={realResultGridSplit}>
            <div style={realResultTextPane}>
              <div style={resultStepBox}>
                <span
                  style={resultStepLabel(getAccessibleColor("#a855f7", isDark))}
                >
                  1. Vague Input
                </span>
                <p style={resultStepText}>
                  "Build a premium dark-theme SaaS dashboard grid."
                </p>
              </div>

              <div style={resultStepBox}>
                <span
                  style={resultStepLabel(getAccessibleColor("#6843EC", isDark))}
                >
                  2. PromptForge Spec Injected
                </span>
                <div style={resultCodeSampleBox}>
                  <pre style={resultCodeSamplePre}>
                    &lt;theme&gt;Sleek Dark Glassmorphic&lt;/theme&gt;{`\n`}
                    &lt;grid&gt;Bento Grid (3 columns, 16px gaps)&lt;/grid&gt;
                    {`\n`}
                    &lt;motion&gt;spring(stiffness: 260)&lt;/motion&gt;
                  </pre>
                </div>
              </div>

              <div style={resultStepBox}>
                <span
                  style={resultStepLabel(getAccessibleColor("#10b981", isDark))}
                >
                  3. Compiles Flawlessly First Try
                </span>
                <p style={resultStepText}>
                  AI parses the exact spatial constraints, styling tags, and
                  motion values, producing a high-performance grid container
                  instead of guessing template margins.
                </p>
              </div>
            </div>

            {/* Spacious Visual Dominance: Screenshot takes 60% horizontal grid space */}
            <div style={realResultVisualPane}>
              <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1rem" }}>
                <Image
                  src="/pages/forge_raw.webp"
                  alt="PromptForge login-style result preview compiled from the current workspace specifications"
                  width={900}
                  height={550}
                  style={realResultImg}
                />
                <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", textAlign: "center", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: "0.6rem" }}>
                  Product demo output: A functional dark UI component with HSL border configurations and organic spring button interactions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FORGE WORKSPACE MODES SHOWCASE ── */}
      <section ref={workspaceRef} style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label anim-workspace">
            WORKFLOW COMPONENT PIPELINES
          </p>
          <h2 className="anim-workspace" style={sectionTitle}>
            Integrated Workstation Modes
          </h2>
          <p className="anim-workspace" style={sectionSubTextParagraph}>
            PromptForge provides specialized tools, each focused on a specific
            phase of the application specifications loop.
          </p>
        </div>

        {/* Tab Selector Links */}
        <div
          className="anim-workspace"
          style={workspaceTabRow}
          role="tablist"
          aria-label="Workstation modes"
        >
          {WORKSPACE_TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                style={workspaceTabBtn(isActive, isDark)}
                className="active-scale-95 chip-focus workspace-tab-btn"
                aria-label={`Switch mode preview to ${tab.title}`}
              >
                {tab.title}
              </button>
            );
          })}
        </div>

        {/* Spacious tab preview layout (Audited: Visual dominates 60%) */}
        <div className="anim-workspace glass-panel" style={tabContentContainer}>
          <div className="tab-meta-header" style={tabMetaHeader}>
            <div style={tabMetaLabel}>
              <span
                className="badge badge-primary"
                style={{ fontSize: "0.65rem" }}
              >
                {WORKSPACE_TABS.find((t) => t.id === activeTab)?.tag}
              </span>
              <p style={tabTextDesc}>
                {WORKSPACE_TABS.find((t) => t.id === activeTab)?.desc}
              </p>
            </div>
            <Link href="/forge" style={tabRedirectLink} className="btn-focus">
              Launch Mode Wizard <ArrowRight size={13} />
            </Link>
          </div>

          <div style={tabPreviewMockupFrame}>
            <Image
              src={
                WORKSPACE_TABS.find((t) => t.id === activeTab)?.img ||
                "/pages/dashboard_fresh.webp"
              }
              alt={`PromptForge interface preview for the ${WORKSPACE_TABS.find((t) => t.id === activeTab)?.title} workspace`}
              width={900}
              height={550}
              style={tabPreviewImg}
            />
          </div>
          <div style={tabCaptionStyle}>
            {TAB_CAPTIONS[activeTab]}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: "WHAT PROMPTFORGE ADDS" 6-CARD GRID ── */}
      <section ref={addsRef} style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label anim-adds">CORE ENHANCEMENTS</p>
          <h2 className="anim-adds" style={sectionTitle}>
            What PromptForge Adds
          </h2>
          <p className="anim-adds" style={sectionSubTextParagraph}>
            Every spec block injected with PromptForge contains verified design
            parameters that keep layouts pixel-compliant.
          </p>
        </div>

        <div className="anim-adds adds-bento-grid" style={addsBentoGrid}>
          {[
            {
              title: "Theme Intelligence",
              icon: Layers,
              color: "#a855f7",
              desc: "Pre-calculated HSL design values, frosted transparent properties, and ultraviolet borders that look premium.",
            },
            {
              title: "Accessibility Injection",
              icon: Shield,
              color: "#10b981",
              desc: "Automatic ARIA landmarks, proper skip links, clear contrast profiles, and focus tab indices.",
            },
            {
              title: "Motion Physics",
              icon: Zap,
              color: "#6843EC",
              desc: "Explicit Framer Motion variables mapping stiffness, damping, and responsive spring curve metrics.",
            },
            {
              title: "Codebase Context",
              icon: RefreshCw,
              color: "#0ea5e9",
              desc: "Extracts style tokens directly from active files to keep compilations framework compliant.",
            },
            {
              title: "Component Patterns",
              icon: Monitor,
              color: "#f43f5e",
              desc: "Semantically retrieves exact UI layout spacing guidelines (Bento, app shells, mega menus).",
            },
            {
              title: "Design Vocabulary",
              icon: BookOpen,
              color: "#D2FF3A",
              desc: "Transforms loose terms (e.g. glassmorphism) into strict CSS token parameters AIs understand.",
            },
          ].map((card, idx) => {
            const CardIcon = card.icon;
            const resolvedColor = getAccessibleColor(card.color, isDark);
            return (
              <div
                key={idx}
                style={addsCardStyle(isDark)}
                className="glass-panel card-hover"
              >
                <div style={addsCardIconBox(resolvedColor, isDark)}>
                  <CardIcon size={16} style={{ color: resolvedColor }} />
                </div>
                <h4 style={addsCardTitleText}>{card.title}</h4>
                <p style={addsCardDescText}>{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 6: EXISTING PROJECT SYNC ── */}
      <section ref={syncRef} style={sectionContainer}>
        {/* Spacious Sync Layout (Audited: Image occupies dominant space) */}
        <div
          className="anim-sync sync-split-layout glass-panel"
          style={syncSplitLayout}
        >
          <div style={syncContentCol}>
            <div
              className="premium-badge animate-pulse-slow"
              style={{ marginBottom: "1.25rem", width: "fit-content" }}
            >
              <Layers size={11} className="text-purple-400" />
              <span>Framework Synchronization</span>
            </div>
            <h3 style={syncTitleText}>
              Sync frames directly with existing repositories.
            </h3>
            <p style={syncParagraph}>
              Do not build in a silo. PromptForge reads active Git branches,
              extracts existing visual tokens from your source files, and builds
              prompts synchronized to your framework.
            </p>

            <div style={syncBulletsGrid}>
              <div style={syncBulletRow}>
                <CheckCircle2
                  size={14}
                  style={{ color: "#D2FF3A", flexShrink: 0 }}
                />
                <span>
                  IDE Codebase Ingestion (extract existing frameworks)
                </span>
              </div>
              <div style={syncBulletRow}>
                <CheckCircle2
                  size={14}
                  style={{ color: "#D2FF3A", flexShrink: 0 }}
                />
                <span>Git branch sync mapping</span>
              </div>
              <div style={syncBulletRow}>
                <CheckCircle2
                  size={14}
                  style={{ color: "#D2FF3A", flexShrink: 0 }}
                />
                <span>
                  Framework compliance (Tailwind CSS, Radix UI structures)
                </span>
              </div>
            </div>
          </div>

          <div style={syncVisualCol}>
            <div style={browserHeaderSmall}>
              <span
                style={{
                  fontSize: "0.62rem",
                  color: "var(--muted-foreground)",
                }}
              >
                Git Branch Context Sync
              </span>
            </div>
            <Image
              src="/pages/chat_raw.webp"
              alt="PromptForge profile-style interface preview for branch and workspace sync context"
              width={600}
              height={450}
              style={syncMockImg}
            />
            <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", textAlign: "center", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: "0.6rem", background: "var(--card)", padding: "0.6rem 1rem" }}>
              Framework context reader: Imports your current codebase configuration to suggest relevant component variants and layout boundaries.
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW PROMPTFORGE THINKS (MOAT SYSTEM MAP) ── */}
      <section ref={moatRef} style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label anim-moat">THE ARCHITECTURAL MOAT</p>
          <h2 className="anim-moat" style={sectionTitle}>
            How PromptForge Thinks
          </h2>
          <p className="anim-moat" style={sectionSubTextParagraph}>
            PromptForge does not let the AI guess. We translate, retrieve, and
            enrich your layout intentions through a multi-step compilation loop.
          </p>
        </div>

        <div className="anim-moat moat-flow-wrapper" style={moatFlowWrapper}>
          {[
            {
              id: "t1",
              title: "User Input",
              sub: "Draft requirement statement",
              color: "#ef4444",
            },
            {
              id: "t2",
              title: "Intent Analysis",
              sub: "Extract styling tokens",
              color: "#a855f7",
            },
            {
              id: "t3",
              title: "Vocabulary Mapping",
              sub: "Match professional terms",
              color: "#6843EC",
            },
            {
              id: "t4",
              title: "Theme Retrieval",
              sub: "HSL palettes & backgrounds",
              color: "#f43f5e",
            },
            {
              id: "t5",
              title: "Component Matcher",
              sub: "Bento structure extraction",
              color: "#0ea5e9",
            },
            {
              id: "t6",
              title: "Motion Injector",
              sub: "Spring & Bezier values",
              color: "#D2FF3A",
            },
            {
              id: "t7",
              title: "ARIA landmark config",
              sub: "Accessibility injection",
              color: "#10b981",
            },
            {
              id: "t8",
              title: "Final Prompt Spec",
              desc: "Compiler-ready package",
              color: "#10b981",
              isEnd: true,
            },
          ].map((step, i, arr) => {
            const resolvedColor = getAccessibleColor(step.color, isDark);
            return (
              <React.Fragment key={step.id}>
                <div
                  style={moatStepNode(resolvedColor, isDark)}
                  className="glass-panel"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: resolvedColor,
                      }}
                    />
                    <span style={moatStepTitle}>{step.title}</span>
                  </div>
                  <span style={moatStepSub}>{step.sub || step.desc}</span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="moat-flow-arrow-wrap"
                    style={moatFlowArrowWrap}
                  >
                    <ChevronRight
                      size={16}
                      style={{ color: "var(--muted-foreground)", opacity: 0.6 }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 7: CLICK-TO-LEARN DESIGN VOCABULARY DRAWER ── */}
      <section ref={vocRef} style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label anim-voc">DESIGN TERMINOLOGY DRAWER</p>
          <h2 className="anim-voc" style={sectionTitle}>
            Design Vocabulary & Click-to-Learn Drawer
          </h2>
          <p className="anim-voc" style={sectionSubTextParagraph}>
            Click any token chip below to open our integrated educational panel.
            Learn visual design paradigms and extract technical prompts
            instantly.
          </p>
        </div>

        {/* Chips Grid */}
        <div className="anim-voc chips-wrap-grid" style={chipsWrapGrid}>
          {designVocabulary.slice(0, 16).map((token) => (
            <motion.button
              key={token.id}
              onClick={() => {
                setSelectedToken(token);
                setDrawerOpen(true);
              }}
              style={tokenChipStyle(selectedToken?.id === token.id, isDark)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="chip-focus"
              aria-label={`Open educational drawer for ${token.name}`}
            >
              <BookOpen size={11} style={{ opacity: 0.7 }} />
              {token.name}
            </motion.button>
          ))}
        </div>

        {/* Educational Slide Drawer Panel (Audit: Accessible Focus trap and Esc close) */}
        <AnimatePresence>
          {drawerOpen && selectedToken && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={drawerBackdrop}
              onClick={() => setDrawerOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-token-title"
            >
              <motion.div
                ref={drawerRef}
                className="drawer-content-box"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 24, stiffness: 220 }}
                style={drawerContentContainer(isDark)}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div style={drawerHeader}>
                  <div>
                    <span style={drawerBadge(isDark)}>
                      {selectedToken.category}
                    </span>
                    <h4 id="drawer-token-title" style={drawerTitleText}>
                      {selectedToken.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    style={drawerCloseBtn(isDark)}
                    className="btn-focus"
                    aria-label="Close drawer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div style={drawerBody}>
                  <p style={drawerDescText}>{selectedToken.description}</p>

                  {/* CSS Token Specs */}
                  {selectedToken.snippet && (
                    <div style={drawerCodeSection(isDark)}>
                      <div style={drawerLabelRow}>
                        <Code2 size={12} style={{ color: "var(--accent)" }} />
                        <span>Design Token Specifications</span>
                      </div>
                      <pre style={drawerCodePre(isDark)}>
                        {selectedToken.snippet}
                      </pre>
                    </div>
                  )}

                  {/* Example Prompt */}
                  <div style={drawerPromptSection(isDark)}>
                    <div style={drawerLabelRow}>
                      <Sparkles size={12} style={{ color: "#D2FF3A" }} />
                      <span>Compiled AI Prompt Segment</span>
                    </div>
                    <p style={drawerPromptBody}>
                      "{selectedToken.examplePrompt}"
                    </p>

                    <button
                      onClick={(e) =>
                        handleCopy(
                          selectedToken.id,
                          selectedToken.examplePrompt,
                          e,
                        )
                      }
                      style={drawerCopyBtn(isDark)}
                      className="btn-focus"
                      aria-label="Copy enhanced token prompt segment"
                    >
                      {copiedId === selectedToken.id ? (
                        <>
                          <Check size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy Token Prompt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── SECTION 9: "WHO IT'S FOR" AUDIENCE SEGMENT ── */}
      <section ref={targetRef} style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label anim-target">TARGET AUDIENCE</p>
          <h2 className="anim-target" style={sectionTitle}>
            Who It's For
          </h2>
          <p className="anim-target" style={sectionSubTextParagraph}>
            PromptForge is built for builders who demand visual execution on the
            first build.
          </p>
        </div>

        <div
          className="anim-target audience-grid-style"
          style={audienceGridStyle}
        >
          {AUDIENCES.map((aud, idx) => (
            <div
              key={idx}
              style={audienceCardStyle(isDark)}
              className="glass-panel"
            >
              <div style={audienceHeaderRow}>
                <div style={checkDot}>
                  <Check size={11} style={{ color: "var(--accent)" }} />
                </div>
                <h4 style={audienceTitleText}>{aud.title}</h4>
              </div>
              <p style={audienceDescText}>{aud.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 10: IMMERSIVE ULTRAVIOLET FINAL CTA ── */}
      <section ref={ctaRef} style={sectionContainer}>
        <div className="anim-cta glass-panel" style={finalCtaBoxStyle(isDark)}>
          <div style={ctaBackgroundGlow(isDark)} />

          <div style={ctaContentWrap}>
            <h2 style={finalCtaTitle(isDark)}>
              Ready to compile surgical app specifications?
            </h2>
            <p style={finalCtaDesc(isDark)}>
              Stop guessing. Transform your visual requirements into precise
              prompt specs and launch your next high-fidelity app in seconds.
            </p>

            <Link
              href={user ? "/forge" : "/auth?redirect=/forge"}
              className="btn-accent shine-effect active-scale-95 btn-focus"
              style={finalCtaBtnStyle}
              aria-label="Access forge workspace workspace"
            >
              Launch Forge Workspace
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── STYLING TOKENS & RESPONSIVE INLINE STYLES ───────────────────

const containerStyle = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "3rem",
  paddingTop: "1rem",
  overflowX: "hidden",
};

// ── Section 1: Hero Inline Styles
const heroSectionStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  alignItems: "center",
  padding: "2.5rem 1.5rem ",
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
};

const panelOrb = {
  position: "absolute",
  top: "0%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "800px",
  height: "500px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(104,67,236,0.06) 0%, transparent 70%)",
  filter: "blur(50px)",
  zIndex: -1,
  pointerEvents: "none",
};

const heroHeaderWrap = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  maxWidth: "820px",
  width: "100%",
};

const landingThemeToggleBtn = (isDark) => ({
  position: "absolute",
  top: "1rem",
  right: "1rem",
  zIndex: 4,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.65rem 0.95rem",
  borderRadius: "999px",
  border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
  background: isDark ? "rgba(10, 10, 18, 0.72)" : "rgba(255, 255, 255, 0.78)",
  color: "var(--foreground)",
  boxShadow: isDark
    ? "0 12px 30px rgba(0,0,0,0.28)"
    : "0 12px 30px rgba(15,23,42,0.08)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  fontSize: "0.8rem",
  fontWeight: 700,
});

const heroHeadline = {
  fontSize: "clamp(2.5rem, 5.5vw, 4.4rem)",
  fontWeight: "900",
  fontFamily: "var(--font-display)",
  lineHeight: "1.05",
  letterSpacing: "-0.045em",
  color: "var(--foreground)",
  marginBottom: "1.5rem",
};

const heroSubParagraph = {
  fontSize: "clamp(1rem, 1.15rem, 1.25rem)",
  color: "var(--muted-foreground)",
  lineHeight: "1.65",
  maxWidth: "680px",
  marginBottom: "1.5rem",
};

// Workflow stepper styles
const workflowStepperBox = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  width: "100%",
  gap: "1rem",
  marginBottom: "1.5rem",
  position: "relative",
};

const stepperBgTrack = {
  position: "absolute",
  top: "20px",
  left: "10%",
  right: "10%",
  height: "2px",
  background: "var(--border)",
  zIndex: 1,
};

const stepperNodeWrap = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  zIndex: 2,
  position: "relative",
};

const stepperBadge = (color, isDark) => ({
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  background: isDark ? "#16133a" : "#f0ebff",
  border: `1.5px solid ${color}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 4px 12px ${color}1a`,
  marginBottom: "0.75rem",
});

const stepperLabelText = {
  fontSize: "0.8rem",
  fontWeight: "700",
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  marginBottom: "0.15rem",
};

const stepperSubText = {
  fontSize: "0.68rem",
  color: "var(--muted-foreground)",
};

const stepperLineBetween = (color) => ({
  position: "absolute",
  top: "20px",
  left: "50%",
  width: "100%",
  height: "2px",
  background: `linear-gradient(90deg, ${color}, var(--border))`,
  zIndex: -1,
});

const ctaRowStyle = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  justifyContent: "center",
};

const primaryCtaBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.9rem 1.8rem",
  fontSize: "0.92rem",
  fontWeight: "700",
  borderRadius: "12px",
  textDecoration: "none",
  boxShadow: "0 4px 20px var(--accent-glow)",
};

const secondaryCtaBtn = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.9rem 1.8rem",
  fontSize: "0.92rem",
  fontWeight: "600",
  borderRadius: "12px",
  textDecoration: "none",
};

// Audited Browser mockups visual frames (Generous sizing: visual dominates copy)
const browserFrameStyle = {
  width: "100%",
  maxWidth: "1200px",
  background: "var(--card)",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-xl)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const browserHeader = {
  padding: "0.75rem 1.25rem",
  background: "var(--card)",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  gap: "0.85rem",
};

const browserUrl = {
  fontSize: "0.68rem",
  color: "var(--muted-foreground)",
  background: "var(--input)",
  padding: "3px 18px",
  borderRadius: "999px",
  fontWeight: "500",
  fontFamily: "var(--font-sans)",
};

const heroMockupSplitLayout = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr", // Balanced grid layout for visual symmetry
  background: "var(--background)",
};

const heroMockupCol = {
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid var(--border)",
  background: "var(--background)",
  overflow: "hidden",
};

const mockupImgLabel = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.85rem 1.25rem",
  borderBottom: "1px solid var(--border)",
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--muted-foreground)",
  fontFamily: "var(--font-sans)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "var(--card)",
};

const mockupImg = {
  width: "100%",
  aspectRatio: "16 / 10",
  display: "block",
  objectFit: "cover",
};

const mockupCaptionStyle = {
  fontSize: "0.78rem",
  color: "var(--muted-foreground)",
  textAlign: "left",
  padding: "0.75rem 1.25rem",
  lineHeight: "1.4",
  fontStyle: "italic",
  borderTop: "1px solid var(--border)",
  background: "var(--card)",
  width: "100%",
  margin: 0,
};

// ── Section 2: Translation Conveyor styles
const pipelineWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  width: "100%",
  maxWidth: "1100px",
  margin: "0 auto",
};

const pipelineCard = {
  flex: 1,
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid var(--border)",
  background: "var(--card)",
  display: "flex",
  flexDirection: "column",
};

const pipelineCardHeader = {
  padding: "0.75rem 1.25rem",
  background: "var(--card)",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.74rem",
  fontWeight: "700",
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const pipelineCardIndicator = (color) => ({
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: color,
});

const pipelineCardBody = {
  padding: "2rem",
  minHeight: "180px",
  display: "flex",
  alignItems: "center",
  background: "var(--input)",
};

const pipelineCardBodyCode = {
  padding: "1.25rem 1.5rem",
  minHeight: "180px",
  background: "var(--input)",
  overflowX: "auto",
  display: "flex",
  alignItems: "center",
};

const pipelineInputText = {
  fontSize: "1rem",
  lineHeight: "1.65",
  color: "var(--foreground)",
  fontWeight: "500",
  margin: 0,
};

const codePreText = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.76rem",
  lineHeight: "1.5",
  color: "var(--foreground)",
  margin: 0,
  textAlign: "left",
};

const pipelineFlowTrack = {
  position: "relative",
  width: "80px",
  height: "2px",
  background: "var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const pipelineFlowDot = {
  position: "absolute",
  top: "-3px",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "var(--accent)",
  boxShadow: "0 0 10px var(--accent)",
};

const pipelineCoreIconWrap = {
  position: "absolute",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  background: "var(--card)",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "var(--shadow-md)",
  zIndex: 3,
};

// ── Section 3: Before vs After styles
const comparisonSplitGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1.1fr",
  gap: "2rem",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
};

const comparisonCardStyle = (isSpec, isDark) => ({
  borderRadius: "16px",
  border: `1.5px solid ${isSpec ? (isDark ? "rgba(210,255,58,0.25)" : "rgba(104,67,236,0.25)") : "var(--border)"}`,
  background: "var(--card)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  padding: "2rem",
  gap: "1.5rem",
  height: "100%",
});

const comparisonHeaderWrap = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const comparisonBadgeStyle = (isSpec, isDark) => ({
  fontSize: "0.68rem",
  fontWeight: "800",
  letterSpacing: "0.08em",
  padding: "3px 10px",
  borderRadius: "999px",
  background: isSpec
    ? isDark
      ? "rgba(210,255,58,0.08)"
      : "rgba(21,128,61,0.08)"
    : isDark
      ? "rgba(239,68,68,0.08)"
      : "rgba(220,38,38,0.08)",
  color: isSpec
    ? isDark
      ? "#D2FF3A"
      : "#15803d"
    : isDark
      ? "#ef4444"
      : "#dc2626",
  border: `1px solid ${
    isSpec
      ? isDark
        ? "rgba(210,255,58,0.18)"
        : "rgba(21,128,61,0.18)"
      : isDark
        ? "rgba(239,68,68,0.18)"
        : "rgba(220,38,38,0.18)"
  }`,
});

const comparisonPromptBox = {
  padding: "1.5rem",
  borderRadius: "10px",
  background: "var(--input)",
  border: "1px solid var(--border)",
  flexGrow: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const comparisonPromptBoxCode = {
  padding: "1.25rem 1.5rem",
  borderRadius: "10px",
  background: "#0a0718",
  border: "1px solid var(--border)",
  overflowX: "auto",
  flexGrow: 1,
};

const codeSpecPre = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.74rem",
  lineHeight: "1.45",
  color: "#cbd5e1",
  margin: 0,
  textAlign: "left",
};

const comparisonResultMeta = {
  borderTop: "1px solid var(--border)",
  paddingTop: "1.25rem",
};

const badProofRow = {
  fontSize: "0.82rem",
  color: "var(--muted-foreground)",
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
};

const goodProofRow = {
  fontSize: "0.82rem",
  color: "var(--foreground)",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
};

// ── Section 3.5: Audited Real Generated Result Styles
const realResultLayoutBox = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  borderRadius: "20px",
  border: "1.5px solid var(--border)",
  background: "var(--card)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const realResultHeader = {
  padding: "1.25rem 2rem",
  background: "var(--card)",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
};

const greenPulseDot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#10b981",
  boxShadow: "0 0 8px #10b981",
};

const resultHeaderText = {
  fontSize: "0.82rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--foreground)",
};

const realResultTechBadge = (isDark) => ({
  fontSize: "0.72rem",
  fontWeight: "800",
  background: isDark ? "rgba(210,255,58,0.08)" : "rgba(21,128,61,0.08)",
  color: isDark ? "#D2FF3A" : "#15803d",
  border: `1px solid ${isDark ? "rgba(210,255,58,0.18)" : "rgba(21,128,61,0.18)"}`,
  padding: "3px 12px",
  borderRadius: "999px",
});

const realResultGridSplit = {
  display: "grid",
  gridTemplateColumns: "0.8fr 1.2fr", // Audited spacious product visual takes 60% grid space
  background: "var(--background)",
  alignItems: "stretch",
};

const realResultTextPane = {
  padding: "2.5rem 2rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  borderRight: "1px solid var(--border)",
  textAlign: "left",
};

const resultStepBox = {
  display: "flex",
  flexDirection: "column",
  gap: "0.45rem",
};

const resultStepLabel = (color) => ({
  fontSize: "0.7rem",
  fontWeight: "800",
  color: color,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
});

const resultStepText = {
  fontSize: "0.85rem",
  color: "var(--muted-foreground)",
  lineHeight: "1.5",
  margin: 0,
};

const resultCodeSampleBox = {
  padding: "0.85rem 1rem",
  background: "rgba(0,0,0,0.12)",
  borderRadius: "8px",
  border: "1px solid var(--border)",
};

const resultCodeSamplePre = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  color: "var(--foreground)",
  lineHeight: "1.4",
  margin: 0,
  textAlign: "left",
};

const realResultVisualPane = {
  background: "var(--background)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
  overflow: "hidden",
};

const realResultImg = {
  width: "100%",
  aspectRatio: "16 / 10",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-xl)",
  display: "block",
  objectFit: "cover",
};

// ── Section 4: How PromptForge Thinks Flow
const moatFlowWrapper = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
};

const moatStepNode = (color, isDark) => ({
  padding: "1rem 1.25rem",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  background: "var(--card)",
  width: "210px",
  display: "flex",
  flexDirection: "column",
  textAlign: "left",
  boxShadow: "var(--shadow-sm)",
});

const moatStepTitle = {
  fontSize: "0.82rem",
  fontWeight: "700",
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
};

const moatStepSub = {
  fontSize: "0.68rem",
  color: "var(--muted-foreground)",
  lineHeight: "1.3",
};

const moatFlowArrowWrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// ── Section 5: Workstation tabbed layout
const workspaceTabRow = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  justifyContent: "center",
  marginBottom: "2rem",
};

const workspaceTabBtn = (active, isDark) => ({
  padding: "0.65rem 1.4rem",
  borderRadius: "999px",
  fontSize: "0.85rem",
  fontWeight: "700",
  cursor: "pointer",
  background: active ? "var(--accent)" : "var(--input)",
  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
  color: active ? "#ffffff" : "var(--muted-foreground)",
  fontFamily: "var(--font-sans)",
  transition: "all 0.25s ease",
});

const tabContentContainer = {
  width: "100%",
  maxWidth: "1100px",
  margin: "0 auto",
  background: "var(--card)",
  borderRadius: "20px",
  border: "1px solid var(--border)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const tabMetaHeader = {
  padding: "1.5rem 2rem",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
};

const tabMetaLabel = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0.45rem",
  maxWidth: "650px",
};

const tabTextDesc = {
  fontSize: "0.88rem",
  color: "var(--muted-foreground)",
  margin: 0,
  lineHeight: "1.45",
  textAlign: "left",
};

const tabRedirectLink = {
  fontSize: "0.82rem",
  fontWeight: "700",
  color: "var(--accent)",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
};

// Audited Workspaces tab mockup visual sizing (dominant preview frame)
const tabPreviewMockupFrame = {
  width: "100%",
  background: "var(--background)",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2.5rem",
};

const tabPreviewImg = {
  width: "100%",
  aspectRatio: "16 / 10",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-xl)",
  display: "block",
  objectFit: "cover",
};

const tabCaptionStyle = {
  fontSize: "0.78rem",
  color: "var(--muted-foreground)",
  textAlign: "center",
  padding: "0.85rem 1.5rem",
  lineHeight: "1.45",
  fontStyle: "italic",
  borderTop: "1px solid var(--border)",
  background: "var(--card)",
  width: "100%",
  margin: 0,
};

// ── Section 6: Sync Split Styles
const syncSplitLayout = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr", // Audited sync screenshot takes the dominant portion (visual dominates)
  gap: "3rem",
  width: "100%",
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "3rem",
  borderRadius: "20px",
  border: "1px solid var(--border)",
  background: "var(--card)",
  alignItems: "center",
};

const syncContentCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  textAlign: "left",
};

const syncTitleText = {
  fontSize: "1.85rem",
  fontWeight: "800",
  fontFamily: "var(--font-display)",
  color: "var(--foreground)",
  lineHeight: "1.2",
  letterSpacing: "-0.02em",
  marginBottom: "1rem",
};

const syncParagraph = {
  fontSize: "0.94rem",
  color: "var(--muted-foreground)",
  lineHeight: "1.65",
  marginBottom: "2rem",
};

const syncBulletsGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const syncBulletRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  fontSize: "0.86rem",
  fontWeight: "600",
  color: "var(--foreground)",
};

const syncVisualCol = {
  background: "var(--background)",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  overflow: "hidden",
  boxShadow: "var(--shadow-md)",
};

const browserHeaderSmall = {
  padding: "0.5rem 1rem",
  background: "var(--card)",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

const syncMockImg = {
  width: "100%",
  aspectRatio: "16 / 10",
  display: "block",
  objectFit: "cover",
};

// ── Section 7: Educational Drawer Chips
const chipsWrapGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  justifyContent: "center",
  maxWidth: "900px",
  margin: "0 auto",
};

const tokenChipStyle = (selected, isDark) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.45rem 1rem",
  borderRadius: "999px",
  fontSize: "0.78rem",
  fontWeight: "700",
  cursor: "pointer",
  background: selected ? "var(--accent)" : "var(--input)",
  border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
  color: selected ? "#ffffff" : "var(--muted-foreground)",
  fontFamily: "var(--font-sans)",
  transition: "all 0.25s ease",
});

// Drawer layouts
const drawerBackdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.65)",
  backdropFilter: "blur(4px)",
  zIndex: 10000,
  display: "flex",
  justifyContent: "flex-end",
};

const drawerContentContainer = (isDark) => ({
  width: "100%",
  maxWidth: "450px", // Audited: Fits perfectly down to 320px screen width
  height: "100%",
  background: "var(--card)",
  borderLeft: "1px solid var(--border)",
  boxShadow: "-10px 0 40px rgba(0,0,0,0.4)",
  display: "flex",
  flexDirection: "column",
  padding: "2.5rem 2.2rem",
  gap: "2rem",
});

const drawerHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  borderBottom: "1px solid var(--border)",
  paddingBottom: "1.25rem",
};

const drawerBadge = (isDark) => ({
  fontSize: "0.62rem",
  fontWeight: "800",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--accent)",
  background: "rgba(104,67,236,0.08)",
  padding: "2px 8px",
  borderRadius: "999px",
  display: "inline-block",
  marginBottom: "0.5rem",
});

const drawerTitleText = {
  fontSize: "1.45rem",
  fontWeight: "800",
  fontFamily: "var(--font-display)",
  color: "var(--foreground)",
  margin: 0,
  letterSpacing: "-0.02em",
};

const drawerCloseBtn = (isDark) => ({
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  background: "var(--input)",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "var(--muted-foreground)",
});

const drawerBody = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  textAlign: "left",
};

const drawerDescText = {
  fontSize: "0.9rem",
  color: "var(--muted-foreground)",
  lineHeight: "1.55",
  margin: 0,
};

const drawerCodeSection = (isDark) => ({
  background: isDark ? "#06040e" : "#0a0718",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
});

const drawerLabelRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.65rem",
  fontWeight: "800",
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const drawerCodePre = (isDark) => ({
  fontFamily: "var(--font-mono)",
  fontSize: "0.78rem",
  color: "#D2FF3A",
  margin: 0,
  whiteSpace: "pre-wrap",
  lineHeight: "1.45",
});

const drawerPromptSection = (isDark) => ({
  background: "rgba(104,67,236,0.04)",
  border: "1px solid rgba(104,67,236,0.12)",
  borderRadius: "10px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

const drawerPromptBody = {
  fontSize: "0.86rem",
  fontStyle: "italic",
  color: "var(--foreground)",
  lineHeight: "1.55",
  margin: 0,
};

const drawerCopyBtn = (isDark) => ({
  alignSelf: "flex-start",
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.5rem 1.1rem",
  fontSize: "0.76rem",
  fontWeight: "700",
  borderRadius: "8px",
  cursor: "pointer",
  background: "var(--accent)",
  border: "none",
  color: "#ffffff",
  fontFamily: "var(--font-sans)",
  transition: "opacity 0.2s ease",
});

// ── Section 8: Adds Bento Grid
const addsBentoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1.5rem",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
};

const addsCardStyle = (isDark) => ({
  padding: "2rem 1.75rem",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  background: "var(--card)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  textAlign: "left",
  gap: "0.85rem",
});

const addsCardIconBox = (color, isDark) => ({
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: `${color}12`,
  border: `1.5px solid ${color}25`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const addsCardTitleText = {
  fontSize: "1rem",
  fontWeight: "700",
  color: "var(--foreground)",
  fontFamily: "var(--font-display)",
  letterSpacing: "-0.015em",
  margin: 0,
};

const addsCardDescText = {
  fontSize: "0.82rem",
  color: "var(--muted-foreground)",
  lineHeight: "1.5",
  margin: 0,
};

// ── Section 9: Audience self-identification grid
const audienceGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1.5rem",
  width: "100%",
  maxWidth: "1000px",
  margin: "0 auto",
};

const audienceCardStyle = (isDark) => ({
  padding: "1.5rem 1.75rem",
  borderRadius: "14px",
  border: "1px solid var(--border)",
  background: "var(--card)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  textAlign: "left",
  gap: "0.5rem",
});

const audienceHeaderRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
};

const checkDot = {
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  background: "var(--input)",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const audienceTitleText = {
  fontSize: "0.92rem",
  fontWeight: "700",
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  margin: 0,
};

const audienceDescText = {
  fontSize: "0.8rem",
  color: "var(--muted-foreground)",
  lineHeight: "1.55",
  margin: 0,
  paddingLeft: "1.75rem",
};

// ── Section 10: final cta box
const finalCtaBoxStyle = (isDark) => ({
  position: "relative",
  width: "100%",
  maxWidth: "1100px",
  margin: "0 auto",
  borderRadius: "24px",
  border: "1.5px solid var(--border)",
  background: isDark
    ? "linear-gradient(135deg, rgba(26, 23, 64, 0.8) 0%, rgba(15, 12, 41, 0.95) 100%)"
    : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 240, 245, 0.95) 100%)",
  overflow: "hidden",
  padding: "5rem 2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const ctaBackgroundGlow = (isDark) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "600px",
  height: "350px",
  borderRadius: "50%",
  background: isDark
    ? "radial-gradient(circle, rgba(104,67,236,0.18) 0%, transparent 70%)"
    : "radial-gradient(circle, rgba(104,67,236,0.08) 0%, transparent 70%)",
  filter: "blur(45px)",
  zIndex: 1,
  pointerEvents: "none",
});

const ctaContentWrap = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  zIndex: 2,
  position: "relative",
  maxWidth: "680px",
};

const finalCtaTitle = (isDark) => ({
  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
  fontWeight: "900",
  fontFamily: "var(--font-display)",
  color: isDark ? "#ffffff" : "var(--foreground)",
  lineHeight: "1.15",
  letterSpacing: "-0.03em",
  marginBottom: "1rem",
});

const finalCtaDesc = (isDark) => ({
  fontSize: "1rem",
  color: isDark ? "#a1a1aa" : "var(--muted-foreground)",
  lineHeight: "1.65",
  marginBottom: "2.5rem",
  maxWidth: "560px",
});

const finalCtaBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.9rem 1.8rem",
  fontSize: "0.92rem",
  fontWeight: "700",
  borderRadius: "12px",
  textDecoration: "none",
  boxShadow: "0 4px 20px rgba(104,67,236,0.35)",
};

// ── Generic Section Headers styles
const sectionContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
  padding: "1.25rem 1.5rem",
  position: "relative",
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
};

const sectionHeader = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  maxWidth: "780px",
  margin: "0 auto",
  width: "100%",
  gap: "0.35rem",
};

const sectionTitle = {
  fontSize: "clamp(1.75rem, 3.5vw, 2.3rem)",
  fontWeight: "900",
  fontFamily: "var(--font-display)",
  color: "var(--foreground)",
  letterSpacing: "-0.025em",
  margin: 0,
};

const sectionSubTextParagraph = {
  fontSize: "0.94rem",
  color: "var(--muted-foreground)",
  lineHeight: "1.55",
  maxWidth: "560px",
  margin: 0,
};
