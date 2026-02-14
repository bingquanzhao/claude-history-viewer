"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import type { ParsedSession } from "@/lib/types";

interface ConversationViewProps {
  sessionId: string;
}

export default function ConversationView({ sessionId }: ConversationViewProps) {
  const [session, setSession] = useState<ParsedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load session");
        return res.json();
      })
      .then((data) => setSession(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

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
    <div className="h-full overflow-y-auto">
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
        {session.messages.map((msg, idx) => (
          <div key={msg.uuid || `${msg.id}-${idx}`}>
            {msg.role === "user" ? (
              <UserMessage message={msg} />
            ) : (
              <AssistantMessage message={msg} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
