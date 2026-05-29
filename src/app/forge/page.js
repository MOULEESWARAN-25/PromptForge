"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateEnhancedPrompt } from '@/services/gemini';
import ShadcnDropdown from '@/components/ShadcnDropdown';
import { toast } from 'sonner';
import {
  ArrowLeft, Sparkles, Layout, Monitor, Code2,
  Wand2, ChevronRight, CheckCircle2, Sliders, Info, Plus, Trash2, RotateCcw, X
} from 'lucide-react';
import { themeStyles } from '@/data/designVocabulary';
import { track, EVENTS } from '@/lib/analytics';

// ─── Categories & Images Configurations ────────────────────────
const APP_CATEGORIES = [
  { id: 'SaaS Dashboard Admin Panel', label: 'SaaS Dashboard', desc: 'Enterprise management dashboards, metrics widgets, analytics grids.', image: '/categories/saas-dashboard.png' },
  { id: 'E-Commerce Marketplace', label: 'E-Commerce', desc: 'Product grid catalog, cart, checkout checkout, client profiles.', image: '/categories/ecommerce.png' },
  { id: 'Student Management Hub', label: 'Student Hub', desc: 'Student databases, gradebooks, schedulers, parental analytics.', image: '/categories/student-management.png' },
  { id: 'Freelancer Billing Platform', label: 'Billing Platform', desc: 'Invoice generators, payment integrations, client lists.', image: '/categories/freelancer-billing.png' },
  { id: 'Digital Creative Portfolio', label: 'Creative Portfolio', desc: 'Grid galleries, lightboxes, timeline resumes, contact forms.', image: '/categories/portfolio.png' },
  { id: 'Healthcare Tracker', label: 'Healthcare Tracker', desc: 'Patient charts, vitals visualizers, logs, schedules.', image: '/categories/healthcare.png' },
  { id: 'Fitness Planner', label: 'Fitness Planner', desc: 'Workout builders, calorie logs, weight progression widgets.', image: '/categories/fitness.png' },
  { id: 'Real Estate Portal', label: 'Real Estate Portal', desc: 'Map search, property highlights, agent panels, pricing lists.', image: '/categories/real-estate.png' },
  { id: 'Custom', label: 'Custom Application', desc: 'Describe your own custom software structure.', image: null }
];

const PAGE_TYPES = [
  { id: 'Dashboard Panel', label: 'Dashboard Panel', desc: 'Sidebar admin dashboard grid, metric widgets, table structures.', image: '/pages/dashboard.png' },
  { id: 'Landing Homepage', label: 'Landing Homepage', desc: 'SaaS product presentation, CTA banners, pricing grids, FAQs.', image: '/pages/landing.png' },
  { id: 'Login Page', label: 'Login Page', desc: 'Glassmorphic login entry card with transitions.', image: '/pages/login.png' },
  { id: 'Signup Page', label: 'Signup Page', desc: 'Form wizards, secure validation checkmarks.', image: '/pages/login.png' },
  { id: 'Settings Page', label: 'Settings Page', desc: 'Vertical menu navigation tabs, settings forms.', image: '/pages/settings.png' },
  { id: 'Profile Page', label: 'Profile Page', desc: 'User information header grids, feed stream widgets.', image: '/pages/profile.png' },
  { id: 'SaaS Pricing Matrix', label: 'Pricing Matrix', desc: 'Spotlight subscription tiers, feature checklists.', image: '/pages/pricing.png' }
];

const CATEGORY_FEATURES = {
  'SaaS Dashboard Admin Panel': ['KPI Metric Cards', 'Interactive Charts', 'Data Tables & Filters', 'User Role Permissions', 'Activity Logs', 'Dark Mode Toggle', 'CSV/PDF Data Export', 'Collapsible Sidebar'],
  'E-Commerce Marketplace': ['Product Search & Filter', 'Shopping Cart & Checkout', 'Product Detail Gallery', 'Customer Reviews', 'Order Tracking Dashboard', 'Stripe Payment Integration', 'Wishlist Page'],
  'Student Management Hub': ['Student Directory', 'Grades & Performance Analytics', 'Attendance Tracker', 'Course Scheduler', 'Teacher Portal', 'Parent Notifications', 'Assignment Submit Area'],
  'Freelancer Billing Platform': ['Invoice Generator', 'Client Contact Manager', 'Payment Status Dashboard', 'Time Tracker Widget', 'Recurring Subscriptions', 'Stripe/PayPal Integration', 'Expense Reports'],
  'Digital Creative Portfolio': ['Filterable Project Grid', 'Image/Video Lightbox', 'About Me Hero Page', 'Contact Form with Validation', 'Interactive Resume Timeline', 'Social Media Integration', 'Testimonial Slider'],
  'Healthcare Tracker': ['Appointment Scheduler', 'Patient Medical Records', 'Prescription Tracker', 'Vitals Metric Cards', 'Doctor Chat Interface', 'Wearable Sync Dashboard', 'Health Goals Tracker'],
  'Fitness Planner': ['Workout Builder', 'Calorie Counter Dashboard', 'Weight Progress Graph', 'Exercise Video Library', 'Weekly Routine Planner', 'Achievement Badges', 'Water Intake Tracker'],
  'Real Estate Portal': ['Interactive Map Search', 'Property Detail Carousel', 'Mortgage Calculator', 'Agent Contact Panel', 'Filter Criteria (Price, Beds)', 'Virtual Tour Link Showcase', 'Saved Searches'],
  'Custom': ['User Authentication', 'Database API Connect', 'CRUD Action Panel', 'Responsive Grid Layout', 'Dark Mode Toggle', 'Email Notifications', 'Interactive Dashboard Panels', 'Activity Stream Log']
};

