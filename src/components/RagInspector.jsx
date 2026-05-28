"use client";

import React, { useState } from 'react';
import { Database, TrendingUp, Layers, Cpu, Code, Info } from 'lucide-react';

export default function RagInspector({ ragDetails }) {
  const [activeTab, setActiveTab] = useState('scores'); // "scores" | "augmentation" | "tokens"

  if (!ragDetails) {
    return (
      <div style={emptyStateStyle}>
        <Info size={16} />
        <span>No semantic retrieval details loaded yet. Complete a prompt forge session to inspect!</span>
      </div>
    );
  }

  const { anchor, results = [], latencyMs = 0 } = ragDetails;

  return (
    <div style={containerStyle} className="glass-panel">
      {/* Inspector Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <Database size={16} style={{ color: 'hsl(var(--secondary))' }} />
          <span>Local RAG pipeline Visualizer</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {ragDetails.source && (
            <div style={sourceBadge}>
              {ragDetails.source}
            </div>
          )}
          <div style={latencyBadge}>
            Retrieved in {latencyMs}ms
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabsRow}>
        <button
          style={{ ...tabBtn, ...(activeTab === 'scores' ? tabBtnActive : {}) }}
          onClick={() => setActiveTab('scores')}
        >
          <TrendingUp size={14} />
          Similarity Match
        </button>
        <button
          style={{ ...tabBtn, ...(activeTab === 'augmentation' ? tabBtnActive : {}) }}
          onClick={() => setActiveTab('augmentation')}
        >
          <Layers size={14} />
          System Prompt
        </button>
        <button
          style={{ ...tabBtn, ...(activeTab === 'tokens' ? tabBtnActive : {}) }}
          onClick={() => setActiveTab('tokens')}
        >
          <Code size={14} />
          Search Anchor
        </button>
      </div>

      {/* Tab Content Panels */}
      <div style={panelBody}>
        {activeTab === 'scores' && (
          <div style={scoresPanel}>
            <p style={labelStyle}>Vector Distance Match (Cosine Similarity Scores)</p>
            {results.length === 0 ? (
              <p style={noMatchesText}>Zero similarity matching terms found above retrieval threshold.</p>
            ) : (
              <div style={chartList}>
                {results.map((res, idx) => {
                  const percentage = Math.round(res.score * 100);
                  // Choose dynamic colors based on similarity scores
                  const barColor = res.score > 0.6 
                    ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))' 
                    : 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.25))';
                  
                  return (
                    <div key={idx} style={chartRow}>
                      <div style={chartLabels}>
                        <span style={termName}>{res.name}</span>
                        <span style={termCategory}>{res.category}</span>
                        <span style={termScore}>{res.score}</span>
                      </div>
                      
                      <div style={chartBarBg}>
                        <div style={{ ...chartBarFill, width: `${percentage}%`, background: barColor }} />
                      </div>
                      
                      <p style={termDesc}>{res.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'augmentation' && (
          <div style={codePanel}>
            <p style={labelStyle}>Retrieved Context Augmentation Payload</p>
            <p style={subLabelStyle}>
              This context chunk is mathematically combined with your raw query inside the system prompt:
            </p>
            <pre style={codeBlock}>
{`[INJECTED KNOWLEDGE BASE DATA]
${results.map(res => `* Term: "${res.name}" (${res.category})
  Definition: ${res.description}`).join('\n\n')}
`}
            </pre>
            <div style={ragConceptCard}>
              <Cpu size={14} style={{ color: 'hsl(var(--primary))' }} />
              <span style={ragConceptText}>
                <strong>How it works:</strong> Rather than hardcoding everything or relying on generic LLM weights, the local Vector DB fetches precise terminologies relevant to your search anchor and augments the context window dynamically!
              </span>
            </div>
          </div>
        )}

        {activeTab === 'tokens' && (
          <div style={tokensPanel}>
            <p style={labelStyle}>RAG Search Vector Anchor</p>
            <p style={subLabelStyle}>The system builds this multi-parameter query vector to search the Design Database:</p>
            <div style={anchorBox}>
              "{anchor}"
            </div>
            
            <p style={{ ...labelStyle, marginTop: '1rem' }}>Extracted Clean Tokens (Stop Words Filtered)</p>
            <div style={tokensList}>
              {anchor.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(t => t.length > 2).map((token, idx) => (
                <span key={idx} style={tokenBadge}>
                  {token}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Premium inline styles drawing from SaaS theme design tokens
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxHeight: '400px',
  overflow: 'hidden',
  background: 'rgba(17, 24, 39, 0.45)',
  backdropFilter: 'blur(16px)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.85rem 1rem',
  borderBottom: '1px solid var(--border)',
};

const titleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display), sans-serif',
};

const latencyBadge = {
  fontSize: '0.75rem',
  color: 'var(--secondary)',
  backgroundColor: 'rgba(99, 102, 241, 0.08)',
  border: '1px solid var(--border)',
  borderRadius: '99px',
  padding: '2px 8px',
  fontWeight: '500',
};

const sourceBadge = {
  fontSize: '0.7rem',
  color: 'var(--primary)',
  backgroundColor: 'rgba(99, 102, 241, 0.08)',
  border: '1px solid var(--border)',
  borderRadius: '99px',
  padding: '2px 8px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tabsRow = {
  display: 'flex',
  borderBottom: '1px solid var(--border)',
  backgroundColor: 'rgba(0, 0, 0, 0.15)',
};

const tabBtn = {
  flex: 1,
  padding: '0.6rem 0',
  background: 'transparent',
  border: 'none',
  color: 'var(--muted-foreground)',
  fontSize: '0.75rem',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.35rem',
  transition: 'all 0.2s',
  borderBottom: '2px solid transparent',
};

const tabBtnActive = {
  color: 'var(--foreground)',
  borderBottom: '2px solid var(--primary)',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
};

const panelBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem',
};

const scoresPanel = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans), sans-serif',
};

const subLabelStyle = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  marginBottom: '0.5rem',
  lineHeight: '1.4',
};

const noMatchesText = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  textAlign: 'center',
  padding: '2rem 0',
};

const chartList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
  marginTop: '0.5rem',
};

const chartRow = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
};

const chartLabels = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.5rem',
};

