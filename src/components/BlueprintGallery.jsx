"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Layout, Code2, Wand2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { track, EVENTS } from '@/lib/analytics';

const TEMPLATES = [
  {
    id: 'saas-dashboard',
    category: 'SaaS App',
    title: 'SaaS Analytics Dashboard',
    desc: 'Multi-page app with KPI cards, sidebar nav, data tables, and glassmorphic dark theme.',
    mode: 'application',
    icon: Monitor,
    accent: '#7c3aed',
    features: ['KPI Metric Cards', 'Sidebar Navigation', 'Data Tables', 'Dark Glassmorphic'],
    theme: 'Sleek Dark Glassmorphic',
  },
  {
    id: 'landing-page',
    category: 'Landing Page',
    title: 'Premium SaaS Landing',
    desc: 'Hero split-grid, bento feature cards, pricing matrix, and animated CTAs.',
    mode: 'page',
    pageType: 'Landing Page',
    icon: Layout,
    accent: '#0891b2',
    features: ['Hero Section', 'Feature Bento', 'Pricing Cards', 'Spring Animations'],
    theme: 'Neo Dark Premium',
  },
  {
    id: 'ai-agent',
    category: 'AI Agent',
    title: 'AI Chat Interface',
    desc: 'Real-time streaming chat with model selector, message history, and typing indicators.',
    mode: 'application',
    icon: Wand2,
    accent: '#059669',
    features: ['Chat Stream', 'Model Selector', 'History Sidebar', 'Typing Indicator'],
    theme: 'Sleek Dark Glassmorphic',
  },
  {
    id: 'auth-flow',
    category: 'Auth',
    title: 'Glassmorphic Auth Screen',
    desc: 'Login/register with OTP support, animated validation, and social OAuth buttons.',
    mode: 'page',
    pageType: 'Auth Page',
    icon: Code2,
    accent: '#db2777',
    features: ['Login Form', 'OTP Input', 'OAuth Buttons', 'Glassmorphism'],
    theme: 'Neo Dark Premium',
  },
  {
    id: 'ecommerce',
    category: 'E-Commerce',
    title: 'Product Catalog Grid',
    desc: 'Filterable product grid with sidebar facets, quick-view modal, and cart drawer.',
    mode: 'application',
    icon: Monitor,
    accent: '#f59e0b',
    features: ['Product Grid', 'Filter Sidebar', 'Quick View', 'Cart Drawer'],
    theme: 'Minimalist Typography',
  },
  {
    id: 'component-card',
    category: 'Component',
    title: 'Stat KPI Card Component',
    desc: 'Animated metric card with trend arrow, sparkline, and glassmorphic surface.',
    mode: 'component',
    icon: Code2,
    accent: '#c084fc',
    features: ['Animated Counter', 'Trend Arrow', 'Sparkline', 'Hover Glow'],
    theme: 'Sleek Dark Glassmorphic',
  },
];

const CATEGORIES = ['All', 'SaaS App', 'Landing Page', 'AI Agent', 'Auth', 'E-Commerce', 'Component'];

export default function BlueprintGallery() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  const handleClone = (template) => {
    const draft = {
      mode: template.mode,
      selectedTheme: template.theme,
      selectedFeatures: template.features || [],
      pageType: template.pageType || null,
      savedAt: Date.now(),
    };
    localStorage.setItem('promptforge_draft', JSON.stringify(draft));
    track(EVENTS.TEMPLATE_CLONED, { templateId: template.id, category: template.category });
    router.push(`/forge?mode=${template.mode}`);
  };

  return (
    <section style={section}>
      {/* Header */}
      <div style={sectionHead}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.3rem' }}>Starter Blueprints</p>
          <h2 style={sectionTitle}>Blueprint Gallery</h2>
        </div>
        <button style={collapseBtn} onClick={() => setCollapsed(c => !c)}>
          {collapsed ? <><ChevronDown size={13} /> Show</> : <><ChevronUp size={13} /> Hide</>}
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/* Category filter */}
            <div style={filterRow}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  style={catBtn(activeCategory === cat)}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template grid */}
            <div style={grid}>
              {filtered.map(template => {
                const Icon = template.icon;
                const isHovered = hoveredId === template.id;
                return (
                  <motion.div
                    key={template.id}
                    style={card(template.accent, isHovered)}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    {/* Preview area */}
                    <div style={previewArea(template.accent)}>
                      <div style={previewIconWrap(template.accent)}>
                        <Icon size={24} style={{ color: template.accent }} />
                      </div>
                      <span style={categoryPill(template.accent)}>{template.category}</span>
                    </div>

                    {/* Body */}
                    <div style={cardBody}>
                      <h3 style={cardTitle}>{template.title}</h3>
                      <p style={cardDesc}>{template.desc}</p>

                      {/* Feature tags */}
                      <div style={tagRow}>
                        {template.features.slice(0, 3).map(f => (
                          <span key={f} style={tag}>{f}</span>
                        ))}
                      </div>

                      {/* CTA */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.button
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.18 }}
                            style={cloneBtn(template.accent)}
                            onClick={() => handleClone(template)}
                            whileTap={{ scale: 0.97 }}
                          >
                            Clone this template <ArrowRight size={13} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const section = { marginBottom: '3rem' };

const sectionHead = { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem' };

const sectionTitle = { fontSize: '1.25rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 };

const collapseBtn = { display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--muted-foreground)', cursor: 'pointer', fontFamily: 'var(--font-sans)' };

const filterRow = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' };

const catBtn = (active) => ({ padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', border: active ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)', background: active ? 'rgba(124,58,237,0.12)' : 'transparent', color: active ? 'var(--accent)' : 'var(--muted-foreground)', transition: 'all 0.18s ease', fontFamily: 'var(--font-sans)' });

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.1rem' };

const card = (accent, hovered) => ({ borderRadius: '16px', background: hovered ? `${accent}06` : 'rgba(255,255,255,0.01)', border: `1px solid ${hovered ? `${accent}25` : 'rgba(255,255,255,0.05)'}`, overflow: 'hidden', transition: 'border-color 0.2s, background 0.2s', display: 'flex', flexDirection: 'column' });

const previewArea = (accent) => ({ height: '100px', background: `linear-gradient(135deg, ${accent}10 0%, ${accent}04 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.04)' });

const previewIconWrap = (accent) => ({ width: 52, height: 52, borderRadius: '14px', background: `${accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accent}20` });

const categoryPill = (accent) => ({ position: 'absolute', top: '0.6rem', right: '0.6rem', fontSize: '0.62rem', fontWeight: '700', color: accent, background: `${accent}15`, border: `1px solid ${accent}25`, borderRadius: '5px', padding: '2px 8px' });

const cardBody = { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1 };

const cardTitle = { fontSize: '0.9rem', fontWeight: '700', color: '#fff', margin: 0, fontFamily: 'var(--font-display)' };

const cardDesc = { fontSize: '0.75rem', color: 'var(--muted-foreground)', lineHeight: '1.5', margin: 0 };

const tagRow = { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' };

const tag = { fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '5px', padding: '2px 7px' };

const cloneBtn = (accent) => ({ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', padding: '0.5rem 0.85rem', background: `${accent}15`, border: `1px solid ${accent}30`, borderRadius: '8px', color: accent, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'var(--font-sans)', width: '100%', justifyContent: 'center' });
