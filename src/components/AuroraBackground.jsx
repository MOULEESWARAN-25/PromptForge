"use client";

import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function AuroraBackground() {
  const { theme } = useApp();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Purple + green aurora orbs matching the new palette
    const orbs = isDark ? [
      // Main purple glow — upper left (like Present.ai reference)
      { x: 0.10, y: 0.25, r: 0.45, color: 'rgba(104,67,236,0.13)', speedX: 0.00018, speedY: 0.00012, phase: 0 },
      // Deep purple center-right
      { x: 0.72, y: 0.50, r: 0.38, color: 'rgba(130,80,255,0.09)', speedX: -0.00012, speedY: 0.00018, phase: 1.5 },
      // Green accent — bottom right (subtle)
      { x: 0.82, y: 0.78, r: 0.28, color: 'rgba(210,255,58,0.05)', speedX: 0.00022, speedY: -0.00014, phase: 3 },
      // Soft indigo — top right
      { x: 0.88, y: 0.12, r: 0.30, color: 'rgba(80,50,200,0.07)', speedX: -0.00018, speedY: 0.00022, phase: 4.5 },
    ] : [
      { x: 0.15, y: 0.3,  r: 0.38, color: 'rgba(104,67,236,0.06)', speedX: 0.00012, speedY: 0.00008, phase: 0 },
      { x: 0.70, y: 0.50, r: 0.32, color: 'rgba(130,80,255,0.04)', speedX: -0.00008, speedY: 0.00012, phase: 1.5 },
      { x: 0.80, y: 0.75, r: 0.22, color: 'rgba(210,255,58,0.025)', speedX: 0.00016, speedY: -0.00010, phase: 3 },
      { x: 0.85, y: 0.15, r: 0.24, color: 'rgba(80,50,200,0.035)', speedX: -0.00012, speedY: 0.00016, phase: 4.5 },
    ];

    let time = 0;

    const draw = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        const cx = (orb.x + Math.sin(time * orb.speedX + orb.phase) * 0.09) * canvas.width;
        const cy = (orb.y + Math.cos(time * orb.speedY + orb.phase) * 0.07) * canvas.height;
        const radius = orb.r * Math.max(canvas.width, canvas.height);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [theme, isDark]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bg-spin-clockwise {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes bg-spin-counter {
          0%   { transform: translate(-50%, -50%) rotate(360deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes flow-dash {
          to { stroke-dashoffset: -40; }
        }
      ` }} />

      {/* 1. Animated Purple Aurora Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />

      {/* 2. Concentric Purple Coordinate Rings */}
      <div
        style={{
          position: 'fixed',
          left: '0%',
          top: '50%',
          width: '1600px',
          height: '1600px',
          zIndex: 1,
          pointerEvents: 'none',
          animation: 'bg-spin-clockwise 150s linear infinite',
          backgroundImage: `
            radial-gradient(circle, transparent 0%, transparent 150px, rgba(104, 67, 236, ${isDark ? '0.018' : '0.020'}) 151px, transparent 152px),
            radial-gradient(circle, transparent 0%, transparent 300px, rgba(104, 67, 236, ${isDark ? '0.012' : '0.015'}) 301px, transparent 302px),
            radial-gradient(circle, transparent 0%, transparent 600px, rgba(104, 67, 236, ${isDark ? '0.008' : '0.010'}) 601px, transparent 602px),
            radial-gradient(circle, transparent 0%, transparent 950px, rgba(104, 67, 236, ${isDark ? '0.005' : '0.006'}) 951px, transparent 952px)
          `,
          transform: 'translate(-50%, -50%)',
          opacity: 0.95,
          willChange: 'transform',
        }}
      />

      {/* 3. Dashed Orbit Ring */}
      <div
        style={{
          position: 'fixed',
          left: '0%',
          top: '50%',
          width: '1300px',
          height: '1300px',
          zIndex: 1,
          pointerEvents: 'none',
          animation: 'bg-spin-counter 180s linear infinite',
          backgroundImage: `radial-gradient(circle, transparent 0%, transparent 450px, rgba(104, 67, 236, ${isDark ? '0.008' : '0.010'}) 451px, transparent 453px)`,
          maskImage: 'repeating-conic-gradient(black 0deg 3deg, transparent 3deg 9deg)',
          WebkitMaskImage: 'repeating-conic-gradient(black 0deg 3deg, transparent 3deg 9deg)',
          transform: 'translate(-50%, -50%)',
          opacity: 0.8,
          willChange: 'transform',
        }}
      />

      {/* 4. Flowing Line Paths */}
      <svg
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <path
          d="M -100 200 C 300 280, 550 80, 1400 130"
          fill="none"
          stroke={isDark ? 'rgba(104, 67, 236, 0.10)' : 'rgba(104, 67, 236, 0.12)'}
          strokeWidth="1.25"
          strokeDasharray="6, 6"
          style={{ animation: 'flow-dash 35s linear infinite' }}
        />
        <path
          d="M 100 850 C 400 680, 750 780, 1500 480"
          fill="none"
          stroke={isDark ? 'rgba(104, 67, 236, 0.07)' : 'rgba(104, 67, 236, 0.09)'}
          strokeWidth="1.25"
          strokeDasharray="6, 6"
          style={{ animation: 'flow-dash 45s linear infinite' }}
        />
      </svg>

      {/* 5. Cinematic Edge Vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 30%, rgba(12,10,28,0.60) 100%)'
            : 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.02) 100%)',
          transition: 'background var(--duration-slow) var(--ease-in-out)',
        }}
      />
    </>
  );
}
