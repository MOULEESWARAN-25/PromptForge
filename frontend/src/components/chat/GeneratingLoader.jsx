"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const GEN_MESSAGES = [
  "Retrieving design vocabulary…",
  "Matching HSL color tokens…",
  "Injecting motion physics…",
  "Compiling architectural spec…",
  "Assembling prompt blueprint…",
];

export default function GeneratingLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % GEN_MESSAGES.length),
      1000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2.5 mb-2">
        <Loader2
          size={14}
          className="animate-spin text-accent"
        />
        <span className="text-[0.85rem] text-muted-foreground font-medium">
          {GEN_MESSAGES[msgIdx]}
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1 animate-pulse">
        {["92%", "85%", "40%", "78%", "88%", "60%", "82%", "30%"].map(
          (w, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
              style={{ width: w }}
            />
          ),
        )}
      </div>
    </div>
  );
}