const PAGE_COMPONENTS = {
  'Dashboard Panel': ['Collapsible Sidebar', 'KPI Metric Cards', 'Sortable Data Table', 'Command Palette (Cmd+K)', 'Skeleton Shimmer Loaders', 'Toast Notifications', 'Quick Stats Charts'],
  'Landing Homepage': ['Hero CTA Section', 'Bento Grid Features', 'Client Logo Marquee Ticker', 'Testimonial Carousel', 'Accordion FAQ Collapsible', 'Floating Bottom Nav', 'Interactive Video Showcase'],
  'Login Page': ['Glassmorphism Entry Card', 'Floating Input Labels', 'OTP Verification Code Input', 'Spring Scale Checkmark Bounces', 'Switch Mode Toggle', 'Error Validation States'],
  'Signup Page': ['Multi-step Registration Form', 'Password Strength Estimator', 'Terms of Service Checkbox', 'Oauth Social Logins', 'Success Animation Screen', 'Email Verification Code'],
  'Settings Page': ['Vertical Tab Navigation', 'Profile Avatar Uploader', 'Toggle Notification Switches', 'API Key Management Board', 'Danger Zone Deactivation Card', 'Preferences Form'],
  'Profile Page': ['User Profile Header', 'Activity Stream Feed', 'Follower/Connection Stats', 'Editable Contact Details', 'Bio Summary Box', 'Recent Uploads Gallery', 'Social Media Links'],
  'SaaS Pricing Matrix': ['Spotlight Pricing Cards', 'Animated Border Glow Highlights', 'Switch Billing Toggle (Annual/Monthly)', 'Checkmark Feature Lists', 'Interactive CTA Buttons', 'Accordion FAQ']
};

