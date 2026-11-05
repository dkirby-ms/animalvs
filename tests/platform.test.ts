import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { Pool } from "pg";
import { createServer, type Server } from "node:http";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import {
  accountSchema, battleDefinitionSchema, matchmakingStateSchema, snapshotSchema, type Battle,
} from "../packages/contracts/src/index.js";
import { databasePool, migrate } from "../apps/api/src/database.js";
import { PlayerStore } from "../apps/api/src/store.js";
import { createApp } from "../apps/api/src/app.js";
import { entraAuthenticator } from "../apps/api/src/auth.js";
import { PlatformError } from "../apps/api/src/errors.js";

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL is required; run npm test for an isolated PostgreSQL server.");
let admin = databasePool(url);
const schema = `test_${randomUUID().replaceAll("-", "")}`;
let pool: Pool;
let store: PlayerStore;
let server: Server;
let base: string;
let a: string;
let b: string;
let outsider: string;
const identities = {
  a: { issuer: "urn:test", subject: "player-a" },
  b: { issuer: "urn:test", subject: "player-b" },
  c: { issuer: "urn:test", subject: "player-c" },
};
function scopedPool() {
  return new Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 10 });
}
async function listen(instance: Server) {
  await new Promise<void>(resolve => instance.listen(0, "127.0.0.1", resolve));
  const address = instance.address();
  assert.ok(address && typeof address !== "string");
  return `http://127.0.0.1:${address.port}`;
}
async function close(instance: Server) {
  instance.closeAllConnections();
  await new Promise<void>((resolve, reject) => instance.close(error => error ? reject(error) : resolve()));
}
function request(path: string, player = "a", init: RequestInit = {}) {
  return fetch(`${base}${path}`, {
    ...init, headers: { authorization: `Bearer ${player}`, "content-type": "application/json", ...init.headers },
  });
}
function definition(id = randomUUID(), human = true) {
  const choice = (accountId: string | null) => ({
    accountId, animalId: "tiger", level: 1,
    statistics: { vitality: 60, power: 70, guard: 45, speed: 65 },
    facilityBonuses: {}, readinessBonuses: {}, xpModifier: 1,
  });
  return battleDefinitionSchema.parse({
    id, mode: human ? "human" : "cpu", cpuProfileId: human ? null : "cpu-balanced-v1",
    choices: [choice(a), choice(human ? b : null)],
    weather: "clear", terrain: "grassland", conditionModifiers: { power: 1 },
    rulesVersions: { combat: "fixture-v1", rewards: "fixture-v1" }, seed: "stored-seed",
  });
}
function result(input = definition()): Battle {
  return {
    ...input, events: [{ sequence: 0, kind: "outcome", actor: "system", text: "Fixture result", values: {} }],
    outcome: "first", awards: [{ accountId: a, animalId: "tiger", xp: 10, credits: 5 }],
    completedAt: "2026-11-03T20:00:00.000Z",
  };
}
before(async () => {
  await admin.query(`CREATE SCHEMA "${schema}"`);
  pool = scopedPool();
  await Promise.all([migrate(pool), migrate(pool)]);
  store = new PlayerStore(pool, "entra");
  [a, b, outsider] = await Promise.all([
    store.accountFor(identities.a), store.accountFor(identities.b), store.accountFor(identities.c),
  ]);
  await startApi();
});
async function startApi() {
  server = createServer(createApp(store, async req => {
    const player = req.header("authorization")?.slice(7);
    if (player !== "a" && player !== "b" && player !== "c") throw new PlatformError(401, "unauthenticated", "Sign in.");
    return identities[player];
  }, { authMode: "entra", streamIntervalMs: 25 }));
  base = await listen(server);
}
after(async () => {
  if (server) await close(server);
  if (pool) await pool.end();
  await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
  await admin.end();
});

