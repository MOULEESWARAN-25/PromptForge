"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, FileText, Cpu, Code2, Wand2, Monitor, BookOpen, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
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

export default function Hero({ theme, user, toggleTheme }) {
  const isDark = theme === "dark";
  const heroRef = useRef(null);

  useEffect(() => {
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
  }, []);

  return (
    <section ref={heroRef} className="relative flex flex-col gap-8 items-center px-6 py-10 w-full max-w-[1280px] mx-auto">
      {/* Ambient Glow Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(104,67,236,0.06)_0%,transparent_70%)] filter blur-[50px] z-[-1] pointer-events-none" />
      
      <motion.button
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-semibold cursor-pointer z-20 transition-all duration-200 btn-focus active-scale-95"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      >
        {isDark ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
        <span>{isDark ? "Light" : "Dark"}</span>
      </motion.button>

      <div className="text-center max-w-[800px] flex flex-col items-center mx-auto">
        <div className="premium-badge animate-pulse-slow mb-5 w-fit">
          <Sparkles size={11} className="text-purple-400" strokeWidth={1.75} />
          <span>DEVELOPER INTENT COMPILER v3.0</span>
        </div>

        <h1 className="hero-headline text-[clamp(2rem,3.2vw,2.8rem)] font-extrabold font-display text-foreground leading-[1.14] tracking-tight mb-6 text-center">
          <span className="hero-title-line block">
            Transform vision
          </span>
          <span className="hero-title-line hero-gradient block">
            into production
          </span>
          <span className="hero-title-line block">
            software.
          </span>
        </h1>

        <p className="hero-subtitle text-sm md:text-base text-muted-foreground leading-relaxed max-w-[620px] mb-8 text-center">
          Stop typing generic instructions. {BRAND.name} compiles developer
          intent into structured architecture layouts, design tokens, and
          full-stack specifications that AI code generators compile flawlessly on the
          first run.
        </p>

        {/* Stepper Workflow Diagram */}
        <div className="workflow-stepper-box relative grid grid-cols-5 w-full max-w-[760px] gap-4 mb-8">
          <div className="hero-stepper-line absolute top-4 left-[10%] right-[10%] h-[1.5px] bg-border z-0" />

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
              step: `${BRAND.name} Compiler`,
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
                className="hero-stepper-item flex flex-col items-center text-center relative z-10"
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-[1.5px] mb-2 ${
                    isDark ? 'bg-white/2 border-white/10' : 'bg-black/2 border-black/10'
                  }`}
                >
                  <NodeIcon size={14} style={{ color: resolvedColor }} strokeWidth={1.75} />
                </div>
                <span className="text-[11px] font-bold text-foreground mb-0.5 tracking-tight">{node.step}</span>
                <span className="text-[10px] text-muted-foreground font-medium leading-none">{node.detail}</span>
                {i < arr.length - 1 && (
                  <div
                    className="hero-stepper-line-segment absolute top-4 left-[calc(50%+16px)] w-[calc(100%-16px)] h-[1.5px] z-0"
                    style={{ background: resolvedColor }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Action CTAs */}
        <div className="flex gap-4 items-center justify-center flex-wrap">
          <Link
            href={user ? "/dashboard" : "/auth?redirect=/dashboard"}
            className="hero-cta-btn btn-accent shine-effect active-scale-95 btn-focus inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl text-accent-foreground cursor-pointer transition-all duration-200"
            aria-label="Launch Workspace to compile app specifications"
          >
            Launch {BRAND.name} Studio
            <ArrowRight size={15} strokeWidth={1.75} />
          </Link>
          <a
            href="#how-it-works"
            className="hero-cta-btn btn-secondary active-scale-95 btn-focus inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl text-foreground bg-muted border border-border hover:bg-card cursor-pointer transition-all duration-200"
            aria-label={`Learn about ${BRAND.name} pipeline`}
          >
            See Pipeline
          </a>
        </div>
      </div>

      {/* Mockups Display */}
      <div className="hero-visual-frame w-full border border-border rounded-2xl bg-card overflow-hidden shadow-2xl mt-4">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <div className="flex gap-1.5">
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <div
                key={c}
                className="w-2 h-2 rounded-full opacity-80"
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex-1 text-center text-[11px] text-muted-foreground font-mono">{BRAND.domain}/workspace</div>
          <div className="w-8" />
        </div>
        <div className="hero-mockup-split-layout grid grid-cols-2 gap-px bg-border">
          {/* Left Column: Workspace Preview */}
          <div className="flex flex-col gap-3 p-5 bg-card">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Monitor size={12} className="text-accent" strokeWidth={1.75} />
              <span>Full-Stack Forge Workbench</span>
            </div>
            <Image
              src="/pages/login.webp"
              alt={`${BRAND.name} dashboard-style interface preview for the full-stack compile workspace`}
              width={900}
              height={550}
              className="w-full rounded-lg border border-border/40 object-cover aspect-[1.6] filter brightness-[0.93] contrast-[1.02]"
              priority
            />
            <div className="text-[11px] text-muted-foreground leading-normal mt-1">
              Workspace preview displaying the step-by-step layout compiler, framework setups, and live retrieval confidence indicators.
            </div>
          </div>
          {/* Right Column: Design Terminology Preview */}
          <div className="flex flex-col gap-3 p-5 bg-card">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <BookOpen size={12} className="text-accent-green" strokeWidth={1.75} />
              <span>Design Vocabulary Library</span>
            </div>
            <Image
              src="/pages/profile.webp"
              alt={`${BRAND.name} profile-style interface preview for the design vocabulary library`}
              width={900}
              height={550}
              className="w-full rounded-lg border border-border/40 object-cover aspect-[1.6] filter brightness-[0.93] contrast-[1.02]"
              priority
            />
            <div className="text-[11px] text-muted-foreground leading-normal mt-1">
              Education console mapping semantic design tokens, HSL visual themes, and customized Framer Motion physics variables.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
