"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, Copy, Check, Code, BookOpen, Filter,
  Compass, Palette, Code2, Server, Cpu, Layers,
  ChevronDown, ChevronUp, Sparkles, X, ArrowRight, Info
} from 'lucide-react';

// ─── Constants & Configuration ────────────────────────────────
const ACTIVE_CATEGORIES = [
  "Product Strategy",
  "UX & Design",
  "Frontend Development",
  "Backend Architecture",
  "AI & Automation",
  "DevOps & Infrastructure"
];

const CATEGORY_SLUGS = {
  "Product Strategy": "product-strategy",
  "UX & Design": "ux-design",
  "Frontend Development": "frontend-development",
  "Backend Architecture": "backend-architecture",
  "AI & Automation": "ai-automation",
  "DevOps & Infrastructure": "devops-infrastructure"
};

const SLUG_TO_CATEGORY = {
  "product-strategy": "Product Strategy",
  "ux-design": "UX & Design",
  "frontend-development": "Frontend Development",
  "backend-architecture": "Backend Architecture",
  "ai-automation": "AI & Automation",
  "devops-infrastructure": "DevOps & Infrastructure"
};

const CATEGORY_META = {
  "Product Strategy": { icon: Compass, color: "#a855f7" },
  "UX & Design": { icon: Palette, color: "#f43f5e" },
  "Frontend Development": { icon: Code2, color: "#0ea5e9" },
  "Backend Architecture": { icon: Server, color: "#10b981" },
  "AI & Automation": { icon: Cpu, color: "#6366f1" },
  "DevOps & Infrastructure": { icon: Layers, color: "#eab308" }
};

const getThemeColor = (color, isDark) => {
  if (isDark) {
    return color === 'var(--accent)' ? '#6843EC' : color;
  }
  switch (color) {
    case '#10b981': return '#15803d'; // green
    case '#0ea5e9': return '#0284c7'; // cyan
    case '#a855f7': return '#7c3aed'; // purple
    case '#f43f5e': return '#dc2626'; // rose
    case '#6366f1': return '#4f46e5'; // indigo
    case '#eab308': return '#b45309'; // yellow/amber
    default: return color;
  }
};

const getCatMeta = (cat, isDark) => {
  const meta = CATEGORY_META[cat] || { icon: Sparkles, color: 'var(--accent)' };
  const resolvedColor = getThemeColor(meta.color, isDark);
  return {
    icon: meta.icon,
    color: resolvedColor,
    bg: `color-mix(in srgb, ${resolvedColor} 10%, transparent)`,
    border: `color-mix(in srgb, ${resolvedColor} 20%, transparent)`,
  };
};

