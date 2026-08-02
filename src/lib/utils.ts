import crypto from "crypto";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatDuration(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function generateApiKey(): { key: string; prefix: string; hash: string; lastFour: string } {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomString = (length: number) => {
    const bytes = crypto.randomBytes(length);
    let out = "";
    for (let i = 0; i < length; i++) {
      out += chars[bytes[i] % chars.length];
    }
    return out;
  };
  const prefix = "qos_" + randomString(8);
  const secret = randomString(32);
  const key = `${prefix}.${secret}`;
  const lastFour = secret.slice(-4);
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return { key, prefix, hash, lastFour };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: "text-emerald-500",
    POST: "text-blue-500",
    PUT: "text-amber-500",
    PATCH: "text-violet-500",
    DELETE: "text-red-500",
  };
  return colors[method] ?? "text-muted-foreground";
}

export function getStatusColor(status: number | null): string {
  if (status === null) return "text-muted-foreground";
  if (status < 200) return "text-muted-foreground";
  if (status < 300) return "text-emerald-500";
  if (status < 400) return "text-blue-500";
  if (status < 500) return "text-amber-500";
  return "text-red-500";
}

export function getLatencyColor(ms: number): string {
  if (ms < 100) return "text-emerald-500";
  if (ms < 500) return "text-amber-500";
  return "text-red-500";
}

export function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function formatWindow(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${ms / 1000}s`;
  if (ms < 3_600_000) return `${ms / 60_000}m`;
  return `${ms / 3_600_000}h`;
}
