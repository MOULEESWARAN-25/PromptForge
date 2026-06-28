"use client";

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '../lib/analytics';
import { toast } from 'sonner';
import { BRAND } from '../config/brand';

export default function FeedbackWidget({ contextId, mode = 'inline' }) {
  const [rated, setRated] = useState(null); // 'helpful' | 'needs_improvement'
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!rated) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setRated(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rated]);

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
        className="glass-panel flex items-center gap-2 p-3 px-5 bg-[color-mix(in_srgb,var(--success)_4%,transparent)] border border-[color-mix(in_srgb,var(--success)_20%,transparent)] rounded-[12px] text-[0.76rem] text-(--success) font-semibold mt-3"
      >
        <CheckCircle2 size={16} className="text-(--success)" />
        <span>Thank you for making {BRAND.name} better!</span>
      </motion.div>
    );
  }

  return (
    <div className="glass-panel p-[0.85rem] px-5 bg-card border border-border rounded-[12px] mt-3 w-full shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      {!rated ? (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-[0.78rem] font-semibold text-muted-foreground">Was this compiled prompt useful?</span>
          <div className="flex items-center gap-2">
            <motion.button
              className="inline-flex items-center gap-[0.35rem] px-[0.65rem] py-[0.35rem] text-[0.72rem] font-bold rounded-[6px] cursor-pointer bg-transparent border border-border text-(--success) transition-all duration-200"
              onClick={() => handleRate('helpful')}
              whileHover={{ scale: 1.05, background: 'color-mix(in_srgb, var(--success) 8%, transparent)' }}
              whileTap={{ scale: 0.95 }}
              aria-label="Mark prompt as helpful"
            >
              <ThumbsUp size={13} strokeWidth={1.75} />
              <span>Helpful</span>
            </motion.button>
            <motion.button
              className="inline-flex items-center gap-[0.35rem] px-[0.65rem] py-[0.35rem] text-[0.72rem] font-bold rounded-[6px] cursor-pointer bg-transparent border border-border text-destructive transition-all duration-200"
              onClick={() => handleRate('needs_improvement')}
              whileHover={{ scale: 1.05, background: 'color-mix(in_srgb, var(--destructive) 8%, transparent)' }}
              whileTap={{ scale: 0.95 }}
              aria-label="Mark prompt as needs improvement"
            >
              <ThumbsDown size={13} strokeWidth={1.75} />
              <span>Needs Work</span>
            </motion.button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitText} className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <MessageSquare size={13} className="text-accent" strokeWidth={1.75} />
            <span className="text-[0.75rem] font-bold text-foreground">What could we improve in the compiler?</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Add more detail in grids, specify component routing..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              className="flex-1 bg-card border border-border focus:border-accent rounded-[6px] px-[0.65rem] py-[0.4rem] text-[0.75rem] text-foreground outline-none font-sans transition-all duration-200"
              autoFocus
            />
            <motion.button
              type="submit"
              className="w-[30px] h-[30px] rounded-[6px] bg-accent text-accent-foreground border-none flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={12} strokeWidth={1.75} />
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}
