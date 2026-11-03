<!-- markdownlint-disable-file -->
<!-- markdown-table-prettify-ignore-start -->

# Animal VS Private Beta Project Plan

* Platform: GitHub
* Repository: `dkirby-ms/animalvs`
* Mode: `sprint`, adapted to the user's undated release-roadmap scope
* Proposed project: `Animal VS - Private Beta`, owned by `dkirby-ms`
* Container: Project #20; repository milestones #1-#8 now correspond to phases P1-P8
* Dates and capacity: not supplied; no schedule or velocity assumed
* Generated: 2026-11-02
* State: Project and P1-P8 milestone setup complete on 2026-11-03; readiness decisions remain open

## Summary

Organize the 39 existing issues into eight delivery phases, retaining seven
capability tracking issues and 32 delivery issues. Do not create replacement
issues. Preserve every existing title, body, label, assignee, state, and type.
Use project-local fields for the proposed organization, not new repository labels.

| Metric | Verified value |
|--------|----------------|
| Existing issues in scope | 39, numbered 1 through 39 |
| Open / closed | 39 / 0 |
| Assigned / unassigned | 0 / 39 |
| Issues with milestones | 39, each assigned to its completion phase |
| Repository milestones | 8 open, undated milestones for P1-P8 |
| Observed native issue types | None on all 39 issues |
| Observed parent-child links | 0 |
| Proposed capability / delivery roles | 7 / 32, local planning roles only |
| Issue body and non-milestone metadata changes | None; all 39 have an approved completion-phase milestone assignment |
| Effort, capacity, utilization | Unknown; counts substitute for effort |

## Evidence and boundaries

