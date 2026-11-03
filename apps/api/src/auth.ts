import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Request } from "express";
import { PlatformError } from "./errors.js";

/** Issuer and subject, not display name or email, form the stable authenticated identity. */
export interface Identity { issuer: string; subject: string }
/** Resolve a verified identity or reject; never trust a body, query or account-ID header. */
export type Authenticate = (request: Request) => Promise<Identity>;

/** Validate signed access tokens against pinned issuer/audience/scope and an explicit JWKS source. */
export function entraAuthenticator(config: {
  issuer: string; audience: string; jwksUri: string; scope: string;
}): Authenticate {
  const keys = createRemoteJWKSet(new URL(config.jwksUri), { timeoutDuration: 5000 });
  return async request => {
    const header = request.header("authorization");
    if (!header?.startsWith("Bearer ")) throw new PlatformError(401, "sign_in_required", "Sign in to load your progress.");
    try {
      const { payload } = await jwtVerify(header.slice(7), keys, {
        issuer: config.issuer, audience: config.audience, algorithms: ["RS256"],
        requiredClaims: ["sub", "exp", "iat"], clockTolerance: 5,
      });
      if (typeof payload.sub !== "string" || !payload.sub ||
          typeof payload.scp !== "string" || !payload.scp.split(" ").includes(config.scope)) {
        throw new PlatformError(403, "scope_required", "The token does not permit player access.");
      }
      return { issuer: config.issuer, subject: payload.sub };
    } catch (error) {
      if (error instanceof PlatformError) throw error;
      if (error instanceof Error && ("code" in error) &&
          typeof error.code === "string" && error.code.startsWith("ERR_JW")) {
        throw new PlatformError(401, "invalid_token", "Sign-in expired or could not be verified. Sign in again.");
      }
      // JWKS outages are unavailable authentication, not valid local identities.
      if (error instanceof Error && "code" in error && typeof error.code === "string" &&
          error.code.startsWith("ERR_JOSE")) {
        throw new PlatformError(401, "invalid_token", "Sign-in could not be verified.");
      }
      throw new PlatformError(503, "identity_unavailable", "Identity verification is unavailable. Try again.");
    }
  };
}
