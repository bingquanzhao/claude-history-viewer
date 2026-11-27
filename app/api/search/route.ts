import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import readline from "readline";
import { PROJECTS_DIR } from "@/lib/constants";
import { formatProjectName, truncate } from "@/lib/utils";
import type { SearchResult, RawJSONLEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase().trim();
  const mode = searchParams.get("mode") || "fts";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Use the prebuilt local SQLite index instead of rescanning multi-GB JSONL.
    const modes = mode === "both" ? ["fts", "semantic"] : [mode];
    const payloads = await Promise.all(modes.map(async (m) => {
      const upstream = await fetch(`http://127.0.0.1:8765/api/search?q=${encodeURIComponent(query)}&mode=${m}&limit=50`, { cache: "no-store" });
      return upstream.json();
    }));
    const data = { results: payloads.flatMap((p) => p.results || []) };
    const results: SearchResult[] = (data.results || []).map((hit: any) => ({
      sessionId: hit.chat_id,
      projectName: hit.title || hit.worktree || hit.source_type || "Claude",
      projectDirName: hit.worktree || hit.source_type || "",
      messageId: hit.message_id || String(hit.line_no || ""),
      lineNo: hit.line_no,
      role: hit.role,
      snippet: truncate(hit.text || "", 350),
      sessionContext: hit.title || "",
      timestamp: hit.timestamp,
    }));
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

function extractText(
  content: unknown
): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  const parts: string[] = [];
  for (const block of content) {
    if (typeof block === "string") {
      parts.push(block);
    } else if (typeof block === "object" && block !== null) {
      const b = block as Record<string, unknown>;
      if (b.type === "text" && typeof b.text === "string") {
        parts.push(b.text);
      }
    }
  }
  return parts.join("");
}

async function searchSession(
  filePath: string,
  sessionId: string,
  projectName: string,
  query: string,
  projectMatches: boolean
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  let sessionContext = "";

  const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const entry = JSON.parse(trimmed) as RawJSONLEntry;
      if (entry.type !== "user" && entry.type !== "assistant") continue;
      if (!entry.message?.content) continue;

      // Capture first user message as session context
      if (!sessionContext && entry.type === "user") {
        const raw = extractText(entry.message.content);
        sessionContext = truncate(
          raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
          120
        );
      }

      // Search through content blocks
      const content = entry.message.content;
      const blocks: Array<{ text: string }> = [];
      if (typeof content === "string") {
        blocks.push({ text: content });
      } else if (Array.isArray(content)) {
        for (const block of content) {
          if (typeof block === "string") continue;
          if (typeof block !== "object" || !block) continue;
          const b = block as unknown as Record<string, unknown>;
          if (typeof b.text === "string") blocks.push({ text: b.text });
          else if (typeof b.thinking === "string")
            blocks.push({ text: b.thinking });
        }
      }

      for (const { text } of blocks) {
        if (!text) continue;
        if (!text.toLowerCase().includes(query) && !projectMatches) continue;

        const lowerText = text.toLowerCase();
        const idx = lowerText.indexOf(query);
        const start = Math.max(0, idx - 80);
        const end = Math.min(text.length, idx + query.length + 200);
        const snippet =
          (start > 0 ? "…" : "") +
          text.slice(start, end).replace(/\s+/g, " ") +
          (end < text.length ? "…" : "");

        results.push({
          sessionId,
          projectName: formatProjectName(projectName),
          projectDirName: projectName,
          messageId: entry.uuid || "",
          role: entry.message.role,
          snippet: truncate(snippet, 350),
          sessionContext,
          timestamp: entry.timestamp,
        });
        break;
      }

      if (results.length >= 10) break;
    } catch {
      continue;
    }
  }

  fileStream.destroy();
  return results;
}
