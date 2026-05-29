import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AuroraBackground from "@/components/AuroraBackground";
import Navigation from "@/components/Navigation";
import { Toaster } from "sonner";
import OfflineBanner from "@/components/OfflineBanner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "PromptForge | AI Prompt Architect",
  description: "Transform vague ideas into precision-engineered AI prompts for Cursor, Lovable, and v0. Built for developers who demand quality.",
  keywords: ["AI prompts", "prompt engineering", "Cursor", "Lovable", "v0", "RAG"],
  metadataBase: new URL("https://promptforge.ai"),
  alternates: {
    canonical: "/",
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
      className={`${plusJakartaSans.variable} ${bricolageGrotesque.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          body, button, input, textarea, select, label, p, span, li, a {
            font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          }
          h1, h2, h3, h4, h5, h6, .display-font, .hero-headline, .display-xl, .display-lg, .display-md {
            font-family: var(--font-display), var(--font-sans), system-ui, sans-serif;
            letter-spacing: -0.03em;
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
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 1.5rem 4rem 1.5rem',
  minHeight: 'calc(100dvh - 100px)',
  display: 'flex',
  flexDirection: 'column',
};
