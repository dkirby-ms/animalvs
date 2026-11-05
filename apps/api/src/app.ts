import { randomUUID } from "node:crypto";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { SpanKind, trace } from "@opentelemetry/api";
import { z } from "zod";
import {
  deletionCommandSchema, matchmakingProposalCommandSchema, matchmakingRevisionCommandSchema, uuid,
} from "../../../packages/contracts/src/index.js";
import type { Authenticate, Identity } from "./auth.js";
import { PlatformError } from "./errors.js";
import type { PlayerStore } from "./store.js";

declare global {
  namespace Express {
    interface Locals { identity: Identity; accountId: string }
  }
}

/** Build the account-scoped HTTP boundary. No route accepts authoritative gameplay records. */
export function createApp(store: PlayerStore, authenticate: Authenticate, options: {
  authMode: "local" | "entra"; staticDirectory?: string; streamIntervalMs?: number; identityOrigin?: string;
}) {
  const app = express();
  app.disable("x-powered-by");
  app.use((request, response, next) => {
    trace.getTracer("animalvs-platform").startActiveSpan(request.method, {
      kind: SpanKind.SERVER, attributes: { "http.request.method": request.method },
    }, span => {
      response.once("close", () => {
        const route: unknown = request.route?.path;
        if (typeof route === "string") {
          span.updateName(`${request.method} ${route}`);
          span.setAttribute("http.route", route);
        }
        span.setAttribute("http.response.status_code", response.statusCode);
        span.end();
      });
      next();
    });
  });
  const identityOrigins = options.identityOrigin ? [options.identityOrigin] : [];
  app.use(helmet({ contentSecurityPolicy: { directives: {
    connectSrc: ["'self'", ...identityOrigins], frameSrc: ["'self'", ...identityOrigins],
  } } }));
  app.use(express.json({ limit: "16kb", strict: true }));
  app.get("/api/config", (_request, response) => response.json({ authMode: options.authMode }));
  app.use("/api", (_request, response, next) => {
    response.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", async (request, response, next) => {
    try {
      if (Object.keys(request.query).length) throw new PlatformError(400, "invalid_query", "This endpoint does not accept query parameters.");
      const identity = await authenticate(request);
      const accountId = await store.accountFor(identity);
      response.locals.identity = identity;
      response.locals.accountId = accountId;
      next();
    } catch (error) { next(error); }
  });
  app.get("/api/snapshot", async (_request, response) => {
    response.json(await store.snapshot(response.locals.accountId));
  });
  app.get("/api/battles/:id", async (request, response) => {
    response.json(await store.battle(response.locals.accountId, uuid.parse(request.params.id)));
  });
  app.post("/api/matchmaking/enqueue", async (request, response) => {
    const command = matchmakingRevisionCommandSchema.parse(request.body);
    response.json(await store.enqueueMatchmaking(response.locals.accountId, command.expectedRevision));
  });
  app.post("/api/matchmaking/cancel", async (request, response) => {
    const command = matchmakingRevisionCommandSchema.parse(request.body);
    response.json(await store.cancelMatchmaking(response.locals.accountId, command.expectedRevision));
  });
  app.post("/api/matchmaking/accept", async (request, response) => {
    const command = matchmakingProposalCommandSchema.parse(request.body);
    response.json(await store.acceptMatchmaking(
      response.locals.accountId, command.matchId, command.expectedRevision));
  });
  app.post("/api/matchmaking/decline", async (request, response) => {
    const command = matchmakingProposalCommandSchema.parse(request.body);
    response.json(await store.declineMatchmaking(
      response.locals.accountId, command.matchId, command.expectedRevision));
  });
  app.patch("/api/profile", async (request, response) => {
    response.json(await store.profile(response.locals.accountId, request.body));
  });
  app.delete("/api/account", async (request, response) => {
    deletionCommandSchema.parse(request.body);
    await store.deleteAccount(response.locals.identity, response.locals.accountId);
    response.status(204).end();
  });
  app.get("/api/events", async (request, response, next) => {
    let active = true;
    response.on("close", () => { active = false; });
    try {
      let snapshot = await store.snapshot(response.locals.accountId);
      response.status(200).set({
        "Content-Type": "text/event-stream", "Connection": "keep-alive", "X-Accel-Buffering": "no",
      });
      response.flushHeaders();
      response.write(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);
      let accountRevision = snapshot.account.revision;
      let matchmakingRevision = snapshot.matchmaking.revision;
      while (active) {
        await new Promise(resolve => setTimeout(resolve, options.streamIntervalMs ?? 1000));
        if (!active) break;
        // Revalidate access so an expired/revoked credential cannot keep a stream alive indefinitely.
        await authenticate(request);
        snapshot = await store.snapshot(response.locals.accountId);
        if (snapshot.account.revision !== accountRevision ||
            snapshot.matchmaking.revision !== matchmakingRevision) {
          accountRevision = snapshot.account.revision;
          matchmakingRevision = snapshot.matchmaking.revision;
          if (!response.write(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`)) break;
        } else if (!response.write(": heartbeat\n\n")) break;
      }
      response.end();
    } catch (error) {
      if (response.headersSent) {
        console.error("Player stream failed.");
        if (active) response.end(`event: unavailable\ndata: {"message":"Connection lost. Reload authoritative progress."}\n\n`);
      } else next(error);
    }
  });
  app.use("/api", (_request, _response, next) => next(new PlatformError(404, "not_found", "API operation is unavailable.")));
  if (options.staticDirectory) app.use(express.static(options.staticDirectory));
  const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
    const requestId = randomUUID();
    const status = error instanceof PlatformError ? error.status : error instanceof z.ZodError ? 400 :
      error instanceof SyntaxError ? 400 : 503;
    const code = error instanceof PlatformError ? error.code : status === 400 ? "invalid_request" : "service_unavailable";
    const message = error instanceof PlatformError ? error.message : status === 400 ?
      "The request is invalid or contains unsupported fields." : "Authoritative progress is unavailable. Try again.";
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(), severity_text: "ERROR", severity_number: 17,
      body: message, attributes: { "error.type": code, "request.id": requestId },
    }));
    response.status(status).json({ error: { code, message, requestId } });
  };
  app.use(errorHandler);
  return app;
}
