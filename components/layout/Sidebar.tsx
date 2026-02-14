"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  MessageSquare,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

function findActiveProject(
  projects: Project[],
  pathname: string
): string | null {
  // Match /project/[projectName]/session/[sessionId] in the URL
  const match = pathname.match(/\/project\/([^/]+)\/session\/([^/]+)/);
  if (match) {
    const projectName = decodeURIComponent(match[1]);
    // Check if this project name exists
    const found = projects.find((p) => p.name === projectName);
    if (found) return found.name;
  }
  // Fallback: check if any session id in the URL matches a project's sessions
  for (const project of projects) {
    for (const session of project.sessions) {
      if (pathname.includes(session.id)) {
        return project.name;
      }
    }
  }
  return null;
}

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        // Auto-expand the project that contains the active session
        const activeProject = findActiveProject(data.projects || [], pathname);
        if (activeProject) {
          setExpandedProjects(new Set([activeProject]));
        } else if (data.projects?.length > 0) {
          setExpandedProjects(new Set([data.projects[0].name]));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // When pathname changes, auto-expand the project containing the active session
  useEffect(() => {
    if (projects.length === 0) return;
    const activeProject = findActiveProject(projects, pathname);
    if (activeProject) {
      setExpandedProjects((prev) => {
        if (prev.has(activeProject)) return prev;
        const next = new Set(prev);
        next.add(activeProject);
        return next;
      });
    }
  }, [pathname, projects]);

  const toggleProject = (name: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

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
    <aside className="w-72 h-full bg-zinc-900/50 border-r border-zinc-800 flex flex-col shrink-0">
      {/* Header */}
      <div className="h-14 px-4 border-b border-zinc-800 flex items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 group-hover:text-violet-400 transition-colors">
              Claude History
            </h1>
            <p className="text-[10px] text-zinc-500">Conversation Viewer</p>
          </div>
        </Link>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-zinc-500">
            No projects found in ~/.claude/projects/
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.name} className="mb-1">
              {/* Project header */}
              <button
                onClick={() => toggleProject(project.name)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/50 transition-colors text-left"
              >
                {expandedProjects.has(project.name) ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                )}
                <FolderOpen className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="text-sm font-medium text-zinc-300 truncate">
                  {project.displayName}
                </span>
                <span className="ml-auto text-[10px] text-zinc-600">
                  {project.sessions.length}
                </span>
              </button>

              {/* Sessions */}
              {expandedProjects.has(project.name) && (
                <div className="ml-4">
                  {project.sessions.map((session) => {
                    const isActive = pathname.includes(session.id);
                    return (
                      <Link
                        key={session.id}
                        href={`/project/${encodeURIComponent(project.name)}/session/${session.id}`}
                        className={cn(
                          "flex items-start gap-2 px-3 py-2 rounded-md mx-1 my-0.5 transition-colors group",
                          isActive
                            ? "bg-violet-600/15 border border-violet-500/20"
                            : "hover:bg-zinc-800/50"
                        )}
                      >
                        <MessageSquare
                          className={cn(
                            "w-3.5 h-3.5 mt-0.5 shrink-0",
                            isActive ? "text-violet-400" : "text-zinc-600"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-xs leading-snug line-clamp-2",
                              isActive
                                ? "text-violet-200"
                                : "text-zinc-400 group-hover:text-zinc-300"
                            )}
                          >
                            {session.firstUserMessage || "Empty session"}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5 text-zinc-600" />
                            <span className="text-[10px] text-zinc-600">
                              {formatTime(session.lastActive)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
