import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { track, EVENTS } from '@/lib/analytics';
import { CATEGORY_FEATURES } from '../constants/appCategories';
import { PAGE_COMPONENTS } from '../constants/pageTemplates';

export function useForgeState(user, router, categories = null, templates = null) {
  const searchParams = useSearchParams();

  // Active state mode: "application" | "page" | "component" | "enhance" | null
  const [activeMode, setActiveMode] = useState(null);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [autoSubmitPrompt, setAutoSubmitPrompt] = useState(false);

  // Universal Wizard States
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedTypography, setSelectedTypography] = useState('Inter');
  const [selectedModel, setSelectedModel] = useState('gemini');

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
  const [projectIntegration, setProjectIntegration] = useState('new'); // 'new' | 'existing'
  const [framework, setFramework] = useState('Shadcn/UI');
  const [codebaseContext, setCodebaseContext] = useState('');
  const [ideSyncPromptCopied, setIdeSyncPromptCopied] = useState(false);
  const [ideResponseContext, setIdeResponseContext] = useState('');

  // 5b. Detailed Project Setup States (Wizard pagination)
  const [projectName, setProjectName] = useState('my-awesome-project');
  const [projectDescription, setProjectDescription] = useState('A premium SaaS application.');
  const [frontendStack, setFrontendStack] = useState('Next.js (App Router)');
  const [backendStack, setBackendStack] = useState('Next.js Serverless');
  const [database, setDatabase] = useState('PostgreSQL');
  const [authOption, setAuthOption] = useState('NextAuth.js / Auth.js');
  const [deployment, setDeployment] = useState('Vercel');
  const [additionalFeatures, setAdditionalFeatures] = useState(['TypeScript', 'Tailwind CSS']);

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
      if (draft.selectedTypography) setSelectedTypography(draft.selectedTypography);
      if (draft.selectedModel) setSelectedModel(draft.selectedModel);
      if (draft.pageType) setPageType(draft.pageType);
      if (draft.selectedComponents) setSelectedComponents(draft.selectedComponents);
      if (draft.componentType) setComponentType(draft.componentType);
      if (draft.projectIntegration) setProjectIntegration(draft.projectIntegration);
      if (draft.framework) setFramework(draft.framework);
      if (draft.projectName) setProjectName(draft.projectName);
      if (draft.projectDescription) setProjectDescription(draft.projectDescription);
      if (draft.frontendStack) setFrontendStack(draft.frontendStack);
      if (draft.backendStack) setBackendStack(draft.backendStack);
      if (draft.database) setDatabase(draft.database);
      if (draft.authOption) setAuthOption(draft.authOption);
      if (draft.deployment) setDeployment(draft.deployment);
      if (draft.additionalFeatures) setAdditionalFeatures(draft.additionalFeatures);
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
    if (!activeMode) {
      router.push('/dashboard');
    }
  };

  // Syncing prefill recovery & active intents queue on mount
  useEffect(() => {
    const quickQuery = localStorage.getItem('promptforge_quickquery');
    const qTitle = localStorage.getItem('promptforge_template_title');
    if (quickQuery) {
      setRawDescription(quickQuery);
      setActiveMode('enhance');
      localStorage.setItem('promptforge_wmode', 'enhance');
      if (qTitle) {
        setTemplateTitle(qTitle);
      }
      setAutoSubmitPrompt(true);
      
      // Purge storage flags immediately to avoid stale state loops
      localStorage.removeItem('promptforge_quickquery');
      localStorage.removeItem('promptforge_template_title');
      localStorage.removeItem('promptforge_draft'); // Priority 1 wins over Priority 2
      toast.success('Quick Forge loaded!', { description: 'Running automated intent discovery...' });
      track('quick_forge_prefilled', { length: quickQuery.length });
    } else {
      const mode = searchParams.get('mode') || localStorage.getItem('promptforge_wmode');
      if (mode === 'application' || mode === 'page' || mode === 'component' || mode === 'enhance') {
        setActiveMode(mode);
      } else {
        // No valid mode in query/cache. Check for draft recovery first.
        const draftRaw = localStorage.getItem('promptforge_draft');
        let hasDraft = false;
        if (draftRaw) {
          try {
            const draft = JSON.parse(draftRaw);
            const age = Date.now() - (draft.savedAt || 0);
            if (age < 24 * 60 * 60 * 1000 && draft.mode) {
              hasDraft = true;
              setShowDraftBanner(true);
            }
          } catch {}
        }
        if (!hasDraft) {
          router.push('/dashboard');
        }
      }
    }
  }, [searchParams, router]);

  // Draft autosave whenever key state changes
  useEffect(() => {
    if (appCategory || pageType || componentType || selectedTheme || selectedModel) {
      const draft = {
        mode: activeMode,
        appCategory,
        selectedFeatures,
        selectedTheme,
        selectedTypography,
        selectedModel,
        pageType,
        selectedComponents,
        componentType,
        projectIntegration,
        framework,
        projectName,
        projectDescription,
        frontendStack,
        backendStack,
        database,
        authOption,
        deployment,
        additionalFeatures,
        savedAt: Date.now(),
      };
      localStorage.setItem('promptforge_draft', JSON.stringify(draft));
    }
  }, [
    activeMode, appCategory, selectedFeatures, selectedTheme, selectedTypography, selectedModel, pageType, selectedComponents, componentType, projectIntegration, framework,
    projectName, projectDescription, frontendStack, backendStack, database, authOption, deployment, additionalFeatures
  ]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && router) {
      router.push('/auth');
    }
  }, [user, router]);

  const activeCategoryFeatures = categories?.CATEGORY_FEATURES || CATEGORY_FEATURES;
  const activePageComponents = templates?.PAGE_COMPONENTS || PAGE_COMPONENTS;

  // Load default features when category changes
  useEffect(() => {
    if (appCategory) {
      const defaults = activeCategoryFeatures[appCategory] || activeCategoryFeatures['Custom'] || [];
      setSelectedFeatures([...defaults]);
    }
  }, [appCategory, activeCategoryFeatures]);

  // Load default components when pageType changes
  useEffect(() => {
    if (pageType) {
      const defaults = activePageComponents[pageType] || [];
      setSelectedComponents([...defaults]);
    }
  }, [pageType, activePageComponents]);

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
    selectedTypography, setSelectedTypography,
    selectedModel, setSelectedModel,
    templateTitle, setTemplateTitle,
    autoSubmitPrompt, setAutoSubmitPrompt,
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
    projectName, setProjectName,
    projectDescription, setProjectDescription,
    frontendStack, setFrontendStack,
    backendStack, setBackendStack,
    database, setDatabase,
    authOption, setAuthOption,
    deployment, setDeployment,
    additionalFeatures, setAdditionalFeatures,
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
