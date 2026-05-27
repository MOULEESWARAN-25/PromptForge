import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AuroraBackground from "@/components/AuroraBackground";
import Navigation from "@/components/Navigation";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "PromptForge | AI Prompt Architect & RAG Learning Lab",
  description: "Enhance your rough development descriptions into highly detailed technical design prompts for Lovable, Cursor, and v0.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        {/* Force Outfit for headings and Inter for body via simple style tag to guarantee absolute consistency */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-outfit), sans-serif;
          }
        `}} />
      </head>
      <body>
        <AppProvider>
          <AuroraBackground />
          <Navigation />
          <div style={layoutWrapper}>
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

const layoutWrapper = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 1rem 3rem 1rem',
  minHeight: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column',
};
