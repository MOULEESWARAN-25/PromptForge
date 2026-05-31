"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Monitor, Code2, 
  Wand2, Shield, Zap, Database, Check, Cpu, FileText 
} from 'lucide-react';


const FEATURES_LIST = [
  {
    slug: 'prompt-builder',
    title: 'Full SaaS Architect',
    icon: Monitor,
    desc: 'Map out entire multi-page application structures complete with database schemas and state managers.',
    img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&h=300&fit=crop&q=80',
    tag: 'Full-Stack Specs',
    gridClass: 'col-span-2'
  },
  {
    slug: 'design-vocabulary',
    title: 'Design Tokens',
    icon: Database,
    desc: 'Semantically retrieve CSS layout grid structures, glassmorphism, and spring transition tokens.',
    img: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=500&h=300&fit=crop&q=80',
    tag: 'Style Tokens',
    gridClass: 'col-span-1'
  },
  {
    slug: 'ai-refiner',
    title: 'Interactive Catalog',
    icon: Code2,
    desc: 'Refine single components, buttons, fields, and accordions into prompt blocks optimized for v0.',
    img: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&h=300&fit=crop&q=80',
    tag: 'Code Optimization',
    gridClass: 'col-span-3'
  }
];



const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 35 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 15 } }
};

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
      {/* Dynamic CSS styles for Bento Grids & overlaps */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-split-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: var(--space-2xl);
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
        }
        .main-showcase-img {
          width: 82%;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.08) inset, 0 32px 80px rgba(0,0,0,0.7);
          position: relative;
          z-index: 10;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }
        .overlapping-img-left {
          position: absolute;
          left: -30px;
          bottom: 50px;
          width: 190px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.08) inset, 0 16px 32px rgba(0,0,0,0.5);
          z-index: 20;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }
        .overlapping-img-right {
          position: absolute;
          right: -10px;
          top: 40px;
          width: 200px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.08) inset, 0 16px 32px rgba(0,0,0,0.5);
          z-index: 5;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }
        .showcase-pane:hover .main-showcase-img {
          transform: scale(1.03) translateY(-6px);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.12) inset, 0 40px 100px rgba(0,0,0,0.85);
        }
        .showcase-pane:hover .overlapping-img-left {
          transform: translate(-15px, 10px) scale(1.05) rotate(-3deg);
          box-shadow: 0 1px 0 0 rgba(255,255,255,0.12) inset, 0 24px 48px rgba(0,0,0,0.6);
        }
        .showcase-pane:hover .overlapping-img-right {
          transform: translate(15px, -10px) scale(1.05) rotate(3deg);
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
          top: 90px;
          left: 20px;
          color: #6843EC;
          background: rgba(104,67,236,0.08);
          borderColor: rgba(104,67,236,0.2);
        }
        .fb-2 {
          bottom: 90px;
          right: 30px;
          color: #7c3aed;
          background: rgba(124,58,237,0.08);
          borderColor: rgba(124,58,237,0.2);
        }
        .feature-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .bento-card-wrapper {
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm), inset 0 1px 1px rgba(255, 255, 255, 0.03);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .dark .bento-card-wrapper {
          background: rgba(10, 10, 15, 0.4);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.02);
        }
        .col-span-2 {
          grid-column: span 2 / span 2;
        }
        .col-span-1 {
          grid-column: span 1 / span 1;
        }
        .col-span-3 {
          grid-column: span 3 / span 3;
          flex-direction: row !important;
          align-items: center;
        }
        .col-span-3 .bento-img-container {
          width: 45%;
          height: 100% !important;
          min-height: 240px;
          border-bottom: none !important;
          border-right: 1px solid var(--border);
        }
        .col-span-3 .bento-body {
          flex: 1;
          padding: 2rem !important;
        }
        .bento-card-wrapper:hover {
          border-color: var(--accent);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), 0 0 24px var(--accent-glow);
        }
        .bento-img-container {
          width: 100%;
          height: 180px;
          overflow: hidden;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        .bento-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-card-wrapper:hover .bento-img {
          transform: scale(1.05);
        }
        .pricing-grid-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .ide-comparison-grid {
          display: grid;
          grid-template-columns: 1fr auto 1.2fr;
          gap: 1.5rem;
          align-items: center;
        }
        @media (max-width: 1150px) {
          .hero-split-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            text-align: center;
          }
          /* Center elements inside stacked hero column */
          .console-form-responsive {
            margin-left: auto;
            margin-right: auto;
          }
          .cta-row-responsive {
            justify-content: center;
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
          .feature-bento-grid {
            grid-template-columns: 1fr;
          }
          .col-span-2, .col-span-1, .col-span-3 {
            grid-column: span 3 / span 3;
            flex-direction: column !important;
          }
          .col-span-3 .bento-img-container {
            width: 100%;
            height: 180px !important;
            border-right: none;
            border-bottom: 1px solid var(--border) !important;
          }
          .pricing-grid-cards {
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
        @media (max-width: 640px) {
          .console-form-responsive {
            height: auto !important;
            flex-direction: column;
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .console-form-responsive input {
            width: 100% !important;
            height: 40px !important;
            padding: 0 0.5rem !important;
            text-align: center;
          }
          .console-form-responsive button {
            width: 100% !important;
            justify-content: center;
          }
          .pricing-card-responsive {
            padding: 1.75rem 1.25rem !important;
            gap: 1rem !important;
          }
        }
      ` }} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── IMMERSIVE DUAL-PANE HERO SECTION ── */}
      <section className="hero-split-grid">
        <svg style={arcSvg} viewBox="0 0 520 700" fill="none" preserveAspectRatio="none">
          <path d="M500 80 Q 60 350 500 620" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" strokeDasharray="10 8" />
        </svg>

        <div style={panelOrb} />

        {/* LEFT COLUMN */}
        <motion.div 
          style={heroContentCol}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        >
          <motion.div 
            className="premium-badge animate-fade-in" 
            style={{ marginBottom: '1.25rem', width: 'fit-content' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={11} />
            <span>PROMPT ARCHITECT v2.0</span>
          </motion.div>

          <h1 className="hero-headline" style={heroHeadline}>
            Turn vague ideas <br />
            <span className="hero-gradient">into surgical</span> <br />
            AI prompts.
          </h1>

          <p style={heroParagraph}>
            Stop writing weak descriptions. PromptForge translates developer requirements into rich Tailwind configurations, layout wireframes, and Framer Motion spring physics that AI coders digest perfectly.
          </p>

          {/* Prompt Console Form */}
          <form style={consoleForm} action="/auth" className="active-scale-95 console-form-responsive">
            <Sparkles size={18} style={{ color: 'var(--accent)', flexShrink: 0, opacity: 0.8 }} />
            <input
              type="text"
              name="quickQuery"
              placeholder="Describe your SaaS idea..."
              style={consoleInput}
              autoComplete="off"
            />
            <button type="submit" style={forgeBtn} className="btn-accent shine-effect">
              Forge
              <ArrowRight size={13} />
            </button>
          </form>

          {/* Interactive Stable CTAs */}
          <div style={ctaRow} className="cta-row-responsive">
            <Link
              href="/auth"
              style={primaryCta}
              className="btn-accent shine-effect active-scale-95"
            >
              Get Started for Free
              <ArrowRight size={15} />
            </Link>
            <a href="#features" style={secondaryCta} className="btn-secondary active-scale-95">
              Explore Capabilities
            </a>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Overlapping elements */}
        <motion.div 
          className="showcase-pane"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.1 }}
        >
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

          <motion.div 
            className="floating-badge fb-1"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Cpu size={12} />
            <span>Cosine Retrieval</span>
          </motion.div>
          <motion.div 
            className="floating-badge fb-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <Sparkles size={12} />
            <span>Framer Motion Physics</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── BENTO GRID CAPABILITIES FEATURE SECTION ── */}
      <motion.section 
        id="features" 
        style={sectionContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div style={sectionHeader} variants={itemVariants}>
          <p className="section-label">PRODUCT CAPABILITIES</p>
          <h2 style={sectionTitle}>Tailored Bento Blueprints</h2>
        </motion.div>

        <div className="feature-bento-grid">
          {FEATURES_LIST.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={feat.slug} 
                className={`bento-card-wrapper ${feat.gridClass} glow-card-spotlight`}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="bento-img-container">
                  <div style={browserHeaderSmall}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{feat.tag}</span>
                  </div>
                  <img src={feat.img} alt={feat.title} className="bento-img" />
                </div>
                
                <div className="bento-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={featureCardHead}>
                    <div style={iconWrap}>
                      <Icon size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 style={featureTitle}>{feat.title}</h3>
                  </div>
                  <p style={featureDesc}>{feat.desc}</p>
                  <Link href={`/features/${feat.slug}`} style={featureLink} className="active-scale-95">
                    Explore technical docs <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── BEFORE & AFTER TRANSLATION BLUEPRINT ── */}
      <motion.section 
        style={sectionContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div style={sectionHeader} variants={itemVariants}>
          <p className="section-label">HOW IT WORKS</p>
          <h2 style={sectionTitle}>Vague Intent → Rich Spec translation</h2>
        </motion.div>

        <motion.div 
          className="ide-comparison-grid" 
          style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', gap: '1.5rem' }}
          variants={itemVariants}
        >
          {/* Left panel: Draft User Query */}
          <motion.div 
            style={terminalPanel} 
            className="glass-panel"
            whileHover={{ y: -4, borderColor: 'rgba(104,67,236,0.3)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div style={terminalHeader}>
              <div style={windowDotRed} />
              <div style={windowDotYellow} />
              <div style={windowDotGreen} />
              <div style={terminalTab}>
                <FileText size={12} style={{ color: 'var(--muted-foreground)' }} />
                <span>user_prompt.txt</span>
              </div>
            </div>
            <div style={promptBody}>
              <p style={previewBoxText}>
                <span style={{ 
                  color: 'var(--accent)', 
                  display: 'block', 
                  fontSize: '0.68rem', 
                  fontWeight: '800', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em', 
                  marginBottom: '0.75rem', 
                  fontFamily: 'var(--font-sans)', 
                  fontStyle: 'normal' 
                }}>
                  Raw Input Prompt
                </span>
                "Build a premium dark-mode SaaS dashboard with glassmorphism cards and smooth entrance motions."
              </p>
            </div>
          </motion.div>

          {/* Center Connection Icon */}
          <div className="comparison-arrow" style={previewArrowWrap}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    '0 0 12px rgba(104,67,236,0.2)', 
                    '0 0 28px rgba(210,255,58,0.7)', 
                    '0 0 12px rgba(104,67,236,0.2)'
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                  zIndex: 2,
                }}
              >
                <Zap size={20} style={{ color: '#D2FF3A' }} />
              </motion.div>
            </div>
          </div>

          {/* Right panel: Enhanced Prompt Output */}
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Ambient Radial backdrop glow */}
            <div style={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: '120%',
              height: '130%',
              background: 'radial-gradient(circle, rgba(104,67,236,0.12) 0%, rgba(8,145,178,0.01) 60%, transparent 100%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
              zIndex: -1
            }} />
            
            <motion.div 
              style={terminalPanel} 
              className="glass-panel"
              whileHover={{ y: -4, borderColor: 'rgba(210,255,58,0.3)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div style={terminalHeader}>
                <div style={windowDotRed} />
                <div style={windowDotYellow} />
                <div style={windowDotGreen} />
                <div style={{ ...terminalTab, color: '#D2FF3A' }}>
                  <Code2 size={12} style={{ color: '#D2FF3A' }} />
                  <span>enhanced_spec.xml</span>
                </div>
              </div>
              <div style={codeBody}>
                <pre style={previewCode}>
                  <div>
                    <span style={{ color: '#a855f7', fontWeight: 600 }}>&lt;design_system&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '1rem' }}>
                    <span style={{ color: '#38bdf8' }}>&lt;theme&gt;</span>
                    <span style={{ color: '#e2e8f0' }}>Sleek Dark Glassmorphism</span>
                    <span style={{ color: '#38bdf8' }}>&lt;/theme&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '1rem' }}>
                    <span style={{ color: '#38bdf8' }}>&lt;tokens&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '2rem' }}>
                    <span style={{ color: '#f472b6' }}>&lt;background&gt;</span>
                    <span style={{ color: '#a3e635' }}>#000000</span>
                    <span style={{ color: '#f472b6' }}>&lt;/background&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '2rem' }}>
                    <span style={{ color: '#f472b6' }}>&lt;card_bg&gt;</span>
                    <span style={{ color: '#a3e635' }}>rgba(255,255,255,0.04)</span>
                    <span style={{ color: '#f472b6' }}>&lt;/card_bg&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '2rem' }}>
                    <span style={{ color: '#f472b6' }}>&lt;backdrop_blur&gt;</span>
                    <span style={{ color: '#a3e635' }}>24px</span>
                    <span style={{ color: '#f472b6' }}>&lt;/backdrop_blur&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '2rem' }}>
                    <span style={{ color: '#f472b6' }}>&lt;border&gt;</span>
                    <span style={{ color: '#a3e635' }}>1px solid rgba(255,255,255,0.08)</span>
                    <span style={{ color: '#f472b6' }}>&lt;/border&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '1rem' }}>
                    <span style={{ color: '#38bdf8' }}>&lt;/tokens&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '1rem' }}>
                    <span style={{ color: '#38bdf8' }}>&lt;motion_curve&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '2rem' }}>
                    <span style={{ color: '#f472b6' }}>&lt;type&gt;</span>
                    <span style={{ color: '#a3e635' }}>spring</span>
                    <span style={{ color: '#f472b6' }}>&lt;/type&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '2rem' }}>
                    <span style={{ color: '#f472b6' }}>&lt;stiffness&gt;</span>
                    <span style={{ color: '#a3e635' }}>260</span>
                    <span style={{ color: '#f472b6' }}>&lt;/stiffness&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '2rem' }}>
                    <span style={{ color: '#f472b6' }}>&lt;damping&gt;</span>
                    <span style={{ color: '#a3e635' }}>20</span>
                    <span style={{ color: '#f472b6' }}>&lt;/damping&gt;</span>
                  </div>
                  <div style={{ paddingLeft: '1rem' }}>
                    <span style={{ color: '#38bdf8' }}>&lt;/motion_curve&gt;</span>
                  </div>
                  <div>
                    <span style={{ color: '#a855f7', fontWeight: 600 }}>&lt;/design_system&gt;</span>
                  </div>
                </pre>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

    </div>
  );
}

// ─── Inline Styling Tokens ──────────────────────────────────────

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
  background: 'var(--card)',
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
  background: 'var(--card)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const browserHeaderSmall = {
  padding: '0.4rem 0.75rem',
  background: 'var(--card)',
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
  marginBottom: '0.25rem',
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
  marginBottom: '0.75rem',
};

const featureLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.78rem',
  fontWeight: '700',
  color: 'var(--accent)',
  textDecoration: 'none',
  marginTop: 'auto',
};

// ─── Comparison Terminal styling ───
const terminalPanel = {
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(10, 10, 15, 0.45)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '14px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  width: '100%',
};

const terminalHeader = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  background: 'rgba(255, 255, 255, 0.02)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
};

const windowDotRed = {
  width: '9px',
  height: '9px',
  borderRadius: '50%',
  background: '#ef4444',
  marginRight: '6px',
};

const windowDotYellow = {
  width: '9px',
  height: '9px',
  borderRadius: '50%',
  background: '#f59e0b',
  marginRight: '6px',
};

const windowDotGreen = {
  width: '9px',
  height: '9px',
  borderRadius: '50%',
  background: '#10b981',
};

const terminalTab = {
  margin: '0 auto',
  fontSize: '0.72rem',
  color: 'rgba(255, 255, 255, 0.7)',
  fontWeight: '600',
  fontFamily: 'var(--font-sans)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const promptBody = {
  padding: '1.75rem',
  background: 'rgba(0,0,0,0.15)',
  minHeight: '230px',
  display: 'flex',
  alignItems: 'center',
};

const codeBody = {
  padding: '1.5rem 1.75rem',
  background: 'rgba(0,0,0,0.25)',
  minHeight: '230px',
  overflowX: 'auto',
};

const previewBoxText = {
  fontSize: '0.88rem',
  lineHeight: '1.65',
  color: 'var(--foreground)',
  margin: 0,
};

const previewArrowWrap = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem',
};

const previewCode = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.76rem',
  color: 'var(--foreground)',
  lineHeight: '1.55',
  margin: 0,
  textAlign: 'left',
};


