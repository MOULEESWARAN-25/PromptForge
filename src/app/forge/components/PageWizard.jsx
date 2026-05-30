'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Plus, Sliders, Sparkles, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { PAGE_TYPES, PAGE_COMPONENTS } from '../constants/pageTemplates';
import { ThemeSelector } from './ThemeSelector';
import { TypographyPicker } from './TypographyPicker';
import { SyncBranchSelector } from './SyncBranchSelector';

const STEPS = ['Page Type', 'Components', 'Theme', 'Typography', 'Project Setup', 'Generate'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const sectionWrap = {
  padding: '2rem',
  background: 'rgba(255,255,255,0.01)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};
const stepTitle = { fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em' };
const stepDesc  = { fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.4' };

export function PageWizard({ forgeState, promptGeneration, apiKey }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const {
    pageType, setPageType,
    selectedTheme, setSelectedTheme,
    selectedTypography, setSelectedTypography,
    selectedComponents, customComponentInput, setCustomComponentInput,
    projectIntegration, setProjectIntegration,
    framework, setFramework,
    ideSyncPromptCopied, setIdeSyncPromptCopied,
    ideResponseContext, setIdeResponseContext,
    handleComponentToggle, handleAddCustomComponent,
  } = forgeState;

  const { isGenerating, handleForgeSubmit } = promptGeneration;

  const canAdvance = () => {
    if (step === 1) return !!pageType;
    if (step === 2) return selectedComponents.length > 0;
    if (step === 3) return !!selectedTheme;
    if (step === 4) return !!selectedTypography;
    if (step === 5) return !!projectIntegration;
    return true;
  };

  const goNext = () => { if (canAdvance()) { setDirection(1); setStep(s => Math.min(s + 1, 6)); } };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' };
  const categoryCard = (isSelected) => ({
    position: 'relative', height: '110px', borderRadius: '14px',
    border: isSelected ? '2px solid #0891b2' : '1px solid rgba(255,255,255,0.06)',
    background: isSelected ? 'rgba(8,145,178,0.06)' : 'rgba(255,255,255,0.01)',
    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    boxShadow: isSelected ? '0 0 16px rgba(8,145,178,0.2)' : 'none',
  });
  const checkboxCard = (isChecked) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
    borderRadius: '10px', border: isChecked ? '1px solid #0891b2' : '1px solid rgba(255,255,255,0.04)',
    background: isChecked ? 'rgba(8,145,178,0.05)' : 'rgba(255,255,255,0.01)',
    cursor: 'pointer', transition: 'all 0.2s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n; const active = step === n;
          return (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700', transition: 'all 0.3s ease', background: done ? '#0891b2' : active ? 'rgba(8,145,178,0.15)' : 'rgba(255,255,255,0.04)', border: active ? '2px solid #0891b2' : done ? '2px solid #0891b2' : '1px solid rgba(255,255,255,0.1)', color: done || active ? '#fff' : 'var(--muted-foreground)' }}>
                  {done ? <CheckCircle2 size={11} /> : n}
                </div>
                <span style={{ fontSize: '0.55rem', color: active ? '#0891b2' : 'var(--muted-foreground)', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ width: '20px', height: '1px', background: step > n ? '#0891b2' : 'rgba(255,255,255,0.08)', marginBottom: '16px', transition: 'background 0.3s ease' }} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Animated panel */}
      <div style={{ ...sectionWrap, overflow: 'hidden', minHeight: '300px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>

            {/* Step 1 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div><h3 style={stepTitle}>Select Page Type</h3><p style={stepDesc}>What interface layout are you structuring?</p></div>
                <div style={categoryGrid}>
                  {PAGE_TYPES.map((page) => {
                    const isSelected = pageType === page.id;
                    return (
                      <div key={page.id} style={categoryCard(isSelected)} onClick={() => setPageType(page.id)} className="bento-card-premium glow-card-spotlight active-scale-95">
                        {page.image && <img src={page.image} alt={page.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', zIndex: 1 }} />
                        {isSelected && <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', zIndex: 3 }}><CheckCircle2 size={15} style={{ color: '#fbbf24' }} /></div>}
                        <div style={{ padding: '0.75rem', zIndex: 2 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff' }}>{page.label}</span>
                          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px', lineHeight: '1.3' }}>{page.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div><h3 style={stepTitle}>Select Components</h3><p style={stepDesc}>Choose the modular blocks for this page.</p></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.65rem' }}>
                  {(PAGE_COMPONENTS[pageType] || []).map((comp, idx) => {
                    const isChecked = selectedComponents.includes(comp);
                    return (
                      <div key={idx} style={checkboxCard(isChecked)} onClick={() => handleComponentToggle(comp)} className="active-scale-95">
                        <CheckCircle2 size={15} style={{ color: isChecked ? '#0891b2' : 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: '500' }}>{comp}</span>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleAddCustomComponent} style={{ display: 'flex', gap: '0.75rem' }}>
                  <input type="text" placeholder="Add custom component..." value={customComponentInput} onChange={(e) => setCustomComponentInput(e.target.value)} style={{ flex: 1, background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--foreground)', outline: 'none' }} className="glass-input" />
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} className="btn-secondary btn-sm"><Plus size={14} />Add</button>
                </form>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div><h3 style={stepTitle}>Choose Theme</h3><p style={stepDesc}>Apply visual design tokens and HSL profiles.</p></div>
                <ThemeSelector selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} activeMode="page" pageType={pageType} selectedTypography={selectedTypography} />
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div><h3 style={stepTitle}>Typography System</h3><p style={stepDesc}>Your font choice signals intent to the AI generator.</p></div>
                <TypographyPicker selectedTypography={selectedTypography} setSelectedTypography={setSelectedTypography} />
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div><h3 style={stepTitle}>Project Setup</h3><p style={stepDesc}>New project or existing codebase integration?</p></div>
                <SyncBranchSelector activeMode="page" pageType={pageType} projectIntegration={projectIntegration} setProjectIntegration={setProjectIntegration} framework={framework} setFramework={setFramework} ideSyncPromptCopied={ideSyncPromptCopied} setIdeSyncPromptCopied={setIdeSyncPromptCopied} ideResponseContext={ideResponseContext} setIdeResponseContext={setIdeResponseContext} />
              </div>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div><h3 style={stepTitle}>Ready to Compile</h3><p style={stepDesc}>Review your selections and generate the prompt.</p></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[{ label: 'Page', value: pageType }, { label: 'Components', value: `${selectedComponents.length} selected` }, { label: 'Theme', value: selectedTheme }, { label: 'Font', value: selectedTypography }, { label: 'Project', value: projectIntegration === 'existing' ? `Existing · ${framework}` : 'New' }].map(({ label, value }) => value && (
                    <span key={label} style={{ fontSize: '0.72rem', fontWeight: '600', color: '#0891b2', background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '8px', padding: '3px 10px' }}>{label}: {value}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-foreground)', justifyContent: 'center' }}><Info size={15} />{apiKey ? 'Live Gemini Compiler active.' : 'Offline Prompt Compiler active.'}</div>
                <button onClick={handleForgeSubmit} className="btn-accent shine-effect" disabled={isGenerating} style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0891b2', color: '#fff', transition: 'all 0.2s ease' }}>
                  {isGenerating ? <><Sliders size={18} className="animate-spin" />Forging Page Blueprint...</> : <><Sparkles size={18} />Generate Page Prompt</>}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 6 && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={goBack} disabled={step === 1} className="active-scale-95" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: step === 1 ? 'rgba(255,255,255,0.2)' : 'var(--muted-foreground)', fontSize: '0.85rem', fontWeight: '600', cursor: step === 1 ? 'default' : 'pointer', transition: 'all 0.2s ease' }}>
            <ArrowLeft size={15} />Back
          </button>
          <button onClick={goNext} disabled={!canAdvance()} className="active-scale-95" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', background: canAdvance() ? '#0891b2' : 'rgba(255,255,255,0.05)', color: canAdvance() ? '#fff' : 'rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: '700', cursor: canAdvance() ? 'pointer' : 'default', transition: 'all 0.2s ease' }}>
            {step === 5 ? 'Review' : 'Continue'}<ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
