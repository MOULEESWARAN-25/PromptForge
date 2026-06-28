/**
 * Content Registry for Veyntra
 * Houses user-facing descriptive blocks, copy, and messages.
 * Generic button labels (Save, Cancel, Delete, etc.) are defined locally in components.
 */
export const CONTENT = {
  common: {
    loading: {
      default: "Loading requested data...",
      processing: "Processing request, please wait...",
      generating: "Generating your prompt draft using model routing pipeline...",
      saving: "Saving draft..."
    },
    emptyStates: {
      noBlueprints: "No prompt blueprints created yet. Use the Forge Wizard to construct your first blueprint.",
      noSearchResults: "No matches found. Try checking for typos, normalizing spaces, or searching for synonyms.",
      noHistory: "No prompt history records available for this workspace."
    },
    errors: {
      default: "An unexpected error occurred. Please try again.",
      network: "Unable to connect to the backend server. Reconnecting...",
      validation: "Validation failed. Please correct input criteria errors.",
      apiFail: "The model orchestration pipeline is currently unavailable. Offline fallback active."
    },
    notifications: {
      saveSuccess: "Draft compiled and archived successfully.",
      copySuccess: "Prompt copied to clipboard.",
      injectionBlocked: "Security violation blocked: prompt injection pattern detected."
    },
    statusMessages: {
      online: "Supabase connection active.",
      offline: "Offline fallback cache active.",
      saving: "Auto-saving changes...",
      saved: "All edits saved"
    }
  },
  dashboard: {
    title: "SaaS Blueprint Dashboard",
    subtitle: "Orchestrate, evaluate, and deploy production-grade prompts.",
    workspaceHealthTitle: "Workspace Health Overview",
    qualityOverviewDesc: "Consolidated assessment of prompt completeness, accuracy, consistency, and adherence to security guidelines.",
    totalBlueprints: "Total Blueprints",
    totalLines: "Total Lines",
    promptsCompiled: "Prompts Compiled Today",
    activeMode: "Orchestrator Mode"
  },
  chat: {
    title: "AI Prompt Co-Pilot",
    subtitle: "Iterate and preview prompt revisions interactively.",
    revisionSelectorLabel: "Prompt History Revisions",
    refinementInputPlaceholder: "Suggest prompt adjustments (e.g. make styling more glassmorphic, add schema checks)...",
    noTelemetryText: "Observability: Provider names, RAG telemetry, and database latency metrics are hidden in production to prevent technical terminology leaks."
  },
  forge: {
    title: "Forge Wizard",
    subtitle: "Translate natural specifications into robust, production-ready prompts.",
    step1Title: "Core Requirements",
    step1Desc: "Describe the requirements of the page or component.",
    step2Title: "Visual Theme",
    step2Desc: "Customize HSL colors, fonts, and responsiveness.",
    step3Title: "Components Selection",
    step3Desc: "Select standard components to seed into your application configuration."
  },
  vocabulary: {
    title: "Design Vocabulary",
    subtitle: "Find standard vocabulary terminology for layout, state, and visual tokens.",
    searchPlaceholder: "Search layout tokens, theme tokens, styling guidelines...",
    resultsHeader: "Vocabulary Search Results"
  },
  settings: {
    title: "Project Parameters",
    subtitle: "Configure global thresholds, developer mode, and AI optimizer pipelines.",
    modeFastLabel: "Fast Mode",
    modeFastDesc: "Bypass review panels and complexity classifiers for low-latency drafts.",
    modeProLabel: "Professional Mode",
    modeProDesc: "Activate expert review panel and layered validation for production-grade output."
  },
  landing: {
    heroTitle: "Build Production-Ready Prompts with Multi-Agent Orchestration",
    heroSubtitle: "Veyntra handles LLM failover, semantic caching, layered validation, and design vocabulary alignment out-of-the-box.",
    ctaButtonText: "Launch Workspace Console"
  },
  observability: {
    panelTitle: "Workspace Health",
    panelDesc: "Track content coverage, identify knowledge gaps, and verify workspace consistency at a glance.",
    tabs: {
      coverage: "Content Coverage",
      gaps: "Gap Management",
      trends: "Health Trends",
      integrity: "Consistency Audits",
      benchmark: "Benchmark Comparison"
    },
    metrics: {
      health: {
        label: "Workspace Health",
        desc: "Consolidated prompt score based on alignment rules."
      },
      coverage: {
        label: "Content Coverage",
        desc: "Checks for required layout structures (overview, folder map, styling)."
      },
      consistency: {
        label: "Consistency",
        desc: "Ensures HSL tokens, vocabulary terms, and API structures are consistent."
      },
      availability: {
        label: "Availability",
        desc: "Platform status based on failovers and cache efficiency."
      }
    }
  }
};
