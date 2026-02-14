"use client";

import { Search } from "lucide-react";
import { formatProjectName } from "@/lib/utils";

interface HeaderProps {
  projectName?: string;
  sessionId?: string;
  onSearchOpen?: () => void;
}

export default function Header({
  projectName,
  sessionId,
  onSearchOpen,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-950/80 backdrop-blur-sm">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-zinc-500">Claude History</span>
        {projectName && (
          <>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-300">
              {formatProjectName(projectName)}
            </span>
          </>
        )}
        {sessionId && (
          <>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400 font-mono text-xs">
              {sessionId.slice(0, 8)}
            </span>
          </>
        )}
      </nav>

      {/* Search button */}
      <button
        onClick={onSearchOpen}
        className="flex items-center gap-2 w-72 px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-colors text-sm text-zinc-400"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left">Search conversations…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-700/50 text-[10px] text-zinc-500 font-mono shrink-0">
          <span>⌘</span>K
        </kbd>
      </button>
    </header>
  );
}
