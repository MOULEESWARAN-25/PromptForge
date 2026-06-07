'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWizardAutoScroll } from '../hooks/useWizardAutoScroll';

import { 
  CheckCircle2, Sliders, Sparkles, Info, ArrowRight, ArrowLeft, Code2, Plus, Search,
  LayoutGrid, ShoppingCart, GraduationCap, Receipt, Image as ImageIcon, Activity, Dumbbell, Home
} from 'lucide-react';

const IconMap = {
  LayoutGrid,
  ShoppingCart,
  GraduationCap,
  Receipt,
  Image: ImageIcon,
  Activity,
  Dumbbell,
  Home,
  Code2
};
import { APP_CATEGORIES, CATEGORY_FEATURES, AI_FEATURE_SUGGESTIONS } from '../constants/appCategories';
import { ThemeSelector } from './ThemeSelector';
import { TypographyPicker } from './TypographyPicker';
import { SyncBranchSelector } from './SyncBranchSelector';
import { ThemePreview } from './ThemePreview';
import ShadcnDropdown from '@/components/ShadcnDropdown';

const STEPS = ['Application', 'Features', 'Theme', 'Typography', 'Live Preview', 'Project Setup', 'Review'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// Shared styles
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

export function ApplicationWizard({ forgeState, promptGeneration, apiKey }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [appSearch, setAppSearch] = useState('');
  const router = useRouter();

  const continueButtonRef = useRef(null);

  useWizardAutoScroll({
    step,
    selectionDependencies: [
      forgeState.appCategory,
      forgeState.selectedFeatures,
      forgeState.selectedTheme,
      forgeState.selectedTypography
    ],
    continueButtonRef
  });


  const {
    appCategory, customCategory, setCustomCategory,
    selectedTheme, setSelectedTheme,
    selectedTypography, setSelectedTypography,
    selectedFeatures, customFeatureInput, setCustomFeatureInput,
    projectIntegration, setProjectIntegration,
    framework, setFramework,
    ideSyncPromptCopied, setIdeSyncPromptCopied,
    ideResponseContext, setIdeResponseContext,
    handleCategorySelect, handleFeatureToggle, handleAddCustomFeature,
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
    if (step === 1) return !!appCategory;
    if (step === 2) return selectedFeatures.length > 0;
    if (step === 3) return !!selectedTheme;
    if (step === 4) return !!selectedTypography;
    if (step === 5) return true; // Live Preview always can advance
    if (step === 6) return true; // projectIntegration defaults to 'new', always valid
    return true;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, 7));
  };

  const goBack = () => {
    if (step === 1) {
      router.push('/dashboard?action=create');
      return;
    }
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  // Category card styles
  const categoryCard = (isSelected, hasImage) => ({
    position: 'relative', borderRadius: '12px',
    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
    background: hasImage
      ? (isSelected ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--card)')
      : (isSelected ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--card)'),
    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    boxShadow: isSelected ? '0 0 20px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
  });
  const checkboxCard = (isChecked) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem',
    borderRadius: '10px', border: isChecked ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: isChecked ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--card)',
    cursor: 'pointer', transition: 'all 0.2s ease',
  });

