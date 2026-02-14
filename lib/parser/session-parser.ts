import type {
  RawJSONLEntry,
  RawContentBlock,
  ConversationMessage,
  ContentBlock,
  TextContent,
  ThinkingContent,
  ToolUseContent,
  ImageContent,
} from "@/lib/types";
import { getToolResultText } from "@/lib/utils";

/**
 * Parse raw JSONL entries into a flat list of conversation messages.
 * Key logic:
 * - Consecutive assistant entries with the same message.id are merged
 *   (streaming produces multiple entries per logical message)
 * - file-history-snapshot and progress entries are skipped
 * - Sidechain messages are excluded
 */
export function parseEntries(entries: RawJSONLEntry[]): ConversationMessage[] {
  const messages: ConversationMessage[] = [];

  // Filter to user/assistant, skip sidechains
  const conversationEntries = entries.filter(
    (e) =>
      (e.type === "user" || e.type === "assistant") && !e.isSidechain
  );

  let i = 0;
  while (i < conversationEntries.length) {
    const entry = conversationEntries[i];

    if (entry.type === "user") {
      const msg = parseUserEntry(entry);
      if (msg) messages.push(msg);
      i++;
    } else if (entry.type === "assistant") {
      // Collect all consecutive assistant entries with the same message.id
      const msgId = entry.message?.id;
      const group: RawJSONLEntry[] = [entry];
      let j = i + 1;
      while (
        j < conversationEntries.length &&
        conversationEntries[j].type === "assistant" &&
        conversationEntries[j].message?.id === msgId
      ) {
        group.push(conversationEntries[j]);
        j++;
      }
      const msg = mergeAssistantEntries(group);
      if (msg) messages.push(msg);
      i = j;
    } else {
      i++;
    }
  }

  return messages;
}

function parseUserEntry(entry: RawJSONLEntry): ConversationMessage | null {
  if (!entry.message) return null;

  const blocks: ContentBlock[] = [];
  const content: unknown = entry.message.content;

  // Handle content that is a plain string (some user messages)
  if (typeof content === "string") {
    if (content.trim()) {
      blocks.push({ type: "text", text: content } as TextContent);
    }
  } else if (Array.isArray(content) && content.length > 0 && typeof content[0] === "string") {
    // Handle content that is an array of single-character strings
    const text = (content as string[]).join("");
    if (text.trim()) {
      blocks.push({ type: "text", text } as TextContent);
    }
  } else if (Array.isArray(content)) {
    for (const block of content) {
      if (typeof block === "string") continue;
      const parsed = parseContentBlock(block as RawContentBlock);
      if (parsed) blocks.push(parsed);
    }
  }

  // Skip empty tool_result-only messages from the visible conversation
  // (they'll be matched to tool_use blocks later)
  const hasToolResult = blocks.some((b) => b.type === "tool_result");
  const hasUserContent = blocks.some(
    (b) => b.type === "text" || b.type === "image"
  );

  if (hasToolResult && !hasUserContent) {
    // This is an internal tool result message — still return it for matching
    return {
      id: entry.uuid || crypto.randomUUID(),
      role: "user",
      blocks,
      timestamp: entry.timestamp,
      uuid: entry.uuid,
    };
  }

  if (blocks.length === 0) return null;

  return {
    id: entry.uuid || crypto.randomUUID(),
    role: "user",
    blocks,
    timestamp: entry.timestamp,
    uuid: entry.uuid,
  };
}

function mergeAssistantEntries(
  entries: RawJSONLEntry[]
): ConversationMessage | null {
  if (entries.length === 0) return null;

  const blocks: ContentBlock[] = [];
  for (const entry of entries) {
    if (!entry.message) continue;
    const content: unknown = entry.message.content;
    if (typeof content === "string") {
      if (content.trim()) {
        blocks.push({ type: "text", text: content } as TextContent);
      }
      continue;
    }
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (typeof block === "string") continue;
      const parsed = parseContentBlock(block as RawContentBlock);
      if (parsed) blocks.push(parsed);
    }
  }

  if (blocks.length === 0) return null;

  const first = entries[0];
  return {
    id: first.message?.id || first.uuid || crypto.randomUUID(),
    role: "assistant",
    blocks,
    timestamp: first.timestamp,
    uuid: first.uuid,
  };
}

function parseContentBlock(block: RawContentBlock): ContentBlock | null {
  switch (block.type) {
    case "text": {
      const text = (block as { type: "text"; text: string }).text;
      if (!text?.trim()) return null;
      return { type: "text", text } as TextContent;
    }
    case "thinking": {
      const thinking = (block as { type: "thinking"; thinking: string })
        .thinking;
      if (!thinking?.trim()) return null;
      return { type: "thinking", thinking } as ThinkingContent;
    }
    case "tool_use": {
      const tu = block as {
        type: "tool_use";
        id: string;
        name: string;
        input: Record<string, unknown>;
      };
      return {
        type: "tool_use",
        toolUseId: tu.id,
        name: tu.name,
        input: tu.input,
      } as ToolUseContent;
    }
    case "tool_result": {
      const tr = block as {
        type: "tool_result";
        tool_use_id: string;
        content: string | Array<{ type: string; text?: string }>;
        is_error?: boolean;
      };
      return {
        type: "tool_result",
        toolUseId: tr.tool_use_id,
        content: getToolResultText(tr.content),
        isError: tr.is_error,
      };
    }
    case "image": {
      const img = block as {
        type: "image";
        source: { type: string; media_type: string; data: string };
      };
      return {
        type: "image",
        mediaType: img.source.media_type,
        data: img.source.data,
      } as ImageContent;
    }
    default:
      return null;
  }
}
