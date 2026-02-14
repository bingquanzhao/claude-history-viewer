"use client";

import { useState } from "react";
import { Wrench, ChevronRight, ChevronDown } from "lucide-react";
import CopyButton from "@/components/conversation/CopyButton";
import ToolResultBlock from "@/components/conversation/ToolResultBlock";
import { TOOL_LABELS } from "@/lib/constants";
import type { ToolUseContent } from "@/lib/types";

interface GenericToolProps {
  toolUse: ToolUseContent;
}

export default function GenericTool({ toolUse }: GenericToolProps) {
  const [expanded, setExpanded] = useState(false);
  const label = TOOL_LABELS[toolUse.name] || toolUse.name;
  const inputJson = JSON.stringify(toolUse.input, null, 2);

  return (
    <div className="my-2">
      <div className="flex items-center gap-2 mb-1.5">
        <Wrench className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-400">{label}</span>
      </div>
      <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/30 overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-zinc-800/40 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          )}
          <span className="text-xs text-zinc-500">Input parameters</span>
        </button>
        {expanded && (
          <div className="relative group border-t border-zinc-700/30">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={inputJson} />
            </div>
            <pre className="p-3 text-xs text-zinc-400 overflow-x-auto max-h-60 whitespace-pre-wrap break-words">
              {inputJson}
            </pre>
          </div>
        )}
      </div>
      {toolUse.result && <ToolResultBlock result={toolUse.result} />}
    </div>
  );
}
