import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { themeStyles } from '@/data/designVocabulary';
import { getThemeCardDynamicStyles } from '../utils/themeStyles';
import { ThemePreview } from './ThemePreview';

export function ThemeSelector({
  selectedTheme,
  setSelectedTheme,
  activeMode,
  appCategory,
  pageType,
  componentType,
  customCategory,
  customComponentType,
  hidePreview = false,
  compact = false
}) {
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

  const themeHeaderRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const themeCardName = {
    fontSize: compact ? '0.78rem' : '0.95rem',
    letterSpacing: '-0.01em'
  };

  const themeCardDescText = {
    fontSize: '0.8rem',
    lineHeight: '1.4'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0.5rem' : '1rem' }}>
      <div style={themeCardGrid}>
        {Object.keys(themeStyles).map((themeName) => {
          const isSelected = selectedTheme === themeName;
          const baseStyles = getThemeCardDynamicStyles(themeName, isSelected);
          const cardStyles = {
            ...baseStyles,
            ...(compact ? {
              padding: '0.5rem 0.75rem',
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
              className="bento-card-premium glow-card-spotlight active-scale-95 animate-fade-up"
            >
              <div style={themeHeaderRow}>
                <span style={{ ...themeCardName, color: isSelected ? 'inherit' : 'var(--foreground)', fontWeight: '750' }}>
                  {themeName}
                </span>
                {isSelected && <CheckCircle2 size={14} style={{ color: '#fbbf24' }} />}
              </div>
              {!compact && (
                <p style={{ ...themeCardDescText, color: isSelected ? 'inherit' : 'var(--muted-foreground)', opacity: 0.8 }}>
                  {themeStyles[themeName].description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!hidePreview && (
        <ThemePreview
          selectedTheme={selectedTheme}
          activeMode={activeMode}
          appCategory={appCategory}
          pageType={pageType}
          componentType={componentType}
          customCategory={customCategory}
          customComponentType={customComponentType}
        />
      )}
    </div>
  );
}
