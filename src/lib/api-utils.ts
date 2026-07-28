import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

export function ok<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message } as const, { status: 200 });
}

export function created<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message } as const, { status: 201 });
}

export function badRequest(error: string) {
  return NextResponse.json({ success: false, error } as const, { status: 400 });
}

export function unauthorized(error = "Unauthorized") {
  return NextResponse.json({ success: false, error } as const, { status: 401 });
}

export function forbidden(error = "Forbidden") {
  return NextResponse.json({ success: false, error } as const, { status: 403 });
}

export function notFound(error = "Resource not found") {
  return NextResponse.json({ success: false, error } as const, { status: 404 });
}

export function conflict(error: string) {
  return NextResponse.json({ success: false, error } as const, { status: 409 });
}

export function serverError(error: unknown) {
  logger.error(error, "Internal server error");
  const message = process.env.NODE_ENV === "production" ? "Internal server error" : String(error);
  return NextResponse.json({ success: false, error: message } as const, { status: 500 });
}

export function handleZodError(error: ZodError) {
  const message = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
  return badRequest(message);
}

export function validationError(field: string, message: string) {
  return NextResponse.json({ success: false, error: field ? `${field}: ${message}` : message } as const, { status: 422 });
}

export async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  return request.json().catch(() => ({}));
}
