<!-- markdownlint-disable-file -->
# RPI Plan Critique: Remaining P1 Platform Delivery

## Metadata

* Task ID: p1-platform-delivery
* Critique date: 2026-11-04
* Plan: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md
* Critique execution: Complete
* Critique depth: standard
* Depth provenance: default
* Critique type: initial
* Earlier critique: not applicable

## Inputs and Criterion Boundary

* Task context and caller requirements: Plan the active P1 issue work for #24 (Entra sign-in) and #26 (server-owned matchmaking-state delivery and recovery), use the existing TypeScript/Express, Vue/Vite, and PostgreSQL platform, do not mutate GitHub, and keep #27 deferred and #25 open.
* Research and evidence considered: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md; docs/gdd.md; docs/platform.md; README.md; .azure/requirements.json; .copilot-tracking/plans/2026-11-03/player-platform-plan.md; .copilot-tracking/reviews/logs/2026-11-03/player-platform-review.md; apps/api/src/auth.ts; apps/api/src/app.ts; apps/api/src/store.ts; apps/web/src/auth.ts; apps/web/src/usePlayer.ts; apps/web/src/App.vue; packages/contracts/src/index.ts; tests/contracts.test.ts; tests/platform.test.ts; tests/browser/player.spec.ts; package.json.
* Decisions, dependencies, task Goals, and task Requirements considered: User-confirmed live test-tenant sign-in and interactive access; fetch/SSE for authenticated server-to-client updates and HTTP for commands; #26 issue-level lifecycle and recovery only; no full matching policy, CPU fallback, or combat; #27 deferred; #25 remains open. All plan FR-001 through FR-005 and NFR-001 through NFR-003, tasks P01-T01 through P03-T01, and their stated dependencies are in scope.
* Assessment boundary: Assess the supplied plan and listed evidence for requirement coverage, evidence support, executability, and material risk. Do not implement, mutate GitHub, inspect secrets, or infer live-tenant, cost, legal, or deployment facts not in evidence.

## Lens Assessments

| Lens | Scope | Reasoning effort and source | Status | Candidates |
|---|---|---|---|---|
| Coverage | All phases, tasks, FRs, NFRs, and the #24/#26 acceptance boundary | low (selected; small scope) | Complete | 3 adopted; 1 rejected: one untraceable-detail candidate deferred for independent verification |
| Evidence | Full plan claims, decisions, Details, and References against listed evidence | medium (selected; standard default) | Complete | 3 adopted; 0 rejected |
| Executability | P01-P03 sequencing, dependencies, tools, environments, and validation | medium (selected; standard default) | Complete | 4 adopted; 4 rejected: lifecycle producer, revision semantics, test budget, and live run procedure merged into PC-001, PC-002, PC-004, and PC-007 |
| Risk | P01-T01, P02-T01, P02-T02, external gates, and deferred/overlapping work | medium (selected; standard default) | Complete | 4 adopted; 3 rejected: lifecycle, revision semantics, and test budget merged into PC-001, PC-002, and PC-004 |

## Coverage Assessment

| Requirement, research, phase, or task ID | Coverage | Evidence or concern |
|---|---|---|
| FR-001, FR-002, NFR-001, NFR-003 / P01-T01 | Partial | Live sign-in is an interactive test-tenant check, but P03 goal and map wording imply measured/automated live identity evidence; no separate interactive evidence record is defined. |
| FR-003, FR-004, NFR-001, NFR-002 / P02-T01 | Partial | Lifecycle stages are named, but command intents, transition triggers and proposal producer are not fixed while matching policy is deferred. |
| FR-003, FR-004, FR-005, NFR-001, NFR-002, NFR-003 / P02-T02 | Partial | Current SSE mechanism uses account revision as snapshot trigger; plan does not specify how queue/match changes trigger emission. |
| FR-001 through FR-005, NFR-001 through NFR-003 / P03-T01 | Partial | No concrete requirement-to-test mapping, and the cap of two new API and two browser tests may constrain listed behavior families unless existing tests can be extended without counting. |
| FR-003, FR-004, NFR-001, NFR-002 / P02-T01 | Partial | New account-linked state has no stated integration with the existing account-deletion path; additive PostgreSQL persistence also lacks a migration/rollback and isolated database execution note. |
| FR-001, NFR-003 / P01-T01 | Partial | Live Entra procedure does not identify a non-production database/test account or cleanup; the non-secret config source is not explicit alongside the prohibition on reading `.env`. |
| P02 dependencies | Partial | P02 is blocked on P01-T01 including its interactive test-tenant check, although local test identity can exercise the API/persistence work independently. |

## Verdict

* Verdict: Revise
* Rationale: All four lenses completed. Findings identify an undefined matchmaking transition producer and SSE change detection, a live-test evidence contradiction, inadequate test allocation, missing database migration/deletion integration, an underspecified live-test isolation procedure, unbounded added stream load, and an unnecessary dependency of local P02 work on the interactive Entra check. The initial result is Revise; the planning parent recorded corrections/dispositions for every finding and the user resolved the #27-related scope question.

## Findings

