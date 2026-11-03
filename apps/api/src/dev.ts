import { localConfig } from "./config.js";
import { databasePool, migrate } from "./database.js";
import { PlayerStore } from "./store.js";
import { createApp } from "./app.js";
import { PlatformError } from "./errors.js";

const config = localConfig(process.env);
const pool = databasePool(config.databaseUrl);
await migrate(pool);
const app = createApp(new PlayerStore(pool, "local"), async request => {
  const credential = request.header("authorization");
  if (credential !== "Bearer local-player-one" && credential !== "Bearer local-player-two") {
    throw new PlatformError(401, "local_sign_in_required", "Choose a local development player.");
  }
  return { issuer: "urn:animalvs:local", subject: credential.slice(7) };
}, { authMode: "local" });
const server = app.listen(config.port, "127.0.0.1", () => console.log(`Local-only player API listening on 127.0.0.1:${config.port}.`));
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => { void pool.end(); });
    server.closeAllConnections();
  });
}
