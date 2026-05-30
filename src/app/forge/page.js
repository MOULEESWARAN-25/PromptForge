"use client";

import React, { Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Monitor, Layout, Code2, Wand2, ChevronRight, CheckCircle2, RotateCcw, X
} from 'lucide-react';
import { track } from '@/lib/analytics';

// Custom Hooks & Components
import { useForgeState } from './hooks/useForgeState';
import { usePromptGeneration } from './hooks/usePromptGeneration';
import { ApplicationWizard } from './components/ApplicationWizard';
import { PageWizard } from './components/PageWizard';
import { ComponentWizard } from './components/ComponentWizard';
import { PromptEnhancer } from './components/PromptEnhancer';

function ForgeWizardContent() {
  const { user, savePromptRecord, apiKey } = useApp();
  const router = useRouter();

  // State Manager Custom Hook
  const forgeState = useForgeState(user, router);
  const {
    activeMode,
    setActiveMode,
    showDraftBanner,
    applyDraft,
    discardDraft,
    getStep
  } = forgeState;

  // Compilation & Generation Custom Hook
  const promptGeneration = usePromptGeneration({
    savePromptRecord,
    apiKey,
    router,
    forgeState
  });

  // Advanced settings are now visible to all users by default
  const isAdvanced = true;

  if (!user) return null;

  const currentStep = getStep();

  const STEP_LABELS = activeMode === 'application'
    ? ['Application', 'Theme', 'Typography', 'Project Setup', 'Generate']
    : activeMode === 'page'
    ? ['Page Type', 'Components', 'Theme', 'Typography', 'Project Setup', 'Generate']
    : activeMode === 'component'
    ? ['Type', 'Theme', 'Generate']
    : ['Input', 'Analyze', 'Enhance', 'Generate'];

  // Visual layouts styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1.25rem 1.5rem 3rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '100vh',
    position: 'relative'
  };

  const backBtn = {
    alignSelf: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '0.45rem 0.9rem',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    margin: 0
  };

  const draftBannerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1.25rem',
    background: 'rgba(124, 58, 237, 0.06)',
    border: '1px solid rgba(124, 58, 237, 0.15)',
    borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    animation: 'fade-in 0.3s ease',
  };

  const draftYesBtn = {
    padding: '4px 12px',
    background: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const draftNoBtn = {
    background: 'transparent',
    border: 'none',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const wizardIconWrap = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const mainTitle = {
    fontSize: '1.15rem',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    color: 'var(--foreground)',
    letterSpacing: '-0.02em',
    margin: 0
  };

  const mainSub = {
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    lineHeight: '1.3',
    margin: 0
  };

  const wizardContentBody = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '0.25rem'
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button 
          style={backBtn} 
          onClick={() => {
            router.push('/dashboard');
          }}
          className="active-scale-95 glow-card-spotlight"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>

        {activeMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={wizardIconWrap}>
              {activeMode === 'application' && <Monitor size={18} style={{ color: '#7c3aed' }} />}
              {activeMode === 'page' && <Layout size={18} style={{ color: '#0891b2' }} />}
              {activeMode === 'component' && <Code2 size={18} style={{ color: '#ec4899' }} />}
              {activeMode === 'enhance' && <Wand2 size={18} style={{ color: '#059669' }} />}
            </div>
            <div>
              <h1 style={mainTitle}>
                {activeMode === 'application' && "Full-Stack Application Architect"}
                {activeMode === 'page' && "Web Page Design"}
                {activeMode === 'component' && "Modular Component Architect"}
                {activeMode === 'enhance' && "Technical Design Prompt Enhancer"}
              </h1>
              <p style={mainSub}>
                {activeMode === 'application' && "Build a full multi-page application blueprint."}
                {activeMode === 'page' && "Design custom web pages with themes & components."}
                {activeMode === 'component' && "Configure premium modular interface controls."}
                {activeMode === 'enhance' && "Inject layout tokens & motions to prompt drafts."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Draft Recovery Banner */}
      {showDraftBanner && (
        <div style={draftBannerStyle}>
          <RotateCcw size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', flex: 1 }}>
            You have an unfinished forge saved. <strong>Continue where you left off?</strong>
          </span>
          <button onClick={applyDraft} style={draftYesBtn} className="active-scale-95">Restore Draft</button>
          <button onClick={discardDraft} style={draftNoBtn} className="active-scale-95"><X size={14} /></button>
        </div>
      )}

      <div style={wizardContentBody}>

        {/* Wizard Pipeline Views */}
        {activeMode === 'application' && (
          <ApplicationWizard
            forgeState={forgeState}
            promptGeneration={promptGeneration}
            apiKey={apiKey}
          />
        )}

        {activeMode === 'page' && (
          <PageWizard
            forgeState={forgeState}
            promptGeneration={promptGeneration}
            apiKey={apiKey}
          />
        )}

        {activeMode === 'component' && (
          <ComponentWizard
            forgeState={forgeState}
            promptGeneration={promptGeneration}
            apiKey={apiKey}
            isAdvanced={isAdvanced}
          />
        )}

        {activeMode === 'enhance' && (
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
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '1rem', flexDirection: 'column' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.06)', borderTopColor: 'var(--accent)', animation: 'spin-slow 1s linear infinite' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>Loading PromptForge workstation...</span>
      </div>
    }>
      <ForgeWizardContent />
    </Suspense>
  );
}
