"use client";

import React from 'react';
import { AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { track, EVENTS } from '../lib/analytics';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Error Boundary caught crash]', error, errorInfo);
    track('application_crashed', {
      message: error?.message || 'Unknown error',
      stack: error?.stack?.slice(0, 300),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={errorContainer} className="glass-panel">
          <div style={iconBox}>
            <AlertCircle size={28} style={{ color: '#ef4444' }} />
          </div>
          <div style={contentBox}>
            <h3 style={errorTitle}>Something went wrong</h3>
            <p style={errorDesc}>
              A client-side error occurred inside this module. Your workspace drafts and history are safe.
            </p>
            {this.state.error?.message && (
              <code style={errorCode}>{this.state.error.message}</code>
            )}
            <div style={btnRow}>
              <button
                onClick={() => window.location.reload()}
                style={retryBtn}
                className="btn-accent shine-effect"
              >
                <RefreshCw size={14} />
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={resetBtn}
              >
                Dismiss
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Styles ───────────────────────────────────────────────────
const errorContainer = {
  display: 'flex',
  gap: '1.25rem',
  padding: '1.75rem',
  background: 'rgba(239, 68, 68, 0.03)',
  border: '1px solid rgba(239, 68, 68, 0.15)',
  borderRadius: '16px',
  margin: '1.5rem 0',
  width: '100%',
  alignItems: 'flex-start',
};

const iconBox = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const contentBox = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  flex: 1,
};

const errorTitle = {
  fontSize: '1rem',
  fontWeight: '700',
  color: '#ffffff',
  margin: 0,
  fontFamily: 'var(--font-display)',
};

const errorDesc = {
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  lineHeight: '1.5',
  margin: 0,
};

const errorCode = {
  fontSize: '0.78rem',
  fontFamily: 'var(--font-mono)',
  color: '#ef4444',
  background: 'rgba(239, 68, 68, 0.05)',
  padding: '0.4rem 0.65rem',
  borderRadius: '6px',
  border: '1px solid rgba(239, 68, 68, 0.1)',
  margin: '0.25rem 0',
  wordBreak: 'break-all',
};

const btnRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginTop: '0.5rem',
};

const retryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.45rem 1rem',
  fontSize: '0.8rem',
  fontWeight: '700',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  background: '#fbbf24',
  color: '#000',
  fontFamily: 'var(--font-sans)',
};

const resetBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.45rem 0.85rem',
  fontSize: '0.8rem',
  fontWeight: '600',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
};
