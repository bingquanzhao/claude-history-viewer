"use client";

import { User } from "lucide-react";
import CopyButton from "./CopyButton";
import type { ConversationMessage } from "@/lib/types";

interface UserMessageProps {
  message: ConversationMessage;
}

export default function UserMessage({ message }: UserMessageProps) {
  const textContent = message.blocks
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");

  const hasImages = message.blocks.some((b) => b.type === "image");

  return (
    <div className="group relative">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-violet-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-violet-400">You</span>
            {message.timestamp && (
              <span className="text-[10px] text-zinc-600">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            )}
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={textContent} />
            </div>
          </div>

          <div className="rounded-lg bg-violet-950/20 border border-violet-500/10 px-4 py-3">
            {message.blocks.map((block, i) => {
              if (block.type === "text") {
                return (
                  <p key={i} className="text-sm text-zinc-200 whitespace-pre-wrap break-words">
                    {block.text}
                  </p>
                );
              }
              if (block.type === "image") {
                return (
                  <div key={i} className="mt-2">
                    <div className="text-xs text-zinc-500 italic">
                      [Image attached]
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