test("stable identity, initial six animals, explicit unauthenticated and tampering errors", async () => {
  assert.equal(await store.accountFor(identities.a), a);
  const snapshot = snapshotSchema.parse(await (await request("/api/snapshot")).json());
  assert.equal(snapshot.account.animals.length, 6);
  assert.equal(snapshot.account.economy.turns, 24);
  assert.equal(snapshot.matchmaking.status, "idle");
  assert.equal(snapshot.matchmaking.revision, 0);
  assert.equal((await request("/api/snapshot", "invalid")).status, 401);
  assert.equal((await request(`/api/snapshot?accountId=${b}`)).status, 400);
  const command = { transactionId: randomUUID(), expectedRevision: 0, displayName: "Player A" };
  for (const key of ["accountId", "credits", "level", "damage", "winner", "awards", "cpuDecision"]) {
    assert.equal((await request("/api/profile", "a", { method: "PATCH", body: JSON.stringify({ ...command, [key]: b }) })).status, 400);
  }
  for (const path of ["/api/battles", "/api/queue", `/api/accounts/${b}`]) {
    assert.equal((await request(path, "a", { method: "POST", body: "{}" })).status, 404);
  }
});

test("matchmaking commands are account-scoped, revision-checked and recover persisted lifecycle state", async () => {
  const initialA = await store.snapshot(a);
  const initialB = await store.snapshot(b);
  const accountRevision = initialA.account.revision;
  assert.equal((await request("/api/matchmaking/enqueue", "a", {
    method: "POST", body: JSON.stringify({ expectedRevision: initialA.matchmaking.revision, accountId: b }),
  })).status, 400);
  assert.equal((await request("/api/matchmaking/propose", "a", {
    method: "POST", body: "{}",
  })).status, 404);

  const queuedA = await request("/api/matchmaking/enqueue", "a", {
    method: "POST", body: JSON.stringify({ expectedRevision: initialA.matchmaking.revision }),
  });
  const queuedB = await request("/api/matchmaking/enqueue", "b", {
    method: "POST", body: JSON.stringify({ expectedRevision: initialB.matchmaking.revision }),
  });
  assert.equal(queuedA.status, 200);
  assert.equal(queuedB.status, 200);
  const queuedAState = matchmakingStateSchema.parse(await queuedA.json());
  const retriedEnqueue = await request("/api/matchmaking/enqueue", "a", {
    method: "POST", body: JSON.stringify({ expectedRevision: queuedAState.revision }),
  });
  assert.equal((await retriedEnqueue.json() as { revision: number }).revision, queuedAState.revision);
  const initialC = await store.snapshot(outsider);
  const concurrentEnqueues = await Promise.all([1, 2].map(() => request("/api/matchmaking/enqueue", "c", {
    method: "POST", body: JSON.stringify({ expectedRevision: initialC.matchmaking.revision }),
  })));
  assert.deepEqual(concurrentEnqueues.map(response => response.status).sort(), [200, 409]);
  assert.equal((await store.snapshot(outsider)).matchmaking.revision, initialC.matchmaking.revision + 1);
  assert.equal((await store.snapshot(a)).account.revision, accountRevision);

  let proposal = await store.proposeMatch(a, b);
  assert.ok(proposal.every(state => state.status === "proposed" && state.matchId === proposal[0]!.matchId));
  assert.ok(Date.parse(proposal[0]!.expiresAt!) > Date.now() + 55_000);
  const proposedA = await store.snapshot(a);
  assert.equal((await request("/api/matchmaking/accept", "c", {
    method: "POST",
    body: JSON.stringify({ matchId: proposal[0]!.matchId, expectedRevision: 0 }),
  })).status, 409);

  const acceptedA = await request("/api/matchmaking/accept", "a", {
    method: "POST",
    body: JSON.stringify({ matchId: proposal[0]!.matchId, expectedRevision: proposedA.matchmaking.revision }),
  });
  assert.equal(acceptedA.status, 200);
  const acceptedAState = matchmakingStateSchema.parse(await acceptedA.json());
  assert.equal(acceptedAState.status, "proposed");
  assert.equal(acceptedAState.accepted, true);
  const proposedB = await store.snapshot(b);
  const acceptedB = await request("/api/matchmaking/accept", "b", {
    method: "POST",
    body: JSON.stringify({ matchId: acceptedAState.matchId!, expectedRevision: proposedB.matchmaking.revision }),
  });
  assert.equal(acceptedB.status, 200);
  assert.equal((await acceptedB.json() as { status: string }).status, "accepted");
  assert.equal((await store.snapshot(a)).matchmaking.status, "accepted");

  for (const [accountId, player] of [[a, "a"], [b, "b"]] as const) {
    const state = await store.snapshot(accountId);
    assert.equal((await request("/api/matchmaking/enqueue", player, {
      method: "POST", body: JSON.stringify({ expectedRevision: state.matchmaking.revision }),
    })).status, 200);
  }
  proposal = await store.proposeMatch(a, b);
  const proposedForDecline = await store.snapshot(a);
  const declined = await request("/api/matchmaking/decline", "a", {
    method: "POST",
    body: JSON.stringify({
      matchId: proposal[0]!.matchId, expectedRevision: proposedForDecline.matchmaking.revision,
    }),
  });
  assert.equal(declined.status, 200);
  assert.equal((await declined.json() as { status: string }).status, "declined");
  assert.equal((await store.snapshot(b)).matchmaking.status, "declined");

  for (const [accountId, player] of [[a, "a"], [b, "b"]] as const) {
    const state = await store.snapshot(accountId);
    assert.equal((await request("/api/matchmaking/enqueue", player, {
      method: "POST", body: JSON.stringify({ expectedRevision: state.matchmaking.revision }),
    })).status, 200);
  }
  proposal = await store.proposeMatch(a, b);
  await pool.query("UPDATE matchmaking_state SET expires_at=now()-interval '1 second' WHERE match_id=$1", [
    proposal[0]!.matchId,
  ]);
  assert.equal((await store.snapshot(a)).matchmaking.status, "expired");
  assert.equal((await store.snapshot(b)).matchmaking.status, "expired");

  const queuedAgain = await store.snapshot(a);
  assert.equal((await request("/api/matchmaking/enqueue", "a", {
    method: "POST", body: JSON.stringify({ expectedRevision: queuedAgain.matchmaking.revision }),
  })).status, 200);
  const queuedState = await store.snapshot(a);
  assert.equal((await request("/api/matchmaking/cancel", "a", {
    method: "POST", body: JSON.stringify({ expectedRevision: queuedState.matchmaking.revision }),
  })).status, 200);
  assert.equal((await store.snapshot(a)).matchmaking.status, "cancelled");
  assert.equal((await store.snapshot(a)).account.revision, accountRevision);
});

