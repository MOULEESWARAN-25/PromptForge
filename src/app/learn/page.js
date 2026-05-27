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

  const handleRagSearch = (queryText) => {
    const start = Date.now();
    const results = searchVectorVocabulary(queryText, 4);
    setRagDetails({
      anchor: queryText,
      results: results.map(r => ({
        name: r.term.name,
        category: r.term.category,
        score: r.score,
        description: r.term.description
      })),
      latencyMs: Date.now() - start
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

// Inline Styles for Learn Page
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3rem',
  paddingTop: '1rem',
};

const heroHeader = {
  textAlign: 'center',
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const badgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'hsl(var(--primary))',
  backgroundColor: 'rgba(168, 85, 247, 0.08)',
  border: '1px solid rgba(168, 85, 247, 0.2)',
  padding: '4px 12px',
  borderRadius: '99px',
  fontFamily: 'Outfit, sans-serif',
  letterSpacing: '0.5px',
};

const titleStyle = {
  fontSize: '2.25rem',
  fontWeight: '800',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
};

const subtitleStyle = {
  fontSize: '1rem',
  color: 'var(--fg-muted)',
  lineHeight: '1.6',
};

const sandboxCard = {
  background: 'rgba(7, 7, 10, 0.45)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const sandboxHeader = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
};

const sectionHeading = {
  fontSize: '1.25rem',
  fontWeight: '700',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
};

const sectionSub = {
  fontSize: '0.85rem',
  color: 'var(--fg-muted)',
  marginTop: '2px',
};

const searchRow = {
  display: 'flex',
  gap: '1rem',
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
  color: 'var(--fg-muted)',
};

const searchInput = {
  width: '100%',
  paddingLeft: '2.75rem',
};

const searchBtn = {
  padding: '0.75rem 2rem',
  height: '46px',
};

const inspectorContainer = {
  marginTop: '0.5rem',
};

const dictionaryHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  paddingBottom: '1rem',
};

const dictionaryTitle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
};

const filterList = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const filterBtn = {
  padding: '0.4rem 1rem',
  fontSize: '0.8rem',
  fontWeight: '500',
  borderRadius: '6px',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  color: 'var(--fg-muted)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: 'inherit',
};

const filterBtnActive = {
  backgroundColor: 'hsl(var(--primary))',
  borderColor: 'hsl(var(--primary))',
  color: '#ffffff',
};

const bentoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
  gap: '1.5rem',
};

const vocabCard = {
  backgroundColor: 'rgba(5, 5, 8, 0.4)',
  borderRadius: '14px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const cardTopRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const cardCategory = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'hsl(var(--secondary))',
  backgroundColor: 'rgba(6, 182, 212, 0.06)',
  border: '1px solid rgba(6, 182, 212, 0.15)',
  padding: '2px 8px',
  borderRadius: '4px',
};

const copyBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-muted)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const vocabName = {
  fontSize: '1.15rem',
  fontWeight: '600',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
};

const vocabDesc = {
  fontSize: '0.85rem',
  color: 'var(--fg-muted)',
  lineHeight: '1.45',
};

const codeWrapper = {
  backgroundColor: '#030305',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const codeHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.7rem',
  fontWeight: '600',
  color: 'var(--fg-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const codeText = {
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  color: '#c084fc',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.4',
};

const promptBlock = {
  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  borderLeft: '2px solid hsl(var(--primary))',
  paddingLeft: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const promptLabel = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#ffffff',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const promptText = {
  fontSize: '0.8rem',
  fontStyle: 'italic',
  color: 'var(--fg-muted)',
  lineHeight: '1.4',
};
