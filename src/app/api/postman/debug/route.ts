import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const apiKey = body?.apiKey || request.cookies.get("postman_api_key")?.value;

  if (!apiKey) {
    return NextResponse.json({ error: "Not connected to Postman" }, { status: 400 });
  }

  const headers = { "x-api-key": apiKey };
  const base = "https://api.getpostman.com";

  try {
    // Get current user info
    const meRes = await fetch(`${base}/me`, { headers });
    const meData = await meRes.json();

    const [workspacesRes, environmentsRes] = await Promise.all([
      fetch(`${base}/workspaces`, { headers }),
      fetch(`${base}/environments`, { headers }),
    ]);

    const workspacesData = await workspacesRes.json();
    const environmentsData = await environmentsRes.json();

    const workspaces = workspacesData.workspaces || [];

    // Get detail for each workspace so we can see createdBy
    const workspaceDetails = await Promise.all(
      workspaces.slice(0, 10).map(async (ws: { id: string; name: string }) => {
        const res = await fetch(`${base}/workspaces/${ws.id}`, { headers });
        const data = await res.json();
        const detail = data.workspace || {};
        return {
          id: ws.id,
          name: ws.name,
          createdBy: detail.createdBy,
          collections: (detail.collections || []).map(
            (c: { id: string; name: string; uid: string }) => ({
              id: c.id,
              name: c.name,
              uid: c.uid,
            })
          ),
          environments: (detail.environments || []).map(
            (e: { id: string; name: string; uid: string }) => ({
              id: e.id,
              name: e.name,
              uid: e.uid,
            })
          ),
        };
      })
    );

    // Get environment variable details
    const environments = environmentsData.environments || [];
    const envDetails = await Promise.all(
      environments.slice(0, 10).map(async (env: { uid: string; name: string; owner: string }) => {
        const res = await fetch(`${base}/environments/${env.uid}`, { headers });
        const data = await res.json();
        return {
          uid: env.uid,
          name: env.name,
          owner: env.owner,
          values: (data.environment?.values || []).map(
            (v: { key: string; value: string; type: string }) => ({
              key: v.key,
              value: v.type === "secret" ? "(secret)" : v.value,
              type: v.type,
            })
          ),
        };
      })
    );

    return NextResponse.json(
      {
        user: {
          id: meData.user?.id,
          id_as_string: String(meData.user?.id),
          username: meData.user?.username,
          // Show the full user object keys for debugging
          raw_keys: Object.keys(meData.user || {}),
        },
        workspaces: workspaceDetails,
        environments: envDetails,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
