"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Loader2,
  MessageSquare,
  FolderOpen,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/types";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Group results by projectName, preserving order of first appearance. */
function groupByProject(
  results: SearchResult[]
): { project: string; results: SearchResult[] }[] {
  const map = new Map<string, SearchResult[]>();
  for (const r of results) {
    const key = r.projectName;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries()).map(([project, results]) => ({
    project,
    results,
  }));
}

/** Highlight all occurrences of `query` within `text`. */
function highlightMatch(text: string, query: string): React.ReactNode[] {
  if (!query || query.length < 2) return [text];
  const parts: React.ReactNode[] = [];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let cursor = 0;
  let idx = lower.indexOf(q, cursor);
  while (idx !== -1) {
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <mark
        key={idx}
        className="bg-violet-500/30 text-violet-200 rounded-sm px-0.5"
      >
        {text.slice(idx, idx + query.length)}
      </mark>
    );
    cursor = idx + query.length;
    idx = lower.indexOf(q, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // Flatten grouped results into an ordered list for keyboard nav
  const grouped = groupByProject(results);
  const flatResults = results; // already flat, grouped is only for rendering

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [results]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : 0
        );
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) =>
          prev > 0 ? prev - 1 : flatResults.length - 1
        );
      }
      if (e.key === "Enter" && flatResults.length > 0) {
        e.preventDefault();
        handleSelect(flatResults[selectedIdx]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, flatResults, selectedIdx]);

  // Scroll selected item into view
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-idx="${selectedIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onClose();
      router.push(
        `/project/${encodeURIComponent(result.projectDirName)}/session/${result.sessionId}`
      );
    },
    [onClose, router]
  );

  if (!open) return null;

  // Build a global flat index for keyboard navigation
  let globalIdx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-3xl mx-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-800">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
          />
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && query.length >= 2 && !loading ? (
            <div className="px-5 py-10 text-center text-sm text-zinc-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.project}>
                {/* Project group header */}
                <div className="sticky top-0 z-10 flex items-center gap-2 px-5 py-2 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800/50">
                  <FolderOpen className="w-3 h-3 text-violet-400" />
                  <span className="text-xs font-medium text-violet-400">
                    {group.project}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {group.results.length} match
                    {group.results.length > 1 ? "es" : ""}
                  </span>
                </div>

                {/* Results in this group */}
                {group.results.map((result) => {
                  const idx = globalIdx++;
                  const isSelected = idx === selectedIdx;
                  return (
                    <button
                      key={`${result.sessionId}-${result.messageId}-${idx}`}
                      data-idx={idx}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={cn(
                        "w-full flex items-start gap-3 px-5 py-3 text-left transition-colors border-b border-zinc-800/30 last:border-0",
                        isSelected ? "bg-violet-600/10" : "hover:bg-zinc-800/40"
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          "w-4 h-4 shrink-0 mt-1",
                          isSelected ? "text-violet-400" : "text-zinc-600"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        {/* Meta row */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                            {result.role === "user" ? "You" : "Claude"}
                          </span>
                          {result.timestamp && (
                            <span className="text-[10px] text-zinc-600">
                              {new Date(result.timestamp).toLocaleDateString()}
                            </span>
                          )}
                          {isSelected && (
                            <span className="ml-auto flex items-center gap-1 text-[10px] text-violet-400/70">
                              <CornerDownLeft className="w-2.5 h-2.5" />
                              open
                            </span>
                          )}
                        </div>

                        {/* Snippet with highlights */}
                        <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                          {highlightMatch(result.snippet, query)}
                        </p>

                        {/* Session context */}
                        {result.sessionContext && (
                          <p className="mt-1.5 text-[11px] text-zinc-600 truncate">
                            Session: {result.sessionContext}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-zinc-800 flex items-center gap-5 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 font-mono">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 font-mono">esc</kbd>
            close
          </span>
          {results.length > 0 && (
            <span className="ml-auto">{results.length} results</span>
          )}
        </div>
      </div>
    </div>
  );
}
