"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { generateEnhancedPrompt } from '@/services/gemini';
import { designVocabulary, themeStyles } from '@/data/designVocabulary';
import { 
  Sparkles, Search, Send, Copy, Check, Info, 
  RefreshCw, Layers, ArrowLeft, Sliders, CheckCircle2, ChevronRight
} from 'lucide-react';

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h3 key={idx} style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--accent)', marginTop: '0.85rem', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
          {parseInlineMarkdown(line.slice(4))}
        </h3>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={idx} style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginTop: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {parseInlineMarkdown(line.slice(3))}
        </h2>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <h1 key={idx} style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginTop: '1.25rem', marginBottom: '0.6rem', fontFamily: 'var(--font-display)' }}>
          {parseInlineMarkdown(line.slice(2))}
        </h1>
      );
    }
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().slice(2);
      return (
        <div key={idx} style={{ display: 'flex', gap: '0.5rem', paddingLeft: '0.5rem', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>
          <span style={{ color: 'var(--accent)' }}>•</span>
          <span>{parseInlineMarkdown(content)}</span>
        </div>
      );
    }
    if (line.trim() === '---' || line.trim() === '***') {
      return <hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.75rem 0' }} />;
    }
    if (line.trim() === '') {
      return <div key={idx} style={{ height: '0.4rem' }} />;
    }
    return (
      <p key={idx} style={{ margin: '0 0 0.4rem 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.88)', lineHeight: '1.55' }}>
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

function parseInlineMarkdown(text) {
  const parts = [];
  let currentIdx = 0;
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIdx = match.index;
    if (matchIdx > currentIdx) {
      parts.push(text.slice(currentIdx, matchIdx));
    }
    if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
      parts.push(
        <strong key={matchIdx} style={{ fontWeight: '700', color: '#ffffff' }}>
          {matchStr.slice(2, -2)}
        </strong>
      );
    } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
      parts.push(
        <code key={matchIdx} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 5px', borderRadius: '4px', color: '#c084fc' }}>
          {matchStr.slice(1, -1)}
        </code>
      );
    }
    currentIdx = regex.lastIndex;
  }
  if (currentIdx < text.length) {
    parts.push(text.slice(currentIdx));
  }
  return parts.length > 0 ? parts : text;
}

