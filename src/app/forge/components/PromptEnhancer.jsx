import React from 'react';
import { Sparkles, Wand2, RotateCcw, Sliders, Info, ChevronRight } from 'lucide-react';
import ShadcnDropdown from '@/components/ShadcnDropdown';
import { themeStyles } from '@/data/designVocabulary';
import { ClarificationLayer } from './ClarificationLayer';

export function PromptEnhancer({
  forgeState,
  promptGeneration,
  apiKey
}) {
  const {
    rawDescription,
    setRawDescription,
    selectedTheme,
    setSelectedTheme,
    selectedQualities,
    selectedMotions,
    enhanceStep,
    setEnhanceStep,
    analyzingText,
    analysisReport,
    clarificationActive,
    setClarificationActive,
    clarifiedAudience,
    setClarifiedAudience,
    clarifiedDensity,
    setClarifiedDensity,
    clarifiedViewport,
    setClarifiedViewport,
    handleQualityToggle,
    handleMotionToggle,
    selectedModel,
    setSelectedModel
  } = forgeState;

  const { isGenerating, runPromptAnalysis, handleForgeSubmit } = promptGeneration;

  // Visual layout styles
  const flowContainer = { display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' };
  const stepSection = {
    padding: '2rem',
    background: 'var(--card)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    boxShadow: 'var(--shadow-sm)'
  };
  const stepHeader = { display: 'flex', gap: '1rem', alignItems: 'flex-start' };
  const stepNum = { fontSize: '2rem', fontWeight: '900', color: 'var(--accent)', lineHeight: '1', fontFamily: 'var(--font-mono)' };
  const stepTitle = { fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em' };
  const stepDesc = { fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.4' };
  
  const textareaStyle = {
    width: '100%',
    minHeight: '120px',
    background: 'var(--input)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1rem',
    fontSize: '0.9rem',
    color: 'var(--foreground)',
    outline: 'none',
    lineHeight: '1.6',
    resize: 'vertical'
  };

  const submitBtn = { padding: '0.65rem 1.25rem', fontSize: '0.85rem', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' };
  const submitContainer = { display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem', marginTop: '1rem' };
  const offlineWarning = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--muted-foreground)', justifyContent: 'center' };
  const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
  const badgeSelectorGrid = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' };
  
  const badgeSelectorBtn = (isSelected) => ({
    padding: '5px 12px',
    fontSize: '0.75rem',
    borderRadius: '20px',
    cursor: 'pointer',
    background: isSelected ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
    color: isSelected ? 'var(--accent)' : 'var(--muted-foreground)',
    fontWeight: isSelected ? '700' : '500',
    transition: 'all 0.2s ease'
  });

  const handleProceedClarified = () => {
    setClarificationActive(false);
    runPromptAnalysis(rawDescription + ` (Target Audience: ${clarifiedAudience || 'B2B/Developers'}, Layout Density: ${clarifiedDensity}, Viewport Layout: ${clarifiedViewport})`);
  };

  return (
    <div style={flowContainer}>
      {/* Stage 1: Raw Prompt Input */}
      {enhanceStep === 'input' && (
        <div style={stepSection} className="animate-fade-up">
          {!clarificationActive ? (
            <>
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
            </>
          ) : (
            <ClarificationLayer
              clarifiedAudience={clarifiedAudience}
              setClarifiedAudience={setClarifiedAudience}
              clarifiedDensity={clarifiedDensity}
              setClarifiedDensity={setClarifiedDensity}
              clarifiedViewport={clarifiedViewport}
              setClarifiedViewport={setClarifiedViewport}
              rawDescription={rawDescription}
              onProceed={runPromptAnalysis}
              onBack={() => setClarificationActive(false)}
            />
          )}
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
                border: '2.5px solid var(--border)',
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
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'color-mix(in srgb, var(--success) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wand2 size={20} style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-Detected Intent</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--foreground)', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                  {analysisReport.detectedIntent}
                </h4>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                Match Confidence: {analysisReport.confidence}
              </span>
              <button 
                onClick={() => setEnhanceStep('input')}
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer' }}
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
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                <Info size={14} style={{ color: 'var(--accent)' }} />
                Suggested Style & Layout Refinements
              </h4>

              {/* Deficiencies */}
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--destructive)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>Identified Design Gaps</span>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {analysisReport.shortcomings.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', paddingLeft: '1rem', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: '6px', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--destructive)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enhancements */}
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>Recommended Enhancements</span>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {analysisReport.solutions.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--foreground)', paddingLeft: '1rem', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: '6px', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)' }} />
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
                />
                {selectedTheme && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                    Style Keywords: <span style={{ color: 'var(--accent)' }}>{themeStyles[selectedTheme].keywords}</span>
                  </p>
                )}
              </div>
              
              {/* LLM Engine Selection */}
              <div style={{ ...stepSection, padding: '1.25rem' }} className="glass-panel animate-fade-in">
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                  AI Generator Engine
                </h4>
                <ShadcnDropdown
                  value={selectedModel || 'gemini'}
                  onChange={(val) => {
                    setSelectedModel(val);
                    toast?.success ? toast.success(`Switched model to ${val === 'groq' ? 'Groq Llama 3.3' : 'Gemini 3.1 Pro'}`) : console.log("Switched model");
                  }}
                  options={[
                    { label: 'Gemini 3.1 Pro (Flagship)', value: 'gemini' },
                    { label: 'Groq Llama 3.3 70B (High Precision)', value: 'groq' }
                  ]}
                  triggerWidth="100%"
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  {selectedModel === 'groq'
                    ? "⚡ Running ultra-fast, high-precision Llama 3.3 70B prompt synthesis."
                    : "✨ Running flagship, multi-modal Gemini 3.1 Pro synthesis."}
                </p>
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
  );
}
