// ============================================================
// Raw JSONL types (as written by Claude Code)
// ============================================================

export interface RawJSONLEntry {
  type: "user" | "assistant" | "progress" | "file-history-snapshot";
  uuid?: string;
  parentUuid?: string | null;
  isSidechain?: boolean;
  userType?: string;
  cwd?: string;
  sessionId?: string;
  version?: string;
  gitBranch?: string;
  message?: RawMessage;
  requestId?: string;
  timestamp?: string;
  // progress-specific
  data?: unknown;
  toolUseID?: string;
  parentToolUseID?: string;
  slug?: string;
  // file-history-snapshot
  messageId?: string;
  snapshot?: unknown;
}

export interface RawMessage {
  id?: string;
  role: "user" | "assistant";
  content: RawContentBlock[];
  model?: string;
  stop_reason?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}

export type RawContentBlock =
  | RawTextBlock
  | RawThinkingBlock
  | RawToolUseBlock
  | RawToolResultBlock
  | RawImageBlock;

export interface RawTextBlock {
  type: "text";
  text: string;
}

export interface RawThinkingBlock {
  type: "thinking";
  thinking: string;
}

export interface RawToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface RawToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string | Array<{ type: string; text?: string }>;
  is_error?: boolean;
}

export interface RawImageBlock {
  type: "image";
  source: {
    type: string;
    media_type: string;
    data: string;
  };
}

// ============================================================
// Parsed / Merged types (used by the UI)
// ============================================================

export interface Project {
  name: string;
  displayName: string;
  path: string;
  sessions: SessionMeta[];
  lastActive: string;
}

export interface SessionMeta {
  id: string;
  projectName: string;
  filePath: string;
  timestamp: string;
  lastActive: string;
  messageCount: number;
  firstUserMessage: string;
  hasSubagents: boolean;
}

export interface ParsedSession {
  id: string;
  projectName: string;
  messages: ConversationMessage[];
  metadata: {
    cwd?: string;
    version?: string;
    gitBranch?: string;
    model?: string;
    totalTokens?: number;
  };
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  blocks: ContentBlock[];
  timestamp?: string;
  uuid?: string;
}

export type ContentBlock =
  | TextContent
  | ThinkingContent
  | ToolUseContent
  | ToolResultContent
  | ImageContent;

export interface TextContent {
  type: "text";
  text: string;
}

export interface ThinkingContent {
  type: "thinking";
  thinking: string;
}

export interface ToolUseContent {
  type: "tool_use";
  toolUseId: string;
  name: string;
  input: Record<string, unknown>;
  result?: ToolResultContent;
}

export interface ToolResultContent {
  type: "tool_result";
  toolUseId: string;
  content: string;
  isError?: boolean;
}

export interface ImageContent {
  type: "image";
  mediaType: string;
  data: string;
}

// ============================================================
// Tool-specific input types (for specialized renderers)
// ============================================================

export interface BashInput {
  command: string;
  description?: string;
  timeout?: number;
}

export interface ReadInput {
  file_path: string;
  offset?: number;
  limit?: number;
}

export interface WriteInput {
  file_path: string;
  content: string;
}

export interface EditInput {
  file_path: string;
  old_string: string;
  new_string: string;
}

export interface GrepInput {
  pattern: string;
  path?: string;
  glob?: string;
  output_mode?: string;
}

export interface GlobInput {
  pattern: string;
  path?: string;
}

export interface TaskInput {
  description: string;
  prompt: string;
  subagent_type?: string;
}

// ============================================================
// Search types
// ============================================================

export interface SearchResult {
  sessionId: string;
  projectName: string;
  projectDirName: string;
  messageId: string;
  role: "user" | "assistant";
  snippet: string;
  sessionContext: string;
  timestamp?: string;
}
