import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Sliders, Info, Sparkles, Monitor, Tablet, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
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

const CATEGORIES = ["All", "Modern SaaS", "Enterprise", "Consumer", "Creative", "Visual Style"];
const ARCHETYPE_BADGES = ["All", "Stripe", "Linear", "Notion", "Apple", "Framer", "Cyberpunk", "Minimalist"];

export function ThemeSelector({
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
  const [activeCategory, setActiveCategory] = useState('All');
  const [recentThemes, setRecentThemes] = useState([]);
  const [isExtendedOpen, setIsExtendedOpen] = useState(false);
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

  const getFilteredThemes = (themeNamesList) => {
    return themeNamesList.filter(name => {
      const theme = themeStyles[name];
      if (!theme) return false;

      // Category tab check
      if (activeCategory !== 'All' && theme.family !== activeCategory) {
        // Fallback checks for expanded categories
        if (activeCategory === 'Enterprise' && theme.family !== 'Enterprise Theme') return false;
        if (activeCategory === 'Creative' && theme.family !== 'Creative Theme') return false;
        if (activeCategory === 'Consumer' && theme.family !== 'Consumer Theme') return false;
        if (activeCategory === 'Modern SaaS' && theme.family !== 'Modern SaaS') return false;
        if (activeCategory === 'Visual Style' && theme.family !== 'Visual Style') return false;
      }

      // Search query check
      return matchesSearch(name, theme);
    });
  };

  const allThemeNames = Object.keys(themeStyles);
  const extendedThemeNames = allThemeNames.filter(name => !FEATURED_THEMES.includes(name));

  const filteredFeatured = getFilteredThemes(FEATURED_THEMES);
  const filteredExtended = getFilteredThemes(extendedThemeNames);

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
    background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
    border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
    color: isActive ? '#ffffff' : 'var(--muted-foreground)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.65rem' : '1.25rem' }}>
      
      {/* ── SECTION 1: SEARCH, CATEGORIES & ALIASES ── */}
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem' }} className="animate-fade-up">
          {/* Omni-search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.55rem 0.85rem' }}>
            <Search size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search aesthetics (e.g. 'Stripe', 'Minimalist', 'Apple', 'Modern SaaS'…)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)' }}
            />
            {searchQuery && (
              <span onClick={() => setSearchQuery('')} style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 600 }}>Clear</span>
            )}
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={selectBadge(activeCategory === cat)}
                className="active-scale-95"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Archetype Badge Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Archetypes:</span>
            {ARCHETYPE_BADGES.map(badge => (
              <button
                key={badge}
                type="button"
                onClick={() => {
                  if (badge === 'All') {
                    setSearchQuery('');
                  } else {
                    setSearchQuery(badge);
                  }
                }}
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  background: searchQuery.toLowerCase() === badge.toLowerCase() ? 'rgba(104,67,236,0.12)' : 'transparent',
                  border: '1px solid ' + (searchQuery.toLowerCase() === badge.toLowerCase() ? 'var(--accent)' : 'var(--border)'),
                  color: searchQuery.toLowerCase() === badge.toLowerCase() ? 'var(--accent)' : 'var(--muted-foreground)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="active-scale-95"
              >
                {badge}
              </button>
            ))}
          </div>
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
                    background: isSelected ? 'rgba(104, 67, 236, 0.12)' : 'var(--card)',
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

      {/* ── SECTION 3: FEATURED THEMES LIST ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {!compact && <div style={{ fontSize: '0.62rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)' }}>Featured Style Themes</div>}
        
        {filteredFeatured.length > 0 ? (
          <div style={themeCardGrid}>
            {filteredFeatured.map((themeName) => {
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
                    {isSelected && <CheckCircle2 size={13} style={{ color: '#6843EC' }} />}
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
            No featured themes match your filters.
          </div>
        )}
      </div>

      {/* ── SECTION 4: EXTENDED THEMES (COLLAPSIBLE ACCORDION) ── */}
      {extendedThemeNames.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setIsExtendedOpen(!isExtendedOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              padding: '0.55rem',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontSize: '0.78rem',
              fontWeight: '750',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="active-scale-98 glow-card-spotlight"
          >
            {isExtendedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExtendedOpen ? 'Hide Extended Theme Library' : `Show Extended Theme Library (+${extendedThemeNames.length} styles)`}
          </button>

          <AnimatePresence>
            {isExtendedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                {filteredExtended.length > 0 ? (
                  <div style={{ ...themeCardGrid, marginTop: '0.25rem' }}>
                    {filteredExtended.map((themeName) => {
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
                            <span style={{ fontSize: compact ? '0.74rem' : '0.86rem', color: baseStyles.color || 'var(--foreground)', fontWeight: '750' }}>
                              {themeName}
                            </span>
                            {isSelected && <CheckCircle2 size={13} style={{ color: '#6843EC' }} />}
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
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
                    No extended themes match your filters.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── SECTION 5: SELECTED THEME EDUCATIONAL METADATA CARDS & 'WHY THIS WORKS' ── */}
      {selectedThemeMeta && !compact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem', padding: '1.25rem', background: 'rgba(104, 67, 236, 0.04)', border: '1px solid rgba(104, 67, 236, 0.15)', borderRadius: '20px' }} className="animate-fade-up">
          
          {/* Metadata Specs Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '750', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sliders size={12} /> Design System Metrics
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
              {[
                { label: 'Theme Family', value: selectedThemeMeta.family || 'Visual Style' },
                { label: 'Best For', value: selectedThemeMeta.bestFor || 'Custom SaaS configurations' },
                { label: 'Pairing', value: selectedThemeMeta.typography || 'Inter' },
                { label: 'Motion', value: selectedThemeMeta.motion || 'Gentle Spring' },
                { label: 'Density', value: selectedThemeMeta.density || 'Compact' }
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.45rem 0.6rem' }}>
                  <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>{label}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Educational "Why This Works" Panel */}
          {selectedThemeMeta.whyItWorks && selectedThemeMeta.whyItWorks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: '750', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} /> Why This Theme Works
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {selectedThemeMeta.whyItWorks.map((point, idx) => (
                  <li key={idx} style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: '1.4' }}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: '16px', padding: '1rem', border: '1px solid var(--border)', boxSizing: 'border-box' }}>
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
