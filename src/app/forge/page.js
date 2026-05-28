"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { generateEnhancedPrompt } from '@/services/gemini';
import {
  ArrowLeft, Sparkles, Layout, Monitor, Code2, 
  Wand2, ChevronRight, CheckCircle2, Sliders, Info 
} from 'lucide-react';
import { themeStyles } from '@/data/designVocabulary';

export default function ForgePage() {
  const { user, savePromptRecord, apiKey } = useApp();
  const router = useRouter();

  // Active state: null (mode selector) | "application" | "page" | "enhance"
  const [activeMode, setActiveMode] = useState(null);
  
  // Universal options
  const [selectedTheme, setSelectedTheme] = useState('Sleek Dark Glassmorphic');
  const [rawDescription, setRawDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Application Wizard state
  const [appCategory, setAppCategory] = useState('SaaS Dashboard');
  const [customCategory, setCustomCategory] = useState('');

  // Page Wizard state
  const [pageType, setPageType] = useState('Dashboard Panel');
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [useDefaultComponents, setUseDefaultComponents] = useState(true);

  // Enhancer Wizard state
  const [selectedQualities, setSelectedQualities] = useState(['modern', 'premium', 'polished']);
  const [selectedMotions, setSelectedMotions] = useState(['hover feedback', 'micro-interactions']);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // Handle page component option list based on active pageType
  const getComponentsListForPage = () => {
    switch (pageType) {
      case 'Dashboard Panel':
        return ['Collapsible Sidebar', 'KPI Metric Cards', 'Sortable Data Table', 'Command Palette (Cmd+K)', 'Skeleton Shimmer Loaders', 'Toast Notifications'];
      case 'Landing Homepage':
        return ['Hero CTA Section', 'Bento Grid Features', 'Client Logo Marquee Ticker', 'Testimonial Carousel', 'Accordion FAQ Collapsible', 'Floating Bottom Nav'];
      case 'Login/Signup Portal':
        return ['Glassmorphism Entry Card', 'Floating Input Labels', 'OTP Verification Code Input', 'Spring Scale Checkmark Bounces', 'Switch Mode Toggle', 'Error Validation States'];
      case 'SaaS Pricing Matrix':
        return ['Spotlight Pricing Cards', 'Animated Border Glow Highlights', 'Switch Billing Toggle (Annual/Monthly)', 'Checkmark Feature Lists', 'Interactive CTA Buttons', 'Accordion FAQ'];
      default:
        return ['Navbar Header', 'Footer Section', 'Interactive Buttons', 'Responsive Grid Cards'];
    }
  };

  // Reset page components list when page type changes
  useEffect(() => {
    setSelectedComponents(getComponentsListForPage());
    setUseDefaultComponents(true);
  }, [pageType]);

  const handleComponentToggle = (comp) => {
    setUseDefaultComponents(false);
    if (selectedComponents.includes(comp)) {
      setSelectedComponents(selectedComponents.filter(c => c !== comp));
    } else {
      setSelectedComponents([...selectedComponents, comp]);
    }
  };

  const handleQualityToggle = (qual) => {
    if (selectedQualities.includes(qual)) {
      setSelectedQualities(selectedQualities.filter(q => q !== qual));
    } else {
      setSelectedQualities([...selectedQualities, qual]);
    }
  };

  const handleMotionToggle = (mot) => {
    if (selectedMotions.includes(mot)) {
      setSelectedMotions(selectedMotions.filter(m => m !== mot));
    } else {
      setSelectedMotions([...selectedMotions, mot]);
    }
  };

  const handleForge = async (e) => {
    e.preventDefault();
    if (!rawDescription.trim() && activeMode !== 'enhance') {
      alert("Please describe your idea.");
      return;
    }

    setIsGenerating(true);

    try {
      const modeQuery = rawDescription;
      const finalCategory = appCategory === 'Custom' ? customCategory : appCategory;
      const finalComponents = useDefaultComponents ? getComponentsListForPage() : selectedComponents;
      
      const generationParams = {
        mode: activeMode,
        query: modeQuery,
        theme: selectedTheme,
        apiKey
      };

      if (activeMode === 'application') {
        generationParams.category = finalCategory;
      } else if (activeMode === 'page') {
        generationParams.pageType = pageType;
        generationParams.components = finalComponents;
      } else if (activeMode === 'enhance') {
        // Enforce a robust base prompt for the enhancer
        generationParams.query = `${rawDescription}\n\n[INJECT STYLES AND BEHAVIORS]:\n- Visual Qualities: ${selectedQualities.join(', ')}\n- Transitions & Motion: ${selectedMotions.join(', ')}`;
      }

      const response = await generateEnhancedPrompt(generationParams);
      
      // Save prompt in Context history log
      let title = "Untitled Prompt";
      if (activeMode === 'application') title = `Application: ${finalCategory}`;
      else if (activeMode === 'page') title = `Page: ${pageType}`;
      else if (activeMode === 'enhance') title = `Enhanced: ${rawDescription.slice(0, 20)}...`;

      const savedRecord = savePromptRecord({
        mode: activeMode,
        title,
        query: rawDescription,
        theme: selectedTheme,
        resolvedPrompt: response.prompt,
        ragDetails: response.ragDetails,
        category: finalCategory,
        pageType: pageType,
        components: finalComponents,
        chatMessages: [
          { role: 'user', content: `Forge my custom ${activeMode} prompt!` },
          { role: 'model', content: response.prompt }
        ]
      });

      setIsGenerating(false);
      // Redirect to chat Workspace
      router.push(`/chat?id=${savedRecord.id}`);

    } catch (err) {
      console.error("Error forging prompt", err);
      setIsGenerating(false);
      alert("An error occurred generating your prompt. Check console.");
    }
  };

  if (!user) return null;

  return (
    <div style={containerStyle}>
      {/* ------------------- 1. MODE SELECTOR STATE ------------------- */}
      {!activeMode && (
        <div style={selectorState}>
          <div style={introHeader}>
            <h1 style={mainTitle}>Forge Your Design Blueprint</h1>
            <p style={mainSub}>
              Select what kind of prompt you are building. PromptForge translates vague requirements into premium technical prompt guides.
            </p>
          </div>

          <div style={selectionGrid}>
            {/* A. Application Prompt */}
            <div style={selectCard} className="glass-panel glass-panel-hover" onClick={() => setActiveMode('application')}>
              <div style={selectIconWrap}>
                <Monitor size={22} style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <h3 style={selectCardTitle}>Full Application</h3>
              <p style={selectCardDesc}>
                Define an entire end-to-end multi-page SaaS dashboard, e-commerce site, or digital portfolio complete with features, routing, and data seeds.
              </p>
              <div style={selectArrow}>
                <span>Configure Wizard</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* B. Page Prompt */}
            <div style={selectCard} className="glass-panel glass-panel-hover" onClick={() => setActiveMode('page')}>
              <div style={selectIconWrap}>
                <Layout size={22} style={{ color: 'hsl(var(--secondary))' }} />
              </div>
              <h3 style={selectCardTitle}>Custom Web Page</h3>
              <p style={selectCardDesc}>
                Design a structured page (login portals, pricing indices, responsive homepage layout grids) select custom component widgets.
              </p>
              <div style={selectArrow}>
                <span>Configure Wizard</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* C. Component Prompt (Redirects to split catalog) */}
            <div style={selectCard} className="glass-panel glass-panel-hover" onClick={() => router.push('/component-forge')}>
              <div style={selectIconWrap}>
                <Code2 size={22} style={{ color: 'hsl(var(--accent))' }} />
              </div>
              <h3 style={selectCardTitle}>Single UI Component</h3>
              <p style={selectCardDesc}>
                Generate highly precise, reusable design system components (Accordions, OTP Inputs, Toast banners, Command Search Palettes).
              </p>
              <div style={selectArrow}>
                <span>Open Split Catalog</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* D. Raw Prompt Enhancer */}
            <div style={selectCard} className="glass-panel glass-panel-hover" onClick={() => setActiveMode('enhance')}>
              <div style={selectIconWrap}>
                <Wand2 size={22} style={{ color: '#10b981' }} />
              </div>
              <h3 style={selectCardTitle}>Enhance Raw Prompt</h3>
              <p style={selectCardDesc}>
                Paste any rough prompt draft or single sentences and automatically inject micro-interactions, responsive grids, and clean design variables.
              </p>
              <div style={selectArrow}>
                <span>Open Enhancer</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- 2. WIZARD FORGE SUB-FORMS ------------------- */}
      {activeMode && (
        <div style={wizardLayout} className="glass-panel">
          {/* Back Button */}
          <button style={backBtn} onClick={() => { setActiveMode(null); setRawDescription(''); }}>
            <ArrowLeft size={16} />
            Back to Selectors
          </button>

          <div style={wizardHeader}>
            <h2 style={wizardTitle}>
              {activeMode === 'application' && "Lovable-Style Application Architect"}
              {activeMode === 'page' && "v0-Style Page Layout Designer"}
              {activeMode === 'enhance' && "Technical Design Prompt Enhancer"}
            </h2>
            <p style={wizardDesc}>
              {activeMode === 'application' && "Design an entire application structure using clean layout tokens and system logic."}
              {activeMode === 'page' && "Build a visual wireframe grid selecting required components and visual states."}
              {activeMode === 'enhance' && "Inject spring transitions, HSL colors, and high-fidelity modifiers into raw drafts."}
            </p>
          </div>

          <form onSubmit={handleForge} style={formStyle}>
            {/* Mode-Specific Settings */}

            {/* A. APPLICATION WIZARD OPTIONS */}
            {activeMode === 'application' && (
              <div style={formRow}>
                <div style={formGroup}>
                  <label style={formLabel}>Application Category</label>
                  <select
                    value={appCategory}
                    onChange={(e) => setAppCategory(e.target.value)}
                    style={selectStyle}
                    className="glass-input"
                  >
                    <option value="SaaS Dashboard Admin Panel">SaaS Dashboard Admin Panel</option>
                    <option value="E-Commerce Marketplace">E-Commerce Marketplace</option>
                    <option value="Student Management Hub">Student Management Hub</option>
                    <option value="Freelancer Billing Platform">Freelancer Billing Platform</option>
                    <option value="Digital Creative Portfolio">Digital Portfolio</option>
                    <option value="Custom">Custom (Type below)</option>
                  </select>
                </div>

                {appCategory === 'Custom' && (
                  <div style={formGroup}>
                    <label style={formLabel}>Describe Custom Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Vintage Synth Controller Workspace"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      style={inputStyle}
                      className="glass-input"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* B. PAGE WIZARD OPTIONS */}
            {activeMode === 'page' && (
              <div style={formVerticalGroup}>
                <div style={formGroup}>
                  <label style={formLabel}>Select Web Page Type</label>
                  <select
                    value={pageType}
                    onChange={(e) => setPageType(e.target.value)}
                    style={selectStyle}
                    className="glass-input"
                  >
                    <option value="Dashboard Panel">Dashboard Panel</option>
                    <option value="Landing Homepage">Landing Homepage</option>
                    <option value="Login/Signup Portal">Login/Signup Portal</option>
                    <option value="SaaS Pricing Matrix">SaaS Pricing Matrix</option>
                  </select>
                </div>

                <div style={{ ...formGroup, marginTop: '0.5rem' }}>
                  <div style={componentsListHeader}>
                    <label style={formLabel}>Include Components</label>
                    <button
                      type="button"
                      style={defaultToggleBtn}
                      onClick={() => {
                        setUseDefaultComponents(!useDefaultComponents);
                        if (!useDefaultComponents) setSelectedComponents(getComponentsListForPage());
                      }}
                    >
                      {useDefaultComponents ? "Custom Selection" : "Reset to Recommended Defaults"}
                    </button>
                  </div>

                  <div style={checkboxGrid}>
                    {getComponentsListForPage().map((comp, idx) => {
                      const checked = selectedComponents.includes(comp);
                      return (
                        <div
                          key={idx}
                          style={{
                            ...checkboxCard,
                            borderColor: checked ? 'hsl(var(--secondary))' : 'rgba(255,255,255,0.05)',
                            backgroundColor: checked ? 'rgba(6, 182, 212, 0.04)' : 'rgba(255,255,255,0.01)'
                          }}
                          onClick={() => handleComponentToggle(comp)}
                        >
                          <CheckCircle2
                            size={16}
                            style={{
                              color: checked ? 'hsl(var(--secondary))' : 'rgba(255,255,255,0.1)',
                              flexShrink: 0
                            }}
                          />
                          <span style={checkboxText}>{comp}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* C. ENHANCER WIZARD OPTIONS */}
            {activeMode === 'enhance' && (
              <div style={formVerticalGroup}>
                <div style={formGroup}>
                  <label style={formLabel}>Visual Quality Modifiers</label>
                  <div style={badgeSelectorGrid}>
                    {['modern', 'premium', 'polished', 'elegant', 'futuristic', 'clean', 'minimal', 'sleek', 'sophisticated', 'enterprise-grade'].map((q, idx) => {
                      const selected = selectedQualities.includes(q);
                      return (
                        <button
                          type="button"
                          key={idx}
                          style={{
                            ...badgeSelectorBtn,
                            ...(selected ? badgeSelectorActive : {})
                          }}
                          onClick={() => handleQualityToggle(q)}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ ...formGroup, marginTop: '0.5rem' }}>
                  <label style={formLabel}>Transitions & Motion Physics</label>
                  <div style={badgeSelectorGrid}>
                    {['Framer Motion', 'spring animations', 'staggered entrance', 'micro-interactions', 'hover feedback', 'magnetic effect', 'cursor following'].map((m, idx) => {
                      const selected = selectedMotions.includes(m);
                      return (
                        <button
                          type="button"
                          key={idx}
                          style={{
                            ...badgeSelectorBtn,
                            ...(selected ? badgeSelectorActive : {})
                          }}
                          onClick={() => handleMotionToggle(m)}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* THEME SELECTION SEGMENT (All modes) */}
            <div style={formGroup}>
              <label style={formLabel}>Browse Design Styles & Themes</label>
              <div style={themeCardGrid}>
                {Object.keys(themeStyles).map((themeName) => {
                  const selected = selectedTheme === themeName;
                  return (
                    <div
                      key={themeName}
                      style={{
                        ...themeSelectCard,
                        borderColor: selected ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.05)',
                        backgroundColor: selected ? 'rgba(168, 85, 247, 0.04)' : 'rgba(255, 255, 255, 0.01)'
                      }}
                      onClick={() => setSelectedTheme(themeName)}
                    >
                      <div style={themeHeader}>
                        <span style={themeCardName}>{themeName}</span>
                        {selected && <CheckCircle2 size={16} style={{ color: 'hsl(var(--primary))' }} />}
                      </div>
                      <p style={themeCardDescText}>{themeStyles[themeName].description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RAW prompt / description (All modes) */}
            <div style={formGroup}>
              <label style={formLabel}>
                {activeMode === 'enhance' ? "Paste Your Raw / Vague Prompt Draft" : "Describe Your Functional Idea In Your Own Words"}
              </label>
              <textarea
                placeholder={
                  activeMode === 'enhance' 
                    ? "Paste standard prompts like 'Create a simple checkout page with some items and payment details'..."
                    : "e.g. A digital hub to manage class checklists, search student names, show KPI cards of passing ratios, and filter results by class..."
                }
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                style={textareaStyle}
                className="glass-input"
                rows={5}
                required={activeMode !== 'enhance'}
                disabled={isGenerating}
              />
            </div>

            {/* Submit Engine */}
            <div style={submitRow}>
              <div style={offlineWarning}>
                <Info size={16} />
                <span>
                  {apiKey ? "Live Gemini completes enabled." : "No API key configured. Offline prompt compiler compiling prompt blueprints."}
                </span>
              </div>
              
              <button
                type="submit"
                style={submitBtn}
                className="btn-primary shine-effect"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Sliders size={18} className="animate-spin" />
                    Forging Design System...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Forge Professional Prompt
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Premium Forge Styles ──────────────────────────────────────

const containerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '1rem',
  position: 'relative',
  zIndex: 2,
};

const selectorState = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2.5rem',
};

const introHeader = {
  textAlign: 'center',
  maxWidth: '680px',
  margin: '0 auto',
  paddingTop: '1.5rem',
};

const mainTitle = {
  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.04em',
  lineHeight: '1.1',
  marginBottom: '0.75rem',
};

const mainSub = {
  fontSize: '1rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.65',
  maxWidth: '520px',
  margin: '0 auto',
};

const selectionGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
};

const selectCard = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.75rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  cursor: 'pointer',
  textAlign: 'left',
  boxShadow: 'var(--shadow-sm)',
  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
};

const selectIconWrap = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const selectCardTitle = {
  fontSize: '1.05rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.02em',
};

const selectCardDesc = {
  fontSize: '0.83rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.55',
  flex: 1,
};

const selectArrow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.78rem',
  fontWeight: '700',
  color: 'var(--accent)',
  borderTop: '1px solid var(--border)',
  paddingTop: '0.875rem',
  marginTop: '0.25rem',
};

const wizardLayout = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  boxShadow: 'var(--shadow-md)',
};

const backBtn = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--muted-foreground)',
  fontSize: '0.82rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  alignSelf: 'flex-start',
  padding: '0.4rem 0.85rem',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
};

const wizardHeader = {
  borderBottom: '1px solid var(--border)',
  paddingBottom: '1.25rem',
};

const wizardTitle = {
  fontSize: '1.35rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.025em',
};

const wizardDesc = {
  fontSize: '0.875rem',
  color: 'var(--muted-foreground)',
  marginTop: '0.35rem',
  lineHeight: '1.55',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const formRow = {
  display: 'flex',
  gap: '1.25rem',
  flexWrap: 'wrap',
};

const formVerticalGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const formGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  flex: 1,
  minWidth: '240px',
};

const formLabel = {
  fontSize: '0.82rem',
  fontWeight: '600',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
};

const selectStyle = {
  width: '100%',
  background: 'var(--card)',
  cursor: 'pointer',
  color: 'var(--foreground)',
};

const inputStyle = { width: '100%' };

const textareaStyle = {
  width: '100%',
  resize: 'vertical',
  lineHeight: '1.6',
  minHeight: '120px',
};

const componentsListHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const defaultToggleBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--accent)',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
};

const checkboxGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '0.625rem',
  marginTop: '0.25rem',
};

const checkboxCard = {
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.65rem 0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: 'var(--card)',
};

const checkboxText = {
  fontSize: '0.8rem',
  color: 'var(--foreground)',
  fontWeight: '500',
};

const badgeSelectorGrid = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '0.25rem',
};

const badgeSelectorBtn = {
  padding: '0.35rem 0.85rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '999px',
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-sans)',
};

const badgeSelectorActive = {
  background: 'var(--accent-subtle)',
  borderColor: 'var(--accent)',
  color: 'var(--accent)',
};

const themeCardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: '0.875rem',
  marginTop: '0.25rem',
};

const themeSelectCard = {
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  background: 'var(--card)',
};

const themeHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const themeCardName = {
  fontSize: '0.82rem',
  fontWeight: '700',
  color: 'var(--foreground)',
};

const themeCardDescText = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.4',
};

const submitRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid var(--border)',
  paddingTop: '1.5rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const offlineWarning = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
};

const submitBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.925rem',
  fontWeight: '700',
  padding: '0.75rem 1.75rem',
  fontFamily: 'var(--font-sans)',
};

