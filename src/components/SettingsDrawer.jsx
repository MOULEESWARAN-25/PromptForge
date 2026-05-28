"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ExternalLink, Check, Lock, Eye, EyeOff, Sparkles, HelpCircle } from 'lucide-react';

export default function SettingsDrawer({ isOpen, onClose }) {
  const { apiKey, updateApiKey } = useApp();
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateApiKey(keyInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClear = () => {
    setKeyInput('');
    updateApiKey('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          style={overlayStyle} 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            style={drawerStyle} 
            onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* Drawer Header */}
            <div style={headerStyle}>
              <div style={titleContainer}>
                <Key size={20} style={{ color: 'hsl(var(--primary))' }} />
                <h2 style={drawerTitle}>AI Engine Settings</h2>
              </div>
              <motion.button 
                style={closeBtn} 
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Drawer Scroll Body */}
            <div style={bodyStyle}>
              {/* API Key Form */}
              <div style={sectionCard}>
                <h3 style={sectionTitle}>Google Gemini API Key</h3>
                <p style={sectionDesc}>
                  PromptForge is 100% free. By providing a free Gemini API Key, the system will use real LLM completions and embeddings to generate highly tailored prompts.
                </p>

                <form onSubmit={handleSave} style={formStyle}>
                  <div style={inputContainer}>
                    <input
                      type={showKey ? "text" : "password"}
                      placeholder="AIzaSy..."
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      style={keyInputStyle}
                      className="glass-input"
                    />
                    <button
                      type="button"
                      style={visibilityBtn}
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div style={btnRow}>
                    {keyInput.trim() !== '' && (
                      <motion.button
                        type="button"
                        style={clearBtn}
                        onClick={handleClear}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Remove Key
                      </motion.button>
                    )}
                    <motion.button
                      type="submit"
                      style={{
                        ...saveBtn,
                        background: isSaved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSaved ? (
                        <>
                          <Check size={16} />
                          Key Secured!
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          Secure Lock Key
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Interactive Tutorial: How to get a free key */}
              <div style={sectionCard}>
                <div style={tutorialHeader}>
                  <Sparkles size={16} style={{ color: 'hsl(var(--secondary))' }} />
                  <h3 style={sectionTitle}>Get a 100% Free API Key</h3>
                </div>
                <p style={sectionDesc}>
                  Google offers a free tier for Gemini API keys through Google AI Studio. No credit card is required! Follow these three simple steps:
                </p>

                <div style={stepsList}>
                  <div style={stepItem}>
                    <motion.div 
                      style={stepBadge}
                      whileHover={{ scale: 1.1, rotate: -10 }}
                    >
                      1
                    </motion.div>
                    <div style={stepContent}>
                      <p style={stepText}>
                        Go to <strong>Google AI Studio</strong> by clicking the link below.
                      </p>
                      <a
                        href="https://aistudio.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        style={linkStyle}
                      >
                        Open Google AI Studio
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <div style={stepItem}>
                    <motion.div 
                      style={stepBadge}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      2
                    </motion.div>
                    <div style={stepContent}>
                      <p style={stepText}>
                        Click the prominent <strong>"Get API key"</strong> button in the top left sidebar, then click <strong>"Create API key"</strong>.
                      </p>
                    </div>
                  </div>

                  <div style={stepItem}>
                    <motion.div 
                      style={stepBadge}
                      whileHover={{ scale: 1.1, rotate: -10 }}
                    >
                      3
                    </motion.div>
                    <div style={stepContent}>
                      <p style={stepText}>
                        Select a project (or create a new one), copy your generated key string, and paste it into the field above!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ note */}
              <div style={infoCard}>
                <HelpCircle size={16} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
                <p style={infoText}>
                  <strong>How is my key secured?</strong> Your API Key is stored safely only inside your browser's private localStorage and is sent directly to official Google endpoint servers. It is never uploaded to any third-party databases.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom Premium inline styles to bypass CSS modularity
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(6px)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'flex-end',
};

const drawerStyle = {
  width: '100%',
  maxWidth: '450px',
  height: '100vh',
  backgroundColor: 'rgba(10, 15, 26, 0.78)',
  backdropFilter: 'blur(24px)',
  borderLeft: '1px solid var(--border)',
  boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle = {
  padding: '1.5rem',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const titleContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const drawerTitle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display), sans-serif',
  color: 'var(--foreground)',
};

const closeBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const bodyStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const sectionCard = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const sectionTitle = {
  fontSize: '1.05rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display), sans-serif',
};

const sectionDesc = {
  fontSize: '0.875rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.45',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '0.5rem',
};

const inputContainer = {
  position: 'relative',
  display: 'flex',
  width: '100%',
};

const keyInputStyle = {
  width: '100%',
  paddingRight: '3rem',
  fontFamily: 'monospace',
  fontSize: '0.9rem',
};

const visibilityBtn = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
};

const btnRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  marginTop: '0.25rem',
};

const clearBtn = {
  background: 'transparent',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#ef4444',
  borderRadius: '8px',
  padding: '0.6rem 1.2rem',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer',
};

const saveBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '0.6rem 1.2rem',
  fontSize: '0.85rem',
  fontWeight: '500',
  border: 'none',
  cursor: 'pointer',
};

const tutorialHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const stepsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '0.5rem',
};

const stepItem = {
  display: 'flex',
  gap: '1rem',
};

const stepBadge = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: 'rgba(99, 102, 241, 0.08)',
  border: '1px solid var(--border)',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.85rem',
  fontWeight: '600',
  flexShrink: 0,
  cursor: 'pointer',
};

const stepContent = {
  flex: 1,
};

const stepText = {
  fontSize: '0.875rem',
  color: 'var(--foreground)',
  lineHeight: '1.4',
};

const linkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  color: 'var(--primary)',
  fontSize: '0.85rem',
  fontWeight: '500',
  textDecoration: 'none',
  marginTop: '0.5rem',
  transition: 'opacity 0.2s',
};

const infoCard = {
  display: 'flex',
  gap: '0.75rem',
  background: 'rgba(0, 0, 0, 0.01)',
  border: '1px dashed var(--border)',
  borderRadius: '10px',
  padding: '1rem',
};

const infoText = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.4',
};
