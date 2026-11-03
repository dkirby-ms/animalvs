---
title: Player platform architecture and operations
description: Trust boundaries, persistence contracts, identity configuration and verification limits.
ms.date: 2026-11-03
---

## Architecture

```mermaid
flowchart LR
  Browser[Vue and Vite browser] -->|Access token and intent| API[Express API]
  API -->|Issuer, audience, signature, scope| Entra[Entra External ID]
  API --> Store[PlayerStore]
  Gameplay[Future trusted gameplay services] --> Store
  Store --> PG[(PostgreSQL)]
  API -->|Authenticated snapshot stream| Browser
```

The repository uses npm workspaces: `apps/web`, `apps/api` and
`packages/contracts`. Shared Zod schemas validate wire and database projections.
No browser code can invoke trusted repository methods.

## Authentication

Local simulation exists only in the source development entrypoint. It requires
`NODE_ENV=development`, `LOCAL_AUTH_ENABLED=true`, a loopback database ending
in `_dev` without connection-string query overrides, and a loopback listener.
Local identities use their own issuer and namespace. They do not issue tokens,
and production JWT validation rejects their credential strings.

Production sign-in uses MSAL's authorization-code/PKCE redirect flow and API
access tokens. Set these server variables:

| Variable | Meaning |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Dedicated hosted PostgreSQL connection; use deployment-managed credentials and TLS |
| `ENTRA_ISSUER` | Exact API token issuer including tenant/version path |
| `ENTRA_AUDIENCE` | API application ID/audience, not the SPA client ID |
| `ENTRA_JWKS_URI` | Tenant JWKS URL on the pinned issuer origin |
| `ENTRA_SCOPE` | Required delegated scope name, for example `access_as_user` |
| `PORT` | API listener port, defaults to 3000 |

Set `VITE_ENTRA_AUTHORITY`, `VITE_ENTRA_CLIENT_ID` and `VITE_ENTRA_SCOPE`
before the browser build. Vite reads the repository-root `.env` for development.
The browser development-auth constant is tied to Vite's `serve` command, not
`NODE_ENV`; all built artifacts exclude simulated credentials.

Register exact redirect/logout origins and the API's delegated permission in
the existing Entra external tenant. Configure its sign-in user flow and consent,
then verify actual tokens match the API issuer and audience. No real tenant
configuration or successful live-tenant sign-in is claimed by this platform.

Production authentication never fetches key locations from token headers. The
API validates RS256 signatures, issuer, audience, subject, issued-at, expiration
and delegated scope against configured values. Identity uses issuer/subject,
never a supplied account ID, email or real name.

Run migrations from the repository root before starting the API:

```bash
npm run migrate
npm run build
NODE_ENV=production LOCAL_AUTH_ENABLED=false npm start
```

Build artifacts require the SQL migration directory at runtime for the migration
command. Run `npm run migrate` from the source release or
`node dist/apps/api/src/migrate.js` from a release containing that directory.
The application does not create hosted resources or validate the proposed
hosting budget. Configure HTTPS termination, database TLS, least-privilege
runtime/migration roles, connection limits and proxy streaming before hosting.

## HTTP surface

All private routes derive ownership from the verified identity. Query-string
account selectors are rejected. There is no arbitrary state or award write API.

| Method and route | Contract |
|---|---|
| `GET /api/config` | Public authentication mode only |
| `GET /api/snapshot` | Private account, latest 50 completed battles, pending battle definitions, server time |
| `GET /api/battles/:id` | Stored replay, only for a participant; history beyond the snapshot remains retrievable by ID |
| `GET /api/events` | Bearer-authenticated fetch/SSE; initial snapshot, revision snapshots and heartbeats |
| `PATCH /api/profile` | Strict `transactionId`, `expectedRevision`, `displayName` intent |
| `DELETE /api/account` | Authenticated request with exactly `{"confirmation":"DELETE"}` |

Clients cannot supply levels, resources, completion times, combat decisions,
CPU inputs, damage, results or awards. Unknown fields fail with a visible error.
Stale profile actions and conflicting transaction-ID reuse return HTTP 409.
Authentication failures return 401/403; unavailable durable state returns 503.

## Persistent contracts

