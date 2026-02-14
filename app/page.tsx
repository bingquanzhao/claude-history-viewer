"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FolderOpen,
  MessageSquare,
  Clock,
  Activity,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SearchDialog from "@/components/search/SearchDialog";
import type { Project } from "@/lib/types";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hiddenSessions, setHiddenSessions] = useState<Set<string>>(new Set());

  const toggleHidden = (sessionId: string) => {
    setHiddenSessions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Cmd+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const totalSessions = projects.reduce(
    (sum, p) => sum + p.sessions.length,
    0
  );

  const recentSessions = projects
    .flatMap((p) =>
      p.sessions.map((s) => ({ ...s, projectDisplayName: p.displayName }))
    )
    .sort(
      (a, b) =>
        new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    )
    .slice(0, 10);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSearchOpen={() => setSearchOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen className="w-4 h-4 text-violet-400" />
                    <span className="text-xs text-zinc-500">Projects</span>
                  </div>
                  <p className="text-2xl font-semibold text-zinc-100">
                    {projects.length}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-zinc-500">Sessions</span>
                  </div>
                  <p className="text-2xl font-semibold text-zinc-100">
                    {totalSessions}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-zinc-500">Last Active</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-300 mt-1">
                    {projects.length > 0
                      ? formatTime(projects[0].lastActive)
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Recent conversations */}
              <div>
                <h2 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  Recent Conversations
                </h2>
                <div className="space-y-2">
                  {recentSessions.map((session) => {
                    const isHidden = hiddenSessions.has(session.id);
                    return (
                      <div
                        key={session.id}
                        className="flex items-start gap-0 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all group"
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleHidden(session.id);
                          }}
                          className="p-4 shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors"
                          title={isHidden ? "Show conversation" : "Hide conversation"}
                        >
                          {isHidden ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/project/${encodeURIComponent(session.projectName)}/session/${session.id}`}
                          className="flex items-start gap-3 flex-1 min-w-0 py-4 pr-4"
                        >
                          <MessageSquare className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0 group-hover:text-violet-400 transition-colors" />
                          <div className="flex-1 min-w-0">
                            {isHidden ? (
                              <p className="text-sm text-zinc-600 italic">
                                Content hidden
                              </p>
                            ) : (
                              <p className="text-sm text-zinc-300 line-clamp-2 group-hover:text-zinc-100 transition-colors">
                                {session.firstUserMessage || "Empty session"}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/20">
                                {(session as { projectDisplayName: string }).projectDisplayName}
                              </span>
                              <span className="text-[10px] text-zinc-600">
                                {formatTime(session.lastActive)}
                              </span>
                              {!isHidden && (
                                <span className="text-[10px] text-zinc-600">
                                  {session.messageCount} entries
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </>
  );
}
