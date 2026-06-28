"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Check, X, Zap, Sparkles, Monitor, BookOpen } from "lucide-react";
import { BRAND } from "@/config/brand";
import { gsap } from "gsap";

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

export default function FeatureGrid({ theme }) {
  const isDark = theme === "dark";
  const beforeAfterRef = useRef(null);
  const translationRef = useRef(null);
  const proofRef = useRef(null);

  useEffect(() => {
    // Scroll reveals
    const sections = [
      { ref: beforeAfterRef, selector: ".anim-beforeafter" },
      { ref: translationRef, selector: ".anim-translation" },
      { ref: proofRef, selector: ".anim-proof" },
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

    // Conveyor Dot animation
    let conveyorAnim = null;
    if (translationRef.current) {
      conveyorAnim = gsap.fromTo(
        ".pipeline-flow-dot",
        { x: 0 },
        {
          x: 80,
          duration: 3,
          repeat: -1,
          ease: "none",
        },
      );
    }

    return () => {
      if (conveyorAnim) conveyorAnim.kill();
    };
  }, []);

  const rawInputCode = `"make a modern dashboard with dark visual glassmorphism cards and smooth spring physics motions."`;

  const structuredPromptOutput = `<!-- Compiled by Veyntra RAG Compiler v3.0 -->
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
    <div className="w-full flex flex-col gap-16 md:gap-24">
      {/* ── SECTION 3: VALUE PROOF (BEFORE VS AFTER) ── */}
      <section ref={beforeAfterRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
        <div className="text-center max-w-[620px] mx-auto mb-10">
          <p className="section-label anim-beforeafter">SURGICAL ACCURACY</p>
          <h2 className="anim-beforeafter text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
            Before vs After Comparison
          </h2>
          <p className="anim-beforeafter text-sm md:text-base text-muted-foreground leading-relaxed">
            Observe the difference between feeding an AI generator a vague
            layout statement versus {BRAND.name}'s complete structural spec.
          </p>
        </div>

        <div className="anim-beforeafter comparison-split-grid grid grid-cols-2 gap-8 mt-8">
          {/* Vague Statement card */}
          <div className="flex flex-col gap-4 p-8 rounded-[20px] relative overflow-hidden border glass-panel bg-destructive/2 border-destructive/25 shadow-destructive/5">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit bg-destructive/10 text-destructive">
                VAGUE DEVELOPER PROMPT
              </span>
              <span className="text-xs text-destructive font-semibold">
                Unpredictable Layout
              </span>
            </div>
            <div className="bg-black/15 border border-border/40 rounded-xl p-6 flex-1 flex items-center justify-center">
              <p className="font-italic text-muted-foreground text-[0.95rem] leading-relaxed text-center">
                {rawInputCode}
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-foreground items-start mt-2">
              <span className="flex gap-2 items-start leading-normal">
                <X size={14} className="text-destructive shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Default components (often generic light buttons)</span>
              </span>
              <span className="flex gap-2 items-start leading-normal">
                <X size={14} className="text-destructive shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Massive whitespace gaps / unpredictable margins</span>
              </span>
              <span className="flex gap-2 items-start leading-normal">
                <X size={14} className="text-destructive shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Missing accessibility hooks and semantic HTML tags</span>
              </span>
              <span className="flex gap-2 items-start leading-normal">
                <X size={14} className="text-destructive shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Static linear animations or aggressive bounces</span>
              </span>
            </div>
          </div>

          {/* Surgical Spec card */}
          <div className="flex flex-col gap-4 p-8 rounded-[20px] relative overflow-hidden border glass-panel bg-success/2 border-success/25 shadow-success/5">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit bg-success/10 text-success">
                {BRAND.name.toUpperCase()} COMPILED BLUEPRINT
              </span>
              <span className="text-xs text-accent-green font-semibold" style={{ color: getAccessibleColor('var(--accent-green)', isDark) }}>
                Production-Ready App
              </span>
            </div>
            <div className="bg-black/15 border border-border/40 rounded-xl p-4 flex-1 overflow-auto">
              <pre className="font-mono text-xs leading-relaxed text-foreground m-0 w-full overflow-x-auto">{structuredPromptOutput}</pre>
            </div>
            <div className="flex flex-col gap-2 text-sm text-foreground items-start mt-2">
              <span className="flex gap-2 items-start leading-normal">
                <Check size={14} className="text-success shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Semantically locked layout variables</span>
              </span>
              <span className="flex gap-2 items-start leading-normal">
                <Check size={14} className="text-success shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Spacing patterns defined for Bento grids</span>
              </span>
              <span className="flex gap-2 items-start leading-normal">
                <Check size={14} className="text-success shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Motion curves mapped with accurate spring parameters</span>
              </span>
              <span className="flex gap-2 items-start leading-normal">
                <Check size={14} className="text-success shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Auto-injected ARIA accessibility landmarks</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: VEYNTRA COMPILER ENGINE ── */}
      <section ref={translationRef} id="how-it-works" className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
        <div className="text-center max-w-[620px] mx-auto mb-10">
          <p className="section-label anim-translation">TRANSFORMING INTENT</p>
          <h2 className="anim-translation text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
            The Retrieval & Compiler Engine
          </h2>
          <p className="anim-translation text-sm md:text-base text-muted-foreground leading-relaxed">
            AI models fail because they lack layout context. {BRAND.name} bridges
            the gap by structuring raw sentences into complete visual
            blueprints.
          </p>
        </div>

        <div className="anim-translation pipeline-wrapper flex items-stretch mt-8">
          {/* Left panel: Raw input */}
          <div className="flex-1 flex flex-col p-6 rounded-2xl bg-card border border-border shadow-md glass-panel">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border pb-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Raw Text Idea</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="italic text-muted-foreground text-[0.95rem] leading-relaxed text-center">
                "Build a premium dark-mode SaaS dashboard with glassmorphism
                cards and smooth entrance motions."
              </p>
            </div>
          </div>

          {/* Flow path track */}
          <div className="pipeline-flow-track flex flex-col items-center justify-center relative w-20 shrink-0">
            <div className="pipeline-flow-dot absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent z-10" />
            <div className="flex items-center justify-center w-9 h-9 rounded-full border-[1.5px] border-dashed border-accent bg-card z-10">
              <Zap size={20} className="text-accent" strokeWidth={1.75} />
            </div>
          </div>

          {/* Right panel: Enhanced technical prompt */}
          <div className="flex-1 flex flex-col p-6 rounded-2xl bg-card border border-border shadow-md glass-panel">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border pb-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span>Surgical XML Prompt Block</span>
            </div>
            <div className="flex-1 overflow-auto bg-black/15 border border-border/40 rounded-xl p-4">
              <pre className="font-mono text-xs leading-relaxed text-foreground m-0 w-full overflow-x-auto">
                <span className="text-[#a855f7]">&lt;design_system&gt;</span>
                {`\n`}
                &nbsp;&nbsp;
                <span className="text-[#0ea5e9]">&lt;theme&gt;</span>Sleek
                Dark Glassmorphic
                <span className="text-[#0ea5e9]">&lt;/theme&gt;</span>
                {`\n`}
                &nbsp;&nbsp;
                <span className="text-[#a855f7]">&lt;tokens&gt;</span>
                {`\n`}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-[#f43f5e]">&lt;card_bg&gt;</span>
                rgba(255,255,255,0.05)
                <span className="text-[#f43f5e]">&lt;/card_bg&gt;</span>
                {`\n`}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-[#f43f5e]">&lt;blur&gt;</span>12px
                <span className="text-[#f43f5e]">&lt;/blur&gt;</span>
                {`\n`}
                &nbsp;&nbsp;
                <span className="text-[#a855f7]">&lt;/tokens&gt;</span>
                {`\n`}
                <span className="text-[#a855f7]">&lt;/design_system&gt;</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3.5: REAL GENERATED RESULT ── */}
      <section ref={proofRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
        <div className="text-center max-w-[620px] mx-auto mb-10">
          <p className="section-label anim-proof">UNDENIABLE VISUAL PROOF</p>
          <h2 className="anim-proof text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
            Real Generated Result
          </h2>
          <p className="anim-proof text-sm md:text-base text-muted-foreground leading-relaxed">
            See exactly how Cursor, Bolt, or Lovable render a layout block when
            compile instructions are enriched by {BRAND.name} design tokens.
          </p>
        </div>

        <div className="anim-proof glass-panel p-8 rounded-[24px] bg-card border border-border shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                AI Generation Blueprint Output
              </span>
            </div>
            <div className={`text-[11px] font-bold border rounded-full px-2.5 py-1 tracking-wide ${
              isDark ? 'text-accent border-accent/20 bg-accent/8' : 'text-accent border-accent/20 bg-accent/8'
            }`}>
              Generated in Lovable / Cursor
            </div>
          </div>

          <div className="anim-proof comparison-split-grid grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span 
                  className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded w-fit text-[#a855f7] bg-[#a855f7]/10"
                  style={{ 
                    color: getAccessibleColor("#a855f7", isDark), 
                    background: `color-mix(in srgb, ${getAccessibleColor("#a855f7", isDark)} 10%, transparent)` 
                  }}
                >
                  1. Vague Input
                </span>
                <p className="text-sm text-muted-foreground leading-normal italic">
                  "Build a premium dark-theme SaaS dashboard grid."
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span 
                  className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded w-fit text-[#6843EC] bg-[#6843EC]/10"
                  style={{ 
                    color: getAccessibleColor("#6843EC", isDark), 
                    background: `color-mix(in srgb, ${getAccessibleColor("#6843EC", isDark)} 10%, transparent)` 
                  }}
                >
                  2. {BRAND.name} Spec Injected
                </span>
                <div className="bg-black/12 border border-border/40 rounded-lg px-3.5 py-2.5">
                  <pre className="font-mono text-[11px] leading-relaxed text-foreground m-0 w-full overflow-x-auto">
                    &lt;theme&gt;Sleek Dark Glassmorphic&lt;/theme&gt;{`\n`}
                    &lt;grid&gt;Bento Grid (3 columns, 16px gaps)&lt;/grid&gt;
                    {`\n`}
                    &lt;motion&gt;spring(stiffness: 260)&lt;/motion&gt;
                  </pre>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span 
                  className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded w-fit text-[#10b981] bg-[#10b981]/10"
                  style={{ 
                    color: getAccessibleColor("#10b981", isDark), 
                    background: `color-mix(in srgb, ${getAccessibleColor("#10b981", isDark)} 10%, transparent)` 
                  }}
                >
                  3. Compiles Flawlessly First Try
                </span>
                <p className="text-xs text-muted-foreground leading-normal">
                  AI parses the exact spatial constraints, styling tags, and
                  motion values, producing a high-performance grid container
                  instead of guessing template margins.
                </p>
              </div>
            </div>

            {/* Spacious Visual Dominance */}
            <div className="flex items-center justify-center bg-black/8 border border-border rounded-2xl p-5 relative overflow-hidden min-h-[300px]">
              <div className="flex flex-col w-full gap-4">
                <Image
                  src="/pages/landing.webp"
                  alt={`${BRAND.name} login-style result preview compiled from the current workspace specifications`}
                  width={900}
                  height={550}
                  className="w-full rounded-xl border border-border/40 object-cover aspect-[1.6]"
                />
                <div className="text-xs text-muted-foreground text-center font-italic border-t border-border pt-2.5">
                  Product demo output: A functional dark UI component with HSL border configurations and organic spring button interactions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
