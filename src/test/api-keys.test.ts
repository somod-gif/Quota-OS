import { describe, it, expect } from "vitest";
import { generateApiKey } from "@/lib/utils";

describe("generateApiKey", () => {
  it("starts with qos_ prefix", () => {
    const result = generateApiKey();
    expect(result.key.startsWith("qos_")).toBe(true);
  });

  it("has prefix.secret dot-separated format", () => {
    const result = generateApiKey();
    expect(result.key).toMatch(/^qos_[A-Za-z0-9]+\.[A-Za-z0-9]+$/);
  });

  it("has a 32-character secret segment", () => {
    const result = generateApiKey();
    const secret = result.key.split(".")[1];
    expect(secret.length).toBe(32);
  });

  it("returns a SHA-256 hash as 64 hex characters", () => {
    const result = generateApiKey();
    expect(result.hash.length).toBe(64);
    expect(/^[a-f0-9]{64}$/.test(result.hash)).toBe(true);
  });

  it("generates unique keys across multiple calls", () => {
    const keys = Array.from({ length: 100 }, () => generateApiKey().key);
    expect(new Set(keys).size).toBe(100);
  });

  it("generates unique hashes across multiple calls", () => {
    const hashes = Array.from({ length: 100 }, () => generateApiKey().hash);
    expect(new Set(hashes).size).toBe(100);
  });

  it("returns correct lastFour from the secret", () => {
    const result = generateApiKey();
    const secret = result.key.split(".")[1];
    expect(result.lastFour).toBe(secret.slice(-4));
  });

  it("prefix is 12 characters long (qos_ + 8 random)", () => {
    const result = generateApiKey();
    expect(result.prefix.length).toBe(12);
    expect(result.prefix).toMatch(/^qos_/);
  });
});
