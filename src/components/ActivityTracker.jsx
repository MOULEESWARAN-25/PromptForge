"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// Animate a number counting up
function CountUp({ target, duration = 800 }) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    let raf;
    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return <>{value}</>;
}

export default function ActivityTracker() {
  const { activityStats, history } = useApp();
  const { sessionsThisMonth, blueprintsThisMonth } = activityStats;

  // Count total refinements from chat messages
  const totalRefinements = history.reduce((acc, h) => {
    const userMessages = (h.chatMessages || []).filter(m => m.role === 'user').length;
    return acc + userMessages;
  }, 0);

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  const stats = [
    {
      icon: Zap,
      value: sessionsThisMonth,
      label: `Building Sessions`,
      sub: monthName,
      color: '#f59e0b',
    },
    {
      icon: Calendar,
      value: blueprintsThisMonth,
      label: `Blueprints Created`,
      sub: `this ${monthName}`,
      color: '#7c3aed',
    },
  ];

  // Don't render if no sessions yet
  if (sessionsThisMonth === 0 && blueprintsThisMonth === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={container}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} style={statCard}>
            <div style={iconWrap(stat.color)}>
              <Icon size={14} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={statValue}>
                <CountUp target={stat.value} />
              </div>
              <div style={statLabel}>{stat.label}</div>
              <div style={statSub}>{stat.sub}</div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const container = {
  display: 'flex',
  gap: '0.75rem',
  marginBottom: '1.5rem',
};

const statCard = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  padding: '0.6rem 0.9rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '12px',
};

const iconWrap = (color) => ({
  width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
  background: `${color}12`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

const statValue = {
  fontSize: '1.1rem', fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: '#fff', lineHeight: 1,
};

const statLabel = {
  fontSize: '0.72rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)',
  marginTop: '0.1rem',
};

const statSub = {
  fontSize: '0.65rem', color: 'var(--muted-foreground)',
};
