"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import type { ParsedSession } from "@/lib/types";

interface ConversationViewProps {
  sessionId: string;
}

export default function ConversationView({ sessionId }: ConversationViewProps) {
  const [session, setSession] = useState<(ParsedSession & { offset: number; hasMore: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    setLoading(true);
    setError(null);

    const line = new URLSearchParams(window.location.search).get("line") || "";
    fetch(`/api/sessions/${sessionId}?offset=0&limit=120${line ? `&line=${encodeURIComponent(line)}` : ""}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load session");
        return res.json();
      })
      .then((data) => setSession(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const loadMore = useCallback(async (direction: "older" | "newer") => {
    const current = sessionRef.current;
    if (!current || pageLoading) return;
    const offset = direction === "older" ? current.offset + current.messages.length : Math.max(0, current.offset - 120);
    if (direction === "newer" && current.offset === 0) return;
    setPageLoading(true);
    const container = scrollRef.current;
    const oldHeight = container?.scrollHeight || 0;
    const oldTop = container?.scrollTop || 0;
    try {
      const data = await (await fetch(`/api/sessions/${sessionId}?offset=${offset}&limit=120`)).json();
      if (direction === "older") {
        setSession({ ...current, messages: [...current.messages, ...data.messages], offset: data.offset, hasMore: data.hasMore });
      } else {
        setSession({ ...current, messages: [...data.messages, ...current.messages], offset: data.offset, hasMore: current.hasMore });
        requestAnimationFrame(() => {
          if (container) container.scrollTop = oldTop + container.scrollHeight - oldHeight;
        });
      }
    } finally {
      setPageLoading(false);
    }
  }, [pageLoading, sessionId]);

  const onScroll = () => {
    const el = scrollRef.current;
    const current = sessionRef.current;
    if (!el || !current || pageLoading) return;
    if (el.scrollTop < 240 && current.offset > 0) void loadMore("newer");
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 240 && current.hasMore) void loadMore("older");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading conversation…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-zinc-500 mt-1">
            Session ID: {sessionId}
          </p>
        </div>
      </div>
    );
  }

  if (!session || session.messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-zinc-500">No messages in this session</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto">
      {/* Session metadata */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/50 px-6 py-2">
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          {session.metadata.model && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700/50">
              {session.metadata.model}
            </span>
          )}
          {session.metadata.cwd && (
            <span className="font-mono truncate">{session.metadata.cwd}</span>
          )}
          {session.metadata.gitBranch && (
            <span className="font-mono text-violet-400/70">
              {session.metadata.gitBranch}
            </span>
          )}
          <span className="ml-auto">
            {session.messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {session.offset > 0 && <div className="text-center text-xs text-zinc-500 py-2">{pageLoading ? "Загрузка…" : "Прокрутите вверх для загрузки"}</div>}
        {session.messages.map((msg, idx) => (
          <div key={msg.uuid || `${msg.id}-${idx}`}>
            {msg.role === "user" ? (
              <UserMessage message={msg} />
            ) : (
              <AssistantMessage message={msg} />
            )}
          </div>
        ))}
        {session.hasMore && <div className="text-center text-xs text-zinc-500 py-2">{pageLoading ? "Загрузка…" : "Прокрутите вниз для загрузки"}</div>}
      </div>
    </div>
  );
}
