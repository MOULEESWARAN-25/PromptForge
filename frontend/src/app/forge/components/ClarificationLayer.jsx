import React from 'react';
import { Sparkles } from 'lucide-react';

export function ClarificationLayer({
  clarifiedAudience,
  setClarifiedAudience,
  clarifiedDensity,
  setClarifiedDensity,
  clarifiedViewport,
  setClarifiedViewport,
  rawDescription,
  onProceed,
  onBack
}) {
  const stepHeader = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start'
  };

  const stepNum = {
    fontSize: '2rem',
    fontWeight: '900',
    color: 'var(--accent)',
    lineHeight: '1',
    opacity: '0.85',
    fontFamily: 'var(--font-mono)'
  };

  const stepTitle = {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--foreground)',
    letterSpacing: '-0.02em'
  };

  const stepDesc = {
    fontSize: '0.88rem',
    color: 'var(--muted-foreground)',
    marginTop: '0.35rem',
    lineHeight: '1.4'
  };

  const submitBtn = {
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
    borderRadius: '10px',
    fontWeight: '800',
    cursor: 'pointer',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  };

  const handleProceed = () => {
    onProceed(rawDescription + ` (Target Audience: ${clarifiedAudience || 'B2B/Developers'}, Layout Density: ${clarifiedDensity}, Viewport Layout: ${clarifiedViewport})`);
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={stepHeader}>
        <span style={stepNum}>??</span>
        <div>
          <h3 style={stepTitle}>Requirement Clarification Layer</h3>
          <p style={stepDesc}>Your prompt description is brief or vague. Let&apos;s align your high-level visual vision before invoking RAG compilation.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Q1: Target Audience */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '750', color: 'var(--foreground)' }}>Primary Target Audience</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['SaaS Developers / B2B', 'General Public / B2C', 'Internal Enterprise Admins'].map((aud) => {
              const isSel = clarifiedAudience === aud;
              return (
                <button
                  key={aud}
                  onClick={() => setClarifiedAudience(aud)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    textAlign: 'left',
                    background: isSel ? 'rgba(104, 67, 236, 0.12)' : 'transparent',
                    border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: isSel ? 'var(--accent)' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    fontWeight: isSel ? '700' : '500'
                  }}
                  className="active-scale-95"
                >
                  {aud}
                </button>
              );
            })}
          </div>
        </div>

        {/* Q2: Layout Density */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '750', color: 'var(--foreground)' }}>Layout Visual Density</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['Minimalist / Spacious', 'Balanced / Modern', 'Data-Heavy / Compact'].map((dens) => {
              const isSel = clarifiedDensity === dens;
              return (
                <button
                  key={dens}
                  onClick={() => setClarifiedDensity(dens)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    textAlign: 'left',
                    background: isSel ? 'rgba(104, 67, 236, 0.12)' : 'transparent',
                    border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: isSel ? 'var(--accent)' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    fontWeight: isSel ? '700' : '500'
                  }}
                  className="active-scale-95"
                >
                  {dens}
                </button>
              );
            })}
          </div>
        </div>

        {/* Q3: Viewport Layout */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '750', color: 'var(--foreground)' }}>Primary Viewport Scale</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['Mobile-First Fluid', 'Desktop Grid Focus', 'Universal Adaptive'].map((viewp) => {
              const isSel = clarifiedViewport === viewp;
              return (
                <button
                  key={viewp}
                  onClick={() => setClarifiedViewport(viewp)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    textAlign: 'left',
                    background: isSel ? 'rgba(104, 67, 236, 0.12)' : 'transparent',
                    border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: isSel ? 'var(--accent)' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    fontWeight: isSel ? '700' : '500'
                  }}
                  className="active-scale-95"
                >
                  {viewp}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-foreground)',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          ← Back to raw description
        </button>
        <button
          onClick={handleProceed}
          style={{ ...submitBtn, background: 'var(--accent)', color: 'var(--accent-foreground)' }}
          disabled={!clarifiedAudience || !clarifiedDensity || !clarifiedViewport}
          className="btn-accent shine-effect active-scale-95"
        >
          <Sparkles size={16} />
          Proceed with Clarified Intent
        </button>
      </div>
    </div>
  );
}

