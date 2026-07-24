import { NextRequest, NextResponse } from "next/server";
import { getMe, listWorkspaces, getWorkspace } from "@/lib/postman-api";
import { ValidationContext } from "@/types/validation";

const MODULE_WORKSPACE_PATTERNS: Record<string, { contextKey: keyof ValidationContext; namePattern: RegExp }> = {
  "artemis-mission-control": { contextKey: "artemisWorkspaceId", namePattern: /artemis/i },
  "api-basics": { contextKey: "apiBasicsWorkspaceId", namePattern: /coffee\s+api/i },
  "banking-ai-mcp-bootcamp": { contextKey: "bankingWorkspaceId", namePattern: /intergalactic\s+banking/i },
};

export async function POST(request: NextRequest) {
  const { moduleId, context, apiKey: bodyKey } = (await request.json()) as {
    moduleId: string;
    context?: ValidationContext;
    apiKey?: string;
  };

  const apiKey = bodyKey || request.cookies.get("postman_api_key")?.value;

  if (!apiKey) {
    return NextResponse.json({ error: "Not connected to Postman" }, { status: 400 });
  }

  try {
    const user = await getMe(apiKey);
    const config = MODULE_WORKSPACE_PATTERNS[moduleId];

    if (!config) {
      return NextResponse.json({
        username: user.username,
        workspaceId: "N/A",
        workspaceName: "No workspace pattern configured for this module",
        collections: [],
      });
    }

    const scopedId = context?.[config.contextKey] as string | undefined;

    if (scopedId) {
      const detail = await getWorkspace(apiKey, scopedId);
      return NextResponse.json({
        username: user.username,
        workspaceId: scopedId,
        workspaceName: detail.name ?? "Unknown",
        collections: (detail.collections ?? []).map((c: { name: string; uid: string }) => ({
          name: c.name,
          uid: c.uid,
        })),
      });
    }

    const workspaces = await listWorkspaces(apiKey);
    const match = workspaces.find((ws) => config.namePattern.test(ws.name));

    if (!match) {
      return NextResponse.json({
        username: user.username,
        workspaceId: "Not found",
        workspaceName: "No matching workspace found",
        collections: [],
      });
    }

    const detail = await getWorkspace(apiKey, match.id);
    return NextResponse.json({
      username: user.username,
      workspaceId: match.id,
      workspaceName: detail.name ?? match.name,
      collections: (detail.collections ?? []).map((c: { name: string; uid: string }) => ({
        name: c.name,
        uid: c.uid,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch debug info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
