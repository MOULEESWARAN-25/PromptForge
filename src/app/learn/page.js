"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import RagInspector from '@/components/RagInspector';
import { searchVectorVocabulary } from '@/services/ragEngine';
import { designVocabulary } from '@/data/designVocabulary';
import { BookOpen, Search, Copy, Check, Sparkles, Cpu, Code, BookOpenCheck } from 'lucide-react';

export default function LearnPage() {
  const { user } = useApp();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [ragDetails, setRagDetails] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Verify auth session
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // Run initial default RAG check
  useEffect(() => {
    handleRagSearch('glass widgets with cards');
  }, []);

  const handleRagSearch = async (queryText) => {
    const start = Date.now();

    // Try calling decoupled backend vector search first
    try {
      const response = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: queryText, limit: 4 })
      });

      if (response.ok) {
        const data = await response.json();
        setRagDetails({
          anchor: queryText,
          results: data.results,
          latencyMs: data.latencyMs,
          source: "Supabase pgvector Database (Live)"
        });
        return;
      }
    } catch (error) {
      console.warn("Express backend search offline. Falling back to local VSM:", error);
    }

    // Client-side local fallback RAG (the original code)
    const results = searchVectorVocabulary(queryText, 4);
    setRagDetails({
      anchor: queryText,
      results: results.map(r => ({
        name: r.term.name,
        category: r.term.category,
        score: r.score,
        description: r.term.description
      })),
      latencyMs: Date.now() - start,
      source: "In-Memory TF-IDF Vector Space (Local Fallback)"
    });
  };

  const handleCopyPrompt = (id, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) return null;

  // Filter vocabulary by category
  const categories = ['All', ...new Set(designVocabulary.map(item => item.category))];
  const filteredVocabulary = selectedCategory === 'All'
    ? designVocabulary
    : designVocabulary.filter(item => item.category === selectedCategory);

  return (
    <div style={containerStyle}>
      {/* Intro Header */}
      <div style={heroHeader}>
        <div style={badgeStyle}>
          <BookOpenCheck size={14} />
          <span>PROMPTFORGE RAG LAB</span>
        </div>
        <h1 style={titleStyle}>The AI Prompt Engineering Learning Lab</h1>
        <p style={subtitleStyle}>
          Understand the math and engineering behind AI prompt generators. Test how our local semantic search engine (RAG) matches natural language ideas with professional design tokens.
        </p>
      </div>

      {/* RAG Sandbox Segment */}
      <div style={sandboxCard} className="glass-panel">
        <div style={sandboxHeader}>
          <Cpu size={18} style={{ color: 'hsl(var(--secondary))' }} />
          <div>
            <h2 style={sectionHeading}>Interactive RAG Sandbox Playground</h2>
            <p style={sectionSub}>Type standard, simple layout concepts to test how similarity vector matching operates live!</p>
          </div>
        </div>

        <div style={searchRow}>
          <div style={searchBarContainer}>
            <Search size={18} style={searchIcon} />
            <input
              type="text"
              placeholder="e.g. glassmorphic panel with pinterest columns and bounce button click..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRagSearch(searchQuery); }}
              style={searchInput}
              className="glass-input"
            />
          </div>
          <button
            onClick={() => handleRagSearch(searchQuery)}
            style={searchBtn}
            className="btn-primary shine-effect"
          >
            Run Similarity Match
          </button>
        </div>

        {/* Live Vector Inspector Component */}
        <div style={inspectorContainer}>
          <RagInspector ragDetails={ragDetails} />
        </div>
      </div>

      {/* Dictionary Category Index Selector */}
      <div style={dictionaryHeaderRow}>
        <h2 style={dictionaryTitle}>Professional Design Vocabulary Index</h2>
        <div style={filterList}>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              style={{
                ...filterBtn,
                ...(selectedCategory === cat ? filterBtnActive : {})
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid catalog cards */}
      <div style={bentoGrid}>
        {filteredVocabulary.map((item) => (
          <div key={item.id} style={vocabCard} className="glass-panel glass-panel-hover">
            <div style={cardTopRow}>
              <span style={cardCategory}>{item.category}</span>
              <button
                style={copyBtn}
                onClick={() => handleCopyPrompt(item.id, item.examplePrompt)}
                title="Copy Example Prompt"
              >
                {copiedId === item.id ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              </button>
            </div>

            <h3 style={vocabName}>{item.name}</h3>
            <p style={vocabDesc}>{item.description}</p>

            {item.snippet && (
              <div style={codeWrapper}>
                <div style={codeHeader}>
                  <Code size={12} />
                  <span>Design Token CSS / Tip</span>
                </div>
                <pre style={codeText}>{item.snippet}</pre>
              </div>
            )}

            <div style={promptBlock}>
              <strong style={promptLabel}>Example AI Prompt:</strong>
              <p style={promptText}>"{item.examplePrompt}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Premium Learn Styles ──────────────────────────────────────

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2.5rem',
  paddingTop: '1rem',
  position: 'relative',
  zIndex: 2,
};

const heroHeader = {
  textAlign: 'center',
  maxWidth: '760px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  paddingTop: '1rem',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.72rem',
  fontWeight: '700',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  background: 'var(--accent-subtle)',
  border: '1px solid rgba(25,57,141,0.15)',
  padding: '4px 12px',
  borderRadius: '999px',
};

const titleStyle = {
  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.04em',
  lineHeight: '1.1',
};

const subtitleStyle = {
  fontSize: '1rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.65',
  maxWidth: '560px',
};

const sandboxCard = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  boxShadow: 'var(--shadow-md)',
};

const sandboxHeader = {
  display: 'flex',
  gap: '0.875rem',
  alignItems: 'flex-start',
};

const sectionHeading = {
  fontSize: '1.15rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.02em',
};

const sectionSub = {
  fontSize: '0.83rem',
  color: 'var(--muted-foreground)',
  marginTop: '0.3rem',
  lineHeight: '1.5',
};

const searchRow = {
  display: 'flex',
  gap: '0.75rem',
  width: '100%',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const searchBarContainer = {
  position: 'relative',
  display: 'flex',
  flex: 1,
  minWidth: '280px',
};

const searchIcon = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--muted-foreground)',
};

const searchInput = {
  width: '100%',
  paddingLeft: '2.75rem',
};

const searchBtn = {
  padding: '0.7rem 1.5rem',
  height: '44px',
  whiteSpace: 'nowrap',
};

const inspectorContainer = {
  marginTop: '0.25rem',
};

const dictionaryHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
  paddingBottom: '1.25rem',
  borderBottom: '1px solid var(--border)',
};

const dictionaryTitle = {
  fontSize: '1.35rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.025em',
};

const filterList = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem',
};

const filterBtn = {
  padding: '0.35rem 0.875rem',
  fontSize: '0.78rem',
  fontWeight: '600',
  borderRadius: '999px',
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-sans)',
};

const filterBtnActive = {
  background: 'var(--accent)',
  borderColor: 'var(--accent)',
  color: 'var(--accent-foreground)',
};

const bentoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '1rem',
};

const vocabCard = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  boxShadow: 'var(--shadow-sm)',
  transition: 'all 0.25s ease',
};

const cardTopRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const cardCategory = {
  fontSize: '0.7rem',
  fontWeight: '700',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  background: 'var(--accent-subtle)',
  border: '1px solid rgba(25,57,141,0.12)',
  padding: '2px 8px',
  borderRadius: '999px',
};

const copyBtn = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
};

const vocabName = {
  fontSize: '1rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.02em',
};

const vocabDesc = {
  fontSize: '0.83rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.55',
};

const codeWrapper = {
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.875rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const codeHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.68rem',
  fontWeight: '700',
  color: 'var(--muted-foreground)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const codeText = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  color: 'var(--accent)',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.5',
};

const promptBlock = {
  borderLeft: '2px solid var(--accent)',
  paddingLeft: '0.875rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
};

const promptLabel = {
  fontSize: '0.7rem',
  fontWeight: '700',
  color: 'var(--muted-foreground)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const promptText = {
  fontSize: '0.82rem',
  fontStyle: 'italic',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
};


