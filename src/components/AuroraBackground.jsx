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

    // Respect prefers-reduced-motion — skip animation entirely
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

    // Reduced orb radii (0.45 → 0.32) for lighter GPU footprint
    const orbs = isDark ? [
      { x: 0.15, y: 0.35, r: 0.32, color: 'rgba(251,191,36,0.08)', speedX: 0.0002, speedY: 0.00015, phase: 0 },
      { x: 0.75, y: 0.55, r: 0.36, color: 'rgba(249,115,22,0.06)', speedX: -0.00015, speedY: 0.0002, phase: 1 },
      { x: 0.4, y: 0.75, r: 0.28, color: 'rgba(168,85,247,0.04)', speedX: 0.00025, speedY: -0.00015, phase: 2 },
      { x: 0.85, y: 0.15, r: 0.24, color: 'rgba(251,191,36,0.05)', speedX: -0.0002, speedY: 0.00025, phase: 3 },
    ] : [
      { x: 0.15, y: 0.3, r: 0.32, color: 'rgba(251,191,36,0.04)', speedX: 0.00015, speedY: 0.0001, phase: 0 },
      { x: 0.7, y: 0.5, r: 0.36, color: 'rgba(249,115,22,0.03)', speedX: -0.0001, speedY: 0.00015, phase: 1 },
      { x: 0.45, y: 0.7, r: 0.28, color: 'rgba(168,85,247,0.02)', speedX: 0.0002, speedY: -0.0001, phase: 2 },
      { x: 0.8, y: 0.15, r: 0.22, color: 'rgba(251,191,36,0.03)', speedX: -0.00015, speedY: 0.0002, phase: 3 },
    ];

    let time = 0;

    const draw = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        const cx = (orb.x + Math.sin(time * orb.speedX + orb.phase) * 0.08) * canvas.width;
        const cy = (orb.y + Math.cos(time * orb.speedY + orb.phase) * 0.06) * canvas.height;
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
      {/* CSS Blueprint & Node Animations Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bg-spin-clockwise {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes bg-spin-counter {
          0% { transform: translate(-50%, -50%) rotate(360deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes flow-dash {
          to { stroke-dashoffset: -40; }
        }
      ` }} />

      {/* 1. Animated Radial Spotlights Canvas */}
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

      {/* 2. Concentric Blueprint Coordinate Rings (Slow Clockwise Rotation) */}
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
            radial-gradient(circle, transparent 0%, transparent 150px, rgba(251, 191, 36, ${isDark ? '0.012' : '0.024'}) 151px, transparent 152px),
            radial-gradient(circle, transparent 0%, transparent 300px, rgba(251, 191, 36, ${isDark ? '0.01' : '0.02'}) 301px, transparent 302px),
            radial-gradient(circle, transparent 0%, transparent 600px, rgba(251, 191, 36, ${isDark ? '0.007' : '0.014'}) 601px, transparent 602px),
            radial-gradient(circle, transparent 0%, transparent 950px, rgba(251, 191, 36, ${isDark ? '0.004' : '0.008'}) 951px, transparent 952px)
          `,
          transform: 'translate(-50%, -50%)',
          opacity: 0.95,
          willChange: 'transform',
        }}
      />

      {/* 3. Subtle Dashed Radial Orbit Coordinate (Slow Counter-Clockwise Rotation) */}
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
          backgroundImage: `radial-gradient(circle, transparent 0%, transparent 450px, rgba(251, 191, 36, ${isDark ? '0.006' : '0.012'}) 451px, transparent 453px)`,
          maskImage: 'repeating-conic-gradient(black 0deg 3deg, transparent 3deg 9deg)',
          WebkitMaskImage: 'repeating-conic-gradient(black 0deg 3deg, transparent 3deg 9deg)',
          transform: 'translate(-50%, -50%)',
          opacity: 0.8,
          willChange: 'transform',
        }}
      />

      {/* 4. Live SVG Networking Constellations */}
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
        {/* Curving Flow 1 */}
        <path
          d="M -100 200 C 300 280, 550 80, 1400 130"
          fill="none"
          stroke={isDark ? "rgba(251, 191, 36, 0.07)" : "rgba(251, 191, 36, 0.16)"}
          strokeWidth="1.25"
          strokeDasharray="6, 6"
          style={{ animation: 'flow-dash 35s linear infinite' }}
        />
        {/* Curving Flow 2 */}
        <path
          d="M 100 850 C 400 680, 750 780, 1500 480"
          fill="none"
          stroke={isDark ? "rgba(251, 191, 36, 0.07)" : "rgba(251, 191, 36, 0.16)"}
          strokeWidth="1.25"
          strokeDasharray="6, 6"
          style={{ animation: 'flow-dash 45s linear infinite' }}
        />
      </svg>

      {/* 5. Radial Ambient Dark Vignette (Cinematic Edge Shading) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 35%, rgba(8,7,17,0.55) 100%)'
            : 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.02) 100%)',
          transition: 'background var(--duration-slow) var(--ease-in-out)',
        }}
      />
    </>
  );
}
