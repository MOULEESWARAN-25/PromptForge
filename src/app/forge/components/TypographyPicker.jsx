import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const TYPOGRAPHY_OPTIONS = [
  {
    id: 'Inter',
    label: 'Inter',
    tag: 'Enterprise SaaS',
    tagColor: '#7c3aed',
    description: 'Clean, functional, screen-optimized. The standard for information-dense dashboards.',
    sample: 'Dashboard Analytics',
    style: { fontFamily: "'Inter', sans-serif", fontWeight: 500 },
    googleFont: 'Inter:wght@400;500;600;700'
  },
  {
    id: 'Geist',
    label: 'Geist',
    tag: 'Developer Tools',
    tagColor: '#0891b2',
    description: 'Mono-inspired precision with tight letter-spacing. Built for developer-facing SaaS.',
    sample: 'Build. Ship. Iterate.',
    style: { fontFamily: "'Geist', sans-serif", fontWeight: 500, letterSpacing: '-0.02em' },
    googleFont: null // Geist loaded via Next.js font
  },
  {
    id: 'Manrope',
    label: 'Manrope',
    tag: 'Readable Dashboards',
    tagColor: '#059669',
    description: 'Geometric, approachable. Comfortable line-height for readable content-heavy layouts.',
    sample: 'Your Weekly Report',
    style: { fontFamily: "'Manrope', sans-serif", fontWeight: 500 },
    googleFont: 'Manrope:wght@400;500;600;700'
  },
  {
    id: 'Poppins',
    label: 'Poppins',
    tag: 'Consumer SaaS',
    tagColor: '#f59e0b',
    description: 'Rounded, consumer-facing warmth. Friendly and modern for B2C products.',
    sample: 'Start Your Journey',
    style: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    googleFont: 'Poppins:wght@400;500;600;700'
  },
  {
    id: 'DM Sans',
    label: 'DM Sans',
    tag: 'Admin Panels',
    tagColor: '#6366f1',
    description: 'Compact and information-dense. Excellent for data-rich admin and management panels.',
    sample: 'System Overview',
    style: { fontFamily: "'DM Sans', sans-serif", fontWeight: 500 },
    googleFont: 'DM+Sans:wght@400;500;600;700'
  },
  {
    id: 'Outfit',
    label: 'Outfit',
    tag: 'Editorial / Design',
    tagColor: '#ec4899',
    description: 'Bold, editorial display with high-contrast heading weights. Design-forward and expressive.',
    sample: 'Make Something Bold',
    style: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    googleFont: 'Outfit:wght@400;500;600;700'
  },
];

export function TypographyPicker({ selectedTypography, setSelectedTypography, compact = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Load Google Fonts for all options */}
      <link
        href={`https://fonts.googleapis.com/css2?${TYPOGRAPHY_OPTIONS
          .filter(o => o.googleFont)
          .map(o => `family=${o.googleFont}`)
          .join('&')}&display=swap`}
        rel="stylesheet"
      />

      <div style={compact ? {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
      } : {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '0.85rem',
      }}>
        {TYPOGRAPHY_OPTIONS.map((opt) => {
          const isSelected = selectedTypography === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedTypography(opt.id)}
              className="active-scale-95 animate-fade-up"
              style={{
                padding: compact ? '0.5rem 0.75rem' : '1.1rem 1.25rem',
                borderRadius: compact ? '8px' : '14px',
                border: isSelected
                  ? `1.5px solid ${opt.tagColor}`
                  : '1px solid rgba(255,255,255,0.06)',
                background: isSelected
                  ? `rgba(${hexToRgb(opt.tagColor)}, 0.06)`
                  : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 18px ${opt.tagColor}22` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: compact ? '0.2rem' : '0.5rem',
              }}
            >
              {/* Mini UI preview - only in full mode */}
              {!compact && (
                <div style={{ ...opt.style, display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '0.25rem' }}>
                  <span style={{ ...opt.style, fontSize: '1rem', color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Dashboard Analytics
                  </span>
                  <span style={{ ...opt.style, fontSize: '0.68rem', fontWeight: 600, color: isSelected ? opt.tagColor : 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
                    12,453 Active Users · +5.2%
                  </span>
                  <span style={{ ...opt.style, fontSize: '0.56rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>
                    Recent Activity
                  </span>
                </div>
              )}

              {/* Name + tag */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{
                  ...opt.style,
                  fontSize: compact ? '0.78rem' : '0.82rem',
                  fontWeight: '700',
                  color: isSelected ? opt.tagColor : 'var(--foreground)',
                }}>
                  {opt.label}
                </span>
                <span style={{
                  fontSize: compact ? '0.55rem' : '0.62rem',
                  fontWeight: '600',
                  color: opt.tagColor,
                  background: `rgba(${hexToRgb(opt.tagColor)}, 0.1)`,
                  border: `1px solid rgba(${hexToRgb(opt.tagColor)}, 0.2)`,
                  borderRadius: '4px',
                  padding: compact ? '0px 4px' : '1px 6px',
                }}>
                  {compact ? opt.tag.split(' ')[0] : opt.tag}
                </span>
              </div>

              {/* Description - only in full mode */}
              {!compact && (
                <p style={{
                  fontSize: '0.72rem',
                  color: 'var(--muted-foreground)',
                  lineHeight: '1.4',
                  margin: 0,
                }}>
                  {opt.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Utility: hex color → "r, g, b" string for rgba()
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '124,58,237';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
