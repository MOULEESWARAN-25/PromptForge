import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Monitor, Layout, Code2, Wand2, Shield, Zap, Database, Check, Cpu } from 'lucide-react';

export const metadata = {
  title: "PromptForge | AI Prompt Architect",
  description: "Transform vague ideas into precision-engineered AI prompts for Cursor, Lovable, and v0. Built for developers who demand quality.",
  alternates: {
    canonical: "https://promptforge.ai",
  },
};

const FEATURES_LIST = [
  {
    slug: 'prompt-builder',
    title: 'Full SaaS Architect',
    icon: Monitor,
    desc: 'Map out entire multi-page application structures complete with database schemas and state managers.',
    img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&h=300&fit=crop&q=80',
    tag: 'Full-Stack Specs'
  },
  {
    slug: 'design-vocabulary',
    title: 'Design Vocabulary',
    icon: Database,
    desc: 'Semantically retrieve CSS layout grid structures, glassmorphism, and spring transition tokens.',
    img: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=500&h=300&fit=crop&q=80',
    tag: 'RAG Retrieval'
  },
  {
    slug: 'ai-refiner',
    title: 'Interactive Catalog',
    icon: Code2,
    desc: 'Refine single components, buttons, fields, and accordions into prompt blocks optimized for v0.',
    img: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&h=300&fit=crop&q=80',
    tag: 'Code Optimization'
  }
];

