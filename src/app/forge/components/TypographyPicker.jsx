import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Sliders, Sparkles } from 'lucide-react';

const TYPOGRAPHY_OPTIONS = [
  {
    id: 'Inter',
    label: 'Inter',
    tag: 'Enterprise SaaS',
    category: 'Sans-Serif',
    tagColor: '#6843EC',
    description: 'Clean, functional, screen-optimized. The standard for information-dense SaaS dashboards.',
    sample: 'Analytics Engine',
    style: { fontFamily: "var(--font-inter)", fontWeight: 500 }
  },
  {
    id: 'Geist',
    label: 'Geist',
    tag: 'Developer Tools',
    category: 'Sans-Serif',
    tagColor: '#0891b2',
    description: 'Mono-inspired precision with tight letter-spacing. Standard display style.',
    sample: 'npm run dev --turbo',
    style: { fontFamily: "var(--font-display)", fontWeight: 500, letterSpacing: '-0.02em' }
  },
  {
    id: 'Manrope',
    label: 'Manrope',
    tag: 'Readable Content',
    category: 'Sans-Serif',
    tagColor: '#059669',
    description: 'Geometric, approachable. Comfortable line-height for highly readable SaaS interfaces.',
    sample: 'Weekly Metric Insights',
    style: { fontFamily: "var(--font-manrope)", fontWeight: 500 }
  },
  {
    id: 'Poppins',
    label: 'Poppins',
    tag: 'Consumer SaaS',
    category: 'Sans-Serif',
    tagColor: '#6843EC',
    description: 'Friendly, rounded visual style. Incredibly engaging for consumer-facing apps.',
    sample: 'Create Your Workspace',
    style: { fontFamily: "var(--font-poppins)", fontWeight: 600 }
  },
  {
    id: 'DM Sans',
    label: 'DM Sans',
    tag: 'Dense Layouts',
    category: 'Sans-Serif',
    tagColor: '#6366f1',
    description: 'Compact and sharp. Perfect for data-rich dashboards and utility admin bars.',
    sample: 'Active Server Telemetry',
    style: { fontFamily: "var(--font-dm-sans)", fontWeight: 500 }
  },
  {
    id: 'Outfit',
    label: 'Outfit',
    tag: 'Editorial Design',
    category: 'Display',
    tagColor: '#ec4899',
    description: 'Bold geometric forms with premium visual flow. Excellent for marketing headliners.',
    sample: 'Build the Future.',
    style: { fontFamily: "var(--font-outfit)", fontWeight: 700 }
  },
  {
    id: 'Plus Jakarta Sans',
    label: 'Plus Jakarta Sans',
    tag: 'Premium Light',
    category: 'Sans-Serif',
    tagColor: '#3b82f6',
    description: 'Elegant neo-grotesque structure. Clean curve terminals popular in modern SaaS websites.',
    sample: 'Revenue Operations',
    style: { fontFamily: "var(--font-plus-jakarta-sans)", fontWeight: 600 }
  },
  {
    id: 'Space Grotesk',
    label: 'Space Grotesk',
    tag: 'Web3 & Tech',
    category: 'Display',
    tagColor: '#f59e0b',
    description: 'Quirky geometric details that pop. Energetic, tech-forward, and extremely expressive.',
    sample: 'Decentralized Node',
    style: { fontFamily: "var(--font-space-grotesk)", fontWeight: 700 }
  },
  {
    id: 'Sora',
    label: 'Sora',
    tag: 'Gaming & Interactive',
    category: 'Display',
    tagColor: '#ea580c',
    description: 'Broad, high-character shapes. High visibility sizing for dynamic digital layouts.',
    sample: 'Level 43 Matchmaking',
    style: { fontFamily: "var(--font-sora)", fontWeight: 700 }
  },
  {
    id: 'Nunito',
    label: 'Nunito',
    tag: 'Healthcare Apps',
    category: 'Sans-Serif',
    tagColor: '#10b981',
    description: 'Highly readable rounded terminals. Soft, accessible, and comfortable for readers.',
    sample: 'Clinical Records Panel',
    style: { fontFamily: "var(--font-nunito)", fontWeight: 600 }
  },
  {
    id: 'Urbanist',
    label: 'Urbanist',
    tag: 'Creative Minimal',
    category: 'Sans-Serif',
    tagColor: '#ec4899',
    description: 'Geometric sans with soft aesthetic curves. Highly tailored for lifestyle products.',
    sample: 'Architectural Portfolio',
    style: { fontFamily: "var(--font-urbanist)", fontWeight: 600 }
  },
  {
    id: 'IBM Plex Sans',
    label: 'IBM Plex Sans',
    tag: 'Technical Systems',
    category: 'Sans-Serif',
    tagColor: '#64748b',
    description: 'Neutral yet engineered feel. Blends scientific precision with clear letter spacing.',
    sample: 'Production Logs Trace',
    style: { fontFamily: "var(--font-ibm-plex-sans)", fontWeight: 500 }
  },
  {
    id: 'JetBrains Mono',
    label: 'JetBrains Mono',
    tag: 'Monospace Code',
    category: 'Monospace',
    tagColor: '#22c55e',
    description: 'Designed specifically for syntax reading. Perfect for developer sandboxes.',
    sample: 'const pf = new Forge();',
    style: { fontFamily: "var(--font-jetbrains-mono)", fontWeight: 500 }
  },
  {
    id: 'Recursive',
    label: 'Recursive',
    tag: 'Casual Sandbox',
    category: 'Monospace',
    tagColor: '#06b6d4',
    description: 'Flexible, characterful variable type. Integrates brush-like casual details.',
    sample: 'Git Commit Success',
    style: { fontFamily: "var(--font-recursive)", fontWeight: 600 }
  },
  {
    id: 'Syne',
    label: 'Syne',
    tag: 'Avant-Garde Art',
    category: 'Display',
    tagColor: '#d946ef',
    description: 'Highly artistic, geometric layout widths. A state-of-the-art avant-garde style.',
    sample: 'Symmetry In Art.',
    style: { fontFamily: "var(--font-syne)", fontWeight: 800 }
  },
  {
    id: 'Playfair Display',
    label: 'Playfair Display',
    tag: 'Editorial Serif',
    category: 'Editorial',
    tagColor: '#a855f7',
    description: 'Classic high-prestige serif headings. Evokes classical newsprint layout trust.',
    sample: 'Academic Archives',
    style: { fontFamily: "var(--font-playfair-display)", fontWeight: 700, fontStyle: 'italic' }
  },
  {
    id: 'Lexend',
    label: 'Lexend',
    tag: 'Accessible Design',
    category: 'Sans-Serif',
    tagColor: '#14b8a6',
    description: 'Specifically engineered to improve reading fluency and visual cognitive ease.',
    sample: 'Fluency Assessment',
    style: { fontFamily: "var(--font-lexend)", fontWeight: 500 }
  }
];