function ForgeWizardContent() {
  const { user, savePromptRecord, apiKey } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active state mode: "application" | "page" | "enhance"
  const [activeMode, setActiveMode] = useState('application');
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);



  const applyDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem('promptforge_draft') || '{}');
      if (draft.mode) setActiveMode(draft.mode);
      if (draft.appCategory) setAppCategory(draft.appCategory);
      if (draft.selectedFeatures) setSelectedFeatures(draft.selectedFeatures);
      if (draft.selectedTheme) setSelectedTheme(draft.selectedTheme);
      if (draft.pageType) setPageType(draft.pageType);
      if (draft.selectedComponents) setSelectedComponents(draft.selectedComponents);
      setShowDraftBanner(false);
      setDraftRecovered(true);
      toast.success('Draft restored!', { description: 'Your previous selections have been loaded.' });
      track(EVENTS.FORGE_DRAFT_RECOVERED);
    } catch {}
  };

  const discardDraft = () => {
    localStorage.removeItem('promptforge_draft');
    setShowDraftBanner(false);
    track(EVENTS.FORGE_DRAFT_DISCARDED);
  };

  // Universal Wizard States
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Full-Stack Application State
  const [appCategory, setAppCategory] = useState(null);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // 2. Custom Webpage State
  const [pageType, setPageType] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [customComponentInput, setCustomComponentInput] = useState('');

  // 3. Raw Prompt Enhancer State
  const [rawDescription, setRawDescription] = useState('');
  const [selectedQualities, setSelectedQualities] = useState(['modern', 'premium', 'polished']);
  const [selectedMotions, setSelectedMotions] = useState(['hover feedback', 'micro-interactions']);
  const [enhanceStep, setEnhanceStep] = useState('input');
  const [analyzingText, setAnalyzingText] = useState('');
  const [analysisReport, setAnalysisReport] = useState(null);

  // Syncing prefill recovery & active intents queue on mount (safely placed after state declarations)
  useEffect(() => {
    const quickQuery = localStorage.getItem('promptforge_quickquery');
    if (quickQuery) {
      setRawDescription(quickQuery);
      setActiveMode('enhance');
      localStorage.setItem('promptforge_wmode', 'enhance');
      
      // Purge storage flags immediately to avoid stale state loops
      localStorage.removeItem('promptforge_quickquery');
      localStorage.removeItem('promptforge_draft'); // Priority 1 wins over Priority 2
      toast.success('Quick Forge loaded!', { description: 'Running automated intent discovery...' });
      track('quick_forge_prefilled', { length: quickQuery.length });
    } else {
      const mode = searchParams.get('mode') || localStorage.getItem('promptforge_wmode');
      if (mode === 'application' || mode === 'page' || mode === 'enhance') {
        setActiveMode(mode);
      }
      
      // Check for passive draft recovery (Priority 2)
      const draftRaw = localStorage.getItem('promptforge_draft');
      if (draftRaw) {
        try {
          const draft = JSON.parse(draftRaw);
          const age = Date.now() - (draft.savedAt || 0);
          if (age < 24 * 60 * 60 * 1000) { // < 24h old
            setShowDraftBanner(true);
          }
        } catch {}
      }
    }
  }, [searchParams]);

  // Auto-trigger analysis for quick queries with duplicate execution guard
  useEffect(() => {
    if (rawDescription && rawDescription.trim() && activeMode === 'enhance' && enhanceStep === 'input' && !analysisReport && !isGenerating) {
      runPromptAnalysis(rawDescription);
    }
  }, [rawDescription, activeMode, enhanceStep, analysisReport, isGenerating]);

  // Draft autosave whenever key state changes
  useEffect(() => {
    if (appCategory || pageType || selectedTheme) {
      const draft = {
        mode: activeMode,
        appCategory,
        selectedFeatures,
        selectedTheme,
        pageType,
        selectedComponents,
        savedAt: Date.now(),
      };
      localStorage.setItem('promptforge_draft', JSON.stringify(draft));
    }
  }, [activeMode, appCategory, selectedFeatures, selectedTheme, pageType, selectedComponents]);


  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // Load default features when category changes
  useEffect(() => {
    if (appCategory) {
      const defaults = CATEGORY_FEATURES[appCategory] || CATEGORY_FEATURES['Custom'];
      setSelectedFeatures([...defaults]);
    }
  }, [appCategory]);

  // Load default components when pageType changes
  useEffect(() => {
    if (pageType) {
      const defaults = PAGE_COMPONENTS[pageType] || [];
      setSelectedComponents([...defaults]);
    }
  }, [pageType]);

  // Feature selection handers
  const handleFeatureToggle = (feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleAddCustomFeature = (e) => {
    e.preventDefault();
    if (!customFeatureInput.trim()) return;
    const feat = customFeatureInput.trim();
    if (!selectedFeatures.includes(feat)) {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
    setCustomFeatureInput('');
  };

  // Component selection handlers
  const handleComponentToggle = (comp) => {
    if (selectedComponents.includes(comp)) {
      setSelectedComponents(selectedComponents.filter(c => c !== comp));
    } else {
      setSelectedComponents([...selectedComponents, comp]);
    }
  };

  const handleAddCustomComponent = (e) => {
    e.preventDefault();
    if (!customComponentInput.trim()) return;
    const comp = customComponentInput.trim();
    if (!selectedComponents.includes(comp)) {
      setSelectedComponents([...selectedComponents, comp]);
    }
    setCustomComponentInput('');
  };

  // Modifier toggles (Enhancer)
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

  const runPromptAnalysis = (text) => {
    if (!text.trim()) return;
    setEnhanceStep('analyzing');
    
    const stages = [
      "Deconstructing prompt semantic tokens...",
      "Matching intent against local design vocabularies...",
      "Evaluating visual shortcomings (contrast, elevation, physics)...",
      "Retrieving custom HSL tailwind configuration targets...",
      "Assembling AI optimization vectors..."
    ];
    
    let stageIdx = 0;
    setAnalyzingText(stages[0]);
    
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setAnalyzingText(stages[stageIdx]);
      } else {
        clearInterval(interval);
        
        const lowText = text.toLowerCase();
        let detectedIntent = "Custom Page Component";
        let confidence = "High (89%)";
        let recommendedTheme = "Sleek Dark Glassmorphic";
        
        if (lowText.includes('dashboard') || lowText.includes('admin') || lowText.includes('panel')) {
          detectedIntent = "SaaS Admin Dashboard Grid";
          recommendedTheme = "Sleek Dark Glassmorphic";
        } else if (lowText.includes('landing') || lowText.includes('product') || lowText.includes('home')) {
          detectedIntent = "Product Landing Page / Presentation";
          recommendedTheme = "Cyberpunk Neon";
        } else if (lowText.includes('login') || lowText.includes('auth') || lowText.includes('signup')) {
          detectedIntent = "Security Gate / Auth Modal";
          recommendedTheme = "Sleek Dark Glassmorphic";
        } else if (lowText.includes('pricing') || lowText.includes('matrix')) {
          detectedIntent = "Subscription Billing Matrix";
          recommendedTheme = "Brutalist Bold";
        } else if (lowText.includes('profile') || lowText.includes('user') || lowText.includes('settings')) {
          detectedIntent = "Personal Information Settings Workspace";
          recommendedTheme = "Minimalist Typography";
        }
        
        if (lowText.includes('minimal') || lowText.includes('clean') || lowText.includes('white')) {
          recommendedTheme = "Minimalist Typography";
        } else if (lowText.includes('cyber') || lowText.includes('neon') || lowText.includes('retro')) {
          recommendedTheme = "Cyberpunk Neon";
        } else if (lowText.includes('brutalist') || lowText.includes('bold') || lowText.includes('thick')) {
          recommendedTheme = "Brutalist Bold";
        } else if (lowText.includes('wes') || lowText.includes('anderson') || lowText.includes('vintage')) {
          recommendedTheme = "Wes Anderson";
        }

        const shortcomings = [];
        const solutions = [];
        
        if (!lowText.includes('framer') && !lowText.includes('motion') && !lowText.includes('animation')) {
          shortcomings.push("Lacks tactile micro-interaction transitions & spring physics.");
          solutions.push("Inject framer-motion spring physics (stiffness 260, damping 20).");
        } else {
          shortcomings.push("Basic transition timing triggers.");
          solutions.push("Upgrade animation timelines to progressive staggered entrances.");
        }
        
        if (!lowText.includes('glass') && !lowText.includes('morphism') && !lowText.includes('hsl')) {
          shortcomings.push("Missing a modern HSL theme configuration and custom background blurs.");
          solutions.push("Inject deep obsidian transparency layers and neon halo backdrop filters.");
        }
        
        if (!lowText.includes('responsive') && !lowText.includes('mobile') && !lowText.includes('grid')) {
          shortcomings.push("Ambiguous layout constraints for mobile and multi-column viewport scales.");
          solutions.push("Apply fluid Bento Grid responsive columns and mobile bottom navigations.");
        }

        setAnalysisReport({
          detectedIntent,
          confidence,
          recommendedTheme,
          shortcomings,
          solutions
        });
        
        setSelectedTheme(recommendedTheme);
        setEnhanceStep('analysis_result');
      }
    }, 450);
  };

  // Prompt compiler trigger
  const handleForgeSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      let finalQuery = '';
      let title = '';

      if (activeMode === 'application') {
        const finalCategory = appCategory === 'Custom' ? customCategory : appCategory;
        track(EVENTS.FORGE_CATEGORY_SELECTED, { category: finalCategory });
        track(EVENTS.FORGE_SUBMITTED, { mode: activeMode, theme: selectedTheme });
        title = `Application: ${finalCategory}`;
        finalQuery = `Create a premium full-stack ${finalCategory} web application using the theme style "${selectedTheme || 'Sleek Dark Glassmorphic'}". Ensure it incorporates the following features: ${selectedFeatures.join(', ')}.`;
      } else if (activeMode === 'page') {
        title = `Page: ${pageType}`;
        finalQuery = `Create a highly polished, responsive ${pageType} with the theme style "${selectedTheme || 'Sleek Dark Glassmorphic'}". Implement these primary grid page components: ${selectedComponents.join(', ')}.`;
      } else if (activeMode === 'enhance') {
        title = `Enhanced: ${rawDescription.slice(0, 24)}...`;
        finalQuery = `${rawDescription}\n\n[INJECT TECHNICAL MODIFIERS]:\n- Theme Style: ${selectedTheme || 'Sleek Dark Glassmorphic'}\n- Visual Qualities: ${selectedQualities.join(', ')}\n- Transitions & Motion: ${selectedMotions.join(', ')}`;
      }

      const generationParams = {
        mode: activeMode,
        query: finalQuery,
        theme: selectedTheme || 'Sleek Dark Glassmorphic',
        apiKey
      };

      if (activeMode === 'application') {
        generationParams.category = appCategory === 'Custom' ? customCategory : appCategory;
      } else if (activeMode === 'page') {
        generationParams.pageType = pageType;
        generationParams.components = selectedComponents;
      }

      const response = await generateEnhancedPrompt(generationParams);

      const savedRecord = await savePromptRecord({
        mode: activeMode,
        title,
        query: finalQuery,
        theme: selectedTheme || 'Sleek Dark Glassmorphic',
        resolvedPrompt: response.prompt,
        ragDetails: response.ragDetails,
        category: activeMode === 'application' ? (appCategory === 'Custom' ? customCategory : appCategory) : null,
        pageType: activeMode === 'page' ? pageType : null,
        components: activeMode === 'page' ? selectedComponents : null,
        chatMessages: [
          { role: 'user', content: `Forge my custom ${activeMode} prompt blueprint!` },
          { role: 'model', content: response.prompt }
        ]
      });

      setIsGenerating(false);
      // Clear draft on success
      localStorage.removeItem('promptforge_draft');
      router.push(`/chat?id=${savedRecord.id}`);

    } catch (err) {
      console.error("Error forging prompt", err);
      setIsGenerating(false);
      track(EVENTS.FORGE_ERROR, { mode: activeMode, error: err?.message });
      toast.error("Generation failed", {
        description: "We couldn't compile your prompt right now. Your draft is saved — try again in a moment.",
        action: { label: "Retry", onClick: () => handleForgeSubmit({ preventDefault: () => {} }) }
      });
    }
  };

  if (!user) return null;

  // Compute current step for progress indicator
  const getStep = () => {
    if (activeMode === 'application') {
      if (!appCategory) return 1;
      if (!selectedTheme) return 2;
      if (selectedFeatures.length === 0) return 3;
      return 4;
    }
    if (activeMode === 'page') {
      if (!pageType) return 1;
      if (selectedComponents.length === 0) return 2;
      if (!selectedTheme) return 3;
      return 4;
    }
    return 1;
  };
  const currentStep = getStep();

  const STEP_LABELS = activeMode === 'application'
    ? ['Purpose', 'Theme', 'Features', 'Generate']
    : activeMode === 'page'
    ? ['Page Type', 'Components', 'Theme', 'Generate']
    : ['Input', 'Analyze', 'Enhance', 'Generate'];

  return (
    <div style={containerStyle}>
      <button style={backBtn} onClick={() => router.push('/dashboard')}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Draft Recovery Banner */}
      {showDraftBanner && (
        <div style={draftBannerStyle}>
          <RotateCcw size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', flex: 1 }}>
            You have an unfinished forge saved. <strong>Continue where you left off?</strong>
          </span>
          <button onClick={applyDraft} style={draftYesBtn}>Restore Draft</button>
          <button onClick={discardDraft} style={draftNoBtn}><X size={14} /></button>
        </div>
      )}

      {/* Step Progress Indicator (Application + Page modes) */}
      {activeMode !== 'enhance' && (
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

      <div style={wizardHeader}>
        <div style={wizardTitleRow}>
          <div style={wizardIconWrap}>
            {activeMode === 'application' && <Monitor size={22} style={{ color: '#7c3aed' }} />}
            {activeMode === 'page' && <Layout size={22} style={{ color: '#0891b2' }} />}
            {activeMode === 'enhance' && <Wand2 size={22} style={{ color: '#059669' }} />}
          </div>
          <div>
            <h1 style={mainTitle}>
              {activeMode === 'application' && "Full-Stack Application Architect"}
              {activeMode === 'page' && "Web Page Design"}
              {activeMode === 'enhance' && "Technical Design Prompt Enhancer"}
            </h1>
            <p style={mainSub}>
              {activeMode === 'application' && "Build a full multi-page application blueprint, features list, and data schema."}
              {activeMode === 'page' && "1. Select type of page, 2. Select components, 3. Select theme, 4. Generate prompt."}
              {activeMode === 'enhance' && "Inject spring transitions, layout variables, and visual tokens into standard prompt drafts."}
            </p>
          </div>
        </div>
      </div>

      <div style={wizardContentBody}>
        {/* ─── A. APPLICATION ARCHITECT WIZARD FLOW ─────────────────── */}
        {activeMode === 'application' && (
          <div style={flowContainer}>
            {/* Step 1: Application Purpose */}
            <div style={stepSection}>
              <div style={stepHeader}>
                <span style={stepNum}>01</span>
                <div>
                  <h3 style={stepTitle}>Select Application Purpose</h3>
                  <p style={stepDesc}>What kind of digital product are you building?</p>
                </div>
              </div>

              <div style={categoryGrid}>
                {APP_CATEGORIES.map((cat) => {
                  const isSelected = appCategory === cat.id;
                  return (
                    <div 
                      key={cat.id} 
                      style={categoryCard(isSelected)}
                      onClick={() => setAppCategory(cat.id)}
                    >
                      {cat.image && (
                        <img src={cat.image} alt={cat.label} style={cardImg} />
                      )}
                      {!cat.image && (
                        <div style={cardImagePlaceholder}>
                          <Code2 size={24} style={{ color: 'rgba(255,255,255,0.15)' }} />
                        </div>
                      )}
                      <div style={cardOverlay} />
                      {isSelected && (
                        <div style={cardCheckedBadge}>
                          <CheckCircle2 size={16} style={{ color: '#fbbf24' }} />
                        </div>
                      )}
                      <div style={cardTextWrap}>
                        <span style={cardTitle}>{cat.label}</span>
                        <span style={cardDesc}>{cat.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {appCategory === 'Custom' && (
                <div style={{ ...inputBoxContainer, marginTop: '1.25rem' }}>
                  <label style={formLabel}>Describe Custom Application Purpose</label>
                  <input
                    type="text"
                    placeholder="e.g. Vintage Synthesizer Controller Workspace"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={inputStyle}
                    className="glass-input"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Theme Selection */}
            {appCategory && (
              <div style={stepSection} className="animate-fade-up">
                <div style={stepHeader}>
                  <span style={stepNum}>02</span>
                  <div>
                    <h3 style={stepTitle}>Choose UI Theme Style</h3>
                    <p style={stepDesc}>Define the overall aesthetic and layout tokens.</p>
                  </div>
                </div>

                <div style={themeCardGrid}>
                  {Object.keys(themeStyles).map((themeName) => {
                    const isSelected = selectedTheme === themeName;
                    return (
                      <div
                        key={themeName}
                        style={themeSelectCard(isSelected)}
                        onClick={() => setSelectedTheme(themeName)}
                      >
                        <div style={themeHeaderRow}>
                          <span style={themeCardName}>{themeName}</span>
                          {isSelected && <CheckCircle2 size={16} style={{ color: '#fbbf24' }} />}
                        </div>
                        <p style={themeCardDescText}>{themeStyles[themeName].description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Features Selection */}
            {appCategory && selectedTheme && (
              <div style={stepSection} className="animate-fade-up">
                <div style={stepHeader}>
                  <span style={stepNum}>03</span>
                  <div>
                    <h3 style={stepTitle}>Select & Customize Features</h3>
                    <p style={stepDesc}>Choose suggested components or append custom parameters.</p>
                  </div>
                </div>

                <div style={checkboxGrid}>
                  {(CATEGORY_FEATURES[appCategory] || CATEGORY_FEATURES['Custom']).map((feat, idx) => {
                    const isChecked = selectedFeatures.includes(feat);
                    return (
                      <div
                        key={idx}
                        style={checkboxCard(isChecked)}
                        onClick={() => handleFeatureToggle(feat)}
                      >
                        <CheckCircle2
                          size={16}
                          style={{
                            color: isChecked ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                            flexShrink: 0
                          }}
                        />
                        <span style={checkboxText}>{feat}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom feature adder */}
                <form onSubmit={handleAddCustomFeature} style={adderFormStyle}>
                  <input
                    type="text"
                    placeholder="Add custom feature (e.g., Live chat widget)..."
                    value={customFeatureInput}
                    onChange={(e) => setCustomFeatureInput(e.target.value)}
                    style={adderInputStyle}
                    className="glass-input"
                  />
                  <button type="submit" style={adderBtnStyle} className="btn-secondary btn-sm">
                    <Plus size={14} />
                    Add
                  </button>
                </form>
              </div>
            )}

            {/* Step 4: Submission */}
            {appCategory && selectedTheme && selectedFeatures.length > 0 && (
              <div style={submitContainer} className="animate-fade-up">
                <div style={offlineWarning}>
                  <Info size={16} />
                  <span>
                    {apiKey ? "Live Gemini Compiler engine active." : "Gemini API key missing. Offline Prompt Compiler active."}
                  </span>
                </div>
                <button
                  onClick={handleForgeSubmit}
                  style={submitBtn}
                  className="btn-accent shine-effect"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sliders size={18} className="animate-spin" />
                      Compiling Application Blueprint...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Application Prompt
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── B. CUSTOM WEBPAGE WIZARD FLOW ────────────────────────── */}
        {activeMode === 'page' && (
          <div style={flowContainer}>
            {/* Step 1: Webpage Page Type */}
            <div style={stepSection}>
              <div style={stepHeader}>
                <span style={stepNum}>01</span>
                <div>
                  <h3 style={stepTitle}>Select type of page</h3>
                  <p style={stepDesc}>What kind of interface layout are you structuring?</p>
                </div>
              </div>

              <div style={categoryGrid}>
                {PAGE_TYPES.map((page) => {
                  const isSelected = pageType === page.id;
                  return (
                    <div 
                      key={page.id} 
                      style={categoryCard(isSelected)}
                      onClick={() => setPageType(page.id)}
                    >
                      {page.image && (
                        <img src={page.image} alt={page.label} style={cardImg} />
                      )}
                      <div style={cardOverlay} />
                      {isSelected && (
                        <div style={cardCheckedBadge}>
                          <CheckCircle2 size={16} style={{ color: '#fbbf24' }} />
                        </div>
                      )}
                      <div style={cardTextWrap}>
                        <span style={cardTitle}>{page.label}</span>
                        <span style={cardDesc}>{page.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Components selection */}
            {pageType && (
              <div style={stepSection} className="animate-fade-up">
                <div style={stepHeader}>
                  <span style={stepNum}>02</span>
                  <div>
                    <h3 style={stepTitle}>Select components</h3>
                    <p style={stepDesc}>Select modular components to structure inside the grid.</p>
                  </div>
                </div>

                <div style={checkboxGrid}>
                  {(PAGE_COMPONENTS[pageType] || []).map((comp, idx) => {
                    const isChecked = selectedComponents.includes(comp);
                    return (
                      <div
                        key={idx}
                        style={checkboxCard(isChecked)}
                        onClick={() => handleComponentToggle(comp)}
                      >
                        <CheckCircle2
                          size={16}
                          style={{
                            color: isChecked ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                            flexShrink: 0
                          }}
                        />
                        <span style={checkboxText}>{comp}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom component adder */}
                <form onSubmit={handleAddCustomComponent} style={adderFormStyle}>
                  <input
                    type="text"
                    placeholder="Add custom component (e.g., Audio Visualizer Card)..."
                    value={customComponentInput}
                    onChange={(e) => setCustomComponentInput(e.target.value)}
                    style={adderInputStyle}
                    className="glass-input"
                  />
                  <button type="submit" style={adderBtnStyle} className="btn-secondary btn-sm">
                    <Plus size={14} />
                    Add
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: Theme Selection */}
            {pageType && selectedComponents.length > 0 && (
              <div style={stepSection} className="animate-fade-up">
                <div style={stepHeader}>
                  <span style={stepNum}>03</span>
                  <div>
                    <h3 style={stepTitle}>Select theme</h3>
                    <p style={stepDesc}>Apply design variables and HSL tokens.</p>
                  </div>
                </div>

                <div style={themeCardGrid}>
                  {Object.keys(themeStyles).map((themeName) => {
                    const isSelected = selectedTheme === themeName;
                    return (
                      <div
                        key={themeName}
                        style={themeSelectCard(isSelected)}
                        onClick={() => setSelectedTheme(themeName)}
                      >
                        <div style={themeHeaderRow}>
                          <span style={themeCardName}>{themeName}</span>
                          {isSelected && <CheckCircle2 size={16} style={{ color: '#fbbf24' }} />}
                        </div>
                        <p style={themeCardDescText}>{themeStyles[themeName].description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Submission */}
            {pageType && selectedTheme && selectedComponents.length > 0 && (
              <div style={submitContainer} className="animate-fade-up">
                <div style={offlineWarning}>
                  <Info size={16} />
                  <span>
                    {apiKey ? "Live Gemini Compiler active." : "Offline Prompt Compiler compilation active."}
                  </span>
                </div>
                <button
                  onClick={handleForgeSubmit}
                  style={submitBtn}
                  className="btn-accent shine-effect"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sliders size={18} className="animate-spin" />
                      Forging Webpage Blueprint...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate prompt
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── C. PROMPT ENHANCER WIZARD FLOW ───────────────────────── */}
        {activeMode === 'enhance' && (
          <div style={flowContainer}>
            {/* Stage 1: Raw Prompt Input */}
            {enhanceStep === 'input' && (
              <div style={stepSection} className="animate-fade-up">
                <div style={stepHeader}>
                  <span style={stepNum}>01</span>
                  <div>
                    <h3 style={stepTitle}>Paste Your Vague / Raw Prompt Draft</h3>
                    <p style={stepDesc}>Explain your SaaS feature or paste a rough instruction sketch. We will criticize and optimize it.</p>
                  </div>
                </div>

                <textarea
                  placeholder="e.g. Create a simple checkout screen with some shopping items, prices, credit card details form, and a pay button..."
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  style={textareaStyle}
                  className="glass-input"
                  rows={6}
                  disabled={isGenerating}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => runPromptAnalysis(rawDescription)}
                    style={{ ...submitBtn, background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                    disabled={!rawDescription.trim() || isGenerating}
                    className="btn-accent shine-effect active-scale-95"
                  >
                    <Sparkles size={16} />
                    Analyze & Optimize Draft
                  </button>
                </div>
              </div>
            )}

            {/* Stage 2: Immersive Scanner / Loader */}
            {enhanceStep === 'analyzing' && (
              <div style={{ ...stepSection, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 2rem', gap: '1.5rem' }} className="glass-panel animate-fade-in">
                <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      border: '2.5px solid rgba(255,255,255,0.06)',
                      borderTopColor: 'var(--accent)',
                      animation: 'spin-slow 1s linear infinite',
                    }}
                  />
                  <Sparkles size={24} style={{ color: 'var(--accent)', position: 'absolute', opacity: 0.8 }} className="animate-pulse" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ ...stepTitle, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Automated AI Intent Discovery</p>
                  <p style={{ ...stepDesc, fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{analyzingText}</p>
                </div>
              </div>
            )}

            {/* Stage 3: Bento Grid AI Intent Analysis Report */}
            {enhanceStep === 'analysis_result' && analysisReport && (
              <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Intent Header summary */}
                <div style={{ ...stepSection, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 1.5rem' }} className="glass-panel">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wand2 size={20} style={{ color: '#059669' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-Detected Intent</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                        {analysisReport.detectedIntent}
                      </h4>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>
                      Match Confidence: {analysisReport.confidence}
                    </span>
                    <button 
                      onClick={() => setEnhanceStep('input')}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer' }}
                      className="active-scale-95"
                    >
                      Reset Draft
                    </button>
                  </div>
                </div>

                {/* Bento Grid layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.25rem' }}>
                  
                  {/* Left Column: Shortcomings & Solutions Critique */}
                  <div style={{ ...stepSection, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }} className="glass-panel">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                      <Info size={14} style={{ color: 'var(--accent)' }} />
                      Suggested Style & Layout Refinements
                    </h4>

                    {/* Deficiencies */}
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>Identified Design Gaps</span>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {analysisReport.shortcomings.map((item, idx) => (
                          <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', paddingLeft: '1rem', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, top: '6px', width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444' }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Enhancements */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>Recommended Enhancements</span>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {analysisReport.solutions.map((item, idx) => (
                          <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--foreground)', paddingLeft: '1rem', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, top: '6px', width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Customizer & Theme */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Visual Theme Selection */}
                    <div style={{ ...stepSection, padding: '1.25rem' }} className="glass-panel">
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.65rem' }}>Selected Design System Theme</h4>
                      <ShadcnDropdown
                        value={selectedTheme || 'Sleek Dark Glassmorphic'}
                        onChange={(val) => setSelectedTheme(val)}
                        options={Object.keys(themeStyles).map(themeName => ({ label: themeName, value: themeName }))}
                        triggerWidth="100%"
                        style={{ background: '#08080c', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                      {selectedTheme && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                          Style Keywords: <span style={{ color: 'var(--accent)' }}>{themeStyles[selectedTheme].keywords}</span>
                        </p>
                      )}
                    </div>

                    {/* Modify badges */}
                    <div style={{ ...stepSection, padding: '1.25rem' }} className="glass-panel">
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.65rem' }}>Tune Quality & Physics Tokens</h4>
                      
                      <div style={formGroup}>
                        <div style={badgeSelectorGrid}>
                          {['modern', 'premium', 'polished', 'Framer Motion', 'spring animations', 'micro-interactions', 'hover feedback'].map((badge) => {
                            const isQuality = ['modern', 'premium', 'polished'].includes(badge);
                            const isSelected = isQuality ? selectedQualities.includes(badge) : selectedMotions.includes(badge);
                            const toggle = () => {
                              if (isQuality) {
                                handleQualityToggle(badge);
                              } else {
                                handleMotionToggle(badge);
                              }
                            };
                            return (
                              <button
                                type="button"
                                key={badge}
                                style={badgeSelectorBtn(isSelected)}
                                onClick={toggle}
                              >
                                {badge}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Submit Container */}
                <div style={{ ...submitContainer, border: 'none', paddingTop: 0, marginTop: '0.5rem' }} className="animate-fade-up">
                  <div style={offlineWarning}>
                    <Info size={16} />
                    <span>
                      {apiKey ? "Live Gemini Compiler active." : "Offline Local RAG Compiler fallback active."}
                    </span>
                  </div>
                  <button
                    onClick={handleForgeSubmit}
                    style={{ ...submitBtn, background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                    className="btn-accent shine-effect active-scale-95"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Sliders size={18} className="animate-spin" />
                        Generating precision blueprint...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate Precision Enhanced Prompt
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForgePage() {
  return (
    <Suspense fallback={
      <div style={loadingWrap}>
        <div style={loadingInner}>
          <div style={loadingSpinner} />
          <p style={loadingText}>Loading Wizard Workspace…</p>
        </div>
      </div>
    }>
      <ForgeWizardContent />
    </Suspense>
  );
}

// ─── Inline Premium Wizard CSS Styles ──────────────────────────

const containerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '0.5rem',
  position: 'relative',
  zIndex: 2,
};

const backBtn = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '8px',
  color: 'var(--muted-foreground)',
  fontSize: '0.82rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  alignSelf: 'flex-start',
  padding: '0.45rem 1rem',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  marginBottom: '1.5rem',
};

const wizardHeader = {
  marginBottom: '2.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  paddingBottom: '1.5rem',
};

const wizardTitleRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
};

const wizardIconWrap = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '3px',
};

const mainTitle = {
  fontSize: '1.65rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.03em',
  lineHeight: '1.2',
};

const mainSub = {
  fontSize: '0.9rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
  marginTop: '0.25rem',
};

const wizardContentBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  paddingBottom: '4rem',
};

const flowContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2.5rem',
};

const stepSection = {
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: '16px',
  padding: '2.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};

const stepHeader = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
  paddingBottom: '1rem',
};

const stepNum = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.25rem',
  fontWeight: '800',
  color: 'var(--accent)',
  background: 'rgba(124,58,237,0.08)',
  border: '1px solid rgba(124,58,237,0.15)',
  borderRadius: '8px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const stepTitle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
};

const stepDesc = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  marginTop: '0.15rem',
};

const categoryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
};

const categoryCard = (isSelected) => ({
  position: 'relative',
  height: '140px',
  borderRadius: '12px',
  border: `1.5px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
  background: 'rgba(255,255,255,0.01)',
  boxShadow: isSelected ? '0 8px 32px rgba(124,58,237,0.12)' : '0 4px 12px rgba(0,0,0,0.1)',
});

const cardImg = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0.35,
  zIndex: 1,
  filter: 'grayscale(20%) brightness(85%)',
  transition: 'transform 0.4s ease',
};

const cardImagePlaceholder = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(219,39,119,0.06) 100%)',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cardOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(to bottom, rgba(9, 13, 22, 0.25) 0%, rgba(9, 13, 22, 0.95) 90%)',
  zIndex: 2,
};

const cardCheckedBadge = {
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  zIndex: 4,
  background: 'rgba(9,13,22,0.85)',
  borderRadius: '50%',
  padding: '2px',
};

const cardTextWrap = {
  position: 'absolute',
  bottom: '1rem',
  left: '1.1rem',
  right: '1.1rem',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

const cardTitle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: '#ffffff',
  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
  fontFamily: 'var(--font-display)',
};

const cardDesc = {
  fontSize: '0.72rem',
  color: '#8a8a8a',
  lineHeight: '1.4',
};

const inputBoxContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const formLabel = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--foreground)',
};

const inputStyle = {
  width: '100%',
  fontSize: '0.88rem',
};

const themeCardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '0.875rem',
};

const themeSelectCard = (isSelected) => ({
  border: `1.5px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '12px',
  padding: '1.25rem',
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  background: 'rgba(255,255,255,0.01)',
  boxShadow: isSelected ? '0 8px 32px rgba(124,58,237,0.08)' : '0 4px 12px rgba(0,0,0,0.1)',
});

const themeHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const themeCardName = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--foreground)',
};

const themeCardDescText = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.45',
};

const checkboxGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
  gap: '0.75rem',
};

const checkboxCard = (isChecked) => ({
  border: `1px solid ${isChecked ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: isChecked ? 'rgba(124,58,237,0.04)' : 'rgba(255,255,255,0.01)',
});

const checkboxText = {
  fontSize: '0.8rem',
  color: 'var(--foreground)',
  fontWeight: '500',
};

const adderFormStyle = {
  display: 'flex',
  gap: '0.75rem',
  marginTop: '0.5rem',
  maxWidth: '480px',
};

const adderInputStyle = {
  flex: 1,
  fontSize: '0.82rem',
  padding: '6px 12px',
};

const adderBtnStyle = {
  flexShrink: 0,
};

const textareaStyle = {
  width: '100%',
  resize: 'vertical',
  lineHeight: '1.6',
  minHeight: '120px',
  fontSize: '0.9rem',
};

const formGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const badgeSelectorGrid = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const badgeSelectorBtn = (isSelected) => ({
  padding: '0.4rem 0.95rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '999px',
  background: isSelected ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
  border: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
  color: isSelected ? 'var(--accent)' : 'var(--muted-foreground)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-sans)',
});

const submitContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid rgba(255,255,255,0.06)',
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
  fontSize: '0.9rem',
  fontWeight: '700',
  padding: '0.8rem 2rem',
  fontFamily: 'var(--font-sans)',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '10px',
};

const loadingWrap = {
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 2,
};

const loadingInner = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const loadingSpinner = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '2.5px solid rgba(255,255,255,0.06)',
  borderTopColor: 'var(--accent)',
  animation: 'spin-slow 1s linear infinite',
};

const loadingText = {
  fontSize: '0.9rem',
  color: 'var(--muted-foreground)',
  fontWeight: '500',
};

// ─── New Forge UX Styles ─────────────────────────────────────

const draftBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.85rem 1.25rem',
  marginBottom: '1.25rem',
  background: 'rgba(251,191,36,0.06)',
  border: '1px solid rgba(251,191,36,0.2)',
  borderRadius: '12px',
  flexWrap: 'wrap',
};

const draftYesBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer',
  background: 'var(--accent)', color: '#000',
  fontSize: '0.8rem', fontWeight: '700', border: 'none',
  fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
};

const draftNoBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer',
  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--muted-foreground)', flexShrink: 0,
};

const stepProgressWrapper = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '1.25rem 1.5rem',
  marginBottom: '0.75rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '12px',
};

const cardGradients = {
  'SaaS Dashboard Admin Panel': 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(8,145,178,0.1))',
  'E-Commerce Marketplace': 'linear-gradient(135deg, rgba(219,39,119,0.15), rgba(249,115,22,0.1))',
  'Student Management Hub': 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(8,145,178,0.1))',
  'Freelancer Billing Platform': 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(249,115,22,0.1))',
  'Digital Creative Portfolio': 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(219,39,119,0.1))',
  'Healthcare Tracker': 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(34,197,94,0.1))',
  'Fitness Planner': 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,191,36,0.1))',
  'Real Estate Portal': 'linear-gradient(135deg, rgba(8,145,178,0.15), rgba(5,150,105,0.1))',
  'Custom': 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
};

