"use client";

import { useState } from "react";
import { FileEdit, ChevronRight, ChevronDown } from "lucide-react";
import ToolResultBlock from "@/components/conversation/ToolResultBlock";
import type { ToolUseContent, EditInput } from "@/lib/types";

interface EditToolProps {
  toolUse: ToolUseContent;
}

export default function EditTool({ toolUse }: EditToolProps) {
  const [expanded, setExpanded] = useState(true);
  const input = toolUse.input as unknown as EditInput;
  const filePath = input.file_path || "";
  const oldString = input.old_string || "";
  const newString = input.new_string || "";

  return (
    <div className="my-2">
      <div className="flex items-center gap-2 mb-1.5">
        <FileEdit className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-medium text-orange-400">Edit File</span>
      </div>
      <div className="rounded-lg bg-orange-500/5 border border-orange-500/10 overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-orange-500/5 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          )}
          <code className="text-xs text-orange-300 break-all">{filePath}</code>
        </button>
        {expanded && (
          <div className="border-t border-orange-500/10">
            {/* Old string (removed) */}
            {oldString && (
              <div className="border-b border-zinc-800/50">
                <div className="px-3 py-1 bg-red-950/20 text-[10px] text-red-400 font-medium">
                  Removed
                </div>
                <pre className="px-3 py-2 text-xs overflow-x-auto max-h-60 whitespace-pre-wrap break-words">
                  {oldString.split("\n").map((line, i) => (
                    <div key={i} className="diff-remove px-1">
                      <span className="text-red-500/50 select-none mr-2">
                        -
                      </span>
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            )}
            {/* New string (added) */}
            {newString && (
              <div>
                <div className="px-3 py-1 bg-green-950/20 text-[10px] text-green-400 font-medium">
                  Added
                </div>
                <pre className="px-3 py-2 text-xs overflow-x-auto max-h-60 whitespace-pre-wrap break-words">
                  {newString.split("\n").map((line, i) => (
                    <div key={i} className="diff-add px-1">
                      <span className="text-green-500/50 select-none mr-2">
                        +
                      </span>
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      {toolUse.result && <ToolResultBlock result={toolUse.result} />}
    </div>
  );
}
