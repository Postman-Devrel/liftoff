import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pathId: string }> }
) {
  const { pathId } = await params;
  const safeName = pathId.replace(/[^a-z0-9-]/g, "");
  const badgePath = path.join(
    process.cwd(),
    "src/content/learning-paths",
    safeName,
    "badge.png"
  );

  try {
    const [file, fileStat] = await Promise.all([readFile(badgePath), stat(badgePath)]);
    const etag = `"${fileStat.mtimeMs.toString(36)}"`;
    return new NextResponse(file, {
      headers: {
        "Content-Type": "image/png",
        "ETag": etag,
        "Cache-Control": process.env.NODE_ENV === "production"
          ? "public, max-age=86400"
          : "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
