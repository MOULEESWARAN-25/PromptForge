import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { track, EVENTS } from '@/lib/analytics';
import { CATEGORY_FEATURES } from '../constants/appCategories';
import { PAGE_COMPONENTS } from '../constants/pageTemplates';

export function useForgeState(user, router) {
  const searchParams = useSearchParams();

  // Active state mode: "application" | "page" | "component" | "enhance" | null
  const [activeMode, setActiveMode] = useState(null);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Universal Wizard States
  const [selectedTheme, setSelectedTheme] = useState(null);

  // 1. Full-Stack Application State
  const [appCategory, setAppCategory] = useState(null);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // 2. Custom Webpage State
  const [pageType, setPageType] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [customComponentInput, setCustomComponentInput] = useState('');

  // 4. Single Component State
  const [componentType, setComponentType] = useState(null);
  const [customComponentType, setCustomComponentType] = useState('');
  
  // 5. Existing Codebase Sync State
  const [projectIntegration, setProjectIntegration] = useState(null); // 'new' | 'existing'
  const [framework, setFramework] = useState('Shadcn/UI');
  const [codebaseContext, setCodebaseContext] = useState('');
  const [ideSyncPromptCopied, setIdeSyncPromptCopied] = useState(false);
  const [ideResponseContext, setIdeResponseContext] = useState('');

  // 6. Clarification Layer States
  const [clarificationActive, setClarificationActive] = useState(false);
  const [clarifiedAudience, setClarifiedAudience] = useState('');
  const [clarifiedDensity, setClarifiedDensity] = useState('Balanced');
  const [clarifiedViewport, setClarifiedViewport] = useState('Responsive Grid');

  // 3. Raw Prompt Enhancer State
  const [rawDescription, setRawDescription] = useState('');
  const [selectedQualities, setSelectedQualities] = useState(['modern', 'premium', 'polished']);
  const [selectedMotions, setSelectedMotions] = useState(['hover feedback', 'micro-interactions']);
  const [enhanceStep, setEnhanceStep] = useState('input');
  const [analyzingText, setAnalyzingText] = useState('');
  const [analysisReport, setAnalysisReport] = useState(null);

  const applyDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem('promptforge_draft') || '{}');
      if (draft.mode) setActiveMode(draft.mode);
      if (draft.appCategory) setAppCategory(draft.appCategory);
      if (draft.selectedFeatures) setSelectedFeatures(draft.selectedFeatures);
      if (draft.selectedTheme) setSelectedTheme(draft.selectedTheme);
      if (draft.pageType) setPageType(draft.pageType);
      if (draft.selectedComponents) setSelectedComponents(draft.selectedComponents);
      if (draft.componentType) setComponentType(draft.componentType);
      if (draft.projectIntegration) setProjectIntegration(draft.projectIntegration);
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

  // Syncing prefill recovery & active intents queue on mount
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
      if (mode === 'application' || mode === 'page' || mode === 'component' || mode === 'enhance') {
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

  // Draft autosave whenever key state changes
  useEffect(() => {
    if (appCategory || pageType || componentType || selectedTheme) {
      const draft = {
        mode: activeMode,
        appCategory,
        selectedFeatures,
        selectedTheme,
        pageType,
        selectedComponents,
        componentType,
        projectIntegration,
        framework,
        savedAt: Date.now(),
      };
      localStorage.setItem('promptforge_draft', JSON.stringify(draft));
    }
  }, [activeMode, appCategory, selectedFeatures, selectedTheme, pageType, selectedComponents, componentType, projectIntegration, framework]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && router) {
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

  // Handlers
  const handleCategorySelect = (catId) => {
    setAppCategory(catId);
    track(EVENTS.FORGE_CATEGORY_SELECTED, { category: catId });
  };

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
      if (!projectIntegration) return 4;
      return 5;
    }
    if (activeMode === 'component') {
      if (!componentType) return 1;
      if (!selectedTheme) return 2;
      if (!projectIntegration) return 3;
      return 4;
    }
    return 1;
  };

  return {
    activeMode, setActiveMode,
    draftRecovered, setDraftRecovered,
    showDraftBanner, setShowDraftBanner,
    selectedTheme, setSelectedTheme,
    appCategory, setAppCategory,
    customCategory, setCustomCategory,
    selectedFeatures, setSelectedFeatures,
    customFeatureInput, setCustomFeatureInput,
    pageType, setPageType,
    selectedComponents, setSelectedComponents,
    customComponentInput, setCustomComponentInput,
    componentType, setComponentType,
    customComponentType, setCustomComponentType,
    projectIntegration, setProjectIntegration,
    framework, setFramework,
    codebaseContext, setCodebaseContext,
    ideSyncPromptCopied, setIdeSyncPromptCopied,
    ideResponseContext, setIdeResponseContext,
    clarificationActive, setClarificationActive,
    clarifiedAudience, setClarifiedAudience,
    clarifiedDensity, setClarifiedDensity,
    clarifiedViewport, setClarifiedViewport,
    rawDescription, setRawDescription,
    selectedQualities, setSelectedQualities,
    selectedMotions, setSelectedMotions,
    enhanceStep, setEnhanceStep,
    analyzingText, setAnalyzingText,
    analysisReport, setAnalysisReport,
    applyDraft, discardDraft,
    handleCategorySelect, handleFeatureToggle, handleAddCustomFeature,
    handleComponentToggle, handleAddCustomComponent,
    handleQualityToggle, handleMotionToggle,
    getStep
  };
}
