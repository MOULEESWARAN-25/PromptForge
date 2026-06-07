import React, { useState, useRef } from 'react';
import { useWizardAutoScroll } from '../hooks/useWizardAutoScroll';
import { 
  Laptop, Database as DbIcon, ShieldCheck, Terminal, ShoppingBag, Sparkles, 
  Smartphone, Code, CheckCircle2, Layers, Cpu, Server, Globe, ArrowLeft, ArrowRight, Info, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import { ShadcnSelect } from '@/components/ui/ShadcnElements';

const FRAMEWORK_OPTIONS = [
  { value: 'Shadcn/UI', label: 'Shadcn/UI' },
  { value: 'Tailwind CSS', label: 'Tailwind CSS' },
  { value: 'DaisyUI', label: 'DaisyUI' },
  { value: 'React Bootstrap', label: 'React Bootstrap' },
  { value: 'Material UI', label: 'Material UI' },
  { value: 'Chakra UI', label: 'Chakra UI' },
  { value: 'Vanilla CSS Modules', label: 'Vanilla CSS Modules' }
];



const FRONTEND_STACKS = [
  { id: 'Next.js (App Router)', label: 'Next.js (App)', icon: <Globe size={16} /> },
  { id: 'React SPA (Vite)', label: 'React SPA', icon: <Code size={16} /> },
  { id: 'Vue.js (Nuxt)', label: 'Vue.js (Nuxt)', icon: <Code size={16} /> },
  { id: 'Angular', label: 'Angular', icon: <Code size={16} /> },
  { id: 'Svelte / SvelteKit', label: 'SvelteKit', icon: <Code size={16} /> },
  { id: 'SolidJS', label: 'SolidJS', icon: <Code size={16} /> }
];

const BACKEND_STACKS = [
  { id: 'Next.js Serverless', label: 'Next.js API', icon: <Server size={16} /> },
  { id: 'Node.js (Express)', label: 'Express.js', icon: <Server size={16} /> },
  { id: 'Python (FastAPI)', label: 'FastAPI', icon: <Server size={16} /> },
  { id: 'Go (Fiber)', label: 'Go Fiber', icon: <Server size={16} /> },
  { id: 'Ruby on Rails', label: 'Rails', icon: <Server size={16} /> },
  { id: 'Serverless / Edge', label: 'Edge / Cloudflare', icon: <Server size={16} /> }
];

const DATABASES = [
  { id: 'PostgreSQL', label: 'PostgreSQL', icon: <DbIcon size={16} /> },
  { id: 'Supabase (Postgres)', label: 'Supabase', icon: <DbIcon size={16} /> },
  { id: 'MongoDB', label: 'MongoDB', icon: <DbIcon size={16} /> },
  { id: 'MySQL', label: 'MySQL', icon: <DbIcon size={16} /> },
  { id: 'SQLite', label: 'SQLite', icon: <DbIcon size={16} /> },
  { id: 'Redis', label: 'Redis Cache', icon: <DbIcon size={16} /> }
];

const AUTH_OPTIONS = [
  { id: 'NextAuth.js / Auth.js', label: 'NextAuth / Auth.js', icon: <ShieldCheck size={16} /> },
  { id: 'Supabase Auth', label: 'Supabase Auth', icon: <ShieldCheck size={16} /> },
  { id: 'Clerk', label: 'Clerk Auth', icon: <ShieldCheck size={16} /> },
  { id: 'Auth0 / Firebase', label: 'Auth0 / Firebase', icon: <ShieldCheck size={16} /> },
  { id: 'Custom JWT / Sessions', label: 'JWT Tokens', icon: <ShieldCheck size={16} /> },
  { id: 'No Auth Required', label: 'No Auth', icon: <ShieldCheck size={16} /> }
];

const DEPLOYMENT_TARGETS = [
  { id: 'Vercel', label: 'Vercel', icon: <Globe size={16} /> },
  { id: 'Netlify', label: 'Netlify', icon: <Globe size={16} /> },
  { id: 'Railway / Render', label: 'Railway / Render', icon: <Server size={16} /> },
  { id: 'AWS / GCP', label: 'AWS / GCP', icon: <Server size={16} /> },
  { id: 'Docker / VPS', label: 'Docker / VPS', icon: <Terminal size={16} /> },
  { id: 'Custom / On-Prem', label: 'On-Prem / Edge', icon: <Terminal size={16} /> }
];

const STACK_FEATURES = [
  { id: 'TypeScript', label: 'TypeScript', icon: <Code size={16} /> },
  { id: 'Tailwind CSS', label: 'Tailwind CSS', icon: <Code size={16} /> },
  { id: 'ESLint & Prettier', label: 'ESLint & Prettier', icon: <Terminal size={16} /> },
  { id: 'Vitest / Jest Testing', label: 'Testing (Jest)', icon: <Cpu size={16} /> },
  { id: 'Storybook', label: 'Storybook', icon: <Layers size={16} /> },
  { id: 'GitHub Actions CI/CD', label: 'CI/CD Pipelines', icon: <Terminal size={16} /> }
];

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
  setIdeResponseContext,

  // Paginated setup parameters
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  frontendStack,
  setFrontendStack,
  backendStack,
  setBackendStack,
  database,
  setDatabase,
  authOption,
  setAuthOption,
  deployment,
  setDeployment,
  additionalFeatures,
  setAdditionalFeatures,

  isStepWizard = false,
  goBack,
  goNext
}) {
  const [setupPage, setSetupPage] = useState(1);
  const activeIntegration = projectIntegration || 'new';

  const continueButtonRef = useRef(null);

  useWizardAutoScroll({
    step: setupPage,
    selectionDependencies: [
      projectIntegration,
      frontendStack,
      backendStack,
      database,
      authOption,
      deployment,
      additionalFeatures
    ],
    continueButtonRef
  });


  // Dynamic colors based on active wizard mode
  const accentColor = 'var(--accent)';
  const activeBg = 'color-mix(in srgb, var(--accent) 10%, transparent)';
  const focusBorderShadow = 'color-mix(in srgb, var(--accent) 20%, transparent)';

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%'
  };

  const getSyncPromptText = () => {
    const target = activeMode === 'page' ? (pageType || 'Web Page') : (componentType || 'Modular Component');
    return `Generate project structure context for Veyntra.\nTarget component/layout: ${target}.\nOutput folder tree, tailwind config details, and styling themes inside a concise list without raw code snippets.`;
  };

  const handleFeatureToggle = (featureId) => {
    if (additionalFeatures.includes(featureId)) {
      setAdditionalFeatures(additionalFeatures.filter(f => f !== featureId));
    } else {
      setAdditionalFeatures([...additionalFeatures, featureId]);
    }
  };

  const totalPages = activeIntegration === 'new' ? 3 : 2;

  const handleNextSubPage = () => {
    if (setupPage < totalPages) {
      setSetupPage(prev => prev + 1);
    } else if (isStepWizard && goNext) {
      goNext();
    }
  };

  const handlePrevSubPage = () => {
    if (setupPage > 1) {
      setSetupPage(prev => prev - 1);
    } else if (isStepWizard && goBack) {
      goBack();
    }
  };

  return (
    <div style={containerStyle}>
      {/* Dynamic inline styles */}
      <style>{`
        .pf-setup-mode-tabs {
          display: flex;
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 0.5rem;
        }
        .pf-setup-tab-btn {
          flex: 1;
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--muted-foreground);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .pf-setup-tab-btn.active {
          background: ${activeBg};
          border: 1px solid ${accentColor};
          color: var(--accent);
          font-weight: 800;
        }
        
        .pf-setup-grid-3cols {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .pf-setup-grid-3cols {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }

        .pf-setup-grid-2cols-split {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .pf-setup-grid-2cols-split {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .pf-setup-grid-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .pf-setup-grid-options {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .pf-setup-grid-options {
            grid-template-columns: 1fr;
          }
        }

        .pf-setup-card {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.7rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          background: var(--card);
          border: 1px solid var(--border);
        }
        .pf-setup-card:hover {
          background: var(--muted);
          border: 1px solid var(--accent);
        }
        .pf-setup-card.active {
          background: ${activeBg};
          border: 1px solid ${accentColor};
          box-shadow: 0 0 12px ${focusBorderShadow};
        }

        .pf-setup-input {
          width: 100%;
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
          font-size: 0.8rem;
          color: var(--foreground);
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .pf-setup-input:focus {
          border-color: ${accentColor};
          box-shadow: 0 0 0 2px ${focusBorderShadow};
        }
        
        .pf-setup-col-title {
          font-size: 0.72rem;
          font-weight: 750;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .pf-substep-indicator {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--muted-foreground);
          font-family: var(--font-mono);
          background: var(--muted);
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid var(--border);
        }
      `}</style>

      {/* Integration Mode Switcher */}
      <div className="pf-setup-mode-tabs">
        <button 
          onClick={() => {
            setProjectIntegration('new');
            setSetupPage(1);
            track('sync_branch_selected', { branch: 'new' });
          }}
          className={`pf-setup-tab-btn ${activeIntegration === 'new' ? 'active' : ''}`}
        >
          <Sparkles size={14} /> Standalone / New Project
        </button>
        <button 
          onClick={() => {
            setProjectIntegration('existing');
            setSetupPage(1);
            track('sync_branch_selected', { branch: 'existing' });
          }}
          className={`pf-setup-tab-btn ${activeIntegration === 'existing' ? 'active' : ''}`}
        >
          <RotateCcw size={14} /> Existing Project Sync
        </button>
      </div>

      {/* Subpage Header with Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--foreground)' }}>
          {activeIntegration === 'new' ? (
            <>
              {setupPage === 1 && "Step 1: General Parameters"}
              {setupPage === 2 && "Step 2: Technology Stacks"}
              {setupPage === 3 && "Step 3: Integration & Features"}
            </>
          ) : (
            <>
              {setupPage === 1 && "Step 1: IDE Sync Environment"}
              {setupPage === 2 && "Step 2: Integration & Features"}
            </>
          )}
        </span>
        <span className="pf-substep-indicator">{setupPage} / {totalPages}</span>
      </div>

      {/* PAGE 1: GENERAL PARAMETERS (NEW PROJECT ONLY) */}
      {activeIntegration === 'new' && setupPage === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-up">
          {/* Inputs Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.35rem' }}>
                Project Name
              </label>
              <input 
                type="text" 
                className="pf-setup-input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-saas"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.35rem' }}>
                Project Description
              </label>
              <input 
                type="text" 
                className="pf-setup-input"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="A developer-focused API hub platform."
              />
            </div>
          </div>

        </div>
      )}

      {/* PAGE 2: TECH STACKS (NEW PROJECT ONLY) */}
      {activeIntegration === 'new' && setupPage === 2 && (
        <div className="pf-setup-grid-3cols animate-fade-up">
          {/* Frontend Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="pf-setup-col-title">Frontend Stack</div>
            {FRONTEND_STACKS.map(opt => {
              const isSelected = frontendStack === opt.id;
              return (
                <div 
                  key={opt.id}
                  onClick={() => setFrontendStack(opt.id)}
                  className={`pf-setup-card ${isSelected ? 'active' : ''}`}
                >
                  {opt.icon}
                  <span style={{ fontSize: '0.72rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--foreground)' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Backend Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="pf-setup-col-title">Backend Stack</div>
            {BACKEND_STACKS.map(opt => {
              const isSelected = backendStack === opt.id;
              return (
                <div 
                  key={opt.id}
                  onClick={() => setBackendStack(opt.id)}
                  className={`pf-setup-card ${isSelected ? 'active' : ''}`}
                >
                  {opt.icon}
                  <span style={{ fontSize: '0.72rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--foreground)' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Database Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="pf-setup-col-title">Database</div>
            {DATABASES.map(opt => {
              const isSelected = database === opt.id;
              return (
                <div 
                  key={opt.id}
                  onClick={() => setDatabase(opt.id)}
                  className={`pf-setup-card ${isSelected ? 'active' : ''}`}
                >
                  {opt.icon}
                  <span style={{ fontSize: '0.72rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--foreground)' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAGE 2: IDE SYNC ENVIRONMENT (EXISTING PROJECT ONLY) */}
      {activeIntegration === 'existing' && setupPage === 1 && (
        <div className="pf-setup-grid-2cols-split animate-fade-up">
          {/* Left panel: Framework & prompter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '750', color: 'var(--foreground)', display: 'block', marginBottom: '0.35rem' }}>
                Active UI Framework
              </label>
              <ShadcnSelect
                value={framework}
                onChange={setFramework}
                options={FRAMEWORK_OPTIONS}
                placeholder="Select framework..."
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '750', color: 'var(--foreground)', display: 'block', marginBottom: '0.2rem' }}>
                IDE Sync Instruction Prompter
              </label>
              <p style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                Copy the instruction below, paste it into your editor chat (Cursor, Copilot, or terminal), then copy its structural response back here.
              </p>
              
              <div style={{ background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.65rem', position: 'relative' }}>
                <pre style={{ margin: 0, fontSize: '0.68rem', color: 'var(--foreground)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>
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
                    top: '0.4rem',
                    right: '0.4rem',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '5px',
                    padding: '3px 8px',
                    fontSize: '0.62rem',
                    color: 'var(--foreground)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    transition: 'all 0.2s ease'
                  }}
                  className="active-scale-95"
                >
                  {ideSyncPromptCopied ? <CheckCircle2 size={10} style={{ color: 'var(--warning)' }} /> : <Sparkles size={10} />}
                  {ideSyncPromptCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: textarea */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '750', color: 'var(--foreground)', display: 'block', marginBottom: '0.35rem' }}>
              Paste IDE Workspace File Context Output
            </label>
            <textarea
              placeholder="Paste the directory structures or visual settings output from your IDE here..."
              value={ideResponseContext}
              onChange={(e) => setIdeResponseContext(e.target.value)}
              className="pf-setup-input"
              style={{
                flex: 1,
                minHeight: '120px',
                fontFamily: 'var(--font-mono)',
                lineHeight: '1.4',
                resize: 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* PAGE 3: INTEGRATION & SERVICES (NEW: STEP 3, EXISTING: STEP 2) */}
      {((activeIntegration === 'new' && setupPage === 3) || (activeIntegration === 'existing' && setupPage === 2)) && (
        <div className="pf-setup-grid-3cols animate-fade-up">
          {/* Authentication Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="pf-setup-col-title">Authentication</div>
            {AUTH_OPTIONS.map(opt => {
              const isSelected = authOption === opt.id;
              return (
                <div 
                  key={opt.id}
                  onClick={() => setAuthOption(opt.id)}
                  className={`pf-setup-card ${isSelected ? 'active' : ''}`}
                >
                  {opt.icon}
                  <span style={{ fontSize: '0.72rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--foreground)' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Deployment Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="pf-setup-col-title">Deployment Target</div>
            {DEPLOYMENT_TARGETS.map(opt => {
              const isSelected = deployment === opt.id;
              return (
                <div 
                  key={opt.id}
                  onClick={() => setDeployment(opt.id)}
                  className={`pf-setup-card ${isSelected ? 'active' : ''}`}
                >
                  {opt.icon}
                  <span style={{ fontSize: '0.72rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--foreground)' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stack Additions Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="pf-setup-col-title">Stack Additions</div>
            {STACK_FEATURES.map(opt => {
              const isSelected = additionalFeatures.includes(opt.id);
              return (
                <div 
                  key={opt.id}
                  onClick={() => handleFeatureToggle(opt.id)}
                  className={`pf-setup-card ${isSelected ? 'active' : ''}`}
                >
                  <CheckCircle2 size={13} style={{ color: isSelected ? 'var(--accent)' : 'var(--border)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--foreground)' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons inside Setup Wizard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={handlePrevSubPage}
          disabled={setupPage === 1 && !isStepWizard}
          className="pf-setup-nav-btn active-scale-95"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '0.6rem 1.25rem', borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--foreground)',
            fontSize: '0.85rem', fontWeight: '600',
            cursor: (setupPage === 1 && !isStepWizard) ? 'default' : 'pointer',
            opacity: (setupPage === 1 && !isStepWizard) ? 0.35 : 1,
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={14} /> {setupPage === 1 ? 'Back to Preview' : 'Back'}
        </button>

        <button
          ref={continueButtonRef}
          onClick={handleNextSubPage}
          className="pf-setup-nav-btn active-scale-95"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '0.6rem 1.5rem', borderRadius: '10px',
            border: 'none',
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            fontSize: '0.85rem', fontWeight: '700',
            cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease'
          }}
        >
          {setupPage === totalPages ? (isStepWizard ? 'Review' : 'Done') : 'Continue'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
