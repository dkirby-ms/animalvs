<!-- markdownlint-disable-file -->
<!-- markdown-table-prettify-ignore-start -->

# Project Setup Log - Animal VS Private Beta

## Execution Summary

* **Status**: Complete
* **Created**: 1
* **Linked**: 1
* **Fields created**: 4
* **Status options configured**: 1
* **Items added**: 39 of 39
* **Item field values applied**: 195 of 195
* **Failed**: 0
* **Skipped**: 0

## Destination Binding

* **Confirmed platform**: GitHub
* **Confirmed owner**: `dkirby-ms`
* **Confirmed repository**: `dkirby-ms/animalvs`
* **Project title**: `Animal VS - Private Beta`
* **Visibility**: Public
* **Approved scope**: create a new Project, link the repository, add existing
  issues #1-#39, configure the proposed project-local fields and initial
  values, and leave all existing issues unchanged.
* **Existing Project #19**: closed, private, untitled, empty; leave unchanged.
* **Authenticated CLI identity**: `dkirby-ms`; token scopes include `project`
  and `repo`.
* **Views**: CLI does not expose saved-view creation; manual instructions are
  recorded below.

## Operation Log

Each live mutation will be recorded here with its result before continuing.

* [2026-11-03 14:25 UTC] Create `Animal VS - Private Beta` - Success -
  Project #20, private by default, https://github.com/users/dkirby-ms/projects/20.
* [2026-11-03 14:25 UTC] Link Project #20 to `dkirby-ms/animalvs` - Command
  succeeded; GraphQL read-back confirms the repository association.
* [2026-11-03 14:26 UTC] Update the built-in Status field - Success - options
  are Backlog, Ready, In Progress, In Review, Done. Existing IDs for In
  Progress and Done were preserved.
* [2026-11-03 14:26 UTC] Create `Delivery phase` - Success -
  `PVTSSF_lAHOAeuCXc4BqBBAzhoZ-i8` with P1-P8.
* [2026-11-03 14:26 UTC] Create `Workstream` - Success -
  `PVTSSF_lAHOAeuCXc4BqBBAzhoZ-oA` with Combat, Matchmaking, Progression,
  Facilities, Platform, Experience, Validation.
* [2026-11-03 14:26 UTC] Create `Item role` - Success -
  `PVTSSF_lAHOAeuCXc4BqBBAzhoZ-ys` with Capability and Delivery.
* [2026-11-03 14:26 UTC] Create `Readiness` - Success -
  `PVTSSF_lAHOAeuCXc4BqBBAzhoZ-5I` with Needs review, Decision blocked, Ready.
* [2026-11-03 14:27 UTC] Add existing issues #1-#39 - Success - all 39 issue
  URLs were accepted by Project #20; existing issue records were not edited.
* [2026-11-03 14:31 UTC] Set five approved single-select fields on issues
  #1-#39 - Success - 195 values applied from the issue register. All statuses
  are Backlog; readiness is Decision blocked for #5, #6, #27, and #37, and
  Needs review for the remaining items.
* [2026-11-03 14:32 UTC] Pre-publication verification - Success - Project #20
  has 39 items from `dkirby-ms/animalvs`, all five field values match the
  register, repository association is present, and existing issue titles,
  bodies, states, labels, assignees, and milestones match the baseline.
* [2026-11-03 14:32 UTC] Set Project #20 visibility to Public - Command
  succeeded; read-back confirms `public: true`.
* [2026-11-03 14:32 UTC] Final verification - Success - Project #20 is public,
  linked to `dkirby-ms/animalvs`, and contains exactly issues #1-#39 with 195
  matching field values. At that verification point, issue records matched the
  saved baseline; later milestone assignments are recorded separately in
  `milestone-setup-log.md`.

## Manual View Setup

The GitHub CLI does not expose saved-view creation. To add the four proposed
views, open the Project URL and use the view menu to create each view:

1. **Delivery roadmap**: Table layout; group by Delivery phase. The P1-P8
   option order is already configured.
2. **Execution board**: Board layout; group by Status; filter Item role to
   Delivery.
3. **Decisions and grooming**: Table layout; filter Readiness to Needs review
   or Decision blocked.
4. **Capability coverage**: Table layout; group by Workstream and show both
   Item role values.

<!-- markdown-table-prettify-ignore-end -->
