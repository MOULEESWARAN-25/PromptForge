import React from 'react';
import { CheckCircle2, Sliders, Sparkles, Info, Code2 } from 'lucide-react';
import { COMPONENT_TYPES } from '../constants/components';
import { ThemeSelector } from './ThemeSelector';
import { SyncBranchSelector } from './SyncBranchSelector';

export function ComponentWizard({
  forgeState,
  promptGeneration,
  apiKey
}) {
  const {
    componentType,
    setComponentType,
    customComponentType,
    setCustomComponentType,
    selectedTheme,
    setSelectedTheme,
    projectIntegration,
    setProjectIntegration,
    framework,
    setFramework,
    ideSyncPromptCopied,
    setIdeSyncPromptCopied,
    ideResponseContext,
    setIdeResponseContext
  } = forgeState;

  const { isGenerating, handleForgeSubmit } = promptGeneration;

  // Visual layout styles
  const flowContainer = { display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' };
  const stepSection = {
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.01)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
  };
  const stepHeader = { display: 'flex', gap: '1rem', alignItems: 'flex-start' };
  const stepNum = { fontSize: '2rem', fontWeight: '900', color: 'var(--accent)', lineHeight: '1', fontFamily: 'var(--font-mono)' };
  const stepTitle = { fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em' };
  const stepDesc = { fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.4' };
  
  const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' };
  const categoryCard = (isSelected) => ({
    position: 'relative',
    height: '140px',
    borderRadius: '16px',
    border: isSelected ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.06)',
    background: isSelected ? 'rgba(124, 58, 237, 0.05)' : 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    boxShadow: isSelected ? '0 0 20px rgba(124, 58, 237, 0.2)' : 'none'
  });

  const cardImg = { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, opacity: 0.25, transition: 'opacity 0.3s ease' };
  const cardImagePlaceholder = { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' };
  const cardOverlay = { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', zIndex: 1 };
  const cardCheckedBadge = { position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 3 };
  const cardTextWrap = { padding: '1rem', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '2px' };
  const cardTitle = { fontSize: '0.92rem', fontWeight: '800', color: '#ffffff' };
  const cardDesc = { fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', lineHeight: '1.3' };

  const formLabel = { fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.5rem' };
  const inputStyle = { width: '100%', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.65rem 0.75rem', fontSize: '0.9rem', color: 'var(--foreground)', outline: 'none' };
  const inputBoxContainer = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };

  const submitContainer = { display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem', marginTop: '1rem' };
  const submitBtn = { width: '100%', padding: '0.75rem', fontSize: '0.95rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' };
  const offlineWarning = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-foreground)', justifyContent: 'center' };

  return (
    <div style={flowContainer}>
      {/* Step 1: Component Selection */}
      <div style={stepSection}>
        <div style={stepHeader}>
          <span style={stepNum}>01</span>
          <div>
            <h3 style={stepTitle}>Select Component Type</h3>
            <p style={stepDesc}>What kind of targeted control are you building?</p>
          </div>
        </div>

        <div style={categoryGrid}>
          {COMPONENT_TYPES.map((comp) => {
            const isSelected = componentType === comp.id;
            return (
              <div 
                key={comp.id} 
                style={categoryCard(isSelected)}
                onClick={() => setComponentType(comp.id)}
                className="bento-card-premium glow-card-spotlight active-scale-95 animate-fade-up"
              >
                {comp.image && (
                  <img src={comp.image} alt={comp.label} style={cardImg} />
                )}
                {!comp.image && (
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
                  <span style={cardTitle}>{comp.label}</span>
                  <span style={cardDesc}>{comp.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {componentType === 'Custom Component' && (
          <div style={{ ...inputBoxContainer, marginTop: '1.25rem' }} className="animate-fade-up">
            <label style={formLabel}>Describe Custom Component Details</label>
            <input
               type="text"
               placeholder="e.g. Floating Circular Action Button with Spring Radial menu"
               value={customComponentType}
               onChange={(e) => setCustomComponentType(e.target.value)}
               style={inputStyle}
               className="glass-input"
            />
          </div>
        )}
      </div>

      {/* Step 2: Theme Selection */}
      {componentType && (
        <div style={stepSection} className="animate-fade-up">
          <div style={stepHeader}>
            <span style={stepNum}>02</span>
            <div>
              <h3 style={stepTitle}>Choose UI Theme Style</h3>
              <p style={stepDesc}>Define the overall aesthetic and style tokens.</p>
            </div>
          </div>

          <ThemeSelector
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            activeMode="component"
            componentType={componentType}
            customComponentType={customComponentType}
          />
        </div>
      )}

      {/* Step 3: Sync Branching */}
      {componentType && selectedTheme && (
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
      )}

      {/* Step 4: Submission */}
      {componentType && selectedTheme && projectIntegration && (
        <div style={submitContainer} className="animate-fade-up">
          <div style={offlineWarning}>
            <Info size={16} />
            <span>
              {apiKey ? "Live Gemini Compiler active." : "Offline Prompt Compiler compilation active."}
            </span>
          </div>
          <button
            onClick={handleForgeSubmit}
            style={{ ...submitBtn, background: 'var(--accent)', color: 'var(--accent-foreground)' }}
            className="btn-accent shine-effect"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Sliders size={18} className="animate-spin" />
                Forging Reusable Component...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Component Prompt
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
