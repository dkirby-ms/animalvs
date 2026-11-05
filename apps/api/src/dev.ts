import type { Request } from "express";
import { developmentEntraConfig, localConfig } from "./config.js";
import { databasePool, migrate } from "./database.js";
import { PlayerStore } from "./store.js";
import { createApp } from "./app.js";
import { PlatformError } from "./errors.js";
import { entraAuthenticator } from "./auth.js";

const config = process.env.LOCAL_AUTH_ENABLED === "true"
  ? localConfig(process.env)
  : developmentEntraConfig(process.env);
const pool = databasePool(config.databaseUrl);
await migrate(pool);
const localAuthenticate = async (request: Request) => {
  const credential = request.header("authorization");
  if (credential !== "Bearer local-player-one" && credential !== "Bearer local-player-two") {
    throw new PlatformError(401, "local_sign_in_required", "Choose a local development player.");
  }
  return { issuer: "urn:animalvs:local", subject: credential.slice(7) };
};
const authenticate = config.authMode === "entra"
  ? entraAuthenticator({
    issuer: config.issuer, audience: config.audience, jwksUri: config.jwksUri, scope: config.scope,
  })
  : localAuthenticate;
const app = createApp(
  new PlayerStore(pool, config.authMode),
  authenticate,
  {
    authMode: config.authMode,
    ...(config.authMode === "entra" ? { identityOrigin: new URL(config.issuer).origin } : {}),
  },
);
const server = app.listen(config.port, "127.0.0.1", () => {
  console.log(`Local-only player API listening on 127.0.0.1:${config.port} (${config.authMode} authentication).`);
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => { void pool.end(); });
    server.closeAllConnections();
  });
}
