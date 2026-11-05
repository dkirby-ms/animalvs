import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  matchmakingProposalCommandSchema, matchmakingRevisionCommandSchema, matchmakingStateSchema,
  profileCommandSchema,
} from "../packages/contracts/src/index.js";
import { developmentEntraConfig, localConfig, productionConfig } from "../apps/api/src/config.js";

test("strict intents reject every authoritative field family", () => {
  const valid = { transactionId: "899bc0de-d540-4013-b356-5c0da9c5e488", expectedRevision: 0, displayName: "Tiger Fan" };
  for (const key of ["accountId", "level", "statistics", "bonuses", "turns", "credits", "resources",
    "completesAt", "cpuDecision", "rolls", "damage", "winner", "awards", "residualXp"]) {
    assert.equal(profileCommandSchema.safeParse({ ...valid, [key]: 100 }).success, false, key);
  }
  assert.equal(profileCommandSchema.parse(valid).displayName, valid.displayName);

  const idle = { revision: 0, status: "idle", matchId: null, expiresAt: null, accepted: false };
  assert.equal(matchmakingStateSchema.safeParse(idle).success, true);
  assert.equal(matchmakingStateSchema.safeParse({ ...idle, accountId: valid.transactionId }).success, false);
  assert.equal(matchmakingStateSchema.safeParse({
    revision: 2, status: "proposed", matchId: valid.transactionId, expiresAt: null, accepted: false,
  }).success, false);
  assert.equal(matchmakingStateSchema.safeParse({
    revision: 2, status: "accepted", matchId: valid.transactionId, expiresAt: null, accepted: false,
  }).success, false);
  assert.equal(matchmakingRevisionCommandSchema.safeParse({
    expectedRevision: 0, accountId: valid.transactionId,
  }).success, false);
  assert.equal(matchmakingProposalCommandSchema.safeParse({
    expectedRevision: 0, matchId: valid.transactionId, outcome: "first",
  }).success, false);
});

test("local identity is explicit and restricted to a dedicated loopback database", () => {
  const local = { NODE_ENV: "development", LOCAL_AUTH_ENABLED: "true", DATABASE_URL: "postgresql://localhost/animalvs_dev" };
  assert.equal(localConfig(local).port, 3000);
  assert.equal(localConfig(local).authMode, "local");
  for (const env of [
    { ...local, NODE_ENV: "production" }, { ...local, NODE_ENV: "test" },
    { ...local, LOCAL_AUTH_ENABLED: "false" }, { ...local, DATABASE_URL: "postgresql://remote/animalvs_dev" },
    { ...local, DATABASE_URL: "postgresql://localhost/animalvs" },
    { ...local, DATABASE_URL: "postgresql://localhost/animalvs_dev?host=remote" },
  ]) assert.throws(() => localConfig(env));
  assert.throws(() => productionConfig({ NODE_ENV: "production", LOCAL_AUTH_ENABLED: "true" }));
  assert.throws(() => productionConfig({ NODE_ENV: "production" }));
});

test("development Entra auth is explicit and remains on a dedicated loopback database", () => {
  const development = {
    NODE_ENV: "development",
    LOCAL_AUTH_ENABLED: "false",
    DATABASE_URL: "postgresql://localhost/animalvs_dev",
    ENTRA_ISSUER: "https://tenant.ciamlogin.com/tenant/v2.0",
    ENTRA_AUDIENCE: "api-id",
    ENTRA_JWKS_URI: "https://tenant.ciamlogin.com/tenant/discovery/keys",
    ENTRA_SCOPE: "access_as_user",
  };
  const config = developmentEntraConfig(development);
  assert.equal(config.authMode, "entra");
  assert.equal(config.databaseUrl, development.DATABASE_URL);
  assert.equal(config.issuer, development.ENTRA_ISSUER);
  for (const env of [
    { ...development, NODE_ENV: "production" },
    { ...development, LOCAL_AUTH_ENABLED: "true" },
    { ...development, DATABASE_URL: "postgresql://remote/animalvs_dev" },
    { ...development, DATABASE_URL: "postgresql://localhost/animalvs" },
    { ...development, DATABASE_URL: "postgresql://localhost/animalvs_dev?host=remote" },
    { ...development, ENTRA_SCOPE: "" },
    { ...development, ENTRA_JWKS_URI: "https://other.invalid/keys" },
  ]) assert.throws(() => developmentEntraConfig(env));
});

test("hosted configuration pins JWKS origin and excludes local data", () => {
  const config = {
    NODE_ENV: "production", DATABASE_URL: "postgresql://database/animalvs",
    ENTRA_ISSUER: "https://tenant.ciamlogin.com/tenant/v2.0", ENTRA_AUDIENCE: "api-id",
    ENTRA_JWKS_URI: "https://tenant.ciamlogin.com/keys", ENTRA_SCOPE: "access_as_user",
  };
  assert.equal(productionConfig(config).ENTRA_AUDIENCE, "api-id");
  assert.throws(() => productionConfig({ ...config, ENTRA_JWKS_URI: "https://other.invalid/keys" }));
  assert.throws(() => productionConfig({ ...config, DATABASE_URL: "postgresql://localhost/animalvs_dev" }));
});

test("production entrypoint cannot import local credentials", async () => {
  const build = JSON.parse(await readFile("apps/api/tsconfig.build.json", "utf8")) as { include: string[] };
  assert.deepEqual(build.include, ["src/main.ts", "src/migrate.ts"]);
});
