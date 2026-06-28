"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers, Check, Shield, Zap, RefreshCw, Monitor, BookOpen, CheckCircle2 } from "lucide-react";
import { BRAND } from "@/config/brand";
import { gsap } from "gsap";

const WORKSPACE_TABS = [
  {
    id: "application",
    title: "Application Architect",
    desc: "Map out full-stack multi-page applications complete with folder setups, state routing, and mock configurations.",
    img: "/pages/login.webp",
    tag: "Full-Stack Specs",
  },
  {
    id: "page",
    title: "Page Planner",
    desc: "Design individual layouts, bento dashboard grids, and visual typography spacing systems.",
    img: "/pages/landing.webp",
    tag: "Layout Planner",
  },
  {
    id: "component",
    title: "Component Generator",
    desc: "Configure modular buttons, sheets, accordions, and dropdown select matrices optimized for modern component-compilers.",
    img: "/pages/settings.webp",
    tag: "Interface Controls",
  },
  {
    id: "enhance",
    title: "Specification Enhancer",
    desc: "Input draft specs to semantically enrich them with advanced design vocabulary tokens and physics presets.",
    img: "/pages/profile.webp",
    tag: "Token Optimiser",
  },
];

const TAB_CAPTIONS = {
  application: "Full-Stack Setup: Guides selection of frontend/backend stacks, database options, serverless deployments, and secure auth session duration rules.",
  page: "Interface Mapping: Scaffolds design frameworks like bento layouts, spacing scales, typography setups, and responsive grid columns.",
  component: "Granular Controls: Configures button states, form matrices, accordions, and focus outline properties for maximum accessibility.",
  enhance: "Terminology Optimization: Takes basic input drafts and injects high-fidelity designer terms and HSL styling parameters automatically.",
};

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

