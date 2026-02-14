import type {
  ConversationMessage,
  ToolUseContent,
  ToolResultContent,
  ContentBlock,
} from "@/lib/types";

/**
 * Build an ordered conversation from parsed messages.
 * Key logic:
 * - Match tool_use blocks with their corresponding tool_result
 *   (assistant tool_use.id matches the next user message's tool_result.tool_use_id)
 * - Separate user "real" messages from tool_result messages
 * - Produce a clean conversation flow
 */
export function buildConversation(
  messages: ConversationMessage[]
): ConversationMessage[] {
  // Build a map of tool_use_id -> tool_result
  const toolResultMap = new Map<string, ToolResultContent>();

  for (const msg of messages) {
    if (msg.role === "user") {
      for (const block of msg.blocks) {
        if (block.type === "tool_result") {
          toolResultMap.set(block.toolUseId, block);
        }
      }
    }
  }

  // Now walk through and attach tool results to tool_use blocks
  const result: ConversationMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "assistant") {
      const enrichedBlocks: ContentBlock[] = msg.blocks.map((block) => {
        if (block.type === "tool_use") {
          const toolResult = toolResultMap.get(block.toolUseId);
          if (toolResult) {
            return { ...block, result: toolResult };
          }
        }
        return block;
      });

      result.push({ ...msg, blocks: enrichedBlocks });
    } else if (msg.role === "user") {
      // Only include user messages that have real content (text/image)
      const realBlocks = msg.blocks.filter(
        (b) => b.type === "text" || b.type === "image"
      );
      if (realBlocks.length > 0) {
        result.push({ ...msg, blocks: realBlocks });
      }
    }
  }

  return result;
}
