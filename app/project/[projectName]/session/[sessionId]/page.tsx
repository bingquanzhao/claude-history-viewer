"use client";

import { useState, useEffect, useCallback, use } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ConversationView from "@/components/conversation/ConversationView";
import SearchDialog from "@/components/search/SearchDialog";

interface PageProps {
  params: Promise<{
    projectName: string;
    sessionId: string;
  }>;
}

export default function SessionPage({ params }: PageProps) {
  const { projectName, sessionId } = use(params);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          projectName={decodeURIComponent(projectName)}
          sessionId={sessionId}
          onSearchOpen={() => setSearchOpen(true)}
        />
        <main className="flex-1 overflow-hidden">
          <ConversationView sessionId={sessionId} />
        </main>
      </div>
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </>
  );
}
