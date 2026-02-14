"use client";

import { useState } from "react";
import { FilePlus, ChevronRight, ChevronDown } from "lucide-react";
import CopyButton from "@/components/conversation/CopyButton";
import ToolResultBlock from "@/components/conversation/ToolResultBlock";
import type { ToolUseContent, WriteInput } from "@/lib/types";

interface WriteToolProps {
  toolUse: ToolUseContent;
}

export default function WriteTool({ toolUse }: WriteToolProps) {
  const [expanded, setExpanded] = useState(false);
  const input = toolUse.input as unknown as WriteInput;
  const filePath = input.file_path || "";
  const content = input.content || "";
  const lines = content.split("\n");

  return (
    <div className="my-2">
      <div className="flex items-center gap-2 mb-1.5">
        <FilePlus className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-medium text-amber-400">Write File</span>
      </div>
      <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-amber-500/5 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          )}
          <code className="text-xs text-amber-300 break-all">{filePath}</code>
          <span className="text-xs text-zinc-500 ml-auto">
            {lines.length} lines
          </span>
        </button>
        {expanded && (
          <div className="relative group border-t border-amber-500/10">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <CopyButton text={content} />
            </div>
            <pre className="p-3 overflow-x-auto text-xs text-zinc-300 max-h-96 whitespace-pre-wrap break-words">
              {content}
            </pre>
          </div>
        )}
      </div>
      {toolUse.result && <ToolResultBlock result={toolUse.result} />}
    </div>
  );
}
