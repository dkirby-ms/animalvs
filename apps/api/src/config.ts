import { z } from "zod";

const productionSchema = z.object({
  NODE_ENV: z.literal("production"),
  LOCAL_AUTH_ENABLED: z.string().optional().refine(value => value !== "true", "Local identity is forbidden."),
  DATABASE_URL: z.url(),
  ENTRA_ISSUER: z.url().startsWith("https://"),
  ENTRA_AUDIENCE: z.string().min(1),
  ENTRA_JWKS_URI: z.url().startsWith("https://"),
  ENTRA_SCOPE: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

/** Fail-closed hosted configuration. Development entrypoints never enter the hosted build. */
export function productionConfig(env: NodeJS.ProcessEnv) {
  const config = productionSchema.parse(env);
  if (new URL(config.DATABASE_URL).pathname.endsWith("_dev")) {
    throw new Error("Hosted API cannot use a local development database.");
  }
  const issuer = new URL(config.ENTRA_ISSUER);
  const keys = new URL(config.ENTRA_JWKS_URI);
  if (keys.origin !== issuer.origin) throw new Error("JWKS and issuer must have the same trusted origin.");
  return config;
}

/** Local simulation requires explicit opt-in, a loopback database and a dedicated _dev database name. */
export function localConfig(env: NodeJS.ProcessEnv) {
  if (env.NODE_ENV !== "development" || env.LOCAL_AUTH_ENABLED !== "true") {
    throw new Error("Local identity requires NODE_ENV=development and LOCAL_AUTH_ENABLED=true.");
  }
  const databaseUrl = z.url().parse(env.DATABASE_URL);
  const database = new URL(databaseUrl);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(database.hostname) ||
      !database.pathname.endsWith("_dev") || database.search !== "") {
    throw new Error("Local identity requires a loopback PostgreSQL database ending in _dev.");
  }
  const port = z.coerce.number().int().min(1).max(65535).default(3000).parse(env.PORT);
  return { databaseUrl, port };
}
