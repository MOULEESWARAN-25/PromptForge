"use client";

import React from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SaveStatusBadge({ status }) {
  if (status === "idle") return null;
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`save-status-${status}`}
      >
        {status === "saving" && (
          <>
            <Loader2 size={11} className="animate-spin" /> Saving…
          </>
        )}
        {status === "saved" && (
          <>
            <CheckCircle2 size={11} /> Saved
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle size={11} /> Save failed
          </>
        )}
      </motion.span>
    </AnimatePresence>
  );
}
