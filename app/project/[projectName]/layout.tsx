import Sidebar from "@/components/layout/Sidebar";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-zinc-950 text-zinc-100">
      <Sidebar />
      {children}
    </div>
  );
}
