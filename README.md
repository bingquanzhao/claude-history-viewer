# Claude History Viewer

English | [中文](./README.zh-CN.md)

Browse, search, and review all your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) conversation history across every project — in a beautiful dark-themed web UI.

## Why This Tool Exists

If you use Claude Code daily, you've probably hit these pain points:

**1. `/resume` is project-scoped**
Claude Code's built-in `/resume` command only shows conversation history for the current project. If you work across 5, 10, or 20 projects, there's no way to see all your conversations in one place or remember which project a particular conversation happened in.

**2. Raw JSONL is unreadable**
Claude Code stores conversations as JSONL files in `~/.claude/projects/`. These files contain streaming message fragments, tool call/result pairs, progress events, and binary image data — all interleaved. Opening them in a text editor is practically useless.

**3. No way to search across conversations**
Need to find that one conversation where Claude helped you configure Nginx? Or the session where you debugged a tricky race condition? There's no built-in search. You'd have to `grep` through raw JSONL files and try to piece together context from fragmented JSON.

**4. Tool calls are invisible**
When Claude reads files, runs commands, edits code, or spawns sub-agents, these operations are recorded in the JSONL but completely opaque without proper rendering. You can't see what Claude actually *did* during a session.

Claude History Viewer solves all of these by parsing the raw JSONL data and rendering it as a clean, navigable conversation UI.

## Screenshots

### Home — Cross-project overview with stats and recent conversations
All your projects listed in the sidebar, with session counts and quick access. The main area shows aggregate stats and the most recent conversations across every project. Sensitive conversations can be hidden with the eye toggle before taking screenshots.

![Home](./docs/screenshots/image1.png)

### Conversation — Tool call renderers (Read File & Edit Diff)
Each tool Claude uses gets a dedicated visual component. Here you can see the **Read File** tool (blue border) displaying file content, and the **Edit File** tool (orange border) showing a side-by-side diff with red (removed) and green (added) highlighting.

![Conversation - Read & Edit](./docs/screenshots/image2.png)

### Conversation — Terminal command renderer
The **Bash** tool (green border) renders commands in a dark terminal style with syntax-highlighted output. Collapsible result sections keep long outputs tidy.

![Conversation - Bash](./docs/screenshots/image4.png)

### Global Search (`Cmd+K`)
Full-text search across all conversations in all projects. Results are grouped by project with sticky headers, matched keywords highlighted in violet, and session context shown for each result. Navigate with keyboard shortcuts.

![Search](./docs/screenshots/image3.png)

## Features

### Cross-Project Navigation
The sidebar displays all your projects from `~/.claude/projects/`, sorted by most recently active. Each project expands to show its conversation sessions with a preview of the first user message. Clicking a session in any project auto-expands that project folder. Empty sessions (with no user messages) are automatically filtered out.

### Conversation Replay
Every session is rendered as a complete conversation thread. The parser handles Claude Code's streaming format — merging fragmented assistant messages that share the same `message.id`, and matching each `tool_use` block with its corresponding `tool_result` from the next message.

### Specialized Tool Renderers
Each tool type Claude uses gets a dedicated visual component:

- **Terminal (Bash)** — Dark terminal-style block with `$` prefix, command description, and collapsible output
- **File Read** — Shows the file path with line range indicators
- **File Write** — Collapsible file content with line count
- **File Edit** — Side-by-side diff view with red (removed) and green (added) highlighting
- **Search (Grep/Glob)** — Displays search pattern, path scope, and matched results
- **Sub-agent (Task)** — Shows delegated task description and agent response
- **Generic fallback** — Any other tool renders with collapsible JSON input parameters

Each tool type has a distinct colored left border (green for Bash, blue for Read, amber for Write, orange for Edit, cyan for Search, purple for Task) so you can visually scan what Claude did at a glance.

### Thinking Process
Claude's extended thinking blocks are rendered as collapsible sections — folded by default with a brief preview, expandable to reveal the full reasoning chain. This keeps the conversation readable while preserving access to Claude's thought process.

### Markdown Rendering
Assistant text responses are rendered as full GitHub Flavored Markdown with support for headings, lists, tables, blockquotes, inline code, and fenced code blocks.

### Global Search (`Cmd+K`)
Press `Cmd+K` (or `Ctrl+K`) anywhere to open the search dialog:

- **Full-text search** across all conversations in all projects
- **Keyword highlighting** — matched terms are highlighted in violet
- **Keyboard navigation** — `↑↓` to move between results, `Enter` to open, `Esc` to close
- **Results grouped by project** — sticky project headers make it easy to scan
- **Session context** — each result shows the session's first user message so you know which conversation it came from

### Copy Buttons
Every user message, assistant response, and code block has a hover-revealed copy button. One click to copy content to clipboard.

