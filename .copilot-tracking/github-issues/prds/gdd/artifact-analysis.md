<!-- markdownlint-disable-file -->
<!-- markdown-table-prettify-ignore-start -->

# Artifact Analysis - Animal VS GDD

## Source and Scope

The source is the [Animal VS game design document](../../../../docs/gdd.md).
The requested scope is the first-release game and its stated prototype and
validation work. The document explicitly distinguishes confirmed direction from
numerical proposals that still need simulation and playtesting.

The workspace currently has the GDD but no application implementation. GitHub
read-only discovery returned no existing issues. No existing issue has been
classified as a match, similar, distinct, or uncertain because none was returned.

## Initial Requirement Areas

These are source areas, not a finished issue hierarchy:

* Browser delivery, accounts, authorization, privacy, and persistent state
* Six starter animals, level-scaled statistics, conditions, and frozen selections
* Server-authoritative simultaneous combat, deterministic replay, and event logs
* Quick Battle, CPU Battle, acceptance, cancellation, and reconnect behavior
* XP, credits, reward reservations, daily limits, and idempotent settlement
* Facility cards, UTC resets, construction, welfare, and directed training
* Battle presentation, results, accessible interaction, art, and audio
* Balance simulations, end-to-end checks, performance targets, and playtesting

Explicitly deferred features remain out of scope, including ranked play, direct
challenges, an equal-level mode, additional animals, monetization, guest play,
trading, and advanced CPU tiers.

## Clarifications Confirmed by the User

### Q1: Welfare readiness and maximum health

The [confirmed design direction](../../../../docs/gdd.md#design-status) says
neglect never reduces health. The [stat formula](../../../../docs/gdd.md#statistics-and-levels)
applies readiness to Vitality, which changes maximum health; the
[welfare section](../../../../docs/gdd.md#welfare-and-readiness) protects
level-derived health while removing optional readiness bonuses. For a level-one
tiger without facilities, the stated formula gives maximum health of 1,120 with
readiness and 1,100 without it. Confirm whether losing that optional maximum-health
bonus is allowed or whether readiness must not affect health.

Decision: readiness may increase maximum health, and losing readiness may remove
that optional bonus. Base statistics, level-derived baseline health, and animal
availability remain unaffected. The source overview has not been edited.

### Q2: Reward eligibility at the reveal

The [reveal screen](../../../../docs/gdd.md#screens-and-user-experience) includes
reward eligibility before acceptance, while the
[reward rules](../../../../docs/gdd.md#fairness-and-reward-limits) determine and
reserve final eligibility at battle creation. The source does not state whether
the reveal is provisional or when creation occurs relative to acceptance.
Confirm what players see before acceptance and when eligibility becomes final.

Decision: show provisional eligibility at reveal, then reserve and finalize it
at battle creation. Display the final eligibility before battle presentation.

### Q3: Matchmaking ranges with different wait times

The [matchmaking flow](../../../../docs/gdd.md#battle-modes) widens each search
from one to two levels after 10 seconds, but does not state whether a two-level
gap is eligible when only one participant has reached 10 seconds. Confirm
whether both ranges must allow the match or the older entry's range governs it.

Decision: a match is eligible only when the level difference is within both
players' current ranges.

## Other Explicit Source Decisions

The GDD leaves affinity and tolerance tables, facility and reward tuning, pool
sizing, cloud provider and cost ceiling, authentication configuration, the
representative Android test device, regional privacy and consent requirements,
and any future equal-level mode for review. These are not treated as validated
balance claims or invented implementation choices.

| Gap | Source decision | Planned coverage |
|-----|-----------------|------------------|
| G1 | Initial terrain-affinity and weather-tolerance values are not provided. | IS005, IS006 |
| G2 | Facility costs, welfare thresholds, and training rewards require tuning. | IS018 through IS021, IS039 |
| G3 | CPU reward reduction and shared reward limits require tuning. | IS009, IS013, IS014, IS039 |
| G4 | Weather-pool fragmentation and regional/server sizing need evaluation. | IS008, IS039 |
| G5 | Facility disparities and any revised bonus caps require playtesting. | IS002, IS006, IS018, IS039 |
| G6 | The cloud provider and monthly private-beta cost ceiling are undecided. | IS038 |
| G7 | Authentication configuration and the development bypass need design. | IS024 |
| G8 | The representative Android test model is not selected. | IS037 |
| G9 | Regional age, privacy, consent, and backup-retention review is pending. | IS027 |
| G10 | Equal-level mode is deferred and is not included in first-release operations. | No create planned |

## Requirement Traceability

The issue identifiers below are local planning references, not GitHub issue
numbers. The [issue plan](./issues-plan.md) contains the detailed criteria.

| GDD sections | Planned coverage |
|--------------|------------------|
| Game concept, design status, pillars, audience, and core loop | IS001 through IS039, with user interaction in IS029 through IS032 |
| Animal eligibility, starter roster, and initial statistics | IS002, IS017, IS029, IS033 |
| Terrain and weather effects | IS005, IS006, IS010, IS030 |
| Statistics, levels, and frozen selections | IS002, IS013, IS018, IS020 |
| Resolution rules and example calculation | IS003 |
| Randomness and reproducibility | IS004, IS015 |
| Battle presentation | IS031 through IS034 |
| Experience rules | IS013, IS021 |
| Fairness and reward limits | IS008, IS010, IS013 through IS015, IS039 |
| Management loop and daily turns | IS017 through IS022, IS029 |
| Proposed facilities and construction | IS018, IS019, IS022 |
| Welfare and readiness | IS020, IS029 |
| Directed training | IS021, IS029 |
| Battle modes, CPU fairness, and disconnections | IS008 through IS011, IS026, IS030 |
| Screens and user experience | IS022, IS029 through IS032 |
| Art and audio direction | IS033, IS034 |
| Browser delivery, persistence, authentication, and privacy | IS024 through IS027, IS015, IS032, IS038 |
| First-release included scope | IS001 through IS039 |
| First-release deferred scope | Explicit non-goals; no create planned |
| Combat, progression, facility, and economy checks | IS002 through IS006, IS013 through IS021, IS036 |
| Balance targets | IS006, IS039 |
| End-to-end acceptance | IS011, IS015, IS026, IS030 through IS032, IS036 |
| Development milestones | IS002 through IS006, IS008 through IS039 |
| Decisions still to review | G1 through G10 above |

The source's eight development milestones inform sequencing, not GitHub milestone
assignments. The proposed numerical rules remain prototype values until simulation
and playtesting validate them. The three user-confirmed clarifications are recorded
here and in the relevant issue bodies; the original GDD has not been changed.

## Platform Constraints

`Feature` and `Task` issue types are available, but sub-issue support has not
been observed in this empty repository. Any hierarchy or relationship must be
flattened and marked `needs_review` until read-only evidence validates it.
No milestone exists to recommend, and the repository override lookup returned
HTTP 404; milestone assignment remains unclassified.

The only proposed issue label is the validated `enhancement` label. The available
`accessibility` and `documentation` labels are not needed by the proposed payloads.
The source file in the current GitHub default branch has the same Git blob as the
tracked workspace copy. No existing issue pairs were available for similarity
classification.

<!-- markdown-table-prettify-ignore-end -->