export default function Workflow({ theme }) {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("application");
  
  const workspaceRef = useRef(null);
  const addsRef = useRef(null);
  const syncRef = useRef(null);
  const moatRef = useRef(null);

  useEffect(() => {
    const sections = [
      { ref: workspaceRef, selector: ".anim-workspace" },
      { ref: addsRef, selector: ".anim-adds" },
      { ref: syncRef, selector: ".anim-sync" },
      { ref: moatRef, selector: ".anim-moat" },
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
  }, []);

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

  return (
    <div className="w-full flex flex-col gap-16 md:gap-24">
      {/* ── SECTION 5: FORGE WORKSPACE MODES SHOWCASE ── */}
      <section ref={workspaceRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
        <div className="text-center max-w-[620px] mx-auto mb-10">
          <p className="section-label anim-workspace">WORKFLOW COMPONENT PIPELINES</p>
          <h2 className="anim-workspace text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
            Integrated Workstation Modes
          </h2>
          <p className="anim-workspace text-sm md:text-base text-muted-foreground leading-relaxed">
            {BRAND.name} provides specialized tools, each focused on a specific
            phase of the application specifications loop.
          </p>
        </div>

        {/* Tab Selector Links */}
        <div
          className="anim-workspace flex gap-2 justify-center mb-6 flex-wrap"
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
                className={`active-scale-95 chip-focus workspace-tab-btn px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "border border-accent bg-accent/8 text-accent"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
                aria-label={`Switch mode preview to ${tab.title}`}
              >
                {tab.title}
              </button>
            );
          })}
        </div>

        {/* Workspace Tab Preview panel */}
        <div className="anim-workspace glass-panel p-8 rounded-[24px] bg-card border border-border shadow-lg relative">
          <div className="tab-meta-header flex justify-between items-start gap-6 border-b border-border pb-5 mb-6 flex-wrap">
            <div className="flex flex-col gap-2">
              <span className="premium-badge w-fit">
                {WORKSPACE_TABS.find((t) => t.id === activeTab)?.tag}
              </span>
              <p className="text-[15px] text-foreground font-medium leading-relaxed m-0 max-w-[600px]">
                {WORKSPACE_TABS.find((t) => t.id === activeTab)?.desc}
              </p>
            </div>
            <Link 
              href="/forge" 
              className="inline-flex items-center gap-1.5 text-xs text-accent no-underline font-bold border border-accent/20 rounded-lg px-3.5 py-2 bg-accent/4 btn-focus"
            >
              Launch Mode Wizard <ArrowRight size={13} strokeWidth={1.75} />
            </Link>
          </div>

          <div className="w-full rounded-xl border border-border overflow-hidden bg-background shadow-md">
            <Image
              src={
                WORKSPACE_TABS.find((t) => t.id === activeTab)?.img ||
                "/pages/dashboard_fresh.webp"
              }
              alt={`${BRAND.name} interface preview for the ${WORKSPACE_TABS.find((t) => t.id === activeTab)?.title} workspace`}
              width={900}
              height={550}
              className="w-full h-auto block object-cover aspect-[1.6] brightness-[0.93] contrast-[1.02]"
            />
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed italic border-t border-border pt-2.5 mt-4">
            {TAB_CAPTIONS[activeTab]}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: "WHAT VEYNTRA ADDS" 6-CARD GRID ── */}
      <section ref={addsRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
        <div className="text-center max-w-[620px] mx-auto mb-10">
          <p className="section-label anim-adds">CORE ENHANCEMENTS</p>
          <h2 className="anim-adds text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
            What {BRAND.name} Adds
          </h2>
          <p className="anim-adds text-sm md:text-base text-muted-foreground leading-relaxed">
            Every spec block compiled with {BRAND.name} contains verified design
            parameters that keep layouts pixel-compliant.
          </p>
        </div>

        <div className="anim-adds adds-bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
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
                className="p-6 rounded-2xl bg-card border border-border transition-all duration-200 flex flex-col gap-2 cursor-pointer shadow-sm glass-panel card-hover"
              >
                <div 
                  className="w-9 h-9 rounded-lg border-[1.5px] flex items-center justify-center transition-all duration-300"
                  style={{
                    background: `color-mix(in srgb, ${resolvedColor} 10%, transparent)`,
                    borderColor: `color-mix(in srgb, ${resolvedColor} 20%, transparent)`
                  }}
                >
                  <CardIcon size={16} style={{ color: resolvedColor }} strokeWidth={1.75} />
                </div>
                <h3 className="text-[15px] font-extrabold text-foreground font-display tracking-tight mt-1">{card.title}</h3>
                <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 6: EXISTING PROJECT SYNC ── */}
      <section ref={syncRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
        <div className="anim-sync sync-split-layout grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 p-12 rounded-[24px] bg-card border border-border shadow-lg items-center glass-panel">
          <div className="flex flex-col gap-4">
            <div className="premium-badge mb-5 w-fit">
              <Layers size={11} className="text-purple-400" strokeWidth={1.75} />
              <span>Framework Synchronization</span>
            </div>
            <h2 className="text-2xl md:text-[1.75rem] font-extrabold font-display text-foreground leading-[1.15] tracking-tight">
              Sync frames directly with existing repositories.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Do not build in a silo. {BRAND.name} reads active Git branches,
              extracts existing visual tokens from your source files, and builds
              specifications synchronized to your framework.
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2 text-xs md:text-[13px] text-foreground items-center">
                <CheckCircle2
                  size={14}
                  className="text-accent-green shrink-0"
                  style={{ color: getAccessibleColor("#D2FF3A", isDark) }}
                  strokeWidth={1.75}
                />
                <span>
                  IDE Codebase Ingestion (extract existing frameworks)
                </span>
              </div>
              <div className="flex gap-2 text-xs md:text-[13px] text-foreground items-center">
                <CheckCircle2
                  size={14}
                  className="text-accent-green shrink-0"
                  style={{ color: getAccessibleColor("#D2FF3A", isDark) }}
                  strokeWidth={1.75}
                />
                <span>Git branch sync mapping</span>
              </div>
              <div className="flex gap-2 text-xs md:text-[13px] text-foreground items-center">
                <CheckCircle2
                  size={14}
                  className="text-accent-green shrink-0"
                  style={{ color: getAccessibleColor("#D2FF3A", isDark) }}
                  strokeWidth={1.75}
                />
                <span>
                  Framework compliance (Tailwind CSS, Radix UI structures)
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden shadow-md">
            <div className="px-3 py-1.5 bg-muted border-b border-border flex items-center">
              <span className="text-[11px] text-muted-foreground font-mono">
                Git Branch Context Sync
              </span>
            </div>
            <Image
              src="/pages/settings.webp"
              alt={`${BRAND.name} profile-style interface preview for branch and workspace sync context`}
              width={600}
              height={450}
              className="w-full h-[220px] object-cover block"
            />
            <div className="text-xs text-muted-foreground text-center font-italic border-t border-border p-3 bg-card">
              Framework context reader: Imports your current codebase configuration to suggest relevant component variants and layout boundaries.
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW VEYNTRA THINKS (MOAT SYSTEM MAP) ── */}
      <section ref={moatRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
        <div className="text-center max-w-[620px] mx-auto mb-10">
          <p className="section-label anim-moat">THE ARCHITECTURAL MOAT</p>
          <h2 className="anim-moat text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
            How {BRAND.name} Thinks
          </h2>
          <p className="anim-moat text-sm md:text-base text-muted-foreground leading-relaxed">
            {BRAND.name} does not let the AI guess. We translate, retrieve, and
            enrich your layout intentions through a multi-step compilation loop.
          </p>
        </div>

        <div className="anim-moat mt-8 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          ].map((step, i) => {
            const resolvedColor = getAccessibleColor(step.color, isDark);
            return (
              <div
                key={step.id}
                className="anim-moat p-4.5 rounded-xl bg-card border border-border flex flex-col gap-2.5 shadow-sm transition-all duration-300 glass-panel hover:border-accent/40 hover:-translate-y-1 hover:shadow-md cursor-pointer"
                style={{
                  borderLeft: `3px solid ${resolvedColor}`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-slow"
                      style={{ background: resolvedColor }}
                    />
                    <h4 className="text-[13px] font-bold text-foreground leading-tight tracking-tight m-0">
                      {step.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground/40 shrink-0">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed m-0">
                  {step.sub || step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
