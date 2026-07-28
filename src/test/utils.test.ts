import { describe, it, expect } from "vitest";
import { slugify, generateApiKey, truncate, getMethodColor, getStatusColor } from "@/lib/utils";

describe("slugify", () => {
  it("converts to lowercase and replaces spaces with hyphens", () => {
    expect(slugify("My Project")).toBe("my-project");
  });

  it("removes special characters", () => {
    expect(slugify("Hello World! @#$%")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a   b---c")).toBe("a-b-c");
  });
});

describe("generateApiKey", () => {
  it("returns key with prefix and secret separated by dot", () => {
    const result = generateApiKey();
    expect(result.key).toContain(".");
    expect(result.key.startsWith("qos_")).toBe(true);
  });

  it("returns correct last four characters", () => {
    const result = generateApiKey();
    const secret = result.key.split(".")[1];
    expect(result.lastFour).toBe(secret.slice(-4));
  });

  it("produces a SHA-256 hash", () => {
    const result = generateApiKey();
    expect(result.hash.length).toBe(64);
    expect(/^[a-f0-9]+$/.test(result.hash)).toBe(true);
  });
});

describe("truncate", () => {
  it("returns string as-is when shorter than limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and adds ellipsis when longer", () => {
    expect(truncate("hello world this is long", 10)).toBe("hello worl...");
  });
});

describe("getMethodColor", () => {
  it("returns color for known methods", () => {
    expect(getMethodColor("GET")).toBe("text-emerald-500");
    expect(getMethodColor("DELETE")).toBe("text-red-500");
  });

  it("returns default for unknown methods", () => {
    expect(getMethodColor("OPTIONS")).toBe("text-muted-foreground");
  });
});

describe("getStatusColor", () => {
  it("returns green for 2xx", () => {
    expect(getStatusColor(200)).toBe("text-emerald-500");
  });

  it("returns red for 5xx", () => {
    expect(getStatusColor(500)).toBe("text-red-500");
  });

  it("returns default for null", () => {
    expect(getStatusColor(null)).toBe("text-muted-foreground");
  });
});
