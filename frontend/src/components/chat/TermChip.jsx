"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TermChip({ term }) {
  const [expanded, setExpanded] = useState(false);
  const { vocabulary, vocabLoading } = useApp();

  // Find vocabulary item by name or keywords dynamically
  const vocabItem = (vocabulary || []).find(item => {
    const termLower = term.toLowerCase();
    const itemNameLower = item.name.toLowerCase();
    
    // Exact or substring match
    if (itemNameLower === termLower || termLower.includes(itemNameLower) || itemNameLower.includes(termLower)) {
      return true;
    }
    
    // Keyword match
    const termWords = termLower.split(/\s+/);
    return item.keywords.some(kw => termWords.includes(kw.toLowerCase()));
  });

  const knowledge = vocabItem ? {
    explanation: vocabItem.description,
    visualDescription: vocabItem.examplePrompt || vocabItem.example_prompt || "",
    designTokens: vocabItem.snippet ? vocabItem.snippet.split('\n') : [],
    why: vocabItem.description
  } : null;

  return (
    <div className="w-full">
      <motion.button
        onClick={() => setExpanded((e) => !e)}
        className={`inline-flex items-center gap-1.5 text-[0.7rem] font-semibold transition-all duration-200 rounded-[6px] px-2.5 py-[3px] cursor-pointer font-sans ${
          expanded
            ? "text-accent-foreground bg-accent/20 border border-accent/50"
            : "text-accent bg-accent/8 border border-accent/20"
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title={vocabLoading ? "Loading definitions..." : knowledge ? "Click to learn what this term means" : term}
      >
        <CheckCircle2 size={10} className="text-accent" />
        {term}
        {(vocabLoading || knowledge) && (
          <span className="text-[0.6rem] opacity-60 ml-0.5">
            {expanded ? "▲" : "▼"}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mt-1.5"
          >
            <div className="bg-accent/5 border border-accent/15 rounded-lg p-3 flex flex-col gap-2">
              {vocabLoading ? (
                <div className="flex flex-col gap-1.5 opacity-50">
                  <div className="w-1/2 h-2.5 bg-accent rounded animate-pulse" />
                  <div className="w-[90%] h-2 bg-border rounded animate-pulse" />
                  <div className="w-[80%] h-2 bg-border rounded animate-pulse" />
                </div>
              ) : !knowledge ? (
                <div className="text-[0.72rem] text-muted-foreground italic">
                  No database explanation found for styling keyword '{term}'.
                </div>
              ) : (
                <>
                  {/* What it is */}
                  <div>
                    <div className="text-[0.65rem] font-bold text-accent uppercase tracking-wider mb-1">
                      What it is
                    </div>
                    <div className="text-[0.75rem] text-foreground leading-relaxed">
                      {knowledge.explanation}
                    </div>
                  </div>

                  {/* What it looks like */}
                  <div>
                    <div className="text-[0.65rem] font-bold text-accent uppercase tracking-wider mb-1">
                      What it looks like
                    </div>
                    <div className="text-[0.72rem] text-muted-foreground leading-relaxed italic">
                      {knowledge.visualDescription}
                    </div>
                  </div>

                  {/* Why it was used */}
                  <div>
                    <div className="text-[0.65rem] font-bold text-success uppercase tracking-wider mb-1">
                      Why it was injected
                    </div>
                    <div className="text-[0.72rem] text-foreground leading-relaxed">
                      {knowledge.why}
                    </div>
                  </div>

                  {/* CSS Tokens */}
                  {knowledge.designTokens.length > 0 && (
                    <div>
                      <div className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Tailwind CSS tokens
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {knowledge.designTokens.map((token, i) => (
                          <code
                            key={i}
                            className="text-[0.62rem] font-mono text-accent bg-muted rounded px-1.5 py-0.5 border border-border"
                          >
                            {token}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
