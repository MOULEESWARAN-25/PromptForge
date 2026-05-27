"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateEnhancedPrompt } from '@/services/gemini';
import RagInspector from '@/components/RagInspector';
import { 
  Send, Copy, Check, Info, Cpu, Database, 
  RefreshCw, Layers, ArrowLeft, Terminal, HelpCircle 
} from 'lucide-react';

function ChatContent() {
  const { user, history, updatePromptChat, apiKey } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const promptId = searchParams.get('id');

  const [promptRecord, setPromptRecord] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [ragDetails, setRagDetails] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRAG, setShowRAG] = useState(false);

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
        
        setRagDetails(record.ragDetails);
      } else {
        // Redirect if invalid ID
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
      
      setRagDetails(response.ragDetails);

      // Persist in AppContext storage
      updatePromptChat(promptRecord.id, finalMessages, response.prompt, response.ragDetails);

    } catch (err) {
      console.error(err);
      setChatMessages([...updatedMessages, { role: 'model', content: "Offline error enhancing prompt. Please verify configuration." }]);
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
        <RefreshCw size={24} className="animate-spin" />
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
      {/* 1. LEFT SIDE CHAT THREAD */}
      <div style={chatColumn} className="glass-panel">
        <div style={chatHeader}>
          <div>
            <button style={backBtn} onClick={() => router.push('/')}>
              <ArrowLeft size={12} />
              Workspace Dashboard
            </button>
            <h2 style={chatTitle}>{promptRecord.title}</h2>
            <span style={themeBadge}>{promptRecord.theme}</span>
          </div>

          <button
            style={{
              ...toggleRAGBtn,
              color: showRAG ? 'hsl(var(--secondary))' : 'var(--fg-muted)',
              backgroundColor: showRAG ? 'rgba(6, 182, 212, 0.06)' : 'transparent'
            }}
            onClick={() => setShowRAG(!showRAG)}
          >
            <Database size={14} />
            RAG Pipeline Visualizer
          </button>
        </div>

        {/* Scrollable messages container */}
        <div style={chatBody}>
          <div style={messagesList}>
            {chatMessages.map((msg, idx) => {
              const isModel = msg.role === 'model';
              return (
                <div
                  key={idx}
                  style={{
                    ...msgBubbleRow,
                    justifyContent: isModel ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div
                    style={{
                      ...msgBubble,
                      backgroundColor: isModel ? 'rgba(255,255,255,0.02)' : 'hsl(var(--primary))',
                      border: isModel ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                      color: isModel ? 'var(--fg-color)' : '#ffffff',
                      borderRadius: isModel ? '12px 12px 12px 2px' : '12px 12px 2px 12px'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: '600', display: 'block', marginBottom: '4px', opacity: 0.8 }}>
                      {isModel ? "PROMPT ARCHITECT" : "YOU"}
                    </span>
                    <p style={bubbleText}>
                      {isModel 
                        ? msg.content.split('```prompt')[0].trim() || "Enhanced prompt complied successfully. View updated blueprint output in the right panel."
                        : msg.content
                      }
                    </p>
                  </div>
                </div>
              );
            })}
            {isGenerating && (
              <div style={msgBubbleRow}>
                <div style={{ ...msgBubble, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <RefreshCw size={14} className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} style={chatInputRow}>
          <input
            type="text"
            placeholder="Type refinements (e.g. 'Add e-mail validation errors' or 'Style with pastel red margins')..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={chatField}
            className="glass-input"
            disabled={isGenerating}
          />
          <button
            type="submit"
            style={sendBtn}
            className="btn-primary shine-effect"
            disabled={isGenerating || !chatInput.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* 2. RIGHT SIDE STICKY CODE EDITOR VIEW */}
      <div style={promptColumn}>
        {showRAG && (
          <div style={ragOverlay}>
            <RagInspector ragDetails={ragDetails} />
          </div>
        )}

        <div style={promptPanel} className="glass-panel">
          <div style={promptHeader}>
            <div style={promptTitleWrap}>
              <Layers size={14} style={{ color: 'hsl(var(--primary))' }} />
              <span style={promptTitleText}>Generated Enhanced Prompt</span>
            </div>
            
            <button
              onClick={handleCopy}
              style={copyBtn}
              className="btn-primary"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Prompt"}
            </button>
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
        <RefreshCw size={24} className="animate-spin" />
        <span>Loading Suspense Boundary...</span>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

// Layout inline CSS
const loadingContainer = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  fontSize: '0.85rem',
  color: 'var(--fg-muted)',
};

const chatLayout = {
  display: 'flex',
  gap: '1.5rem',
  height: 'calc(100vh - 140px)',
  minHeight: '550px',
  maxHeight: '800px',
  paddingTop: '0.5rem',
  width: '100%',
  transition: 'all 0.3s ease',
};

const chatColumn = {
  flex: 1.2,
  height: '100%',
  backgroundColor: 'rgba(6, 6, 9, 0.55)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
};

const chatHeader = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const backBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-muted)',
  fontSize: '0.72rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '2px 0',
  marginBottom: '2px',
};

const chatTitle = {
  fontSize: '1.15rem',
  fontWeight: '700',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
};

const themeBadge = {
  fontSize: '0.7rem',
  color: 'var(--fg-muted)',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '4px',
  padding: '1px 5px',
};

const toggleRAGBtn = {
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '0.75rem',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  transition: 'all 0.2s',
};

const chatBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.25rem',
};

const messagesList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const msgBubbleRow = {
  display: 'flex',
  width: '100%',
};

const msgBubble = {
  maxWidth: '80%',
  padding: '0.85rem 1.1rem',
  lineHeight: '1.5',
};

const bubbleText = {
  fontSize: '0.85rem',
  whiteSpace: 'pre-wrap',
};

const chatInputRow = {
  padding: '1.25rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  gap: '0.75rem',
};

const chatField = {
  flex: 1,
};

const sendBtn = {
  height: '42px',
  width: '42px',
  borderRadius: '8px',
  padding: 0,
};

const promptColumn = {
  flex: 0.8,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  position: 'relative',
};

const ragOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
};

const promptPanel = {
  flex: 1,
  backgroundColor: 'rgba(5, 5, 8, 0.65)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const promptHeader = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.15)',
};

const promptTitleWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const promptTitleText = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#ffffff',
  fontFamily: 'Outfit, sans-serif',
};

const copyBtn = {
  padding: '4px 12px',
  fontSize: '0.75rem',
  height: '28px',
};

const promptBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.25rem',
  backgroundColor: '#030305',
};

const codeBlockStyle = {
  fontFamily: 'monospace',
  fontSize: '0.85rem',
  color: '#c084fc',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.5',
};
