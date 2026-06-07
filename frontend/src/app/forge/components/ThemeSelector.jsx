import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Sparkles, Monitor, Tablet, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeStyles } from '@/data/designVocabulary';
import { getThemeCardDynamicStyles } from '../utils/themeStyles';
import { ThemePreview } from './ThemePreview';

// Featured themes (top 10 user favorites)
const FEATURED_THEMES = [
  "Linear Style",
  "Stripe Inspired",
  "Sleek Dark Glassmorphic",
  "Notion Style",
  "Minimalist Typography",
  "Cyberpunk Neon",
  "Apple Inspired",
  "Neo Brutalism",
  "Luxury Gold",
  "Wes Anderson"
];

const FILTERS = [
  { id: 'All', label: 'All Themes' },
  { id: 'SaaS', label: 'Modern SaaS' },
  { id: 'Enterprise', label: 'Enterprise & Wiki' },
  { id: 'Consumer', label: 'Consumer & Premium' },
  { id: 'Creative', label: 'Creative & Artistic' },
  { id: 'Minimalist', label: 'Minimalist' },
  { id: 'Cyberpunk', label: 'Cyberpunk & Retro' },
  { id: 'Glass', label: 'Glassmorphism' }
];

export function ThemeSelector({
  headerTitle,
  headerDescription,
  selectedTheme,
  setSelectedTheme,
  activeMode,
  appCategory,
  pageType,
  componentType,
  customCategory,
  customComponentType,
  selectedTypography,
  hidePreview = false,
  compact = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [recentThemes, setRecentThemes] = useState([]);
  const [viewportMode, setViewportMode] = useState('desktop'); // desktop, tablet, mobile

  // Load recently used themes on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pf_recent_themes');
      if (stored) {
        setRecentThemes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent themes", e);
    }
  }, []);

  // Update recently used themes when selection changes
  useEffect(() => {
    if (!selectedTheme) return;
    try {
      const stored = localStorage.getItem('pf_recent_themes') || '[]';
      let current = JSON.parse(stored);
      // Remove duplicates
      current = current.filter(t => t !== selectedTheme);
      // Add to front
      current.unshift(selectedTheme);
      // Limit to 3
      current = current.slice(0, 3);
      localStorage.setItem('pf_recent_themes', JSON.stringify(current));
      setRecentThemes(current);
    } catch (e) {
      console.error("Failed to update recent themes", e);
    }
  }, [selectedTheme]);

  // Concept Search Alias Mapping
  const matchesSearch = (themeName, theme) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Direct string match
    if (themeName.toLowerCase().includes(query)) return true;
    if (theme.description.toLowerCase().includes(query)) return true;
    if (theme.keywords.toLowerCase().includes(query)) return true;

    // Category / Family match
    if (theme.family && theme.family.toLowerCase().includes(query)) return true;

    // Dynamic Archetype Aliases
    if (theme.aliases && theme.aliases.some(alias => alias.toLowerCase().includes(query))) return true;

    // Hardcoded concept helper checks
    if (query === 'apple' && (themeName === 'Apple Inspired' || themeName === 'Minimalist Typography' || themeName === 'Luxury Gold')) return true;
    if (query === 'stripe' && (themeName === 'Stripe Inspired' || themeName === 'Modern Dashboard')) return true;
    if (query === 'modern saas' && (themeName === 'Linear Style' || themeName === 'Stripe Inspired' || themeName === 'Analytics Platform' || themeName === 'Sleek Dark Glassmorphic')) return true;
    if (query === 'enterprise' && (theme.family === 'Enterprise Theme' || themeName === 'Modern Dashboard' || themeName === 'Enterprise Slate')) return true;
    if (query === 'startup' && (theme.family === 'Modern SaaS' || themeName === 'Sunset Warmth' || themeName === 'Ocean Breeze')) return true;

    return false;
  };

  const getFilteredThemes = () => {
    const allThemeNames = Object.keys(themeStyles);
    return allThemeNames.filter(name => {
      const theme = themeStyles[name];
      if (!theme) return false;

      // 1. Filter pill check
      if (activeFilter !== 'All') {
        const lowerName = name.toLowerCase();
        const lowerFamily = (theme.family || '').toLowerCase();
        const lowerKeywords = (theme.keywords || '').toLowerCase();
        const lowerAliases = (theme.aliases || []).map(a => a.toLowerCase());

        const matchesFamilyOrKeyword = (term) => {
          return lowerName.includes(term) || 
                 lowerFamily.includes(term) || 
                 lowerKeywords.includes(term) || 
                 lowerAliases.some(alias => alias.includes(term));
        };

        if (activeFilter === 'SaaS') {
          if (!matchesFamilyOrKeyword('saas') && !matchesFamilyOrKeyword('stripe') && !matchesFamilyOrKeyword('linear') && !matchesFamilyOrKeyword('dashboard')) return false;
        } else if (activeFilter === 'Enterprise') {
          if (!matchesFamilyOrKeyword('enterprise') && !matchesFamilyOrKeyword('corporate') && !matchesFamilyOrKeyword('notion') && !matchesFamilyOrKeyword('wiki')) return false;
        } else if (activeFilter === 'Consumer') {
          if (!matchesFamilyOrKeyword('consumer') && !matchesFamilyOrKeyword('apple') && !matchesFamilyOrKeyword('luxury') && !matchesFamilyOrKeyword('premium')) return false;
        } else if (activeFilter === 'Creative') {
          if (!matchesFamilyOrKeyword('creative') && !matchesFamilyOrKeyword('retro') && !matchesFamilyOrKeyword('artistic') && !matchesFamilyOrKeyword('wes anderson') && !matchesFamilyOrKeyword('forest') && !matchesFamilyOrKeyword('gaming')) return false;
        } else if (activeFilter === 'Minimalist') {
          if (!matchesFamilyOrKeyword('minimalist') && !matchesFamilyOrKeyword('clean') && !matchesFamilyOrKeyword('simple') && !matchesFamilyOrKeyword('typography')) return false;
        } else if (activeFilter === 'Cyberpunk') {
          if (!matchesFamilyOrKeyword('cyberpunk') && !matchesFamilyOrKeyword('terminal') && !matchesFamilyOrKeyword('hacker') && !matchesFamilyOrKeyword('neon') && !matchesFamilyOrKeyword('glitch')) return false;
        } else if (activeFilter === 'Glass') {
          if (!matchesFamilyOrKeyword('glass') && !matchesFamilyOrKeyword('transparency')) return false;
        }
      }

      // 2. Search query check
      return matchesSearch(name, theme);
    });
  };

  const filteredThemes = getFilteredThemes();
  const selectedThemeMeta = themeStyles[selectedTheme];

  // Responsive Styles
  const themeCardGrid = compact ? {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginTop: '0.5rem'
  } : {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginTop: '0.75rem'
  };

  const selectBadge = (isActive) => ({
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '0.68rem',
    fontWeight: '700',
    background: isActive ? 'var(--accent)' : 'var(--input)',
    border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
    color: isActive ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.65rem' : '1.25rem' }}>
      
      {/* ── SECTION 1: HEADER & SEARCH ── */}
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }} className="animate-fade-up">
          {headerTitle && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-0.02em', margin: 0 }}>{headerTitle}</h3>
              {headerDescription && <p style={{ fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.4', margin: 0 }}>{headerDescription}</p>}
            </div>
          )}
          {/* Omni-search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.55rem 0.85rem', width: '280px', flexShrink: 0 }}>
            <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search aesthetics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)' }}
            />
            {searchQuery && (
              <span onClick={() => setSearchQuery('')} style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 600 }}>Clear</span>
            )}
          </div>
        </div>
      )}

      {/* FILTER PILLS */}
      {!compact && (
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="animate-fade-up">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              style={selectBadge(activeFilter === filter.id)}
              className="active-scale-95"
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* ── SECTION 2: RECENTLY USED THEMES ── */}
      {!compact && recentThemes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }} className="animate-fade-up">
          <div style={{ fontSize: '0.62rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)' }}>Recently Used Themes</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {recentThemes.map(name => {
              if (!themeStyles[name]) return null;
              const isSelected = selectedTheme === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedTheme(name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: isSelected ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--card)',
                    color: isSelected ? 'var(--accent)' : 'var(--foreground)',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="active-scale-95 glow-card-spotlight"
                >
                  {isSelected ? <CheckCircle2 size={12} style={{ color: 'var(--accent)' }} /> : <Sparkles size={11} style={{ opacity: 0.5 }} />}
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SECTION 3: UNIFIED THEME GRID ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {!compact && <div style={{ fontSize: '0.62rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)' }}>Available Style Themes</div>}
        
        {filteredThemes.length > 0 ? (
          <div style={themeCardGrid}>
            {filteredThemes.map((themeName) => {
              const isSelected = selectedTheme === themeName;
              const baseStyles = getThemeCardDynamicStyles(themeName, isSelected);
              const cardStyles = {
                ...baseStyles,
                ...(compact ? {
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  minHeight: '0',
                } : {})
              };
              return (
                <div
                  key={themeName}
                  style={cardStyles}
                  onClick={() => setSelectedTheme(themeName)}
                  className="glow-card-spotlight active-scale-95 animate-fade-up"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: compact ? '0.74rem' : '0.9rem', color: baseStyles.color || 'var(--foreground)', fontWeight: '750' }}>
                      {themeName}
                    </span>
                    {isSelected && <CheckCircle2 size={13} style={{ color: 'var(--accent)' }} />}
                  </div>
                  {!compact && (
                    <p style={{ fontSize: '0.72rem', color: baseStyles.color || 'var(--muted-foreground)', opacity: 0.72, margin: '2px 0 0 0', lineHeight: '1.3' }}>
                      {themeStyles[themeName].description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--muted-foreground)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '0.78rem' }}>
            No themes match your filters.
          </div>
        )}
      </div>

      {/* ── SECTION 6: LIVE PREVIEW SYSTEM WITH VIEWPORT SEGMENTED CONTROLS ── */}
      {!hidePreview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          
          {/* Viewport Width Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '750', textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Responsive Preview Layout</div>
            
            {/* Viewport Control Badges */}
            <div style={{ display: 'flex', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
              {[
                { id: 'desktop', label: 'Desktop', icon: <Monitor size={12} /> },
                { id: 'tablet', label: 'Tablet', icon: <Tablet size={12} /> },
                { id: 'mobile', label: 'Mobile', icon: <Smartphone size={12} /> }
              ].map(({ id, label, icon }) => {
                const isActive = viewportMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setViewportMode(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '7px',
                      border: 'none',
                      background: isActive ? 'var(--card)' : 'transparent',
                      color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                      fontSize: '0.68rem',
                      fontWeight: isActive ? 800 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    className="active-scale-95"
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Canvas Wrapper Container */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', background: 'color-mix(in srgb, var(--foreground) 3%, transparent)', borderRadius: '16px', padding: '1rem', border: '1px solid var(--border)', boxSizing: 'border-box' }}>
            <div
              style={{
                width: viewportMode === 'mobile' ? '380px' : viewportMode === 'tablet' ? '700px' : '100%',
                maxWidth: '100%',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden'
              }}
            >
              <ThemePreview
                selectedTheme={selectedTheme}
                activeMode={activeMode}
                appCategory={appCategory}
                pageType={pageType}
                componentType={componentType}
                customCategory={customCategory}
                customComponentType={customComponentType}
                selectedTypography={selectedTypography}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
