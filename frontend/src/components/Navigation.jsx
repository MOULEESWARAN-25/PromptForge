"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LogOut,
  Sun,
  Moon,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  Palette,
  Command,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { track, EVENTS } from "../lib/analytics";
import { BRAND } from "../config/brand";
import { cn } from "@/lib/cn";
import { FEATURE_FLAGS } from "../config/featureFlags";

// Dynamic imports for bundle optimization
const SettingsDrawer = dynamic(() => import("./SettingsDrawer"), { ssr: false });
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

// ─── Nav link definitions ─────────────────────────────────────────
const PRIVATE_LINKS = [
  { href: "/dashboard",              label: "Workspace",       icon: LayoutDashboard },
  { href: "/dashboard/observability", label: "Workspace Health",  icon: Activity },
  { href: "/vocabulary",             label: "Design Tokens",   icon: Palette },
];

const PUBLIC_LINKS = [
  { href: "/features/prompt-builder", label: "Features", icon: Zap },
];

// ─── Shared icon button class ─────────────────────────────────────
const ICON_BTN = cn(
  "flex items-center justify-center",
  "w-9 h-9 min-w-[44px] min-h-[44px]",
  "bg-transparent border border-border",
  "rounded-md",
  "text-muted-foreground",
  "cursor-pointer",
  "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
  "hover:bg-muted hover:text-foreground hover:border-muted-foreground",
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
);

