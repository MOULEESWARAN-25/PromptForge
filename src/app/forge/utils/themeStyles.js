export const getThemeCardDynamicStyles = (themeName, isSelected) => {
  const base = {
    padding: '1.5rem',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    position: 'relative',
    minHeight: '130px',
    overflow: 'hidden'
  };

  if (themeName === "Sleek Dark Glassmorphic") {
    return {
      ...base,
      background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(16px)',
      border: isSelected ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.06)',
      boxShadow: isSelected ? '0 0 25px rgba(124, 58, 237, 0.2)' : 'none',
      color: '#ffffff'
    };
  }
  if (themeName === "Cyberpunk Neon") {
    return {
      ...base,
      background: isSelected ? '#0d0d1a' : '#05050a',
      border: isSelected ? '2px solid #00ffff' : '1px dashed #ff00ff',
      boxShadow: isSelected ? '0 0 20px rgba(0, 255, 255, 0.35), inset 0 0 10px rgba(255, 0, 255, 0.2)' : 'none',
      fontFamily: 'var(--font-mono)'
    };
  }
  if (themeName === "Brutalist Bold") {
    return {
      ...base,
      background: isSelected ? '#fbbf24' : 'var(--card)',
      border: '3px solid #000000',
      borderRadius: '0px',
      boxShadow: isSelected ? '8px 8px 0px #000000' : '4px 4px 0px #000000',
      color: isSelected ? '#000000' : 'var(--foreground)'
    };
  }
  if (themeName === "Wes Anderson") {
    return {
      ...base,
      background: isSelected ? '#fed7aa' : '#ffedd5',
      border: isSelected ? '2px solid #ea580c' : '1px solid #fdba74',
      borderRadius: '8px',
      color: '#431407',
      fontFamily: 'Georgia, serif'
    };
  }
  if (themeName === "Minimalist Typography") {
    return {
      ...base,
      background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
      border: 'none',
      borderBottom: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
      borderRadius: '0px',
      color: 'var(--foreground)'
    };
  }

  return {
    ...base,
    background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)'
  };
};
