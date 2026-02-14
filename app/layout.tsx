import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude History Viewer",
  description: "Browse and search Claude Code conversation history across projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="flex h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
