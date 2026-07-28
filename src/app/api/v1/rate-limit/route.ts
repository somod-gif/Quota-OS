import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiKey } from "@/lib/api-auth";
import { incrementRateLimit } from "@/lib/redis";
import { ok, badRequest, serverError, validationError, parseJsonBody } from "@/lib/api-utils";

const bodySchema = z.object({
  max_requests: z.number().int().positive().max(10000).default(100),
  window_ms: z.number().int().positive().max(86400000).default(60000),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request);
    if (auth.error || !auth.data) {
      return badRequest(auth.error ?? "Unauthorized");
    }

    const { data } = auth;
    const raw = await parseJsonBody(request);
    const parsed = bodySchema.safeParse(raw);

    if (!parsed.success) {
      return validationError(
        parsed.error.issues[0].path.join("."),
        parsed.error.issues[0].message,
      );
    }

    const { max_requests, window_ms } = parsed.data;

    const result = await incrementRateLimit(
      `api:${data.apiKeyId}`,
      max_requests,
      window_ms,
    );

    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
