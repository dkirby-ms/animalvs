import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { profileCommandSchema } from "../packages/contracts/src/index.js";
import { localConfig, productionConfig } from "../apps/api/src/config.js";

test("strict intents reject every authoritative field family", () => {
  const valid = { transactionId: "899bc0de-d540-4013-b356-5c0da9c5e488", expectedRevision: 0, displayName: "Tiger Fan" };
  for (const key of ["accountId", "level", "statistics", "bonuses", "turns", "credits", "resources",
    "completesAt", "cpuDecision", "rolls", "damage", "winner", "awards", "residualXp"]) {
    assert.equal(profileCommandSchema.safeParse({ ...valid, [key]: 100 }).success, false, key);
  }
  assert.equal(profileCommandSchema.parse(valid).displayName, valid.displayName);
});

test("local identity is explicit and restricted to a dedicated loopback database", () => {
  const local = { NODE_ENV: "development", LOCAL_AUTH_ENABLED: "true", DATABASE_URL: "postgresql://localhost/animalvs_dev" };
  assert.equal(localConfig(local).port, 3000);
  for (const env of [
    { ...local, NODE_ENV: "production" }, { ...local, NODE_ENV: "test" },
    { ...local, LOCAL_AUTH_ENABLED: "false" }, { ...local, DATABASE_URL: "postgresql://remote/animalvs_dev" },
    { ...local, DATABASE_URL: "postgresql://localhost/animalvs" },
    { ...local, DATABASE_URL: "postgresql://localhost/animalvs_dev?host=remote" },
  ]) assert.throws(() => localConfig(env));
  assert.throws(() => productionConfig({ NODE_ENV: "production", LOCAL_AUTH_ENABLED: "true" }));
  assert.throws(() => productionConfig({ NODE_ENV: "production" }));
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
