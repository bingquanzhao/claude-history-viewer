import { NextResponse } from "next/server";
import { readJSONLHead, readJSONLPage } from "@/lib/parser/jsonl-reader";
import { parseEntries } from "@/lib/parser/session-parser";
import { buildConversation } from "@/lib/parser/conversation-builder";
import { findSessionFile } from "@/lib/parser/project-scanner";
import type { ParsedSession } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const sessionInfo = findSessionFile(sessionId);

    if (!sessionInfo) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
    const limit = Math.min(200, Math.max(20, Number(url.searchParams.get("limit") || 120)));
    const line = Math.max(0, Number(url.searchParams.get("line") || 0));
    const page = await readJSONLPage(sessionInfo.filePath, offset, limit, line);
    const parsed = parseEntries(page.entries);
    const conversation = buildConversation(parsed);

    // Extract metadata from first entry
    const headEntries = await readJSONLHead(sessionInfo.filePath, 8);
    const firstEntry = headEntries.find(
      (e) => e.type === "user" || e.type === "assistant"
    );
    const assistantEntry = headEntries.find(
      (e) => e.type === "assistant" && e.message?.model
    );

    const session: ParsedSession = {
      id: sessionId,
      projectName: sessionInfo.projectName,
      messages: conversation,
      metadata: {
        cwd: firstEntry?.cwd,
        version: firstEntry?.version,
        gitBranch: firstEntry?.gitBranch,
        model: assistantEntry?.message?.model,
      },
    };

    return NextResponse.json({ ...session, messages: conversation, offset: page.offset, hasMore: page.hasMore });
  } catch (error) {
    console.error("Failed to parse session:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to parse session", detail: message },
      { status: 500 }
    );
  }
}
