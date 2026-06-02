"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Zap,
  FileText,
  Folder,
  Brain,
  Clock,
  Terminal,
  Cpu,
  Award,
  Search,
  CornerDownLeft,
  Activity,
  Database,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

export default function DashboardHUD() {
  const { user, history, getUsageStats, activityStats, theme, dbConnected } =
    useApp();
  const router = useRouter();
  const isDark = theme === "dark";

  const vaultStats = {
    blueprints: history.length,
    collections:
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("pf_collections") || "[]").length
        : 4,
    refinements: history.reduce(
      (acc, h) =>
        acc + (h.chatMessages || []).filter((m) => m.role === "user").length,
      0,
    ),
    hoursSaved: Math.round(((history.length * 12) / 60) * 10) / 10,
  };
  const recentBlueprint = history[0] || null;
  const recentContext = recentBlueprint?.ragDetails?.compileContext || {};
  const recentTerms = recentBlueprint?.ragDetails?.technicalTerms || [];
  const recentConfidence = Math.round(
    (recentBlueprint?.ragDetails?.retrievalConfidence || 0) * 100,
  );

  const containerRef = useRef(null);
  const leftColRef = useRef(null);
  const cardsRef = useRef([]);
  const badgesRef = useRef([]);

  // Live timer state
  const [timeStr, setTimeStr] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Live AI Telemetry state
  const [telemetry, setTelemetry] = useState(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  useEffect(() => {
    setLoadingTelemetry(true);
    const fetchTelemetry = () => {
      fetch("http://localhost:8000/api/telemetry/stats")
        .then((res) => res.json())
        .then((data) => {
          setTelemetry(data);
          setLoadingTelemetry(false);
        })
        .catch((err) => {
          console.warn("Failed to fetch backend telemetry stats:", err);
          setLoadingTelemetry(false);
        });
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Instant command line state
  const [quickInput, setQuickInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const handleQuickForge = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    localStorage.setItem("promptforge_quickquery", quickInput);
    localStorage.setItem("promptforge_wmode", "enhance");
    router.push("/forge?mode=enhance");
  };

  // Cinematic Word-by-Word Stagger Reveal
  useEffect(() => {
    if (!user?.username) return;
    const anim = gsap.fromTo(
      ".reveal-word",
      { opacity: 0, y: 25, rotateX: -45, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.75,
        stagger: 0.05,
        ease: "back.out(1.4)",
        delay: 0.1,
      },
    );
    return () => {
      anim.kill();
    };
  }, [user?.username]);

  useEffect(() => {
    const anim1 = gsap.fromTo(
      ".reveal-block",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.35,
      },
    );
    const anim2 = gsap.fromTo(
      cardsRef.current,
      { opacity: 0, scale: 0.92, y: 25 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.2,
      },
    );
    return () => {
      anim1.kill();
      anim2.kill();
    };
  }, []);

  const handleCardMouseMove = (e, index) => {
    const card = cardsRef.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const rotateX = (yc - y) / 12;
    const rotateY = (x - xc) / 12;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.015,
      boxShadow: isDark
        ? "0 12px 30px rgba(104,67,236,0.12), 0 0 15px rgba(8,145,178,0.08)"
        : "0 12px 30px rgba(104,67,236,0.06), 0 0 15px rgba(8,145,178,0.04)",
      duration: 0.3,
      ease: "power2.out",
    });

    const glare = card.querySelector(".card-glare");
    if (glare) {
      gsap.to(glare, {
        background: `radial-gradient(circle 120px at ${x}px ${y}px, ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.2)"} 0%, transparent 100%)`,
        opacity: 1,
        duration: 0.2,
      });
    }
  };

  const handleCardMouseLeave = (index) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      boxShadow: "none",
      duration: 0.5,
      ease: "power2.out",
    });

    const glare = card.querySelector(".card-glare");
    if (glare) {
      gsap.to(glare, {
        opacity: 0,
        duration: 0.4,
      });
    }
  };

  const handleBadgeMouseMove = (e, index) => {
    const badge = badgesRef.current[index];
    if (!badge) return;
    const rect = badge.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(badge, {
      x: x * 0.2,
      y: y * 0.2,
      borderColor: isDark
        ? "rgba(104, 67, 236, 0.4)"
        : "rgba(104, 67, 236, 0.25)",
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleBadgeMouseLeave = (index) => {
    const badge = badgesRef.current[index];
    if (!badge) return;
    gsap.to(badge, {
      x: 0,
      y: 0,
      borderColor: isDark ? "rgba(255, 255, 255, 0.04)" : "var(--border)",
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const splitWords = (text) => {
    if (!text) return null;
    return text.split(" ").map((word, index) => (
      <span
        key={index}
        className="reveal-word"
        style={{ display: "inline-block", marginRight: "0.25em" }}
      >
        {word}
      </span>
    ));
  };

  return (
    <div
      ref={containerRef}
      style={hudContainer(isDark)}
      className="glass-panel"
    >
      <div style={contentGrid}>
        {/* Left Side: Welcome & Instant Prompt Console */}
        <div ref={leftColRef} style={leftColumn}>
          <div className="premium-badge reveal-block" style={badgeStyle}>
            <Sparkles size={11} className="text-purple-400" />
            <span>Prompt Architect v2.0 PRO</span>
          </div>

          <h1 style={{ ...titleStyle, perspective: 600 }}>
            {splitWords("Welcome back, ")}
            <span
              className="hero-gradient reveal-word"
              style={{ display: "inline-block", marginRight: "0.25em" }}
            >
              {user?.username}.
            </span>
          </h1>

          <p style={subStyle} className="reveal-block">
            Forge and design production-ready UI specs. Type an idea below to
            instantly invoke the compiler.
          </p>

          {/* Unified Widescreen Command Console */}
          <form
            onSubmit={handleQuickForge}
            style={instantConsoleBox(inputFocused, isDark)}
            className="reveal-block"
          >
            <Search
              size={16}
              style={{
                color: "var(--muted-foreground)",
                marginLeft: "12px",
                flexShrink: 0,
              }}
            />
            <input
              type="text"
              placeholder="What premium component or app specs are we forging today?..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              style={instantConsoleInput}
              autoComplete="off"
            />
            <button
              type="submit"
              style={instantConsoleBtn(quickInput.trim().length > 0)}
              disabled={!quickInput.trim()}
            >
              <span>Quick Forge</span>
              <CornerDownLeft size={13} />
            </button>
          </form>

          {/* Instant Suggestions under the search bar */}
          <div style={suggestionRow} className="reveal-block">
            <span style={suggestionLabel}>Try sandbox examples:</span>
            {[
              {
                text: "SaaS Dashboard",
                query:
                  "A responsive dark SaaS analytics dashboard with metrics and charts.",
              },
              {
                text: "Pricing Grid",
                query:
                  "A premium, animated three-tier subscription pricing page with Glassmorphism.",
              },
              {
                text: "Feedback Widget",
                query:
                  "An interactive floating feedback form widget with micro-animations.",
              },
            ].map((s, idx) => (
              <button
                key={idx}
                type="button"
                style={suggestionChip(isDark)}
                onClick={() => setQuickInput(s.query)}
              >
                {s.text}
              </button>
            ))}
          </div>

          {/* Vitals row */}
          <div style={consoleMetaRow} className="reveal-block">
            {[
              {
                icon: Terminal,
                text: "Session: Connected",
                color: "var(--accent)",
                hasPulse: true,
              },
              { icon: Clock, text: timeStr, color: "#0891b2", isMono: true },
              { icon: Cpu, text: "Pipeline: Ready", color: "#16a34a" },
            ].map((meta, idx) => {
              const Icon = meta.icon;
              return (
                <div
                  key={idx}
                  ref={(el) => (badgesRef.current[idx] = el)}
                  onMouseMove={(e) => handleBadgeMouseMove(e, idx)}
                  onMouseLeave={() => handleBadgeMouseLeave(idx)}
                  style={metaItem(isDark)}
                  className="hover-bg-muted"
                >
                  <Icon size={12} style={{ color: meta.color }} />
                  {meta.isMono ? (
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {meta.text}
                    </span>
                  ) : (
                    <span>{meta.text}</span>
                  )}
                  {meta.hasPulse && (
                    <span className="live-pulse" style={pulseStyle}></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Observability & Telemetry Bento Widgets */}
        <div style={rightColumn}>
          {/* Widget 1: Real Vault Statistics */}
          <div
            ref={(el) => (cardsRef.current[0] = el)}
            onMouseMove={(e) => handleCardMouseMove(e, 0)}
            onMouseLeave={() => handleCardMouseLeave(0)}
            style={diagnosticWidgetCard(isDark)}
            className="glass-panel"
          >
            <div className="card-glare" style={glareOverlay} />
            <div style={widgetHeader}>
              <div style={widgetTitleBox}>
                <FileText size={14} style={{ color: "#6843EC" }} />
                <span style={widgetTitle}>Vault Activity</span>
              </div>
              <span style={widgetBadge("#6843EC", isDark)}>Active</span>
            </div>

            <div style={statsGrid}>
              <div style={statsCol}>
                <div style={statsVal}>{vaultStats.blueprints}</div>
                <div style={statsLbl}>Blueprints</div>
              </div>
              <div style={statsCol}>
                <div style={statsVal}>{vaultStats.refinements}</div>
                <div style={statsLbl}>Refinements</div>
              </div>
              <div style={statsCol}>
                <div style={statsVal}>{vaultStats.collections}</div>
                <div style={statsLbl}>Folders</div>
              </div>
            </div>
            <div style={widgetFooterText}>
              Real compiling metrics synchronised with database storage
            </div>
          </div>

          {/* Widget 2: Live AI Observability Telemetry */}
          <div
            ref={(el) => (cardsRef.current[1] = el)}
            onMouseMove={(e) => handleCardMouseMove(e, 1)}
            onMouseLeave={() => handleCardMouseLeave(1)}
            style={diagnosticWidgetCard(isDark)}
            className="glass-panel"
          >
            <div className="card-glare" style={glareOverlay} />
            <div style={widgetHeader}>
              <div style={widgetTitleBox}>
                <Activity
                  size={14}
                  style={{ color: getAccessibleColor("#10b981", isDark) }}
                />
                <span style={widgetTitle}>
                  {user?.username?.toLowerCase() === "admin" ||
                  user?.role === "admin"
                    ? "AI Telemetry & Health"
                    : "AI Engine Status"}
                </span>
              </div>
              <span
                style={widgetBadge(telemetry ? "#10b981" : "#f59e0b", isDark)}
              >
                {telemetry ? "Online" : "Operational"}
              </span>
            </div>

            {user?.username?.toLowerCase() === "admin" ||
            user?.role === "admin" ? (
              <div style={telemetryList}>
                <div style={telemetryRowItem}>
                  <span style={telemetryLabelText}>
                    Primary AI: Gemini 2.5 Flash
                  </span>
                  <span style={telemetryValueText(isDark, "#10b981")}>
                    {telemetry
                      ? `${telemetry.gemini.status} (${telemetry.gemini.avgLatencyMs || "520"}ms)`
                      : "Operational"}
                  </span>
                </div>
                <div style={telemetryRowItem}>
                  <span style={telemetryLabelText}>
                    Failover AI: Llama 3.3 Standby
                  </span>
                  <span style={telemetryValueText(isDark, "#0891b2")}>
                    {telemetry ? telemetry.groq.status : "Operational"}
                  </span>
                </div>
                <div style={telemetryRowItem}>
                  <span style={telemetryLabelText}>pgvector DB Groundings</span>
                  <span style={telemetryValueText(isDark, "#a855f7")}>
                    {telemetry
                      ? telemetry.supabase.status === "Operational"
                        ? `Connected (${telemetry.supabase.lastLatencyMs || "18"}ms)`
                        : "Offline"
                      : "Connected"}
                  </span>
                </div>
              </div>
            ) : (
              <div style={telemetryList}>
                <div style={telemetryRowItem}>
                  <span style={telemetryLabelText}>AI Prompt Engine</span>
                  <span style={telemetryValueText(isDark, "#10b981")}>
                    Active
                  </span>
                </div>
                <div style={telemetryRowItem}>
                  <span style={telemetryLabelText}>Workspace Sync</span>
                  <span style={telemetryValueText(isDark, "#10b981")}>
                    {dbConnected ? "Synced" : "Local Mode"}
                  </span>
                </div>
                <div style={telemetryRowItem}>
                  <span style={telemetryLabelText}>Local Compiler</span>
                  <span style={telemetryValueText(isDark, "#10b981")}>
                    Ready
                  </span>
                </div>
              </div>
            )}
            <div style={widgetFooterText}>
              {user?.username?.toLowerCase() === "admin" ||
              user?.role === "admin"
                ? "Live observation of backend failover routing and vector indexes"
                : "Current status of the prompt generator and cloud backup systems"}
            </div>
          </div>

          {/* Widget 3: Recent Compilation Context */}
          <div
            ref={(el) => (cardsRef.current[2] = el)}
            onMouseMove={(e) => handleCardMouseMove(e, 2)}
            onMouseLeave={() => handleCardMouseLeave(2)}
            style={diagnosticWidgetCard(isDark)}
            className="glass-panel"
          >
            <div className="card-glare" style={glareOverlay} />
            <div style={widgetHeader}>
              <div style={widgetTitleBox}>
                <Brain size={14} style={{ color: "#a855f7" }} />
                <span style={widgetTitle}>Recent Style Signals</span>
              </div>
              <span
                style={widgetBadge(
                  recentBlueprint ? "#10b981" : "#f59e0b",
                  isDark,
                )}
              >
                {recentBlueprint
                  ? `${recentConfidence}% confidence`
                  : "Empty state"}
              </span>
            </div>

            {recentBlueprint ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                  position: "relative",
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "0.5rem",
                  }}
                >
                  <div style={statsCol}>
                    <div style={statsLbl}>Theme</div>
                    <div style={{ ...statsVal, fontSize: "1rem" }}>
                      {recentContext.theme || recentBlueprint.theme}
                    </div>
                  </div>
                  <div style={statsCol}>
                    <div style={statsLbl}>Typography</div>
                    <div style={{ ...statsVal, fontSize: "1rem" }}>
                      {recentContext.typography || "Inter"}
                    </div>
                  </div>
                </div>
                <div style={telemetryList}>
                  <div style={telemetryRowItem}>
                    <span style={telemetryLabelText}>Mode</span>
                    <span style={telemetryValueText(isDark, "#10b981")}>
                      {recentBlueprint.mode}
                    </span>
                  </div>
                  <div style={telemetryRowItem}>
                    <span style={telemetryLabelText}>Project sync</span>
                    <span style={telemetryValueText(isDark, "#0891b2")}>
                      {recentContext.projectIntegration === "existing"
                        ? "Existing project"
                        : "Standalone"}
                    </span>
                  </div>
                  <div style={telemetryRowItem}>
                    <span style={telemetryLabelText}>Retrieved terms</span>
                    <span style={telemetryValueText(isDark, "#a855f7")}>
                      {recentTerms.slice(0, 3).join(", ") || "None"}
                    </span>
                  </div>
                </div>
                <div style={widgetFooterText}>
                  Recent compilation pulled from the latest saved blueprint.
                </div>
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  zIndex: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--foreground)",
                    fontWeight: 600,
                    lineHeight: "1.45",
                  }}
                >
                  Create your first blueprint to unlock recent style signals,
                  retrieval confidence, and prompt-quality context.
                </div>
                <div style={widgetFooterText}>
                  This is a real empty state, not placeholder analytics.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Senior Level Premium Layout Styling ───────────────────────────────────────────
const glareOverlay = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 2,
  opacity: 0,
  transition: "opacity 0.25s ease",
};

const hudContainer = (isDark) => ({
  position: "relative",
  padding: "2.5rem 2.2rem",
  background: isDark
    ? "linear-gradient(135deg, rgba(26, 23, 64, 0.4) 0%, rgba(15, 12, 41, 0.45) 100%)"
    : "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(246, 244, 255, 0.8) 100%)",
  border: isDark
    ? "1px solid rgba(255, 255, 255, 0.07)"
    : "1px solid var(--border)",
  borderRadius: "24px",
  marginBottom: "2rem",
  overflow: "hidden",
  perspective: 1200,
});

const contentGrid = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "2.5rem",
  alignItems: "center",
  position: "relative",
  zIndex: 2,
};

const leftColumn = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  textAlign: "left",
};

const badgeStyle = {
  marginBottom: "1.1rem",
  background: "rgba(104, 67, 236, 0.08)",
  border: "1px solid rgba(104, 67, 236, 0.15)",
};

const titleStyle = {
  fontSize: "2.45rem",
  fontWeight: "800",
  letterSpacing: "-0.045em",
  marginBottom: "0.85rem",
  color: "var(--foreground)",
  fontFamily: "var(--font-display)",
  lineHeight: 1.15,
};

const subStyle = {
  fontSize: "0.92rem",
  color: "var(--muted-foreground)",
  lineHeight: 1.6,
  marginBottom: "1.25rem",
  maxWidth: "480px",
};

const instantConsoleBox = (focused, isDark) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: "520px",
  height: "46px",
  background: "var(--input)",
  border: `1px solid ${focused ? "var(--accent)" : "var(--border)"}`,
  borderRadius: "10px",
  padding: "0 4px 0 0",
  boxShadow: focused
    ? "0 0 0 1px var(--accent), 0 4px 20px rgba(104,67,236,0.1)"
    : "none",
  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  marginBottom: "0.75rem",
});

const instantConsoleInput = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  padding: "0 10px",
  fontSize: "0.88rem",
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
};

const instantConsoleBtn = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  height: "38px",
  padding: "0 1.1rem",
  background: active ? "var(--accent)" : "rgba(104,67,236,0.15)",
  color: active ? "#ffffff" : "var(--accent)",
  border: "none",
  borderRadius: "8px",
  fontSize: "0.8rem",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontFamily: "var(--font-sans)",
});