const CATEGORIES = ["All", "Sans-Serif", "Display", "Monospace", "Editorial"];

export function TypographyPicker({ selectedTypography, setSelectedTypography, compact = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [recentFonts, setRecentFonts] = useState([]);

  // Load recently used fonts on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pf_recent_fonts');
      if (stored) {
        setRecentFonts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent fonts", e);
    }
  }, []);

  // Update recently used fonts when selection changes
  useEffect(() => {
    if (!selectedTypography) return;
    try {
      const stored = localStorage.getItem('pf_recent_fonts') || '[]';
      let current = JSON.parse(stored);
      // Remove duplicates
      current = current.filter(f => f !== selectedTypography);
      // Add to front
      current.unshift(selectedTypography);
      // Limit to 3
      current = current.slice(0, 3);
      localStorage.setItem('pf_recent_fonts', JSON.stringify(current));
      setRecentFonts(current);
    } catch (e) {
      console.error("Failed to update recent fonts", e);
    }
  }, [selectedTypography]);

  const filteredOptions = TYPOGRAPHY_OPTIONS.filter(opt => {
    // 1. Category Tab Check
    if (activeCategory !== 'All' && opt.category !== activeCategory) {
      return false;
    }
    // 2. Search Query Check
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchName = opt.label.toLowerCase().includes(query);
      const matchDesc = opt.description.toLowerCase().includes(query);
      const matchTag = opt.tag.toLowerCase().includes(query);
      return matchName || matchDesc || matchTag;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.5rem' : '1rem' }}>
      
      {/* Search & Category Header - Only in Full Mode */}
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '14px', padding: '0.85rem' }} className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.45rem 0.75rem' }}>
            <Search size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search typography (e.g. 'Inter', 'Code', 'SaaS'…)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.78rem', color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)' }}
            />
            {searchQuery && (
              <span onClick={() => setSearchQuery('')} style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 600 }}>Clear</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                    border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: isActive ? '#ffffff' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                  className="active-scale-95"
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── RECENTLY USED FONTS ── */}
      {!compact && recentFonts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }} className="animate-fade-up">
          <div style={{ fontSize: '0.62rem', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)' }}>Recently Used Fonts</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {recentFonts.map(id => {
              const opt = TYPOGRAPHY_OPTIONS.find(o => o.id === id);
              if (!opt) return null;
              const isSelected = selectedTypography === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedTypography(id)}
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
                    transition: 'all 0.15s ease',
                    fontFamily: opt.style.fontFamily
                  }}
                  className="active-scale-95 glow-card-spotlight"
                >
                  {isSelected ? <CheckCircle2 size={12} style={{ color: 'var(--accent)' }} /> : <Sparkles size={11} style={{ opacity: 0.5 }} />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Options */}
      {filteredOptions.length > 0 ? (
        <div style={compact ? {
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        } : {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.85rem',
        }}>
          {filteredOptions.map((opt) => {
            const isSelected = selectedTypography === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedTypography(opt.id)}
                className="active-scale-95 animate-fade-up glow-card-spotlight"
                style={{
                  padding: compact ? '0.45rem 0.65rem' : '1.1rem 1.25rem',
                  borderRadius: compact ? '8px' : '14px',
                  border: isSelected
                    ? `1.5px solid ${opt.tagColor}`
                    : '1px solid var(--border)',
                  background: isSelected
                    ? `rgba(${hexToRgb(opt.tagColor)}, 0.06)`
                    : 'var(--card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? `0 0 18px ${opt.tagColor}22` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: compact ? '0.2rem' : '0.45rem',
                }}
              >
                {/* Visual UI Sandbox Preview - Only in Full Mode */}
                {!compact && (
                  <div style={{ ...opt.style, display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.15rem' }}>
                    <span style={{ ...opt.style, fontSize: '0.95rem', color: 'var(--foreground)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                      {opt.sample}
                    </span>
                    <span style={{ ...opt.style, fontSize: '0.65rem', fontWeight: 600, color: isSelected ? opt.tagColor : 'var(--muted-foreground)', lineHeight: 1.3 }}>
                      14,285 Metric Balance · +8.4%
                    </span>
                    <span style={{ ...opt.style, fontSize: '0.54rem', fontWeight: 500, color: 'var(--muted-foreground)', opacity: 0.8, lineHeight: 1.2 }}>
                      System Telemetry Nodes
                    </span>
                  </div>
                )}

                {/* Name + Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{
                    ...opt.style,
                    fontSize: compact ? '0.74rem' : '0.8rem',
                    fontWeight: '750',
                    color: isSelected ? opt.tagColor : 'var(--foreground)',
                  }}>
                    {opt.label}
                  </span>
                  <span style={{
                    fontSize: compact ? '0.52rem' : '0.58rem',
                    fontWeight: '600',
                    color: opt.tagColor,
                    background: `rgba(${hexToRgb(opt.tagColor)}, 0.08)`,
                    border: `1px solid rgba(${hexToRgb(opt.tagColor)}, 0.18)`,
                    borderRadius: '4px',
                    padding: compact ? '0px 4px' : '1px 6px',
                    whiteSpace: 'nowrap'
                  }}>
                    {compact ? opt.tag.split(' ')[0] : opt.tag}
                  </span>
                </div>

                {/* Description - Only in Full Mode */}
                {!compact && (
                  <p style={{
                    fontSize: '0.7rem',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.35',
                    margin: 0,
                  }}>
                    {opt.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '0.78rem' }}>
          No fonts found matching your search.
        </div>
      )}
    </div>
  );
}

// Utility: hex color → "r, g, b" string for rgba()
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '104,67,236';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
