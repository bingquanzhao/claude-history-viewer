"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingBlockProps {
  thinking: string;
}

export default function ThinkingBlock({ thinking }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const preview = thinking.slice(0, 100).replace(/\s+/g, " ").trim();

  return (
    <div className="my-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors w-full text-left group"
      >
        <Brain className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        )}
        <span className="text-xs text-zinc-500">
          {expanded ? "Thinking…" : `Thinking: ${preview}…`}
        </span>
      </button>
      {expanded && (
        <div className="mt-1 px-4 py-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
          <pre className="text-xs text-zinc-500 italic whitespace-pre-wrap break-words font-sans leading-relaxed">
            {thinking}
          </pre>
        </div>
      )}
    </div>
  );
}
