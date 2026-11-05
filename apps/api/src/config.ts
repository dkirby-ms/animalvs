import { z } from "zod";

const entraSettingsSchema = z.object({
  ENTRA_ISSUER: z.url().startsWith("https://"),
  ENTRA_AUDIENCE: z.string().min(1),
  ENTRA_JWKS_URI: z.url().startsWith("https://"),
  ENTRA_SCOPE: z.string().min(1),
});

const productionSchema = z.object({
  NODE_ENV: z.literal("production"),
  LOCAL_AUTH_ENABLED: z.string().optional().refine(value => value !== "true", "Local identity is forbidden."),
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
}).extend(entraSettingsSchema.shape);

const developmentEntraSchema = z.object({
  NODE_ENV: z.literal("development"),
  LOCAL_AUTH_ENABLED: z.literal("false"),
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
}).extend(entraSettingsSchema.shape);

function assertTrustedEntraOrigin(issuer: string, jwksUri: string) {
  const issuerUrl = new URL(issuer);
  const keysUrl = new URL(jwksUri);
  if (keysUrl.origin !== issuerUrl.origin) {
    throw new Error("JWKS and issuer must have the same trusted origin.");
  }
}

function developmentDatabase(databaseUrl: string) {
  const database = new URL(databaseUrl);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(database.hostname) ||
      !database.pathname.endsWith("_dev") || database.search !== "") {
    throw new Error("Development API requires a loopback PostgreSQL database ending in _dev.");
  }
}

/** Fail-closed hosted configuration. Development entrypoints never enter the hosted build. */
export function productionConfig(env: NodeJS.ProcessEnv) {
  const config = productionSchema.parse(env);
  if (new URL(config.DATABASE_URL).pathname.endsWith("_dev")) {
    throw new Error("Hosted API cannot use a local development database.");
  }
  assertTrustedEntraOrigin(config.ENTRA_ISSUER, config.ENTRA_JWKS_URI);
  return config;
}

/** Local simulation requires explicit opt-in, a loopback database and a dedicated _dev database name. */
export function localConfig(env: NodeJS.ProcessEnv) {
  if (env.NODE_ENV !== "development" || env.LOCAL_AUTH_ENABLED !== "true") {
    throw new Error("Local identity requires NODE_ENV=development and LOCAL_AUTH_ENABLED=true.");
  }
  const databaseUrl = z.url().parse(env.DATABASE_URL);
  developmentDatabase(databaseUrl);
  const port = z.coerce.number().int().min(1).max(65535).default(3000).parse(env.PORT);
  return { databaseUrl, port, authMode: "local" as const };
}

/**
 * Validate opt-in real-token auth for the loopback development API.
 *
 * @throws When explicit Entra mode, trusted tenant settings, or dedicated
 *   loopback `_dev` database constraints are not satisfied.
 */
export function developmentEntraConfig(env: NodeJS.ProcessEnv) {
  const config = developmentEntraSchema.parse(env);
  developmentDatabase(config.DATABASE_URL);
  assertTrustedEntraOrigin(config.ENTRA_ISSUER, config.ENTRA_JWKS_URI);
  return {
    authMode: "entra" as const,
    databaseUrl: config.DATABASE_URL,
    port: config.PORT,
    issuer: config.ENTRA_ISSUER,
    audience: config.ENTRA_AUDIENCE,
    jwksUri: config.ENTRA_JWKS_URI,
    scope: config.ENTRA_SCOPE,
  };
}
