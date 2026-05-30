import React from 'react';
import { CheckCircle2, Plus, Sliders, Sparkles, Info, Code2 } from 'lucide-react';
import { APP_CATEGORIES, CATEGORY_FEATURES } from '../constants/appCategories';
import { ThemeSelector } from './ThemeSelector';

export function ApplicationWizard({
  forgeState,
  promptGeneration,
  apiKey
}) {
  const {
    appCategory,
    customCategory,
    setCustomCategory,
    selectedTheme,
    setSelectedTheme,
    selectedFeatures,
    customFeatureInput,
    setCustomFeatureInput,
    handleCategorySelect,
    handleFeatureToggle,
    handleAddCustomFeature
  } = forgeState;

  const { isGenerating, handleForgeSubmit } = promptGeneration;

  // Visual layout styles matching original page styles
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
      {/* Step 1: Application Category */}
      <div style={stepSection}>
        <div style={stepHeader}>
          <span style={stepNum}>01</span>
          <div>
            <h3 style={stepTitle}>Select Application Category</h3>
            <p style={stepDesc}>What kind of digital product architecture are you forging?</p>
          </div>
        </div>

        <div style={categoryGrid}>
          {APP_CATEGORIES.map((cat) => {
            const isSelected = appCategory === cat.id;
            return (
              <div 
                key={cat.id} 
                style={categoryCard(isSelected)}
                onClick={() => handleCategorySelect(cat.id)}
                className="bento-card-premium glow-card-spotlight active-scale-95 animate-fade-up"
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
          <div style={{ ...inputBoxContainer, marginTop: '1.25rem' }} className="animate-fade-up">
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

          <ThemeSelector
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            activeMode="application"
            appCategory={appCategory}
            customCategory={customCategory}
          />
        </div>
      )}

      {/* Step 3: Features Checklist */}
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
                  className="active-scale-95 animate-fade-up"
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

          <form onSubmit={handleAddCustomFeature} style={adderFormStyle}>
            <input
              type="text"
              placeholder="Add custom feature (e.g. Live chat widget)..."
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
            style={{ ...submitBtn, background: 'var(--accent)', color: 'var(--accent-foreground)' }}
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
  );
}
