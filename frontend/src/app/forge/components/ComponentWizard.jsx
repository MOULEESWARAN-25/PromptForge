'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWizardAutoScroll } from '../hooks/useWizardAutoScroll';

import { CheckCircle2, Sliders, Sparkles, Info, ArrowRight, ArrowLeft, Code2, Search } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import ShadcnDropdown from '@/components/ShadcnDropdown';
import { ThemeSelector } from './ThemeSelector';
import { TypographyPicker } from './TypographyPicker';
import { SyncBranchSelector } from './SyncBranchSelector';
import { ThemePreview } from './ThemePreview';

const STEPS = ['Component Type', 'Theme', 'Typography', 'Live Preview', 'Project Setup', 'Review'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const sectionWrap = {
  padding: '1.25rem',
  background: 'var(--card)',
  backdropFilter: 'blur(20px)',
  border: '1px solid var(--border)',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-md)',
};

const stepTitle = { fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em' };
const stepDesc  = { fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.4' };

const StepperWrapper = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '0.75rem 1.25rem',
  width: '100%',
  gap: '0.45rem',
  flexWrap: 'wrap',
  boxShadow: 'var(--shadow-sm)',
  boxSizing: 'border-box',
};

const stepItemStyle = (isActive, isDone) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.35rem 0.75rem',
  borderRadius: '10px',
  background: isActive 
    ? 'var(--accent)' 
    : isDone 
      ? 'color-mix(in srgb, var(--success) 6%, transparent)' 
      : 'var(--input)',
  border: isActive 
    ? '1px solid var(--accent)' 
    : isDone 
      ? '1px solid var(--success)' 
      : '1px solid transparent',
  color: isActive 
    ? 'var(--accent-foreground)' 
    : isDone 
      ? 'var(--success)' 
      : 'var(--muted-foreground)',
  fontSize: '0.75rem',
  fontWeight: '600',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.25s ease',
});

const connectorStyle = (isPassed) => ({
  flex: '1 1 10px',
  height: '2px',
  background: isPassed 
    ? 'linear-gradient(90deg, var(--success), var(--accent))' 
    : 'var(--border)',
  minWidth: '8px',
  maxWidth: '32px',
  transition: 'all 0.3s ease',
});

