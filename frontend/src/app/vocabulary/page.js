"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import {
  Search, Copy, Check, BookOpen,
  Compass, Palette, Code2, Server, Cpu, Layers,
  ChevronDown, Sparkles, X, ArrowRight, Info
} from 'lucide-react';
import { CONTENT } from '@/config/contentRegistry';

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

// ─── Vocabulary Search Engine ─────────────────────────────────
// Normalizes queries, handles plurals/whitespace, and returns relevance-scored results.
function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

function depluralize(word) {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('ses') || word.endsWith('zes') || word.endsWith('xes') || word.endsWith('ches') || word.endsWith('shes')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function scoreItem(item, query) {
  const q = normalize(query);
  if (!q) return 1; // no query = include everything
  const qDeplural = depluralize(q);
  const tokens = q.split(' ').filter(Boolean);
  const name = normalize(item.name);
  const desc = normalize(item.description);
  const kws = (item.keywords || []).map(k => normalize(k));
  const tags = (item.tags || []).map(t => normalize(t));
  let score = 0;

  // Exact name match (highest relevance)
  if (name === q || name === qDeplural) score += 100;
  // Name starts with query
  else if (name.startsWith(q) || name.startsWith(qDeplural)) score += 60;
  // Name contains query
  else if (name.includes(q) || name.includes(qDeplural)) score += 40;

  // Keyword exact match
  if (kws.some(k => k === q || k === qDeplural)) score += 30;
  // Keyword partial match
  else if (kws.some(k => k.includes(q) || k.includes(qDeplural))) score += 15;

  // Tag match
  if (tags.some(t => t === q || t === qDeplural || t.includes(q))) score += 10;

  // Description match
  if (desc.includes(q) || desc.includes(qDeplural)) score += 5;

  // Multi-token: check if ALL tokens appear somewhere
  if (tokens.length > 1) {
    const allText = `${name} ${desc} ${kws.join(' ')} ${tags.join(' ')}`;
    const allMatch = tokens.every(t => allText.includes(t) || allText.includes(depluralize(t)));
    if (allMatch) score += 20;
  }

  return score;
}

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
          return scoreItem(item, debouncedSearchQuery) > 0;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, vocabulary]); // Intentional: only snapshot expandedSections when search transitions from empty to non-empty

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

  // 6. Filter & prepare vocabulary items with relevance scoring
  const vocabList = vocabulary || [];
  const vocabularyData = vocabList.filter(item => ACTIVE_CATEGORIES.includes(item.category));
  
  const scoredData = vocabularyData.map(item => ({
    ...item,
    _score: scoreItem(item, debouncedSearchQuery)
  }));

  const filteredData = debouncedSearchQuery.trim()
    ? scoredData.filter(item => item._score > 0).sort((a, b) => b._score - a._score)
    : scoredData;

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
      router.push('#' + slug);
    }
  };

  const getCategoryMatchCount = (category) => {
    return filteredData.filter(item => item.category === category).length;
  };

  return (
    <div className="relative z-10 w-[95%] max-w-[1600px] mx-auto py-4 px-6 pb-12">
      
      {/* Unified Header Row */}
      <div className="grid grid-cols-[180px_1fr_180px] items-center w-full border-b border-white/5 pb-4 mb-2 vocabulary-header-row">
        {/* Left: Back Button */}
        <div className="flex justify-start">
          <button 
            onClick={() => router.back()} 
            className="glass-panel active-scale-95 glow-card-spotlight inline-flex items-center gap-[0.55rem] px-4 py-[0.55rem] rounded-[10px] text-[0.8rem] font-semibold text-muted-foreground bg-card border border-border cursor-pointer transition-all duration-250 ease-out font-sans"
            aria-label="Back"
          >
            <ArrowRight size={15} className="rotate-180" strokeWidth={1.75} />
            <span>Back</span>
          </button>
        </div>

        {/* Center: Welcome Title & Subtitle */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[color-mix(in_srgb,#a855f7_8%,transparent)] border border-[color-mix(in_srgb,#a855f7_15%,transparent)] flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-[#a855f7]" strokeWidth={1.75} />
          </div>
          <div className="text-left">
            <h1 className="text-[1.25rem] font-extrabold tracking-tight text-foreground font-display m-0 leading-snug">
              Terminology Library
            </h1>
            <p className="text-[0.82rem] text-muted-foreground mt-[0.15rem] mb-0 leading-snug">
              A compact library of design tokens, architectural paradigms, and strategy concepts.
            </p>
          </div>
        </div>

        {/* Right spacer */}
        <div className="flex justify-end" />
      </div>

      {/* ── Sticky Toolbar ────────────────────────────────────── */}
      <div className="terminology-toolbar">
        <div className="flex flex-row items-center justify-between gap-5 flex-wrap w-full">
          
          {/* Search Console */}
          <div className={cn("flex-1 min-w-[240px] h-[38px] flex items-center gap-2 px-3 bg-input border rounded-[10px] transition-all duration-200 glass-panel", searchFocused ? "border-accent" : "border-border")}>
            <Search size={16} className="text-muted-foreground shrink-0" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search design systems, plg, caching, docker..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent border-none outline-none text-[0.82rem] text-foreground font-sans"
              autoComplete="off"
            />
            {searchQuery && (
              <button 
                className="bg-transparent border-none cursor-pointer text-muted-foreground flex items-center justify-center" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={13} strokeWidth={1.75} />
              </button>
            )}
          </div>

          {/* Navigation Pills */}
          <div className="flex flex-wrap gap-[0.35rem] items-center">
            {ACTIVE_CATEGORIES.map(cat => {
              const meta = getCatMeta(cat, isDark);
              const Icon = meta.icon;
              const matches = getCategoryMatchCount(cat);
              const isSectionExpanded = expandedSections.includes(cat);

              return (
                <motion.button
                  key={cat}
                  onClick={() => handlePillClick(cat)}
                  className={cn(
                    "flex items-center gap-[0.35rem] px-3 py-[0.35rem] text-[0.74rem] font-semibold rounded-full cursor-pointer transition-all duration-150",
                    isSectionExpanded 
                      ? "bg-[color-mix(in_srgb,var(--pcolor)_12%,transparent)] border border-[color-mix(in_srgb,var(--pcolor)_35%,transparent)] text-(--pcolor)"
                      : "bg-card border border-border text-muted-foreground"
                  )}
                  style={{
                    "--pcolor": meta.color
                  }}
                  whileHover={{ scale: 1.03, y: -0.5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={12} strokeWidth={1.75} />
                  <span>{cat}</span>
                  <span className={cn(
                    "text-[0.68rem] font-bold px-1.5 py-px rounded-[8px] ml-[0.2rem] opacity-90",
                    isSectionExpanded
                      ? "bg-[color-mix(in_srgb,var(--pcolor)_18%,transparent)] text-(--pcolor)"
                      : "bg-input text-muted-foreground"
                  )}>
                    {matches}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Match Metrics */}
          <div className="flex items-center gap-[0.35rem] text-[0.78rem] text-muted-foreground font-medium whitespace-nowrap">
            <Info size={13} className="text-muted-foreground" strokeWidth={1.75} />
            <span>
              {isFiltered ? `Showing ${matchCount} of ${totalCount} terms` : `Showing ${totalCount} terms`}
            </span>
          </div>

        </div>
      </div>

      {/* ── Sections & Cards Container ───────────────────────── */}
      <div>
        {vocabLoading ? (
          <div className="flex flex-col gap-10">
            {[1, 2, 3].map(sec => (
              <div key={sec} className="opacity-70">
                <div className="flex gap-3 items-center mb-5">
                  <div className="animate-pulse bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] w-7 h-7 rounded-[8px]" />
                  <div className="flex flex-col gap-1">
                    <div className="animate-pulse bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] w-36 h-3.5 rounded-[4px]" />
                    <div className="animate-pulse bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] w-16 h-2.5 rounded-[4px]" />
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
                  {[1, 2, 3].map(card => (
                    <div key={card} className="card-glass animate-pulse h-[180px] rounded-[16px] border border-border" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : vocabError ? (
          <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-card flex items-center justify-center border border-(--warning) glass-panel">
              <X size={24} className="text-(--warning)" strokeWidth={1.75} />
            </div>
            <p className="text-[0.95rem] font-bold text-foreground mt-0 mb-1">Database Connection Offline</p>
            <p className="text-[0.8rem] text-muted-foreground max-w-[320px] m-0">We were unable to load design terminology from the database. Please verify your connection status and retry.</p>
            <motion.button
              onClick={reloadVocabulary}
              className="mt-6 px-5 py-2 rounded-[8px] text-[0.8rem] font-bold text-white bg-accent border-none cursor-pointer shadow-[0_4px_12px_var(--accent-glow)] transition-opacity duration-200 hover:opacity-90"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Retry Database Connection
            </motion.button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-card flex items-center justify-center border border-border glass-panel">
              <Search size={24} className="text-accent" strokeWidth={1.75} />
            </div>
            <p className="text-[0.95rem] font-bold text-foreground mt-0 mb-1">No results for &ldquo;{debouncedSearchQuery}&rdquo;</p>
            <p className="text-[0.8rem] text-muted-foreground max-w-[380px] m-0">Try a different term, check your spelling, or use a related keyword. Plurals and partial matches are supported.</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {['design system', 'caching', 'microservices', 'PLG'].map(suggestion => (
                <button
                  key={suggestion}
                  className="px-3 py-1.5 text-[0.74rem] font-semibold rounded-full bg-card border border-border text-muted-foreground cursor-pointer transition-all duration-150 hover:border-accent hover:text-accent"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
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
                className="terminology-section mb-6 rounded-[16px] border border-border bg-[color-mix(in_srgb,var(--card)_60%,transparent)] overflow-hidden transition-all duration-300"
              >
                {/* Collapsible Section Header */}
                <button
                  onClick={() => toggleSection(category)}
                  className="p-[1.25rem_1.5rem] w-full flex items-center justify-between text-left bg-transparent border-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                      <CatIcon size={16} style={{ color: meta.color }} strokeWidth={1.75} />
                    </div>
                    <div>
                      <h2 className="text-[1rem] font-bold text-foreground font-display tracking-tight m-0">{category}</h2>
                      <p className="text-[0.72rem] text-muted-foreground mt-[0.05rem] mb-0">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-7 h-7 flex items-center justify-center text-muted-foreground"
                  >
                    <ChevronDown size={18} strokeWidth={1.75} />
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
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4 px-6 pb-6 pt-0">
                        {items.map(item => {
                          const isNameCopied = copiedId === item.id && copiedType === 'name';
                          const isPromptCopied = copiedId === item.id && copiedType === 'prompt';
                          const isDevNotesExpanded = !!expandedDevNotes[item.id];

                          let difficultyColor = '#38bdf8'; // Beginner (blue)
                          if (item.difficulty === 'Intermediate') difficultyColor = '#fbbf24'; // amber
                          if (item.difficulty === 'Advanced') difficultyColor = '#f87171'; // red

                          return (
                            <div
                              key={item.id}
                              className="p-5 rounded-[12px] bg-card border border-border flex flex-col gap-3 relative glass-panel hover:border-slate-700/50 transition-all duration-200"
                            >
                              {/* Card Title & Copy Title button */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-[0.96rem] font-bold text-foreground font-display tracking-tight m-0">{item.name}</h3>
                                  <button
                                    className={cn(
                                      "bg-transparent border-none cursor-pointer flex items-center justify-center p-[2px] rounded-[4px] transition-colors duration-200",
                                      isNameCopied ? "text-(--success)" : "text-muted-foreground"
                                    )}
                                    onClick={(e) => handleCopyName(item.id, item.name, e)}
                                    title="Copy Term Name"
                                  >
                                    {isNameCopied ? <Check size={11} className="text-(--success)" strokeWidth={1.75} /> : <Copy size={11} strokeWidth={1.75} />}
                                  </button>
                                </div>
                                <span 
                                  className="text-[0.64rem] font-bold px-[6px] py-px rounded-[4px] uppercase tracking-wider"
                                  style={{
                                    color: difficultyColor,
                                    background: `color-mix(in srgb, ${difficultyColor} 10%, transparent)`,
                                    border: `1px solid color-mix(in srgb, ${difficultyColor} 20%, transparent)`
                                  }}
                                >
                                  {item.difficulty}
                                </span>
                              </div>

                              {/* Term Definition */}
                              <p className="text-[0.8rem] text-muted-foreground leading-relaxed m-0">{item.description}</p>

                              {/* Keywords / Tags Row */}
                              <div className="flex flex-wrap gap-1">
                                {item.tags && item.tags.map(tag => (
                                  <span key={tag} className="text-[0.64rem] font-semibold text-muted-foreground bg-input border border-border px-[5px] py-px rounded-[4px] font-mono">
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              {/* Prompt Box */}
                              <div 
                                className="rounded-[8px] p-3 flex flex-col gap-2 mt-1"
                                style={{
                                  background: `color-mix(in srgb, ${meta.color} 5%, var(--card))`,
                                  border: `1px solid color-mix(in srgb, ${meta.color} 15%, var(--border))`
                                }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Sparkles size={11} style={{ color: meta.color }} strokeWidth={1.75} />
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Template AI Prompt</span>
                                </div>
                                <p className="text-[0.78rem] italic text-foreground leading-relaxed opacity-90 m-0">&ldquo;{item.examplePrompt || item.example_prompt}&rdquo;</p>
                                <button
                                  className="self-start flex items-center gap-[0.35rem] px-[0.65rem] py-[0.35rem] text-[0.72rem] font-semibold rounded-[6px] cursor-pointer font-sans transition-all duration-150"
                                  style={{
                                    background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
                                    border: `1px solid color-mix(in srgb, ${meta.color} 20%, transparent)`,
                                    color: meta.color
                                  }}
                                  onClick={(e) => handleCopyPrompt(item.id, item.examplePrompt || item.example_prompt, e)}
                                >
                                  {isPromptCopied ? <Check size={13} strokeWidth={1.75} /> : <Copy size={13} strokeWidth={1.75} />}
                                  <span>{isPromptCopied ? 'Prompt Copied!' : 'Copy Prompt Template'}</span>
                                </button>
                              </div>

                              {/* Collapsible Developer Notes */}
                              <div className="border-t border-border pt-2 mt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDevNotes(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                  }}
                                  className="flex justify-between items-center w-full bg-transparent border-none cursor-pointer text-[0.72rem] font-bold text-muted-foreground py-1 uppercase tracking-wider text-left"
                                >
                                  <span>Developer Notes</span>
                                  <motion.div
                                    animate={{ rotate: isDevNotesExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center"
                                  >
                                    <ChevronDown size={14} strokeWidth={1.75} />
                                  </motion.div>
                                </button>

                                <AnimatePresence initial={false}>
                                  {isDevNotesExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="pt-2 flex flex-col gap-2">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[0.64rem] font-semibold text-muted-foreground">Colors:</span>
                                          <code className="font-mono text-[0.72rem] px-1.5 py-[2px] rounded-[4px] border border-border bg-input break-all" style={{ color: meta.color }}>
                                            {(item.designTokens || item.design_tokens || {}).colors}
                                          </code>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[0.64rem] font-semibold text-muted-foreground">Spacing:</span>
                                          <code className="font-mono text-[0.72rem] px-1.5 py-[2px] rounded-[4px] border border-border bg-input break-all" style={{ color: meta.color }}>
                                            {(item.designTokens || item.design_tokens || {}).spacing}
                                          </code>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[0.64rem] font-semibold text-muted-foreground">Typography:</span>
                                          <code className="font-mono text-[0.72rem] px-1.5 py-[2px] rounded-[4px] border border-border bg-input break-all" style={{ color: meta.color }}>
                                            {(item.designTokens || item.design_tokens || {}).typography}
                                          </code>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[0.64rem] font-semibold text-muted-foreground">Implementation Details:</span>
                                          <p className="text-[0.74rem] text-foreground leading-relaxed opacity-90 m-0">
                                            {(item.designTokens || item.design_tokens || {}).developerNotes}
                                          </p>
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
    </div>
  );
}
