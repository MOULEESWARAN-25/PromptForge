"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { track, EVENTS } from '@/lib/analytics';
import MicroDelight from './MicroDelight';

const LEVELS = [
  { level: 1, name: 'Builder', icon: '🔨', minBlueprints: 1, minCollections: 0, minRefinements: 0 },
  { level: 2, name: 'Prompt Engineer', icon: '⚡', minBlueprints: 5, minCollections: 2, minRefinements: 0 },
  { level: 3, name: 'Blueprint Architect', icon: '🏗️', minBlueprints: 10, minCollections: 5, minRefinements: 0 },
  { level: 4, name: 'System Designer', icon: '🎯', minBlueprints: 25, minCollections: 8, minRefinements: 20 },
  { level: 5, name: 'Forge Master', icon: '🔥', minBlueprints: 50, minCollections: 15, minRefinements: 100 },
  { level: 6, name: 'Legend', icon: '👑', minBlueprints: 100, minCollections: 0, minRefinements: 0 },
];

function computeLevel(b, c, r) {
  let current = null;
  for (const lvl of LEVELS) {
    if (b >= lvl.minBlueprints && c >= lvl.minCollections && r >= lvl.minRefinements) {
      current = lvl;
    }
  }
  return current || LEVELS[0];
}

function computeGap(currentLevel, nextLevel, b, c, r) {
  if (!nextLevel) return 'Maximum level reached! 👑';
  const gaps = [];
  if (b < nextLevel.minBlueprints) gaps.push(`${nextLevel.minBlueprints - b} blueprints`);
  if (nextLevel.minCollections && c < nextLevel.minCollections) gaps.push(`${nextLevel.minCollections - c} collections`);
  if (nextLevel.minRefinements && r < nextLevel.minRefinements) gaps.push(`${nextLevel.minRefinements - r} refinements`);
  return gaps.length ? `${gaps.join(' + ')} to ${nextLevel.name}` : '';
}

function computeProgressPct(currentLevel, nextLevel, b, c, r) {
  if (!nextLevel) return 1;
  const bPct = Math.min(b / nextLevel.minBlueprints, 1);
  const cPct = nextLevel.minCollections ? Math.min(c / nextLevel.minCollections, 1) : 1;
  const rPct = nextLevel.minRefinements ? Math.min(r / nextLevel.minRefinements, 1) : 1;
  return (bPct + cPct + rPct) / 3;
}

export default function MasteryScore({ collections = [] }) {
  const { history } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const prevLevelName = useRef(null);

  const blueprints = history.length;
  const totalRefinements = history.reduce((acc, h) => acc + (h.chatMessages || []).filter(m => m.role === 'user').length, 0);
  const collectionCount = collections.length;

  const currentLevel = computeLevel(blueprints, collectionCount, totalRefinements);
  const nextLevel = LEVELS[currentLevel.level] || null;
  const gapText = computeGap(currentLevel, nextLevel, blueprints, collectionCount, totalRefinements);
  const pct = computeProgressPct(currentLevel, nextLevel, blueprints, collectionCount, totalRefinements);

  useEffect(() => {
    if (prevLevelName.current && prevLevelName.current !== currentLevel.name) {
      setCelebration(true);
      track(EVENTS.MASTERY_LEVEL_UP, { from: prevLevelName.current, to: currentLevel.name });
      setTimeout(() => setCelebration(false), 100);
    }
    prevLevelName.current = currentLevel.name;
  }, [currentLevel.name]);

  if (blueprints === 0) return null;

  return (
    <>
      <MicroDelight trigger={celebration} duration={1800} />
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={container} className="glass-panel"
      >
        <div style={headerRow} onClick={() => { setExpanded(e => !e); if (!expanded) track(EVENTS.MASTERY_SCORE_VIEWED); }}
          role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setExpanded(ex => !ex)}
        >
          <div style={leftSide}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{currentLevel.icon}</span>
            <div>
              <div style={levelName}>{currentLevel.name}</div>
              <div style={levelSub}>Level {currentLevel.level} of {LEVELS.length}</div>
            </div>
          </div>
          <div style={rightSide}>
            <div style={miniBarBg}>
              <motion.div style={miniBarFill} initial={{ width: 0 }} animate={{ width: `${Math.round(pct * 100)}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
            </div>
            <button style={expandBtn}>{expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
              <div style={expandedBody}>
                {gapText && (
                  <div style={gapBanner}>
                    <Zap size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <span>{gapText}</span>
                  </div>
                )}
                <div style={statsGrid}>
                  {[{ label: 'Blueprints', value: blueprints }, { label: 'Collections', value: collectionCount }, { label: 'AI Refinements', value: totalRefinements }].map(s => (
                    <div key={s.label} style={statBlock}>
                      <div style={statNum}>{s.value}</div>
                      <div style={statLbl}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {LEVELS.map(lvl => {
                    const isActive = lvl.level === currentLevel.level;
                    const isPast = lvl.level < currentLevel.level;
                    return (
                      <div key={lvl.level} style={ladderRow(isActive, isPast)}>
                        <span style={{ fontSize: '0.85rem', opacity: isActive ? 1 : isPast ? 0.7 : 0.3 }}>{lvl.icon}</span>
                        <span style={ladderName(isActive, isPast)}>{isPast ? '✓ ' : ''}{lvl.name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>Lv.{lvl.level}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

const container = { marginBottom: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' };
const headerRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', cursor: 'pointer', gap: '1rem' };
const leftSide = { display: 'flex', alignItems: 'center', gap: '0.65rem' };
const levelName = { fontSize: '0.88rem', fontWeight: '700', color: '#fff', fontFamily: 'var(--font-display)' };
const levelSub = { fontSize: '0.68rem', color: 'var(--muted-foreground)', marginTop: '0.1rem' };
const rightSide = { display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' };
const miniBarBg = { flex: 1, maxWidth: 120, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' };
const miniBarFill = { height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--accent), #db2777)' };
const expandBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', padding: 0 };
const expandedBody = { padding: '0 1.1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' };
const gapBanner = { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '8px', padding: '0.45rem 0.75rem', fontWeight: '600' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' };
const statBlock = { textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' };
const statNum = { fontSize: '1.15rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-display)' };
const statLbl = { fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' };
const ladderRow = (isActive, isPast) => ({ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.6rem', borderRadius: '8px', background: isActive ? 'rgba(124,58,237,0.08)' : isPast ? 'rgba(34,197,94,0.04)' : 'transparent', border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent' });
const ladderName = (isActive, isPast) => ({ flex: 1, fontSize: '0.78rem', fontWeight: isActive ? '700' : '500', color: isActive ? '#fff' : isPast ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' });
