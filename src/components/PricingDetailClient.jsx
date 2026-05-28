"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

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

export default function PricingDetailClient({ plan, tier }) {
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
          <div style={headerText}>
            <span className="premium-badge">PRICING PLAN MATRIX</span>
            <h1 style={pageTitle}>{plan.name} Plan</h1>
            <div style={priceRow}>
              <span style={priceText}>{plan.price}</span>
              <span style={priceSub}>{plan.frequency}</span>
            </div>
          </div>

          <p style={detailParagraph}>{plan.detailedDesc}</p>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            style={{ width: 'fit-content' }}
          >
            <Link 
              href="/auth" 
              style={mainCtaBtn(plan.isPro)} 
              className="shine-effect active-scale-95"
            >
              {plan.ctaText}
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Side Features Checklist */}
        <motion.div 
          style={visualCol} 
          className="glass-panel"
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        >
          {/* Ambient Glow */}
          <div style={ambientGlow} />

          <div style={visualHeader}>
            <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
            <span>Included Capabilities</span>
          </div>
          <div style={visualBody}>
            <div style={benefitsList}>
              {plan.features.map((feat, i) => (
                <motion.div 
                  key={i} 
                  style={benefitItem}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={featText}>{feat}</span>
                </motion.div>
              ))}
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
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '2.5rem',
};

const detailsCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const headerText = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const pageTitle = {
  fontSize: '2rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.03em',
  margin: 0,
};

const priceRow = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.35rem',
  marginTop: '0.25rem',
};

const priceText = {
  fontSize: '2.5rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
};

const priceSub = {
  fontSize: '0.9rem',
  color: 'var(--muted-foreground)',
};

const detailParagraph = {
  fontSize: '1.02rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.7',
};

const mainCtaBtn = (isPro) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.85rem 1.75rem',
  fontSize: '0.95rem',
  fontWeight: '700',
  borderRadius: '10px',
  textDecoration: 'none',
  textAlign: 'center',
  cursor: 'pointer',
  background: isPro ? 'var(--accent)' : 'var(--primary)',
  color: isPro ? 'var(--accent-foreground)' : 'var(--primary-foreground)',
  boxShadow: 'var(--shadow-md)',
  width: 'fit-content',
});

const benefitsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  cursor: 'pointer',
};

const featText = {
  fontSize: '0.85rem',
  color: 'var(--foreground)',
  lineHeight: '1.4',
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
  background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
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
};
