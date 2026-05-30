import React from 'react';
import { Sparkles } from 'lucide-react';
import { getThemeCardDynamicStyles } from '../utils/themeStyles';

export function ThemePreview({
  selectedTheme,
  activeMode,
  appCategory,
  pageType,
  componentType,
  customCategory,
  customComponentType
}) {
  if (!selectedTheme) return null;
  const previewStyles = getThemeCardDynamicStyles(selectedTheme, true);

  const getPreviewTitle = () => {
    if (activeMode === 'application') return appCategory === 'Custom' ? (customCategory || 'Custom Application') : (appCategory || 'Dashboard Interface');
    if (activeMode === 'page') return pageType || 'Web Page';
    return componentType === 'Custom Component' ? (customComponentType || 'Custom Component') : (componentType || 'Modular Component');
  };

  return (
    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px' }} className="animate-fade-up">
      <h4 style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)' }}>
        Real-Time Visual Style Preview
      </h4>
      <div style={{ ...previewStyles, cursor: 'default', minHeight: '180px' }} className="noise-overlay">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.7 }}>
            {getPreviewTitle()} Blueprint Preview
          </span>
          <Sparkles size={16} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            {getPreviewTitle()}
          </span>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.5' }}>
            Dynamic HSL Layout matches the {selectedTheme} theme specifications. Target configurations loaded from PromptForge pgvector terminology embeddings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <span style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
            Theme Variable Mapping
          </span>
          <span style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
            Responsive Grid
          </span>
        </div>
      </div>
    </div>
  );
}
