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

  // 1. Sleek Dark Glassmorphic
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

  // 2. Cyberpunk Neon
  if (themeName === "Cyberpunk Neon") {
    return {
      ...base,
      background: isSelected ? '#0d0d1a' : '#05050a',
      border: isSelected ? '2px solid #00ffff' : '1px dashed #ff00ff',
      boxShadow: isSelected ? '0 0 20px rgba(0, 255, 255, 0.35), inset 0 0 10px rgba(255, 0, 255, 0.2)' : 'none',
      color: '#00ffff',
      fontFamily: 'var(--font-mono)'
    };
  }

  // 3. Brutalist Bold
  if (themeName === "Brutalist Bold") {
    return {
      ...base,
      background: isSelected ? '#fbbf24' : 'var(--card)',
      border: '3px solid #000000',
      borderRadius: '0px',
      boxShadow: isSelected ? '8px 8px 0px #000000' : '4px 4px 0px #000000',
      color: isSelected ? '#000000' : 'var(--foreground)',
      fontFamily: 'var(--font-mono)'
    };
  }

  // 4. Wes Anderson Retro
  if (themeName === "Wes Anderson" || themeName === "Wes Anderson Retro") {
    return {
      ...base,
      background: isSelected ? '#fed7aa' : '#ffedd5',
      border: isSelected ? '2px solid #ea580c' : '1px solid #fdba74',
      borderRadius: '8px',
      color: '#431407',
      fontFamily: 'Georgia, serif'
    };
  }

  // 5. Minimalist Typography
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

  // 6. Luxury Gold
  if (themeName === "Luxury Gold") {
    return {
      ...base,
      background: isSelected ? '#121212' : '#0a0a0a',
      border: isSelected ? '1px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.2)',
      boxShadow: isSelected ? '0 0 15px rgba(212, 175, 55, 0.15)' : 'none',
      color: '#f5f5f0',
      fontFamily: 'Georgia, serif'
    };
  }

  // 7. Modern Dashboard
  if (themeName === "Modern Dashboard") {
    return {
      ...base,
      background: isSelected ? '#1e293b' : '#0f172a',
      border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: isSelected ? '0 4px 20px rgba(59, 130, 246, 0.15)' : 'none',
      color: '#f8fafc'
    };
  }

  // 8. Analytics Platform
  if (themeName === "Analytics Platform") {
    return {
      ...base,
      background: isSelected ? '#1f2937' : '#111827',
      border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.04)',
      boxShadow: isSelected ? '0 0 15px rgba(16, 185, 129, 0.1)' : 'none',
      color: '#f9fafb'
    };
  }

  // 9. Stripe Inspired
  if (themeName === "Stripe Inspired") {
    return {
      ...base,
      background: isSelected ? '#ffffff' : '#f8fafc',
      border: isSelected ? '1px solid #6366f1' : '1px solid #e2e8f0',
      boxShadow: isSelected ? '0 10px 25px -5px rgba(99, 102, 241, 0.15), 0 8px 10px -6px rgba(99, 102, 241, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      color: '#0f172a'
    };
  }

  // 10. Terminal Workspace
  if (themeName === "Terminal" || themeName === "Terminal Workspace") {
    return {
      ...base,
      background: '#000000',
      border: isSelected ? '1px solid #22c55e' : '1px solid rgba(34, 197, 94, 0.3)',
      boxShadow: isSelected ? '0 0 15px rgba(34, 197, 94, 0.3)' : 'none',
      color: '#22c55e',
      fontFamily: 'var(--font-mono)'
    };
  }

  // 11. Gaming Console
  if (themeName === "Gaming Console") {
    return {
      ...base,
      background: isSelected ? '#27272a' : '#18181b',
      border: isSelected ? '2px solid #ea580c' : '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: isSelected ? '0 0 20px rgba(234, 88, 12, 0.25)' : 'none',
      color: '#f4f4f5'
    };
  }

  // 12. Data Visualization
  if (themeName === "Data Visualization") {
    return {
      ...base,
      background: isSelected ? '#1e1b4b' : '#0f172a',
      border: isSelected ? '1px solid #f43f5e' : '1px solid rgba(244, 63, 94, 0.2)',
      boxShadow: isSelected ? '0 0 15px rgba(244, 63, 94, 0.15)' : 'none',
      color: '#f8fafc'
    };
  }

  // 13. Notion Style
  if (themeName === "Notion Style") {
    return {
      ...base,
      background: '#ffffff',
      border: isSelected ? '2px solid #37352f' : '1px solid #e1e1e0',
      borderRadius: '4px',
      color: '#37352f',
      boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
    };
  }

  // 14. Linear Style
  if (themeName === "Linear Style") {
    return {
      ...base,
      background: isSelected ? '#161618' : '#0c0c0d',
      border: isSelected ? '1px solid #5b21b6' : '1px solid rgba(255, 255, 255, 0.04)',
      boxShadow: isSelected ? '0 8px 30px rgba(0, 0, 0, 0.5)' : 'none',
      color: '#f3f4f6'
    };
  }

  // 15. Apple Inspired
  if (themeName === "Apple Inspired") {
    return {
      ...base,
      background: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(20px)',
      border: isSelected ? '1.5px solid #0071e3' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: isSelected ? '0 10px 30px rgba(0,0,0,0.06)' : '0 4px 12px rgba(0,0,0,0.02)',
      color: '#1d1d1f'
    };
  }

  // 16. Material Design
  if (themeName === "Material Design") {
    return {
      ...base,
      background: isSelected ? '#e0e7ff' : '#f3f4f6',
      border: 'none',
      borderRadius: '24px',
      boxShadow: isSelected ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      color: '#1e1b4b'
    };
  }

  // 17. Neo Brutalism
  if (themeName === "Neo Brutalism") {
    return {
      ...base,
      background: isSelected ? '#facc15' : '#67e8f9',
      border: '3px solid #000000',
      borderRadius: '12px',
      boxShadow: isSelected ? '6px 6px 0px #000000' : '3px 3px 0px #000000',
      color: '#000000',
      fontFamily: 'var(--font-mono)'
    };
  }

  // 18. Healthcare Clean
  if (themeName === "Healthcare Clean") {
    return {
      ...base,
      background: '#ffffff',
      border: isSelected ? '2px solid #0284c7' : '1px solid #e0f2fe',
      borderRadius: '12px',
      color: '#0f172a',
      boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.08)' : 'none'
    };
  }

  // 19. Education Classic
  if (themeName === "Education Classic") {
    return {
      ...base,
      background: isSelected ? '#fffbeb' : '#fafaf9',
      border: isSelected ? '2px solid #991b1b' : '1px solid #e7e5e4',
      borderRadius: '4px',
      color: '#1c1917',
      fontFamily: 'Georgia, serif'
    };
  }

  // 20. Enterprise Slate
  if (themeName === "Enterprise Slate") {
    return {
      ...base,
      background: isSelected ? '#f1f5f9' : '#ffffff',
      border: isSelected ? '2px solid #475569' : '1px solid #cbd5e1',
      borderRadius: '6px',
      color: '#0f172a'
    };
  }

  // 21. Cyberpunk Red
  if (themeName === "Cyberpunk Red") {
    return {
      ...base,
      background: isSelected ? '#1a0505' : '#050000',
      border: isSelected ? '2px solid #ef4444' : '1px dashed #7f1d1d',
      boxShadow: isSelected ? '0 0 20px rgba(239, 68, 68, 0.35)' : 'none',
      color: '#ef4444',
      fontFamily: 'var(--font-mono)'
    };
  }

  // 22. Nordic Forest
  if (themeName === "Nordic Forest") {
    return {
      ...base,
      background: isSelected ? '#064e3b' : '#022c22',
      border: isSelected ? '1px solid #34d399' : '1px solid rgba(52, 211, 153, 0.2)',
      color: '#ecfdf5'
    };
  }

  // 23. Sunset Warmth
  if (themeName === "Sunset Warmth") {
    return {
      ...base,
      background: isSelected ? '#ffedd5' : '#fff7ed',
      border: isSelected ? '2px solid #ea580c' : '1px solid #ffedd5',
      color: '#431407'
    };
  }

  // 24. Ocean Breeze
  if (themeName === "Ocean Breeze") {
    return {
      ...base,
      background: isSelected ? '#e0f2fe' : '#f0f9ff',
      border: isSelected ? '2px solid #0284c7' : '1px solid #bae6fd',
      color: '#0369a1'
    };
  }

  // 25. Cyber Grid
  if (themeName === "Cyber Grid") {
    return {
      ...base,
      background: isSelected ? '#0f172a' : '#020617',
      border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(6, 182, 212, 0.2)',
      boxShadow: isSelected ? '0 0 15px rgba(6, 182, 212, 0.15)' : 'none',
      color: '#06b6d4',
      fontFamily: 'var(--font-mono)'
    };
  }

  return {
    ...base,
    background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)'
  };
};