<!-- rpi:critique id=PC-001 -->
### PC-001 [High]: Matchmaking lifecycle has no defined producer

* Related IDs: FR-003, FR-004, NFR-001, NFR-002, P02-T01, P03-T01
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, P02-T01 Details and P03-T01 Details
* Concern: The plan requires queue, proposed-match, acceptance, cancellation/timeout, and stored-result lifecycle behavior while deferring matching policy, but names no allowed client commands, transition triggers, or in-scope mechanism that creates a proposed match.
* Impact: The implementer cannot determine what produces lifecycle state changes, and the lifecycle/live-update tests are not executable against a stable set of transitions.
* Smallest useful change: Define the allowed HTTP intents and their resulting state transitions, including the bounded mechanism for creating a proposed match without implementing full matching policy, then map these transitions to test cases.
* Action owner: planning parent
* Exact resolving evidence: Revised P02-T01 specifies the allowed intent/state transitions and proposal trigger, and P03-T01 maps each required transition to an existing or new test.
* Decision route: direct planner correction within the confirmed #26 boundary.

<!-- rpi:critique id=PC-002 -->
### PC-002 [High]: SSE plan omits matchmaking-change detection

* Related IDs: FR-003, FR-004, NFR-001, NFR-002, P02-T02, P03-T01
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, P02-T02 Details; apps/api/src/app.ts uses account revision changes to trigger snapshots.
* Concern: The plan requires live matchmaking updates but does not state whether matchmaking transitions increment the observed account revision or how a separate matchmaking revision is detected.
* Impact: A queue/proposal change that leaves the account revision unchanged may never be emitted on the open SSE stream, missing the live-delivery requirement.
* Smallest useful change: Specify the revision/change-key mechanism for matchmaking transitions and add a test that a transition with no unrelated account mutation is delivered over an already-open SSE connection.
* Action owner: planning parent
* Exact resolving evidence: Revised P02-T02 defines the live-change detection contract and P03-T01 identifies the streaming test proving it.
* Decision route: direct planner correction within the confirmed SSE transport boundary.

<!-- rpi:critique id=PC-003 -->
### PC-003 [Medium]: Live Entra verification is represented as measured test evidence

* Related IDs: FR-001, FR-002, NFR-003, P01-T01, P03-T01
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, Phase Checklist map node, P03 Goals, and P03-T01 Details
* Concern: The map and P03 goal say tests verify or demonstrate live/real-tenant identity, while P03-T01 says live sign-in is interactive and must not be reported as CI-verified.
* Impact: Implementation evidence may overstate what automated tests prove or leave the manual sign-in outcome unrecorded.
* Smallest useful change: Describe live tenant verification as a separate interactive check, list its observable steps, and record its evidence separately from CI results.
* Action owner: planning parent
* Exact resolving evidence: Updated map, P01-T01 procedure, and P03-T01 wording distinguish automated tests from the recorded interactive result.
* Decision route: direct planner correction; user already confirmed interactive tenant access.

<!-- rpi:critique id=PC-004 -->
### PC-004 [Medium]: Test additions are capped without a coverage allocation

* Related IDs: FR-001 through FR-005, NFR-001 through NFR-003, P03-T01
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, P03-T01 Details
* Concern: P03-T01 names multiple behavior families but caps new API and browser tests and does not say whether extensions to existing tests count or which behaviors are covered by existing cases. It also omits explicit duplicate/out-of-order notification recovery and tampering cases in the stated exit evidence.
* Impact: The implementer may be forced to omit acceptance coverage or treat the cap inconsistently, causing test gaps or rework.
* Smallest useful change: Clarify that the cap applies only to newly added test cases, permit extending existing tests, and map every required behavior—including duplicate/out-of-order recovery and tampering—to existing or planned test coverage.
* Action owner: planning parent
* Exact resolving evidence: Revised P03-T01 contains an FR/NFR-to-test map, identifies duplicate/out-of-order recovery and tampering coverage, and explicitly defines test budget counting.
* Decision route: direct planner correction; preserve semantic coverage over the optional test-count preference.

<!-- rpi:critique id=PC-005 -->
### PC-005 [High]: New account-linked state is not covered by deletion

* Related IDs: FR-004, NFR-001, NFR-002, P02-T01
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, P02-T01 Details and #27 Non-Goals; apps/api/src/store.ts `PlayerStore.deleteAccount`; docs/platform.md existing deletion guarantee.
* Concern: P02-T01 adds persistent account-linked queue/proposal state but does not require the existing deletion operation to remove that new state or verify the behavior. The user has deferred all #27 changes, so expanding privacy/deletion scope cannot be assumed.
* Impact: Account deletion may leave orphaned queue/match records, retain account-linked data, or fail due to referential constraints; changing deletion behavior may also exceed the user-approved #26 scope.
* Smallest useful change: Record a narrow scope decision: either require only cleanup of the newly introduced transient matchmaking records as a compatibility invariant of P02-T01, or keep the plan blocked until the user authorizes that feature-coupled cleanup. Do not implement broader #27 work.
* Action owner: user for the scope boundary; planning parent for recording the decision
* Exact resolving evidence: User-approved scope disposition and a P02-T01 requirement/test proving account deletion removes only newly introduced account-linked matchmaking records while leaving deferred #27 work untouched.
* Decision route: significant user decision because current direction defers all #27 changes.