const PRICING_TIERS = [
  {
    tier: 'free',
    name: 'Hobby Plan',
    price: '$0',
    frequency: 'Forever Free',
    desc: 'Ideal for single developers exploring prompt engineering.',
    features: ['Local Storage fallbacks', 'Universal mode compilers', 'Standard vocabulary search', '3 saved workspaces'],
    accent: '#fbbf24',
    badge: 'Standard'
  },
  {
    tier: 'pro',
    name: 'Professional',
    price: '$15',
    frequency: 'per month',
    desc: 'For professional software builders demanding elite code structures.',
    features: ['Supabase cloud synchronization', 'Unlimited saved workspaces', 'Priority LLM endpoints', 'Dynamic design templates'],
    accent: '#7c3aed',
    badge: 'Recommended'
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    frequency: 'yearly contract',
    desc: 'Designed for engineering teams scaling AI code generation workflows.',
    features: ['Dedicated team vector DBs', 'Custom design systems', 'SLA support contracts', 'Self-hosted options'],
    accent: '#db2777',
    badge: 'Scale'
  }
];

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PromptForge",
    "operatingSystem": "All",
    "applicationCategory": "DeveloperApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Transform vague ideas into precision-engineered AI prompts for Cursor, Lovable, and v0. Built for developers who demand quality."
  };

  return (
    <div style={containerStyle}>
      {/* CSS Stylesheet Injector for responsive layouts and animations without overlapping */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-split-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: var(--space-xl);
          align-items: center;
          padding: var(--space-2xl) 0;
          position: relative;
        }
        .showcase-pane {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 520px;
          cursor: pointer;
        }
        .main-showcase-img {
          width: 82%;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.08) inset, 0 32px 80px rgba(0,0,0,0.7);
          position: relative;
          z-index: 10;
          transition: transform var(--duration-slow) var(--ease-spring), box-shadow var(--duration-slow) ease;
        }
        .overlapping-img-left {
          position: absolute;
          left: -40px;
          bottom: 40px;
          width: 200px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.08) inset, 0 16px 32px rgba(0,0,0,0.5);
          z-index: 20;
          transition: transform var(--duration-slow) var(--ease-spring), box-shadow var(--duration-slow) ease;
        }
        .overlapping-img-right {
          position: absolute;
          right: -20px;
          top: 30px;
          width: 220px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.08) inset, 0 16px 32px rgba(0,0,0,0.5);
          z-index: 5;
          transition: transform var(--duration-slow) var(--ease-spring), box-shadow var(--duration-slow) ease;
        }
        .showcase-pane:hover .main-showcase-img {
          transform: scale(1.02) translateY(-4px);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.12) inset, 0 40px 100px rgba(0,0,0,0.85);
        }
        .showcase-pane:hover .overlapping-img-left {
          transform: translate(-18px, 12px) scale(1.04) rotate(-2deg);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.12) inset, 0 24px 48px rgba(0,0,0,0.6);
        }
        .showcase-pane:hover .overlapping-img-right {
          transform: translate(18px, -12px) scale(1.04) rotate(2deg);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.12) inset, 0 24px 48px rgba(0,0,0,0.6);
        }
        .floating-badge {
          position: absolute;
          padding: 6px 14px;
          border-radius: 999px;
          backdrop-filter: blur(12px);
          font-size: 0.72rem;
          font-weight: 800;
          border: 1px solid;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          z-index: 30;
        }
        .fb-1 {
          top: 80px;
          left: 10px;
          color: #fbbf24;
          background: rgba(251,191,36,0.08);
          borderColor: rgba(251,191,36,0.2);
        }
        .fb-2 {
          bottom: 80px;
          right: 20px;
          color: #db2777;
          background: rgba(219,39,119,0.08);
          borderColor: rgba(219,39,119,0.2);
        }
        .feature-grid-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .pricing-grid-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .ide-comparison-grid {
          display: grid;
          grid-template-columns: 1fr auto 1.2fr;
          gap: 1.5rem;
          align-items: center;
        }
        
        /* Responsive Mobile Breaks to prevent overlaps properly */
        @media (max-width: 1024px) {
          .hero-split-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            text-align: center;
          }
          .showcase-pane {
            height: 380px;
            margin-top: 1.5rem;
          }
          .main-showcase-img {
            width: 75%;
          }
          .overlapping-img-left {
            width: 140px;
            left: 10px;
          }
          .overlapping-img-right {
            width: 150px;
            right: 10px;
          }
          .feature-grid-cards, .pricing-grid-cards {
            grid-template-columns: 1fr;
          }
          .ide-comparison-grid {
            grid-template-columns: 1fr;
          }
          .comparison-arrow {
            transform: rotate(90deg);
            margin: 0.5rem auto;
          }
        }
      ` }} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── IMMERSIVE DUAL-PANE HERO SECTION ── */}
      <section className="hero-split-grid">
        {/* Decorative Floating Arc vector */}
        <svg style={arcSvg} viewBox="0 0 520 700" fill="none" preserveAspectRatio="none">
          <path d="M500 80 Q 60 350 500 620" stroke="rgba(255,255,255,0.035)" strokeWidth="1.5" strokeDasharray="10 8" />
        </svg>

        {/* Ambient Glowing Orb Background */}
        <div style={panelOrb} />

        {/* LEFT COLUMN: Premium copy and dynamic CTA */}
        <div style={heroContentCol}>
          <div className="premium-badge animate-fade-in" style={{ marginBottom: '1.25rem', width: 'fit-content' }}>
            <Sparkles size={11} />
            <span>PROMPT ARCHITECT v2.0</span>
          </div>

          <h1 className="hero-headline animate-fade-up" style={heroHeadline}>
            Turn vague ideas <br />
            <span className="hero-gradient">into surgical</span> <br />
            AI prompts.
          </h1>

          <p style={heroParagraph} className="animate-fade-up delay-100">
            Stop writing weak descriptions. PromptForge translates developer requirements into rich Tailwind configurations, layout wireframes, and Framer Motion spring physics that AI coders digest perfectly.
          </p>

          {/* Prompt Console Form */}
          <form style={consoleForm} className="animate-fade-up delay-200" action="/auth">
            <Sparkles size={18} style={{ color: 'var(--accent)', flexShrink: 0, opacity: 0.8 }} />
            <input
              type="text"
              name="quickQuery"
              placeholder="Describe your SaaS idea..."
              style={consoleInput}
              autoComplete="off"
            />
            <button type="submit" style={forgeBtn}>
              Forge
              <ArrowRight size={13} />
            </button>
          </form>

          {/* Interactive Stable CTAs */}
          <div style={ctaRow} className="animate-fade-up delay-300">
            <Link href="/auth" style={primaryCta} className="btn-accent shine-effect">
              Get Started for Free
              <ArrowRight size={15} />
            </Link>
            <a href="#pricing" style={secondaryCta} className="btn-secondary">
              View Premium Plans
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Multi-layered overlapping images (Auth carousel aesthetic) */}
        <div className="showcase-pane animate-scale-in">
          {/* Main Code Editor Showcase Mockup */}
          <div className="main-showcase-img" style={browserMockupFrame}>
            <div style={browserHeader}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                  <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={browserUrl}>promptforge.ai/editor</div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=500&fit=crop&q=85" 
              alt="Workspace Code Blueprint View"
              style={browserImage}
            />
          </div>

          {/* Overlapping Image 2 (RAG Pipeline Visualizer Overlay) */}
          <div className="overlapping-img-left" style={browserMockupFrame}>
            <div style={browserHeaderSmall}>
              <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>Local RAG pipeline</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=450&h=300&fit=crop&q=85" 
              alt="Design Token Database"
              style={browserImage}
            />
          </div>

          {/* Overlapping Image 3 (Sketching UI Architect Overlay) */}
          <div className="overlapping-img-right" style={browserMockupFrame}>
            <div style={browserHeaderSmall}>
              <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>Wireframe Catalog</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=450&h=300&fit=crop&q=85" 
              alt="Wireframe Wireframes Sketching"
              style={browserImage}
            />
          </div>

          {/* Floating Badges */}
          <div className="floating-badge fb-1">
            <Cpu size={12} />
            <span>Cosine Retrieval</span>
          </div>
          <div className="floating-badge fb-2">
            <Sparkles size={12} />
            <span>Framer Motion Physics</span>
          </div>
        </div>
      </section>

      {/* ── KEY CAPABILITIES FEATURE SECTION ── */}
      <section id="features" style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label">PRODUCT CAPABILITIES</p>
          <h2 style={sectionTitle}>Tailored Feature Layouts</h2>
        </div>
        <div className="feature-grid-cards">
          {FEATURES_LIST.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.slug} style={featureCard} className="glass-panel">
                {/* Feature mockup browser frame */}
                <div style={featureImageFrame}>
                  <div style={browserHeaderSmall}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{feat.tag}</span>
                  </div>
                  <img src={feat.img} alt={feat.title} style={featureCardImage} />
                </div>
                
                <div style={{ padding: '1rem' }}>
                  <div style={featureCardHead}>
                    <div style={iconWrap}>
                      <Icon size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 style={featureTitle}>{feat.title}</h3>
                  </div>
                  <p style={featureDesc}>{feat.desc}</p>
                  <Link href={`/features/${feat.slug}`} style={featureLink}>
                    Explore technical docs <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── BEFORE & AFTER TRANSLATION BLUEPRINT ── */}
      <section style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label">HOW IT WORKS</p>
          <h2 style={sectionTitle}>Vague Intent → Rich Spec translation</h2>
        </div>
        <div className="ide-comparison-grid glass-panel" style={previewSection}>
          {/* Left panel: Draft User Query */}
          <div style={previewBox}>
            <div style={previewBoxHeader}>
              <span style={{ color: 'var(--muted-foreground)' }}>user_prompt.txt</span>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <p style={previewBoxText}>
                "Build a premium dark-mode SaaS dashboard with glassmorphism cards and smooth entrance motions."
              </p>
            </div>
          </div>

          {/* Center Connection Icon */}
          <div className="comparison-arrow" style={previewArrowWrap}>
            <Zap size={22} style={{ color: 'var(--accent)' }} />
          </div>

          {/* Right panel: Enhanced Prompt Output */}
          <div style={{ ...previewBox, borderLeft: '1px solid var(--border)' }}>
            <div style={previewBoxHeader}>
              <span style={{ color: 'var(--accent)' }}>promptforge_enhanced_spec.xml</span>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <pre style={previewCode}>
{`<design_system>
  <theme>Sleek Dark Glassmorphism</theme>
  <tokens>
    <background>#000000</background>
    <card_bg>rgba(255,255,255,0.04)</card_bg>
    <backdrop_blur>24px</backdrop_blur>
    <border>1px solid rgba(255,255,255,0.08)</border>
  </tokens>
  <motion_curve>
    <type>spring</type>
    <stiffness>260</stiffness>
    <damping>20</damping>
  </motion_curve>
