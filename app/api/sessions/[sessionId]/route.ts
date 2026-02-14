import { NextResponse } from "next/server";
import { readJSONL } from "@/lib/parser/jsonl-reader";
import { parseEntries } from "@/lib/parser/session-parser";
import { buildConversation } from "@/lib/parser/conversation-builder";
import { findSessionFile } from "@/lib/parser/project-scanner";
import type { ParsedSession } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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

    const rawEntries = await readJSONL(sessionInfo.filePath);
    const parsed = parseEntries(rawEntries);
    const conversation = buildConversation(parsed);

    // Extract metadata from first entry
    const firstEntry = rawEntries.find(
      (e) => e.type === "user" || e.type === "assistant"
    );
    const assistantEntry = rawEntries.find(
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

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to parse session:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to parse session", detail: message },
      { status: 500 }
    );
  }
}
