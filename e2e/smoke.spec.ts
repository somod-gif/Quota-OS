import { test, expect } from "@playwright/test";

test("landing page loads and renders pricing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /quotaos/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /one control plane/i })).toBeVisible();
  await expect(page.getByText("Most Popular")).toBeVisible();
});

test("register page shows sign-up form", async ({ page }) => {
  await page.goto("/auth/register");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: /sign up with email/i })).toBeVisible();
});

test("login page shows sign-in form", async ({ page }) => {
  await page.goto("/auth/login");
  await expect(page.getByText("Sign in to your account")).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in with email/i })).toBeVisible();
});

test("unauthenticated dashboard redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);
});
