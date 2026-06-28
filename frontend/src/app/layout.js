import { Inter, Darker_Grotesque, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AuroraBackground from "@/components/AuroraBackground";
import Navigation from "@/components/Navigation";
import { Toaster } from "sonner";
import OfflineBanner from "@/components/OfflineBanner";

/**
 * Inter — Primary application font for all authenticated views.
 * Applied globally to body, inputs, buttons, labels, and navigation.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/**
 * Darker Grotesque — Display font for the Landing page only.
 * Applied via the .landing-page CSS class, NOT applied to body globally.
 */
const darkerGrotesque = Darker_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

/**
 * Geist Mono — Monospaced font for code elements and configuration blocks.
 */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={`${inter.variable} ${darkerGrotesque.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme initializer: reads localStorage before first paint to prevent FOUC */}
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
          <main
            id="main-content"
            className="w-full flex flex-col min-h-[calc(100dvh-var(--nav-height,64px))]"
          >
            {children}
          </main>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: 'var(--radius-lg)',
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


