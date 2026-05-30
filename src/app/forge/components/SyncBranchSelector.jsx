import React from 'react';
import { RotateCcw, Sparkles, CheckCircle2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';

export function SyncBranchSelector({
  activeMode,
  pageType,
  componentType,
  projectIntegration,
  setProjectIntegration,
  framework,
  setFramework,
  ideSyncPromptCopied,
  setIdeSyncPromptCopied,
  ideResponseContext,
  setIdeResponseContext
}) {
  const stepSection = {
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.01)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
  };

  const stepHeader = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start'
  };

  const stepNum = {
    fontSize: '2rem',
    fontWeight: '900',
    color: 'var(--accent)',
    lineHeight: '1',
    opacity: '0.85',
    fontFamily: 'var(--font-mono)'
  };

  const stepTitle = {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--foreground)',
    letterSpacing: '-0.02em'
  };

  const stepDesc = {
    fontSize: '0.88rem',
    color: 'var(--muted-foreground)',
    marginTop: '0.35rem',
    lineHeight: '1.4'
  };

  const getSyncPromptText = () => {
    const target = activeMode === 'page' ? (pageType || 'Web Page') : (componentType || 'Modular Component');
    return `Generate project structure context for PromptForge.\nTarget component/layout: ${target}.\nOutput folder tree, tailwind config details, and styling themes inside a concise list without raw code snippets.`;
  };

  return (
    <div style={stepSection} className="animate-fade-up">
      <div style={stepHeader}>
        <span style={stepNum}>
          {activeMode === 'page' ? '04' : '03'}
        </span>
        <div>
          <h3 style={stepTitle}>Existing Project Workspace Integration</h3>
          <p style={stepDesc}>Sync the compiled prompt with your active codebase properties, styling guidelines, and folder hierarchy.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
        {[
          {
            id: 'new',
            label: 'Standalone / New Project',
            desc: 'Generate a standalone, clean prompt blueprint from scratch without importing external project directories.',
            icon: <Sparkles size={20} />
          },
          {
            id: 'existing',
            label: 'Existing Project Integration',
            desc: 'Import your active workspace configuration, styling assets, and directory hierarchy for optimal code reuse.',
            icon: <RotateCcw size={20} />
          }
        ].map((opt) => {
          const isSelected = projectIntegration === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => {
                setProjectIntegration(opt.id);
                track('sync_branch_selected', { branch: opt.id });
              }}
              className="bento-card-premium glow-card-spotlight active-scale-95"
              style={{
                background: isSelected ? 'rgba(124, 58, 237, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                border: isSelected ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: isSelected ? '#7c3aed' : 'var(--muted-foreground)' }}>{opt.icon}</div>
                {isSelected && <CheckCircle2 size={16} style={{ color: '#fbbf24' }} />}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '750', color: 'var(--foreground)' }}>{opt.label}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.5' }}>{opt.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {projectIntegration === 'existing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.5rem' }} className="animate-fade-up">
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.5rem' }}>
              Select Active UI Stack / CSS Framework
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--input)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                fontSize: '0.9rem',
                color: 'var(--foreground)',
                outline: 'none'
              }}
            >
              {['Shadcn/UI', 'Tailwind CSS', 'DaisyUI', 'React Bootstrap', 'Material UI', 'Chakra UI', 'Vanilla CSS Modules'].map((fw) => (
                <option key={fw} value={fw}>{fw}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.5rem' }}>
              IDE Metadata Sync Prompter
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              Copy the instruction below, paste it into your editor chat (Cursor, Copilot, or terminal), then copy its structural response back here.
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', position: 'relative' }}>
              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#c0c0c0', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', lineHeight: '1.5' }}>
                {getSyncPromptText()}
              </pre>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getSyncPromptText());
                  setIdeSyncPromptCopied(true);
                  toast.success("IDE Sync Prompt Copied!", { description: "Paste it in Cursor/Copilot to generate directory schemas." });
                  setTimeout(() => setIdeSyncPromptCopied(false), 3000);
                }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
                className="active-scale-95"
              >
                {ideSyncPromptCopied ? <CheckCircle2 size={12} style={{ color: '#fbbf24' }} /> : <Sparkles size={12} />}
                {ideSyncPromptCopied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.5rem' }}>
              Paste IDE Workspace File Context Output
            </label>
            <textarea
              placeholder="Paste the directory structures or visual settings output from your IDE here..."
              value={ideResponseContext}
              onChange={(e) => setIdeResponseContext(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                background: 'var(--input)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                color: 'var(--foreground)',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                lineHeight: '1.5'
              }}
              className="glass-input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
