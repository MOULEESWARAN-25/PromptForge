"use client";

import React from 'react';

export default function AuroraBackground() {
  return (
    <div style={containerStyle}>
      <div style={{ ...blobStyle, ...blob1 }} />
      <div style={{ ...blobStyle, ...blob2 }} />
      <div style={{ ...blobStyle, ...blob3 }} />
      <div style={gridOverlayStyle} />
    </div>
  );
}

// Inline styles for high-fidelity animations without CSS loading dependency
const containerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -10,
  overflow: 'hidden',
  backgroundColor: 'var(--bg-color)',
  transition: 'background-color 0.4s ease',
  pointerEvents: 'none',
};

const blobStyle = {
  position: 'absolute',
  width: '60vw',
  height: '60vw',
  borderRadius: '50%',
  filter: 'blur(100px) saturate(150%)',
  opacity: 0.28,
  mixBlendMode: 'screen',
  pointerEvents: 'none',
  animation: 'pulse-glow 15s infinite alternate ease-in-out',
};

const blob1 = {
  top: '-20%',
  left: '-10%',
  background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)', // Violet
};

const blob2 = {
  bottom: '-10%',
  right: '-10%',
  background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)', // Teal
  animationDelay: '-5s',
};

const blob3 = {
  top: '40%',
  left: '60%',
  width: '50vw',
  height: '50vw',
  background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)', // Pink
  animationDelay: '-10s',
};

const gridOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px)`,
  backgroundSize: '24px 24px',
  opacity: 0.7,
};
