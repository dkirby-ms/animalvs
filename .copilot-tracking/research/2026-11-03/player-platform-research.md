<!-- markdownlint-disable-file -->
# Task Research: Player platform

| Field | Value |
|---|---|
| Date | 2026-11-03 |
| Researcher / agent | RPI Agent, rpi-research |
| Output mode | convergence |

## Executive Summary

Research complete. A locally runnable platform can proceed without deploying or claiming tenant/privacy approval. Use the confirmed stack, strict HTTP intent schemas, PostgreSQL transactions, and a server-only gameplay persistence interface.

## What You May Not Know

The existing requirements capture stack choices but no approved project plan or application code.

## Findings

### Authoritative state belongs behind a server-only boundary

Persist all C1 record families, but expose no HTTP endpoint for arbitrary state, combat results, CPU inputs, or awards. Future gameplay services supply validated server records. Account-scoped reads and intent-only profile changes exercise the boundary now. Evidence-backed finding, high confidence: C1, C2, W1. Q1 and Q2 answered.

### Recovery must read durable data, not replay writes

An authenticated fetch-based SSE stream can report durable account revisions and trigger an authoritative snapshot read after connection loss. Database polling supports separate API processes without transient in-memory event ownership. This trades a small bounded polling delay for no extra hosted service. Evidence-backed architectural recommendation from C1 and W2, not a gameplay integration claim.

### Real PostgreSQL verification needs server binaries

Node 24, npm and PostgreSQL client tools exist; PostgreSQL server binaries and Docker are absent. Tests must provision an isolated local server or accept an explicit test database, never replace PostgreSQL with an in-memory imitation. Q3 answered; missing server tooling will be restored after the observed missing-tool failure.

## Recommendation and Alternatives

Honor the selected Vue/Vite, Express/TypeScript, PostgreSQL stack.

## Scope and Questions

* Goal: establish the platform needed by #23 and #25, not implement combat or matchmaking.
* Audience: application developers.
* In scope: authentication boundary, account-scoped durable records, typed contracts, recovery, deletion foundations, runnable local verification.
* Out of scope: gameplay engines, deployment, budget approval, legal approval, tracker mutations.
* Criteria: strict client commands, no local fallback, real PostgreSQL integration tests, explicit production identity configuration.

| ID | Question | Status |
|---|---|---|
| Q1 | What prior decisions and acceptance criteria apply? | Answered |
| Q2 | What persistence and recovery contracts support future gameplay? | Open |
| Q3 | Which local tools can verify real persistence? | Open |

## Decisions and Feedback

| Group | Decision or feedback item | Status | Evidence |
|---|---|---|---|
| D1 | End-to-end automatic progression, agent-owned decisions | Confirmed | Live user response |
| D2 | Preserve pre-existing GDD, requirements and tracking files | Confirmed | Dirty worktree |

## Risks and Open Questions

Production tenant details and privacy/hosting approval remain deployment gates, not prerequisites for a locally verified core.

## Planning Readiness and Next Step

Research disposition: executed. Planning readiness: Ready for local core implementation. Agent-owned decisions from confirmed end-to-end mode. No unresolved material research decision; no walkthrough needed. Automatic parent continues to Plan. Production tenant verification, public launch and hosting approval excluded.

## Research Record

### Method and Boundaries

Focused posture for named issues and prior requirements. No helpers. Root: repository .copilot-tracking/research. Date: user-supplied current date. Primary artifact: .copilot-tracking/research/2026-11-03/player-platform-research.md.

### Extension Registry

Selected: tracking conventions/location, Markdown/writing, untrusted-content boundary, licensing posture. Domain guidance limited to implementation contracts when their phase is activated. No external proprietary inputs.

### Evidence Log

* C1: docs/gdd.md, Browser delivery and persistence; required durable records and trust boundaries.
* C2: .azure/requirements.json, service questions; selected Vue/Vite, Express, TypeScript, PostgreSQL.
* W1: https://github.com/dkirby-ms/animalvs/issues/23 and /25, retrieved 2026-11-03; primary acceptance criteria.
* W2: https://github.com/dkirby-ms/animalvs/issues/24, /26, /27, retrieved 2026-11-03; dependencies of protection rollup.

### Research Cycle Log

Wider: prior requirements, GDD and related issue boundaries inspected.

Deeper: enumerated account/progression/economy/battle/reservation/idempotency data, production-inaccessible local identity, authenticated recovery, and PostgreSQL runtime availability.

Contrarian: rejected client-authoritative JSON write APIs and mock-only database tests. Rejected adding Redis or a paid event service for the core, since snapshot-based SSE can operate across processes against durable revisions. Keep relational ownership and database constraints even when immutable replay payloads use JSONB.

Synthesis: sources cover local platform choices. Another cycle would repeat known requirements; tenant and legal evidence cannot be invented and do not block isolated local development. No helpers used. All claims bounded to platform contracts rather than future gameplay behavior.
