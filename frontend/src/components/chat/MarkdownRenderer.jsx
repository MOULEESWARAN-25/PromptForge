"use client";

import React from "react";

function parseInlineMarkdown(text) {
  if (!text) return text;
  const parts = [];
  let currentIdx = 0;
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIdx = match.index;
    if (matchIdx > currentIdx) parts.push(text.slice(currentIdx, matchIdx));
    if (matchStr.startsWith("**")) {
      parts.push(
        <strong
          key={matchIdx}
          className="font-bold text-foreground"
        >
          {matchStr.slice(2, -2)}
        </strong>,
      );
    } else if (matchStr.startsWith("`")) {
      parts.push(
        <code
          key={matchIdx}
          className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-accent"
        >
          {matchStr.slice(1, -1)}
        </code>,
      );
    }
    currentIdx = regex.lastIndex;
  }
  if (currentIdx < text.length) parts.push(text.slice(currentIdx));
  return parts.length > 0 ? parts : text;
}

export default function MarkdownRenderer({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="font-sans whitespace-normal w-full">
      {lines.map((line, idx) => {
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-accent mt-3.5 mb-1.5 font-display">
              {parseInlineMarkdown(line.slice(4))}
            </h3>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg font-extrabold text-foreground mt-4.5 mb-2 font-display">
              {parseInlineMarkdown(line.slice(3))}
            </h2>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-xl font-extrabold text-foreground mt-5 mb-2.5 font-display">
              {parseInlineMarkdown(line.slice(2))}
            </h1>
          );
        }
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          return (
            <div key={idx} className="flex gap-2 pl-2 mb-1.5 text-xs md:text-sm text-foreground leading-relaxed">
              <span className="text-accent">•</span>
              <span>{parseInlineMarkdown(line.trim().slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === "---" || line.trim() === "***") {
          return <hr key={idx} className="border-none border-t border-border my-3" />;
        }
        if (line.trim() === "") {
          return <div key={idx} className="h-1.5" />;
        }
        return (
          <p key={idx} className="mb-1.5 text-xs md:text-sm text-foreground leading-relaxed">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}
