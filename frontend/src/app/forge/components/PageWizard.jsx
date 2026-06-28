'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWizardAutoScroll } from '../hooks/useWizardAutoScroll';

import { CheckCircle2, Plus, Sliders, Sparkles, Info, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ThemeSelector } from './ThemeSelector';
import { TypographyPicker } from './TypographyPicker';
import { SyncBranchSelector } from './SyncBranchSelector';
import { ThemePreview } from './ThemePreview';
import ShadcnDropdown from '@/components/ShadcnDropdown';

const STEPS = ['Page Type', 'Components', 'Theme', 'Typography', 'Live Preview', 'Project Setup', 'Review'];

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
  const { templates } = useApp();
  const { PAGE_TYPES, PAGE_COMPONENTS } = templates;
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  const continueButtonRef = useRef(null);

  useWizardAutoScroll({
    step,
    selectionDependencies: [
      forgeState.pageType,
      forgeState.selectedComponents,
      forgeState.selectedTheme,
      forgeState.selectedTypography
    ],
    continueButtonRef
  });


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
  const goBack = () => {
    if (step === 1) {
      router.push('/dashboard?action=create');
      return;
    }
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  const categoryCard = (isSelected) => ({
    position: 'relative', borderRadius: '12px',
    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
    background: isSelected ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--card)',
    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    boxShadow: isSelected ? '0 0 16px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
  });
  const checkboxCard = (isChecked) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem',
    borderRadius: '10px', border: isChecked ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: isChecked ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
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
    color: isAdded ? 'var(--destructive)' : 'var(--muted-foreground)',
    background: isAdded ? 'rgba(239, 68, 68, 0.05)' : 'var(--input)',
    border: isAdded ? '1px solid var(--destructive)' : '1px solid var(--border)',
    borderRadius: '20px',
    padding: '0.3rem 0.65rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-sans)',
  });

// Helper style maps for premium progress bar and spotlight selection cards
const CATEGORY_TAGS = {
  'Dashboard Panel': ['Admin', 'KPIs', 'Charts'],
  'Landing Homepage': ['Hero', 'CTA', 'Bento'],
  'Login Page': ['Auth', 'SSO', 'Glass'],
  'Signup Page': ['Form', 'Validation', 'SSO'],
  'Settings Page': ['Tabs', 'API Keys', 'Danger'],
  'Profile Page': ['Bio', 'Stream', 'Gallery']
};

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
      ? 'rgba(16,185,129,0.06)' 
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
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  cursor: 'default',
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
                      <div key={page.id} style={categoryCard(isSelected)} onClick={() => setPageType(page.id)} className={`category-card bento-card-premium glow-card-spotlight active-scale-95 ${isSelected ? 'selected' : ''}`}>
                        {page.image && <img src={page.image} alt={page.label} className="card-artwork" />}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.3), transparent)', zIndex: 1 }} />
                        {isSelected && <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', zIndex: 3 }}><CheckCircle2 size={15} style={{ color: '#ffffff' }} /></div>}
                        <div style={{ padding: '0.85rem', zIndex: 2 }}>
                          {/* Visual Curated Badges */}
                          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            {CATEGORY_TAGS[page.id]?.map(tag => (
                              <span key={tag} style={{
                                fontSize: '0.58rem',
                                background: isSelected ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.08)',
                                border: isSelected ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                borderRadius: '4px',
                                padding: '1px 5px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
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
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <h3 style={stepTitle}>Select Components</h3>
                    <p style={stepDesc}>Choose or search modular blocks, and review custom AI recommendations.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.55rem 0.85rem', width: '280px', flexShrink: 0 }}>
                    <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    <input 
                      type="text" 
                      placeholder="Search components..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)' }} 
                    />
                    {searchQuery && (
                      <span onClick={() => setSearchQuery('')} style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 600 }}>Clear</span>
                    )}
                  </div>
                </div>

                {/* AI Suggestions Section */}
                <div style={aiSuggestionsBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={13} style={{ color: 'var(--accent-green)' }} />
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
                          <Plus size={10} style={{ transform: isAdded ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease', color: isAdded ? '#ef4444' : 'var(--accent-green)' }} />
                          <span>{rec}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.25rem' }}>

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
                            background: isActive ? 'var(--accent)' : 'var(--input)',
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
                <ThemeSelector 
                  headerTitle="Choose Theme" 
                  headerDescription="Apply visual design tokens and HSL profiles." 
                  selectedTheme={selectedTheme} 
                  setSelectedTheme={setSelectedTheme} 
                  activeMode="page" 
                  pageType={pageType} 
                  selectedTypography={selectedTypography} 
                  hidePreview={true} 
                />
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <TypographyPicker 
                  headerTitle="Typography System" 
                  headerDescription="Your font choice signals intent to the AI generator." 
                  selectedTypography={selectedTypography} 
                  setSelectedTypography={setSelectedTypography} 
                />
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
                <div><h3 style={stepTitle}>Review Configuration</h3><p style={stepDesc}>Verify your selections before compiling the application blueprint.</p></div>
                
                {/* Detailed Summary Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Application Section */}
                  <div style={{ padding: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--foreground)' }}>Application</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div><span style={{ color: 'var(--muted-foreground)' }}>Page Type:</span> <span style={{ fontWeight: '500' }}>{pageType}</span></div>
                      <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--muted-foreground)' }}>Components:</span> <span style={{ fontWeight: '500' }}>{selectedComponents.join(', ') || 'None'}</span></div>
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
                  <button onClick={handleForgeSubmit} className="btn-accent shine-effect" disabled={isGenerating} style={{ flex: 1, padding: '0.85rem', fontSize: '0.95rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--accent)', color: 'var(--accent-foreground)', transition: 'all 0.2s ease' }}>
                    {isGenerating ? <><Sliders size={18} className="animate-spin" />Forging Page Blueprint...</> : <><Sparkles size={18} />Generate Page Prompt</>}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 7 && step !== 6 && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={goBack} className="active-scale-95" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            <ArrowLeft size={15} />Back
          </button>
          <button
            ref={continueButtonRef}
            onClick={goNext}
            disabled={!canAdvance()}
            className={`active-scale-95 ${canAdvance() ? 'glow-pulse' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.5rem', borderRadius: '10px', border: 'none', background: canAdvance() ? 'var(--accent)' : 'var(--muted)', color: canAdvance() ? 'var(--accent-foreground)' : 'var(--muted-foreground)', fontSize: '0.85rem', fontWeight: '700', cursor: canAdvance() ? 'pointer' : 'default', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
          >
            {step === 6 ? 'Review' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes glowPulse {
          0% { box-shadow: 0 0 8px rgba(104,67,236,0.3); }
          50% { box-shadow: 0 0 20px rgba(104,67,236,0.65), 0 0 30px rgba(104, 67, 236, 0.35); }
          100% { box-shadow: 0 0 8px rgba(104,67,236,0.3); }
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
          box-shadow: 0 12px 32px rgba(0,0,0,0.15), 0 0 16px rgba(104,67,236,0.25) !important;
          border-color: var(--accent) !important;
        }
        .category-card.selected {
          border: 2px solid var(--accent) !important;
          box-shadow: 0 8px 24px rgba(104,67,236,0.3), 0 0 20px rgba(104,67,236,0.2) !important;
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