// Helper style maps for premium progress bar and spotlight selection cards
const CATEGORY_TAGS = {
  'SaaS Dashboard Admin Panel': ['Next.js', 'Recharts', 'Prisma'],
  'E-Commerce Marketplace': ['Stripe', 'Checkout', 'Grid'],
  'Student Management Hub': ['PostgreSQL', 'Roles', 'Data'],
  'Freelancer Billing Platform': ['Invoices', 'PayPal', 'PDFs'],
  'Digital Creative Portfolio': ['Framer Motion', 'Gallery', 'Fluid'],
  'Healthcare Tracker': ['Vitals', 'HIPAA Ready', 'Charts'],
  'Fitness Planner': ['Workouts', 'Analytics', 'Logs'],
  'Real Estate Portal': ['Leaflet Maps', 'Search', 'Filters'],
  'Custom': ['Custom RAG', 'Tailored', 'Flexible']
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
            {/* ── Step 1: Application Type ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <h3 style={stepTitle}>Select Application Type</h3>
                    <p style={stepDesc}>What kind of digital product are you building?</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.55rem 0.85rem', width: '280px', flexShrink: 0 }}>
                    <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Search application categories..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)' }}
                    />
                    {appSearch && (
                      <span onClick={() => setAppSearch('')} style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 600 }}>Clear</span>
                    )}
                  </div>
                </div>
                <div className="category-grid" style={{ gap: '1rem' }}>
                  {APP_CATEGORIES.filter(cat => 
                    cat.label.toLowerCase().includes(appSearch.toLowerCase()) || 
                    cat.desc.toLowerCase().includes(appSearch.toLowerCase())
                  ).map((cat) => {
                    const isSelected = appCategory === cat.id;
                    return (
                      <div key={cat.id} style={categoryCard(isSelected, false)}
                         onClick={() => handleCategorySelect(cat.id)}
                         className={`category-card bento-card-premium glow-card-spotlight active-scale-95 ${isSelected ? 'selected' : ''}`}
                      >
                        {/* Subtle background icon watermark */}
                        {(() => {
                          const IconComponent = IconMap[cat.icon] || Code2;
                          return (
                            <div style={{ 
                              position: 'absolute', 
                              top: '1rem', 
                              right: '1rem', 
                              opacity: isSelected ? 0.38 : 0.12, 
                              color: isSelected ? 'var(--accent)' : 'var(--foreground)',
                              transition: 'all 0.3s ease',
                              zIndex: 1
                            }}>
                              <IconComponent size={40} strokeWidth={1.5} />
                            </div>
                          );
                        })()}
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', zIndex: 3 }}>
                            <CheckCircle2 size={15} style={{ color: 'var(--accent)' }} />
                          </div>
                        )}
                        <div style={{ padding: '0.85rem', zIndex: 2 }}>
                          {/* Visual Curated Badges */}
                          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            {CATEGORY_TAGS[cat.id]?.map(tag => (
                              <span key={tag} style={{
                                fontSize: '0.58rem',
                                background: isSelected ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--input)',
                                border: isSelected ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--border)',
                                color: isSelected ? 'var(--accent)' : 'var(--muted-foreground)',
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
                          <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--foreground)', display: 'block' }}>
                            {cat.label}
                          </span>
                          <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.25rem', lineHeight: '1.4', margin: 0 }}>
                            {cat.desc}
                          </p>
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

            {/* ── Step 2: Features Config ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Select Features</h3>
                  <p style={stepDesc}>Select the functional modules to bundle into your application spec.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.5rem' }}>
                  {(() => {
                    const predefined = CATEGORY_FEATURES[appCategory] || CATEGORY_FEATURES['Custom'] || [];
                    const displayed = [...predefined, ...selectedFeatures.filter(f => !predefined.includes(f))];
                    return displayed.map((feat, idx) => {
                      const isChecked = selectedFeatures.includes(feat);
                      return (
                        <div key={idx} style={checkboxCard(isChecked)}
                             onClick={() => handleFeatureToggle(feat)}
                             className="active-scale-95"
                        >
                          <CheckCircle2 size={13} style={{ color: isChecked ? 'var(--accent)' : 'var(--border)', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: '500' }}>
                            {feat}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
                {/* Custom feature add form */}
                <form onSubmit={handleAddCustomFeature} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Add a custom feature target..."
                    value={customFeatureInput}
                    onChange={(e) => setCustomFeatureInput(e.target.value)}
                    style={{ flex: 1, background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.65rem', fontSize: '0.8rem', color: 'var(--foreground)', outline: 'none' }}
                    className="glass-input"
                  />
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} className="btn-secondary btn-sm">
                    <Plus size={14} /> Add
                  </button>
                </form>

                {/* AI Suggestions */}
                {(() => {
                  const suggestions = AI_FEATURE_SUGGESTIONS[appCategory] || AI_FEATURE_SUGGESTIONS['Custom'] || [];
                  const availableSuggestions = suggestions.filter(s => !selectedFeatures.includes(s));
                  
                  if (availableSuggestions.length > 0) {
                    return (
                      <div style={{ marginTop: '0.75rem' }} className="animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                          <Sparkles size={12} /> AI Suggestions
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {availableSuggestions.map(sug => (
                            <button
                              key={sug}
                              onClick={(e) => { e.preventDefault(); handleFeatureToggle(sug); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.65rem', borderRadius: '12px', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
                              className="active-scale-95"
                            >
                              <Plus size={12} /> {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* ── Step 3: Theme Selector ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <ThemeSelector
                  headerTitle="Choose Theme Style"
                  headerDescription="Select the visual design style for this application."
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  activeMode="application"
                  appCategory={appCategory}
                  selectedTypography={selectedTypography}
                  hidePreview={true}
                />
              </div>
            )}

            {/* ── Step 4: Typography ── */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <TypographyPicker
                  headerTitle="Select Typography System"
                  headerDescription="Pick a typography pairing tailored to the app's visual hierarchy."
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
                  <p style={stepDesc}>Review how your selected theme and typography translate to component visual designs.</p>
                </div>
                <ThemePreview
                  selectedTheme={selectedTheme}
                  activeMode="application"
                  appCategory={appCategory}
                  selectedTypography={selectedTypography}
                /> 
              </div>
            )}

            {/* ── Step 6: Existing Project Setup ── */}
            {step === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Project Setup</h3>
                  <p style={stepDesc}>Configure project metadata and developer ecosystem choices.</p>
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

            {/* ── Step 7: Review ── */}
            {step === 7 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={stepTitle}>Review Configuration</h3>
                  <p style={stepDesc}>Verify your selections before compiling the application blueprint.</p>
                </div>
                
                {/* Detailed Summary Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Application Section */}
                  <div style={{ padding: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--foreground)' }}>Application</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div><span style={{ color: 'var(--muted-foreground)' }}>Category:</span> <span style={{ fontWeight: '500' }}>{appCategory === 'Custom' ? customCategory || 'Custom' : appCategory}</span></div>
                      <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--muted-foreground)' }}>Features:</span> <span style={{ fontWeight: '500' }}>{selectedFeatures.join(', ') || 'None'}</span></div>
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
                      ? <><Sliders size={18} className="animate-spin" /> Compiling Application Blueprint...</>
                      : <><Sparkles size={18} /> Compile Application Blueprint</>
                    }
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back / Next navigation */}
      {step < 7 && step !== 6 && (
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
            {step === 6 ? 'Review' : 'Continue'} <ArrowRight size={15} />
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