const termName = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--foreground)',
};

const termCategory = {
  fontSize: '0.7rem',
  color: 'var(--muted-foreground)',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  padding: '1px 5px',
  borderRadius: '3px',
};

const termScore = {
  marginLeft: 'auto',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--primary)',
  fontFamily: 'monospace',
};

const chartBarBg = {
  width: '100%',
  height: '6px',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  borderRadius: '99px',
  overflow: 'hidden',
};

const chartBarFill = {
  height: '100%',
  borderRadius: '99px',
  transition: 'width 0.8s ease-out',
};

const termDesc = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.35',
  paddingLeft: '2px',
};

const codePanel = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const codeBlock = {
  backgroundColor: 'var(--background)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.75rem',
  color: 'var(--primary)',
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  overflowX: 'auto',
  lineHeight: '1.45',
  maxHeight: '150px',
};

const ragConceptCard = {
  display: 'flex',
  gap: '0.5rem',
  background: 'rgba(99, 102, 241, 0.03)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.75rem',
  marginTop: '0.5rem',
};

const ragConceptText = {
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.4',
};

const tokensPanel = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const anchorBox = {
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid var(--border)',
  padding: '0.75rem',
  borderRadius: '6px',
  fontSize: '0.78rem',
  fontStyle: 'italic',
  color: 'var(--muted-foreground)',
  lineHeight: '1.4',
};

const tokensList = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem',
  marginTop: '0.25rem',
};

const tokenBadge = {
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '0.7rem',
  color: 'var(--foreground)',
  fontFamily: 'monospace',
};

const emptyStateStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '2rem 1rem',
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.01)',
  borderRadius: '12px',
  border: '1px dashed var(--border)',
};
