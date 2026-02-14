import path from "path";
import os from "os";

export const CLAUDE_DIR = path.join(os.homedir(), ".claude");
export const PROJECTS_DIR = path.join(CLAUDE_DIR, "projects");

export const TOOL_COLORS: Record<string, string> = {
  Bash: "border-green-500",
  Read: "border-blue-500",
  Write: "border-amber-500",
  Edit: "border-orange-500",
  Grep: "border-cyan-500",
  Glob: "border-cyan-500",
  Task: "border-purple-500",
  WebFetch: "border-pink-500",
  WebSearch: "border-pink-500",
  NotebookEdit: "border-yellow-500",
};

export const TOOL_BG_COLORS: Record<string, string> = {
  Bash: "bg-green-500/10",
  Read: "bg-blue-500/10",
  Write: "bg-amber-500/10",
  Edit: "bg-orange-500/10",
  Grep: "bg-cyan-500/10",
  Glob: "bg-cyan-500/10",
  Task: "bg-purple-500/10",
  WebFetch: "bg-pink-500/10",
  WebSearch: "bg-pink-500/10",
  NotebookEdit: "bg-yellow-500/10",
};

export const TOOL_LABELS: Record<string, string> = {
  Bash: "Terminal",
  Read: "Read File",
  Write: "Write File",
  Edit: "Edit File",
  Grep: "Search Content",
  Glob: "Search Files",
  Task: "Sub-agent",
  WebFetch: "Web Fetch",
  WebSearch: "Web Search",
  NotebookEdit: "Notebook Edit",
  mcp__ide__getDiagnostics: "IDE Diagnostics",
  mcp__ide__executeCode: "Execute Code",
};
