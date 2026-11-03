<!-- markdownlint-disable-file -->
<!-- markdown-table-prettify-ignore-start -->

# Handoff - Animal VS GDD

* Destination: GitHub `dkirby-ms/animalvs`
* Workflow: read-only GDD-to-issue planning, followed by a separate execution pass
* Autonomy: partial
* Proposed executor: GitHub Backlog Executor, substituted at the user's request
* Tracking directory: `.copilot-tracking/github-issues/prds/gdd/`
* Dry run: not requested
* Status: all 39 Creates complete and verified; 32 Links remain deferred

## Execution Conditions

The [issue plan](./issues-plan.md) is the source of truth for titles, types,
labels, bodies, dependencies, and review flags. A future dispatch must supply
the confirmed destination, sanitized operation set, workflow classification,
autonomy, tracking directory, and any requested dry-run flag. The executor must
activate `backlog-execute` and honor the human-review gate and partial-autonomy
confirmation for each create and link.

All creates currently have `parent: none` and no milestone. Sub-issue support
and every intended link remain `needs_review`. Do not execute a Link unless
read-only discovery validates the relationship, both endpoints exist, and the
user approves it. Do not create an issue solely to test hierarchy support.

Before any later execution, refresh issue discovery and type and label
validation. Pause for review if new matching or uncertain existing work is
found. Apply all six backlog content-sanitization guards to the assembled
platform-bound payloads. Internal references and temporary keys are not issue
body content.

## Planned Operations

### Create

Every Create is `needs_review`: intended hierarchy is unverified and milestones
are unclassified. The issue plan identifies additional prototype, source-gap,
and GDD-clarification flags for individual items.

* [x] IS001 - Create - `{{TEMP-1}}` - Deliver reproducible animal battles
* [x] IS002 - Create - `{{TEMP-2}}` - Model starter animals and locked statistics
* [x] IS003 - Create - `{{TEMP-3}}` - Resolve simultaneous battle rounds
* [x] IS004 - Create - `{{TEMP-4}}` - Persist deterministic battle replays
* [x] IS005 - Create - `{{TEMP-5}}` - Apply terrain and weather modifiers
* [x] IS006 - Create - `{{TEMP-6}}` - Validate the matchup balance matrix
* [x] IS007 - Create - `{{TEMP-7}}` - Offer human and CPU battles
* [x] IS008 - Create - `{{TEMP-8}}` - Match compatible human queue entries
* [x] IS009 - Create - `{{TEMP-9}}` - Provide CPU battles and fallback
* [x] IS010 - Create - `{{TEMP-10}}` - Reveal and accept proposed matchups
* [x] IS011 - Create - `{{TEMP-11}}` - Recover safely from disconnections
* [x] IS012 - Create - `{{TEMP-12}}` - Award persistent battle progression
* [x] IS013 - Create - `{{TEMP-13}}` - Award experience and credits
* [x] IS014 - Create - `{{TEMP-14}}` - Reserve and enforce daily reward limits
* [x] IS015 - Create - `{{TEMP-15}}` - Settle battle results exactly once
* [x] IS016 - Create - `{{TEMP-16}}` - Enable daily training management
* [x] IS017 - Create - `{{TEMP-17}}` - Initialize accounts and process UTC resets
* [x] IS018 - Create - `{{TEMP-18}}` - Calculate completed facility bonuses
* [x] IS019 - Create - `{{TEMP-19}}` - Purchase and complete facility upgrades
* [x] IS020 - Create - `{{TEMP-20}}` - Maintain welfare and readiness
* [x] IS021 - Create - `{{TEMP-21}}` - Train animals with daily limits
* [x] IS022 - Create - `{{TEMP-22}}` - Manage facilities through cards
* [x] IS023 - Create - `{{TEMP-23}}` - Protect and persist player progress
* [x] IS024 - Create - `{{TEMP-24}}` - Authenticate players with Entra External ID
* [x] IS025 - Create - `{{TEMP-25}}` - Persist and authorize authoritative game state
* [x] IS026 - Create - `{{TEMP-26}}` - Synchronize real-time state and reconnect
* [x] IS027 - Create - `{{TEMP-27}}` - Process deletion and privacy requirements
* [x] IS028 - Create - `{{TEMP-28}}` - Present an accessible animal battle experience
* [x] IS029 - Create - `{{TEMP-29}}` - Build home and animal collection screens
* [x] IS030 - Create - `{{TEMP-30}}` - Present selection matchmaking and reveal screens
* [x] IS031 - Create - `{{TEMP-31}}` - Render battle replay and results screens
* [x] IS032 - Create - `{{TEMP-32}}` - Validate accessible cross-browser interaction
* [x] IS033 - Create - `{{TEMP-33}}` - Produce non-graphic low-poly animals and arenas
* [x] IS034 - Create - `{{TEMP-34}}` - Add optional battle audio
* [x] IS035 - Create - `{{TEMP-35}}` - Validate and prepare the private beta
* [x] IS036 - Create - `{{TEMP-36}}` - Verify complete human and CPU game loops
* [x] IS037 - Create - `{{TEMP-37}}` - Measure prototype loading and animation targets
* [x] IS038 - Create - `{{TEMP-38}}` - Define private beta hosting constraints
* [x] IS039 - Create - `{{TEMP-39}}` - Evaluate balance progression and management

