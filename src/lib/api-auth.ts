import crypto from "crypto";
import { db } from "@/drizzle";
import { api_keys, projects } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export interface AuthedApiRequest {
  apiKeyId: string;
  projectId: string;
  workspaceId: string;
}

export async function authenticateApiKey(
  request: Request,
): Promise<{ data: AuthedApiRequest; error?: undefined } | { error: string; data?: undefined }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return { error: "Missing Authorization header" };
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return { error: "Invalid Authorization format. Use: Bearer <key>" };
  }

  const prefix = token.split(".")[0];
  if (!prefix) {
    return { error: "Invalid API key format" };
  }

  const hash = crypto.createHash("sha256").update(token).digest("hex");

  const [key] = await db
    .select()
    .from(api_keys)
    .where(eq(api_keys.key_prefix, prefix))
    .limit(1);

  if (!key) {
    return { error: "API key not found" };
  }

  if (key.status !== "active") {
    return { error: "API key is not active" };
  }

  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return { error: "API key has expired" };
  }

  if (key.key_hash !== hash) {
    return { error: "Invalid API key" };
  }

  await db
    .update(api_keys)
    .set({ last_used_at: new Date() })
    .where(eq(api_keys.id, key.id));

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, key.project_id))
    .limit(1);

  return {
    data: {
      apiKeyId: key.id,
      projectId: key.project_id,
      workspaceId: project?.workspace_id ?? "",
    },
  };
}
