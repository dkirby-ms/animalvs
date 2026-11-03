import { test, expect } from "@playwright/test";

test("saved profile survives sign-out/reload and never crosses accounts", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use local player one" }).click();
  await expect(page.getByRole("status")).toHaveText("Connected to server");
  await expect(page.getByRole("heading", { name: "Bengal tiger" })).toBeVisible();
  await page.getByLabel("Display name (not your real name)").fill("Persistent Keeper");
  await page.getByRole("button", { name: "Save display name" }).click();
  await expect(page.getByRole("heading", { name: "Persistent Keeper" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your collection" })).toHaveCount(0);
  await page.getByRole("button", { name: "Use local player two" }).click();
  await expect(page.getByRole("status")).toHaveText("Connected to server");
  await expect(page.getByRole("heading", { name: "Persistent Keeper" })).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Use local player one" }).click();
  await expect(page.getByRole("heading", { name: "Persistent Keeper" })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("mobile-player.png"), fullPage: true });
});

test("lost stream is visible and reconnect recovers the server snapshot", async ({ page }) => {
  await page.route("**/api/events", route => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Use local player two" }).click();
  await expect(page.getByRole("status")).toHaveText("Connection lost");
  await expect(page.getByRole("alert")).toContainText("Retrying from the server");
  await expect(page.getByRole("button", { name: "Save display name" })).toBeDisabled();
  await page.unroute("**/api/events");
  await expect(page.getByRole("status")).toHaveText("Connected to server", { timeout: 10000 });
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("unavailable progress never renders fabricated local state", async ({ page }) => {
  await page.route("**/api/snapshot", route => route.fulfill({
    status: 503, contentType: "application/json",
    body: '{"error":{"message":"Authoritative progress is unavailable. Try again."}}',
  }));
  await page.goto("/");
  await page.getByRole("button", { name: "Use local player one" }).click();
  await expect(page.getByRole("alert")).toContainText("Authoritative progress is unavailable");
  await expect(page.getByRole("heading", { name: "Your collection" })).toHaveCount(0);
});

test("deletion requires explicit confirmation and removes application access", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use local player two" }).click();
  await expect(page.getByRole("status")).toHaveText("Connected to server");
  await page.getByText("Delete application data", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Delete my application data" })).toBeDisabled();
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page.getByRole("button", { name: "Delete my application data" }).click();
  await expect(page.getByRole("status")).toHaveText("Application data deleted");
  await page.getByRole("button", { name: "Use local player two" }).click();
  await expect(page.getByRole("alert")).toContainText("Application data was deleted");
  await expect(page.getByRole("heading", { name: "Your collection" })).toHaveCount(0);
});
