"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import CopyButton from "./CopyButton";
import type { ToolResultContent } from "@/lib/types";

interface ToolResultBlockProps {
  result: ToolResultContent;
  defaultExpanded?: boolean;
}

export default function ToolResultBlock({
  result,
  defaultExpanded = false,
}: ToolResultBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const content = result.content || "";
  const lines = content.split("\n");
  const isLong = lines.length > 10 || content.length > 500;
  const preview = isLong
    ? lines.slice(0, 3).join("\n").slice(0, 200) + "…"
    : content;

  return (
    <div className="mt-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        {result.isError ? (
          <AlertCircle className="w-3 h-3 text-red-400" />
        ) : (
          <CheckCircle2 className="w-3 h-3 text-green-500/70" />
        )}
        <span>{result.isError ? "Error" : "Result"}</span>
        {!expanded && isLong && (
          <span className="text-zinc-600">({lines.length} lines)</span>
        )}
      </button>

      {(expanded || !isLong) && (
        <div className="relative group mt-1">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={content} />
          </div>
          <pre
            className={`text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-words ${
              result.isError
                ? "bg-red-950/20 border border-red-900/30 text-red-300"
                : "bg-zinc-900/50 border border-zinc-800/50 text-zinc-400"
            }`}
          >
            {expanded ? content : preview}
          </pre>
        </div>
      )}
    </div>
  );
}
