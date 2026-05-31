import { 
  Inter, 
  Manrope, 
  DM_Sans, 
  Outfit, 
  Plus_Jakarta_Sans, 
  Space_Grotesk, 
  Sora, 
  Poppins, 
  Nunito, 
  Urbanist, 
  IBM_Plex_Sans, 
  JetBrains_Mono, 
  Recursive,
  Syne,
  Playfair_Display,
  Lexend
} from 'next/font/google';

export const fontInter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
export const fontManrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
export const fontDmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
export const fontOutfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
export const fontPlusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta-sans', display: 'swap' });
export const fontSpaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
export const fontSora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });
export const fontPoppins = Poppins({ subsets: ['latin'], variable: '--font-poppins', weight: ['400', '500', '600', '700'], display: 'swap' });
export const fontNunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' });
export const fontUrbanist = Urbanist({ subsets: ['latin'], variable: '--font-urbanist', display: 'swap' });
export const fontIbmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-ibm-plex-sans', weight: ['400', '500', '600', '700'], display: 'swap' });
export const fontJetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });
export const fontRecursive = Recursive({ subsets: ['latin'], variable: '--font-recursive', display: 'swap' });
export const fontSyne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' });
export const fontPlayfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair-display', display: 'swap' });
export const fontLexend = Lexend({ subsets: ['latin'], variable: '--font-lexend', display: 'swap' });

// Geist is loaded automatically by Next.js if we use standard imports, but if Next.js version doesn't support local loader, we use its Google Font equivalent or local font. 
// We will export a clean helper mapper for font inline-styles
export const FONT_VARIABLES = {
  'Inter': 'var(--font-inter), sans-serif',
  'Geist': 'var(--font-display), monospace', // fallback to our premium preloaded display Grotesk
  'Manrope': 'var(--font-manrope), sans-serif',
  'DM Sans': 'var(--font-dm-sans), sans-serif',
  'Outfit': 'var(--font-outfit), sans-serif',
  'Plus Jakarta Sans': 'var(--font-plus-jakarta-sans), sans-serif',
  'Space Grotesk': 'var(--font-space-grotesk), sans-serif',
  'Sora': 'var(--font-sora), sans-serif',
  'Poppins': 'var(--font-poppins), sans-serif',
  'Nunito': 'var(--font-nunito), sans-serif',
  'Urbanist': 'var(--font-urbanist), sans-serif',
  'General Sans': 'var(--font-lexend), sans-serif', // premium high-contrast fallback
  'Cabinet Grotesk': 'var(--font-syne), sans-serif', // premium high-contrast fallback
  'Clash Display': 'var(--font-outfit), sans-serif', // premium high-contrast fallback
  'IBM Plex Sans': 'var(--font-ibm-plex-sans), sans-serif',
  'JetBrains Mono': 'var(--font-jetbrains-mono), monospace',
  'Recursive': 'var(--font-recursive), monospace'
};