test("management is idempotent, stale-safe, concurrent and transactional", async () => {
  const initial = (await store.snapshot(a)).account;
  const command = { transactionId: randomUUID(), expectedRevision: initial.revision, displayName: "Tiger Keeper" };
  const responses = await Promise.all([1, 2].map(() => request("/api/profile", "a", { method: "PATCH", body: JSON.stringify(command) })));
  assert.ok(responses.every(response => response.status === 200));
  assert.deepEqual(await responses[0]!.json(), await responses[1]!.json());
  assert.equal((await store.snapshot(a)).account.revision, initial.revision + 1);
  assert.equal((await request("/api/profile", "a", {
    method: "PATCH", body: JSON.stringify({ ...command, displayName: "Changed" }),
  })).status, 409);
  assert.equal((await request("/api/profile", "a", {
    method: "PATCH", body: JSON.stringify({ ...command, transactionId: randomUUID() }),
  })).status, 409);
  const state = (await store.snapshot(a)).account;
  const trained = await store.management(a, randomUUID(), state.revision, { kind: "fixture-training" }, current => ({
    ...current,
    economy: { credits: 150, turns: 20, lastResetDate: "2026-11-03" },
    animals: current.animals.map(animal => ({ ...animal, welfare: 80, lastTrainingDate: "2026-11-03" })),
    facilities: [{ facilityId: "training-ground", level: 1 }],
    pendingPurchases: [{ id: randomUUID(), facilityId: "shelter", targetLevel: 1, completesAt: "2026-11-04T00:00:00.000Z", creditsSpent: 20, turnsSpent: 4 }],
  }));
  await assert.rejects(store.management(a, randomUUID(), trained.revision, { invalid: true }, current => ({
    ...current, economy: { ...current.economy, credits: -1 },
  })));
  assert.deepEqual((await store.snapshot(a)).account, trained);
  const simultaneous = await Promise.allSettled([1, 2].map(n => store.management(
    a, randomUUID(), trained.revision, { n }, current => ({ ...current, displayName: `Keeper ${n}` }))));
  assert.equal(simultaneous.filter(item => item.status === "fulfilled").length, 1);
});

