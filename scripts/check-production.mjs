import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";

await access("dist/apps/api/src/main.js");
const files = await readdir("dist/apps/api/src");
assert.equal(files.includes("dev.js"), false, "Local identity entrypoint must not be built.");
for (const file of files.filter(file => file.endsWith(".js"))) {
  assert.equal((await readFile(`dist/apps/api/src/${file}`, "utf8")).includes("local-player-one"), false);
}
for (const file of (await readdir("apps/web/dist/assets")).filter(file => file.endsWith(".js"))) {
  assert.equal((await readFile(`apps/web/dist/assets/${file}`, "utf8")).includes("local-player-"), false);
}
const result = spawnSync(process.execPath, ["dist/apps/api/src/main.js"], {
  env: { ...process.env, NODE_ENV: "production", LOCAL_AUTH_ENABLED: "true" }, encoding: "utf8", timeout: 10000,
});
assert.notEqual(result.status, 0, "Hosted API must reject the simulation flag before listening.");
assert.match(result.stderr, /Local identity is forbidden/);
console.log("Production artifacts exclude local identity; hosted startup rejects simulation.");
