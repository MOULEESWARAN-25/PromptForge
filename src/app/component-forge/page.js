"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { generateEnhancedPrompt } from '@/services/gemini';
import { designVocabulary } from '@/data/designVocabulary';
import { 
  Sparkles, Search, Send, Copy, Check, Info, 
  RefreshCw, Layers, ArrowLeft 
} from 'lucide-react';

export default function ComponentForgePage() {
  const { user, savePromptRecord, updatePromptChat, history, apiKey } = useApp();
  const router = useRouter();

  // Filter designVocabulary for components
  const allComponents = designVocabulary.filter(item => item.category === 'Component');

  // Component catalog states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComp, setSelectedComp] = useState(allComponents[0]);
  const [selectedTheme, setSelectedTheme] = useState('Sleek Dark Glassmorphic');

  // Generation / Chat states
  const [activeSession, setActiveSession] = useState(null); // The saved Prompt record inside history context
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

  // Load component default prompt on component selection
  useEffect(() => {
    if (selectedComp) {
      // Check if we already have a history record for this component + theme in context!
      const existing = history.find(h => 
        h.mode === 'component' && 
        h.componentName === selectedComp.name && 
        h.theme === selectedTheme
      );

      if (existing) {
        setActiveSession(existing);
        setChatMessages(existing.chatMessages);
        setCurrentPrompt(existing.resolvedPrompt);
      } else {
        // Clear active session and generate a fresh blueprint
        setActiveSession(null);
        setChatMessages([]);
        setCurrentPrompt('');
        handleInitialGeneration();
      }
    }
  }, [selectedComp, selectedTheme]);

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
      const savedRecord = savePromptRecord({
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
    } catch (e) {
      console.error(e);
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
      // Build full conversation payload for Gemini API
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
      
      // Attempt to extract the raw prompt block
      let promptMatch = response.prompt.match(/```prompt\n([\s\S]*?)\n```/);
      if (promptMatch) {
        setCurrentPrompt(promptMatch[1]);
      } else {
        setCurrentPrompt(response.prompt);
      }

      // Save / Update session in AppContext history
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
          <button style={backBtn} onClick={() => router.push('/forge')}>
            <ArrowLeft size={14} />
            Wizard Home
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

        {/* Theme Settings Selector */}
        <div style={themeSelectorCard}>
          <label style={themeLabel}>Target Style Theme</label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            style={selectStyle}
            className="glass-input"
          >
            <option value="Sleek Dark Glassmorphic">Sleek Dark Glassmorphic</option>
            <option value="Wes Anderson">Wes Anderson Retro</option>
            <option value="Cyberpunk Neon">Cyberpunk Neon</option>
            <option value="Brutalist Bold">Brutalist Bold</option>
            <option value="Minimalist Typography">Minimalist Typography</option>
          </select>
        </div>

        {/* Scrollable list */}
        <div style={componentsList}>
          {filteredComponents.length === 0 ? (
            <p style={noResults}>No matching components found.</p>
          ) : (
            filteredComponents.map((comp) => {
              const active = selectedComp?.id === comp.id;
              return (
                <div
                  key={comp.id}
                  style={{
                    ...componentCard,
                    backgroundColor: active ? 'rgba(168, 85, 247, 0.08)' : 'transparent',
                    borderColor: active ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.04)'
                  }}
                  onClick={() => setSelectedComp(comp)}
                >
                  <div style={cardHeaderRow}>
                    <span style={compNameText}>{comp.name}</span>
                    {active && <Sparkles size={12} style={{ color: 'hsl(var(--primary))' }} />}
                  </div>
                  <p style={compDescText}>{comp.description.slice(0, 50)}...</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT WORKSPACE PANEL (Twin Workspace Layout) */}
      <div style={workspaceStyle}>
        <div 
          style={twinLayoutContainer}
          className={
            selectedTheme === 'Wes Anderson' ? 'theme-wes-anderson' : 
            selectedTheme === 'Cyberpunk Neon' ? 'theme-cyberpunk' : 
            selectedTheme === 'Brutalist Bold' ? 'theme-brutalist' : 
            selectedTheme === 'Minimalist Typography' ? 'theme-minimal' : ''
          }
        >
          {/* Chat Workspace (Left side of split) */}
          <div style={chatColumn} className="glass-panel">
            <div style={chatHeader}>
              <div>
                <h3 style={chatTitle}>{selectedComp ? selectedComp.name : "Select a Component"}</h3>
                <span style={themeStatusBadge}>{selectedTheme}</span>
              </div>
            </div>

            {/* Chat Thread */}
            <div style={chatBody}>
              {(chatMessages || []).length === 0 && isGenerating ? (
                <div style={chatLoading}>
                  <RefreshCw size={24} className="animate-spin" style={{ color: 'hsl(var(--primary))' }} />
                  <p>Assembling design blueprint...</p>
                </div>
              ) : (
                <div style={messagesList}>
                  {(chatMessages || []).map((msg, idx) => {
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
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '4px', opacity: 0.8 }}>
                            {isModel ? "PROMPT ARCHITECT" : "YOU"}
                          </span>
                          
                          <p style={bubbleText}>
                            {isModel 
                              ? msg.content.split('```prompt')[0].trim() || "Generated Prompt compiled successfully. Copied blueprint output in the right-side editor."
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
              )}
            </div>

            {/* Chat Form */}
            <form onSubmit={handleSendMessage} style={chatInputRow}>
              <input
                type="text"
                placeholder={`Ask Architect to refine the ${selectedComp?.name || 'component'} prompt...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={chatField}
                className="glass-input"
                disabled={isGenerating || !selectedComp}
              />
              <button
                type="submit"
                style={sendBtn}
                className="btn-primary shine-effect"
                disabled={isGenerating || !selectedComp || !chatInput.trim()}
              >
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Code Prompt Output (Right side of split) */}
          <div style={promptColumn}>
            <div style={promptPanel} className="glass-panel">
              <div style={promptHeader}>
                <div style={promptTitleWrap}>
                  <Layers size={14} style={{ color: 'hsl(var(--primary))' }} />
                  <span style={promptTitle}>Refined Component Prompt Blueprint</span>
                </div>
                {currentPrompt && (
                  <button
                    onClick={handleCopy}
                    style={copyBtnStyle}
                    className="btn-primary"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy Prompt"}
                  </button>
                )}
              </div>

              <div style={promptBody}>
                {isGenerating && !currentPrompt ? (
                  <div style={promptLoading}>
                    <RefreshCw size={24} className="animate-spin" />
                    <span>Compiling code structure...</span>
                  </div>
                ) : currentPrompt ? (
                  <pre style={codeBlockStyle}>
                    <code>
                      {currentPrompt.includes('```prompt')
                        ? currentPrompt.match(/```prompt\n([\s\S]*?)\n```/)?.[1] || currentPrompt
                        : currentPrompt
                      }
                    </code>
                  </pre>
                ) : (
                  <div style={emptyPromptState}>
                    <Info size={24} style={{ color: 'var(--fg-muted)' }} />
                    <p>Generated technical prompt directives will appear here in high-fidelity markdown blocks.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Layout inline CSS styles
const containerStyle = {
  flex: 1,
  display: 'flex',
  gap: '1.5rem',
  height: 'calc(100vh - 140px)',
  minHeight: '550px',
  maxHeight: '800px',
  paddingTop: '0.5rem',
};

const sidebarStyle = {
  width: '320px',
  height: '100%',
  backgroundColor: 'rgba(5, 5, 8, 0.55)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
};

const sidebarHeader = {
  padding: '1.25rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const backBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-muted)',
  fontSize: '0.75rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  alignSelf: 'flex-start',
  padding: '2px 0',
};

const sidebarTitle = {
  fontSize: '1.15rem',
  fontWeight: '700',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
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
  color: 'var(--fg-muted)',
};

const searchInputStyle = {
  width: '100%',
  paddingLeft: '2.5rem',
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem',
  fontSize: '0.85rem',
};

const themeSelectorCard = {
  padding: '0.75rem 1.25rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  backgroundColor: 'rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const themeLabel = {
  fontSize: '0.72rem',
  fontWeight: '600',
  color: 'hsl(var(--primary))',
  textTransform: 'uppercase',
};

const selectStyle = {
  width: '100%',
  fontSize: '0.8rem',
  padding: '6px 12px',
  cursor: 'pointer',
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
  fontSize: '0.8rem',
  color: 'var(--fg-muted)',
  textAlign: 'center',
  marginTop: '2rem',
};

const componentCard = {
  border: '1px solid',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const cardHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const compNameText = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#ffffff',
};

const compDescText = {
  fontSize: '0.75rem',
  color: 'var(--fg-muted)',
  lineHeight: '1.4',
};

const workspaceStyle = {
  flex: 1,
  height: '100%',
};

const twinLayoutContainer = {
  display: 'flex',
  gap: '1.25rem',
  height: '100%',
  width: '100%',
  transition: 'all 0.3s ease',
};

const chatColumn = {
  flex: 1,
  height: '100%',
  backgroundColor: 'rgba(6, 6, 9, 0.5)',
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

const chatTitle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
};

const themeStatusBadge = {
  fontSize: '0.7rem',
  color: 'var(--fg-muted)',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '4px',
  padding: '1px 5px',
};

const chatBody = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.25rem',
};

const chatLoading = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  height: '100%',
  fontSize: '0.85rem',
  color: 'var(--fg-muted)',
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
  maxWidth: '85%',
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
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  position: 'relative',
};

const promptPanel = {
  flex: 1,
  backgroundColor: 'rgba(5, 5, 8, 0.6)',
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

const promptTitle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#ffffff',
  fontFamily: 'Outfit, sans-serif',
};

const copyBtnStyle = {
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

const promptLoading = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  height: '100%',
  color: 'var(--fg-muted)',
  fontSize: '0.85rem',
};

const emptyPromptState = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  height: '100%',
  textAlign: 'center',
  color: 'var(--fg-muted)',
  fontSize: '0.85rem',
  padding: '0 2rem',
};