export default function VocabularyPage() {
  const { user, theme, vocabulary, vocabLoading, vocabError, reloadVocabulary } = useApp();
  const isDark = theme === 'dark';
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Copy States (Card ID to Copy Type mapping)
  const [copiedId, setCopiedId] = useState(null);
  const [copiedType, setCopiedType] = useState(null); // 'name' | 'prompt'

  // Collapsible Category Sections State
  const [expandedSections, setExpandedSections] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('veyntra_expanded_vocabulary_sections');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
          // Ignore parse errors and fallback
        }
      }
    }
    return ["Product Strategy"]; // First section expanded by default
  });

  // Keep track of expanded sections before a search is initiated
  const preSearchExpandedSections = useRef(null);

  // Collapsible Developer Notes State per Card
  const [expandedDevNotes, setExpandedDevNotes] = useState({});

  const sectionRefs = useRef({});

  // 1. Authenticate check
  useEffect(() => {
    if (!user) router.push('/auth');
  }, [user, router]);

  // 2. Debounce handler for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 3. Persist expanded sections state
  useEffect(() => {
    localStorage.setItem('veyntra_expanded_vocabulary_sections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  // 4. Auto-expand matching sections when search query changes & restore state when cleared
  useEffect(() => {
    if (debouncedSearchQuery.trim() !== '') {
      // Save user state before search if not already saved
      if (preSearchExpandedSections.current === null) {
        preSearchExpandedSections.current = expandedSections;
      }

      const matchingCategories = [];
      ACTIVE_CATEGORIES.forEach(cat => {
        const hasMatch = (vocabulary || []).some(item => {
          if (item.category !== cat) return false;
          const q = debouncedSearchQuery.toLowerCase().trim();
          return (
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.keywords.some(k => k.toLowerCase().includes(q))
          );
        });
        if (hasMatch) {
          matchingCategories.push(cat);
        }
      });

      if (matchingCategories.length > 0) {
        setExpandedSections(prev => {
          const combined = new Set([...prev, ...matchingCategories]);
          return Array.from(combined);
        });
      }
    } else {
      // Restore previous state if search is cleared
      if (preSearchExpandedSections.current !== null) {
        setExpandedSections(preSearchExpandedSections.current);
        preSearchExpandedSections.current = null;
      }
    }
  }, [debouncedSearchQuery, vocabulary]);

  // 5. URL Deep Linking: Read hash on mount/hash change
  useEffect(() => {
    const handleHashLink = () => {
      const hash = window.location.hash;
      if (hash) {
        const slug = hash.replace('#', '');
        const category = SLUG_TO_CATEGORY[slug];
        if (category) {
          // Expand category section
          setExpandedSections(prev => {
            if (!prev.includes(category)) {
              return [...prev, category];
            }
            return prev;
          });

          // Scroll smoothly to category section header
          setTimeout(() => {
            const element = sectionRefs.current[category];
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              
              // Trigger temporary highlight pulse animation
              element.classList.add('section-flash-active');
              setTimeout(() => {
                element.classList.remove('section-flash-active');
              }, 1600);
            }
          }, 150);
        }
      }
    };

    handleHashLink();
    window.addEventListener('hashchange', handleHashLink);
    return () => window.removeEventListener('hashchange', handleHashLink);
  }, []);

  if (!user) return null;

  // 6. Filter & prepare vocabulary items (Display ONLY the 6 specified categories)
  const vocabList = vocabulary || [];
  const vocabularyData = vocabList.filter(item => ACTIVE_CATEGORIES.includes(item.category));
  
  const filteredData = vocabularyData.filter(item => {
    const q = debouncedSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some(k => k.toLowerCase().includes(q))
    );
  });

  // Group filtered results by category
  const grouped = {};
  filteredData.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  // Calculate dynamic metrics
  const isFiltered = debouncedSearchQuery.trim() !== '';
  const totalCount = vocabularyData.length;
  const matchCount = filteredData.length;

  // 7. Copy Action Handlers
  const handleCopyName = (id, name, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setCopiedType('name');
    toast.success(`Copied term: '${name}'`);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 2000);
  };

  const handleCopyPrompt = (id, promptText, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setCopiedType('prompt');
    toast.success('Prompt template copied!');
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 2000);
  };

  // 8. Toggle Category Sections collapse
  const toggleSection = (category) => {
    setExpandedSections(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // 9. Handle category pill scroll action
  const handlePillClick = (category) => {
    const slug = CATEGORY_SLUGS[category];
    if (slug) {
      window.location.hash = slug; // Triggers deep link logic (expanding + scrolling + flashing)
    }
  };

  const getCategoryMatchCount = (category) => {
    return filteredData.filter(item => item.category === category).length;
  };

  return (
    <div style={{ position: 'relative', zIndex: 2, width: '95%', maxWidth: '1600px', margin: '0 auto', padding: '1rem 1.5rem 3rem 1.5rem' }}>
      
      {/* Unified Header Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr 180px",
          alignItems: "center",
          width: "100%",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "1rem",
          marginBottom: "0.5rem",
        }}
        className="vocabulary-header-row"
      >
        {/* Left: Back Button */}
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <button 
            onClick={() => router.back()} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: 'var(--muted-foreground)',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              fontFamily: 'var(--font-sans)',
            }}
            className="glass-panel active-scale-95 glow-card-spotlight"
            aria-label="Back"
          >
            <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} />
            <span>Back</span>
          </button>
        </div>

        {/* Center: Welcome Title & Subtitle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'color-mix(in srgb, #a855f7 8%, transparent)',
            border: '1px solid color-mix(in srgb, #a855f7 15%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BookOpen size={18} style={{ color: '#a855f7' }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--foreground)', fontFamily: 'var(--font-display)', margin: 0, lineHeight: '1.2' }}>
              Terminology Library
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', margin: '0.15rem 0 0 0', lineHeight: '1.2' }}>
              A compact library of design tokens, architectural paradigms, and strategy concepts.
            </p>
          </div>
        </div>

        {/* Right spacer */}
        <div style={{ display: "flex", justifyContent: "flex-end" }} />
      </div>

      {/* ── Sticky Toolbar ────────────────────────────────────── */}
      <div className="terminology-toolbar">
        <div style={toolbarContentStyle}>
          
          {/* Search Console */}
          <div style={searchConsoleStyle(searchFocused)} className="glass-panel">
            <Search size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search design systems, plg, caching, docker..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={searchInputStyle}
              autoComplete="off"
            />
            {searchQuery && (
              <button style={clearSearchBtn} onClick={() => setSearchQuery('')}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Navigation Pills */}
          <div style={pillRowStyle}>
            {ACTIVE_CATEGORIES.map(cat => {
              const meta = getCatMeta(cat, isDark);
              const Icon = meta.icon;
              const matches = getCategoryMatchCount(cat);
              const isSectionExpanded = expandedSections.includes(cat);

              return (
                <motion.button
                  key={cat}
                  onClick={() => handlePillClick(cat)}
                  style={pillStyle(isSectionExpanded, meta.color)}
                  whileHover={{ scale: 1.03, y: -0.5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={12} />
                  <span>{cat}</span>
                  <span style={pillCountStyle(isSectionExpanded, meta.color)}>{matches}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Match Metrics */}
          <div style={resultsCountStyle}>
            <Info size={13} className="text-muted-foreground" />
            <span>
              {isFiltered ? `Showing ${matchCount} of ${totalCount} terms` : `Showing ${totalCount} terms`}
            </span>
          </div>

        </div>
      </div>

      {/* ── Sections & Cards Container ───────────────────────── */}
      <div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 0.75; }
          }
          .pulse-loader {
            animation: pulse 1.5s infinite ease-in-out;
            background: rgba(255, 255, 255, 0.04);
          }
        `}} />

        {vocabLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {[1, 2, 3].map(sec => (
              <div key={sec} style={{ opacity: 0.7 }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div className="pulse-loader" style={{ width: 28, height: 28, borderRadius: '8px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div className="pulse-loader" style={{ width: 140, height: 14, borderRadius: '4px' }} />
                    <div className="pulse-loader" style={{ width: 65, height: 9, borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {[1, 2, 3].map(card => (
                    <div key={card} className="card-glass pulse-loader" style={{ height: 180, borderRadius: '16px', border: '1px solid var(--border)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : vocabError ? (
          <div style={emptyWrap}>
            <div style={{ ...emptyIconWrap, borderColor: 'var(--warning)', background: 'color-mix(in srgb, var(--warning) 8%, transparent)' }} className="glass-panel">
              <X size={24} style={{ color: 'var(--warning)' }} />
            </div>
            <p style={emptyTitle}>Database Connection Offline</p>
            <p style={emptyDesc}>We were unable to load design terminology from the database. Please verify your connection status and retry.</p>
            <motion.button
              onClick={reloadVocabulary}
              style={{
                marginTop: '1.5rem',
                padding: '0.6rem 1.4rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#fff',
                background: 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(104, 67, 236, 0.3)',
                transition: 'opacity 0.2s ease',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Retry Database Connection
            </motion.button>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={emptyWrap}>
            <div style={emptyIconWrap} className="glass-panel">
              <Search size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <p style={emptyTitle}>No matching terms found</p>
            <p style={emptyDesc}>Try adjusting your search criteria or clearing the input.</p>
          </div>
        ) : (
          ACTIVE_CATEGORIES.map(category => {
            const items = grouped[category] || [];
            if (items.length === 0) return null; // Hide categories with 0 search matches

            const meta = getCatMeta(category, isDark);
            const CatIcon = meta.icon;
            const isExpanded = expandedSections.includes(category);

            return (
              <div
                key={category}
                id={CATEGORY_SLUGS[category]}
                ref={el => sectionRefs.current[category] = el}
                className="terminology-section"
                style={sectionContainerStyle(isDark)}
              >
                {/* Collapsible Section Header */}
                <button
                  onClick={() => toggleSection(category)}
                  style={sectionHeaderStyle(isDark)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div style={sectionIconWrap(meta)}>
                      <CatIcon size={16} style={{ color: meta.color }} />
                    </div>
                    <div>
                      <h2 style={sectionTitleStyle}>{category}</h2>
                      <p style={sectionCountStyle}>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={chevronWrapStyle}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                {/* Section Content Accordion */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={gridStyle}>
                        {items.map(item => {
                          const isNameCopied = copiedId === item.id && copiedType === 'name';
                          const isPromptCopied = copiedId === item.id && copiedType === 'prompt';
                          const isDevNotesExpanded = !!expandedDevNotes[item.id];

                          return (
                            <div
                              key={item.id}
                              style={cardStyle(isDark)}
                              className="glass-panel hover:border-slate-700/50 transition-all"
                            >
                              {/* Card Title & Copy Title button */}
                              <div style={cardHeaderStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <h3 style={cardTitleStyle}>{item.name}</h3>
                                  <button
                                    style={smallCopyBtnStyle(isNameCopied)}
                                    onClick={(e) => handleCopyName(item.id, item.name, e)}
                                    title="Copy Term Name"
                                  >
                                    {isNameCopied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                  </button>
                                </div>
                                <span style={difficultyBadgeStyle(item.difficulty, isDark)}>
                                  {item.difficulty}
                                </span>
                              </div>

                              {/* Term Definition */}
                              <p style={cardDescStyle}>{item.description}</p>

                              {/* Keywords / Tags Row */}
                              <div style={tagsRowStyle}>
                                {item.tags && item.tags.map(tag => (
                                  <span key={tag} style={tagChipStyle(isDark)}>
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              {/* Prompt Box */}
                              <div style={promptBoxStyle(meta, isDark)}>
                                <div style={promptHeaderStyle}>
                                  <Sparkles size={11} style={{ color: meta.color }} />
                                  <span style={promptTitleStyle}>Template AI Prompt</span>
                                </div>
                                <p style={promptTextStyle}>"{item.examplePrompt}"</p>
                                <button
                                  style={copyPromptBtnStyle(meta, isDark)}
                                  onClick={(e) => handleCopyPrompt(item.id, item.examplePrompt, e)}
                                >
                                  {isPromptCopied ? <Check size={13} /> : <Copy size={13} />}
                                  <span>{isPromptCopied ? 'Prompt Copied!' : 'Copy Prompt Template'}</span>
                                </button>
                              </div>

                              {/* Collapsible Developer Notes */}
                              <div style={devNotesWrapperStyle(isDark)}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDevNotes(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                  }}
                                  style={devNotesToggleStyle(isDark)}
                                >
                                  <span>Developer Notes</span>
                                  <motion.div
                                    animate={{ rotate: isDevNotesExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                  >
                                    <ChevronDown size={14} />
                                  </motion.div>
                                </button>

                                <AnimatePresence initial={false}>
                                  {isDevNotesExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      style={{ overflow: 'hidden' }}
                                    >
                                      <div style={devNotesContentStyle(isDark)}>
                                        <div style={devNoteFieldStyle}>
                                          <span style={devNoteLabelStyle}>Colors:</span>
                                          <code style={devNoteCodeStyle(meta.color)}>{item.designTokens.colors}</code>
                                        </div>
                                        <div style={devNoteFieldStyle}>
                                          <span style={devNoteLabelStyle}>Spacing:</span>
                                          <code style={devNoteCodeStyle(meta.color)}>{item.designTokens.spacing}</code>
                                        </div>
                                        <div style={devNoteFieldStyle}>
                                          <span style={devNoteLabelStyle}>Typography:</span>
                                          <code style={devNoteCodeStyle(meta.color)}>{item.designTokens.typography}</code>
                                        </div>
                                        <div style={devNoteFieldStyle}>
                                          <span style={devNoteLabelStyle}>Implementation Details:</span>
                                          <p style={devNoteTextStyle}>{item.designTokens.developerNotes}</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .vocabulary-header-row {
            grid-template-columns: 1fr !important;
            gap: 1rem;
            text-align: center;
          }
          .vocabulary-header-row > div {
            justify-content: center !important;
          }
          .vocabulary-header-row div {
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Inline Styles ────────────────────────────────────────────
const compactHeaderStyle = {
  paddingTop: '3.5rem',
  paddingBottom: '2.5rem',
  textAlign: 'center',
  maxWidth: '720px',
  margin: '0 auto',
};

const compactSubtitleStyle = {
  fontSize: '0.92rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
};

const toolbarContentStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.25rem',
  flexWrap: 'wrap',
  width: '100%',
};

const searchConsoleStyle = (focused) => ({
  flex: '1 1 280px',
  minWidth: '240px',
  height: '38px',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0 0.75rem',
  background: 'var(--input)',
  border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: '10px',
  transition: 'all 0.2s ease',
});

const searchInputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '0.82rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
};

const clearSearchBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const pillRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.35rem',
  alignItems: 'center',
};

const pillStyle = (active, color) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.35rem 0.75rem',
  fontSize: '0.74rem',
  fontWeight: '600',
  borderRadius: '999px',
  cursor: 'pointer',
  background: active ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--card)',
  border: `1px solid ${active ? `color-mix(in srgb, ${color} 35%, transparent)` : 'var(--border)'}`,
  color: active ? color : 'var(--muted-foreground)',
  transition: 'all 0.15s ease',
});

const pillCountStyle = (active, color) => ({
  fontSize: '0.68rem',
  fontWeight: '700',
  padding: '1px 6px',
  borderRadius: '8px',
  marginLeft: '0.2rem',
  background: active ? `color-mix(in srgb, ${color} 18%, transparent)` : 'var(--input)',
  color: active ? color : 'var(--muted-foreground)',
  opacity: 0.9,
});

const resultsCountStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
  fontWeight: '500',
  whiteSpace: 'nowrap',
};

const sectionContainerStyle = (isDark) => ({
  marginBottom: '1.5rem',
  borderRadius: '16px',
  border: '1px solid var(--border)',
  background: 'color-mix(in srgb, var(--card) 60%, transparent)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
});

const sectionHeaderStyle = (isDark) => ({
  padding: '1.25rem 1.5rem',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
});

const sectionIconWrap = (meta) => ({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: meta.bg,
  border: `1px solid ${meta.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.01em',
};

const sectionCountStyle = {
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  marginTop: '0.05rem',
};

const chevronWrapStyle = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted-foreground)',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '1rem',
  padding: '0 1.5rem 1.5rem 1.5rem',
};

const cardStyle = (isDark) => ({
  padding: '1.25rem',
  borderRadius: '12px',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  position: 'relative',
});

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '0.5rem',
};

const cardTitleStyle = {
  fontSize: '0.96rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.01em',
};

const smallCopyBtnStyle = (copied) => ({
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: copied ? 'var(--success)' : 'var(--muted-foreground)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px',
  borderRadius: '4px',
  transition: 'color 0.2s',
});

const difficultyBadgeStyle = (difficulty, isDark) => {
  let color = '#38bdf8'; // Beginner (blue)
  if (difficulty === 'Intermediate') color = '#fbbf24'; // amber
  if (difficulty === 'Advanced') color = '#f87171'; // red

  return {
    fontSize: '0.64rem',
    fontWeight: '700',
    color: color,
    background: `color-mix(in srgb, ${color} 10%, transparent)`,
    border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
    padding: '1px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };
};

const cardDescStyle = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
};

const tagsRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.25rem',
};