### Link

Each entry is `needs_review` and is deferred until the execution conditions above
are satisfied. The arrow points from intended parent to intended child.

* [ ] IS040 - Link - `{{TEMP-1}}` -> `{{TEMP-2}}`
* [ ] IS041 - Link - `{{TEMP-1}}` -> `{{TEMP-3}}`
* [ ] IS042 - Link - `{{TEMP-1}}` -> `{{TEMP-4}}`
* [ ] IS043 - Link - `{{TEMP-1}}` -> `{{TEMP-5}}`
* [ ] IS044 - Link - `{{TEMP-1}}` -> `{{TEMP-6}}`
* [ ] IS045 - Link - `{{TEMP-7}}` -> `{{TEMP-8}}`
* [ ] IS046 - Link - `{{TEMP-7}}` -> `{{TEMP-9}}`
* [ ] IS047 - Link - `{{TEMP-7}}` -> `{{TEMP-10}}`
* [ ] IS048 - Link - `{{TEMP-7}}` -> `{{TEMP-11}}`
* [ ] IS049 - Link - `{{TEMP-12}}` -> `{{TEMP-13}}`
* [ ] IS050 - Link - `{{TEMP-12}}` -> `{{TEMP-14}}`
* [ ] IS051 - Link - `{{TEMP-12}}` -> `{{TEMP-15}}`
* [ ] IS052 - Link - `{{TEMP-16}}` -> `{{TEMP-17}}`
* [ ] IS053 - Link - `{{TEMP-16}}` -> `{{TEMP-18}}`
* [ ] IS054 - Link - `{{TEMP-16}}` -> `{{TEMP-19}}`
* [ ] IS055 - Link - `{{TEMP-16}}` -> `{{TEMP-20}}`
* [ ] IS056 - Link - `{{TEMP-16}}` -> `{{TEMP-21}}`
* [ ] IS057 - Link - `{{TEMP-16}}` -> `{{TEMP-22}}`
* [ ] IS058 - Link - `{{TEMP-23}}` -> `{{TEMP-24}}`
* [ ] IS059 - Link - `{{TEMP-23}}` -> `{{TEMP-25}}`
* [ ] IS060 - Link - `{{TEMP-23}}` -> `{{TEMP-26}}`
* [ ] IS061 - Link - `{{TEMP-23}}` -> `{{TEMP-27}}`
* [ ] IS062 - Link - `{{TEMP-28}}` -> `{{TEMP-29}}`
* [ ] IS063 - Link - `{{TEMP-28}}` -> `{{TEMP-30}}`
* [ ] IS064 - Link - `{{TEMP-28}}` -> `{{TEMP-31}}`
* [ ] IS065 - Link - `{{TEMP-28}}` -> `{{TEMP-32}}`
* [ ] IS066 - Link - `{{TEMP-28}}` -> `{{TEMP-33}}`
* [ ] IS067 - Link - `{{TEMP-28}}` -> `{{TEMP-34}}`
* [ ] IS068 - Link - `{{TEMP-35}}` -> `{{TEMP-36}}`
* [ ] IS069 - Link - `{{TEMP-35}}` -> `{{TEMP-37}}`
* [ ] IS070 - Link - `{{TEMP-35}}` -> `{{TEMP-38}}`
* [ ] IS071 - Link - `{{TEMP-35}}` -> `{{TEMP-39}}`

## Planning Files

* [Artifact analysis and traceability](./artifact-analysis.md)
* [Issue plan and payload bodies](./issues-plan.md)
* [Planning log](./planning-log.md)

## Human Review

The user confirmed review of the proposed Creates and Links on 2026-11-02.
The original GDD has not been edited to reflect the three clarifications recorded
in the analysis. Sub-issue support and intended relationships still require
validation before any Link operation; no milestone is assigned.

AI assistance was used to prepare this handoff. The user confirmed review of the
proposed Creates and Links; this does not replace the remaining execution
validation.

* [X] Reviewed by the user for the proposed Creates and Links

<!-- markdown-table-prettify-ignore-end -->
