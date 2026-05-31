/**
 * PromptForge Design System — Programmatic Token Access
 * Single source of truth for all design decisions.
 * Use these in JS where CSS variables aren't available.
 */

export const colors = {
  // Brand
  accent: '#6843EC',
  accentForeground: '#000000',
  accentGlow: 'rgba(104,67,236,0.15)',
  accentSubtle: 'rgba(104,67,236,0.06)',

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  destructive: '#ef4444',
  info: '#3b82f6',

  // Mode accents (workflow types)
  application: '#7c3aed',
  page: '#0891b2',
  enhance: '#059669',
  component: '#db2777',

  // Dark surfaces
  dark: {
    background: '#080711',
    foreground: '#ededed',
    card: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    input: 'rgba(255,255,255,0.05)',
    muted: 'rgba(255,255,255,0.04)',
    mutedForeground: '#8a8a8a',
  },

  // Light surfaces
  light: {
    background: '#faf8f2',
    foreground: '#0a0a0a',
    card: '#ffffff',
    border: '#e8e8e8',
    input: '#f8f8f8',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
  },
};

export const typography = {
  fontDisplay: "'Darker Grotesque', system-ui, sans-serif",
  fontSans: "'Work Sans', system-ui, sans-serif",
  fontMono: "'Geist Mono', 'Fira Code', ui-monospace, monospace",

  // Scale
  displayXl: 'clamp(3rem, 6vw, 5.5rem)',
  displayLg: 'clamp(2rem, 4vw, 3.5rem)',
  displayMd: 'clamp(1.5rem, 3vw, 2rem)',
  xl: '1.25rem',
  lg: '1.125rem',
  base: '1rem',
  sm: '0.875rem',
  xs: '0.8rem',
  xxs: '0.72rem',
};

export const spacing = {
  xs: '0.375rem',
  sm: '0.625rem',
  md: '1rem',
  lg: '1.625rem',
  xl: '2.625rem',
  '2xl': '4.25rem',
  '3xl': '6.875rem',
};

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
  lg: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
  xl: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
  glow: '0 0 0 1px rgba(104,67,236,0.3), 0 0 30px rgba(104,67,236,0.1)',
};

export const motion = {
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  durationFast: '150ms',
  durationBase: '250ms',
  durationSlow: '400ms',
  // Framer Motion spring configs
  spring: { type: 'spring', stiffness: 260, damping: 20 },
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 200, damping: 15 },
};

// Human-readable mode display mapping
export const MODE_DISPLAY = {
  application: { label: 'Full-Stack App', color: colors.application },
  page: { label: 'Web Page', color: colors.page },
  enhance: { label: 'Quick Enhance', color: colors.enhance },
  component: { label: 'Component', color: colors.component },
};

// Free tier limits
export const FREE_TIER_LIMITS = {
  maxWorkspaces: 3,
};
