"use client";

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '../lib/analytics';
import { toast } from 'sonner';
import { BRAND } from '../config/brand';

export default function FeedbackWidget({ contextId, mode = 'inline' }) {
  const [rated, setRated] = useState(null); // 'helpful' | 'needs_improvement'
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleRate = (rating) => {
    setRated(rating);
    track('prompt_usefulness_rated', { rating, contextId });
    if (rating === 'helpful') {
      toast.success(`Thanks for the vote! We love making ${BRAND.name} better.`);
      setSubmitted(true);
    }
  };

  const handleSubmitText = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    track('prompt_written_feedback_submitted', { feedbackText, contextId });
    setSubmitted(true);
    toast.success('Feedback submitted! Our developers are already looking at it.');
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={successBox}
        className="glass-panel"
      >
        <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
        <span>Thank you for making {BRAND.name} better!</span>
      </motion.div>
    );
  }

  return (
    <div style={container(mode)} className="glass-panel">
      {!rated ? (
        <div style={firstStep}>
          <span style={labelText}>Was this compiled prompt useful?</span>
          <div style={btnGroup}>
            <motion.button
              style={thumbsBtn('helpful')}
              onClick={() => handleRate('helpful')}
              whileHover={{ scale: 1.05, background: 'rgba(34,197,94,0.08)' }}
              whileTap={{ scale: 0.95 }}
              aria-label="Mark prompt as helpful"
            >
              <ThumbsUp size={13} />
              <span>Helpful</span>
            </motion.button>
            <motion.button
              style={thumbsBtn('needs_improvement')}
              onClick={() => handleRate('needs_improvement')}
              whileHover={{ scale: 1.05, background: 'rgba(239,68,68,0.08)' }}
              whileTap={{ scale: 0.95 }}
              aria-label="Mark prompt as needs improvement"
            >
              <ThumbsDown size={13} />
              <span>Needs Work</span>
            </motion.button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitText} style={secondStep}>
          <div style={inputLabelRow}>
            <MessageSquare size={13} style={{ color: 'var(--accent)' }} />
            <span style={inputLabel}>What could we improve in the compiler?</span>
          </div>
          <div style={inputAreaRow}>
            <input
              type="text"
              placeholder="e.g. Add more detail in grids, specify component routing..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              style={textInput}
              autoFocus
            />
            <motion.button
              type="submit"
              style={submitBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={12} />
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const container = (mode) => ({
  padding: '0.85rem 1.25rem',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  marginTop: '0.75rem',
  width: '100%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
});

const labelText = {
  fontSize: '0.78rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
};

const firstStep = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

const btnGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const thumbsBtn = (type) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.35rem 0.65rem',
  fontSize: '0.72rem',
  fontWeight: '700',
  borderRadius: '6px',
  cursor: 'pointer',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.08)',
  color: type === 'helpful' ? '#22c55e' : '#ef4444',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
});

const secondStep = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const inputLabelRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const inputLabel = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--foreground)',
};

const inputAreaRow = {
  display: 'flex',
  gap: '0.5rem',
};

const textInput = {
  flex: 1,
  background: 'var(--card)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  padding: '0.4rem 0.65rem',
  fontSize: '0.75rem',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
};

const submitBtn = {
  width: '30px',
  height: '30px',
  borderRadius: '6px',
  background: '#6843EC',
  color: '#000',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const successBox = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.25rem',
  background: 'rgba(34,197,94,0.04)',
  border: '1px solid rgba(34,197,94,0.2)',
  borderRadius: '12px',
  fontSize: '0.76rem',
  color: '#22c55e',
  fontWeight: '600',
  marginTop: '0.75rem',
};
