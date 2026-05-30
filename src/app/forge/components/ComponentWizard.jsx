'use client';
import React from 'react';
import { CheckCircle2, Sliders, Sparkles, Info, Code2 } from 'lucide-react';
import { COMPONENT_TYPES } from '../constants/components';
import { ThemeSelector } from './ThemeSelector';
import { TypographyPicker } from './TypographyPicker';
import { SyncBranchSelector } from './SyncBranchSelector';
import { ThemePreview } from './ThemePreview';

export function ComponentWizard({ forgeState, promptGeneration, apiKey, isAdvanced = false }) {
  const {
    componentType, setComponentType,
    customComponentType, setCustomComponentType,
    selectedTheme, setSelectedTheme,
    selectedTypography, setSelectedTypography,
    projectIntegration, setProjectIntegration,
    framework, setFramework,
    ideSyncPromptCopied, setIdeSyncPromptCopied,
    ideResponseContext, setIdeResponseContext,
  } = forgeState;

  const { isGenerating, handleForgeSubmit } = promptGeneration;

  const isReady = !!componentType && !!selectedTheme && !!projectIntegration;

  // ─── Shared styles ─────────────────────────────────────────────
  const panelBase = {
    background: 'rgba(255,255,255,0.01)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  };

  const sectionHead = (color = 'var(--accent)') => ({
    fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: '0.06em', color, marginBottom: '0.85rem',
  });

  const compCard = (isSelected) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 0.9rem', borderRadius: '10px', cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: isSelected ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.04)',
    background: isSelected ? 'rgba(236,72,153,0.06)' : 'rgba(255,255,255,0.01)',
    boxShadow: isSelected ? '0 0 12px rgba(236,72,153,0.15)' : 'none',
  });

  return (
    <div className="component-wizard-grid" style={{
      display: 'grid',
      gridTemplateColumns: '280px minmax(0, 1fr) 320px',
      gap: '1.25rem',
      width: '100%',
      alignItems: 'start',
    }}>

      {/* ── LEFT PANEL: Component Catalog (sticky) ── */}
      <div className="component-wizard-left" style={{ position: 'sticky', top: '5rem' }}>
        <div style={{ ...panelBase, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={sectionHead('#ec4899')}>Component Catalog</div>

          {COMPONENT_TYPES.map((comp) => {
            const isSelected = componentType === comp.id;
            return (
              <div
                key={comp.id}
                style={compCard(isSelected)}
                onClick={() => setComponentType(comp.id)}
                className="active-scale-95"
              >
                {isSelected
                  ? <CheckCircle2 size={14} style={{ color: '#ec4899', flexShrink: 0 }} />
                  : <Code2 size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#fff' : 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {comp.label}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', lineHeight: '1.3', marginTop: '1px' }}>
                    {comp.desc.slice(0, 48)}{comp.desc.length > 48 ? '…' : ''}
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

      {/* ── CENTER PANEL: Live Preview ── */}
      <div style={{ ...panelBase, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={sectionHead('var(--accent)')}>Live Preview</div>

        {componentType ? (
          <>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              {componentType === 'Custom Component'
                ? (customComponentType || 'Custom Component')
                : COMPONENT_TYPES.find(c => c.id === componentType)?.label || componentType}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', lineHeight: '1.5', margin: 0 }}>
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
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.82rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.06)' }}>
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

      {/* ── RIGHT PANEL: Customizer (sticky) ── */}
      <div className="component-wizard-right" style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Theme selector */}
        <div style={{ ...panelBase, padding: '1.25rem' }}>
          <div style={sectionHead('var(--accent)')}>Theme</div>
          <ThemeSelector
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            activeMode="component"
            componentType={componentType}
            customComponentType={customComponentType}
            selectedTypography={selectedTypography}
          />
        </div>

        {/* Typography picker — Advanced only */}
        {isAdvanced && (
          <div style={{ ...panelBase, padding: '1.25rem' }}>
            <div style={sectionHead('#c084fc')}>Typography</div>
            <TypographyPicker
              selectedTypography={selectedTypography}
              setSelectedTypography={setSelectedTypography}
            />
          </div>
        )}

        {/* Sync branch — Advanced only */}
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
            />
          </div>
        )}

        {/* Beginner mode: collapsed accordion for advanced options */}
        {!isAdvanced && (
          <div style={{ ...panelBase, padding: '0.75rem 1.1rem', fontSize: '0.72rem', color: 'var(--muted-foreground)', textAlign: 'center', cursor: 'default' }}>
            Switch to <strong style={{ color: 'var(--accent)' }}>Advanced Mode</strong> above to unlock typography and project setup options.
          </div>
        )}

        {/* Generate — sticky at bottom */}
        <div style={{ position: 'sticky', bottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(8,8,12,0.85)', backdropFilter: 'blur(12px)', borderRadius: '14px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--muted-foreground)', justifyContent: 'center' }}>
            <Info size={12} />
            {apiKey ? 'Live Gemini Compiler active.' : 'Offline Compiler active.'}
          </div>
          <button
            onClick={handleForgeSubmit}
            className="btn-accent shine-effect"
            disabled={isGenerating || !isReady}
            title={!isReady ? 'Select a component, theme, and project setup first' : ''}
            style={{
              width: '100%', padding: '0.95rem',
              fontSize: '0.9rem', borderRadius: '12px', fontWeight: '800',
              cursor: isReady && !isGenerating ? 'pointer' : 'not-allowed',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: isReady ? '#ec4899' : 'rgba(255,255,255,0.05)',
              color: isReady ? '#fff' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.2s ease',
              opacity: isGenerating ? 0.7 : 1,
              boxShadow: isReady ? '0 0 0 1px rgba(236,72,153,0.3), 0 8px 24px rgba(236,72,153,0.2)' : 'none',
            }}
          >
            {isGenerating
              ? <><Sliders size={16} className="animate-spin" />Forging Component...</>
              : <><Sparkles size={16} />Generate Component Prompt</>
            }
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .component-wizard-grid {
            grid-template-columns: 1fr !important;
          }
          .component-wizard-left {
            position: static !important;
          }
          .component-wizard-right {
            position: static !important;
          }
          .component-wizard-right > div:last-child {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
