<!-- markdownlint-disable-file -->
<!-- markdown-table-prettify-ignore-start -->

# Handoff - Animal VS Private Beta Project Plan

* Destination: GitHub `dkirby-ms/animalvs`
* Project owner: `dkirby-ms`
* User-selected scope: new Project; existing issues only; undated private-beta roadmap
* Autonomy: partial
* Status: Project setup and approved phase milestone assignments complete; no
  other issue mutations are authorized
* Plan: [Project blueprint and issue register](./sprint-plan.md)
* State: [Planning log](./planning-log.md)

## Existing issue contract

IS001 through IS039 in the plan map one-to-one to issues #1 through #39.
Every row's backlog operation is No Change. There are no issue Create, Update,
Close, Link, or Comment payloads. Do not replay the original GDD Creates.
The user later authorized and completed assignment of each existing issue to
the repository milestone matching its Delivery phase. Do not add labels, native
types, assignees, or parent-child links. The original 32 deferred Links remain
outside this handoff.

## Reuse assessment

The following assessment applies to each same-numbered IS001-IS039 / #1-#39
pair, using the original planned issue and its fully hydrated live counterpart.
The full per-pair keys and outcomes are in the plan's complete issue register.

| Aspect | Evidence for all 39 pairs |
|--------|---------------------------|
| Summary overlap | Exact title identity against the original issue plan |
| Item-type compatibility | Native type omitted on live issues; preserve the existing flat issue and local intended role rather than assign a type |
| Status | All are open; none is a closed replacement candidate |
| Label and field overlap | At planning time, all carried enhancement, no assignee, and no milestone; phase milestones were assigned later |
| Acceptance-criteria coverage | Full bodies match their original payloads, including acceptance checklists and source links |
| Hierarchy fit | Same intended local roles; all currently flat, with grouping only in planning metadata |

Category: Match for reuse, for all 39 pairs. Action: No Change to issue bodies
or other metadata; phase-milestone assignments are recorded separately.
This assessment does not assert that every item is implementation-ready.
No pair is Similar or Uncertain, and no merge or split is recommended.

## Project and milestone setup

The user approved and completed a separate Project-capable setup:

1. Create public Project #20 named `Animal VS - Private Beta`.
2. Link it to `dkirby-ms/animalvs`.
3. Add existing issues #1-#39 without creating duplicates.
4. Configure the project-local fields and initial values; all issues start in Backlog and none is marked Ready.
5. Verify the 39 memberships and field assignments. The GitHub CLI does not
   create saved views; manual view instructions are in `project-setup-log.md`.
6. Create eight undated repository milestones matching P1-P8 and assign each
   issue to its Delivery phase milestone.

Project setup was completed through a separate validated GitHub CLI workflow;
it was not dispatched as invented `backlog-execute` issue operations.

The earlier setup approval is recorded in the planning log.
See `project-setup-log.md` for the public Project details and manual view steps.

For later supported issue changes, the next command is `/hve-core:backlog-execute`
with this handoff only after a separately reviewed issue-operation amendment.
As written, this handoff contains no issue operations to apply. Project setup
and phase-milestone assignment are complete; see `project-setup-log.md` and
`milestone-setup-log.md` for verified results.

## Review and blockers

* [X] Review the eight phases, issue membership, intended grouping, and dependency recommendations.
* [X] Confirm the project name and visibility.
* [X] Approve a validated Project-capable setup workflow before publication.

Unchecked review items block execution. Readiness decisions remain in the
existing issues; no inferred approval, new requirement, or release commitment
is created by approving Project organization.

<!-- markdown-table-prettify-ignore-end -->
