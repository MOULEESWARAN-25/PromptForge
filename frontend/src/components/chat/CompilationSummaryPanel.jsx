"use client";

import React from "react";
import { BRAND } from "@/config/brand";

export default function CompilationSummaryPanel({ promptRecord }) {
  const ragDetails = promptRecord?.ragDetails || {};
  const compileContext = ragDetails.compileContext || {};
  const technicalTerms = ragDetails.technicalTerms || [];
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

  return (
    <div className="p-4 md:px-5 border-b border-border bg-accent/3 glass-panel animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-extrabold tracking-wider uppercase text-accent mb-1">
            Compilation Summary
          </div>
          <div className="text-sm font-extrabold text-foreground">
            What {BRAND.name} compiled into this blueprint
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-card border ${
              retrievalConfidence >= 85
                ? "text-success border-success/30"
                : retrievalConfidence >= 70
                  ? "text-accent border-accent/30"
                  : "text-warning border-warning/30"
            }`}
          >
            Retrieval Confidence: {confidenceLabel} ({retrievalConfidence}%)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border bg-card text-xs font-bold text-foreground">
            Mode: {promptRecord.mode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3.5">
        <div className="bg-card border border-border rounded-[14px] p-3.5 md:p-4 flex flex-col gap-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Detected Project Context
          </div>
          <div className="flex flex-col gap-1 text-[12.5px] text-foreground leading-relaxed">
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

        <div className="bg-card border border-border rounded-[14px] p-3.5 md:p-4 flex flex-col gap-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Prompt Quality Visibility
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border text-[11px] text-foreground font-semibold">
              {technicalTerms.length} design terms
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border text-[11px] text-foreground font-semibold">
              {layoutRules.length} layout rules
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border text-[11px] text-foreground font-semibold">
              {accessibilityRules.length} accessibility rules
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border text-[11px] text-foreground font-semibold">
              {motionRules.length} motion rules
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border text-[11px] text-foreground font-semibold">
              {frameworkRules.length} framework rules
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-3.5 md:p-4 flex flex-col gap-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Today You Learned
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(technicalTerms.slice(0, 4).length > 0
              ? technicalTerms.slice(0, 4)
              : ["No retrieved vocabulary yet"]
            ).map((term) => (
              <span
                key={term}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border text-[11px] text-foreground font-semibold"
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-3.5 md:p-4 flex flex-col gap-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Applied Rules
          </div>
          <div className="flex flex-col gap-1 text-[12.5px] text-foreground leading-relaxed">
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
