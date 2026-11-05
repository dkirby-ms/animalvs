import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { snapshotSchema } from "../../packages/contracts/src/index.js";

test("saved profile survives sign-out/reload and never crosses accounts", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use local player one" }).click();
  await expect(page.getByRole("status")).toHaveText("Connected to server");
  await expect(page.getByRole("heading", { name: "Bengal tiger" })).toBeVisible();
  await expect(page.getByText("Status: idle")).toBeVisible();
  await page.getByRole("button", { name: "Find a match" }).click();
  await expect(page.getByText("Status: queued")).toBeVisible();
  await page.getByRole("button", { name: "Cancel matchmaking" }).click();
  await expect(page.getByText("Status: cancelled")).toBeVisible();
  await page.getByLabel("Display name (not your real name)").fill("Persistent Keeper");
  await page.getByRole("button", { name: "Save display name" }).click();
  await expect(page.getByRole("heading", { name: "Persistent Keeper" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your collection" })).toHaveCount(0);
  await page.getByRole("button", { name: "Use local player two" }).click();
  await expect(page.getByRole("status")).toHaveText("Connected to server");
  await expect(page.getByRole("heading", { name: "Persistent Keeper" })).toHaveCount(0);
  await expect(page.getByText("Status: idle")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Find a match" })).toBeDisabled();
  await page.unroute("**/api/events");
  await expect(page.getByRole("status")).toHaveText("Connected to server", { timeout: 10000 });
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("duplicate and out-of-order snapshots preserve each newer revision", async ({ page }) => {
  let injectSnapshots = true;
  await page.route("**/api/events", async route => {
    if (!injectSnapshots) {
      await route.continue();
      return;
    }
    injectSnapshots = false;
    const authorization = route.request().headers().authorization;
    if (!authorization) throw new Error("The authenticated event request has no authorization header.");
    const apiFetch = (path: string, init: RequestInit = {}) => fetch(`http://127.0.0.1:31873/api/${path}`, {
      ...init, headers: { authorization, ...init.headers },
    });
    const readSnapshot = async () => snapshotSchema.parse(await (await apiFetch("snapshot")).json());
    let before = await readSnapshot();
    if (before.matchmaking.status === "queued") {
      const cancel = await apiFetch("matchmaking/cancel", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedRevision: before.matchmaking.revision }),
      });
      expect(cancel.status).toBe(200);
      before = await readSnapshot();
    } else if (before.matchmaking.status === "proposed") {
      const decline = await apiFetch("matchmaking/decline", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          matchId: before.matchmaking.matchId,
          expectedRevision: before.matchmaking.revision,
        }),
      });
      expect(decline.status).toBe(200);
      before = await readSnapshot();
    }
    const profile = await apiFetch("profile", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        transactionId: randomUUID(), expectedRevision: before.account.revision,
        displayName: "Newest Revision Keeper",
      }),
    });
    expect(profile.status).toBe(200);
    const accountUpdated = await readSnapshot();
    expect(accountUpdated.account.revision).toBe(before.account.revision + 1);
    const queue = await apiFetch("matchmaking/enqueue", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedRevision: accountUpdated.matchmaking.revision }),
    });
    expect(queue.status).toBe(200);
    const matchmakingUpdated = await readSnapshot();
    expect(matchmakingUpdated.matchmaking.revision).toBe(accountUpdated.matchmaking.revision + 1);
    const olderAccount = snapshotSchema.parse({
      ...matchmakingUpdated,
      account: before.account,
      battles: before.battles,
      pendingBattles: before.pendingBattles,
    });
    expect(olderAccount.account.revision).toBeLessThan(accountUpdated.account.revision);
    expect(olderAccount.matchmaking.revision).toBe(matchmakingUpdated.matchmaking.revision);
    const body = [accountUpdated, olderAccount, olderAccount]
      .map(snapshot => `event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`)
      .join("");
    await route.fulfill({ status: 200, contentType: "text/event-stream", body });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Use local player one" }).click();
  await expect(page.getByRole("heading", { name: "Newest Revision Keeper" })).toBeVisible();
  await expect(page.getByText("Status: queued")).toBeVisible();
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
