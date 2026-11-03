import { resolve } from "node:path";
import { productionConfig } from "./config.js";
import { entraAuthenticator } from "./auth.js";
import { databasePool } from "./database.js";
import { PlayerStore } from "./store.js";
import { createApp } from "./app.js";

const config = productionConfig(process.env);
const pool = databasePool(config.DATABASE_URL);
await pool.query("SELECT version FROM schema_migrations WHERE version=1");
const app = createApp(new PlayerStore(pool, "entra"), entraAuthenticator({
  issuer: config.ENTRA_ISSUER, audience: config.ENTRA_AUDIENCE,
  jwksUri: config.ENTRA_JWKS_URI, scope: config.ENTRA_SCOPE,
}), { authMode: "entra", staticDirectory: resolve("apps/web/dist"), identityOrigin: new URL(config.ENTRA_ISSUER).origin });
const server = app.listen(config.PORT, () => console.log(`Player API listening on port ${config.PORT}.`));
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => { void pool.end(); });
    server.closeAllConnections();
  });
}
