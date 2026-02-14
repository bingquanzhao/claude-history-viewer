"use client";

import BashTool from "@/components/tools/BashTool";
import ReadTool from "@/components/tools/ReadTool";
import WriteTool from "@/components/tools/WriteTool";
import EditTool from "@/components/tools/EditTool";
import SearchTool from "@/components/tools/SearchTool";
import GenericTool from "@/components/tools/GenericTool";
import { TOOL_COLORS } from "@/lib/constants";
import type { ToolUseContent } from "@/lib/types";

interface ToolUseBlockProps {
  toolUse: ToolUseContent;
}

export default function ToolUseBlock({ toolUse }: ToolUseBlockProps) {
  const borderColor = TOOL_COLORS[toolUse.name] || "border-zinc-600";

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
      {renderTool()}
    </div>
  );
}
