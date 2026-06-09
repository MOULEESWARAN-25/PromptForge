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
  const { user, savePromptRecord, apiKey, history, vocabulary } = useApp();
  const router = useRouter();

  // Force scroll to top on initial page load to prevent scroll position carryover
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // State Manager Custom Hook
  const forgeState = useForgeState(user, router);
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

  // Visual layouts styles
  const backBtn = {
    alignSelf: "auto",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.01)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    padding: "0.45rem 0.9rem",
    borderRadius: "10px",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    margin: 0,
  };

  const draftBannerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem 1.25rem",
    background: "rgba(124, 58, 237, 0.06)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    borderRadius: "14px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    animation: "fade-in 0.3s ease",
  };

  const draftYesBtn = {
    padding: "4px 12px",
    background: "#7c3aed",
    color: "var(--foreground)",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const draftNoBtn = {
    background: "transparent",
    border: "none",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const wizardIconWrap = {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "var(--card)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const mainTitle = {
    fontSize: "1.75rem",
    fontWeight: "800",
    fontFamily: "var(--font-display)",
    color: "var(--foreground)",
    letterSpacing: "-0.02em",
    margin: 0,
  };

  const mainSub = {
    fontSize: "0.9rem",
    color: "var(--muted-foreground)",
    lineHeight: "1.4",
    margin: "0.25rem 0 0 0",
  };

  const wizardContentBody = {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    marginTop: "0.5rem",
  };

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
    <div className="forge-main-container">
      {/* Unified Header Row */}
      {activeMode && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 200px",
            alignItems: "center",
            width: "100%",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "1rem",
            marginBottom: "0.5rem",
          }}
          className="forge-header-row"
        >
          {/* Left: Empty Spacer for Grid */}
          <div style={{ display: "flex", justifyContent: "flex-start" }} />

          {/* Center: Title & Description */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <div style={{ ...wizardIconWrap, width: "38px", height: "38px" }}>
              {activeMode === "application" && (
                <Monitor size={18} style={{ color: "#7c3aed" }} />
              )}
              {activeMode === "page" && (
                <Layout size={18} style={{ color: "#0891b2" }} />
              )}
              {activeMode === "component" && (
                <Code2 size={18} style={{ color: "#6843EC" }} />
              )}
              {activeMode === "enhance" && (
                <Wand2 size={18} style={{ color: "#059669" }} />
              )}
            </div>
            <div style={{ textAlign: "left" }}>
              <h1 style={{ ...mainTitle, fontSize: "1.25rem", lineHeight: "1.2" }}>
                {activeMode === "application" && "Full-Stack Application Architect"}
                {activeMode === "page" && "Web Page Design"}
                {activeMode === "component" && "Modular Component Architect"}
                {activeMode === "enhance" && "Technical Design Specification Enhancer"}
              </h1>
              <p style={{ ...mainSub, fontSize: "0.82rem", marginTop: "0.15rem" }}>
                {activeMode === "application" && "Build a full multi-page application blueprint."}
                {activeMode === "page" && "Design custom web pages with themes & components."}
                {activeMode === "component" && "Configure premium modular interface controls."}
                {activeMode === "enhance" && "Inject layout tokens & motions to draft specifications."}
              </p>
            </div>
          </div>

          {/* Right spacer to balance grid centering */}
          <div style={{ display: "flex", justifyContent: "flex-end" }} />
        </div>
      )}

      {/* Draft Recovery Banner */}
      {showDraftBanner && (
        <div style={draftBannerStyle}>
          <RotateCcw
            size={14}
            style={{ color: "var(--accent)", flexShrink: 0 }}
          />
          <span
            style={{ fontSize: "0.8rem", color: "var(--foreground)", flex: 1 }}
          >
            You have an unfinished forge saved.{" "}
            <strong>Continue where you left off?</strong>
          </span>
          <button
            onClick={applyDraft}
            style={draftYesBtn}
            className="active-scale-95"
          >
            Restore Draft
          </button>
          <button
            onClick={discardDraft}
            style={draftNoBtn}
            className="active-scale-95"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div style={wizardContentBody}>
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

      <style>{`
        .forge-main-container {
          width: 95%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 3rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 100vh;
          position: relative;
        }
        @media (min-width: 1920px) {
          .forge-main-container {
            max-width: 1800px;
          }
        }
        @media (max-width: 900px) {
          .forge-intelligence-rail {
            grid-template-columns: 1fr !important;
          }
          .forge-header-row {
            grid-template-columns: 1fr !important;
            gap: 1rem;
            text-align: center;
          }
          .forge-header-row > div {
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ForgePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            gap: "1rem",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.06)",
              borderTopColor: "var(--accent)",
              animation: "spin-slow 1s linear infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.9rem",
              color: "var(--muted-foreground)",
              fontWeight: 600,
            }}
          >
            Loading {BRAND.name} studio...
          </span>
        </div>
      }
    >
      <ForgeWizardContent />
    </Suspense>
  );
}
