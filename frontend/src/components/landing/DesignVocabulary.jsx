"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, Code2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { BRAND } from "@/config/brand";
import { gsap } from "gsap";

const getAccessibleColor = (color, isDark) => {
  if (isDark) {
    if (color === "var(--accent)") return "#6843EC";
    return color;
  }
  switch (color) {
    case "#D2FF3A":
      return "#15803d";
    case "#10b981":
      return "#16a34a";
    case "#0ea5e9":
      return "#0284c7";
    case "#a855f7":
      return "#7c3aed";
    case "var(--accent)":
      return "#6843EC";
    default:
      return color;
  }
};

export default function DesignVocabulary({ theme }) {
  const isDark = theme === "dark";
  const { vocabulary, vocabLoading, vocabError, reloadVocabulary } = useApp();

  const [selectedToken, setSelectedToken] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const vocRef = useRef(null);
  const drawerRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  useEffect(() => {
    if (vocRef.current) {
      gsap.fromTo(
        vocRef.current.querySelectorAll(".anim-voc"),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: vocRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        },
      );
    }
  }, []);

  // Keyboard navigation & accessibility helpers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track drawer trigger element to restore focus on close
  useEffect(() => {
    if (drawerOpen) {
      lastActiveElementRef.current = document.activeElement;
    } else if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }
  }, [drawerOpen]);

  // Focus trap inside drawer
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]',
      );
      if (focusableElements.length > 0) {
        setTimeout(() => {
          focusableElements[0].focus();
        }, 50);
      }

      const handleTabKey = (e) => {
        if (e.key === "Tab") {
          const focusable = Array.from(focusableElements);
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener("keydown", handleTabKey);
      return () => window.removeEventListener("keydown", handleTabKey);
    }
  }, [drawerOpen]);

  const handleCopy = (id, text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Prompt block copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section ref={vocRef} className="w-full max-w-[1280px] mx-auto px-6 flex flex-col">
      <div className="text-center max-w-[620px] mx-auto mb-10">
        <p className="section-label anim-voc">DESIGN TERMINOLOGY DRAWER</p>
        <h2 className="anim-voc text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
          Design Vocabulary & Click-to-Learn Drawer
        </h2>
        <p className="anim-voc text-sm md:text-base text-muted-foreground leading-relaxed">
          Click any token chip below to open our integrated educational panel.
          Learn visual design paradigms and extract technical prompts
          instantly.
        </p>
      </div>

      {/* Chips Grid */}
      <div className="anim-voc mt-8 w-full grid grid-cols-2 sm:grid-cols-4 gap-3 min-h-[150px]">
        {vocabLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full col-span-full">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: i * 0.08 }}
                className="h-[50px] rounded-xl border border-border/40 bg-white/4 skeleton"
              />
            ))}
          </div>
        ) : vocabError ? (
          <div className="flex flex-col items-center gap-4 w-full p-4 col-span-full">
            <div className="flex items-center gap-2 text-warning text-[13.5px] font-semibold">
              <X size={15} className="text-warning" strokeWidth={1.75} />
              <span>Database Connection Offline</span>
            </div>
            <button
              onClick={reloadVocabulary}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-accent border-none cursor-pointer shadow-[0_4px_12px_rgba(104,67,236,0.25)] hover:opacity-90 transition-opacity active-scale-95 btn-focus"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          (vocabulary || []).slice(0, 16).map((token) => {
            const isActive = selectedToken?.id === token.id;
            return (
              <motion.button
                key={token.id}
                onClick={() => {
                  setSelectedToken(token);
                  setDrawerOpen(true);
                }}
                className={`w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 shadow-sm text-center min-h-[50px] leading-tight btn-focus ${
                  isActive
                    ? "bg-accent/8 border border-accent text-accent"
                    : "bg-card border border-border text-foreground hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-md"
                }`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Open educational drawer for ${token.name}`}
              >
                <BookOpen size={11} className="opacity-70 shrink-0" strokeWidth={1.75} />
                <span className="truncate-none">{token.name}</span>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Educational Slide Drawer Panel */}
      <AnimatePresence>
        {drawerOpen && selectedToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex justify-end"
            onClick={() => setDrawerOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-token-title"
          >
            <motion.div
              ref={drawerRef}
              className="w-full max-w-[460px] bg-card h-full shadow-2xl flex flex-col p-8 border-l border-border relative drawer-content-box"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-5 mb-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent bg-accent/8 border border-accent/20 rounded px-1.5 py-0.5">
                    {selectedToken.category}
                  </span>
                  <h3 id="drawer-token-title" className="text-xl font-extrabold text-foreground font-display tracking-tight mt-1.5">
                    {selectedToken.name}
                  </h3>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="bg-muted border border-border rounded w-7 h-7 flex items-center justify-center text-foreground cursor-pointer transition-all duration-200 btn-focus"
                  aria-label="Close drawer"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-6 overflow-y-auto flex-1 pr-1">
                <p className="text-[13.5px] text-muted-foreground leading-relaxed m-0">{selectedToken.description}</p>

                {/* CSS Token Specs */}
                {selectedToken.snippet && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <Code2 size={12} className="text-accent" strokeWidth={1.75} />
                      <span>Design Token Specifications</span>
                    </div>
                    <pre className="bg-black/12 border border-border/40 rounded-lg p-3.5 font-mono text-[11.5px] leading-relaxed text-foreground m-0 w-full overflow-x-auto">
                      {selectedToken.snippet}
                    </pre>
                  </div>
                )}

                {/* Example Prompt */}
                <div className="bg-accent/3 border border-accent/15 rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <Sparkles size={12} className="text-accent-green" style={{ color: getAccessibleColor("#D2FF3A", isDark) }} strokeWidth={1.75} />
                    <span>Compiled AI Prompt Segment</span>
                  </div>
                  <p className="text-xs md:text-[13px] text-foreground font-italic leading-relaxed m-0">
                    "{selectedToken.examplePrompt || selectedToken.example_prompt}"
                  </p>

                  <button
                    onClick={(e) =>
                      handleCopy(
                        selectedToken.id,
                        selectedToken.examplePrompt || selectedToken.example_prompt,
                        e,
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent border-none text-white text-xs font-bold cursor-pointer transition-all duration-200 btn-focus"
                    aria-label="Copy enhanced token prompt segment"
                  >
                    {copiedId === selectedToken.id ? (
                      <>
                        <Check size={13} strokeWidth={1.75} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={13} strokeWidth={1.75} />
                        Copy Token Prompt
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
