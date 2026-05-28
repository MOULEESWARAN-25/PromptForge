"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { designVocabulary } from '@/data/designVocabulary';
import { Search, Copy, Check, Code, BookOpen, Filter } from 'lucide-react';

export default function VocabularyPage() {
  const { user } = useApp();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Verify auth session
  React.useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleCopyPrompt = (id, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) return null;

  // Filter vocabulary by category and search
  const categories = ['All', ...new Set(designVocabulary.map(item => item.category))];

  const filteredVocabulary = designVocabulary.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.examplePrompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={heroHeader}>
        <div style={badgeStyle}>
          <BookOpen size={14} />
          <span>DESIGN VOCABULARY</span>
        </div>
        <h1 style={titleStyle}>Professional Design Vocabulary Index</h1>
        <p style={subtitleStyle}>
          Browse professional design terminology and copy precision-crafted example prompts to supercharge your AI-generated UI.
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div style={toolbarCard} className="glass-panel">
        <div style={searchBarContainer}>
          <Search size={18} style={searchIcon} />
          <input
            type="text"
            placeholder="Search design tokens, terms, or prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInput}
            className="glass-input"
          />
        </div>

        <div style={filterSection}>
          <div style={filterLabelRow}>
            <Filter size={13} style={{ color: 'var(--muted-foreground)' }} />
            <span style={filterLabel}>Category</span>
          </div>
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
      </div>

      {/* Results count */}
      <div style={resultsMeta}>
        <span style={resultsCount}>
          {filteredVocabulary.length} {filteredVocabulary.length === 1 ? 'term' : 'terms'}
        </span>
        {(searchQuery || selectedCategory !== 'All') && (
          <button 
            style={clearFiltersBtn}
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Bento Grid catalog cards */}
      {filteredVocabulary.length === 0 ? (
        <div style={emptyState}>
          <Search size={24} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
          <p style={emptyTitle}>No matching terms</p>
          <p style={emptyDesc}>Try adjusting your search or category filter.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
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

const toolbarCard = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  boxShadow: 'var(--shadow-md)',
};

const searchBarContainer = {
  position: 'relative',
  display: 'flex',
  width: '100%',
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

const filterSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
};

const filterLabelRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const filterLabel = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
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

const resultsMeta = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
};

const resultsCount = {
  fontSize: '0.82rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
};

const clearFiltersBtn = {
  padding: '0.3rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '6px',
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-sans)',
};

const emptyState = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '3rem 2rem',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  textAlign: 'center',
};

const emptyTitle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--foreground)',
};

const emptyDesc = {
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  maxWidth: '360px',
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
