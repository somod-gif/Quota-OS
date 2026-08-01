import { describe, it, expect, vi, beforeEach } from "vitest";
import { signInWithEmail, signUpWithEmail } from "@/features/auth/actions";

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
  })),
}));

describe("signInWithEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for invalid email", async () => {
    const formData = new FormData();
    formData.set("email", "bad-email");
    formData.set("password", "password123");

    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid email" },
    });

    const result = await signInWithEmail(formData);
    expect(result).toEqual({ error: "Invalid email" });
  });

  it("returns error on failed authentication", async () => {
    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("password", "wrong");

    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const result = await signInWithEmail(formData);
    expect(result).toEqual({ error: "Invalid login credentials" });
  });

  it("calls redirect on successful sign in", async () => {
    const { redirect } = await import("next/navigation");
    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("password", "correct");

    mockSignInWithPassword.mockResolvedValue({ error: null });

    await signInWithEmail(formData);
    expect(redirect).toHaveBeenCalledWith("/");
  });
});

describe("signUpWithEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when email is missing", async () => {
    const formData = new FormData();
    formData.set("password", "password123");

    mockSignUp.mockResolvedValue({
      error: { message: "Email is required" },
    });

    const result = await signUpWithEmail(formData);
    expect(result).toEqual({ error: "Email is required" });
  });

  it("returns error for weak password", async () => {
    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("password", "123");

    mockSignUp.mockResolvedValue({
      error: { message: "Password must be at least 6 characters" },
    });

    const result = await signUpWithEmail(formData);
    expect(result).toEqual({ error: "Password must be at least 6 characters" });
  });

  it("returns success on successful registration", async () => {
    const formData = new FormData();
    formData.set("email", "new@test.com");
    formData.set("password", "strongPassword123");
    formData.set("name", "Test User");

    mockSignUp.mockResolvedValue({ error: null });

    const result = await signUpWithEmail(formData);
    expect(result).toEqual({ success: true });
  });

  it("passes name as full_name in user metadata", async () => {
    const formData = new FormData();
    formData.set("email", "user@test.com");
    formData.set("password", "securePass1");
    formData.set("name", "Alice");

    mockSignUp.mockResolvedValue({ error: null });

    await signUpWithEmail(formData);

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "user@test.com",
      password: "securePass1",
      options: {
        data: { full_name: "Alice" },
        emailRedirectTo: "http://localhost:3000/auth/callback",
      },
    });
  });
});
