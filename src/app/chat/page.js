"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateEnhancedPrompt } from '@/services/gemini';
import { 
  Send, Copy, Check, Layers, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animation Variants ────────────────────────────────────────
const messageStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const messageVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 26 } }
};

function ChatContent() {
  const { user, history, updatePromptChat, apiKey } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const promptId = searchParams.get('id');

  const [promptRecord, setPromptRecord] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Fetch active prompt record from history context
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (promptId && history.length > 0) {
      const record = history.find(h => h.id === promptId);
      if (record) {
        setPromptRecord(record);
        setChatMessages(record.chatMessages);
        
        // Resolve initial prompt state
        let rawPrompt = record.resolvedPrompt;
        let promptMatch = rawPrompt.match(/```prompt\n([\s\S]*?)\n```/);
        setCurrentPrompt(promptMatch ? promptMatch[1] : rawPrompt);
      } else {
        router.push('/');
      }
    }
  }, [promptId, history, user, router]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isGenerating || !promptRecord) return;

    const userMessage = chatInput;
    setChatInput('');
    setIsGenerating(true);

    const updatedMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(updatedMessages);

    try {
      const apiHistory = updatedMessages.slice(0, -1);
      
      const response = await generateEnhancedPrompt({
        mode: promptRecord.mode,
        query: userMessage,
        theme: promptRecord.theme,
        category: promptRecord.category,
        pageType: promptRecord.pageType,
        components: promptRecord.components,
        componentName: promptRecord.componentName,
        history: apiHistory,
        apiKey
      });

      const finalMessages = [...updatedMessages, { role: 'model', content: response.prompt }];
      setChatMessages(finalMessages);

      // Extract current prompt
      let promptMatch = response.prompt.match(/```prompt\n([\s\S]*?)\n```/);
      setCurrentPrompt(promptMatch ? promptMatch[1] : response.prompt);
      
      // Persist in AppContext storage
      updatePromptChat(promptRecord.id, finalMessages, response.prompt, response.ragDetails);

    } catch (err) {
      console.error(err);
      setChatMessages([...updatedMessages, { role: 'model', content: "Unable to process refinements at this moment. Please try again." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseBoldText = (text) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} style={{ color: 'var(--foreground)', fontWeight: '700' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const formatMessageText = (text) => {
    if (!text) return "";
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let cleanLine = line.trim();
      if (!cleanLine) {
        return <div key={idx} style={{ height: '0.6rem' }} />;
      }
      
      // Headers
      if (cleanLine.startsWith('###')) {
        return (
          <h4 key={idx} style={{ 
            fontSize: '0.88rem', 
            fontWeight: '700', 
            color: 'var(--foreground)', 
            marginTop: '0.85rem', 
            marginBottom: '0.4rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.01em'
          }}>
            {parseBoldText(cleanLine.replace(/^###\s*/, ''))}
          </h4>
        );
      }
      
      if (cleanLine.startsWith('##')) {
        return (
          <h3 key={idx} style={{ 
            fontSize: '0.94rem', 
            fontWeight: '700', 
            color: 'var(--foreground)', 
            marginTop: '1.1rem', 
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.01em'
          }}>
            {parseBoldText(cleanLine.replace(/^##\s*/, ''))}
          </h3>
        );
      }
      
      // Bullets
      if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        return (
          <li key={idx} style={{ 
            marginLeft: '1rem', 
            marginBottom: '0.3rem', 
            listStyleType: 'disc', 
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.84rem',
            lineHeight: '1.55'
          }}>
            {parseBoldText(cleanLine.replace(/^[-*]\s*/, ''))}
          </li>
        );
      }
      
      // Numbered lists
      if (/^\d+\.\s/.test(cleanLine)) {
        const numberText = cleanLine.replace(/^\d+\.\s*/, '');
        const number = cleanLine.match(/^\d+/)[0];
        return (
          <div key={idx} style={{ 
            display: 'flex', 
            gap: '0.4rem', 
            marginLeft: '0.25rem', 
            marginBottom: '0.35rem',
            fontSize: '0.84rem',
            lineHeight: '1.55',
            color: 'rgba(255,255,255,0.85)'
          }}>
            <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{number}.</span>
            <span>{parseBoldText(numberText)}</span>
          </div>
        );
      }
      
      // Plain text paragraphs
      return (
        <p key={idx} style={{ 
          marginBottom: '0.45rem', 
          fontSize: '0.84rem', 
          lineHeight: '1.55',
          color: 'rgba(255,255,255,0.82)'
        }}>
          {parseBoldText(line)}
        </p>
      );
    });
  };

  if (!promptRecord) {
    return (
      <div style={loadingContainer}>
        <RefreshCw size={24} className="animate-spin text-purple-400" />
        <span>Loading Workspace Configuration...</span>
      </div>
    );
  }

  return (
    <div 
      style={chatLayout}
      className={
        promptRecord.theme === 'Wes Anderson' ? 'theme-wes-anderson' : 
        promptRecord.theme === 'Cyberpunk Neon' ? 'theme-cyberpunk' : 
        promptRecord.theme === 'Brutalist Bold' ? 'theme-brutalist' : 
        promptRecord.theme === 'Minimalist Typography' ? 'theme-minimal' : ''
      }
    >
      {/* LEFT SIDE CHAT THREAD */}
      <div style={chatColumn} className="glass-panel">
        <div style={chatHeader}>
          <div>
            <motion.button 
              style={backBtn} 
              onClick={() => router.push('/')}
              whileHover={{ x: -3, borderColor: 'rgba(255,255,255,0.15)', color: 'var(--foreground)' }}
              whileTap={{ scale: 0.96 }}
            >
              <ArrowLeft size={12} />
              Workspace Dashboard
            </motion.button>
            <h2 style={chatTitle} className="mt-2">{promptRecord.title}</h2>
            <span style={themeBadge} className="mt-1 inline-block">{promptRecord.theme}</span>
          </div>
        </div>

        {/* Scrollable messages container */}
        <div style={chatBody}>
          <motion.div 
            variants={messageStagger} 
            initial="hidden" 
            animate="show" 
            style={messagesList}
          >
            {chatMessages.map((msg, idx) => {
              const isModel = msg.role === 'model';
              return (
                <motion.div
                  key={idx}
                  variants={messageVariants}
                  style={{
                    ...msgBubbleRow,
                    justifyContent: isModel ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div
                    style={{
                      ...msgBubble,
                      backgroundColor: isModel ? 'rgba(255,255,255,0.02)' : 'var(--accent)',
                      border: isModel ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                      color: isModel ? 'var(--fg-color)' : 'var(--accent-foreground)',
                      borderRadius: isModel ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                      boxShadow: isModel ? '0 2px 8px rgba(0,0,0,0.1)' : '0 4px 12px rgba(124,58,237,0.15)'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', display: 'block', marginBottom: '6px', opacity: 0.8, letterSpacing: '0.04em' }}>
                      {isModel ? "PROMPT ARCHITECT" : "YOU"}
                    </span>
                    <div style={bubbleText}>
                      {isModel 
                        ? formatMessageText(msg.content.split('```prompt')[0].trim() || "Enhanced prompt compiled successfully. View updated blueprint output in the right panel.")
                        : formatMessageText(msg.content)
                      }
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {isGenerating && (
              <motion.div variants={messageVariants} style={msgBubbleRow}>
                <div style={{ ...msgBubble, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px 14px 14px 2px' }}>
                  <RefreshCw size={14} className="animate-spin text-purple-400" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} style={chatInputRow(inputFocused)}>
          <input
            type="text"
            placeholder="Type refinements (e.g. 'Add e-mail validation errors' or 'Style with HSL lime green accents')..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={chatField}
            className="glass-input"
            disabled={isGenerating}
          />
          <motion.button
            type="submit"
            style={sendBtn}
            className="btn-accent shine-effect"
            disabled={isGenerating || !chatInput.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </form>
      </div>

      {/* RIGHT SIDE STICKY CODE EDITOR VIEW */}
      <div style={promptColumn}>
        <div style={promptPanel} className="glass-panel">
          <div style={promptHeader}>
            <div style={promptTitleWrap}>
              <Layers size={14} style={{ color: 'var(--accent)' }} />
              <span style={promptTitleText}>Generated Enhanced Prompt</span>
            </div>
            
            <motion.button
              onClick={handleCopy}
              style={copyBtn}
              className="btn-accent shine-effect"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Prompt"}
            </motion.button>
          </div>

          <div style={promptBody}>
            <pre style={codeBlockStyle}>
              <code>{currentPrompt}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={loadingContainer}>
        <RefreshCw size={24} className="animate-spin text-purple-400" />
        <span>Loading Workspace...</span>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

// ─── Premium Chat Styles ──────────────────────────────────────

const loadingContainer = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
};

const chatLayout = {
  display: 'flex',
  gap: '1.25rem',
  height: 'calc(100vh - 140px)',
  minHeight: '600px',
  maxHeight: '900px',
  paddingTop: '0.25rem',
  paddingBottom: '0.75rem',
  width: '100%',
  position: 'relative',
  zIndex: 2,
};

const chatColumn = {
  flex: 1.15,
  height: '100%',
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  overflow: 'hidden',
};

const chatHeader = {
  padding: '0.875rem 1.25rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0,
};

const backBtn = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '7px',
  color: 'var(--muted-foreground)',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.3rem 0.65rem',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

const chatTitle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.02em',
};

const themeBadge = {
  fontSize: '0.68rem',
  fontWeight: '600',
  color: 'var(--muted-foreground)',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '999px',
  padding: '2px 8px',
};

const chatBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.25rem',
};

const messagesList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const msgBubbleRow = {
  display: 'flex',
  width: '100%',
};

const msgBubble = {
  maxWidth: '85%',
  padding: '0.85rem 1.1rem',
  lineHeight: '1.6',
  borderRadius: '12px',
};

const bubbleText = {
  fontSize: '0.875rem',
  whiteSpace: 'normal',
};

const chatInputRow = (focused) => ({
  padding: '1rem 1.25rem',
  borderTop: `1px solid ${focused ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
  boxShadow: focused ? '0 -4px 24px rgba(124,58,237,0.06)' : 'none',
  display: 'flex',
  gap: '0.625rem',
  flexShrink: 0,
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
});

const chatField = {
  flex: 1,
};

const sendBtn = {
  height: '40px',
  width: '40px',
  borderRadius: '9px',
  padding: 0,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const promptColumn = {
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
};

const promptPanel = {
  flex: 1,
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};

const promptHeader = {
  padding: '0.875rem 1.25rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0,
};

const promptTitleWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const promptTitleText = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
};

const copyBtn = {
  padding: '0.3rem 0.75rem',
  fontSize: '0.75rem',
  height: '28px',
  borderRadius: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.35rem',
};

const promptBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.25rem',
  background: 'rgba(0, 0, 0, 0.25)',
};

const codeBlockStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.82rem',
  color: 'rgba(255,255,255,0.92)',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.65',
};

