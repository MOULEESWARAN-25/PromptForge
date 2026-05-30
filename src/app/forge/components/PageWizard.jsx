import React from 'react';
import { CheckCircle2, Plus, Sliders, Sparkles, Info } from 'lucide-react';
import { PAGE_TYPES, PAGE_COMPONENTS } from '../constants/pageTemplates';
import { ThemeSelector } from './ThemeSelector';
import { SyncBranchSelector } from './SyncBranchSelector';

export function PageWizard({
  forgeState,
  promptGeneration,
  apiKey
}) {
  const {
    pageType,
    setPageType,
    selectedTheme,
    setSelectedTheme,
    selectedComponents,
    customComponentInput,
    setCustomComponentInput,
    projectIntegration,
    setProjectIntegration,
    framework,
    setFramework,
    ideSyncPromptCopied,
    setIdeSyncPromptCopied,
    ideResponseContext,
    setIdeResponseContext,
    handleComponentToggle,
    handleAddCustomComponent
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
  const cardOverlay = { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', zIndex: 1 };
  const cardCheckedBadge = { position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 3 };
  const cardTextWrap = { padding: '1rem', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '2px' };
  const cardTitle = { fontSize: '0.92rem', fontWeight: '800', color: '#ffffff' };
  const cardDesc = { fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', lineHeight: '1.3' };

  const checkboxGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' };
  const checkboxCard = (isChecked) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: isChecked ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.04)',
    background: isChecked ? 'rgba(124, 58, 237, 0.05)' : 'rgba(255,255,255,0.01)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });
  const checkboxText = { fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: '500' };

  const adderFormStyle = { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' };
  const adderInputStyle = { flex: 1, background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--foreground)', outline: 'none' };
  const adderBtnStyle = { display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' };

  const submitContainer = { display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem', marginTop: '1rem' };
  const submitBtn = { width: '100%', padding: '0.75rem', fontSize: '0.95rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' };
  const offlineWarning = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-foreground)', justifyContent: 'center' };

  return (
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
                className="bento-card-premium glow-card-spotlight active-scale-95 animate-fade-up"
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
                  className="active-scale-95 animate-fade-up"
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
              placeholder="Add custom component (e.g. Audio Visualizer Card)..."
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

          <ThemeSelector
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            activeMode="page"
            pageType={pageType}
          />
        </div>
      )}

      {/* Step 4: Sync Branching */}
      {pageType && selectedTheme && selectedComponents.length > 0 && (
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
        />
      )}

      {/* Step 5: Submission */}
      {pageType && selectedTheme && selectedComponents.length > 0 && projectIntegration && (
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
                Forging Webpage Blueprint...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Page Prompt
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
