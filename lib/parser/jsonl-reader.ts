import fs from "fs";
import readline from "readline";
import type { RawJSONLEntry } from "@/lib/types";

/**
 * Read a JSONL file and return parsed entries.
 * Uses streaming to handle large files efficiently.
 */
export async function readJSONL(filePath: string): Promise<RawJSONLEntry[]> {
  const entries: RawJSONLEntry[] = [];

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
      entries.push(entry);
    } catch {
      // Skip malformed lines
    }
  }

  return entries;
}

/**
 * Read only the first N user/assistant entries for metadata extraction.
 * Scans up to maxLines total lines to find user/assistant messages,
 * since sessions may start with many progress/snapshot entries.
 */
export async function readJSONLHead(
  filePath: string,
  maxEntries: number = 5,
  maxLines: number = 200
): Promise<RawJSONLEntry[]> {
  const entries: RawJSONLEntry[] = [];
  let count = 0;
  let lineNum = 0;

  const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    lineNum++;
    if (lineNum > maxLines) break;
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed) as RawJSONLEntry;
      if (entry.type === "user" || entry.type === "assistant") {
        entries.push(entry);
        count++;
        if (count >= maxEntries) break;
      }
    } catch {
      // Skip malformed lines
    }
  }

  fileStream.destroy();
  return entries;
}
