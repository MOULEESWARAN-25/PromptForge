"use client";

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { designVocabulary } from '@/data/designVocabulary';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { toast } from 'sonner';

import {
  Search, Copy, Check, Code, BookOpen, Filter,
  Paintbrush, LayoutGrid, Box, Navigation2, Zap, Cpu,
  ChevronDown, Sparkles, X, ArrowRight
} from 'lucide-react';

// ─── Category Config ─────────────────────────────────────────
const CATEGORY_META = {
  'Visual Design Style': { icon: Paintbrush, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
  'Layout':             { icon: LayoutGrid, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.2)' },
  'Component':          { icon: Box,        color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.2)' },
  'Navigation Pattern': { icon: Navigation2,color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  'Animation & Motion': { icon: Zap,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  'Modern AI/SaaS Terms':{ icon: Cpu,       color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
};

const getCatMeta = (cat) => CATEGORY_META[cat] || { icon: Sparkles, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' };

// ─── Animation Variants ──────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function VocabularyPage() {
  const { user } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' });

  React.useEffect(() => { if (!user) router.push('/auth'); }, [user, router]);

  const handleCopy = (id, text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Prompt token copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) return null;

  const categories = ['All', ...new Set(designVocabulary.map(i => i.category))];
  const filtered = designVocabulary.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.keywords.some(k => k.includes(q));
    return matchCat && matchSearch;
  });

  // Group by category for section headers
  const grouped = {};
  filtered.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return (
    <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        variants={stagger}
        initial="hidden"
        animate={heroInView ? 'show' : 'hidden'}
        style={heroStyle}
      >
        <motion.div variants={fadeUp}>
          <div className="premium-badge animate-pulse-slow" style={{ marginBottom: '1.25rem' }}>
            <Box size={11} className="text-purple-400" />
            <span>Design Tokens Library</span>
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} className="hero-headline" style={{ marginBottom: '1rem', maxWidth: '780px', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
          Master the language{' '}
          <span className="hero-gradient">AI understands.</span>
        </motion.h1>

        <motion.p variants={fadeUp} style={heroSub}>
          Each design token represents an optimized visual style, layout pattern, or motion curve. Reference these building blocks to enrich your generated UI specifications.
        </motion.p>

        {/* ── Search Console ──────────────────────────────────── */}
        <motion.div 
          variants={fadeUp} 
          style={searchConsole(searchFocused)}
          className="glass-panel"
        >
          <Search size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search glassmorphism, bento grid, micro-interactions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyle}
            autoComplete="off"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={clearSearchBtn}
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </motion.button>
          )}
        </motion.div>

        {/* ── Category Pills ─────────────────────────────────── */}
        <motion.div variants={fadeUp} style={pillRow}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const meta = cat === 'All' ? { icon: Sparkles, color: 'var(--accent)' } : getCatMeta(cat);
            const Icon = meta.icon;
            return (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={pillStyle(isActive, meta.color)}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={12} />
                {cat === 'All' ? 'All' : cat.replace('Modern AI/SaaS Terms', 'AI / SaaS')}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Stats Bar ──────────────────────────────────────── */}
        <motion.div variants={fadeUp} style={statsBar}>
          <span style={statItem}>
            <span style={statNum}>{filtered.length}</span> terms found
          </span>
          <span style={statDot}>·</span>
          <span style={statItem}>
            <span style={statNum}>{Object.keys(grouped).length}</span> categories
          </span>
          {(searchQuery || selectedCategory !== 'All') && (
            <>
              <span style={statDot}>·</span>
              <button style={clearAllBtn} onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Reset filters
              </button>
            </>
          )}
        </motion.div>
      </motion.section>

      {/* ── Cards Grid ───────────────────────────────────────── */}
      <motion.section
        ref={gridRef}
        variants={stagger}
        initial="hidden"
        animate={gridInView ? 'show' : 'hidden'}
      >
        {filtered.length === 0 ? (
          <motion.div variants={fadeUp} style={emptyWrap}>
            <div style={emptyIconWrap} className="glass-panel"><Search size={28} style={{ color: 'var(--accent)' }} /></div>
            <p style={emptyTitle}>No matching terms</p>
            <p style={emptyDesc}>Try a different search or clear your filters.</p>
          </motion.div>
        ) : (
          Object.entries(grouped).map(([category, items]) => {
            const meta = getCatMeta(category);
            const CatIcon = meta.icon;
            return (
              <div key={category} style={{ marginBottom: '2.5rem' }}>
                {/* Section Header */}
                <motion.div variants={fadeUp} style={sectionHead}>
                  <div style={sectionIconWrap(meta)}>
                    <CatIcon size={16} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <h2 style={sectionTitle}>{category}</h2>
                    <p style={sectionCount}>{items.length} {items.length === 1 ? 'term' : 'terms'}</p>
                  </div>
                </motion.div>

                {/* Cards */}
                <motion.div variants={stagger} style={gridStyle}>
                  {items.map((item) => {
                    const isExpanded = expandedId === item.id;
                    const isCopied = copiedId === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        variants={cardAnim}
                        layout
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        style={cardStyle(meta)}
                        className="glass-panel card-hover"
                        whileHover={{ y: -4 }}
                      >
                        {/* Ambient glow */}
                        <div style={ambientGlow(meta.color)} />

                        {/* Top row */}
                        <div style={cardTopRow}>
                          <span style={catBadge(meta)}>{category.replace('Modern AI/SaaS Terms', 'AI/SaaS')}</span>
                          <div style={cardActions}>
                            <motion.button
                              style={copyBtnStyle(isCopied)}
                              onClick={(e) => handleCopy(item.id, item.examplePrompt, e)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Copy prompt"
                            >
                              {isCopied ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                            </motion.button>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.25 }}
                              style={chevronWrap}
                            >
                              <ChevronDown size={14} />
                            </motion.div>
                          </div>
                        </div>

                        {/* Title + desc */}
                        <h3 style={cardTitle}>{item.name}</h3>
                        <p style={cardDesc}>{item.description}</p>

                        {/* Keywords */}
                        <div style={keywordRow}>
                          {item.keywords.slice(0, 4).map((kw, i) => (
                            <span key={i} style={keywordChip(meta)}>{kw}</span>
                          ))}
                        </div>

                        {/* Expandable Detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={expandedContent}>
                                {/* CSS Snippet */}
                                {item.snippet && (
                                  <div style={codeBlock(meta)}>
                                    <div style={codeLabel}>
                                      <Code size={11} style={{ color: meta.color }} />
                                      <span>Design Token / CSS</span>
                                    </div>
                                    <pre style={codePre(meta)}>{item.snippet}</pre>
                                  </div>
                                )}

                                {/* Prompt */}
                                <div style={promptSection(meta)}>
                                  <div style={promptLabelRow}>
                                    <Sparkles size={12} style={{ color: meta.color }} />
                                    <span style={promptLabel}>Example AI Prompt</span>
                                  </div>
                                  <p style={promptText}>"{item.examplePrompt}"</p>
                                  <motion.button
                                    style={copyPromptBtn(meta)}
                                    onClick={(e) => handleCopy(item.id, item.examplePrompt, e)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                    {isCopied ? 'Copied!' : 'Copy Prompt'}
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            );
          })
        )}
      </motion.section>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────

const heroStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  textAlign: 'center', paddingTop: '4rem', paddingBottom: '5rem',
  maxWidth: '860px', margin: '0 auto',
};

const heroSub = {
  fontSize: '1.05rem', color: 'var(--muted-foreground)',
  lineHeight: '1.7', maxWidth: '560px', marginBottom: '2.5rem',
};

const searchConsole = (focused) => ({
  width: '100%', maxWidth: '580px', height: '52px',
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0 1rem',
  background: 'rgba(10, 10, 12, 0.4)',
  border: `1.5px solid ${focused ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
  borderRadius: '14px',
  backdropFilter: 'blur(20px)',
  boxShadow: focused
    ? '0 0 0 1px var(--accent), 0 8px 32px rgba(124,58,237,0.15), inset 0 1px 0 0 rgba(255,255,255,0.1)'
    : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.05)',
  marginBottom: '1.25rem',
  transition: 'all 0.25s ease',
});

const searchInputStyle = {
  flex: 1, background: 'transparent', border: 'none', outline: 'none',
  fontSize: '0.9rem', color: 'var(--foreground)', fontFamily: 'var(--font-sans)',
};

const clearSearchBtn = {
  width: '28px', height: '28px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'var(--muted-foreground)',
};

const pillRow = {
  display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
  justifyContent: 'center', marginBottom: '1.25rem',
};

const pillStyle = (active, color) => ({
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  padding: '0.4rem 0.9rem', fontSize: '0.76rem', fontWeight: '600',
  borderRadius: '999px', cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  background: active ? `${color}15` : 'rgba(255,255,255,0.02)',
  border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
  color: active ? color : 'var(--muted-foreground)',
  transition: 'all 0.2s ease',
});

const statsBar = {
  display: 'flex', alignItems: 'center', gap: '0.6rem',
  fontSize: '0.8rem', color: 'var(--muted-foreground)',
};
const statItem = { display: 'flex', gap: '0.3rem', alignItems: 'center' };
const statNum = { fontWeight: '700', color: 'var(--foreground)' };
const statDot = { opacity: 0.3 };
const clearAllBtn = {
  background: 'transparent', border: 'none', color: 'var(--accent)',
  fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
  fontFamily: 'var(--font-sans)', textDecoration: 'underline',
  textUnderlineOffset: '2px',
};

// ── Section Headers ─────────────────────────────────────────
const sectionHead = {
  display: 'flex', alignItems: 'center', gap: '0.875rem',
  marginBottom: '1.25rem', paddingBottom: '1rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
};
const sectionIconWrap = (meta) => ({
  width: '36px', height: '36px', borderRadius: '10px',
  background: meta.bg, border: `1px solid ${meta.border}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});
const sectionTitle = {
  fontSize: '1.15rem', fontWeight: '700', color: 'var(--foreground)',
  fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
};
const sectionCount = {
  fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.15rem',
};

// ── Grid ────────────────────────────────────────────────────
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '1.25rem',
};

// ── Card ────────────────────────────────────────────────────
const cardStyle = (meta) => ({
  position: 'relative', overflow: 'hidden', cursor: 'pointer',
  padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.04)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
});

const ambientGlow = (color) => ({
  position: 'absolute', top: '-40%', right: '-20%',
  width: '180px', height: '180px', borderRadius: '50%',
  background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
  pointerEvents: 'none',
});

const cardTopRow = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};

const catBadge = (meta) => ({
  fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.06em',
  textTransform: 'uppercase', color: meta.color,
  background: meta.bg, border: `1px solid ${meta.border}`,
  padding: '2px 8px', borderRadius: '999px',
});

const cardActions = { display: 'flex', alignItems: 'center', gap: '0.35rem' };

const copyBtnStyle = (copied) => ({
  width: '28px', height: '28px', borderRadius: '7px',
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: copied ? '#10b981' : 'var(--muted-foreground)',
  transition: 'all 0.2s ease',
});

const chevronWrap = {
  width: '28px', height: '28px', borderRadius: '7px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--muted-foreground)',
};

const cardTitle = {
  fontSize: '1.05rem', fontWeight: '700', color: 'var(--foreground)',
  fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
};

const cardDesc = {
  fontSize: '0.82rem', color: 'var(--muted-foreground)', lineHeight: '1.55',
};

// ── Keywords ────────────────────────────────────────────────
const keywordRow = { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' };
const keywordChip = (meta) => ({
  fontSize: '0.66rem', fontWeight: '600', padding: '2px 7px',
  borderRadius: '4px', background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)', color: 'var(--muted-foreground)',
  fontFamily: 'var(--font-mono)',
});

// ── Expanded Content ────────────────────────────────────────
const expandedContent = {
  display: 'flex', flexDirection: 'column', gap: '1rem',
  paddingTop: '1rem', marginTop: '0.75rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
};

const codeBlock = (meta) => ({
  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '10px', padding: '1rem',
  display: 'flex', flexDirection: 'column', gap: '0.5rem',
});
const codeLabel = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  fontSize: '0.66rem', fontWeight: '700', color: 'var(--muted-foreground)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
};
const codePre = (meta) => ({
  fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
  color: meta.color, whiteSpace: 'pre-wrap', lineHeight: '1.6',
});

const promptSection = (meta) => ({
  background: `${meta.color}0c`, border: `1px solid ${meta.color}25`,
  borderRadius: '10px', padding: '1rem',
  display: 'flex', flexDirection: 'column', gap: '0.6rem',
});
const promptLabelRow = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
};
const promptLabel = {
  fontSize: '0.68rem', fontWeight: '700', color: 'var(--muted-foreground)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
const promptText = {
  fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--foreground)',
  lineHeight: '1.6', opacity: 0.85,
};
const copyPromptBtn = (meta) => ({
  alignSelf: 'flex-start',
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: '700',
  borderRadius: '8px', cursor: 'pointer',
  background: `${meta.color}15`, border: `1px solid ${meta.border}`,
  color: meta.color, fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
});

// ── Empty State ─────────────────────────────────────────────
const emptyWrap = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '1rem', padding: '4rem 2rem', textAlign: 'center',
};
const emptyIconWrap = {
  width: '56px', height: '56px', borderRadius: '14px',
  background: 'rgba(255,255,255,0.02)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  color: 'var(--muted-foreground)',
};
const emptyTitle = { fontSize: '1rem', fontWeight: '700', color: 'var(--foreground)' };
const emptyDesc = { fontSize: '0.85rem', color: 'var(--muted-foreground)', maxWidth: '340px' };
