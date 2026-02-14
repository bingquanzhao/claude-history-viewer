"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "./CopyButton";

interface TextBlockProps {
  text: string;
}

export default function TextBlock({ text }: TextBlockProps) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children, ...props }) {
            // Extract code content for copy button
            const codeElement = children as React.ReactElement<{
              children?: string;
              className?: string;
            }>;
            let codeText = "";
            if (
              codeElement &&
              typeof codeElement === "object" &&
              "props" in codeElement
            ) {
              codeText = String(codeElement.props.children || "").replace(
                /\n$/,
                ""
              );
            }
            return (
              <div className="relative group my-3">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton text={codeText} />
                </div>
                <pre
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto"
                  {...props}
                >
                  {children}
                </pre>
              </div>
            );
          },
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-violet-300"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={cn(className, "text-sm")} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
