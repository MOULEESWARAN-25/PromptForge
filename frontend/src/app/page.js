"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

// Import modular subcomponents
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Workflow from "@/components/landing/Workflow";
import DesignVocabulary from "@/components/landing/DesignVocabulary";
import CTA from "@/components/landing/CTA";

export default function PremiumLandingPage() {
  const { theme, user, toggleTheme } = useApp();

  return (
    <div className="relative z-10 w-full flex flex-col gap-12 pt-4 overflow-x-hidden landing-page">


      <Hero theme={theme} user={user} toggleTheme={toggleTheme} />
      <FeatureGrid theme={theme} />
      <Workflow theme={theme} />
      <DesignVocabulary theme={theme} />
      <CTA theme={theme} user={user} />
    </div>
  );
}
