import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert project directory name to display name.
 * e.g. "-Users-bingquanzhao-work-ingestion" -> "ingestion"
 *      "-Users-foo-projects-my-app" -> "my-app"
 */
export function formatProjectName(dirName: string): string {
  // Remove leading dash, split by dash, take the last meaningful segment
  const parts = dirName.replace(/^-/, "").split("-");
  // The path is like Users-username-...-projectName
  // Find the last segment(s) that form the project name
  // Usually everything after "work" or the last 1-2 segments
  const workIdx = parts.lastIndexOf("work");
  if (workIdx !== -1 && workIdx < parts.length - 1) {
    return parts.slice(workIdx + 1).join("-");
  }
  // Fallback: last segment
  return parts[parts.length - 1] || dirName;
}

/**
 * Format a path-encoded project name for display.
 * Decodes URI components and extracts a clean name.
 */
export function decodeProjectPath(dirName: string): string {
  // The dir name encodes the full path with dashes
  const decoded = dirName.replace(/^-/, "/").replace(/-/g, "/");
  return decoded;
}

/**
 * Truncate text to a maximum length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/**
 * Extract plain text from content blocks for preview.
 * Handles both object blocks ({type: "text", text: "..."}) and plain string content.
 */
export function extractTextPreview(
  content: Array<string | { type: string; text?: string }>
): string {
  const texts: string[] = [];
  for (const block of content) {
    if (typeof block === "string") {
      texts.push(block);
    } else if (block.type === "text" && block.text) {
      texts.push(block.text);
    }
  }
  let text = texts.join("").replace(/\s+/g, " ").trim();
  // Strip XML-like system tags (e.g. <local-command-caveat>...</local-command-caveat>, <ide_opened_file>)
  text = text.replace(/<[^>]+>/g, "").trim();
  return truncate(text, 200);
}

/**
 * Get a human-friendly tool result content string.
 */
export function getToolResultText(
  content: string | Array<{ type: string; text?: string }>
): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!)
      .join("\n");
  }
  return String(content);
}
