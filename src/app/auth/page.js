"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Lock, User, LogIn, UserPlus, Sparkles, KeyRound } from 'lucide-react';

export default function AuthPage() {
  const { user, login, register } = useApp();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to workspace
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    // Add tiny simulated delay for premium feel
    setTimeout(() => {
      let result;
      if (isLogin) {
        result = login(username, password);
      } else {
        result = register(username, password);
      }

      setLoading(false);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message);
      }
    }, 800);
  };

  const handleDemoAccess = () => {
    setLoading(true);
    setTimeout(() => {
      login("demo_engineer", "promptforge2026");
      setLoading(false);
      router.push('/');
    }, 500);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="glass-panel floating">
        {/* Glow Header */}
        <div style={logoWrapper}>
          <Sparkles size={24} style={{ color: 'hsl(var(--primary))' }} />
        </div>
        <h1 style={titleStyle}>PromptForge</h1>
        <p style={subtitleStyle}>AI Development Intent Translator</p>

        {/* Tab Selector */}
        <div style={tabsRow}>
          <button
            style={{ ...tabBtn, ...(isLogin ? tabBtnActive : {}) }}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            <LogIn size={16} />
            Sign In
          </button>
          <button
            style={{ ...tabBtn, ...(!isLogin ? tabBtnActive : {}) }}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            <UserPlus size={16} />
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorBanner}>{error}</div>}

          <div style={inputGroup}>
            <label style={labelStyle}>Username</label>
            <div style={inputContainer}>
              <User size={16} style={inputIcon} />
              <input
                type="text"
                placeholder="e.g. dev_architect"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                className="glass-input"
                disabled={loading}
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <div style={inputContainer}>
              <Lock size={16} style={inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                className="glass-input"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            style={submitBtn}
            className="btn-primary shine-effect"
            disabled={loading}
          >
            {loading ? "Authenticating..." : isLogin ? "Access Workspace" : "Create Account"}
          </button>
        </form>

        <div style={dividerRow}>
          <span style={dividerLine} />
          <span style={dividerText}>OR</span>
          <span style={dividerLine} />
        </div>

        {/* Quick Demo Button */}
        <button
          onClick={handleDemoAccess}
          style={demoBtn}
          className="btn-secondary"
          disabled={loading}
        >
          <KeyRound size={16} style={{ color: 'hsl(var(--secondary))' }} />
          Bypass Auth (Quick Demo Mode)
        </button>

        <p style={footerNote}>
          100% Client-Side. Your details persist safely inside localStorage.
        </p>
      </div>
    </div>
  );
}

// Inline Styles for Auth Card
const containerStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0 4rem 0',
};

const cardStyle = {
  width: '100%',
  maxWidth: '430px',
  background: 'rgba(6, 6, 9, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '20px',
  padding: '2.5rem 2rem',
  textAlign: 'center',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(168, 85, 247, 0.05)',
};

const logoWrapper = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: 'rgba(168, 85, 247, 0.1)',
  border: '1px solid rgba(168, 85, 247, 0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1rem auto',
};

const titleStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
  fontFamily: 'Outfit, sans-serif',
  color: '#ffffff',
  letterSpacing: '-0.5px',
};

const subtitleStyle = {
  fontSize: '0.85rem',
  color: 'var(--fg-muted)',
  marginBottom: '2rem',
  fontFamily: 'Outfit, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const tabsRow = {
  display: 'flex',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '10px',
  padding: '4px',
  marginBottom: '1.5rem',
};

const tabBtn = {
  flex: 1,
  padding: '0.6rem 0',
  background: 'transparent',
  border: 'none',
  borderRadius: '8px',
  color: 'var(--fg-muted)',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s',
};

const tabBtnActive = {
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  color: '#ffffff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  textAlign: 'left',
};

const errorBanner = {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  color: '#fca5a5',
  fontSize: '0.85rem',
  lineHeight: '1.4',
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#ffffff',
  fontFamily: 'Outfit, sans-serif',
};

const inputContainer = {
  position: 'relative',
  display: 'flex',
  width: '100%',
};

const inputIcon = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--fg-muted)',
  pointerEvents: 'none',
};

const inputStyle = {
  width: '100%',
  paddingLeft: '2.75rem',
};

const submitBtn = {
  width: '100%',
  marginTop: '0.5rem',
};

const dividerRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  margin: '1.5rem 0',
};

const dividerLine = {
  flex: 1,
  height: '1px',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
};

const dividerText = {
  fontSize: '0.75rem',
  color: 'var(--fg-muted)',
  fontWeight: '600',
};

const demoBtn = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
};

const footerNote = {
  fontSize: '0.75rem',
  color: 'var(--fg-muted)',
  marginTop: '1.5rem',
  lineHeight: '1.4',
};