export function ComponentWizard({ forgeState, promptGeneration, apiKey, isAdvanced = false }) {
  const { components } = useApp();
  const { COMPONENT_TYPES } = components;
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [componentSearch, setComponentSearch] = useState('');
  const router = useRouter();

  const continueButtonRef = useRef(null);

  useWizardAutoScroll({
    step,
    selectionDependencies: [
      forgeState.componentType,
      forgeState.selectedTheme,
      forgeState.selectedTypography
    ],
    continueButtonRef
  });


  const {
    componentType, setComponentType,
    customComponentType, setCustomComponentType,
    selectedTheme, setSelectedTheme,
    selectedTypography, setSelectedTypography,
    projectIntegration, setProjectIntegration,
    framework, setFramework,
    ideSyncPromptCopied, setIdeSyncPromptCopied,
    ideResponseContext, setIdeResponseContext,
    projectName, setProjectName,
    projectDescription, setProjectDescription,
    frontendStack, setFrontendStack,
    backendStack, setBackendStack,
    database, setDatabase,
    authOption, setAuthOption,
    deployment, setDeployment,
    additionalFeatures, setAdditionalFeatures,
    selectedModel, setSelectedModel
  } = forgeState;

  const { isGenerating, handleForgeSubmit } = promptGeneration;

  const canAdvance = () => {
    if (step === 1) return !!componentType && (componentType !== 'Custom Component' || !!customComponentType.trim());
    if (step === 2) return !!selectedTheme;
    if (step === 3) return !!selectedTypography;
    if (step === 4) return true; // Live Preview step can always advance
    if (step === 5) return true; // Project Setup is always valid
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, 6));
  };

  const goBack = () => {
    if (step === 1) {
      router.push('/dashboard?action=create');
      return;
    }
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  const categoryCard = (isSelected) => ({
    position: 'relative',
    borderRadius: '12px',
    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
    background: isSelected ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--card)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    boxShadow: isSelected ? '0 0 16px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Stripe-style horizontal progress stepper */}
      <div style={StepperWrapper}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <React.Fragment key={label}>
              <div 
                style={{
                  ...stepItemStyle(active, done),
                  cursor: done ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (done) {
                    setDirection(-1);
                    setStep(n);
                  }
                }}
                className={done ? "active-scale-95" : ""}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.62rem', fontWeight: '800', transition: 'all 0.3s ease',
                  background: done ? 'var(--success)' : active ? 'var(--accent-foreground)' : 'var(--input)',
                  color: done ? '#ffffff' : active ? 'var(--accent)' : 'var(--muted-foreground)',
                }}>
                  {done ? <CheckCircle2 size={10} style={{ color: '#ffffff' }} /> : n}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={connectorStyle(step > n)} />
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
            {/* ── Step 1: Component Type ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <h3 style={stepTitle}>Select Component Type</h3>
                    <p style={stepDesc}>What kind of modular interactive component are you designing?</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.55rem 0.85rem', width: '280px', flexShrink: 0 }}>
                    <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Search component templates..."
                      value={componentSearch}
                      onChange={(e) => setComponentSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)' }}
                    />
                    {componentSearch && (
                      <span onClick={() => setComponentSearch('')} style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 600 }}>Clear</span>
                    )}
                  </div>
                </div>

                <div className="category-grid" style={{ gap: '1rem' }}>
                  {COMPONENT_TYPES.filter(comp =>
                    comp.label.toLowerCase().includes(componentSearch.toLowerCase()) ||
                    comp.desc.toLowerCase().includes(componentSearch.toLowerCase())
                  ).map((comp) => {
                    const isSelected = componentType === comp.id;
                    return (
                      <div
                        key={comp.id}
                        style={categoryCard(isSelected)}
                        onClick={() => setComponentType(comp.id)}
                        className={`category-card bento-card-premium glow-card-spotlight active-scale-95 ${isSelected ? 'selected' : ''}`}
                      >
                        {comp.image && <img src={comp.image} alt={comp.label} className="card-artwork" />}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.3), transparent)', zIndex: 1 }} />
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', zIndex: 3 }}>
                            <CheckCircle2 size={15} style={{ color: '#ffffff' }} />
                          </div>
                        )}
                        <div style={{ padding: '0.85rem', zIndex: 2 }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', display: 'block', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                            {comp.label}
                          </span>
                          <p style={{ fontSize: '0.72rem', color: '#e4e4e7', marginTop: '0.25rem', lineHeight: '1.4', textShadow: '0 1px 2px rgba(0,0,0,0.6)', margin: 0 }}>
                            {comp.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {componentType === 'Custom Component' && (
                  <div className="animate-fade-up" style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.35rem' }}>
                      Describe your custom component
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Floating Action Button with circular dial options"
                      value={customComponentType}
                      onChange={(e) => setCustomComponentType(e.target.value)}
                      style={{ width: '100%', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--foreground)', outline: 'none' }}
                      className="glass-input"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Theme Selector ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <ThemeSelector
                  headerTitle="Choose Visual Theme"
                  headerDescription="Select the visual design style and HSL tokens to apply to the component."
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  activeMode="component"
                  componentType={componentType}
                  selectedTypography={selectedTypography}
                  hidePreview={true}
                />
              </div>
            )}

            {/* ── Step 3: Typography Picker ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Select Typography</h3>
                  <p style={stepDesc}>Choose a clean, responsive font system optimized for user interfaces.</p>
                </div>
                <TypographyPicker
                  selectedTypography={selectedTypography}
                  setSelectedTypography={setSelectedTypography}
                />
              </div>
            )}

            {/* ── Step 4: Live Preview ── */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Live Preview</h3>
                  <p style={stepDesc}>Check how your theme and typography choices affect standard component mockups.</p>
                </div>
                <ThemePreview
                  selectedTheme={selectedTheme}
                  activeMode="component"
                  componentType={componentType}
                  customComponentType={customComponentType}
                  selectedTypography={selectedTypography}
                />
              </div>
            )}

            {/* ── Step 5: Project Setup ── */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Project Setup</h3>
                  <p style={stepDesc}>Configure project syncing options or bootstrap standalone configurations.</p>
                </div>
                <SyncBranchSelector
                  activeMode="component"
                  componentType={componentType}
                  projectIntegration={projectIntegration}
                  setProjectIntegration={setProjectIntegration}
                  framework={framework}
                  setFramework={setFramework}
                  ideSyncPromptCopied={ideSyncPromptCopied}
                  setIdeSyncPromptCopied={setIdeSyncPromptCopied}
                  ideResponseContext={ideResponseContext}
                  setIdeResponseContext={setIdeResponseContext}
                  projectName={projectName}
                  setProjectName={setProjectName}
                  projectDescription={projectDescription}
                  setProjectDescription={setProjectDescription}
                  frontendStack={frontendStack}
                  setFrontendStack={setFrontendStack}
                  backendStack={backendStack}
                  setBackendStack={setBackendStack}
                  database={database}
                  setDatabase={setDatabase}
                  authOption={authOption}
                  setAuthOption={setAuthOption}
                  deployment={deployment}
                  setDeployment={setDeployment}
                  additionalFeatures={additionalFeatures}
                  setAdditionalFeatures={setAdditionalFeatures}
                  goBack={goBack}
                  goNext={goNext}
                  isStepWizard={true}
                />
              </div>
            )}

            {/* ── Step 6: Review & Generate ── */}
            {step === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Review Configuration</h3>
                  <p style={stepDesc}>Verify your selections before compiling the component blueprint.</p>
                </div>
                
                {/* Detailed Summary Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Application Section */}
                  <div style={{ padding: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--foreground)' }}>Component</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--muted-foreground)' }}>Component Type:</span> <span style={{ fontWeight: '500' }}>{componentType === 'Custom Component' ? (customComponentType || 'Custom') : componentType}</span></div>
                    </div>
                  </div>

                  {/* Theme Section */}
                  <div style={{ padding: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--foreground)' }}>Theme & Typography</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div><span style={{ color: 'var(--muted-foreground)' }}>Selected Theme:</span> <span style={{ fontWeight: '500' }}>{selectedTheme}</span></div>
                      <div><span style={{ color: 'var(--muted-foreground)' }}>Typography:</span> <span style={{ fontWeight: '500' }}>{selectedTypography}</span></div>
                    </div>
                  </div>

                  {/* Project Setup Section */}
                  <div style={{ padding: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--foreground)' }}>Project Setup</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div><span style={{ color: 'var(--muted-foreground)' }}>Integration:</span> <span style={{ fontWeight: '500' }}>{projectIntegration === 'existing' ? 'Existing Project' : 'New Project'}</span></div>
                      {projectIntegration === 'existing' ? (
                        <div><span style={{ color: 'var(--muted-foreground)' }}>Framework:</span> <span style={{ fontWeight: '500' }}>{framework}</span></div>
                      ) : (
                        <>
                          <div><span style={{ color: 'var(--muted-foreground)' }}>Frontend:</span> <span style={{ fontWeight: '500' }}>{frontendStack}</span></div>
                          <div><span style={{ color: 'var(--muted-foreground)' }}>Backend:</span> <span style={{ fontWeight: '500' }}>{backendStack}</span></div>
                          <div><span style={{ color: 'var(--muted-foreground)' }}>Database:</span> <span style={{ fontWeight: '500' }}>{database}</span></div>
                          <div><span style={{ color: 'var(--muted-foreground)' }}>Auth:</span> <span style={{ fontWeight: '500' }}>{authOption}</span></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>




                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={goBack}
                    className="active-scale-95"
                    style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    onClick={handleForgeSubmit}
                    className="btn-accent shine-effect"
                    disabled={isGenerating}
                    style={{ flex: 1, padding: '0.85rem', fontSize: '0.95rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--accent)', color: 'var(--accent-foreground)', transition: 'all 0.2s ease' }}
                  >
                    {isGenerating
                      ? <><Sliders size={18} className="animate-spin" /> Compiling Component Blueprint...</>
                      : <><Sparkles size={18} /> Compile Component Blueprint</>
                    }
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back / Next navigation footer */}
      {step < 6 && step !== 5 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button
            onClick={goBack}
            className="active-scale-95"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <button
            ref={continueButtonRef}
            onClick={goNext}
            disabled={!canAdvance()}
            className={`active-scale-95 ${canAdvance() ? 'glow-pulse' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', background: canAdvance() ? 'var(--accent)' : 'var(--muted)', color: canAdvance() ? 'var(--accent-foreground)' : 'var(--muted-foreground)', fontSize: '0.85rem', fontWeight: '700', cursor: canAdvance() ? 'pointer' : 'default', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
          >
            {step === 5 ? 'Review' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes glowPulse {
          0% { box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 30%, transparent); }
          50% { box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 65%, transparent), 0 0 30px color-mix(in srgb, var(--accent) 35%, transparent); }
          100% { box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 30%, transparent); }
        }
        .glow-pulse {
          animation: glowPulse 2s infinite ease-in-out;
        }
        .category-grid {
          display: grid;
        }
        .category-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-radius: 16px !important;
          border: 1px solid var(--border) !important;
        }
        .category-card:hover {
          transform: translateY(-5px) scale(1.015) !important;
          box-shadow: 0 12px 32px rgba(0,0,0,0.15), 0 0 16px color-mix(in srgb, var(--accent) 25%, transparent) !important;
          border-color: var(--accent) !important;
        }
        .category-card.selected {
          border: 2px solid var(--accent) !important;
          box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 30%, transparent), 0 0 20px color-mix(in srgb, var(--accent) 20%, transparent) !important;
        }
        .card-artwork {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0.38;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        }
        .category-card:hover .card-artwork {
          transform: scale(1.08);
          opacity: 0.50;
        }
        .category-card.selected .card-artwork {
          opacity: 0.52;
        }
        @media (min-width: 1401px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .category-card {
            height: 155px;
          }
        }
        @media (min-width: 1101px) and (max-width: 1400px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .category-card {
            height: 145px;
          }
        }
        @media (min-width: 601px) and (max-width: 1100px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .category-card {
            height: 135px;
          }
        }
        @media (max-width: 600px) {
          .category-grid {
            grid-template-columns: 1fr;
          }
          .category-card {
            height: auto;
            min-height: 125px;
          }
        }
      `}</style>
    </div>
  );
}
