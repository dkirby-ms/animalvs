---
title: Animal VS
description: Local Vue and TypeScript player platform backed by PostgreSQL.
---

## Core platform

The browser displays authoritative account, roster, facility and stored battle
state. Express owns identity and access checks; PostgreSQL owns persistence.
The platform includes an account-scoped matchmaking lifecycle, authenticated
commands, live updates and reconnect recovery. Participant selection, CPU
fallback, combat and facility mechanics are not implemented. Issue #25 remains
open; broader #27 privacy, retention, backup and deletion-policy work is
deferred. Hosting cost and SSE connection capacity are not validated.

## Run locally

Requires Node.js 24+, npm, and PostgreSQL 16+ (or Docker Compose).

```bash
npm ci
cp .env.example .env
```

Set a local database password in `.env`, matching `DATABASE_URL`, then start
PostgreSQL:

```bash
POSTGRES_PASSWORD=your-local-password docker compose up -d postgres
npm run dev:api
```

In another terminal:

```bash
npm run dev:web
```

Open the Vite URL, normally `http://127.0.0.1:5173`. Choose one of the two
explicitly local development players. The local API applies migrations, binds
only to loopback, and requires a loopback database whose name ends in `_dev`.
Sign out and select the same player to recover saved progress.

Without Docker, create a dedicated local PostgreSQL database ending in `_dev`
and set `DATABASE_URL` accordingly. Do not use shared or production databases.

For interactive Entra testing during development, keep the same dedicated
loopback `_dev` database and run `LOCAL_AUTH_ENABLED=false npm run dev:api`.
The development API then validates real Entra access tokens but still binds
only to loopback. Local simulated players remain the default when
`LOCAL_AUTH_ENABLED=true`; no production service or deployment is involved.

## Verify

```bash
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run build
npm run test:production
```

Tests create an isolated PostgreSQL cluster using server tools from
`/usr/lib/postgresql/16/bin`. Set `PG_BIN` for another installation and `PG_SHARE`
if `initdb` requires an explicit support-files directory. The PostgreSQL client
command `createdb` must be on `PATH`. Isolated integration tests restart the
database to verify recovery.

Alternatively, set `TEST_DATABASE_URL` to a disposable database. Integration
tests create and remove only a random schema; browser tests run the local API
and modify its two development players, so their database must be loopback,
end in `_dev`, and be disposable. External-database tests verify API/pool
restart, not database-server restart.

## Production boundary

`npm start` serves the built browser and API on one origin. It requires
`NODE_ENV=production`, PostgreSQL migrations, and explicit Entra issuer,
audience, JWKS and scope settings. No simulated identity entrypoint is built;
the production API rejects the local flag, and built browsers cannot use it.

See [platform operations and contracts](docs/platform.md) for identity setup,
storage contracts, recovery, deletion boundaries and remaining release gates.
