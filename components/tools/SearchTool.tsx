"use client";

import { Search, FolderSearch } from "lucide-react";
import ToolResultBlock from "@/components/conversation/ToolResultBlock";
import type { ToolUseContent, GrepInput, GlobInput } from "@/lib/types";

interface SearchToolProps {
  toolUse: ToolUseContent;
}

export default function SearchTool({ toolUse }: SearchToolProps) {
  const isGrep = toolUse.name === "Grep";
  const Icon = isGrep ? Search : FolderSearch;
  const color = "text-cyan-400";
  const bgColor = "bg-cyan-500/5";
  const borderColor = "border-cyan-500/10";

  if (isGrep) {
    const input = toolUse.input as unknown as GrepInput;
    return (
      <div className="my-2">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span className={`text-xs font-medium ${color}`}>
            Search Content
          </span>
        </div>
        <div className={`px-3 py-2 rounded-lg ${bgColor} border ${borderColor}`}>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-cyan-300 font-mono">/{input.pattern}/</span>
            {input.path && (
              <span className="text-zinc-500">in {input.path}</span>
            )}
            {input.glob && (
              <span className="text-zinc-500">({input.glob})</span>
            )}
          </div>
        </div>
        {toolUse.result && <ToolResultBlock result={toolUse.result} />}
      </div>
    );
  }

  // Glob
  const input = toolUse.input as unknown as GlobInput;
  return (
    <div className="my-2">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`text-xs font-medium ${color}`}>Search Files</span>
      </div>
      <div className={`px-3 py-2 rounded-lg ${bgColor} border ${borderColor}`}>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-cyan-300 font-mono">{input.pattern}</span>
          {input.path && (
            <span className="text-zinc-500">in {input.path}</span>
          )}
        </div>
      </div>
      {toolUse.result && <ToolResultBlock result={toolUse.result} />}
    </div>
  );
}