const tagChipStyle = (isDark) => ({
  fontSize: '0.64rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
  background: 'var(--input)',
  border: '1px solid var(--border)',
  padding: '1px 5px',
  borderRadius: '4px',
  fontFamily: 'var(--font-mono)',
});

const promptBoxStyle = (meta, isDark) => ({
  background: `color-mix(in srgb, ${meta.color} 5%, var(--card))`,
  border: `1px solid color-mix(in srgb, ${meta.color} 15%, var(--border))`,
  borderRadius: '8px',
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginTop: '0.25rem',
});

const promptHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const promptTitleStyle = {
  fontSize: '0.65rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--muted-foreground)',
};

const promptTextStyle = {
  fontSize: '0.78rem',
  fontStyle: 'italic',
  color: 'var(--foreground)',
  lineHeight: '1.45',
  opacity: 0.9,
};

const copyPromptBtnStyle = (meta, isDark) => ({
  alignSelf: 'flex-start',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.35rem 0.65rem',
  fontSize: '0.72rem',
  fontWeight: '600',
  borderRadius: '6px',
  cursor: 'pointer',
  background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
  border: `1px solid color-mix(in srgb, ${meta.color} 20%, transparent)`,
  color: meta.color,
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.15s ease',
});

const devNotesWrapperStyle = (isDark) => ({
  borderTop: '1px solid var(--border)',
  paddingTop: '0.5rem',
  marginTop: '0.25rem',
});

const devNotesToggleStyle = (isDark) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.72rem',
  fontWeight: '700',
  color: 'var(--muted-foreground)',
  padding: '4px 0',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

const devNotesContentStyle = (isDark) => ({
  paddingTop: '0.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

const devNoteFieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15rem',
};

const devNoteLabelStyle = {
  fontSize: '0.64rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
};

const devNoteCodeStyle = (color) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  color: color,
  background: 'var(--input)',
  padding: '2px 6px',
  borderRadius: '4px',
  border: '1px solid var(--border)',
  wordBreak: 'break-all',
});

const devNoteTextStyle = {
  fontSize: '0.74rem',
  color: 'var(--foreground)',
  lineHeight: '1.4',
  opacity: 0.9,
};

const emptyWrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '4rem 1.5rem',
  textAlign: 'center',
};

const emptyIconWrap = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'var(--card)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border)',
};

const emptyTitle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--foreground)',
};

const emptyDesc = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  maxWidth: '320px',
};
