'use client';
import React, { useState } from 'react';
import { CheckCircle2, Sliders, Sparkles, Info, Code2, Search } from 'lucide-react';
import { COMPONENT_TYPES } from '../constants/components';
import ShadcnDropdown from '@/components/ShadcnDropdown';
import { ThemeSelector } from './ThemeSelector';
import { TypographyPicker } from './TypographyPicker';
import { SyncBranchSelector } from './SyncBranchSelector';
import { ThemePreview } from './ThemePreview';

export function ComponentWizard({ forgeState, promptGeneration, apiKey, isAdvanced = false }) {
  const [componentSearch, setComponentSearch] = useState('');
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

  const isReady = !!componentType && !!selectedTheme && !!projectIntegration;

  // ─── Shared styles ─────────────────────────────────────────────
  const panelBase = {
    background: 'var(--card)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  };

  const sectionHead = (color = 'var(--accent)') => ({
    fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: '0.06em', color, marginBottom: '0.85rem',
  });

  const compCard = (isSelected) => ({
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: isSelected ? 'rgba(104,67,236,0.08)' : 'transparent',
    boxShadow: isSelected ? '0 0 12px rgba(104,67,236,0.15)' : 'none',
  });

  const scrollableCol = {
    maxHeight: 'calc(100vh - 12rem)',
    overflowY: 'auto',
    position: 'sticky',
    top: '5rem',
    paddingRight: '6px'
  };

  return (
    <div className="component-wizard-grid" style={{
      display: 'grid',
      gridTemplateColumns: '220px minmax(0, 1fr) 260px 220px',
      gap: '1rem',
      width: '100%',
      alignItems: 'start',
    }}>

      {/* ── COLUMN 1: Component Catalog (220px) ── */}
      <div className="component-wizard-left" style={{ ...scrollableCol, width: '220px' }}>
        <div style={{ ...panelBase, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={sectionHead('var(--accent)')}>Component Catalog</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 8px', marginBottom: '6px' }}>
            <Search size={12} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search components..."
              value={componentSearch}
              onChange={(e) => setComponentSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.7rem', color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)' }}
            />
          </div>

          {COMPONENT_TYPES.filter(comp => 
            comp.label.toLowerCase().includes(componentSearch.toLowerCase()) || 
            comp.desc.toLowerCase().includes(componentSearch.toLowerCase())
          ).map((comp) => {
            const isSelected = componentType === comp.id;
            return (
              <div
                key={comp.id}
                style={compCard(isSelected)}
                onClick={() => setComponentType(comp.id)}
                className="active-scale-95"
              >
                {isSelected
                  ? <CheckCircle2 size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  : <Code2 size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {comp.label}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', lineHeight: '1.25', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {comp.desc}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom component input */}
          {componentType === 'Custom Component' && (
            <div style={{ marginTop: '0.5rem' }} className="animate-fade-up">
              <input
                type="text"
                placeholder="Describe your component…"
                value={customComponentType}
                onChange={(e) => setCustomComponentType(e.target.value)}
                style={{ width: '100%', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.65rem', fontSize: '0.8rem', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' }}
                className="glass-input"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── COLUMN 2: Live Preview & Action Area (1fr) ── */}
      <div className="component-wizard-center" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
        <div style={{ ...panelBase, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={sectionHead('var(--accent)')}>Live Preview</div>

          {componentType ? (
            <>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                {componentType === 'Custom Component'
                  ? (customComponentType || 'Custom Component')
                  : COMPONENT_TYPES.find(c => c.id === componentType)?.label || componentType}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', lineHeight: '1.4', margin: 0 }}>
                {COMPONENT_TYPES.find(c => c.id === componentType)?.desc || 'A custom interactive front-end control.'}
              </p>

              {selectedTheme && (
                <ThemePreview
                  selectedTheme={selectedTheme}
                  activeMode="component"
                  componentType={componentType}
                  customComponentType={customComponentType}
                  selectedTypography={selectedTypography}
                />
              )}

              {!selectedTheme && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.82rem', background: 'var(--card)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  Select a theme from the right panel to see the live preview.
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
              <Code2 size={32} style={{ opacity: 0.15, margin: '0 auto 0.75rem' }} />
              <p style={{ margin: 0 }}>Select a component from the catalog to begin.</p>
            </div>
          )}
        </div>

        {/* Sync branch Integration (Advanced only) - placed cleanly under preview */}
        {isAdvanced && (
          <div style={{ ...panelBase, padding: '1.25rem' }}>
            <div style={sectionHead('#34d399')}>Project Setup</div>
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
              isStepWizard={false}
            />
          </div>
        )}

        {/* Generate Trigger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'var(--card)', backdropFilter: 'blur(12px)', borderRadius: '14px', padding: '0.75rem', border: '1px solid var(--border)' }}>
          {/* AI Generator Engine Selector */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--foreground)' }}>
              <Sparkles size={11} style={{ color: 'var(--accent)' }} />
              AI Generator Engine
            </div>
            <ShadcnDropdown
              value={selectedModel || 'gemini'}
              onChange={(val) => setSelectedModel(val)}
              options={[
                { label: 'Gemini 3.1 Pro', value: 'gemini' },
                { label: 'Groq Llama 3.3', value: 'groq' }
              ]}
              triggerWidth="100%"
              style={{
                fontSize: '0.72rem',
                padding: '4px 8px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--muted-foreground)', justifyContent: 'center' }}>
            <Info size={12} />
            {apiKey ? 'Live Compiler active.' : 'Offline Compiler active.'}
          </div>
          <button
            onClick={handleForgeSubmit}
            className="btn-accent shine-effect"
            disabled={isGenerating || !isReady}
            title={!isReady ? 'Select a component, theme, and project setup first' : ''}
            style={{
              width: '100%', padding: '0.85rem',
              fontSize: '0.9rem', borderRadius: '10px', fontWeight: '800',
              cursor: isReady && !isGenerating ? 'pointer' : 'not-allowed',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: isReady ? 'var(--accent)' : 'var(--muted)',
              color: isReady ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
              transition: 'all 0.2s ease',
              opacity: isGenerating ? 0.7 : 1,
              boxShadow: isReady ? '0 0 0 1px rgba(104,67,236,0.3), 0 8px 24px rgba(104,67,236,0.2)' : 'none',
            }}
          >
            {isGenerating
              ? <><Sliders size={16} className="animate-spin" />Forging Component...</>
              : <><Sparkles size={16} />Generate Component Prompt</>
            }
          </button>
        </div>
      </div>

      {/* ── COLUMN 3: Theme Selector (260px) ── */}
      <div className="component-wizard-themes" style={{ ...scrollableCol, width: '260px' }}>
        <div style={{ ...panelBase, padding: '1rem' }}>
          <div style={sectionHead('var(--accent)')}>Theme</div>
          <ThemeSelector
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            activeMode="component"
            componentType={componentType}
            customComponentType={customComponentType}
            selectedTypography={selectedTypography}
            compact={true}
          />
        </div>
      </div>

      {/* ── COLUMN 4: Typography System (220px) ── */}
      <div className="component-wizard-typography" style={{ ...scrollableCol, width: '220px' }}>
        <div style={{ ...panelBase, padding: '1rem' }}>
          <div style={sectionHead('#c084fc')}>Typography</div>
          <TypographyPicker
            selectedTypography={selectedTypography}
            setSelectedTypography={setSelectedTypography}
            compact={true}
          />
        </div>
      </div>

      <style>{`
        .component-wizard-grid::-webkit-scrollbar,
        .component-wizard-left::-webkit-scrollbar,
        .component-wizard-themes::-webkit-scrollbar,
        .component-wizard-typography::-webkit-scrollbar {
          width: 4px;
        }
        .component-wizard-left::-webkit-scrollbar-thumb,
        .component-wizard-themes::-webkit-scrollbar-thumb,
        .component-wizard-typography::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        @media (max-width: 1200px) {
          .component-wizard-grid {
            grid-template-columns: 1fr !important;
          }
          .component-wizard-left, 
          .component-wizard-center,
          .component-wizard-themes, 
          .component-wizard-typography {
            position: static !important;
            max-height: none !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