export default function ComponentForgePage() {
  const { user, savePromptRecord, updatePromptChat, history, apiKey } = useApp();
  const router = useRouter();

  // Filter designVocabulary for components
  const allComponents = designVocabulary.filter(item => item.category === 'Component');

  // Component catalog states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComp, setSelectedComp] = useState(allComponents[0]);
  const [selectedTheme, setSelectedTheme] = useState('Sleek Dark Glassmorphic');
  const [promptGenerated, setPromptGenerated] = useState(false);

  // Generation / Chat states
  const [activeSession, setActiveSession] = useState(null); // Saved record in context
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // Sync state on component selection
  useEffect(() => {
    if (selectedComp) {
      // Check if we already have a history record for component + theme
      const existing = history.find(h => 
        h.mode === 'component' && 
        h.componentName === selectedComp.name && 
        h.theme === selectedTheme
      );

      if (existing) {
        setActiveSession(existing);
        setChatMessages(existing.chatMessages);
        setCurrentPrompt(existing.resolvedPrompt);
        setPromptGenerated(true);
      } else {
        // Clear active session and force theme/config panel first
        setActiveSession(null);
        setChatMessages([]);
        setCurrentPrompt('');
        setPromptGenerated(false);
      }
    }
  }, [selectedComp, selectedTheme, history]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleInitialGeneration = async () => {
    setIsGenerating(true);
    try {
      const response = await generateEnhancedPrompt({
        mode: "component",
        query: `Create a professional ${selectedComp.name} with standard requirements.`,
        theme: selectedTheme,
        componentName: selectedComp.name,
        apiKey
      });

      // Save a new prompt record in global history
      const savedRecord = await savePromptRecord({
        mode: "component",
        title: `Component: ${selectedComp.name}`,
        query: `Initial blueprint for ${selectedComp.name}`,
        theme: selectedTheme,
        resolvedPrompt: response.prompt,
        ragDetails: response.ragDetails,
        componentName: selectedComp.name,
        chatMessages: [
          { role: 'model', content: response.prompt }
        ]
      });

      setActiveSession(savedRecord);
      setChatMessages(savedRecord.chatMessages);
      setCurrentPrompt(savedRecord.resolvedPrompt);
      setPromptGenerated(true);
    } catch (e) {
      console.error(e);
      alert("Error generating initial prompt. Please check your network/credentials.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isGenerating || !selectedComp) return;

    const userMessage = chatInput;
    setChatInput('');
    setIsGenerating(true);

    // Append user message locally
    const updatedMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(updatedMessages);

    try {
      const apiHistory = updatedMessages.slice(0, -1);

      const response = await generateEnhancedPrompt({
        mode: "component",
        query: userMessage,
        theme: selectedTheme,
        componentName: selectedComp.name,
        history: apiHistory,
        apiKey
      });

      const finalMessages = [...updatedMessages, { role: 'model', content: response.prompt }];
      setChatMessages(finalMessages);
      
      // Extract prompt block or default to full content
      let promptMatch = response.prompt.match(/```prompt\n([\s\S]*?)\n```/);
      if (promptMatch) {
        setCurrentPrompt(promptMatch[1]);
      } else {
        setCurrentPrompt(response.prompt);
      }

      if (activeSession) {
        updatePromptChat(activeSession.id, finalMessages, response.prompt, response.ragDetails);
      }

    } catch (err) {
      console.error("Chat failure", err);
      setChatMessages([...updatedMessages, { role: 'model', content: "Unable to process refinements at this moment. Please try again." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    let rawText = currentPrompt;
    let promptMatch = rawText.match(/```prompt\n([\s\S]*?)\n```/);
    if (promptMatch) rawText = promptMatch[1];
    
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetConfig = () => {
    setPromptGenerated(false);
  };

  if (!user) return null;

  // Filter component catalog based on search
  const filteredComponents = allComponents.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={containerStyle}>
      {/* 1. LEFT SIDEBAR PANEL (Component Index Catalog) */}
      <div style={sidebarStyle} className="glass-panel">
        <div style={sidebarHeader}>
          <button style={backBtn} onClick={() => router.push('/dashboard')}>
            <ArrowLeft size={13} />
            Back to Dashboard
          </button>
          <h2 style={sidebarTitle}>Component Catalog</h2>
          
          {/* Search */}
          <div style={searchContainer}>
            <Search size={14} style={searchIcon} />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyle}
              className="glass-input"
            />
          </div>
        </div>

        {/* Scrollable List */}
        <div style={componentsList}>
          {filteredComponents.length === 0 ? (
            <p style={noResults}>No matching components.</p>
          ) : (
            filteredComponents.map((comp) => {
              const active = selectedComp?.id === comp.id;
              return (
                <div
                  key={comp.id}
                  style={componentCard(active)}
                  onClick={() => setSelectedComp(comp)}
                >
                  <div style={cardHeaderRow}>
                    <span style={compNameText(active)}>{comp.name}</span>
                    {active && <Sparkles size={12} style={{ color: '#fbbf24' }} />}
                  </div>
                  <p style={compDescText}>{comp.description.slice(0, 58)}...</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT WORKSPACE PANEL */}
      <div style={workspaceStyle}>
        {/* Loading Spinner Overlaid on Workspace */}
        {isGenerating && !promptGenerated ? (
          <div style={loadingWrapperPanel} className="glass-panel">
            <div style={loadingContentInner}>
              <div style={loadingSpinner} />
              <h3 style={loadingHeaderTitle}>Compiling Design Token Prompt</h3>
              <p style={loadingHeaderSub}>Applying theme styles and structural grid systems...</p>
            </div>
          </div>
        ) : !promptGenerated ? (
          /* A. Configuration & Details Welcome Screen */
          <div style={configWorkspacePanel} className="glass-panel animate-fade-up">
            <div style={configSplitLeft}>
              <div style={configBadge}>Component Details</div>
              <h2 style={configCompName}>{selectedComp?.name}</h2>
              <p style={configCompDesc}>{selectedComp?.description}</p>
              
              {selectedComp?.keywords && (
                <div style={keywordTagsContainer}>
                  <span style={keywordsLabel}>Design Keywords:</span>
                  <div style={tagRow}>
                    {selectedComp.keywords.map((kw, i) => (
                      <span key={i} style={keywordTag}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedComp?.examplePrompt && (
                <div style={examplePromptBox}>
                  <div style={exampleLabelRow}>
                    <Info size={14} style={{ color: '#fbbf24' }} />
                    <span>Target Directive Example</span>
                  </div>
                  <p style={exampleText}>{selectedComp.examplePrompt}</p>
                </div>
              )}
            </div>

            <div style={configSplitRight}>
              <div style={themeHeaderBox}>
                <span style={themeSelectionLabel}>Select Visual Theme</span>
                <p style={themeSelectionSub}>Choose a design language to map components.</p>
              </div>

              <div style={themeCardList}>
                {Object.keys(themeStyles).map((themeName) => {
                  const isSelected = selectedTheme === themeName;
                  return (
                    <div
                      key={themeName}
                      style={themeSelectCard(isSelected)}
                      onClick={() => setSelectedTheme(themeName)}
                    >
                      <div style={themeCardHeader}>
                        <span style={themeCardTitleStyle(isSelected)}>{themeName}</span>
                        {isSelected && <CheckCircle2 size={15} style={{ color: '#fbbf24' }} />}
                      </div>
                      <p style={themeCardDescription}>{themeStyles[themeName].description}</p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleInitialGeneration}
                style={generatePromptBtn}
                className="btn-accent shine-effect"
              >
                <Sparkles size={16} />
                Generate Component Prompt
              </button>
            </div>
          </div>
        ) : (
          /* B. Clean Copyable Prompt Blueprint Panel */
          <div style={{ ...twinLayoutContainer, gap: 0 }}>
            {/* Prompt Output Column taking full width */}
            <div style={{ ...promptColumn, flex: 1 }} className="glass-panel animate-fade-up">
              <div style={promptHeader}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={promptTitleWrap}>
                    <Layers size={14} style={{ color: '#fbbf24' }} />
                    <span style={promptTitle}>Precision Component Prompt Blueprint</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '2px' }}>
                    <span style={themeStatusBadge}>{selectedTheme}</span>
                    <button style={changeConfigLink} onClick={handleResetConfig}>
                      Change Style Theme
                    </button>
                  </div>
                </div>
                {currentPrompt && (
                  <button
                    onClick={handleCopy}
                    style={copyBtnStyle}
                    className="btn-accent shine-effect"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy Prompt"}
                  </button>
                )}
              </div>

              <div style={{ ...promptBody, fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
                {renderMarkdown(
                  (currentPrompt || '').includes('```prompt')
                    ? currentPrompt.match(/```prompt\n([\s\S]*?)\n```/)?.[1] || currentPrompt
                    : currentPrompt || ''
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component Forge Style Tokens ─────────────────────────────

const containerStyle = {
  flex: 1,
  display: 'flex',
  gap: '1.5rem',
  height: 'calc(100vh - 170px)',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 2,
};

const sidebarStyle = {
  width: '300px',
  height: '100%',
  backgroundColor: 'rgba(5, 5, 8, 0.45)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
};

const sidebarHeader = {
  padding: '1.25rem',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const backBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--muted-foreground)',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  alignSelf: 'flex-start',
  padding: 0,
  fontFamily: 'var(--font-sans)',
};

const sidebarTitle = {
  fontSize: '1.1rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.02em',
};

const searchContainer = {
  position: 'relative',
  display: 'flex',
};

const searchIcon = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--muted-foreground)',
};

const searchInputStyle = {
  width: '100%',
  paddingLeft: '2.4rem',
  paddingTop: '0.45rem',
  paddingBottom: '0.45rem',
  fontSize: '0.82rem',
};

const componentsList = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem 0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const noResults = {
  fontSize: '0.78rem',
  color: 'var(--muted-foreground)',
  textAlign: 'center',
  marginTop: '2rem',
};

const componentCard = (active) => ({
  border: `1.5px solid ${active ? '#fbbf24' : 'var(--border)'}`,
  borderRadius: '10px',
  padding: '0.9rem 1.1rem',
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  background: active ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255,255,255,0.01)',
  boxShadow: active ? '0 4px 12px rgba(251, 191, 36, 0.04)' : 'none',
});

const cardHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const compNameText = (active) => ({
  fontSize: '0.85rem',
  fontWeight: '700',
  color: active ? '#ffffff' : 'rgba(255,255,255,0.85)',
});

const compDescText = {
  fontSize: '0.74rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.4',
};

const workspaceStyle = {
  flex: 1,
  height: '100%',
};

// Config panel layout
const configWorkspacePanel = {
  height: '100%',
  display: 'flex',
  borderRadius: '16px',
  border: '1px solid var(--border)',
  background: 'rgba(5, 5, 8, 0.35)',
  overflow: 'hidden',
};

const configSplitLeft = {
  flex: 1.1,
  padding: '2.5rem',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '1.5rem',
  overflowY: 'auto',
};

const configBadge = {
  fontSize: '0.68rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#fbbf24',
  background: 'rgba(251, 191, 36, 0.08)',
  border: '1px solid rgba(251, 191, 36, 0.15)',
  borderRadius: '6px',
  padding: '3px 8px',
  alignSelf: 'flex-start',
};

const configCompName = {
  fontSize: '1.8rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
  letterSpacing: '-0.03em',
};

const configCompDesc = {
  fontSize: '0.92rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.6',
};

const keywordTagsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const keywordsLabel = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--foreground)',
};

const tagRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem',
};

const keywordTag = {
  fontSize: '0.72rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border)',
  color: 'var(--muted-foreground)',
  borderRadius: '6px',
  padding: '2px 8px',
};

const examplePromptBox = {
  background: 'rgba(251, 191, 36, 0.02)',
  border: '1px solid rgba(251,191,36,0.1)',
  borderRadius: '12px',
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const exampleLabelRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.78rem',
  fontWeight: '700',
  color: '#fbbf24',
};

const exampleText = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
  fontStyle: 'italic',
};

const configSplitRight = {
  flex: 0.9,
  padding: '2.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  overflowY: 'auto',
  background: 'rgba(0,0,0,0.12)',
};

const themeHeaderBox = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const themeSelectionLabel = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: 'var(--foreground)',
  fontFamily: 'var(--font-display)',
};

const themeSelectionSub = {
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
};

const themeCardList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const themeSelectCard = (isSelected) => ({
  border: `1.5px solid ${isSelected ? '#fbbf24' : 'var(--border)'}`,
  borderRadius: '10px',
  padding: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: isSelected ? 'rgba(251, 191, 36, 0.02)' : 'rgba(255,255,255,0.01)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
});

const themeCardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const themeCardTitleStyle = (isSelected) => ({
  fontSize: '0.82rem',
  fontWeight: '700',
  color: isSelected ? '#fbbf24' : 'var(--foreground)',
});

const themeCardDescription = {
  fontSize: '0.72rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.4',
};

const generatePromptBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.78rem 1.5rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  marginTop: 'auto',
  fontFamily: 'var(--font-sans)',
};

// Twin Split Workspace styles
const twinLayoutContainer = {
  display: 'flex',
  gap: '1.25rem',
  height: '100%',
  width: '100%',
};

const chatColumn = {
  flex: 1.1,
  height: '100%',
  backgroundColor: 'rgba(5, 5, 8, 0.35)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const chatHeader = {
  padding: '1.25rem',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const chatTitle = {
  fontSize: '1.05rem',
  fontWeight: '800',
  fontFamily: 'var(--font-display)',
  color: 'var(--foreground)',
};

const headerBadgeRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginTop: '0.3rem',
};

const themeStatusBadge = {
  fontSize: '0.68rem',
  color: '#fbbf24',
  backgroundColor: 'rgba(251, 191, 36, 0.06)',
  border: '1px solid rgba(251, 191, 36, 0.15)',
  borderRadius: '6px',
  padding: '2px 8px',
  fontWeight: '600',
};

const changeConfigLink = {
  background: 'transparent',
  border: 'none',
  color: 'var(--muted-foreground)',
  fontSize: '0.68rem',
  textDecoration: 'underline',
  cursor: 'pointer',
  padding: 0,
};

const chatBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem',
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

const msgBubble = (isModel) => ({
  maxWidth: '85%',
  padding: '1rem 1.25rem',
  lineHeight: '1.5',
  backgroundColor: isModel ? 'rgba(255,255,255,0.02)' : 'rgba(251,191,36,0.07)',
  border: isModel ? '1px solid var(--border)' : '1px solid rgba(251,191,36,0.15)',
  borderRadius: isModel ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
});

const msgBubbleSender = (isModel) => ({
  fontSize: '0.68rem',
  fontWeight: '700',
  display: 'block',
  marginBottom: '6px',
  letterSpacing: '0.05em',
  color: isModel ? 'var(--muted-foreground)' : '#fbbf24',
});

const bubbleText = {
  fontSize: '0.83rem',
  whiteSpace: 'pre-wrap',
  color: 'var(--foreground)',
};

const chatInputRow = {
  padding: '1.25rem',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  gap: '0.75rem',
};

const chatField = {
  flex: 1,
  fontSize: '0.85rem',
  padding: '0.55rem 1rem',
};

const sendBtn = {
  height: '38px',
  width: '38px',
  borderRadius: '8px',
  padding: 0,
  flexShrink: 0,
};

const promptColumn = {
  flex: 0.9,
  height: '100%',
  backgroundColor: 'rgba(5, 5, 8, 0.45)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const promptHeader = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
};

const promptTitleWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const promptTitle = {
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#ffffff',
  fontFamily: 'var(--font-display)',
};

const copyBtnStyle = {
  padding: '0.45rem 1rem',
  fontSize: '0.8rem',
  height: '36px',
  borderRadius: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  fontWeight: '600',
  flexShrink: 0,
};

const promptBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.25rem',
  backgroundColor: '#030305',
};

const codeBlockStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8rem',
  color: '#c084fc',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.6',
};

// Loading panels
const loadingWrapperPanel = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(5, 5, 8, 0.35)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
};

const loadingContentInner = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const loadingSpinner = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '2.5px solid var(--border)',
  borderTopColor: '#fbbf24',
  animation: 'spin-slow 1s linear infinite',
};

const loadingHeaderTitle = {
  fontSize: '1.15rem',
  fontWeight: '700',
  color: '#ffffff',
  fontFamily: 'var(--font-display)',
  marginTop: '0.5rem',
};

const loadingHeaderSub = {
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
};
