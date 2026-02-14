"use client";

import { FileText } from "lucide-react";
import ToolResultBlock from "@/components/conversation/ToolResultBlock";
import type { ToolUseContent, ReadInput } from "@/lib/types";

interface ReadToolProps {
  toolUse: ToolUseContent;
}

export default function ReadTool({ toolUse }: ReadToolProps) {
  const input = toolUse.input as unknown as ReadInput;
  const filePath = input.file_path || "";
  const fileName = filePath.split("/").pop() || filePath;

  return (
    <div className="my-2">
      <div className="flex items-center gap-2 mb-1.5">
        <FileText className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-xs font-medium text-blue-400">Read File</span>
      </div>
      <div className="px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
        <code className="text-xs text-blue-300 break-all">{filePath}</code>
        {input.offset !== undefined && (
          <span className="text-xs text-zinc-500 ml-2">
            (offset: {input.offset}
            {input.limit ? `, limit: ${input.limit}` : ""})
          </span>
        )}
      </div>
      {toolUse.result && <ToolResultBlock result={toolUse.result} />}
    </div>
  );
}
