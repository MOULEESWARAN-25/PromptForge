"use client";
 
import React, { useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KEYBOARD_SHORTCUTS } from '@/config/keyboardShortcuts';
 
export default function HelpKeyboardOverlay({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
 
  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-999 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          className="glass-panel w-full max-w-[440px] bg-white/95 dark:bg-[#1a1740]/85 border border-border dark:border-white/8 shadow-[0_24px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.8)] rounded-[16px] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-labelledby="kbd-title"
          aria-modal="true"
        >
          <div className="flex items-center justify-between p-[1.25rem_1.5rem] border-b border-border dark:border-white/6">
            <div className="flex items-center gap-2">
              <Keyboard size={18} className="text-accent" strokeWidth={1.75} />
              <h3 id="kbd-title" className="text-[0.98rem] font-bold text-foreground m-0 font-display">Keyboard Shortcuts</h3>
            </div>
            <button onClick={onClose} className="bg-none border-none cursor-pointer text-muted-foreground p-[2px]" aria-label="Close modal">
              <X size={15} strokeWidth={1.75} />
            </button>
          </div>
 
          <div className="flex flex-col p-[1rem_1.5rem]">
            {KEYBOARD_SHORTCUTS.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/3 last:border-b-0">
                <span className="text-[0.8rem] text-foreground dark:text-white/85">{item.label}</span>
                <span className="flex gap-[0.2rem]">
                  <kbd className="font-mono text-[0.72rem] font-bold bg-black/5 dark:bg-white/7 border border-border dark:border-white/12 rounded-[6px] px-[7px] py-[3px] text-foreground shadow-[0_2px_0_rgba(0,0,0,0.1)] dark:shadow-[0_2px_0_rgba(0,0,0,0.4)]">{item.display}</kbd>
                </span>
              </div>
            ))}
          </div>
 
          <div className="flex items-center justify-center gap-1.5 p-4 bg-black/5 dark:bg-white/1 border-t border-border dark:border-white/4 text-[0.7rem] text-muted-foreground font-medium">
            <Command size={11} strokeWidth={1.75} />
            <span>Power developer command center ready.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
