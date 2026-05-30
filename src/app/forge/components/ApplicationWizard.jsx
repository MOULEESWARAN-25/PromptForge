'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sliders, Sparkles, Info, ArrowRight, ArrowLeft, Code2, Plus } from 'lucide-react';
import { APP_CATEGORIES, CATEGORY_FEATURES } from '../constants/appCategories';
import { ThemeSelector } from './ThemeSelector';
import { TypographyPicker } from './TypographyPicker';
import { SyncBranchSelector } from './SyncBranchSelector';
import { ThemePreview } from './ThemePreview';

const STEPS = ['Application', 'Features', 'Theme', 'Typography', 'Live Preview', 'Project Setup', 'Generate'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// Shared styles
const sectionWrap = {
  padding: '1.25rem',
  background: 'rgba(255,255,255,0.01)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};
const stepTitle = { fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em' };
const stepDesc  = { fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.4' };

export function ApplicationWizard({ forgeState, promptGeneration, apiKey }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const {
    appCategory, customCategory, setCustomCategory,
    selectedTheme, setSelectedTheme,
    selectedTypography, setSelectedTypography,
    selectedFeatures, customFeatureInput, setCustomFeatureInput,
    projectIntegration, setProjectIntegration,
    framework, setFramework,
    ideSyncPromptCopied, setIdeSyncPromptCopied,
    ideResponseContext, setIdeResponseContext,
    handleCategorySelect, handleFeatureToggle, handleAddCustomFeature
  } = forgeState;

  const { isGenerating, handleForgeSubmit } = promptGeneration;

  const canAdvance = () => {
    if (step === 1) return !!appCategory;
    if (step === 2) return selectedFeatures.length > 0;
    if (step === 3) return !!selectedTheme;
    if (step === 4) return !!selectedTypography;
    if (step === 5) return true; // Live Preview always can advance
    if (step === 6) return !!projectIntegration;
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, 7));
  };

  const goBack = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  // Category card styles
  const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' };
  const categoryCard = (isSelected) => ({
    position: 'relative', height: '85px', borderRadius: '14px',
    border: isSelected ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.06)',
    background: isSelected ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.01)',
    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    boxShadow: isSelected ? '0 0 20px rgba(124,58,237,0.2)' : 'none',
  });
  const checkboxCard = (isChecked) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem',
    borderRadius: '10px', border: isChecked ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.04)',
    background: isChecked ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.01)',
    cursor: 'pointer', transition: 'all 0.2s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Step progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: '700', transition: 'all 0.3s ease',
                  background: done ? '#7c3aed' : active ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                  border: active ? '2px solid #7c3aed' : done ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                  color: done || active ? '#fff' : 'var(--muted-foreground)',
                }}>
                  {done ? <CheckCircle2 size={11} /> : n}
                </div>
                <span style={{ fontSize: '0.55rem', color: active ? 'var(--accent)' : 'var(--muted-foreground)', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: '20px', height: '1px', background: step > n ? '#7c3aed' : 'rgba(255,255,255,0.08)', marginBottom: '16px', transition: 'background 0.3s ease' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Animated step panel */}
      <div style={{ ...sectionWrap, overflow: 'hidden', minHeight: '260px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── Step 1: Application Type ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Select Application Type</h3>
                  <p style={stepDesc}>What kind of digital product are you building?</p>
                </div>
                <div style={categoryGrid}>
                  {APP_CATEGORIES.map((cat) => {
                    const isSelected = appCategory === cat.id;
                    return (
                      <div key={cat.id} style={categoryCard(isSelected)}
                         onClick={() => handleCategorySelect(cat.id)}
                         className="bento-card-premium glow-card-spotlight active-scale-95"
                      >
                        {cat.image
                          ? <img src={cat.image} alt={cat.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
                          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Code2 size={22} style={{ color: 'rgba(255,255,255,0.12)' }} /></div>
                        }
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', zIndex: 1 }} />
                        {isSelected && <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', zIndex: 3 }}><CheckCircle2 size={13} style={{ color: '#fbbf24' }} /></div>}
                        <div style={{ padding: '0.6rem', zIndex: 2 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>{cat.label}</span>
                          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '1px', lineHeight: '1.3' }}>{cat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {appCategory === 'Custom' && (
                  <div className="animate-fade-up" style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.35rem' }}>
                      Describe your custom application
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vintage Synthesizer Controller Workspace"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      style={{ width: '100%', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--foreground)', outline: 'none' }}
                      className="glass-input"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Features Checklist ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Select Features & Components</h3>
                  <p style={stepDesc}>Choose the core modules to integrate into your application blueprint.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {(CATEGORY_FEATURES[appCategory] || CATEGORY_FEATURES['Custom'] || []).map((feature, idx) => {
                    const isChecked = selectedFeatures.includes(feature);
                    return (
                      <div key={idx} style={checkboxCard(isChecked)} onClick={() => handleFeatureToggle(feature)} className="active-scale-95">
                        <CheckCircle2 size={13} style={{ color: isChecked ? '#7c3aed' : 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: '500' }}>{feature}</span>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleAddCustomFeature} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input type="text" placeholder="Add custom feature..." value={customFeatureInput} onChange={(e) => setCustomFeatureInput(e.target.value)} style={{ flex: 1, background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.65rem', fontSize: '0.8rem', color: 'var(--foreground)', outline: 'none' }} className="glass-input" />
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} className="btn-secondary btn-sm"><Plus size={14} />Add</button>
                </form>
              </div>
            )}

            {/* ── Step 3: Theme ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Choose Visual Theme</h3>
                  <p style={stepDesc}>Define the overall aesthetic and design token palette.</p>
                </div>
                <ThemeSelector
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  activeMode="application"
                  appCategory={appCategory}
                  customCategory={customCategory}
                  selectedTypography={selectedTypography}
                  hidePreview={true}
                />
              </div>
            )}

            {/* ── Step 4: Typography ── */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Typography System</h3>
                  <p style={stepDesc}>Select the typeface that signals your product's intent. This affects both the visual preview and the generated prompt.</p>
                </div>
                <TypographyPicker
                  selectedTypography={selectedTypography}
                  setSelectedTypography={setSelectedTypography}
                />
              </div>
            )}

            {/* ── Step 5: Live Preview ── */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Live Preview</h3>
                  <p style={stepDesc}>Review how your selected components, theme, and typography integrate into a cohesive mockup.</p>
                </div>
                <ThemePreview 
                  selectedTheme={selectedTheme} 
                  activeMode="application" 
                  appCategory={appCategory} 
                  customCategory={customCategory}
                  selectedTypography={selectedTypography} 
                  selectedFeatures={selectedFeatures} 
                />
              </div>
            )}

            {/* ── Step 6: Existing Project Setup ── */}
            {step === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Project Setup</h3>
                  <p style={stepDesc}>Are you building from scratch or integrating into an existing codebase?</p>
                </div>
                <SyncBranchSelector
                  activeMode="application"
                  appCategory={appCategory}
                  projectIntegration={projectIntegration}
                  setProjectIntegration={setProjectIntegration}
                  framework={framework}
                  setFramework={setFramework}
                  ideSyncPromptCopied={ideSyncPromptCopied}
                  setIdeSyncPromptCopied={setIdeSyncPromptCopied}
                  ideResponseContext={ideResponseContext}
                  setIdeResponseContext={setIdeResponseContext}
                />
              </div>
            )}

            {/* ── Step 7: Generate ── */}
            {step === 7 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Ready to Compile</h3>
                  <p style={stepDesc}>Your selections are loaded. PromptForge will run the full RAG pipeline and generate a production-grade prompt.</p>
                </div>
                {/* Summary pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    { label: 'App', value: appCategory === 'Custom' ? (customCategory || 'Custom') : appCategory },
                    { label: 'Theme', value: selectedTheme },
                    { label: 'Font', value: selectedTypography },
                    { label: 'Project', value: projectIntegration === 'existing' ? `Existing · ${framework}` : 'New Project' },
                  ].map(({ label, value }) => value && (
                    <span key={label} style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--accent)', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', padding: '3px 10px' }}>
                      {label}: {value}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-foreground)', justifyContent: 'center' }}>
                  <Info size={15} />
                  {apiKey ? 'Live Gemini Compiler active.' : 'Offline Prompt Compiler active.'}
                </div>
                <button
                  onClick={handleForgeSubmit}
                  className="btn-accent shine-effect"
                  disabled={isGenerating}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--accent)', color: 'var(--accent-foreground)', transition: 'all 0.2s ease' }}
                >
                  {isGenerating
                    ? <><Sliders size={18} className="animate-spin" /> Compiling Application Blueprint...</>
                    : <><Sparkles size={18} /> Generate Application Prompt</>
                  }
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back / Next navigation */}
      {step < 7 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button
            onClick={goBack}
            disabled={step === 1}
            className="active-scale-95"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: step === 1 ? 'rgba(255,255,255,0.2)' : 'var(--muted-foreground)', fontSize: '0.85rem', fontWeight: '600', cursor: step === 1 ? 'default' : 'pointer', transition: 'all 0.2s ease' }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <button
            onClick={goNext}
            disabled={!canAdvance()}
            className="active-scale-95"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', background: canAdvance() ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: canAdvance() ? '#fff' : 'rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: '700', cursor: canAdvance() ? 'pointer' : 'default', transition: 'all 0.2s ease' }}
          >
            {step === 6 ? 'Review' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
