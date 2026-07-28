import { NextRequest } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { ok, badRequest, serverError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request);
    if (auth.error || !auth.data) {
      return badRequest(auth.error ?? "Unauthorized");
    }

    const { data } = auth;

    return ok({
      valid: true,
      project_id: data.projectId,
      workspace_id: data.workspaceId,
    });
  } catch (error) {
    return serverError(error);
  }
}
