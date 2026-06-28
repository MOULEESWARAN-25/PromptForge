"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Check, ArrowRight, Lock } from "lucide-react";
import { BRAND } from "@/config/brand";
import { gsap } from "gsap";

const AUDIENCES = [
  {
    title: "Cursor & Bolt Users",
    desc: "Feed AI compilers highly structured prompt models that build accurate layouts on the very first try.",
  },
  {
    title: "Indie Hackers",
    desc: "Ship production-ready SaaS landing pages and dashboard foundations with zero design debt.",
  },
  {
    title: "Frontend Engineers",
    desc: "Inject precise HSL design systems, spacing grids, and custom motion variables into codebase codebases.",
  },
  {
    title: "Students & Builders",
    desc: "Master advanced visual design jargon and semantic terms while engineering application blueprints.",
  },
];

export default function CTA({ theme, user }) {
  const isDark = theme === "dark";
  const targetRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const sections = [
      { ref: targetRef, selector: ".anim-target" },
      { ref: ctaRef, selector: ".anim-cta" },
    ];

    sections.forEach(({ ref, selector }) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current.querySelectorAll(selector),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    });
  }, []);

  return (
    <div className="w-full flex flex-col gap-16 md:gap-24">
      {/* ── SECTION 9: "WHO IT'S FOR" AUDIENCE SEGMENT ── */}
      <section ref={targetRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
        <div className="text-center max-w-[620px] mx-auto mb-10">
          <p className="section-label anim-target">TARGET AUDIENCE</p>
          <h2 className="anim-target text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
            Who It's For
          </h2>
          <p className="anim-target text-sm md:text-base text-muted-foreground leading-relaxed">
            {BRAND.name} is built for builders who demand visual execution on the
            first build.
          </p>
        </div>

        <div className="anim-target audience-grid-style grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {AUDIENCES.map((aud, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-card border border-border transition-all duration-200 flex flex-col gap-2 glass-panel"
            >
              <div className="flex gap-2 items-center">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-accent/8 border border-accent/15 shrink-0">
                  <Check size={11} className="text-accent" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-extrabold text-foreground font-display tracking-tight">{aud.title}</h3>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{aud.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 10: IMMERSIVE ULTRAVIOLET FINAL CTA ── */}
      <section ref={ctaRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col mb-12">
        <div 
          className="anim-cta glass-panel relative overflow-hidden flex flex-col items-center justify-center px-6 py-16 md:py-20 rounded-[32px] border border-accent/20"
          style={{
            background: isDark 
              ? "linear-gradient(135deg, #130a2f 0%, #0c0b20 45%, #050410 100%)" 
              : "linear-gradient(135deg, #f5f3ff 0%, #ffffff 45%, #f9fafb 100%)",
            boxShadow: isDark 
              ? "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.04)" 
              : "0 32px 80px rgba(104,67,236,0.06), inset 0 1px 1px rgba(255,255,255,0.9)"
          }}
        >
          {/* Ambient Glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full z-0 pointer-events-none filter blur-[50px]"
            style={{
              background: "radial-gradient(circle, rgba(104,67,236,0.09) 0%, transparent 60%)"
            }}
          />

          <div className="relative z-10 text-center flex flex-col items-center gap-4 max-w-[600px]">
            <h2 className="text-3xl md:text-[2.1rem] font-black font-display text-foreground leading-[1.15] tracking-tight">
              Ready to compile surgical app specifications?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stop guessing. Transform your visual requirements into precise
              blueprints and launch your next high-fidelity app in seconds.
            </p>

            <Link
              href={user ? "/dashboard" : "/auth?redirect=/dashboard"}
              className="btn-accent shine-effect active-scale-95 btn-focus inline-flex items-center gap-2 px-6 py-3 rounded-lg text-accent-foreground font-bold cursor-pointer transition-all duration-200"
              aria-label={`Access ${BRAND.name} Studio workspace`}
            >
              Launch {BRAND.name} Studio
              <ArrowRight size={15} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
