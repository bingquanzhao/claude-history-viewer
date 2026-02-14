import fs from "fs";
import path from "path";
import { PROJECTS_DIR } from "@/lib/constants";
import { formatProjectName, extractTextPreview, truncate } from "@/lib/utils";
import { readJSONLHead } from "./jsonl-reader";
import type { Project, SessionMeta } from "@/lib/types";

/**
 * Scan ~/.claude/projects/ and discover all projects and their sessions.
 */
export async function scanProjects(): Promise<Project[]> {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }

  const projectDirs = fs.readdirSync(PROJECTS_DIR).filter((name) => {
    const fullPath = path.join(PROJECTS_DIR, name);
    return fs.statSync(fullPath).isDirectory();
  });

  const projects: Project[] = [];

  for (const dirName of projectDirs) {
    const projectPath = path.join(PROJECTS_DIR, dirName);
    const sessions = await scanSessions(projectPath, dirName);

    if (sessions.length === 0) continue;

    // Sort sessions by lastActive descending
    sessions.sort(
      (a, b) =>
        new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );

    projects.push({
      name: dirName,
      displayName: formatProjectName(dirName),
      path: projectPath,
      sessions,
      lastActive: sessions[0].lastActive,
    });
  }

  // Sort projects by lastActive descending
  projects.sort(
    (a, b) =>
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  return projects;
}

async function scanSessions(
  projectPath: string,
  projectName: string
): Promise<SessionMeta[]> {
  const entries = fs.readdirSync(projectPath);
  const sessions: SessionMeta[] = [];

  for (const entry of entries) {
    if (!entry.endsWith(".jsonl")) continue;

    const sessionId = entry.replace(".jsonl", "");

    // Skip subagent files (they live inside session subdirectories or start with "agent-")
    if (sessionId.startsWith("agent-")) continue;
    const filePath = path.join(projectPath, entry);

    try {
      const stat = fs.statSync(filePath);
      const headEntries = await readJSONLHead(filePath, 5);

      // Find first user message for preview
      const firstUserEntry = headEntries.find(
        (e) => e.type === "user" && e.message?.role === "user"
      );

      let firstUserMessage = "";
      if (firstUserEntry?.message?.content) {
        const content: unknown = firstUserEntry.message.content;
        if (typeof content === "string") {
          firstUserMessage = truncate(
            (content as string).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
            200
          );
        } else if (Array.isArray(content)) {
          firstUserMessage = extractTextPreview(
            content as Array<string | { type: string; text?: string }>
          );
        }
      }

      // Skip sessions with no user content
      if (!firstUserMessage) continue;

      // Check for subagents directory
      const subagentsDir = path.join(projectPath, sessionId, "subagents");
      const hasSubagents = fs.existsSync(subagentsDir);

      // Count lines for rough message count
      const content = fs.readFileSync(filePath, "utf-8");
      const lineCount = content.split("\n").filter((l) => l.trim()).length;

      sessions.push({
        id: sessionId,
        projectName,
        filePath,
        timestamp: firstUserEntry?.timestamp || stat.birthtime.toISOString(),
        lastActive: stat.mtime.toISOString(),
        messageCount: lineCount,
        firstUserMessage,
        hasSubagents,
      });
    } catch {
      // Skip unreadable files
    }
  }

  return sessions;
}

/**
 * Resolve a session ID to its file path by searching all projects.
 */
export function findSessionFile(
  sessionId: string
): { filePath: string; projectName: string } | null {
  if (!fs.existsSync(PROJECTS_DIR)) return null;

  const projectDirs = fs.readdirSync(PROJECTS_DIR).filter((name) => {
    const fullPath = path.join(PROJECTS_DIR, name);
    return fs.statSync(fullPath).isDirectory();
  });

  for (const dirName of projectDirs) {
    const filePath = path.join(PROJECTS_DIR, dirName, `${sessionId}.jsonl`);
    if (fs.existsSync(filePath)) {
      return { filePath, projectName: dirName };
    }
  }

  return null;
}
