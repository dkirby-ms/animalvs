<!-- markdownlint-disable-file -->
# RPI Changes: Player Platform

## Metadata

Task ID: player-platform. Scope: full local core plan P01-P04.
Plan: [.copilot-tracking/plans/2026-11-03/player-platform-plan.md](../../plans/2026-11-03/player-platform-plan.md).

## Execution Status

Complete for the full local core plan, P01-P04. Ready for acceptance Review.

## Completed Work

### P01-T01: Shared typed workspace

Created npm workspaces for Vue, Express and shared Zod contracts in [packages/contracts/src/index.ts](../../../packages/contracts/src/index.ts). Runtime schemas cover the complete persisted account/replay shape and strict profile intent. `npm run typecheck` passed; dependency install reported zero vulnerabilities.

### P02-T01: Durable authoritative account boundary

[apps/api/src/store.ts](../../../apps/api/src/store.ts) now persists complete account projections, frozen pending battles, ordered immutable results, atomic awards, daily account/pair counters and reservations, and idempotent management ledgers. Stable identity, strict public intent validation, scoped reads, SSE snapshots and immediate linked-data deletion are wired through [apps/api/src/app.ts](../../../apps/api/src/app.ts). Production and local entrypoints are separate. Eight real PostgreSQL integration checks passed, including actual database restart, concurrency, rollback, JWT cryptography, cross-account denial and reconnect. Strict typecheck passed. Reward callbacks use current locked state rather than stale supplied progression. Deleting pending battles releases the other player's reserved capacity.

### P03-T01: Account and recovery interface

[apps/web/src/App.vue](../../../apps/web/src/App.vue) and [apps/web/src/usePlayer.ts](../../../apps/web/src/usePlayer.ts) display authoritative roster/economy/facility/replay records, visible errors, profile editing and explicit application-data deletion. MSAL handles configured Entra redirect login; local choices are development-only. Sign-out aborts old session reads, and reconnect loads snapshots. Strict typecheck and production builds passed. Browser behavior verification remains P04.

### P04-T01: Verified local platform and operational boundary

[tests/platform.test.ts](../../../tests/platform.test.ts), [tests/contracts.test.ts](../../../tests/contracts.test.ts) and [tests/browser/player.spec.ts](../../../tests/browser/player.spec.ts) verify persistence, identity and browser behavior. [README.md](../../../README.md) and [docs/platform.md](../../../docs/platform.md) cover setup, server-only integration, real tenant configuration and unverified release gates. [scripts/check-production.mjs](../../../scripts/check-production.mjs) verifies actual artifacts and startup rejection; [scripts/test-postgres.mjs](../../../scripts/test-postgres.mjs) provisions and removes isolated clusters. CI is defined in [.github/workflows/platform.yml](../../../.github/workflows/platform.yml).

Measured results: four contract tests, eight PostgreSQL/API tests and four Chromium tests passed. Actual isolated database restart preserved state and replay without awards. Strict typecheck and production build passed, including a build under `NODE_ENV=development`; actual built artifacts still exclude local credentials. Mobile screenshot inspected at 390px with no horizontal overflow. Existing GDD and earlier planning edits remain untouched.

## Implementation-Time Plan Updates

PC-001 resolved before implementation: retain only a pseudonymous deletion fingerprint, disclose remaining policy review.

Local implementation refinements: build-only local-auth constant is keyed to Vite serve, preventing a development `.env` from contaminating production artifacts. Local database strings reject query overrides. Shared schemas reject duplicate roster/facility identifiers. Optional OpenTelemetry API spans and sanitized log fields follow telemetry-foundations; no exporter or external destination configured.

## Business Alignment

None; no BRD/PRD/ADR source.

## Validation Record

| Check | Result | Evidence |
|---|---|---|
| Strict TypeScript/Vue types | Passed | `npm run typecheck` |
| Contract guards | Passed | 4 tests |
| Real PostgreSQL/API | Passed | 8 tests, including actual isolated server restart |
| Chromium UI/recovery | Passed | 4 tests against live local API and PostgreSQL |
| Production build | Passed | Also tested with inherited development environment |
| Production isolation | Passed | Artifact scan and actual rejected hosted process startup |
| Responsive UI | Passed | Inspected 390px screenshot; no overflow |
| Existing GDD preservation | Passed | No changes by this task |
| Real Entra tenant | Unavailable | Registration inventory absent; explicit deferred gate |
| Hosted/load/privacy acceptance | Not in scope | No deployment or legal approval |

Missing PostgreSQL server tools were downloaded and extracted into session storage without sudo/system changes. Missing Playwright Chromium was restored after the observed launch failure. A test-harness restart pipe hang was corrected with an explicit PostgreSQL log target; its orphaned cluster was stopped by exact PID.

## Blockers

No local scope blocker. Production tenant, hosting, jurisdiction and backup approval are excluded gates.

## Remaining Work

No remaining active-plan markers. Future gameplay/tenant/public-release integration remains outside this local core plan.

## Follow-Up Items

Live Entra integration and public-launch readiness remain deferred.