</design_system>`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESIGN PRESETS / PRICING TIERS ── */}
      <section id="pricing" style={sectionContainer}>
        <div style={sectionHeader}>
          <p className="section-label">PAYMENT MATRIX</p>
          <h2 style={sectionTitle}>Flexible SaaS Subscriptions</h2>
        </div>
        <div className="pricing-grid-cards">
          {PRICING_TIERS.map((tier) => (
            <div 
              key={tier.tier} 
              style={{ ...pricingCard, border: `1px solid ${tier.tier === 'pro' ? 'rgba(124,58,237,0.3)' : 'var(--border)'}` }} 
              className="glass-panel"
            >
              {/* Central high-fidelity glow blob for the pro plan */}
              {tier.tier === 'pro' && <div style={pricingProGlow} />}

              <div style={pricingCardTop}>
                <span style={{ ...pricingName, color: tier.accent }}>{tier.name}</span>
                <span style={{ ...pricingBadgePill, background: `${tier.accent}12`, color: tier.accent, borderColor: `${tier.accent}25` }}>
                  {tier.badge}
                </span>
              </div>

              <div style={priceRow}>
                <span style={priceText}>{tier.price}</span>
                {tier.price !== 'Custom' && <span style={priceSub}>/ month</span>}
              </div>

              <p style={pricingDesc}>{tier.desc}</p>
              
              <div style={featureListStyle}>
                {tier.features.map((f, i) => (
                  <div key={i} style={featureItemStyle}>
                    <Check size={13} style={{ color: tier.accent, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem' }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href={`/pricing/${tier.tier}`} style={pricingCtaBtn(tier.tier === 'pro', tier.accent)}>
                Get Plan Details
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Inline Styling Tokens (Neo-Noir & Premium Glassmorphism) ───

const containerStyle = {
  position: 'relative',
  zIndex: 2,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3xl)',
  paddingTop: 'var(--space-md)',
  overflow: 'hidden',
};

const arcSvg = {
  position: 'absolute',
  top: '30px',
  right: '10%',
  width: '450px',
  height: '600px',
  zIndex: 1,
  opacity: 0.6,
  pointerEvents: 'none',
};

const panelOrb = {
  position: 'absolute',
  top: '15%',
  right: '5%',
  width: '580px',
  height: '580px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)',
  filter: 'blur(40px)',
  zIndex: 1,
  pointerEvents: 'none',
};

const heroContentCol = {
  display: 'flex',
  flexDirection: 'column',
  zIndex: 10,
};

const heroHeadline = {
  fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  lineHeight: '1.08',
  letterSpacing: '-0.04em',
  color: 'var(--foreground)',
  marginBottom: 'var(--space-md)',
};

const heroParagraph = {
  fontSize: '1.05rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.75',
  maxWidth: '520px',
  marginBottom: 'var(--space-lg)',
};

const consoleForm = {
  width: '100%',
  maxWidth: '520px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  padding: '0 0.5rem 0 1.15rem',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1.5px solid var(--border)',
  borderRadius: '12px',
  boxShadow: 'var(--shadow-md)',
  marginBottom: 'var(--space-lg)',
};

const consoleInput = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '0.9rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
};

const forgeBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 1rem',
  background: 'var(--accent)',
  color: 'var(--accent-foreground)',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: '700',
  cursor: 'pointer',
  flexShrink: 0,
};

const ctaRow = {
  display: 'flex',
  gap: '0.85rem',
  flexWrap: 'wrap',
};

const primaryCta = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.8rem 1.6rem',
  fontSize: '0.9rem',
  fontWeight: '700',
  borderRadius: '10px',
  textDecoration: 'none',
  boxShadow: 'var(--shadow-md)',
};

const secondaryCta = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.8rem 1.6rem',
  fontSize: '0.9rem',
  fontWeight: '600',
  borderRadius: '10px',
  textDecoration: 'none',
};

// ─── browser Mockup Styles ───
const browserMockupFrame = {
  background: 'var(--card)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'var(--shadow-lg)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const browserHeader = {
  padding: '0.6rem 1rem',
  background: 'rgba(255, 255, 255, 0.02)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const browserHeaderSmall = {
  padding: '0.4rem 0.75rem',
  background: 'rgba(255, 255, 255, 0.02)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const browserUrl = {
  fontSize: '0.65rem',
  color: 'var(--muted-foreground)',
  opacity: 0.5,
  background: 'rgba(0,0,0,0.15)',
  padding: '1px 12px',
  borderRadius: '999px',
};

const browserImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

// ─── Section Header ───
const sectionContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
  padding: 'var(--space-2xl) 0',
  position: 'relative',
};

const sectionHeader = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
};

const sectionTitle = {
  fontSize: '1.65rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.025em',
};

// ─── Feature Card styling ───
const featureCard = {
  background: 'var(--card)',
  borderRadius: '16px',
  border: '1px solid var(--border)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'var(--shadow-sm)',
  transition: 'transform 0.3s ease, border-color 0.3s ease',
};

const featureImageFrame = {
  width: '100%',
  borderBottom: '1px solid var(--border)',
  overflow: 'hidden',
};

const featureCardImage = {
  width: '100%',
  height: '160px',
  objectFit: 'cover',
  display: 'block',
};

const featureCardHead = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  marginBottom: '0.5rem',
};

const iconWrap = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'var(--accent-subtle)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const featureTitle = {
  fontSize: '1rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.015em',
};

const featureDesc = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
  marginBottom: '1rem',
};

const featureLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.78rem',
  fontWeight: '700',
  color: 'var(--accent)',
  textDecoration: 'none',
};

// ─── Comparison Terminal styling ───
const previewSection = {
  background: 'var(--card)',
  borderRadius: '16px',
  border: '1px solid var(--border)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
};

const previewBox = {
  display: 'flex',
  flexDirection: 'column',
};

const previewBoxHeader = {
  padding: '0.6rem 1.25rem',
  background: 'rgba(255, 255, 255, 0.02)',
  borderBottom: '1px solid var(--border)',
  fontSize: '0.68rem',
  fontWeight: '800',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const previewBoxText = {
  fontSize: '0.88rem',
  lineHeight: '1.65',
  color: 'var(--foreground)',
  fontStyle: 'italic',
};

const previewArrowWrap = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem',
};

const previewCode = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  color: 'var(--foreground)',
  lineHeight: '1.5',
  margin: 0,
};

// ─── Pricing Card styling ───
const pricingCard = {
  padding: 'var(--space-xl) var(--space-lg)',
  background: 'var(--card)',
  borderRadius: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-md)',
};

const pricingProGlow = {
  position: 'absolute',
  top: '-40%',
  right: '-30%',
  width: '280px',
  height: '280px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const pricingCardTop = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const pricingName = {
  fontSize: '0.78rem',
  fontWeight: '800',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const pricingBadgePill = {
  fontSize: '0.68rem',
  fontWeight: '700',
  padding: '2px 8px',
  borderRadius: '999px',
  border: '1px solid',
};

const priceRow = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.25rem',
};

const priceText = {
  fontSize: '2.25rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.02em',
};

const priceSub = {
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
};

const pricingDesc = {
  fontSize: '0.82rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.45',
};

const featureListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
  margin: '0.75rem 0',
  flex: 1,
};

const featureItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'var(--foreground)',
};

const pricingCtaBtn = (isPro, accentColor) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.7rem 1.25rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  borderRadius: '8px',
  textDecoration: 'none',
  textAlign: 'center',
  transition: 'opacity 0.2s',
  background: isPro ? accentColor : 'var(--muted)',
  color: isPro ? 'var(--accent-foreground)' : 'var(--foreground)',
  border: isPro ? 'none' : '1px solid var(--border)',
  marginTop: '0.5rem',
});