test("frozen records, reservations, immutable ordered replay and awards persist exactly once", async () => {
  const pending = definition();
  await Promise.all([1, 2].map(() => store.reserveBattle(pending, "2026-11-03", { account: 10, pair: 10 })));
  assert.equal((await store.snapshot(a)).pendingBattles[0]?.seed, pending.seed);
  const completed = result(pending);
  const animal = (await store.snapshot(a)).account.animals[0]!;
  const before = (await store.snapshot(a)).account.economy.credits;
  await Promise.all([1, 2].map(() => store.completeBattle(completed, current => ({
    ...current.animals.find(item => item.animalId === animal.animalId)!, residualXp: 10,
  }))));
  assert.equal((await store.snapshot(a)).account.economy.credits, before + 5);
  assert.deepEqual(await store.battle(b, pending.id), completed);
  assert.equal((await request(`/api/battles/${pending.id}`, "c")).status, 404);
  assert.equal((await store.snapshot(outsider)).battles.length, 0);
  await assert.rejects(store.completeBattle({ ...completed, seed: "changed" }, () => animal));
  await assert.rejects(store.completeBattle({ ...completed, events: [{ ...completed.events[0], sequence: 2 }] }, () => animal));
  const counters = await pool.query<{ reserved: number; awarded: number }>("SELECT reserved,awarded FROM reward_counters WHERE account_id=$1 AND mode='human'", [a]);
  assert.deepEqual(counters.rows[0], { reserved: 0, awarded: 1 });
  const pair = await pool.query("SELECT reserved,awarded FROM pair_reward_counters");
  assert.deepEqual(pair.rows[0], { reserved: 0, awarded: 1 });
});

test("CPU records and reward limits are server controlled; failing reservations roll back", async () => {
  const cpu = definition(randomUUID(), false);
  await store.reserveBattle(cpu, "2026-11-04", { account: 1, pair: 1 });
  await assert.rejects(store.reserveBattle(definition(randomUUID(), false), "2026-11-04", { account: 1, pair: 1 }));
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM battle_reservations WHERE reward_date='2026-11-04'")).rows[0].count, 1);
  assert.equal((await store.snapshot(a)).pendingBattles[0]?.cpuProfileId, "cpu-balanced-v1");
});

test("authenticated SSE sends fresh authoritative snapshots on connect and changes", { timeout: 10000 }, async () => {
  const controller = new AbortController();
  const response = await request("/api/events", "a", { signal: controller.signal });
  assert.equal(response.status, 200);
  const reader = response.body!.getReader();
  try {
    const first = new TextDecoder().decode((await reader.read()).value);
    assert.match(first, /event: snapshot/);
    assert.match(first, /stored-seed/);
    const account = (await store.snapshot(a)).account;
    await store.profile(a, { transactionId: randomUUID(), expectedRevision: account.revision, displayName: "Recovered Keeper" });
    let updated = "";
    for (let attempt = 0; attempt < 20 && !updated.includes("Recovered Keeper"); attempt++) {
      updated += new TextDecoder().decode((await reader.read()).value);
    }
    assert.match(updated, /Recovered Keeper/);
    const current = await store.snapshot(a);
    await store.enqueueMatchmaking(a, current.matchmaking.revision);
    let matchmakingUpdate = "";
    for (let attempt = 0; attempt < 20 && !matchmakingUpdate.includes('"status":"queued"'); attempt++) {
      matchmakingUpdate += new TextDecoder().decode((await reader.read()).value);
    }
    assert.match(matchmakingUpdate, /"status":"queued"/);
    assert.equal((await store.snapshot(a)).account.revision, current.account.revision);
  } finally {
    await reader.cancel();
    controller.abort();
  }
});

test("API/pool restart (and isolated PostgreSQL restart) recover records without granting twice", async () => {
  const beforeProposal = await store.snapshot(b);
  await store.enqueueMatchmaking(b, beforeProposal.matchmaking.revision);
  const proposal = await store.proposeMatch(a, b);
  const snapshot = await store.snapshot(a);
  const expiresAt = snapshot.matchmaking.expiresAt;
  assert.equal(snapshot.matchmaking.status, "proposed");
  await close(server);
  await pool.end();
  await admin.end();
  if (process.env.PG_TEST_CTL && process.env.PG_TEST_DATA) {
    execFileSync(process.env.PG_TEST_CTL, [
      "-D", process.env.PG_TEST_DATA, "-l", `${process.env.PG_TEST_DATA}/../server.log`,
      "-m", "fast", "-w", "restart",
    ], { stdio: "pipe", timeout: 15000 });
  }
  pool = scopedPool();
  admin = databasePool(url!);
  store = new PlayerStore(pool, "entra");
  await startApi();
  const recovered = await store.snapshot(a);
  assert.deepEqual(recovered.account, snapshot.account);
  assert.deepEqual(recovered.matchmaking, snapshot.matchmaking);
  assert.equal(recovered.matchmaking.expiresAt, expiresAt);
  assert.equal(recovered.matchmaking.matchId, proposal[0]!.matchId);
  assert.deepEqual(recovered.battles, snapshot.battles);
  assert.deepEqual(recovered.pendingBattles, snapshot.pendingBattles);
});