`accounts` stores identity, environment namespace, a monotonic revision and a
validated account projection containing display name; all six animal levels,
residual XP, welfare and training dates; credits, turns and reset date;
completed facilities and pending purchases with cost/completion records.

`battle_reservations` stores immutable battle definitions, participants or CPU
profile, mode, locked statistics/bonuses, conditions, rule versions, seed and
daily reward reservation date. `reservation_accounts` provides relational
ownership and foreign keys.

`battles` stores the complete immutable replay, ordered events, outcome and
awards. `reward_counters` and `pair_reward_counters` persist daily reserved and
awarded capacity. `management_transactions` persists account-scoped
idempotency keys, intent fingerprints and results.

`PlayerStore.management` is a server-only callback under an account row lock.
It validates the resulting projection, atomically writes state/ledger/revision,
and returns the original result for an exact retry. The callback must be pure:
no outbound calls or effects outside the database transaction.

`reserveBattle` stores frozen server inputs and reserves account/pair reward
capacity under sorted participant locks. A retry reuses the same ID and seed.
`completeBattle` atomically stores the replay, applies trusted XP formulas to
the latest locked animal state, credits awards and moves reservation counters.
Concurrent completions cannot award twice. The caller supplies game rules and
limits; this layer does not implement combat, CPU decisions, leveling, daily
reset rules or facility pricing.

Reservation occurs when a battle is created, not when a transient matchup is
proposed. Future game services must process durable pending battles after a
restart using their stored seed/rules, independent of browser connections.
This scaffold does not yet include that simulation worker.

## Recovery

The browser uses bearer-authenticated fetch streaming, not tokens in SSE URLs.
The API polls durable revisions once per second, supporting separate API
processes without an in-memory notification owner. The browser reconnects
after two seconds, always loading a new authoritative snapshot first. It
rejects older-revision snapshots and aborts obsolete sessions on sign-out.

Connections revalidate access tokens. Expiration or database failures visibly
interrupt the stream. While recovery fails, shown data is labeled potentially
stale and management controls are disabled. The browser never stores progress
or replaces missing server state with defaults. MSAL may store identity
session material, not gameplay progression.

The stream currently conveys persistent account/battle changes. Transient
queue ownership, selection revisions, acceptance timers and matchmaking events
must be wired when matchmaking exists; #26 is not fully complete yet.

## Deletion and privacy boundaries

An authenticated, explicitly confirmed deletion immediately removes the
application account and its progression/economy/management records. Linked
pending/completed battles, shared replay data and pair counters are removed,
too. Other participants keep their own progress and aggregate daily counts;
pending reward capacity is released and their revisions advance.

A one-way issuer/subject fingerprint prevents an old signed-in identity from
silently recreating an erased account. The tombstone contains no raw issuer,
subject, account ID, name or gameplay history, but remains pseudonymous data.
Its retention and any future deliberate re-enrollment policy require privacy
review. This is not a claim of complete identity erasure.

Deleting application data does not delete the Microsoft identity or purge
backups. Before processing real beta accounts, define identity-provider
deletion responsibilities, tombstone retention, legal exceptions and backup
expiration/restore handling. Before public launch, review applicable regional
age, privacy and consent requirements. The intended 13+ audience is not legal
approval. No precise location or real name is required for gameplay.

## Observability and validation

HTTP errors emit sanitized structured logs with timestamp, OpenTelemetry
severity fields, safe message and a random request ID. Tokens, request bodies,
database URLs, player IDs and display names are not logged. HTTP and database
transaction spans use the OpenTelemetry API and semantic attributes.
A deployment may register a provider before startup; no exporter or external
telemetry destination is configured by this scaffold. Set `service.name`,
`service.version` and `deployment.environment` on that provider.

Validation covers runtime schemas, production exclusion, signed-token
cryptography with a local JWKS issuer, real PostgreSQL transactions/restart,
ownership, retry safety, rollback, reward reservations, deletion and Chromium
account/recovery flows. It does not establish real-tenant sign-in, gameplay
integration, hosted load/cost, cross-browser parity or privacy certification.

Issues #23 and #25 have a working core foundation, not blanket closure of
their full release acceptance criteria. Integrate and verify future queue,
battle and management services against this boundary.
