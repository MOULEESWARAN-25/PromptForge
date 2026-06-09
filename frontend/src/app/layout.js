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
  title: "Veyntra - Developer Intent Compiler",
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


