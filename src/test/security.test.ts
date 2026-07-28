import { describe, it, expect } from "vitest";
import { checkRateLimit, addSecurityHeaders } from "@/lib/security";
import { encrypt, decrypt, encryptJson, decryptJson } from "@/lib/encryption";

interface MockHeaders {
  get(name: string): string | null;
}

interface MockRequest {
  headers: MockHeaders;
}

interface MockResponse {
  headers: MockHeaders & { set(name: string, value: string): void };
}

function mockRequest(headers: Record<string, string>): MockRequest {
  return {
    headers: {
      get(name: string) {
        return headers[name.toLowerCase()] ?? null;
      },
    },
  };
}

function mockResponse(): MockResponse {
  const map = new Map<string, string>();
  return {
    headers: {
      set(name: string, value: string) {
        map.set(name, value);
      },
      get(name: string) {
        return map.get(name) ?? null;
      },
    },
  };
}

describe("checkRateLimit", () => {
  it("allows first request from an IP", () => {
    const req = mockRequest({ "x-forwarded-for": "192.168.1.1" });
    const result = checkRateLimit(req as MockRequest);
    expect(result.blocked).toBe(false);
    expect(result.remaining).toBe(29);
  });

  it("allows requests up to the limit", () => {
    const ip = "10.0.0.1";
    const req = mockRequest({ "x-forwarded-for": ip });

    for (let i = 0; i < 29; i++) {
      const result = checkRateLimit(req as MockRequest);
      expect(result.blocked).toBe(false);
    }

    const last = checkRateLimit(req as MockRequest);
    expect(last.blocked).toBe(false);
    expect(last.remaining).toBe(0);
  });

  it("blocks when limit is exceeded", () => {
    const ip = "10.0.0.2";
    const req = mockRequest({ "x-forwarded-for": ip });

    for (let i = 0; i < 30; i++) {
      checkRateLimit(req as MockRequest);
    }

    const result = checkRateLimit(req as MockRequest);
    expect(result.blocked).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("uses x-real-ip as fallback when x-forwarded-for is missing", () => {
    const req = mockRequest({ "x-real-ip": "10.0.0.99" });
    const result = checkRateLimit(req as MockRequest);
    expect(result.blocked).toBe(false);
  });

  it("uses unknown when no IP headers are present", () => {
    const req = mockRequest({});
    const result = checkRateLimit(req as MockRequest);
    expect(result.blocked).toBe(false);
  });
});

describe("addSecurityHeaders", () => {
  it("adds X-Content-Type-Options header", () => {
    const res = addSecurityHeaders(mockResponse() as unknown as MockResponse);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("adds X-Frame-Options header", () => {
    const res = addSecurityHeaders(mockResponse() as unknown as MockResponse);
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("adds X-XSS-Protection header", () => {
    const res = addSecurityHeaders(mockResponse() as unknown as MockResponse);
    expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
  });

  it("adds Referrer-Policy header", () => {
    const res = addSecurityHeaders(mockResponse() as unknown as MockResponse);
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("returns the same response instance", () => {
    const res = mockResponse();
    const returned = addSecurityHeaders(res as unknown as MockResponse);
    expect(returned).toBe(res);
  });
});

describe("encryption round-trip", () => {
  it("encrypts and decrypts a string", () => {
    const original = "sensitive-data-123";
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("produces unique ciphertext for identical plaintext", () => {
    const plain = "same-value";
    const a = encrypt(plain);
    const b = encrypt(plain);
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe(plain);
    expect(decrypt(b)).toBe(plain);
  });

  it("handles empty string", () => {
    const encrypted = encrypt("");
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe("");
  });

  it("encrypts and decrypts JSON objects", () => {
    const data = { apiKey: "sk-123", provider: "openai" };
    const encrypted = encryptJson(data);
    const decrypted = decryptJson(encrypted);
    expect(decrypted).toEqual(data);
  });

  it("returns a colon-separated ciphertext format", () => {
    const result = encrypt("hello");
    const parts = result.split(":");
    expect(parts.length).toBe(3);
  });
});