export default function Navigation() {
  const { user, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const shouldHideNav = pathname === "/" || pathname === "/auth";
  if (shouldHideNav) return null;

  const handleLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
    track(EVENTS.SETTINGS_OPENED);
  };

  const isDark = theme === "dark";
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "PF";
  const displayName = user?.username || user?.email?.split("@")[0] || "User";
  const isPrivatePage = user && pathname !== "/" && !pathname.startsWith("/features");
  const filteredPrivateLinks = PRIVATE_LINKS.filter(
    (link) => link.href !== "/dashboard/observability" || FEATURE_FLAGS.QUALITY_PANEL_ENABLED
  );
  const navLinks = isPrivatePage ? filteredPrivateLinks : PUBLIC_LINKS;

  return (
    <>
      {/* ── Navbar ────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          // Floating pill shape
          "sticky top-3 z-1000",
          "mx-auto my-3 mb-4",
          "w-[calc(100%-2rem)] max-w-[1440px]",
          "h-14",
          "px-5",
          "flex items-center justify-between",
          // Glass surface
          "backdrop-blur-xl",
          "border border-border",
          "rounded-lg",
          isDark
            ? "bg-black/75 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]"
            : "bg-white/85 shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]",
        )}
      >
        {/* Left: Brand logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          aria-label={`${BRAND.name} home`}
          className="flex items-center gap-2.5 shrink-0 no-underline"
        >
          <div className={cn(
            "w-7 h-7 flex items-center justify-center shrink-0",
            "rounded-[7px]",
            "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]",
            "border border-[color-mix(in_srgb,var(--accent)_20%,transparent)]",
          )}>
            <Sparkles size={14} strokeWidth={1.75} className="text-accent" />
          </div>
          <span className={cn(
            "text-[1.05rem] font-extrabold tracking-[-0.04em]",
            "text-foreground",
          )}>
            {BRAND.name}
          </span>
        </Link>

        {/* Center: Desktop nav links — hidden below lg breakpoint via CSS */}
        <div
          role="menubar"
          className="hidden lg:flex items-center gap-1"
        >
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 no-underline",
                  "text-[0.83rem] font-semibold",
                  "px-[0.9rem] py-[0.45rem]",
                  "rounded-md",
                  "border",
                  "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isActive
                    ? "text-accent bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] border-[color-mix(in_srgb,var(--accent)_15%,transparent)]"
                    : "text-muted-foreground bg-transparent border-transparent hover:text-foreground hover:bg-muted",
                  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                )}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* Command Palette trigger — desktop only */}
          <button
            onClick={() => {
              track(EVENTS.COMMAND_PALETTE_OPENED);
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
            }}
            title="Command Palette (Ctrl+K)"
            aria-label="Open command palette"
            className={cn(
              "hidden lg:flex items-center gap-1.5",
              "px-3 py-1.5",
              "bg-input border border-border",
              "rounded-md",
              "text-muted-foreground text-[0.72rem] font-semibold",
              "cursor-pointer transition-all duration-200",
              "hover:border-muted-foreground hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
            )}
          >
            <Command size={12} strokeWidth={1.75} />
            <span>⌘K</span>
          </button>

          {/* Theme toggle — desktop only */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn("hidden lg:flex touch-target", ICON_BTN)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? "sun" : "moon"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDark
                  ? <Sun size={16} strokeWidth={1.75} className="text-accent" />
                  : <Moon size={16} strokeWidth={1.75} className="text-accent" />
                }
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Authenticated user actions */}
          {user ? (
            pathname === "/" || pathname.startsWith("/features") ? (
              // Public page + logged in → Go to Dashboard (desktop)
              <Link
                href="/dashboard"
                className={cn(
                  "hidden lg:inline-flex items-center",
                  "px-4 py-2 min-h-[36px]",
                  "bg-accent text-white",
                  "text-[0.85rem] font-bold no-underline",
                  "rounded-md border-none cursor-pointer",
                  "transition-all duration-150",
                  "hover:opacity-90 hover:-translate-y-px",
                  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                )}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                {/* Settings button — desktop */}
                <button
                  onClick={handleSettingsOpen}
                  title="Workspace Settings"
                  aria-label="Open settings"
                  className={cn("hidden lg:flex touch-target", ICON_BTN)}
                >
                  <Settings size={16} strokeWidth={1.75} />
                </button>

                {/* User avatar pill */}
                <div
                  title={user.email}
                  className={cn(
                    "flex items-center gap-2",
                    "pl-1 pr-3 py-1",
                    "border border-border rounded-full",
                    "bg-input",
                  )}
                >
                  {/* Avatar circle */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "w-[26px] h-[26px] shrink-0",
                      "rounded-full flex items-center justify-center",
                      "bg-accent text-white",
                      "text-[0.62rem] font-bold",
                    )}
                  >
                    {initials}
                  </div>
                  {/* Username — hidden on mobile */}
                  <span className="hidden lg:block text-[0.78rem] font-semibold text-foreground max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {displayName}
                  </span>
                </div>

                {/* Logout — desktop */}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className={cn(
                    "hidden lg:flex touch-target",
                    ICON_BTN,
                    "text-destructive border-destructive/30",
                    "hover:bg-destructive/10 hover:border-destructive/50",
                  )}
                >
                  <LogOut size={15} strokeWidth={1.75} />
                </button>
              </>
            )
          ) : (
            // Guest → Sign In
            <Link
              href="/auth"
              className={cn(
                "hidden lg:inline-flex items-center",
                "px-4 py-2 min-h-[36px]",
                "bg-accent text-white",
                "text-[0.85rem] font-bold no-underline",
                "rounded-md border-none cursor-pointer",
                "transition-all duration-150",
                "hover:opacity-90 hover:-translate-y-px",
                "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
              )}
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle — visible below lg */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className={cn("flex lg:hidden touch-target", ICON_BTN)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileMenuOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                {mobileMenuOpen
                  ? <X size={18} strokeWidth={1.75} />
                  : <Menu size={18} strokeWidth={1.75} />
                }
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile Menu Drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-modal="true"
            className={cn(
              "absolute left-4 right-4 top-[76px]",
              "z-999",
              "bg-card border border-border",
              "rounded-lg",
              "p-5",
              "shadow-[0_20px_40px_rgba(0,0,0,0.3)]",
              "backdrop-blur-xl",
              "flex flex-col gap-3",
              // Only show below lg breakpoint
              "lg:hidden",
            )}
          >
            {/* Nav links */}
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 no-underline",
                    "px-4 py-3 min-h-[44px]",
                    "rounded-md border",
                    "text-[0.9rem] font-semibold",
                    "transition-all duration-150",
                    isActive
                      ? "text-accent bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] border-[color-mix(in_srgb,var(--accent)_15%,transparent)]"
                      : "text-muted-foreground bg-transparent border-transparent hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  <span>{label}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={cn(
                "flex items-center gap-3 w-full text-left",
                "px-4 py-3 min-h-[44px]",
                "rounded-md border-none bg-transparent",
                "text-[0.9rem] font-semibold text-muted-foreground",
                "cursor-pointer transition-colors duration-150",
                "hover:bg-muted hover:text-foreground",
                "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
              )}
            >
              {isDark
                ? <Sun size={16} strokeWidth={1.75} className="text-accent" />
                : <Moon size={16} strokeWidth={1.75} />
              }
              <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
            </button>

            {/* Authenticated mobile actions */}
            {user ? (
              pathname === "/" || pathname.startsWith("/features") ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center justify-center no-underline",
                    "px-4 py-3 min-h-[44px] mt-1",
                    "bg-accent text-white",
                    "text-[0.9rem] font-bold",
                    "rounded-md border-none",
                    "transition-all duration-150 hover:opacity-90",
                  )}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => { handleSettingsOpen(); setMobileMenuOpen(false); }}
                    className={cn(
                      "flex items-center gap-3 w-full text-left",
                      "px-4 py-3 min-h-[44px]",
                      "rounded-md border-none bg-transparent",
                      "text-[0.9rem] font-semibold text-muted-foreground",
                      "cursor-pointer transition-colors duration-150",
                      "hover:bg-muted hover:text-foreground",
                      "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                    )}
                  >
                    <Settings size={16} strokeWidth={1.75} />
                    <span>Workspace Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center gap-3 w-full text-left",
                      "px-4 py-3 min-h-[44px]",
                      "rounded-md border-none bg-transparent",
                      "text-[0.9rem] font-semibold text-destructive",
                      "cursor-pointer transition-colors duration-150",
                      "hover:bg-destructive/10",
                      "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                    )}
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    <span>Sign Out</span>
                  </button>
                </>
              )
            ) : (
              <Link
                href="/auth"
                className={cn(
                  "flex items-center justify-center no-underline",
                  "px-4 py-3 min-h-[44px] mt-1",
                  "bg-accent text-white",
                  "text-[0.9rem] font-bold",
                  "rounded-md border-none",
                  "transition-all duration-150 hover:opacity-90",
                )}
              >
                Sign In / Register
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Drawer */}
      {user && (
        <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}

      {/* Command Palette — globally mounted */}
      <CommandPalette onSettingsOpen={handleSettingsOpen} />
    </>
  );
}
