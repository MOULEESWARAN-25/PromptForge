"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateEnhancedPrompt } from '@/services/gemini';
import { 
  Send, Copy, Check, ArrowLeft, RefreshCw, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      style={singleColumnLayout}
      className={
        promptRecord.theme === 'Wes Anderson' ? 'theme-wes-anderson' : 
        promptRecord.theme === 'Cyberpunk Neon' ? 'theme-cyberpunk' : 
        promptRecord.theme === 'Brutalist Bold' ? 'theme-brutalist' : 
        promptRecord.theme === 'Minimalist Typography' ? 'theme-minimal' : ''
      }
    >
      <div style={workspacePanel} className="glass-panel">
        {/* HEADER SECTION */}
        <div style={workspaceHeader}>
          <div style={headerLeft}>
            <motion.button 
              style={backBtn} 
              onClick={() => router.push('/')}
              whileHover={{ x: -3, borderColor: 'rgba(255,255,255,0.15)', color: 'var(--foreground)' }}
              whileTap={{ scale: 0.96 }}
            >
              <ArrowLeft size={12} />
              Dashboard
            </motion.button>
            <div style={titleBadgeRow}>
              <h2 style={workspaceTitle}>{promptRecord.title}</h2>
              <span style={themeBadge}>{promptRecord.theme}</span>
            </div>
          </div>
          
          <motion.button
            onClick={handleCopy}
            style={copyBtn}
            className="btn-accent shine-effect"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Generated Prompt"}
          </motion.button>
        </div>

        {/* PROMPT CONTAINER SECTION */}
        <div style={workspaceBody}>
          {isGenerating ? (
            <div style={refiningContainer}>
              <RefreshCw size={24} className="animate-spin text-purple-400" style={{ marginBottom: '0.5rem' }} />
              <p style={refiningText}>Refining architectural prompt blueprint...</p>
            </div>
          ) : (
            <pre style={codeBlockStyle}>
              <code>{currentPrompt}</code>
            </pre>
          )}
        </div>

        {/* BOTTOM INPUT BAR SECTION */}
        <form onSubmit={handleSendMessage} style={bottomInputRow(inputFocused)}>
          <div style={sparklesIconWrap}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <input
            type="text"
            placeholder="Type refinements (e.g. 'Add email validation forms', 'Style with HSL forest green accents')..."
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

const singleColumnLayout = {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 140px)',
  minHeight: '600px',
  maxHeight: '900px',
  paddingTop: '0.25rem',
  paddingBottom: '0.75rem',
  width: '100%',
  position: 'relative',
  zIndex: 2,
};

const workspacePanel = {
  flex: 1,
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};

const workspaceHeader = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
  flexShrink: 0,
};

const headerLeft = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
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
  width: 'fit-content',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

const titleBadgeRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flexWrap: 'wrap',
};

const workspaceTitle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.02em',
  margin: 0,
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

const copyBtn = {
  padding: '0.45rem 1rem',
  fontSize: '0.8rem',
  height: '36px',
  borderRadius: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  fontWeight: '600',
};

const workspaceBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem',
  background: 'rgba(0, 0, 0, 0.2)',
  position: 'relative',
};

const codeBlockStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.82rem',
  color: 'rgba(255,255,255,0.92)',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.65',
  margin: 0,
};

const refiningContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '200px',
};

const refiningText = {
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  fontWeight: '500',
};

const bottomInputRow = (focused) => ({
  padding: '1.15rem 1.5rem',
  borderTop: `1px solid ${focused ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
  boxShadow: focused ? '0 -4px 24px rgba(124,58,237,0.06)' : 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flexShrink: 0,
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
});

const sparklesIconWrap = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  flexShrink: 0,
};

const chatField = {
  flex: 1,
};

const sendBtn = {
  height: '38px',
  width: '38px',
  borderRadius: '8px',
  padding: 0,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
