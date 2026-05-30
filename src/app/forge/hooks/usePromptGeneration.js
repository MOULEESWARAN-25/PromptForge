import { useState } from 'react';
import { toast } from 'sonner';
import { track, EVENTS } from '@/lib/analytics';
import { compileForgePrompt, analyzePromptAmbiguity } from '../services/promptCompiler';

export function usePromptGeneration({
  savePromptRecord,
  apiKey,
  router,
  forgeState
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const runPromptAnalysis = (text) => {
    if (!text.trim()) return;

    // Smart Requirement Clarification Layer check using promptCompiler service
    const isVague = analyzePromptAmbiguity(text);
    
    if (isVague && !forgeState.clarificationActive && forgeState.clarifiedAudience === '') {
      forgeState.setClarificationActive(true);
      toast.info("Intent Clarification Triggered", { 
        description: "Your description specifies a feature but lacks key responsive or styling details. Let's clarify!" 
      });
      return;
    }
    
    forgeState.setEnhanceStep('analyzing');
    
    const stages = [
      "Deconstructing prompt semantic tokens...",
      "Matching intent against local design vocabularies...",
      "Evaluating visual shortcomings (contrast, elevation, physics)...",
      "Retrieving custom HSL tailwind configuration targets...",
      "Assembling AI optimization vectors..."
    ];
    
    let stageIdx = 0;
    forgeState.setAnalyzingText(stages[0]);
    
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        forgeState.setAnalyzingText(stages[stageIdx]);
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

        forgeState.setAnalysisReport({
          detectedIntent,
          confidence,
          recommendedTheme,
          shortcomings,
          solutions
        });
        
        forgeState.setSelectedTheme(recommendedTheme);
        forgeState.setEnhanceStep('analysis_result');
      }
    }, 450);
  };

  const handleForgeSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    setIsGenerating(true);
    const toastId = toast.loading('Retrieving visual terminology & compiling prompt...', {
      description: 'Stitching design tokens matching HSL profiles...'
    });

    try {
      const compilationResult = await compileForgePrompt({
        activeMode: forgeState.activeMode,
        appCategory: forgeState.appCategory,
        customCategory: forgeState.customCategory,
        selectedFeatures: forgeState.selectedFeatures,
        pageType: forgeState.pageType,
        selectedComponents: forgeState.selectedComponents,
        projectIntegration: forgeState.projectIntegration,
        framework: forgeState.framework,
        ideResponseContext: forgeState.ideResponseContext,
        componentType: forgeState.componentType,
        customComponentType: forgeState.customComponentType,
        rawDescription: forgeState.rawDescription,
        selectedQualities: forgeState.selectedQualities,
        selectedMotions: forgeState.selectedMotions,
        selectedTheme: forgeState.selectedTheme,
        clarificationActive: forgeState.clarificationActive,
        clarifiedAudience: forgeState.clarifiedAudience,
        clarifiedDensity: forgeState.clarifiedDensity,
        clarifiedViewport: forgeState.clarifiedViewport,
        apiKey
      });

      const savedRecord = await savePromptRecord({
        mode: forgeState.activeMode,
        title: compilationResult.title,
        query: compilationResult.query,
        theme: forgeState.selectedTheme || 'Sleek Dark Glassmorphic',
        resolvedPrompt: compilationResult.resolvedPrompt,
        ragDetails: compilationResult.ragDetails,
        category: forgeState.activeMode === 'application' ? (forgeState.appCategory === 'Custom' ? forgeState.customCategory : forgeState.appCategory) : null,
        pageType: forgeState.activeMode === 'page' ? forgeState.pageType : null,
        components: forgeState.activeMode === 'page' ? forgeState.selectedComponents : null,
        componentName: forgeState.activeMode === 'component' ? (forgeState.componentType === 'Custom Component' ? forgeState.customComponentType : forgeState.componentType) : null,
        chatMessages: [
          { role: 'user', content: `Forge my custom ${forgeState.activeMode} prompt blueprint!` },
          { role: 'model', content: compilationResult.resolvedPrompt }
        ]
      });
      
      // Cleanup draft from storage on compilation success
      localStorage.removeItem('promptforge_draft');
      localStorage.removeItem('promptforge_wmode');

      toast.success('Prompt successfully forged!', {
        id: toastId,
        description: 'Redirecting to your workspace panel.'
      });

      track(EVENTS.PROMPT_GENERATED, {
        mode: forgeState.activeMode,
        theme: forgeState.selectedTheme
      });

      router.push(`/chat?id=${savedRecord.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Synthesis failed. Please verify API configurations.', {
        id: toastId
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    runPromptAnalysis,
    handleForgeSubmit
  };
}
