"use client";

import React, { Suspense, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { BRAND } from "@/config/brand";
import {
  ArrowLeft,
  Monitor,
  Layout,
  Code2,
  Wand2,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  X,
} from "lucide-react";
import { track } from "@/lib/analytics";

// Custom Hooks & Components
import { useForgeState } from "./hooks/useForgeState";
import { usePromptGeneration } from "./hooks/usePromptGeneration";
import { ApplicationWizard } from "./components/ApplicationWizard";
import { PageWizard } from "./components/PageWizard";
import { ComponentWizard } from "./components/ComponentWizard";
import { PromptEnhancer } from "./components/PromptEnhancer";

function ForgeIntelligenceRail({ forgeState, history, isGenerating }) {
  const lastCompilation = history?.[0] || null;
  const lastContext = lastCompilation?.ragDetails?.compileContext || {};
  const lastTerms = lastCompilation?.ragDetails?.technicalTerms || [];
  const lastPatterns = lastCompilation?.ragDetails?.promptPatterns || [];
  const lastConfidence = Math.round(
    (lastCompilation?.ragDetails?.retrievalConfidence || 0) * 100,
  );

  const {
    activeMode,
    selectedTheme,
    selectedTypography,
    projectIntegration,
    framework,
    projectName,
    projectType,
    frontendStack,
    backendStack,
    database,
    authOption,
    deployment,
    selectedModel,
    selectedFeatures,
    selectedComponents,
  } = forgeState;

  const readinessChecks = [
    {
      label: "Intent analysis",
      ready: Boolean(activeMode),
      tone: "var(--accent)",
    },
    {
      label: "Theme resolution",
      ready: Boolean(selectedTheme),
      tone: "var(--success)",
    },
    {
      label: "Typography system",
      ready: Boolean(selectedTypography),
      tone: "#0891b2",
    },
    {
      label: "Project sync",
      ready: projectIntegration === "existing" ? Boolean(framework) : true,
      tone: "#f59e0b",
    },
    {
      label: "Prompt compilation",
      ready: Boolean(activeMode),
      tone: "var(--accent)",
    },
  ];

  const qualityCounts = [
    { label: "Design terms", value: lastTerms.length || 0 },
    { label: "Prompt patterns", value: lastPatterns.length || 0 },
    { label: "Features", value: selectedFeatures.length || 0 },
    { label: "Components", value: selectedComponents.length || 0 },
  ];

  const intelligenceRailWrap = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "0.85rem",
    width: "100%",
  };

  const intelligenceCard = {
    padding: "1rem 1rem 0.95rem",
    borderRadius: "16px",
    border: "1px solid var(--border)",
    background: "var(--card)",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  };

  const intelligenceCardHeader = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "0.75rem",
  };

  const intelligenceKicker = {
    fontSize: "0.64rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "800",
    color: "var(--muted-foreground)",
    marginBottom: "0.15rem",
  };

  const intelligenceTitle = {
    fontSize: "0.92rem",
    fontWeight: "800",
    color: "var(--foreground)",
  };

  const intelligenceBadge = (active) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "0.3rem 0.55rem",
    borderRadius: "999px",
    fontSize: "0.68rem",
    fontWeight: "700",
    color: active ? "var(--success)" : "var(--muted-foreground)",
    background: active
      ? "color-mix(in srgb, var(--success) 8%, transparent)"
      : "var(--muted)",
    border: "1px solid var(--border)",
  });

  const statusList = {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  };

  const statusRow = {
    display: "grid",
    gridTemplateColumns: "10px minmax(0, 1fr) auto",
    gap: "0.55rem",
    alignItems: "center",
    fontSize: "0.76rem",
    color: "var(--foreground)",
  };

  const statusDot = {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    boxShadow:
      "0 0 0 3px color-mix(in srgb, var(--foreground) 4%, transparent)",
  };

  const statusText = {
    fontWeight: "600",
  };

  const statusState = {
    fontWeight: "800",
    color: "var(--muted-foreground)",
  };

  const qualityRow = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.5rem",
  };

  const qualityChip = {
    display: "flex",
    flexDirection: "column",
    gap: "0.08rem",
    padding: "0.55rem 0.65rem",
    borderRadius: "12px",
    background: "var(--muted)",
    border: "1px solid var(--border)",
  };

  const qualityChipValue = {
    fontSize: "0.88rem",
    fontWeight: "800",
    color: "var(--foreground)",
  };

  const qualityChipLabel = {
    fontSize: "0.66rem",
    color: "var(--muted-foreground)",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  const contextList = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.4rem 0.7rem",
    fontSize: "0.76rem",
    color: "var(--foreground)",
    lineHeight: "1.45",
  };

  const lastCompilationList = {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    fontSize: "0.76rem",
    color: "var(--foreground)",
    lineHeight: "1.5",
  };

  const emptyRailText = {
    fontSize: "0.8rem",
    color: "var(--muted-foreground)",
    lineHeight: "1.55",
    margin: 0,
  };

  return (
    <div className="forge-intelligence-rail" style={intelligenceRailWrap}>
      <div style={intelligenceCard} className="glass-panel">
        <div style={intelligenceCardHeader}>
          <div>
            <div style={intelligenceKicker}>Compiler Status</div>
            <div style={intelligenceTitle}>
              {isGenerating ? "Compiling blueprint…" : "Ready to compile"}
            </div>
          </div>
          <span style={intelligenceBadge(isGenerating)}>
            {isGenerating ? "Live" : "Idle"}
          </span>
        </div>

        <div style={statusList}>
          {readinessChecks.map((check) => (
            <div key={check.label} style={statusRow}>
              <span
                style={{
                  ...statusDot,
                  background: check.ready
                    ? check.tone
                    : "var(--muted-foreground)",
                }}
              />
              <span style={statusText}>{check.label}</span>
              <span style={statusState}>{check.ready ? "✓" : "—"}</span>
            </div>
          ))}
        </div>

        <div style={qualityRow}>
          {qualityCounts.map((item) => (
            <div key={item.label} style={qualityChip}>
              <span style={qualityChipValue}>{item.value}</span>
              <span style={qualityChipLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={intelligenceCard} className="glass-panel">
        <div style={intelligenceCardHeader}>
          <div>
            <div style={intelligenceKicker}>Detected Project Context</div>
            <div style={intelligenceTitle}>Sync and build details</div>
          </div>
          <span style={intelligenceBadge(false)}>
            {projectIntegration === "existing" ? "Synced" : "Standalone"}
          </span>
        </div>

        <div style={contextList}>
          <div>
            <strong>Framework:</strong>{" "}
            {projectIntegration === "existing"
              ? framework || "Not selected"
              : "Tailwind CSS"}
          </div>
          <div>
            <strong>Typography:</strong> {selectedTypography || "Inter"}
          </div>
          <div>
            <strong>Project:</strong> {projectName || "my-awesome-project"}
          </div>
          <div>
            <strong>Type:</strong> {projectType || "SaaS Platform"}
          </div>
          <div>
            <strong>Frontend:</strong> {frontendStack || "Next.js (App Router)"}
          </div>
          <div>
            <strong>Backend:</strong> {backendStack || "Next.js Serverless"}
          </div>
          <div>
            <strong>Database:</strong> {database || "PostgreSQL"}
          </div>
          <div>
            <strong>Auth:</strong> {authOption || "NextAuth.js / Auth.js"}
          </div>
          <div>
            <strong>Deploy:</strong> {deployment || "Vercel"}
          </div>
          <div>
            <strong>Model:</strong>{" "}
            {selectedModel === "groq" ? "Groq Llama 3.3" : "Gemini 3.1 Pro"}
          </div>
        </div>
      </div>

      <div style={intelligenceCard} className="glass-panel">
        <div style={intelligenceCardHeader}>
          <div>
            <div style={intelligenceKicker}>Last Compilation</div>
            <div style={intelligenceTitle}>
              {lastCompilation
                ? lastCompilation.title
                : "No blueprints compiled yet"}
            </div>
          </div>
          <span style={intelligenceBadge(Boolean(lastCompilation))}>
            {lastCompilation ? `${lastConfidence}% confidence` : "Empty"}
          </span>
        </div>

        {lastCompilation ? (
          <div style={lastCompilationList}>
            <div>
              <strong>Mode:</strong> {lastCompilation.mode}
            </div>
            <div>
              <strong>Theme:</strong>{" "}
              {lastContext.theme || lastCompilation.theme}
            </div>
            {lastContext.typography && (
              <div>
                <strong>Typography:</strong> {lastContext.typography}
              </div>
            )}
            <div>
              <strong>Retrieved terms:</strong>{" "}
              {lastTerms.slice(0, 4).join(", ") || "None"}
            </div>
            <div>
              <strong>Applied patterns:</strong>{" "}
              {lastPatterns.slice(0, 2).join(" • ") || "None"}
            </div>
          </div>
        ) : (
          <p style={emptyRailText}>
            Compile one blueprint to surface retrieval confidence, injected
            rules, and the prompt quality summary here.
          </p>
        )}
      </div>
    </div>
  );
}

function ForgeWizardContent() {
  const { user, savePromptRecord, apiKey, history, vocabulary, categories, templates, generationMode } = useApp();
  const router = useRouter();

  // Force scroll to top on initial page load to prevent scroll position carryover
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // State Manager Custom Hook
  const forgeState = useForgeState(user, router, categories, templates);
  const {
    activeMode,
    setActiveMode,
    showDraftBanner,
    applyDraft,
    discardDraft,
    getStep,
  } = forgeState;

  // Compilation & Generation Custom Hook
  const promptGeneration = usePromptGeneration({
    savePromptRecord,
    apiKey,
    router,
    forgeState,
    vocabulary,
    generationMode
  });

  // Advanced settings are now visible to all users by default
  const isAdvanced = true;

  if (!user) return null;

  const currentStep = getStep();

  const STEP_LABELS =
    activeMode === "application"
      ? ["Application", "Theme", "Typography", "Project Setup", "Generate"]
      : activeMode === "page"
        ? [
            "Page Type",
            "Components",
            "Theme",
            "Typography",
            "Project Setup",
            "Generate",
          ]
        : activeMode === "component"
          ? ["Type", "Theme", "Generate"]
          : ["Input", "Analyze", "Enhance", "Generate"];



  return (
    <div className="forge-main-container">
      {/* Unified Header Row */}
      {activeMode && (
        <div
          className="forge-header-row grid items-center w-full border-b border-white/6 pb-4 mb-2"
          style={{ gridTemplateColumns: '200px 1fr 200px' }}
        >
          <div />
          <div className="flex items-center justify-center gap-3">
            <div className="w-[38px] h-[38px] rounded-[12px] bg-card border border-white/6 flex items-center justify-center shrink-0">
              {activeMode === "application" && <Monitor size={18} strokeWidth={1.75} style={{ color: "#7c3aed" }} />}
              {activeMode === "page" && <Layout size={18} strokeWidth={1.75} style={{ color: "#0891b2" }} />}
              {activeMode === "component" && <Code2 size={18} strokeWidth={1.75} style={{ color: "#6843EC" }} />}
              {activeMode === "enhance" && <Wand2 size={18} strokeWidth={1.75} style={{ color: "#059669" }} />}
            </div>
            <div className="text-left">
              <h1 className="text-[1.25rem] font-(--font-display) text-foreground tracking-[-0.02em] m-0 leading-[1.2]">
                {activeMode === "application" && "Full-Stack Application Architect"}
                {activeMode === "page" && "Web Page Design"}
                {activeMode === "component" && "Modular Component Architect"}
                {activeMode === "enhance" && "Technical Design Specification Enhancer"}
              </h1>
              <p className="text-[0.82rem] text-muted-foreground leading-[1.4] mt-[0.15rem] m-0">
                {activeMode === "application" && "Build a full multi-page application blueprint."}
                {activeMode === "page" && "Design custom web pages with themes & components."}
                {activeMode === "component" && "Configure premium modular interface controls."}
                {activeMode === "enhance" && "Inject layout tokens & motions to draft specifications."}
              </p>
            </div>
          </div>
          <div />
        </div>
      )}

      {/* Draft Recovery Banner */}
      {showDraftBanner && (
        <div className="flex items-center gap-4 px-5 py-3 rounded-[14px] border border-[rgba(124,58,237,0.15)] bg-[rgba(124,58,237,0.06)] shadow-[0_8px_32px_rgba(0,0,0,0.15)] animate-[fade-in_0.3s_ease]">
          <RotateCcw size={14} strokeWidth={1.75} className="text-accent shrink-0" />
          <span className="text-[0.8rem] text-foreground flex-1">
            You have an unfinished forge saved.{" "}
            <strong>Continue where you left off?</strong>
          </span>
          <button
            onClick={applyDraft}
            className="active-scale-95 px-3 py-[4px] bg-[#7c3aed] text-white border-none rounded-[6px] text-[0.78rem] font-bold cursor-pointer transition-all duration-200 hover:opacity-90"
          >
            Restore Draft
          </button>
          <button
            onClick={discardDraft}
            className="active-scale-95 bg-transparent border-none text-muted-foreground cursor-pointer flex items-center justify-center"
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 mt-2">
        {/* Wizard Pipeline Views */}
        {activeMode === "application" && (
          <ApplicationWizard
            forgeState={forgeState}
            promptGeneration={promptGeneration}
            apiKey={apiKey}
          />
        )}

        {activeMode === "page" && (
          <PageWizard
            forgeState={forgeState}
            promptGeneration={promptGeneration}
            apiKey={apiKey}
          />
        )}

        {activeMode === "component" && (
          <ComponentWizard
            forgeState={forgeState}
            promptGeneration={promptGeneration}
            apiKey={apiKey}
            isAdvanced={isAdvanced}
          />
        )}

        {activeMode === "enhance" && (
          <PromptEnhancer
            forgeState={forgeState}
            promptGeneration={promptGeneration}
            apiKey={apiKey}
          />
        )}
      </div>


    </div>
  );
}

export default function ForgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-white/6 border-t-accent animate-spin" />
          <span className="text-[0.9rem] text-muted-foreground font-semibold">
            Loading {BRAND.name} studio...
          </span>
        </div>
      }
    >
      <ForgeWizardContent />
    </Suspense>
  );
}