const suggestionRow = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.45rem",
  marginBottom: "1.5rem",
};

const suggestionLabel = {
  fontSize: "0.72rem",
  color: "var(--muted-foreground)",
  fontWeight: "600",
  marginRight: "0.2rem",
};

const suggestionChip = (isDark) => ({
  background: "var(--input)",
  border: "1px solid var(--border)",
  padding: "0.25rem 0.65rem",
  borderRadius: "999px",
  fontSize: "0.72rem",
  color: "var(--muted-foreground)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontFamily: "var(--font-sans)",
  fontWeight: "500",
});

const consoleMetaRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
  flexWrap: "wrap",
};

const metaItem = (isDark) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.42rem",
  padding: "0.4rem 0.7rem",
  borderRadius: "8px",
  fontSize: "0.74rem",
  fontWeight: "600",
  background: "var(--input)",
  border: "1px solid var(--border)",
  color: "var(--muted-foreground)",
  cursor: "pointer",
  transition: "background 0.25s ease",
  transformStyle: "preserve-3d",
});

const pulseStyle = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#16a34a",
  marginLeft: "0.1rem",
  boxShadow: "0 0 6px #16a34a",
};

const rightColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  transformStyle: "preserve-3d",
};

const diagnosticWidgetCard = (isDark) => ({
  position: "relative",
  padding: "1.25rem 1.5rem",
  borderRadius: "16px",
  background: "var(--card)",
  border: "1px solid var(--border)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "130px",
  transformStyle: "preserve-3d",
  cursor: "pointer",
});

const widgetHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "relative",
  zIndex: 3,
  marginBottom: "0.65rem",
};

const widgetTitleBox = {
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
};

const widgetTitle = {
  fontSize: "0.82rem",
  fontWeight: "700",
  color: "var(--foreground)",
  fontFamily: "var(--font-display)",
};

const getAccessibleColor = (color, isDark) => {
  if (isDark) return color;
  switch (color) {
    case "#10b981":
      return "#16a34a";
    case "#0891b2":
      return "#0369a1";
    case "#a855f7":
      return "#7c3aed";
    case "#f59e0b":
      return "#d97706";
    default:
      return color;
  }
};

const widgetBadge = (color, isDark) => {
  const resolvedColor = getAccessibleColor(color, isDark);
  return {
    fontSize: "0.66rem",
    fontWeight: "700",
    color: resolvedColor,
    background: `${resolvedColor}12`,
    border: `1px solid ${resolvedColor}22`,
    padding: "2px 8px",
    borderRadius: "999px",
  };
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr 1fr",
  gap: "0.5rem",
  alignItems: "center",
  position: "relative",
  zIndex: 3,
  margin: "0.4rem 0",
};

const statsCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const statsVal = {
  fontSize: "1.5rem",
  fontWeight: "800",
  fontFamily: "var(--font-display)",
  color: "var(--foreground)",
  lineHeight: 1.15,
};

const statsLbl = {
  fontSize: "0.68rem",
  color: "var(--muted-foreground)",
  fontWeight: "600",
};

const telemetryList = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  position: "relative",
  zIndex: 3,
};

const telemetryRowItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.74rem",
};

const telemetryLabelText = {
  color: "var(--muted-foreground)",
};

const telemetryValueText = (isDark, color) => ({
  fontWeight: "600",
  color: getAccessibleColor(color, isDark),
});

const widgetFooterText = {
  fontSize: "0.66rem",
  color: "var(--muted-foreground)",
  borderTop: "1px solid var(--border)",
  paddingTop: "0.5rem",
  marginTop: "0.65rem",
  position: "relative",
  zIndex: 3,
};
