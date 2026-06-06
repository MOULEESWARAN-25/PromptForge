"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Monitor, Layout, Code2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { track } from '@/lib/analytics';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const CREATION_TYPES = [
  {
    mode: 'application',
    icon: Monitor,
    title: 'SaaS Application',
    desc: 'Describe a multi-page app with full-stack routing, relational databases, user authentication, and third-party integrations.',
    badge: 'Full-Stack App',
    color: 'var(--accent)',
    glow: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 70%)'
  },
  {
    mode: 'page',
    icon: Layout,
    title: 'Web Page Design',
    desc: 'Assemble interactive marketing sites, beautiful pricing pages, landing pages, or high-fidelity mockups ready for deployment.',
    badge: 'Page Design',
    color: '#0284c7',
    glow: 'radial-gradient(circle, color-mix(in srgb, #0284c7 15%, transparent) 0%, transparent 70%)'
  },
  {
    mode: 'component',
    icon: Code2,
    title: 'Single Component',
    desc: 'Generate modular interactive components, charts, navigation headers, or complex UI elements with custom framework dependencies.',
    badge: 'Modular Component',
    color: '#db2777',
    glow: 'radial-gradient(circle, color-mix(in srgb, #db2777 15%, transparent) 0%, transparent 70%)'
  }
];

export default function CreatePage() {
  const router = useRouter();
  const { user } = useApp();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const handleSelect = (mode) => {
    localStorage.setItem('promptforge_wmode', mode);
    // Purge any quick query to prevent overriding selections
    localStorage.removeItem('promptforge_quickquery');
    track('creation_type_selected', { mode });
    router.push(`/forge?mode=${mode}`);
  };

  return (
    <div style={pageContainer}>
      {/* Background ambient decor */}
      <div style={bgGlow} />

      <div style={contentWrap}>
        {/* Unified Header Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr 180px",
            alignItems: "center",
            width: "100%",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "1rem",
            marginBottom: "0.5rem",
          }}
          className="create-header-row"
        >
          {/* Left: Back Button */}
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <button 
              onClick={() => router.back()} 
              style={backBtn}
              className="glass-panel active-scale-95 glow-card-spotlight"
              aria-label="Back"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          </div>

          {/* Center: Welcome Title & Subtitle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <div style={{ ...sparkleIconWrap, width: "38px", height: "38px", margin: 0 }}>
              <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <h1 style={{ ...title, fontSize: "1.25rem", lineHeight: "1.2" }}>What do you want to build?</h1>
              <p style={{ ...subtitle, fontSize: "0.82rem", marginTop: "0.15rem" }}>Select a creation type below to launch the interactive step-by-step compilation wizard.</p>
            </div>
          </div>

          {/* Right spacer */}
          <div style={{ display: "flex", justifyContent: "flex-end" }} />
        </div>

        {/* Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={cardsGrid}
        >
          {CREATION_TYPES.map((type, idx) => {
            const Icon = type.icon;
            const isHovered = hoveredIdx === idx;
            
            return (
              <motion.div 
                key={type.mode}
                variants={cardVariants}
                style={{ height: '100%' }}
              >
                <div
                  onClick={() => handleSelect(type.mode)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={cardStyle(isHovered, type.color)}
                  className="glass-panel card-hover"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelect(type.mode)}
                >
                  {/* Hover ambient glow */}
                  <div style={cardGlow(type.glow, isHovered)} />

                  <div style={cardHeader}>
                    <div style={iconContainer(type.color, isHovered)}>
                      <Icon size={22} style={{ color: type.color }} />
                    </div>
                    <span style={badgeStyle(type.color)}>{type.badge}</span>
                  </div>

                  <div style={cardBody}>
                    <h2 style={cardTitle}>{type.title}</h2>
                    <p style={cardDesc}>{type.desc}</p>
                  </div>

                  <div style={cardFooter(type.color, isHovered)}>
                    <span>Start compilation</span>
                    <motion.div
                      animate={{ x: isHovered ? 4 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight size={14} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .create-header-row {
            grid-template-columns: 1fr !important;
            gap: 1rem;
            text-align: center;
          }
          .create-header-row > div {
            justify-content: center !important;
          }
          .create-header-row div {
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const pageContainer = {
  position: 'relative',
  minHeight: 'auto',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem 1.5rem 3rem 1.5rem',
  overflow: 'hidden',
};

const bgGlow = {
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '600px',
  height: '600px',
  background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 6%, transparent) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex: 1,
};

const contentWrap = {
  position: 'relative',
  zIndex: 2,
  width: '95%',
  maxWidth: '1600px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const headerRow = {
  display: 'flex',
  justifyContent: 'flex-start',
};

const backBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.55rem',
  padding: '0.55rem 1rem',
  borderRadius: '10px',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  cursor: 'pointer',
  transition: 'all 0.25s ease',
  fontFamily: 'var(--font-sans)',
};

const welcomeSection = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '0.85rem',
  maxWidth: '600px',
  margin: '0 auto',
};

const sparkleIconWrap = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
  border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '0.5rem',
};

const title = {
  fontSize: '2rem',
  fontWeight: '800',
  letterSpacing: '-0.03em',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: 0,
};

const subtitle = {
  fontSize: '0.92rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.6',
  margin: 0,
};

const cardsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1.75rem',
  width: '100%',
};

const cardStyle = (hovered, color) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: '260px',
  padding: '2rem',
  borderRadius: '18px',
  background: 'var(--card)',
  border: `1px solid ${hovered ? `color-mix(in srgb, ${color} 40%, transparent)` : 'var(--border)'}`,
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
  boxShadow: hovered 
    ? `0 20px 40px color-mix(in srgb, ${color} 10%, transparent), var(--shadow-md)`
    : 'var(--shadow-sm)',
});

const cardGlow = (glow, hovered) => ({
  position: 'absolute',
  top: '-20%',
  right: '-10%',
  width: '240px',
  height: '240px',
  borderRadius: '50%',
  background: glow,
  opacity: hovered ? 1 : 0,
  transition: 'opacity 0.4s ease',
  pointerEvents: 'none',
});

const cardHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '1.5rem',
};

const iconContainer = (color, hovered) => ({
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  background: hovered ? `color-mix(in srgb, ${color} 20%, transparent)` : `color-mix(in srgb, ${color} 8%, transparent)`,
  border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
});

const badgeStyle = (color) => ({
  fontSize: '0.68rem',
  fontWeight: '700',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: color,
  background: `color-mix(in srgb, ${color} 10%, transparent)`,
  border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
  padding: '3px 9px',
  borderRadius: '999px',
});

const cardBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
  flex: 1,
};

const cardTitle = {
  fontSize: '1.15rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: 0,
};

const cardDesc = {
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.6',
  margin: 0,
};

const cardFooter = (color, hovered) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
  fontSize: '0.82rem',
  fontWeight: '700',
  color: hovered ? color : 'var(--muted-foreground)',
  paddingTop: '1.1rem',
  marginTop: '1.5rem',
  borderTop: '1px solid var(--border)',
  transition: 'color 0.2s ease',
});