<!-- rpi:critique id=PC-006 -->
### PC-006 [Medium]: Persistent matchmaking state lacks a migration execution contract

* Related IDs: FR-004, NFR-002, NFR-003, P02-T01, P03-T01
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, P02-T01 Details and Changes in the map; docs/platform.md describes applying database schema through the migration command.
* Concern: The plan requires PostgreSQL persistence but does not call out an additive schema migration, the existing migration runner, compatibility with existing state, or an isolated database validation path.
* Impact: Implementation may omit deployable schema changes or make an incompatible store change, blocking persistence and recovery validation.
* Smallest useful change: Include an additive migration through the existing runner, preserve compatibility with existing accounts/results, and test against an isolated PostgreSQL database.
* Action owner: planning parent
* Exact resolving evidence: P02-T01 and the change map name the migration path/runner and P03-T01 validation identifies an isolated PostgreSQL run.
* Decision route: direct planner correction.

<!-- rpi:critique id=PC-007 -->
### PC-007 [Medium]: Live Entra test lacks an isolated environment and cleanup procedure

* Related IDs: FR-001, NFR-003, P01-T01, P03-T01
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, P01-T01 Details and Dependencies; docs/platform.md deployment/database requirements.
* Concern: The interactive sign-in test creates or accesses saved account progress, but the plan names neither a non-production database/test identity nor cleanup. It also refers to approved local configuration without naming a safe source for non-secret values while forbidding reading `.env`.
* Impact: Verification may touch shared/production data, leave test account data behind, or push the implementer toward reading prohibited configuration.
* Smallest useful change: Require an isolated non-production database and dedicated test identity, define post-test cleanup, and state that the user supplies or points to approved non-secret configuration without exposing `.env` or credentials.
* Action owner: planning parent
* Exact resolving evidence: P01-T01 records an isolated environment, dedicated test identity and cleanup procedure plus an explicit safe source for non-secret values.
* Decision route: direct planner correction within the user's confirmed interactive-test direction.

<!-- rpi:critique id=PC-008 -->
### PC-008 [Medium]: Added per-connection database load is not bounded

* Related IDs: FR-003, NFR-003, P02-T02
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, P02-T02 Details and risk for #38; apps/api/src/app.ts existing per-connection snapshot polling; docs/platform.md connection and proxy limitations.
* Concern: Extending the existing polling SSE flow adds matchmaking reads per open connection, but the plan does not bound the query cadence/connection behavior or record that the workload impact remains unvalidated.
* Impact: Persistent connections may increase database load and cost beyond the unvalidated hosting assumptions.
* Smallest useful change: Preserve the existing polling cadence, avoid extra unbounded reads per client, and explicitly record connection/load capacity as unvalidated rather than implying the design is production-scale.
* Action owner: planning parent
* Exact resolving evidence: P02-T02 states the read cadence/limit or equivalent bounded event polling behavior, and the plan's risk section records hosting capacity as unvalidated.
* Decision route: direct planner correction; no production capacity claim is authorized.

<!-- rpi:critique id=PC-009 -->
### PC-009 [Medium]: P02 is unnecessarily blocked on interactive Entra verification

* Related IDs: FR-001, FR-003, FR-004, NFR-001, NFR-003, P01-T01, P02-T01, P02-T02
* Evidence: .copilot-tracking/plans/2026-11-04/p1-platform-delivery-plan.md, P02 phase Dependencies and P02-T01/P02-T02 Dependencies; existing local test identity and synthetic JWT tests are listed as available.
* Concern: P02 depends on the P01 sign-in boundary without distinguishing the shared authenticated identity contract from the external interactive Entra test. If tenant configuration is unavailable, independent API, persistence, and automated test work would be blocked.
* Impact: An external configuration gate can stall work that can be validated locally without weakening production authentication.
* Smallest useful change: Make P02 depend on the authenticated identity contract, allow its API/persistence/tests to use the existing local test identity, and retain the live tenant check as an independent P01/release evidence gate.
* Action owner: planning parent
* Exact resolving evidence: Revised P02 dependencies state that local API, persistence, and automated tests can proceed while only live verification waits on P01-T01.
* Decision route: direct planner correction; no production identity fallback is permitted.

## Strengths and Residual Risk

* Plan respects user direction to defer #27 and avoid claiming #25 complete. Evidence lens confirmed existing identity, authenticated SSE, persistence, and validation scaffolding supports the selected foundation.

## Questions or Blocking Evidence Gaps

* None remaining in the supplied assessment boundary.

## Limitations

* Coverage candidate about untraced disabled-control behavior was not promoted because its acceptance importance was not established by the supplied issue evidence. Guest-progress scope was not promoted because its criterion wording was not independently verified in the supplied issue text.

## Recommended Next Action

* Highest-impact finding: PC-001
* Action owner: planning parent
* Smallest next action: Continue to `/rpi-implement` using the finalized plan and changes-record path.
* User response required: no; D6 resolved the only significant scope decision.
