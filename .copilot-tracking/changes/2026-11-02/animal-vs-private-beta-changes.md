<!-- markdownlint-disable-file -->

# RPI Changes: Animal VS Private Beta

## Metadata

* Task ID: animal-vs-private-beta
* Related plan: [sprint-plan.md](../../github-issues/sprint/animal-vs-private-beta/sprint-plan.md)
* Implementation date: 2026-11-02

## Execution Status

* Status: Partial
* Declared invocation scope: P1
* Completed scope markers: Issues #38 and #24 decisions recorded for review; no `Pxx-Txx` markers exist in the supplied roadmap
* All remaining active-plan markers: P1, issues #24, #25, #26, and #27; capability rollup #23; issue #38 cost validation
* Status basis: The user selected Azure and a proposed $50 USD/month ceiling, an existing Entra External ID tenant, a local-only simulated identity, and the Azure project-planning workflow. That workflow could not run because its required workspace instructions and requirements-view tool are unavailable. Hosting cost validation, privacy review, stack approval, and implementation remain.

## Execution Summary

Issues #38 and #24 now have user-selected proposals recorded in the roadmap and GDD. The Azure project-planning workflow did not create a plan because required workspace instructions and a requirements-view tool were unavailable. No budget approval, tenant provisioning, or application implementation is claimed. The repository contains the game design document and planning artifacts, but no application implementation.

## Completed Work

### Hosting provider and cost ceiling captured for review

* Related phase or task: P1, issue #38
* Files:
  * [docs/gdd.md](../../../docs/gdd.md)
  * [.copilot-tracking/github-issues/sprint/animal-vs-private-beta/sprint-plan.md](../../github-issues/sprint/animal-vs-private-beta/sprint-plan.md)
* Behavior or functionality changed: The hosting proposal is now Azure with a proposed $50 USD/month ceiling for review; no deployment or budget approval is implied.
* Validation: Passed. Confirmed the selected provider and ceiling are recorded in both artifacts with approval and cost validation explicitly pending.

## Implementation-Time Plan Updates

### Recording the hosting proposal

* Affected plan area or markers: P1, issue #38, hosting decision gate
* What changed: Recorded the user-directed P1 implementation scope and Azure with a proposed $50 USD/month ceiling for review in the issue register, decision gate, next-work guidance, and GDD.
* Why: The user selected these constraints for review; issue #38 explicitly says not to claim that a budget has been approved.
* Triggering evidence: User answer: provider `Azure`, monthly ceiling `50`.
* User answer or decision: Azure and $50 USD/month, proposed for review only; budget approval not granted.
* Reconciliation performed: Updated the plan state, #38 grooming note, P1 hosting decision row, recommended next work, and GDD. GitHub issues were not changed.
* Planning and critique state: The roadmap remains proposed; no critique disposition is recorded.

### Recording the identity configuration direction

* Affected plan area or markers: P1, issue #24, authentication configuration and local bypass
* What changed: Recorded the selected existing Entra External ID tenant and local-only simulated identity behind an explicit development-only flag.
* Why: The user selected this design direction; issue #24 requires the bypass to be unavailable in production and unable to create production-valid identities.
* Triggering evidence: User answer: tenant setup `existing`, development authentication `local-only`.
* User answer or decision: Target an existing external tenant and use a local-only simulated identity; no tenant secrets or identifiers were supplied.
* Reconciliation performed: Updated the #24 grooming note, decision gate, next-work guidance, and GDD. Implementation and production-exclusion verification remain pending.
* Planning and critique state: The roadmap remains proposed; no critique disposition is recorded.

### Selecting the project-planning workflow

* Affected plan area or markers: P1, issue #24, application stack selection
* What changed: The Azure project-planning workflow was selected to gather requirements and propose a stack before scaffolding, but could not proceed.
* Why: The repository has no application implementation, and the GDD leaves the framework and renderer undecided.
* Triggering evidence: User answer: `azure-project-plan`.
* User answer or decision: Use the Azure project-planning workflow; stack approval remains a user gate.
* Reconciliation performed: The workflow reported that required workspace instructions and a requirements-view tool are unavailable; it created no plan. No app scaffold or implementation has started.
* Planning and critique state: The roadmap remains proposed; no critique disposition is recorded.

## Business Alignment

* None

## Validation Record

| Check | Scope | Status | Evidence or reason |
|-------|-------|--------|--------------------|
| Hosting proposal consistency | P1 | Passed | Azure and a proposed $50 USD/month ceiling are recorded in the GDD and sprint plan; approval and cost validation remain pending. |
| Identity design consistency | P1 | Passed | The existing tenant and local-only simulated identity direction are recorded; code and production-exclusion checks remain pending. |
| P1 implementation validation | P1 | Skipped | No application implementation began; identity implementation and privacy review remain unresolved. |

## Pre-Review Reconciliation

* Plan markers and task-local context: The roadmap has a P1 phase and issue register, but no task-local `Pxx-Txx` markers; the #38 and #24 decisions are recorded.
* Completed-work entries and handoff prose: Hosting and identity design directions are recorded for review; no application implementation is complete.
* Validation, blockers, remaining work, and follow-up items: Hosting cost validation, approved stack, identity implementation, privacy review, and unavailable planning workflow are recorded below.
* Review readiness: Not ready; user-owned decisions block dependent implementation.

## Blockers

* Issue #38: Validate the proposed Azure provider and $50 USD/month ceiling against the beta workload; budget approval remains outstanding before deployment commitment.
* Issue #24: Complete the Azure project plan, obtain stack approval, and verify existing-tenant sign-in plus a local-only simulated identity that cannot be enabled in production.
* Issue #27: Applicable regional age, privacy, consent, and backup-retention requirements need a defined review scope before public launch.
* Issues #25 and #26: Provider-dependent persistence and real-time/reconnect work must wait for the applicable hosting, identity, and persistence decisions.
* Stack planning: The selected Azure project-planning workflow is unavailable in this workspace because required instructions and a requirements-view tool are missing. The user must restore that workflow or authorize a manual planning fallback.

## Remaining Work

* Complete the selected Azure project-planning workflow, or use a user-approved fallback, and obtain stack approval before scaffolding issue #24.
* Resolve the issue #27 regional privacy and retention review scope.
* Implement and validate issues #25 and #26 after their dependencies are ready.
* Complete the P1 phase and capability rollup #23 only after the issue criteria are met.

## Follow-Up Items

* Canonical plan list: [sprint-plan.md](../../github-issues/sprint/animal-vs-private-beta/sprint-plan.md), `## Follow-Up Items`
* None

## Return-to-Caller State

* Implementation execution status: Partial for P1
* Declared scope and markers: P1; issues #38 and #24 decisions recorded; issue #24 implementation, #25, #26, and #27 remain, along with capability rollup #23 and issue #38 cost validation
* Validation coverage: Hosting and identity design consistency passed; application implementation checks skipped
* Blockers: Hosting cost validation/approval, unavailable stack-planning workflow, approved application stack, identity implementation, and privacy-review scope
* Current plan updates: Azure/$50 USD per month for review; existing Entra External ID tenant, local-only simulated identity, and Azure project-planning workflow selected
* Business alignment entries: None
* Planning and critique state: The roadmap remains proposed; no critique disposition is recorded.
* Follow-up items: None
* Review readiness or no-handoff reason: Not ready because P1 decisions and implementation remain incomplete.
* Continuation owner: User for the required decisions; implementation resumes after the decisions and plan state are current.