* [Live issue snapshot](../../animalvs-issues-2026-11-02.json) contains the full hydrated issue bodies and fields retrieved for this pass.
* [Original issue plan](../../prds/gdd/issues-plan.md) supplies intended grouping and completion dependencies.
* [Original analysis](../../prds/gdd/artifact-analysis.md) supplies requirement traceability and recorded design decisions.
* [Original operation log](../../prds/gdd/handoff-logs.md) records successful Creates. Existing issue numbers were verified directly against GitHub.
* [GDD development milestones](../../../../docs/gdd.md#development-milestones) supply the delivery direction; the sequence below is a dependency-aware recommendation, not a rewrite of the GDD.

The attached handoff is supporting context, not execution authority. No old Create
or Link operation is resumed here. Prototype tuning remains provisional. Ranked
play, direct challenges, equal-level mode, additional species, monetization,
guest progress, trading, and advanced CPU tiers remain outside this plan.

The source overview still differs from the previously recorded decisions about
readiness-related maximum health, provisional reward eligibility, and matching
within both participants' search ranges. Preserve the existing issue criteria;
record source reconciliation as grooming, not a new requirement or issue.

## Proposed GitHub Project

The user selected a new project rather than reusing Project #19. That existing
untitled project is repository-linked and empty; leave it unchanged.

| Setting | Proposal | Validation or approval needed |
|---------|----------|-------------------------------|
| Owner | `dkirby-ms` | Confirmed account context |
| Repository scope | `dkirby-ms/animalvs`, issues 1 through 39 only | Confirmed |
| Name | `Animal VS - Private Beta` | Approved by user on 2026-11-03 |
| Visibility | Public | Approved by user on 2026-11-03 |
| Items | Add the 39 existing issue URLs, never draft duplicates | Check membership before adding on retries |
| Status | Backlog, Ready, In progress, In review, Done | Discover actual fields/options after creation |
| Delivery phase | P1 through P8, with names below | Proposed project-local single-select field |
| Workstream | Combat, Matchmaking, Progression, Facilities, Platform, Experience, Validation | Proposed project-local single-select field |
| Item role | Capability, Delivery | Proposed project-local single-select field; not native issue types |
| Readiness | Needs review, Decision blocked, Ready | Proposed project-local single-select field |
| Initial values | Backlog and Needs review, unless a decision blocker is listed below | Do not imply work is ready or in progress |
| Automation | None proposed | Do not auto-close issues or alter repository state |

Suggested views:

1. Delivery roadmap: table grouped by Delivery phase, ordered P1 through P8.
2. Execution board: board grouped by Status; filter Item role to Delivery to
   avoid counting capability rollups as implementation throughput.
3. Decisions and grooming: table filtered to Needs review or Decision blocked.
4. Capability coverage: table grouped by Workstream, showing both item roles.

Keep the roadmap undated: no milestone due dates, start dates, priority scores,
estimates, or assignees were added. Capability completion phases are rollup
targets, not dates for starting the work.

## Delivery phases

The phase gates summarize existing issue criteria. They add no new acceptance
criteria. Parallel work with fixtures is possible; full completion still follows
the dependency register below.

| Phase | Delivery issues | Capability rollup | Exit evidence from existing issues |
|-------|-----------------|-------------------|------------------------------------|
| P1 Platform and beta decisions | #38, #24, #25, #26, #27 | #23 | Hosting constraints reviewed before provider-dependent implementation; authenticated, authorized durable state and reconnect/deletion behavior verified |
| P2 Headless combat and replay | #2, #3, #4 | None | Locked profiles, simultaneous rounds, and deterministic replay verified |
| P3 Conditions and balance | #5, #6 | #1 | Reviewed condition inputs and full simulation report; unmet prototype targets remain explicit |
| P4 Progression and settlement | #13, #14, #15 | #12 | XP and credit rules, UTC reservations, atomic settlement, and retry behavior verified |
| P5 Human and CPU playable loop | #8, #10, #9, #11, #30, #31 | #7 | Human matchmaking, voluntary CPU fallback, reveal/acceptance, disconnect recovery, replay, and results verified |
| P6 Daily management | #17, #18, #19, #20, #21, #22, #29 | #16 | Resets, completed bonuses, purchases, welfare, training, cards, and account/collection screens verified |
| P7 Presentation and device validation | #33, #34, #32, #37 | #28 | Art/audio criteria, keyboard and supported browsers, and recorded device/performance results verified |
| P8 End-to-end and playtest review | #36, #39 | #35 | Complete human/CPU flows and recovery checked; playtest findings and unresolved results recorded for beta review |

The user later approved matching undated repository milestones and issue
assignments. All 39 existing issues are assigned to their completion phase:

| Phase | Repository milestone | Issues |
|-------|----------------------|--------|
| P1 | #1 - Platform and beta decisions | 6 |
| P2 | #2 - Headless combat and replay | 3 |
| P3 | #3 - Conditions and balance | 3 |
| P4 | #4 - Progression and settlement | 4 |
| P5 | #5 - Human and CPU playable loop | 7 |
| P6 | #6 - Daily management | 8 |
| P7 | #7 - Presentation and device validation | 5 |
| P8 | #8 - End-to-end and playtest review | 3 |

This order moves hosting decisions forward because #38 explicitly precedes
implementation that depends on them. It places #5 before acceptance and #14
before battle creation because #10 consumes their results. It separates reward
settlement from matchmaking integration rather than claiming the full queue flow
can finish before reward reservations exist.

Follow the GDD's early presentation learning goal by prototyping #30/#31 with
fixtures during P2; do not mark either complete before its integration dependencies
are met. Likewise, a neutral-condition #6 run can start during P2, but the full
matrix completes only after #5. #17 and independent art/audio work can begin
earlier in parallel. Phases describe completion order, not exclusive work windows.

## Complete issue register

Each reference belongs only to this workflow. References are never project field
values. All listed items remain open with the enhancement label, no assignee,
no native type, and no parent; each has the repository milestone for its
completion phase.

Predecessors are completion guidance from the original issue plan, not observed
GitHub dependency links. For capability rows, the children column is an intended
grouping, not a prerequisite edge or an existing sub-issue relationship.

| Reference | Existing issue and outcome | Role | Workstream | Completion phase | Predecessors or intended children | Additional grooming |
|-----------|----------------------------|------|------------|------------------|-----------------------------------|---------------------|
| IS001 | #1 Reproducible animal battles | Capability | Combat | P3 | Children: #2, #3, #4, #5, #6 | Rollup scope and prototype success measures |
| IS002 | #2 Starter animals and locked statistics | Delivery | Combat | P2 | None | Reconcile source readiness wording; prototype profiles |
| IS003 | #3 Simultaneous battle rounds | Delivery | Combat | P2 | #2 | Validate proposed formulas and boundaries |
| IS004 | #4 Deterministic battle replays | Delivery | Combat | P2 | #3 | Fixture-first work; integrate durable storage with #25 |
| IS005 | #5 Terrain and weather modifiers | Delivery | Combat | P3 | #2 | Decision blocked: affinity and tolerance inputs |
| IS006 | #6 Matchup balance matrix | Delivery | Combat | P3 | #3, #5 | Decision blocked: reviewed matrix inputs; keep targets provisional |
| IS007 | #7 Human and CPU battles | Capability | Matchmaking | P5 | Children: #8, #9, #10, #11 | Rollup scope and success measures |
| IS008 | #8 Compatible human queue entries | Delivery | Matchmaking | P5 | #2, #24, #25 | Pool sizing; retain both-player range clarification |
| IS009 | #9 CPU battles and fallback | Delivery | Matchmaking | P5 | #3, #8, #10 | CPU/reward tuning remains provisional |
| IS010 | #10 Reveal and accept matchups | Delivery | Matchmaking | P5 | #5, #8, #14 | Preserve provisional-to-final reward eligibility |
| IS011 | #11 Disconnect recovery | Delivery | Matchmaking | P5 | #8, #10, #15, #26 | Integrate cancellation and exactly-once behavior |
| IS012 | #12 Persistent battle progression | Capability | Progression | P4 | Children: #13, #14, #15 | Rollup scope and prototype success measures |
| IS013 | #13 Experience and credits | Delivery | Progression | P4 | #2, #25 | Reward and progression tuning |
| IS014 | #14 Daily reward reservations | Delivery | Progression | P4 | #13, #25 | Reward-cap tuning; midnight and release cases |
| IS015 | #15 Exactly-once settlement | Delivery | Progression | P4 | #4, #14, #25 | Atomicity and retry evidence |
| IS016 | #16 Daily training management | Capability | Facilities | P6 | Children: #17, #18, #19, #20, #21, #22 | Rollup scope and prototype success measures |
| IS017 | #17 Account initialization and UTC resets | Delivery | Facilities | P6 | #24, #25 | May start after P1; proposed initial economy |
| IS018 | #18 Completed facility bonuses | Delivery | Facilities | P6 | #2, #17 | Facility values and caps require tuning |
| IS019 | #19 Facility purchases and completion | Delivery | Facilities | P6 | #17, #18, #25 | Proposed costs and transaction boundaries |
| IS020 | #20 Welfare and readiness | Delivery | Facilities | P6 | #17, #18, #25 | Welfare tuning and source wording reconciliation |
| IS021 | #21 Daily directed training | Delivery | Facilities | P6 | #13, #17 | Proposed costs and XP tuning |
| IS022 | #22 Facility cards | Delivery | Facilities | P6 | #18, #19, #20, #21 | UI error and projection integration |
| IS023 | #23 Protected persistent progress | Capability | Platform | P1 | Children: #24, #25, #26, #27 | Child decisions and rollup scope |
| IS024 | #24 Entra External ID authentication | Delivery | Platform | P1 | None | User selected an existing external tenant and a local-only simulated identity behind an explicit development-only flag; implementation and production exclusion remain to verify |
| IS025 | #25 Authoritative durable state | Delivery | Platform | P1 | #24 | Provider-dependent choices await #38 |
| IS026 | #26 Real-time state and reconnect | Delivery | Platform | P1 | #24, #25 | Snapshot and lost-connection integration |
| IS027 | #27 Deletion and privacy | Delivery | Platform | P1 | #24, #25 | Decision blocked: regional requirements and retention review |
| IS028 | #28 Accessible battle experience | Capability | Experience | P7 | Children: #29, #30, #31, #32, #33, #34 | Cross-phase UI rollup |
| IS029 | #29 Home and collection screens | Delivery | Experience | P6 | #17, #20, #21, #24 | Full completion needs management integration |
| IS030 | #30 Selection, queue, and reveal screens | Delivery | Experience | P5 | #8, #9, #10 | Prototype early; retain reveal clarification |
| IS031 | #31 Replay and results screens | Delivery | Experience | P5 | #4, #15 | Prototype early; finish with stored awards |
| IS032 | #32 Accessible cross-browser interaction | Delivery | Experience | P7 | #22, #29, #30, #31, #34 | Full-loop browser and input evidence |
| IS033 | #33 Low-poly animals and arenas | Delivery | Experience | P7 | None | Placeholders early; art spending below $5,000 |
| IS034 | #34 Optional audio | Delivery | Experience | P7 | None | May start in parallel; no required information in audio |
| IS035 | #35 Private beta validation | Capability | Validation | P8 | Children: #36, #37, #38, #39 | Cross-phase validation rollup, not automatic release approval |
| IS036 | #36 Complete human and CPU loops | Delivery | Validation | P8 | #11, #15, #22, #30, #31 | End-to-end persistence and isolation evidence |
| IS037 | #37 Loading and animation targets | Delivery | Validation | P7 | #31, #33 | Decision blocked: representative Android model |
| IS038 | #38 Beta hosting constraints | Delivery | Validation | P1 | None | User selected Azure and a proposed $50 USD/month ceiling for review; budget approval and cost validation remain pending |
| IS039 | #39 Balance and management playtests | Delivery | Validation | P8 | #6, #11, #15, #22, #31 | Record findings; do not invent participant counts or pass thresholds |

## Coverage

Project-local workstreams are recommendations derived from intended capability
grouping, not existing component labels. Every issue currently has only the
enhancement label; using labels alone would conceal area coverage.

| Workstream | Capability items | Delivery items | Total | Roadmap coverage |
|------------|------------------|----------------|-------|------------------|
| Combat | 1 | 5 | 6 | P2, P3 |
| Matchmaking | 1 | 4 | 5 | P5 |
| Progression | 1 | 3 | 4 | P4 |
| Facilities | 1 | 6 | 7 | P6 |
| Platform | 1 | 4 | 5 | P1 |
| Experience | 1 | 6 | 7 | P5, P6, P7 |
| Validation | 1 | 4 | 5 | P1, P7, P8 |
| Total | 7 | 32 | 39 | All eight phases |

Actual GitHub hierarchy is flat: 39 issues with no parent, no children, and no
native type. The intended seven groups contain 32 delivery children, but zero
links are established. Do not call these actual orphaned stories or features;
those native levels are not modeled here. The original 32 deferred Links remain
outside this plan and require separate relationship validation and approval.

The historical GDD traceability maps all included areas to the existing backlog.
No new requirement or issue is proposed. This pass does not claim an independent
full-document gap audit. Outstanding gaps are decision/evidence gaps recorded in
the original analysis and issue bodies, not proof that new issues are needed.

## Capacity and triage

| Phase | Delivery count | Capability count | Total |
|-------|----------------|------------------|-------|
| P1 | 5 | 1 | 6 |
| P2 | 3 | 0 | 3 |
| P3 | 2 | 1 | 3 |
| P4 | 3 | 1 | 4 |
| P5 | 6 | 1 | 7 |
| P6 | 7 | 1 | 8 |
| P7 | 4 | 1 | 5 |
| P8 | 2 | 1 | 3 |
| Total | 32 | 7 | 39 |

Each issue is assigned to the repository milestone matching its completion
phase. The eight milestones have no due dates; they organize delivery scope
without implying a schedule.

GitHub issues have no native effort field. Item counts are not estimates, and
32 delivery issues are not 32 equal-sized units. There are no assignees, team
capacity, dates, completed items, or original/remaining effort records from which
to calculate utilization, velocity, burndown, or a release forecast.

All 39 open issues lack a triage label, meeting the platform's initial-state
heuristic (100%, above the 50% threshold). Recommend a triage/readiness pass
before any phase is committed. This heuristic does not mean the bodies are empty:
all have descriptions, acceptance checklists, and source links.

## Readiness assessment

No issue is promoted to Ready by this pass. All seven completeness dimensions
were considered against the hydrated bodies at their intended local role:

| Dimension | Evidence and remaining work |
|-----------|-----------------------------|
| User identification | Player/account context is explicit or inferable for delivery items; confirm beneficiary/context for internal validation and capability rollups |
| Problem statement | Capability or technical goal is present in every body; confirm the internal validation problem where it is only implicit |
| Evidence source | Every body links to the GDD; prototype rules are design proposals, not user-research or playtest evidence |
| Success criteria | Many numerical behaviors are measurable; capability rollups mostly delegate success to children, and #39 specifies evaluation topics without outcome thresholds |
| Acceptance criteria | Every issue has a checklist; implementation/validation items generally have testable behavior, while #5/#6/#24/#27/#37/#38 retain unresolved inputs or decisions |
| Dependencies | Most bodies do not enumerate completion predecessors; the register preserves dependencies from the original local plan for review |
| Scope boundaries | Explicit exclusions are uneven across bodies; confirm boundaries against the GDD's deferred scope rather than inventing exclusions |

The register's Additional grooming column supplies issue-specific findings on
top of these shared checks. Capability rows need capability-level success and
scope review; do not pad them with duplicate child criteria. Delivery rows need
dependency, scope, and decision review appropriate to their existing concern.
No artificial story points, decomposition, or new acceptance criteria are added.

## Dependencies and decision gates

Principal completion chains:

* #2 -> #3 -> #4 -> #15 -> #11 -> #36
* #2 -> #5 -> #6 -> #39
* #24 -> #25 -> #13 -> #14 -> #10 -> #9 -> #30 -> #36
* #24/#25 -> #26 -> #11
* #24/#25 -> #17 -> #18 -> #19/#20 -> #22 -> #32
* #13/#17 -> #21 -> #22/#29
* #31/#33 -> #37

These are local dependency recommendations, not native GitHub relationships.
#38 adds a conditional gate before provider-dependent decisions in #24/#25/#26,
as required by its existing body; provider-independent prototype work need not
wait. No external issue-key blockers were found in the supplied dependency plan.
External decisions still block acceptance:

| Decision | Affected issues | Treatment |
|----------|-----------------|-----------|
| Hosting provider and cost ceiling | #38; provider-dependent platform work | Azure and a proposed $50 USD/month ceiling were selected for review; validate against workload and do not claim budget approval |
| Authentication configuration and local bypass | #24 | Target an existing Entra External ID tenant; a local-only simulated identity is selected behind an explicit development-only flag, which must be impossible to enable in production |
| Terrain affinity and weather tolerance | #5, #6 | Simulate reviewed inputs; no invented table |
| Economy, welfare, rewards, CPU reduction, and caps | #9, #13, #14, #18, #19, #20, #21, #39 | Keep proposal status through tuning and playtests |
| Pool sizing and fragmentation | #8, #39 | Evaluate rather than assume regional capacity |
| Regional age/privacy/consent and retention | #27 | Record review scope; public-launch obligations are not automatically beta approval |
| Representative Android model | #37 | Select and record before claiming performance acceptance |

## Recommended next work

1. Validate the proposed Azure hosting constraint of $50 USD/month and inspect
   the existing Entra External ID tenant setup without recording secrets.
2. Use the Azure project-planning workflow to gather requirements and propose
   an application stack for approval before scaffolding #24's identity work.
3. Prepare the fixture-based #3 -> #4 combat/replay slice, alongside early
   #30/#31 presentation learning. Full integrated completion remains later.
4. Review #5's input tables and #27's applicable requirements before their
   acceptance is claimed. Choose the #37 test device before measurements.
5. Groom shared scope/dependency gaps and confirm capacity before pulling any
   item from Backlog to Ready.

## Execution boundary

The backlog-management operation catalog does not model Project operations.
The separate Project-capable workflow completed the approved setup as
Project #20, and the user later approved eight undated repository milestones
and assignment of all 39 issues to their completion phase. The [handoff](./handoff.md)
records the remaining No Change issue contract; the [setup log](./project-setup-log.md)
and [milestone log](./milestone-setup-log.md) record mutations and manual
saved-view instructions.

<!-- markdown-table-prettify-ignore-end -->
