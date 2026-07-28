import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/drizzle";
import { api_keys } from "@/drizzle/schema";
import { authenticateApiKey } from "@/lib/api-auth";
import { generateApiKey } from "@/lib/utils";
import { ok, unauthorized, serverError, validationError, parseJsonBody } from "@/lib/api-utils";

const bodySchema = z.object({
  name: z.string().min(1).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request);
    if (auth.error || !auth.data) {
      return unauthorized(auth.error ?? "Unauthorized");
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

    const { name } = parsed.data;
    const { key, prefix, hash, lastFour } = generateApiKey();

    const [inserted] = await db
      .insert(api_keys)
      .values({
        project_id: data.projectId,
        name,
        key_prefix: prefix,
        key_hash: hash,
        key_last_four: lastFour,
        status: "active",
      })
      .returning();

    return ok({ key, id: inserted.id, key_prefix: prefix, key_last_four: lastFour });
  } catch (error) {
    return serverError(error);
  }
}