test("deletion removes linked records and prevents silent recreation", async () => {
  let matchmakingA = await store.snapshot(a);
  let matchmakingB = await store.snapshot(b);
  if (matchmakingA.matchmaking.status === "proposed") {
    await store.declineMatchmaking(
      a, matchmakingA.matchmaking.matchId!, matchmakingA.matchmaking.revision,
    );
    matchmakingA = await store.snapshot(a);
    matchmakingB = await store.snapshot(b);
  }
  await store.enqueueMatchmaking(a, matchmakingA.matchmaking.revision);
  await store.enqueueMatchmaking(b, matchmakingB.matchmaking.revision);
  const proposal = await store.proposeMatch(a, b);
  await store.reserveBattle(definition(), "2026-11-05", { account: 1, pair: 1 });
  const account = (await store.snapshot(a)).account;
  accountSchema.parse(account);
  assert.equal((await request("/api/account", "a", { method: "DELETE", body: "{}" })).status, 400);
  assert.equal((await request("/api/account", "a", { method: "DELETE", body: '{"confirmation":"DELETE"}' })).status, 204);
  await assert.rejects(store.snapshot(a));
  await assert.rejects(store.accountFor(identities.a));
  assert.equal((await store.snapshot(b)).battles.length, 0);
  for (const table of ["accounts", "management_transactions", "reservation_accounts", "reward_counters", "matchmaking_state"]) {
    const column = table === "accounts" ? "id" : "account_id";
    assert.equal((await pool.query(`SELECT count(*)::int AS count FROM ${table} WHERE ${column}=$1`, [a])).rows[0].count, 0);
  }
  assert.equal((await store.snapshot(b)).matchmaking.status, "cancelled");
  assert.equal(proposal[0]!.status, "proposed");
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM battle_reservations")).rows[0].count, 0);
  assert.equal((await pool.query("SELECT count(*)::int AS count FROM pair_reward_counters")).rows[0].count, 0);
  assert.equal((await pool.query("SELECT sum(reserved)::int AS count FROM reward_counters WHERE account_id=$1", [b])).rows[0].count, 0);
});

test("production JWT boundary validates signature, issuer, audience, expiry and scope", async () => {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = { ...await exportJWK(publicKey), kid: "test-key", alg: "RS256", use: "sig" };
  const jwks = createServer((_request, response) => {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ keys: [jwk] }));
  });
  const origin = await listen(jwks);
  const auth = entraAuthenticator({ issuer: "https://issuer.test/v2.0", audience: "api", jwksUri: origin, scope: "access_as_user" });
  const jwtServer = createServer(createApp(store, auth, { authMode: "entra" }));
  const endpoint = await listen(jwtServer);
  const token = (overrides: { issuer?: string; audience?: string; scope?: string; expires?: number } = {}) =>
    new SignJWT({ scp: overrides.scope ?? "access_as_user" })
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setSubject("jwt-player").setIssuer(overrides.issuer ?? "https://issuer.test/v2.0")
      .setAudience(overrides.audience ?? "api").setIssuedAt()
      .setExpirationTime(overrides.expires ?? Math.floor(Date.now() / 1000) + 60).sign(privateKey);
  try {
    const fetchToken = (credential: string) => fetch(`${endpoint}/api/snapshot`, { headers: { authorization: `Bearer ${credential}` } });
    assert.equal((await fetchToken(await token())).status, 200);
    for (const invalid of [
      await token({ issuer: "https://other.test" }), await token({ audience: "other-api" }),
      await token({ expires: 1 }), "local-player-one", `${await token()}invalid`,
    ]) assert.equal((await fetchToken(invalid)).status, 401);
    assert.equal((await fetchToken(await token({ scope: "other" }))).status, 403);
  } finally {
    await close(jwtServer);
    await close(jwks);
  }
});
