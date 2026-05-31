'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Plus, Sliders, Sparkles, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { PAGE_TYPES, PAGE_COMPONENTS } from '../constants/pageTemplates';
import { ThemeSelector } from './ThemeSelector';
import { TypographyPicker } from './TypographyPicker';
import { SyncBranchSelector } from './SyncBranchSelector';
import { ThemePreview } from './ThemePreview';
import ShadcnDropdown from '@/components/ShadcnDropdown';

const STEPS = ['Page Type', 'Components', 'Theme', 'Typography', 'Live Preview', 'Project Setup', 'Generate'];

const AI_SUGGESTIONS_DICT = {
  'Dashboard Panel': [
    'Real-time Activity Log Feed',
    'Interactive Command Terminal',
    'Export to PDF/CSV Tool',
    'Predictive AI Insights Banner',
    'System Load Shimmer Cards'
  ],
  'Landing Homepage': [
    'Interactive Dark/Light Switcher',
    'Live Support Chat Widget',
    'Newsletter Subscription Form',
    'Interactive Feature Configurator',
    'Dynamic Client Testimonial slider'
  ],
  'Login Page': [
    'WebAuthn Biometric Login Button',
    'Remember Me Persistent Checkbox',
    'Single Sign-On (Google/Github)',
    'Magic Passwordless Link Router'
  ],
  'Signup Page': [
    'Dynamic Password Strength Meter',
    'Live Username Availability Check',
    'Promo/Discount Coupon Code Input',
    'Success Celebration Confetti Screen'
  ],
  'Settings Page': [
    'API Access Token Creator',
    'Session History Security Audit Logs',
    'System Status Webhook Tester',
    'Export Personal Workspace Archive'
  ],
  'Profile Page': [
    'Skill Endorsement Tags Board',
    'Portfolio Link Tree Card',
    'Direct Messaging Chat Panel',
    'Interactive Resume PDF Embedder'
  ]
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const sectionWrap = {
  padding: '2rem',
  background: 'var(--card)',
  backdropFilter: 'blur(20px)',
  border: '1px solid var(--border)',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-md)',
};
const stepTitle = { fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em' };
const stepDesc  = { fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.4' };

export function PageWizard({ forgeState, promptGeneration, apiKey }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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
    projectName, setProjectName,
    projectDescription, setProjectDescription,
    projectType, setProjectType,
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
    if (step === 1) return !!pageType;
    if (step === 2) return selectedComponents.length > 0;
    if (step === 3) return !!selectedTheme;
    if (step === 4) return !!selectedTypography;
    if (step === 5) return true; // Live Preview step can always advance
    if (step === 6) return true; // Project Setup is always valid (defaults to 'new')
    return true;
  };

  const goNext = () => { if (canAdvance()) { setDirection(1); setStep(s => Math.min(s + 1, 7)); } };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const categoryCard = (isSelected) => ({
    position: 'relative', borderRadius: '12px',
    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
    background: isSelected ? 'rgba(104,67,236,0.08)' : 'var(--card)',
    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    boxShadow: isSelected ? '0 0 16px rgba(104,67,236,0.2)' : 'none',
  });
  const checkboxCard = (isChecked) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem',
    borderRadius: '10px', border: isChecked ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: isChecked ? 'rgba(104,67,236,0.08)' : 'transparent',
    cursor: 'pointer', transition: 'all 0.2s ease',
  });

  const getCategory = (comp) => {
    const c = comp.toLowerCase();
    if (c.includes('chart') || c.includes('stats') || c.includes('table') || c.includes('metric') || c.includes('data')) return 'Data & Analytics';
    if (c.includes('form') || c.includes('calculator') || c.includes('contact') || c.includes('input') || c.includes('uploader') || c.includes('register') || c.includes('login') || c.includes('signup')) return 'Forms & Entry';
    if (c.includes('sidebar') || c.includes('header') || c.includes('footer') || c.includes('navigation') || c.includes('layout') || c.includes('gallery') || c.includes('panel')) return 'Layout & Navigation';
    return 'Interactive Modules';
  };

  const aiSuggestionsBox = {
    background: 'rgba(104, 67, 236, 0.04)',
    border: '1px solid rgba(104, 67, 236, 0.12)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    marginBottom: '0.5rem',
  };

  const aiSuggestionPill = (isAdded) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    fontWeight: '600',
    color: isAdded ? '#ef4444' : '#e4e4e7',
    background: isAdded ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.04)',
    border: isAdded ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '20px',
    padding: '0.3rem 0.65rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-sans)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n; const active = step === n;
          return (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700', transition: 'all 0.3s ease', background: done ? 'var(--accent)' : active ? 'rgba(104,67,236,0.15)' : 'var(--muted)', border: active ? '2px solid var(--accent)' : done ? '2px solid var(--accent)' : '1px solid var(--border)', color: done ? '#ffffff' : active ? 'var(--accent)' : 'var(--muted-foreground)' }}>
                  {done ? <CheckCircle2 size={11} /> : n}
                </div>
                <span style={{ fontSize: '0.55rem', color: active ? 'var(--accent)' : 'var(--muted-foreground)', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ width: '20px', height: '1px', background: step > n ? 'var(--accent)' : 'var(--border)', marginBottom: '16px', transition: 'background 0.3s ease' }} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Animated panel */}
      <div style={{ ...sectionWrap, overflow: 'hidden', minHeight: '260px', padding: '1.25rem' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>

            {/* Step 1 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div><h3 style={stepTitle}>Select Page Type</h3><p style={stepDesc}>What interface layout are you structuring?</p></div>
                <div className="category-grid" style={{ gap: '1rem' }}>
                  {PAGE_TYPES.map((page) => {
                    const isSelected = pageType === page.id;
                    return (
                      <div key={page.id} style={categoryCard(isSelected)} onClick={() => setPageType(page.id)} className="category-card bento-card-premium glow-card-spotlight active-scale-95">
                        {page.image && <img src={page.image} alt={page.label} className="card-artwork" />}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.4), transparent)', zIndex: 1 }} />
                        {isSelected && <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', zIndex: 3 }}><CheckCircle2 size={15} style={{ color: 'var(--accent)' }} /></div>}
                        <div style={{ padding: '0.85rem', zIndex: 2 }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', display: 'block', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{page.label}</span>
                          <p style={{ fontSize: '0.72rem', color: '#e4e4e7', marginTop: '0.25rem', lineHeight: '1.4', textShadow: '0 1px 2px rgba(0,0,0,0.6)', margin: 0 }}>{page.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h3 style={stepTitle}>Select Components</h3>
                  <p style={stepDesc}>Choose or search modular blocks, and review custom AI recommendations.</p>
                </div>

                {/* AI Suggestions Section */}
                <div style={aiSuggestionsBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={13} style={{ color: '#D2FF3A' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--foreground)' }}>
                      AI-Suggested Extras (Recommended for {pageType})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {AI_SUGGESTIONS_DICT[pageType]?.map((rec) => {
                      const isAdded = selectedComponents.includes(rec);
                      return (
                        <button
                          key={rec}
                          type="button"
                          onClick={() => handleComponentToggle(rec)}
                          style={aiSuggestionPill(isAdded)}
                          className="active-scale-95"
                        >
                          <Plus size={10} style={{ transform: isAdded ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease', color: isAdded ? '#ef4444' : '#D2FF3A' }} />
                          <span>{rec}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search and Category Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <input 
                    type="text" 
                    placeholder="🔍 Search components..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ 
                      width: '100%', 
                      background: 'rgba(0,0,0,0.15)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px', 
                      padding: '0.45rem 0.75rem', 
                      fontSize: '0.78rem', 
                      color: 'var(--foreground)', 
                      outline: 'none' 
                    }} 
                    className="glass-input" 
                  />

                  {/* Categories Row */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {['All', 'Interactive Modules', 'Forms & Entry', 'Layout & Navigation', 'Data & Analytics'].map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: isActive ? '700' : '500',
                            color: isActive ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                            background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid ' + (isActive ? 'var(--accent)' : 'var(--border)'),
                            borderRadius: '20px',
                            padding: '0.2rem 0.65rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          className="active-scale-95"
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Components Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {(() => {
                    const predefined = PAGE_COMPONENTS[pageType] || [];
                    const displayed = [...predefined, ...selectedComponents.filter(c => !predefined.includes(c))];
                    
                    const filtered = displayed.filter(comp => {
                      const matchesSearch = comp.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = selectedCategory === 'All' || getCategory(comp) === selectedCategory;
                      return matchesSearch && matchesCategory;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1.5rem', color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
                          No matching components found. Type in the input below to add a custom one!
                        </div>
                      );
                    }

                    return filtered.map((comp, idx) => {
                      const isChecked = selectedComponents.includes(comp);
                      return (
                        <div key={idx} style={checkboxCard(isChecked)} onClick={() => handleComponentToggle(comp)} className="active-scale-95">
                          <CheckCircle2 size={13} style={{ color: isChecked ? 'var(--accent)' : 'var(--border)', flexShrink: 0 }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--foreground)', fontWeight: '500' }}>{comp}</span>
                            <span style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)' }}>{getCategory(comp)}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <form onSubmit={handleAddCustomComponent} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <input type="text" placeholder="Add custom component..." value={customComponentInput} onChange={(e) => setCustomComponentInput(e.target.value)} style={{ flex: 1, background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.65rem', fontSize: '0.8rem', color: 'var(--foreground)', outline: 'none' }} className="glass-input" />
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} className="btn-secondary btn-sm"><Plus size={14} />Add</button>
                </form>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div><h3 style={stepTitle}>Choose Theme</h3><p style={stepDesc}>Apply visual design tokens and HSL profiles.</p></div>
                <ThemeSelector selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} activeMode="page" pageType={pageType} selectedTypography={selectedTypography} hidePreview={true} />
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div><h3 style={stepTitle}>Typography System</h3><p style={stepDesc}>Your font choice signals intent to the AI generator.</p></div>
                <TypographyPicker selectedTypography={selectedTypography} setSelectedTypography={setSelectedTypography} />
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div><h3 style={stepTitle}>Live Preview</h3><p style={stepDesc}>Review how your selected components, theme, and typography integrate into a cohesive mockup.</p></div>
                <ThemePreview 
                  selectedTheme={selectedTheme} 
                  activeMode="page" 
                  pageType={pageType} 
                  selectedTypography={selectedTypography} 
                  selectedComponents={selectedComponents} 
                />
              </div>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div><h3 style={stepTitle}>Project Setup</h3><p style={stepDesc}>Configure project metadata and developer ecosystem choices.</p></div>
                <SyncBranchSelector
                  activeMode="page"
                  pageType={pageType}
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
                  projectType={projectType}
                  setProjectType={setProjectType}
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

            {/* Step 7 */}
            {step === 7 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div><h3 style={stepTitle}>Ready to Compile</h3><p style={stepDesc}>Review your selections and generate the prompt.</p></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[{ label: 'Page', value: pageType }, { label: 'Components', value: `${selectedComponents.length} selected` }, { label: 'Theme', value: selectedTheme }, { label: 'Font', value: selectedTypography }, { label: 'Project', value: projectIntegration === 'existing' ? `Existing · ${framework}` : 'New' }].map(({ label, value }) => value && (
                    <span key={label} style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--accent)', background: 'rgba(104,67,236,0.08)', border: '1px solid rgba(104,67,236,0.2)', borderRadius: '8px', padding: '3px 10px' }}>{label}: {value}</span>
                  ))}
                </div>
                {/* AI Generator Engine Selector */}
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginBottom: '0.5rem' }} className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--foreground)' }}>
                    <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                    AI Generator Engine
                  </div>
                  <ShadcnDropdown
                    value={selectedModel || 'gemini'}
                    onChange={(val) => setSelectedModel(val)}
                    options={[
                      { label: 'Gemini 3.1 Pro (Flagship)', value: 'gemini' },
                      { label: 'Groq Llama 3.3 70B (High Precision)', value: 'groq' }
                    ]}
                    triggerWidth="100%"
                  />
                  <p style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', margin: 0 }}>
                    {selectedModel === 'groq' ? "⚡ Running Groq Llama 3.3 for faster, high-fidelity synthesis." : "✨ Running flagship Gemini 3.1 Pro synthesis."}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-foreground)', justifyContent: 'center' }}><Info size={15} />{apiKey ? 'Live Compiler active.' : 'Offline Compiler active.'}</div>
                <button onClick={handleForgeSubmit} className="btn-accent shine-effect" disabled={isGenerating} style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--accent)', color: 'var(--accent-foreground)', transition: 'all 0.2s ease' }}>
                  {isGenerating ? <><Sliders size={18} className="animate-spin" />Forging Page Blueprint...</> : <><Sparkles size={18} />Generate Page Prompt</>}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 7 && step !== 6 && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={goBack} disabled={step === 1} className="active-scale-95" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', opacity: step === 1 ? 0.35 : 1, fontSize: '0.85rem', fontWeight: '600', cursor: step === 1 ? 'default' : 'pointer', transition: 'all 0.2s ease' }}>
            <ArrowLeft size={15} />Back
          </button>
          <button onClick={goNext} disabled={!canAdvance()} className="active-scale-95" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', background: canAdvance() ? 'var(--accent)' : 'var(--muted)', color: canAdvance() ? 'var(--accent-foreground)' : 'var(--muted-foreground)', fontSize: '0.85rem', fontWeight: '700', cursor: canAdvance() ? 'pointer' : 'default', transition: 'all 0.2s ease' }}>
            {step === 6 ? 'Review' : 'Continue'}<ArrowRight size={15} />
          </button>
        </div>
      )}

      <style>{`
        .category-grid {
          display: grid;
        }
        .category-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .card-artwork {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0.50;
          transition: transform 0.4s ease;
        }
        .category-card:hover .card-artwork {
          transform: scale(1.06);
        }
        @media (min-width: 1401px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .category-card {
            height: 150px;
          }
        }
        @media (min-width: 1101px) and (max-width: 1400px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .category-card {
            height: 140px;
          }
        }
        @media (min-width: 601px) and (max-width: 1100px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .category-card {
            height: 130px;
          }
        }
        @media (max-width: 600px) {
          .category-grid {
            grid-template-columns: 1fr;
          }
          .category-card {
            height: auto;
            min-height: 120px;
          }
        }
      `}</style>
    </div>
  );
}
