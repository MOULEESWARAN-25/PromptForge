"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle2, Monitor, Database, Code2 } from 'lucide-react';

const ICON_MAP = {
  'Monitor': Monitor,
  'Database': Database,
  'Code2': Code2
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 15 } }
};

export default function FeatureDetailClient({ feature, slug }) {
  const Icon = ICON_MAP[feature.iconName] || Sparkles;

  return (
    <motion.div 
      style={containerStyle}
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Back button */}
      <motion.div style={backBtnWrap} variants={itemVariants}>
        <Link href="/" style={backCta} className="active-scale-95">
          <motion.span
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            whileHover={{ x: -4 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <ArrowLeft size={14} />
            <span>Back to Landing</span>
          </motion.span>
        </Link>
      </motion.div>

      <div style={layoutGrid}>
        {/* Left Side Details */}
        <motion.div style={detailsCol} variants={itemVariants}>
          <div style={headerRow}>
            <motion.div 
              style={iconBadgeStyle}
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={24} style={{ color: 'var(--accent)' }} />
            </motion.div>
            <div style={headerText}>
              <span className="premium-badge">CORE CAPABILITY</span>
              <h1 style={pageTitle}>{feature.title}</h1>
            </div>
          </div>

          <p style={detailParagraph}>{feature.detailedDesc}</p>

          <div style={benefitsHeader}>Key Implementation Strengths</div>
          <div style={benefitsList}>
            {feature.benefits.map((benefit, i) => (
              <motion.div 
                key={i} 
                style={benefitItem}
                variants={itemVariants}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side Visual Panel */}
        <motion.div 
          style={visualCol} 
          className="glass-panel"
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        >
          {/* Ambient light glow */}
          <div style={ambientGlow} />

          <div style={visualHeader}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <span>Interactive Output Demonstration</span>
          </div>
          <div style={visualBody}>
            <pre style={visualCodeBlock}>
{`[INSPECT_PIPELINE]
- Target: ${feature.title}
- Match Rating: 99.8% (Similarity Match)
- Output format: markdown-blueprint
- Status: READY TO RUN`}
            </pre>
            <div style={visualNote}>
              Every detail is generated statically for search indexers to easily extract metadata schemas and rich product information!
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Styles ─────────────────────────────────────────────

const containerStyle = {
  width: '100%',
  maxWidth: '960px',
  margin: '0 auto',
  paddingTop: '2.5rem',
  paddingBottom: '4rem',
  position: 'relative',
  zIndex: 2,
};

const backBtnWrap = {
  marginBottom: '2rem',
};

const backCta = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  textDecoration: 'none',
  fontWeight: '600',
};

const layoutGrid = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '2.5rem',
};

const detailsCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const headerRow = {
  display: 'flex',
  gap: '1.25rem',
  alignItems: 'center',
};

const iconBadgeStyle = {
  width: '54px',
  height: '54px',
  borderRadius: '12px',
  background: 'var(--accent-subtle)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(25, 57, 141, 0.15)',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-sm)',
};

const headerText = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const pageTitle = {
  fontSize: '1.8rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.03em',
  margin: 0,
};

const detailParagraph = {
  fontSize: '1.02rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.7',
};

const benefitsHeader = {
  fontSize: '0.9rem',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--foreground)',
  marginTop: '0.5rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.5rem',
};

const benefitsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '0.9rem',
  color: 'var(--foreground)',
  cursor: 'pointer',
};

const visualCol = {
  background: 'var(--card)',
  borderRadius: '16px',
  border: '1px solid var(--border)',
  height: 'fit-content',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-md)',
  position: 'relative',
};

const ambientGlow = {
  position: 'absolute',
  top: '-20%',
  right: '-20%',
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const visualHeader = {
  padding: '0.85rem 1.25rem',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  background: 'rgba(255, 255, 255, 0.02)',
};

const visualBody = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const visualCodeBlock = {
  background: 'rgba(0, 0, 0, 0.15)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.85rem',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  lineHeight: '1.5',
  color: 'var(--foreground)',
  margin: 0,
};

const visualNote = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.45',
};
