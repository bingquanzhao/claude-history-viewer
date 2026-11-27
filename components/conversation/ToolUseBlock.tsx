"use client";

import BashTool from "@/components/tools/BashTool";
import ReadTool from "@/components/tools/ReadTool";
import WriteTool from "@/components/tools/WriteTool";
import EditTool from "@/components/tools/EditTool";
import SearchTool from "@/components/tools/SearchTool";
import GenericTool from "@/components/tools/GenericTool";
import { useState } from "react";
import { ChevronRight, ChevronDown, Terminal } from "lucide-react";
import { TOOL_COLORS } from "@/lib/constants";
import type { ToolUseContent } from "@/lib/types";

interface ToolUseBlockProps {
  toolUse: ToolUseContent;
}

export default function ToolUseBlock({ toolUse }: ToolUseBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = TOOL_COLORS[toolUse.name] || "border-zinc-600";
  const input = toolUse.input as Record<string, unknown>;
  const detail = String(input.command || input.file_path || input.pattern || input.description || "").replace(/\s+/g, " ").slice(0, 180);

  const renderTool = () => {
    switch (toolUse.name) {
      case "Bash":
        return <BashTool toolUse={toolUse} />;
      case "Read":
        return <ReadTool toolUse={toolUse} />;
      case "Write":
        return <WriteTool toolUse={toolUse} />;
      case "Edit":
        return <EditTool toolUse={toolUse} />;
      case "Grep":
      case "Glob":
        return <SearchTool toolUse={toolUse} />;
      default:
        return <GenericTool toolUse={toolUse} />;
    }
  };

  return (
    <div className={`border-l-2 ${borderColor} pl-3 my-3`}>
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-1.5 text-left text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Terminal className="w-3 h-3 text-emerald-400/80" />
        <span className="font-medium text-zinc-400">{toolUse.name}</span>
        {detail && <span className="truncate text-zinc-600">— {detail}</span>}
      </button>
      {expanded && <div className="mt-2">{renderTool()}</div>}
    </div>
  );
}
