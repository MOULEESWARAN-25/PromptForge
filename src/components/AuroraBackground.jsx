"use client";

import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function AuroraBackground() {
  const { theme } = useApp();
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (theme !== 'dark') {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Orbs configuration
    const orbs = [
      { x: 0.2, y: 0.3, r: 0.35, color: 'rgba(251,191,36,0.07)', speedX: 0.0003, speedY: 0.0002, phase: 0 },
      { x: 0.75, y: 0.6, r: 0.4, color: 'rgba(59,91,219,0.05)', speedX: -0.0002, speedY: 0.0003, phase: 1 },
      { x: 0.5, y: 0.8, r: 0.3, color: 'rgba(251,191,36,0.04)', speedX: 0.0004, speedY: -0.0002, phase: 2 },
      { x: 0.85, y: 0.15, r: 0.25, color: 'rgba(99,102,241,0.04)', speedX: -0.0003, speedY: 0.0004, phase: 3 },
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
  }, [theme]);

  if (theme !== 'dark') {
    // Light mode: very subtle dot grid, no blobs
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.8,
        }}
      />
    );
  }

  return (
    <>
      {/* Canvas aurora */}
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
      {/* Dot grid overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </>
  );
}
