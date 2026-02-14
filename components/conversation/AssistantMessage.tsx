"use client";

import { Bot } from "lucide-react";
import TextBlock from "./TextBlock";
import ThinkingBlock from "./ThinkingBlock";
import ToolUseBlock from "./ToolUseBlock";
import CopyButton from "./CopyButton";
import type { ConversationMessage } from "@/lib/types";

interface AssistantMessageProps {
  message: ConversationMessage;
}

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const textContent = message.blocks
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");

  return (
    <div className="group relative">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-zinc-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-zinc-400">Claude</span>
            {message.timestamp && (
              <span className="text-[10px] text-zinc-600">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            )}
            {textContent && (
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={textContent} />
              </div>
            )}
          </div>

          <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/50 px-4 py-3">
            {message.blocks.map((block, i) => {
              switch (block.type) {
                case "text":
                  return <TextBlock key={i} text={block.text} />;
                case "thinking":
                  return <ThinkingBlock key={i} thinking={block.thinking} />;
                case "tool_use":
                  return <ToolUseBlock key={i} toolUse={block} />;
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
