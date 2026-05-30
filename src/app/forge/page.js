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

  if (!user) return null;

  const currentStep = getStep();

  const STEP_LABELS = activeMode === 'application'
    ? ['Purpose', 'Theme', 'Features', 'Generate']
    : activeMode === 'page'
    ? ['Page Type', 'Components', 'Theme', 'Sync', 'Generate']
    : activeMode === 'component'
    ? ['Type', 'Theme', 'Sync', 'Generate']
    : ['Input', 'Analyze', 'Enhance', 'Generate'];

  // Visual layouts styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem 6rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    minHeight: '100vh',
    position: 'relative'
  };

  const backBtn = {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const draftBannerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
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

  const stepProgressWrapper = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1.25rem 2rem',
    background: 'rgba(255, 255, 255, 0.01)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    alignSelf: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    flexWrap: 'wrap'
  };

  const wizardHeader = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start'
  };

  const wizardTitleRow = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  };

  const wizardIconWrap = {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const mainTitle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    color: 'var(--foreground)',
    letterSpacing: '-0.02em'
  };

  const mainSub = {
    fontSize: '0.85rem',
    color: 'var(--muted-foreground)',
    lineHeight: '1.4'
  };

  const wizardContentBody = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    marginTop: '0.5rem'
  };

  return (
    <div style={containerStyle}>
      <button 
        style={backBtn} 
        onClick={() => {
          if (activeMode) {
            setActiveMode(null);
            localStorage.removeItem('promptforge_wmode');
            router.push('/forge');
          } else {
            router.push('/dashboard');
          }
        }}
        className="active-scale-95 glow-card-spotlight"
      >
        <ArrowLeft size={16} />
        {activeMode ? 'Back to Selection' : 'Back to Dashboard'}
      </button>

      {/* Draft Recovery Banner */}
      {showDraftBanner && (
        <div style={draftBannerStyle}>
          <RotateCcw size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', flex: 1 }}>
            You have an unfinished forge saved. <strong>Continue where you left off?</strong>
          </span>
          <button onClick={applyDraft} style={draftYesBtn} className="active-scale-95">Restore Draft</button>
          <button onClick={discardDraft} style={draftNoBtn} className="active-scale-95"><X size={14} /></button>
        </div>
      )}

      {/* Step Progress Indicator (Application + Page + Component modes) */}
      {activeMode && activeMode !== 'enhance' && (
        <div style={stepProgressWrapper}>
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            return (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div className={`step-dot ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}>
                    {isCompleted ? <CheckCircle2 size={13} /> : stepNum}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: isActive ? 'var(--accent)' : 'var(--muted-foreground)', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`step-connector ${isCompleted ? 'completed' : ''}`} style={{ marginBottom: '18px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {activeMode && (
        <div style={wizardHeader}>
          <div style={wizardTitleRow}>
            <div style={wizardIconWrap}>
              {activeMode === 'application' && <Monitor size={22} style={{ color: '#7c3aed' }} />}
              {activeMode === 'page' && <Layout size={22} style={{ color: '#0891b2' }} />}
              {activeMode === 'component' && <Code2 size={22} style={{ color: '#ec4899' }} />}
              {activeMode === 'enhance' && <Wand2 size={22} style={{ color: '#059669' }} />}
            </div>
            <div>
              <h1 style={mainTitle}>
                {activeMode === 'application' && "Full-Stack Application Architect"}
                {activeMode === 'page' && "Web Page Design"}
                {activeMode === 'component' && "Modular Component Architect"}
                {activeMode === 'enhance' && "Technical Design Prompt Enhancer"}
              </h1>
              <p style={mainSub}>
                {activeMode === 'application' && "Build a full multi-page application blueprint, features list, and data schema."}
                {activeMode === 'page' && "1. Select type of page, 2. Select components, 3. Select theme, 4. Sync setup, 5. Generate."}
                {activeMode === 'component' && "1. Select component, 2. Select theme, 3. Sync setup, 4. Generate prompt."}
                {activeMode === 'enhance' && "Inject spring transitions, layout variables, and HSL tokens into standard prompt drafts."}
              </p>
            </div>
          </div>
        </div>
      )}

      {!activeMode && (
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
            Choose Your <span style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prompt Workspace</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted-foreground)', marginTop: '0.5rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
            Select one of our specialized AI design pipelines to translate visual concepts into production-ready prompts.
          </p>
        </div>
      )}

      <div style={wizardContentBody}>
        {/* Bento selection grid screen */}
        {!activeMode && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '0.5rem', width: '100%' }}>
            {[
              {
                id: 'application',
                title: 'Full-Stack Application Architect',
                desc: 'Plan an entire digital product: page layouts, responsive blueprints, user role parameters, and backend schemas.',
                icon: <Monitor size={28} />,
                color: '#7c3aed',
                bg: 'rgba(124, 58, 237, 0.03)',
                borderColor: 'rgba(124, 58, 237, 0.12)'
              },
              {
                id: 'page',
                title: 'Single Web Page Planner',
                desc: 'Generate individual web pages with high-fidelity grid structures: pricing matrices, dashboards, and settings pages.',
                icon: <Layout size={28} />,
                color: '#0891b2',
                bg: 'rgba(8, 145, 178, 0.03)',
                borderColor: 'rgba(8, 145, 178, 0.12)'
              },
              {
                id: 'component',
                title: 'Modular Single Component',
                desc: 'Construct targeted reusable UI controls: command palettes, glassmorphic modals, and accessibly animated menus.',
                icon: <Code2 size={28} />,
                color: '#ec4899',
                bg: 'rgba(236, 72, 153, 0.03)',
                borderColor: 'rgba(236, 72, 153, 0.12)'
              },
              {
                id: 'enhance',
                title: 'Technical Design Prompt Enhancer',
                desc: 'Inject technical styles, spring motions, and HSL tokens into an existing or draft development prompt.',
                icon: <Wand2 size={28} />,
                color: '#059669',
                bg: 'rgba(5, 150, 105, 0.03)',
                borderColor: 'rgba(5, 150, 105, 0.12)'
              }
            ].map((mode) => (
              <div
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id);
                  localStorage.setItem('promptforge_wmode', mode.id);
                  track('mode_selected', { mode: mode.id });
                }}
                className="bento-card-premium glow-card-spotlight active-scale-95"
                style={{
                  padding: '2.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: mode.bg,
                  border: `1px solid ${mode.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: mode.color,
                  boxShadow: `0 0 20px ${mode.bg}`
                }}>
                  {mode.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '750', color: 'var(--foreground)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                    {mode.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.5rem', lineHeight: '1.6' }}>
                    {mode.desc}
                  </p>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: mode.color, fontWeight: '700', fontSize: '0.85rem' }}>
                  Open Workspace
                  <ChevronRight size={14} style={{ transition: 'transform 0.2s ease' }} className="chevron" />
                </div>
              </div>
            ))}
          </div>
        )}

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
