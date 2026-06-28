"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle2, Monitor, Database, Code2 } from 'lucide-react';

const ICON_MAP = {
  'Monitor': Monitor,
  'Database': Database,
  'Code2': Code2
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 15 } }
};

export default function FeatureDetailClient({ feature, slug }) {
  const Icon = ICON_MAP[feature.iconName] || Sparkles;

  return (
    <motion.div 
      className="w-full max-w-[960px] mx-auto pt-10 pb-16 px-6 relative z-10"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Back button */}
      <motion.div className="mb-8" variants={itemVariants}>
        <Link href="/" className="inline-flex items-center gap-2 text-[13.5px] text-muted-foreground no-underline font-semibold active-scale-95 hover:text-foreground">
          <motion.span
            className="inline-flex items-center gap-2"
            whileHover={{ x: -4 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            <span>Back to Landing</span>
          </motion.span>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10">
        {/* Left Side Details */}
        <motion.div className="flex flex-col gap-6" variants={itemVariants}>
          <div className="flex gap-5 items-center">
            <motion.div 
              className="w-[54px] h-[54px] rounded-xl bg-accent/6 flex items-center justify-center border border-border/40 shadow-sm cursor-pointer"
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={24} className="text-accent" strokeWidth={1.75} />
            </motion.div>
            <div className="flex flex-col gap-1">
              <span className="premium-badge w-fit">CORE CAPABILITY</span>
              <h1 className="text-3xl font-extrabold font-display text-foreground tracking-tight m-0">{feature.title}</h1>
            </div>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed">{feature.detailedDesc}</p>

          <div className="text-sm font-extrabold uppercase tracking-wider text-foreground mt-2 border-b border-border pb-2">
            Key Implementation Strengths
          </div>
          <div className="flex flex-col gap-3">
            {feature.benefits.map((benefit, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-3 text-sm text-foreground cursor-pointer"
                variants={itemVariants}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 size={16} className="text-success shrink-0" strokeWidth={1.75} />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side Visual Panel */}
        <motion.div 
          className="bg-card rounded-2xl border border-border h-fit overflow-hidden shadow-md relative glass-panel"
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        >
          {/* Ambient light glow */}
          <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(104,67,236,0.06)_0%,transparent_70%)]" />

          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 text-xs font-bold text-foreground bg-card">
            <Sparkles size={16} className="text-accent" strokeWidth={1.75} />
            <span>Interactive Output Demonstration</span>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <pre className="bg-black/15 border border-border/40 rounded-lg p-3.5 font-mono text-[12.5px] leading-relaxed text-foreground m-0 overflow-x-auto">
{`[INSPECT_PIPELINE]
- Target: ${feature.title}
- Match Rating: 99.8% (Similarity Match)
- Output format: markdown-blueprint
- Status: READY TO RUN`}
            </pre>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Every detail is generated statically for search indexers to easily extract metadata schemas and rich product information!
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
