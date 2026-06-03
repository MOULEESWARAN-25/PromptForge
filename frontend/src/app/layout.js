import { Work_Sans, Darker_Grotesque } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AuroraBackground from "@/components/AuroraBackground";
import Navigation from "@/components/Navigation";
import { Toaster } from "sonner";
import OfflineBanner from "@/components/OfflineBanner";
import { 
  fontInter,
  fontManrope,
  fontDmSans,
  fontOutfit,
  fontPlusJakartaSans,
  fontSpaceGrotesk,
  fontSora,
  fontPoppins,
  fontNunito,
  fontUrbanist,
  fontIbmPlexSans,
  fontJetBrainsMono,
  fontRecursive,
  fontSyne,
  fontPlayfairDisplay,
  fontLexend
} from "@/lib/fonts";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const darkerGrotesque = Darker_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "Veyntra — Developer Intent Compiler",
  description: "Transform Vision Into Software. Compile ideas into architecture, specifications, components, pages, and applications for Cursor, Bolt, Lovable, and v0.",
  keywords: ["Veyntra", "intent compilation", "architecture synthesis", "specification compilation", "Cursor", "Lovable", "v0", "Bolt", "RAG"],
  metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_APP_DOMAIN || "veyntra.vercel.app"}`),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Veyntra — Developer Intent Compiler",
    description: "Transform Vision Into Software. Compile ideas into architecture, specifications, components, pages, and applications for Cursor, Bolt, Lovable, and v0.",
    url: `https://${process.env.NEXT_PUBLIC_APP_DOMAIN || "veyntra.vercel.app"}`,
    siteName: "Veyntra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyntra — Developer Intent Compiler",
    description: "Transform Vision Into Software. Compile ideas into architecture, specifications, components, pages, and applications for Cursor, Bolt, Lovable, and v0.",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${darkerGrotesque.variable} ${fontInter.variable} ${fontManrope.variable} ${fontDmSans.variable} ${fontOutfit.variable} ${fontPlusJakartaSans.variable} ${fontSpaceGrotesk.variable} ${fontSora.variable} ${fontPoppins.variable} ${fontNunito.variable} ${fontUrbanist.variable} ${fontIbmPlexSans.variable} ${fontJetBrainsMono.variable} ${fontRecursive.variable} ${fontSyne.variable} ${fontPlayfairDisplay.variable} ${fontLexend.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-initializer"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: `
            (function() {
              try {
                var savedTheme = localStorage.getItem('promptforge_theme') || 'dark';
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          ` }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          body, button, input, textarea, select, label, p, span, li, a {
            font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-feature-settings: 'ss01', 'cv01';
          }
          h1, h2, h3, h4, h5, h6, .display-font, .hero-headline, .display-xl, .display-lg, .display-md {
            font-family: var(--font-display), var(--font-sans), system-ui, sans-serif;
            letter-spacing: -0.02em;
            font-weight: 800;
          }
        ` }} />
      </head>
      <body>
        {/* Skip-to-content link for keyboard/screen reader accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AppProvider>
          <OfflineBanner />
          <AuroraBackground />
          <Navigation />
          <main id="main-content" style={mainWrapper}>
            {children}
          </main>
          <footer style={globalFooterStyle}>
            <div style={globalFooterBadge}>
              <span style={badgeBeta}>Beta</span>
              <span style={badgeDivider}>|</span>
              <span style={badgeBrand}>Veyntra</span>
              <span style={badgeDivider}>—</span>
              <span style={badgeTagline}>Transform Vision Into Software</span>
            </div>
          </footer>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
              },
            }}
            richColors
            closeButton
          />
        </AppProvider>
      </body>
    </html>
  );
}

const mainWrapper = {
  width: '100%',
  minHeight: 'calc(100dvh - 100px)',
  display: 'flex',
  flexDirection: 'column',
};

const globalFooterStyle = {
  width: "100%",
  padding: "2rem 1.5rem 2.5rem 1.5rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "transparent",
  zIndex: 10,
  marginTop: "auto",
};

const globalFooterBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.35rem 0.75rem",
  borderRadius: "999px",
  background: "var(--input)",
  border: "1px solid var(--border)",
  fontSize: "0.75rem",
  color: "var(--muted-foreground)",
  fontWeight: "500",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

const badgeBeta = {
  fontWeight: "800",
  fontSize: "0.65rem",
  textTransform: "uppercase",
  color: "var(--accent)",
  background: "color-mix(in srgb, var(--accent) 10%, transparent)",
  padding: "0.1rem 0.4rem",
  borderRadius: "999px",
  letterSpacing: "0.05em",
};

const badgeDivider = {
  color: "var(--border)",
  userSelect: "none",
};

const badgeBrand = {
  fontWeight: "800",
  color: "var(--foreground)",
};

const badgeTagline = {
  fontWeight: "500",
};
