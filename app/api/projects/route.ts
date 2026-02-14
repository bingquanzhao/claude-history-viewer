import { NextResponse } from "next/server";
import { scanProjects } from "@/lib/parser/project-scanner";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await scanProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to scan projects:", error);
    return NextResponse.json(
      { error: "Failed to scan projects" },
      { status: 500 }
    );
  }
}
