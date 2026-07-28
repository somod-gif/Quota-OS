import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/drizzle";
import { request_logs } from "@/drizzle/schema";
import { authenticateApiKey } from "@/lib/api-auth";
import { created, badRequest, serverError, validationError, parseJsonBody } from "@/lib/api-utils";

const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

const bodySchema = z.object({
  method: z.enum(httpMethods),
  path: z.string().min(1).max(2048),
  status_code: z.number().int().min(100).max(599).nullish(),
  latency_ms: z.number().int().min(0).nullish(),
  ip_address: z.string().max(45).nullish(),
  user_agent: z.string().max(512).nullish(),
  blocked: z.boolean().nullish(),
  rate_limited: z.boolean().nullish(),
  cached: z.boolean().nullish(),
  error: z.string().max(1024).nullish(),
  request_body_size: z.number().int().min(0).nullish(),
  response_body_size: z.number().int().min(0).nullish(),
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

    const body = parsed.data;

    const [log] = await db
      .insert(request_logs)
      .values({
        project_id: data.projectId,
        api_key_id: data.apiKeyId,
        method: body.method,
        path: body.path,
        status_code: body.status_code ?? null,
        latency_ms: body.latency_ms ?? null,
        ip_address: body.ip_address ?? request.headers.get("x-forwarded-for") ?? null,
        user_agent: body.user_agent ?? request.headers.get("user-agent") ?? null,
        blocked: body.blocked ?? false,
        rate_limited: body.rate_limited ?? false,
        cached: body.cached ?? false,
        error: body.error ?? null,
        request_body_size: body.request_body_size ?? null,
        response_body_size: body.response_body_size ?? null,
      })
      .returning();

    return created({ id: log.id });
  } catch (error) {
    return serverError(error);
  }
}