### Session Metadata
Each conversation view shows metadata at the top: the Claude model used (e.g. `claude-opus-4-6`), the working directory, the git branch, and total message count.

## Quick Start

```bash
git clone https://github.com/bingquanzhao/claude-history-show.git
cd claude-history-show

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Prerequisites

- **Node.js** 18+
- **Claude Code** installed with existing conversation history in `~/.claude/projects/`

### Production Build

```bash
npm run build
npm start
```

## How It Works

Claude Code writes conversation data to `~/.claude/projects/[PROJECT_PATH]/[SESSION_UUID].jsonl`. Each line is a JSON object with a `type` field:

| Type | Description |
|------|-------------|
| `user` | User messages (text, images, tool results) |
| `assistant` | Claude's responses (text, thinking, tool calls) |
| `progress` | Streaming progress events for tool execution |
| `file-history-snapshot` | File state snapshots for undo capability |

The viewer's parsing pipeline:

1. **Project Scanner** (`lib/parser/project-scanner.ts`) — Walks `~/.claude/projects/` to discover all project directories and their `.jsonl` session files
2. **JSONL Reader** (`lib/parser/jsonl-reader.ts`) — Streams and parses JSONL files line by line for memory efficiency
3. **Session Parser** (`lib/parser/session-parser.ts`) — Filters to user/assistant messages, merges consecutive assistant entries that share the same `message.id` (Claude Code writes streaming responses as multiple JSONL lines), and handles content that may be plain strings, character arrays, or structured content blocks
4. **Conversation Builder** (`lib/parser/conversation-builder.ts`) — Matches `tool_use` blocks (in assistant messages) with their `tool_result` blocks (in the subsequent user message) by `tool_use_id`, producing a clean conversation structure where each tool call carries its result

All processing happens server-side via Next.js API routes. **No data leaves your machine.**

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router, Turbopack) | Server-side JSONL parsing via API routes, fast HMR |
| Styling | Tailwind CSS | Utility-first, zero runtime, dark theme |
| Markdown | react-markdown + remark-gfm | GFM tables, task lists, strikethrough |
| Icons | lucide-react | Clean, consistent icon set |
| Search | Server-side full-text | No external service needed, streams through files |

## Project Structure

```
app/
├── layout.tsx                              # Root layout (dark theme)
├── page.tsx                                # Home: project stats + recent sessions
├── globals.css                             # Tailwind + custom styles (dark theme, diff, terminal)
├── api/
│   ├── projects/route.ts                   # GET all projects and sessions
│   ├── sessions/[sessionId]/route.ts       # GET parsed conversation for a session
│   └── search/route.ts                     # GET full-text search results
└── project/[projectName]/
    └── session/[sessionId]/page.tsx        # Conversation detail page

components/
├── layout/
│   ├── Sidebar.tsx                         # Project tree with auto-expand on navigation
│   └── Header.tsx                          # Breadcrumb + search trigger
├── conversation/
│   ├── ConversationView.tsx                # Main conversation container with metadata bar
│   ├── UserMessage.tsx                     # User message with violet theme
│   ├── AssistantMessage.tsx                # Assistant message dispatcher
│   ├── ThinkingBlock.tsx                   # Collapsible thinking process
│   ├── TextBlock.tsx                       # Markdown rendering
│   ├── ToolUseBlock.tsx                    # Tool call dispatcher (routes to tools/*)
│   ├── ToolResultBlock.tsx                 # Collapsible tool output
│   └── CopyButton.tsx                     # Clipboard copy
├── tools/
│   ├── BashTool.tsx                        # Terminal-style command display
│   ├── ReadTool.tsx                        # File read display
│   ├── WriteTool.tsx                       # File write with collapsible content
│   ├── EditTool.tsx                        # Diff view (red/green)
│   ├── SearchTool.tsx                      # Grep/Glob search display
│   └── GenericTool.tsx                     # Fallback for unknown tools
└── search/
    └── SearchDialog.tsx                    # Cmd+K search with keyboard nav + grouping

lib/
├── types.ts                                # All TypeScript type definitions
├── constants.ts                            # ~/.claude paths, tool color/label mappings
├── utils.ts                                # cn(), formatProjectName(), truncate(), etc.
└── parser/
    ├── jsonl-reader.ts                     # Streaming JSONL file reader
    ├── session-parser.ts                   # Merge streaming messages, parse content blocks
    ├── conversation-builder.ts             # Match tool_use ↔ tool_result, build conversation
    └── project-scanner.ts                  # Discover projects and sessions from filesystem
```

## Privacy

This tool runs entirely on your local machine. It reads Claude Code's conversation files from your home directory (`~/.claude/projects/`) and serves them through a local Next.js server. No data is sent to any external service.

## License

MIT
