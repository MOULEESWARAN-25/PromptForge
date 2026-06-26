// Geist is loaded automatically by Next.js if we use standard imports, but if Next.js version doesn't support local loader, we use its Google Font equivalent or local font. 
// We will export a clean helper mapper for font inline-styles
export const FONT_VARIABLES = {
  'Inter': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'Geist': 'var(--font-display), monospace', // fallback to our premium preloaded display Grotesk
  'Manrope': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'DM Sans': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'Outfit': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'Plus Jakarta Sans': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'Space Grotesk': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'Sora': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'Poppins': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'Nunito': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'Urbanist': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'General Sans': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', // premium high-contrast fallback
  'Cabinet Grotesk': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', // premium high-contrast fallback
  'Clash Display': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', // premium high-contrast fallback
  'IBM Plex Sans': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'JetBrains Mono': 'monospace',
  'Recursive': 'monospace'
};

