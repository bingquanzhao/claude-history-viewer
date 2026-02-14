"use client";

import { Terminal } from "lucide-react";
import CopyButton from "@/components/conversation/CopyButton";
import ToolResultBlock from "@/components/conversation/ToolResultBlock";
import type { ToolUseContent, BashInput } from "@/lib/types";

interface BashToolProps {
  toolUse: ToolUseContent;
}

export default function BashTool({ toolUse }: BashToolProps) {
  const input = toolUse.input as unknown as BashInput;
  const command = input.command || "";
  const description = input.description;

  return (
    <div className="my-2">
      <div className="flex items-center gap-2 mb-1.5">
        <Terminal className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-medium text-green-400">Terminal</span>
        {description && (
          <span className="text-xs text-zinc-500">— {description}</span>
        )}
      </div>
      <div className="terminal relative group">
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={command} />
        </div>
        <div className="p-3 overflow-x-auto">
          <code className="text-green-300 text-xs whitespace-pre-wrap break-all">
            <span className="text-green-600 select-none">$ </span>
            {command}
          </code>
        </div>
      </div>
      {toolUse.result && <ToolResultBlock result={toolUse.result} />}
    </div>
  );
}
