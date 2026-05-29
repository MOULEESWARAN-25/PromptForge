"use client";

import React from 'react';
import { Sparkles, Monitor, Layout, Code2, Wand2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { track } from '../lib/analytics';

const TEMPLATES = [
  {
    id: 'saas-dashboard',
    title: 'SaaS Dashboard Admin',
    desc: 'Bento-style layout, telemetry widgets, data tables, search filters, and dark mode toggles.',
    mode: 'application',
    category: 'SaaS Dashboard Admin Panel',
    features: ['Bento metric grid', 'Telemetry widgets', 'Interactive data tables', 'Side navigation menu'],
    theme: 'Sleek Dark Glassmorphic',
    color: '#7c3aed',
  },
  {
    id: 'ai-startup',
    title: 'AI Startup Showcase',
    desc: 'Cinematic visual hero design, live generation preview console, social proof grids, and interactive pricing calculator.',
    mode: 'page',
    pageType: 'Landing Page',
    components: ['Hero section with spotlight glow', 'Features grid bento-style', 'Interactive pricing cards'],
    theme: 'Cyberpunk Neon',
    color: '#0891b2',
  },
  {
    id: 'ecommerce-cart',
    title: 'E-Commerce Checkout Flow',
    desc: 'Optimized conversion funnel design, animated cart drawer, payment option selector, and order receipt summary.',
    mode: 'application',
    category: 'E-Commerce Marketplace',
    features: ['Animated shopping cart drawer', 'Payment option selector', 'Order receipt summary', 'Micro-interactions'],
    theme: 'Minimalist Typography',
    color: '#db2777',
  },
  {
    id: 'vocabulary-page',
    title: 'Portfolio Design Showcase',
    desc: 'Smooth masonry layout grid for creative projects, full-screen project drawer detail, and spring-eased filter menus.',
    mode: 'page',
    pageType: 'Portfolio',
    components: ['Masonry grid layout', 'Project modal drawer details', 'Filter bar with spring transitions'],
    theme: 'Brutalist Bold',
    color: '#059669',
  },
];

export default function TemplateLibrary({ onSelectTemplate }) {
  const handleSelect = (tpl) => {
    track('template_selected', { templateId: tpl.id });
    onSelectTemplate(tpl);
  };

  return (
    <div style={container}>
      <div style={header}>
        <Sparkles size={16} style={{ color: 'var(--accent)' }} />
        <h3 style={title}>Elite Starter Blueprints</h3>
      </div>
      <div style={grid} className="template-grid">
        {TEMPLATES.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            style={card(tpl.color)}
            className="glass-panel"
            onClick={() => handleSelect(tpl)}
            whileHover={{ y: -4, borderColor: tpl.color }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={cardTop}>
              <span style={badge(tpl.color)}>{tpl.mode === 'application' ? 'App Specs' : 'v0 Design'}</span>
              <ArrowRight size={13} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <h4 style={cardTitle}>{tpl.title}</h4>
            <p style={cardDesc}>{tpl.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const container = {
  marginTop: '2.5rem',
  marginBottom: '2.5rem',
  width: '100%',
};

const header = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const title = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
  margin: 0,
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem',
};

const card = (color) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
  padding: '1.25rem',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.04)',
  cursor: 'pointer',
  transition: 'border-color 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
});

const cardTop = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const badge = (color) => ({
  fontSize: '0.65rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '2px 8px',
  borderRadius: '999px',
  background: `${color}12`,
  color: color,
  border: `1px solid ${color}20`,
});

const cardTitle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: '#ffffff',
  margin: 0,
  fontFamily: 'var(--font-display)',
};

const cardDesc = {
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
  margin: 0,
};
