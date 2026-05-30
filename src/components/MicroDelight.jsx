"use client";

import { useEffect, useRef } from 'react';
import { track, EVENTS } from '@/lib/analytics';

// ─── Pure CSS/JS Confetti — no external dependencies ────────────────────────
// Uses canvas API for smooth particle animation

export default function MicroDelight({ trigger = false, duration = 1800 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    track(EVENTS.CELEBRATION_SHOWN);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle config
    const COLORS = ['#7c3aed', '#db2777', '#0891b2', '#059669', '#fbbf24', '#f97316', '#a78bfa', '#34d399'];
    const PARTICLE_COUNT = 120;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.38,
        vx: (Math.random() - 0.5) * 14,
        vy: -(Math.random() * 12 + 4),
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        opacity: 1,
        gravity: 0.35 + Math.random() * 0.2,
      });
    }

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fadeStart = duration * 0.6;
      const fadeProgress = elapsed > fadeStart ? (elapsed - fadeStart) / (duration - fadeStart) : 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - fadeProgress);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [trigger, duration]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
