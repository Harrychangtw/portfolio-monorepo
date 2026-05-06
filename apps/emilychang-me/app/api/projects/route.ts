import { NextResponse } from "next/server";
import { getAllProjectsMetadata } from "@portfolio/lib/lib/markdown";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "en";
  const section = searchParams.get("section") || undefined;

  try {
    const projects = getAllProjectsMetadata(locale, section);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    const err = error as NodeJS.ErrnoException;
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        message: err?.message,
        code: err?.code,
        path: err?.path,
        stack: err?.stack,
        cwd: process.cwd(),
        dirname: typeof __dirname !== "undefined" ? __dirname : "(unavailable)",
      },
      { status: 500 },
    );
  }
}
