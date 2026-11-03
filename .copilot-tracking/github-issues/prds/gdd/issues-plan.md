<!-- markdownlint-disable-file -->
<!-- markdown-table-prettify-ignore-start -->

# Issues Plan - Animal VS GDD

* Destination: `dkirby-ms/animalvs`
* Source: [Animal VS game design document](../../../../docs/gdd.md)
* Planning lens: generic platform-native
* Autonomy for a later execution pass: partial
* Status: all 39 Creates complete and verified; native types omitted by approval; Links deferred
* Executor: GitHub Backlog Executor, selected as a substitute at the user's request

## Payload Contract

Each row and its corresponding fenced body define one planned Create operation.
The eventual dispatch must use the exact title and type in the row, the full
corresponding body, and these validated fields:

```json
{
  "method": "create",
  "owner": "dkirby-ms",
  "repo": "animalvs",
  "title": "<title from the row>",
  "body": "<contents of the corresponding body block>",
  "labels": ["enhancement"],
  "type": "<Feature or Task from the row>"
}
```

The angle-bracketed descriptions are instructions for assembling a payload, not
values to send. Omit milestones, assignees, and parent fields. All current
`parent` values are `none`; the intended grouping below is planning metadata
only. Remove planning identifiers and temporary keys from any platform-visible
content. The issue bodies below contain no planning identifiers.

Execution override approved by the user on 2026-11-02: omit the `type` field.
REST type discovery lists Feature and Task, but repository GraphQL issueTypes
is null and existing issues have no native type. Preserve the planned hierarchy
in these local records and use the confirmed `enhancement` label on all Creates.
No new labels or relationship operations are authorized by this override.

Review flags:

* `H`: sub-issue support and the indicated parent-child relationship are
  unverified. Keep the actual plan flat and do not link until validated.
* `M`: no repository milestone or strategy was found. Milestone is omitted and
  assignment remains unclassified.
* `P`: numerical rules or targets are prototype proposals, not validated
  balance results.
* `R`: a source decision or table needed by this item remains open.
* `C`: the user's clarification is recorded here, but the original GDD has
  not yet been reconciled.

Every Feature has at least two intended Task children. Because no sub-issue
relationship has been observed in this repository, parent bodies do not claim
that children are already linked. After capability validation, a separately
reviewed execution pass can create links and reconcile parent Children sections.
Dependencies below are completion and integration guidance, not GitHub links;
prototype work can begin earlier with fixtures where appropriate.

## Planned Creates

| Reference | Temporary key | Type | Title | Intended parent | Dependencies | Review |
|-----------|---------------|------|-------|-----------------|--------------|--------|
| IS001 | `{{TEMP-1}}` | Feature | `feat(combat): deliver reproducible animal battles` | none | none | H, M, P |
| IS002 | `{{TEMP-2}}` | Task | `feat(combat): model starter animals and locked statistics` | IS001 | none | H, M, P, C |
| IS003 | `{{TEMP-3}}` | Task | `feat(combat): resolve simultaneous battle rounds` | IS001 | IS002 | H, M, P |
| IS004 | `{{TEMP-4}}` | Task | `feat(combat): persist deterministic battle replays` | IS001 | IS003 | H, M |
| IS005 | `{{TEMP-5}}` | Task | `feat(combat): apply terrain and weather modifiers` | IS001 | IS002 | H, M, P, R |
| IS006 | `{{TEMP-6}}` | Task | `test(combat): validate the matchup balance matrix` | IS001 | IS003, IS005 | H, M, P, R |
| IS007 | `{{TEMP-7}}` | Feature | `feat(matchmaking): offer human and CPU battles` | none | none | H, M, P |
| IS008 | `{{TEMP-8}}` | Task | `feat(matchmaking): match compatible human queue entries` | IS007 | IS002, IS024, IS025 | H, M, P, C |
| IS009 | `{{TEMP-9}}` | Task | `feat(matchmaking): provide CPU battles and fallback` | IS007 | IS003, IS008, IS010 | H, M, P |
| IS010 | `{{TEMP-10}}` | Task | `feat(matchmaking): reveal and accept proposed matchups` | IS007 | IS005, IS008, IS014 | H, M, P, C |
| IS011 | `{{TEMP-11}}` | Task | `feat(matchmaking): recover safely from disconnections` | IS007 | IS008, IS010, IS015, IS026 | H, M |
| IS012 | `{{TEMP-12}}` | Feature | `feat(progression): award persistent battle progression` | none | none | H, M, P |
| IS013 | `{{TEMP-13}}` | Task | `feat(progression): award experience and credits` | IS012 | IS002, IS025 | H, M, P |
| IS014 | `{{TEMP-14}}` | Task | `feat(progression): reserve and enforce daily reward limits` | IS012 | IS013, IS025 | H, M, P, C |
| IS015 | `{{TEMP-15}}` | Task | `feat(progression): settle battle results exactly once` | IS012 | IS004, IS014, IS025 | H, M |
| IS016 | `{{TEMP-16}}` | Feature | `feat(facilities): enable daily training management` | none | none | H, M, P |
| IS017 | `{{TEMP-17}}` | Task | `feat(facilities): initialize accounts and process UTC resets` | IS016 | IS024, IS025 | H, M, P |
| IS018 | `{{TEMP-18}}` | Task | `feat(facilities): calculate completed facility bonuses` | IS016 | IS002, IS017 | H, M, P |
| IS019 | `{{TEMP-19}}` | Task | `feat(facilities): purchase and complete facility upgrades` | IS016 | IS017, IS018, IS025 | H, M, P |
| IS020 | `{{TEMP-20}}` | Task | `feat(facilities): maintain welfare and readiness` | IS016 | IS017, IS018, IS025 | H, M, P, C |
| IS021 | `{{TEMP-21}}` | Task | `feat(facilities): train animals with daily limits` | IS016 | IS013, IS017 | H, M, P |
| IS022 | `{{TEMP-22}}` | Task | `feat(facilities): manage facilities through cards` | IS016 | IS018, IS019, IS020, IS021 | H, M, P |
| IS023 | `{{TEMP-23}}` | Feature | `feat(platform): protect and persist player progress` | none | none | H, M, R |
| IS024 | `{{TEMP-24}}` | Task | `feat(auth): authenticate players with Entra External ID` | IS023 | none | H, M, R |
| IS025 | `{{TEMP-25}}` | Task | `feat(platform): persist and authorize authoritative game state` | IS023 | IS024 | H, M |
| IS026 | `{{TEMP-26}}` | Task | `feat(platform): synchronize real-time state and reconnect` | IS023 | IS024, IS025 | H, M |
| IS027 | `{{TEMP-27}}` | Task | `feat(privacy): process deletion and privacy requirements` | IS023 | IS024, IS025 | H, M, R |
| IS028 | `{{TEMP-28}}` | Feature | `feat(ui): present an accessible animal battle experience` | none | none | H, M |
| IS029 | `{{TEMP-29}}` | Task | `feat(ui): build home and animal collection screens` | IS028 | IS017, IS020, IS021, IS024 | H, M |
| IS030 | `{{TEMP-30}}` | Task | `feat(ui): present selection matchmaking and reveal screens` | IS028 | IS008, IS009, IS010 | H, M, C |
| IS031 | `{{TEMP-31}}` | Task | `feat(ui): render battle replay and results screens` | IS028 | IS004, IS015 | H, M |
| IS032 | `{{TEMP-32}}` | Task | `test(ui): validate accessible cross-browser interaction` | IS028 | IS022, IS029, IS030, IS031, IS034 | H, M |
| IS033 | `{{TEMP-33}}` | Task | `feat(art): produce non-graphic low-poly animals and arenas` | IS028 | none | H, M |
| IS034 | `{{TEMP-34}}` | Task | `feat(audio): add optional battle audio` | IS028 | none | H, M |
| IS035 | `{{TEMP-35}}` | Feature | `feat(validation): validate and prepare the private beta` | none | none | H, M, P, R |
| IS036 | `{{TEMP-36}}` | Task | `test(e2e): verify complete human and CPU game loops` | IS035 | IS011, IS015, IS022, IS030, IS031 | H, M |
| IS037 | `{{TEMP-37}}` | Task | `test(performance): measure prototype loading and animation targets` | IS035 | IS031, IS033 | H, M, P, R |
| IS038 | `{{TEMP-38}}` | Task | `chore(beta): define private beta hosting constraints` | IS035 | none | H, M, R |
| IS039 | `{{TEMP-39}}` | Task | `test(playtest): evaluate balance progression and management` | IS035 | IS006, IS011, IS015, IS022, IS031 | H, M, P |

## Deferred Link Operations

These are intended relationships, not validated GitHub links. Every operation is
`needs_review` and must remain unexecuted until sub-issue support and the
specific relationship have been confirmed through read-only discovery.

| Reference | Intended parent | Intended child |
|-----------|-----------------|----------------|
| IS040 | IS001 | IS002 |
| IS041 | IS001 | IS003 |
| IS042 | IS001 | IS004 |
| IS043 | IS001 | IS005 |
| IS044 | IS001 | IS006 |
| IS045 | IS007 | IS008 |
| IS046 | IS007 | IS009 |
| IS047 | IS007 | IS010 |
| IS048 | IS007 | IS011 |
| IS049 | IS012 | IS013 |
| IS050 | IS012 | IS014 |
| IS051 | IS012 | IS015 |
| IS052 | IS016 | IS017 |
| IS053 | IS016 | IS018 |
| IS054 | IS016 | IS019 |
| IS055 | IS016 | IS020 |
| IS056 | IS016 | IS021 |
| IS057 | IS016 | IS022 |
| IS058 | IS023 | IS024 |
| IS059 | IS023 | IS025 |
| IS060 | IS023 | IS026 |
| IS061 | IS023 | IS027 |
| IS062 | IS028 | IS029 |
| IS063 | IS028 | IS030 |
| IS064 | IS028 | IS031 |
| IS065 | IS028 | IS032 |
| IS066 | IS028 | IS033 |
| IS067 | IS028 | IS034 |
| IS068 | IS035 | IS036 |
| IS069 | IS035 | IS037 |
| IS070 | IS035 | IS038 |
| IS071 | IS035 | IS039 |

## Planned Issue Bodies

### IS001 - body

```markdown
Deliver a server-resolved animal battle whose rules and outcomes can be explained
and reproduced. Numerical combat and balance values are prototype proposals.

## Acceptance Criteria

- [ ] Starter profiles and locked statistics follow the documented rules.
- [ ] Simultaneous combat, condition modifiers, stored replays, and balance
  evaluation meet their respective acceptance criteria.

## Related

- [Combat model](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#combat-model)
```

### IS002 - body

```markdown
Give each account the six starter animals and calculate the statistics frozen
for an automatic match. The listed numerical profiles are prototype inputs.

## Acceptance Criteria

- [ ] Bengal tiger, African lion, brown bear, hippopotamus, white rhinoceros, and
  Nile crocodile are available at level 1; each uses its documented four-stat
  profile and 240-point base budget.
- [ ] Each animal's level and XP are account-specific. Players do not allocate
  stat points, and the proposed maximum level is 20.
- [ ] For each stat, level scaling is `floor(baseStat * (1 + 0.03 * (level - 1)) + 0.5)`.
- [ ] Facility bonuses are capped at 10% per stat, readiness adds 0% or 3%,
  and maximum health is `500 + 10 * trainedVitality`.
- [ ] Losing readiness may remove its optional maximum-health bonus for a future
  match, but does not reduce baseline level-derived health or base statistics.
- [ ] Selection lock freezes level, completed facilities, readiness, and
  progression bonuses; later training, construction, or resets do not change
  that locked snapshot.

## Related

- [Statistics and levels](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#statistics-and-levels)
```

### IS003 - body

```markdown
Resolve the automatic battle on the server without a player-order or CPU
attack-order advantage. The formulas are proposed prototype rules.

## Acceptance Criteria

- [ ] Both animals start at maximum health, attempt one attack each round, and
  have their attacks calculated from the same start-of-round state before damage
  is applied simultaneously.
- [ ] Hit chance is `clamp(0.85 + 0.003 * (attackerSpeed - defenderSpeed), 0.70, 0.95)`;
  each animal uses separate hit and variation rolls every round, including misses.
- [ ] Variation is `0.95 + 0.10 * variationRoll`; a hit deals
  `max(1, floor(2 * attackerPower * variation * 100 / (100 + defenderGuard) + 0.5))`
  and a miss deals zero; remaining health is clamped to zero.
- [ ] One knockout produces a winner, simultaneous knockouts produce a draw,
  and an animal knocked out that round still lands its already-calculated hit.
- [ ] Critical hits, instant wins, and hidden comeback multipliers are absent.
- [ ] Every supported valid pairing and condition combination resolves within
  60 rounds. At the limit compare unrounded remaining health ratios by integer
  cross-multiplication; an exact tie is a draw.
- [ ] A neutral level-one tiger attacking a lion has 88% hit chance and deals
  90 damage for a successful hit with variation roll 0.5, reducing the lion
  from 1,150 to 1,060 health.

## Related

- [Resolution rules](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#resolution-rules)
```

### IS004 - body

```markdown
Persist enough server-controlled information to reproduce a completed battle
without re-rolling its outcome. Stored fixtures can exercise the replay format
before account persistence is integrated.

## Acceptance Criteria

- [ ] Generate a new combat seed only after selections are locked and all human
  participants accept; clients cannot provide combat rolls or outcomes.
- [ ] Store the seed, versioned pseudorandom generator and simulation rules,
  roster and facility-rule versions, opponent type, conditions, locked
  statistics, bonuses, and ordered event log.
- [ ] Replaying stored inputs reproduces the same events and outcome, using the
  saved terrain and weather rather than generating new conditions.
- [ ] Presentation timing or skipping a replay cannot change the stored outcome
  or award progression again.

## Related

- [Randomness and reproducibility](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#randomness-and-reproducibility)
```

### IS005 - body

```markdown
Apply server-generated terrain and weather to animal statistics without
overriding the species profile. The initial affinity and tolerance tables still
need review and tuning; do not treat unspecified values as approved balance.

## Acceptance Criteria

- [ ] Maintain a 0-to-100 terrain affinity and weather tolerance for each
  applicable animal and condition, with 50 neutral.
- [ ] Calculate `clamp(1 + (terrainAffinity + weatherTolerance - 100) / 1000, 0.90, 1.10)`
  after level, facility, and readiness bonuses.
- [ ] Multiply trained Power, Guard, and Speed by that value and round with
  `floor(value + 0.5)`; Vitality and maximum health are unchanged by conditions.
- [ ] Show server-generated weather before animal selection. Generate terrain
  only after both choices are locked and reveal it before acceptance.
- [ ] Save the conditions and resulting modifiers for the battle and show the
  relevant differences before acceptance.

## Related

- [Terrain and weather effects](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#terrain-and-weather-effects)
```

### IS006 - body

```markdown
Measure prototype balance rather than assuming equal base-stat budgets produce
equal strength. The affinity and tolerance inputs and balance targets require
review and playtesting. An initial neutral-condition matrix can precede the
full condition matrix.

## Acceptance Criteria

- [ ] Run at least 10,000 seeds for each of the 15 distinct equal-level species
  pairings at levels 1, 10, and 20 across every terrain and weather combination.
- [ ] Count a draw as half a win for each contender and test mirrors and both
  participant orderings.
- [ ] Report whether every equal-level pairing reaches a 35% to 65% score rate
  and each species reaches a 45% to 55% aggregate rate against the other five
  with identical facilities and readiness.
- [ ] Test level gaps of 1, 5, and 10; separately measure facility extremes,
  readiness on and off, environment extremes, unequal facility investment,
  decline rates, and CPU difficulty as facilities develop.
- [ ] Test the target that increasing a level does not reduce aggregate score
  against a fixed opponent, and check for ordering or CPU-role advantages.
- [ ] Tune profiles or weights rather than adding hidden handicaps, and version
  each balance change.

## Related

- [Balance targets](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#balance-targets)
```

### IS007 - body

```markdown
Let players find human opponents or choose a clearly identified CPU opponent,
while keeping matches available when human queues are sparse.

## Acceptance Criteria

- [ ] Human queueing, CPU selection and fallback, matchup acceptance, and
  disconnect recovery meet their respective acceptance criteria.
- [ ] Matchmaking considers animal level rather than facility or readiness
  bonuses, and battles do not consume management turns.

## Related

- [Matchmaking and CPU opponents](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#matchmaking-and-cpu-opponents)
```

### IS008 - body

```markdown
Match players from weather-specific regional or server pools using their
locked animal levels. Search ranges and cooldowns are prototype proposals.

## Acceptance Criteria

- [ ] Show weather before selection, hide the locked animal from other players,
  and match humans only when their queue weather agrees.
- [ ] Each entry initially accepts a level gap of at most one; after 10 seconds
  its range widens to at most two. The gap must fit both players' current ranges.
- [ ] Choose the oldest eligible queue entry as the tie-breaker. Continuing to
  wait preserves the same weather, selection, and maximum range.
- [ ] Only one active queue entry or unresolved battle is allowed per account.
  Stale matchmaking revisions cannot accept an opponent.
- [ ] Human assignment and acceptance of a CPU fallback are atomic, so the same
  player cannot receive both matches in a race.

## Related

- [Battle modes](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#battle-modes)
```

### IS009 - body

```markdown
Offer dedicated CPU battles and a voluntary fallback when Quick Battle cannot
find a suitable human. CPU reward reductions remain proposed values.

## Acceptance Criteria

- [ ] Dedicated CPU Battle starts without waiting for another player. Quick
  Battle offers a labeled CPU after 15 seconds without a suitable human; the
  player can accept, continue waiting, or cancel without silent acceptance.
- [ ] The CPU selects uniformly from the six starters at the human's locked
  level before terrain generation and without choosing a species counter to the
  human's selection.
- [ ] CPU profiles have no facility or readiness bonuses, use the same combat and
  environment rules, and accept automatically after the human confirms.
- [ ] CPU opponents are labeled in selection, reveal, battle, results, and
  history; they are not fake accounts or counted as connected human players.
- [ ] Dedicated CPU battles and fallback CPU battles use the same reduced reward
  table, with no hidden boosts or scripted outcomes.

## Related

- [CPU profiles and fairness](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#cpu-profiles-and-fairness)
```

### IS010 - body

```markdown
Reveal a locked matchup and let each human make an informed acceptance decision.

## Acceptance Criteria

- [ ] Reveal both animals, levels, terrain, weather, facility and readiness
  bonuses, and resulting condition modifiers after choices are locked.
- [ ] Show reward eligibility as provisional on the reveal; reserve and finalize
  eligibility at battle creation, then show the final result before presentation.
- [ ] Require each human to accept within 60 seconds. A decline, cancellation,
  or timeout grants no reward, clears acceptance, and returns other human
  participants to selection.
- [ ] Apply the proposed five-second retry cooldown after a decline or timeout.
  Changing an animal or weather requires canceling and starting a new selection.
- [ ] Both participants see the same revealed conditions and actual level and
  bonus differences; after battle creation they see the same battle identifier.

## Related

- [Battle modes](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#battle-modes)
```

### IS011 - body

```markdown
Recover safely from lost browser connections without replacing human opponents
or awarding a battle twice.

## Acceptance Criteria

- [ ] A queued disconnect removes the entry; reconnecting begins a fresh
  selection. Before battle creation, a disconnect cancels the proposed matchup
  and returns the other human participant to selection.
- [ ] A CPU never takes over a disconnected human's selected animal.
- [ ] After creation, simulation and eligible rewards complete even if a browser
  closes; reconnecting loads the stored battle and account snapshot.
- [ ] A persistence failure produces an explicit retryable error. A retry reuses
  the same battle ID and seed and cannot duplicate rewards.
- [ ] Queue cleanup does not delete completed battle records.

## Related

- [Disconnections and results](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#disconnections-and-results)
```

### IS012 - body

```markdown
Persist animal progression and award earned credits consistently across human
and CPU battles. The reward values and limits are proposed for playtesting.

## Acceptance Criteria

- [ ] XP, credit awards, level progression, daily reward limits, and atomic
  settlement meet their respective acceptance criteria.
- [ ] Exhausting reward eligibility does not prevent additional battles.

## Related

- [Progression](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#progression)
```

### IS013 - body

```markdown
Award XP to the animal used in a completed battle and credits to its account.
The reward table and progression rates are prototype proposals.

## Acceptance Criteria

- [ ] Human win, loss, and draw awards are respectively 30, 20, and 25 XP and
  credits. CPU awards are respectively 15, 10, and 12 XP and credits.
- [ ] Apply completed Welfare Station battle-XP bonuses and round final battle
  XP down; do not multiply credits or directed-training XP.
- [ ] Advancing from level `L` costs `100 + 25 * (L - 1)` XP; subtract each
  cost, carry remaining XP, and allow multiple levels from one award.
- [ ] Stop accumulating XP at level 20. The total required from level 1 to 20
  is 6,175 XP before bonuses.
- [ ] Credits are earned, not purchased or traded, and losses do not remove XP,
  levels, base statistics, or animals.

## Out of Scope

- Paid power, loot boxes, wagering, and real-money prizes are not planned.

## Related

- [Experience rules](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#experience-rules)
```

### IS014 - body

```markdown
Limit reward farming while allowing battles to continue after rewards are
exhausted. The limits below are prototype proposals.

## Acceptance Criteria

- [ ] Reserve at most 30 rewarded completed battles per account per UTC day
  across modes, and at most 10 per unordered pair of human accounts per UTC day.
- [ ] CPU battles use the account limit, not a human-pair limit or fake account.
  Players in one human battle may have different eligibility.
- [ ] Show eligibility provisionally at reveal; atomically reserve eligible
  slots at battle creation and show final eligibility before presentation.
- [ ] Charge reservations to the creation day's UTC date even across midnight;
  completed battles consume slots, irrecoverable failures release them, and
  declined or canceled proposals do not count.
- [ ] Continue to allow battles after a limit is reached, with a no-rewards
  notice; repeated requests for a battle cannot consume additional slots.

## Related

- [Fairness and reward limits](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#fairness-and-reward-limits)
```

### IS015 - body

```markdown
Persist a completed result, progression awards, and reward-reservation settlement
as one authoritative outcome.

## Acceptance Criteria

- [ ] Store the battle before announcing completion and atomically commit its
  result, XP, credits, and reservation settlement.
- [ ] Repeated requests, replay skips, and reconnects for the same battle cannot
  grant extra XP or credits or consume another reward slot.
- [ ] A persistence failure returns an explicit retryable error instead of a
  client-calculated result; retry with the same battle ID and seed.
- [ ] Both participants see the same battle ID and outcome, and reported
  per-player XP changes agree with the stored awards even when eligibility differs.

## Related

- [Fairness and reward limits](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#fairness-and-reward-limits)
```

### IS016 - body

```markdown
Let players develop animals and facilities with daily management turns while
keeping battles available without management participation.

## Acceptance Criteria

- [ ] Account initialization, daily reset, facility purchases, welfare, and
  directed training meet their respective acceptance criteria.
- [ ] Battles remain playable with zero turns or no remaining reward allowance.

## Related

- [Training facilities and daily management](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#training-facilities-and-daily-management)
```

### IS017 - body

```markdown
Initialize account management state and apply all due daily changes on the
server, including when a player has been offline. Starting credits are proposed.

## Acceptance Criteria

- [ ] New accounts receive six level-one animals, welfare 60 per animal,
  24 turns, 200 credits, Training HQ level 1, and Welfare Station level 1;
  other facilities are unbuilt.
- [ ] At each 00:00 UTC reset add 24 turns up to a balance of 48; missed resets
  apply without daily sign-in and never exceed the cap.
- [ ] Apply due construction, welfare decay, turn accrual, and training-limit
  rollover before a new management action or selection lock.
- [ ] Reset processing is idempotent and duplicate submissions cannot grant
  extra turns.
- [ ] Turns are account-wide, non-tradable, and not purchasable; battles,
  browsing, queueing, and replays do not consume them.

## Related

- [Daily turns and reset](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#daily-turns-and-reset)
```

### IS018 - body

```markdown
Calculate account-wide effects from completed facility levels only. Facility
values are prototype proposals.

## Acceptance Criteria

- [ ] Training HQ sets the maximum completed level of other facilities; no
  facility exceeds level 5.
- [ ] Each completed level of Strength Yard, Conditioning Pen, Defense Grounds,
  and Agility Course adds 2% to Power, Vitality, Guard, and Speed respectively,
  capped at 10% per stat before readiness.
- [ ] Each Welfare Station level adds 2% battle XP up to 10% and sets care gain
  to `20 + 2 * completedStationLevel`; it does not multiply credits or training XP.
- [ ] Pending levels provide no effects and do not satisfy purchase
  prerequisites. All six starters remain available without new unlocks.
- [ ] A built stat facility unlocks its stat-projection panel; the Welfare
  Station unlocks care and directed training.

## Related

- [Proposed facilities](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#proposed-facilities)
```

### IS019 - body

```markdown
Allow players to purchase facility construction and upgrades with turns and
earned credits. Costs and non-cancelable pending purchases are proposed rules.

## Acceptance Criteria

- [ ] For target level `T`, charge `100 * T * T` credits and `2 * T` turns for
  a non-HQ facility, or `200 * T * T` credits and `4 * T` turns for Training HQ.
- [ ] Require a build to target level 1 and an upgrade to target the next level;
  enforce level 5 and the completed HQ prerequisite without tier skipping.
- [ ] Complete an accepted operation at the next 00:00 UTC reset, retaining
  the previous completed level until then.
- [ ] Permit one pending operation per facility and concurrent operations on
  different facilities only when resources and completed prerequisites allow.
- [ ] Check prerequisites and debit resources in one server transaction.
  Concurrent or repeated requests cannot overspend or charge twice.
- [ ] Show costs and exact completion time before confirmation, disallow
  cancellation of a pending purchase, and report insufficient funds, turns,
  stale requests, and duplicates explicitly.

## Related

- [Construction and upgrades](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#construction-and-upgrades)
```

### IS020 - body

```markdown
Make animal care an optional source of readiness without removing earned
progress or preventing battles. Welfare thresholds and care costs are proposed.

## Acceptance Criteria

- [ ] Welfare begins at 60, decreases by 10 per UTC reset including offline
  days, and remains within 0 to 100.
- [ ] A care action costs one turn and 20 credits, applies the completed Welfare
  Station's gain immediately, caps welfare at 100, and rejects an already-full
  animal without charging it.
- [ ] Retrying the same care transaction cannot debit resources or grant care
  more than once.
- [ ] Welfare of at least 60 adds 3% readiness to all four statistics; lower
  welfare adds no readiness bonus.
- [ ] Removing readiness may remove its optional maximum-health bonus but never
  reduces base statistics or level-derived baseline health. Animals do not
  suffer injury or die from neglect, remain available, and start every battle at
  full current maximum health.
- [ ] Readiness is frozen at selection lock; later care or resets affect only
  future matches.

## Related

- [Welfare and readiness](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#welfare-and-readiness)
```

### IS021 - body

```markdown
Offer optional directed training using management turns and credits. Costs and
the XP grant are prototype proposals.

## Acceptance Criteria

- [ ] Training costs two turns and 30 credits and immediately grants 10 XP to
  one selected animal, using normal level costs and carryover.
- [ ] Allow at most one training action per animal per UTC day; do not apply
  the battle-XP facility multiplier.
- [ ] Retrying the same training transaction cannot debit resources or grant XP
  more than once.
- [ ] Reject training at level 20 without spending resources.
- [ ] Training cannot alter statistics already frozen in a queued or accepted
  matchup and is not required for battle participation.

## Related

- [Directed training](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#directed-training)
```

### IS022 - body

```markdown
Let players manage facilities using cards instead of a placement grid.

## Acceptance Criteria

- [ ] Each card shows completed level and effect, next-level prerequisites,
  turn and credit costs, and any pending completion date.
- [ ] Build and upgrade controls show costs and exact completion time before
  confirmation and explain that pending purchases cannot be canceled.
- [ ] Expose the stat-projection panel and care or training unlocks provided by
  completed facilities.
- [ ] Report insufficient resources, stale or duplicate requests, and failed
  purchases explicitly.

## Related

- [Management loop](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#management-loop)
```

### IS023 - body

```markdown
Protect each player's account and progress with server-authoritative state and
make recorded progress available after reconnecting.

## Acceptance Criteria

- [ ] Authentication, account authorization, durable state, real-time recovery,
  and account-deletion behavior meet their respective acceptance criteria.
- [ ] Clients cannot operate another account or submit authoritative combat,
  currency, progression, or CPU decisions.

## Related

- [Browser delivery and persistence](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#browser-delivery-and-persistence)
```

### IS024 - body

```markdown
Authenticate players with Microsoft Entra External ID using OAuth 2.0 and
OpenID Connect. Configuration and the development bypass remain design decisions.

## Acceptance Criteria

- [ ] Players can sign in to an account and recover saved progress after sign-out
  and sign-in; guest progress is not part of the first release.
- [ ] Sign-in failures are visible rather than silently replaced by local progress.
- [ ] Any explicit local-development authentication bypass is unavailable in
  production and cannot create production-valid identities.
- [ ] Account identity is available to authorize queue, battle, and management
  operations.

## Related

- [Browser delivery and persistence](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#browser-delivery-and-persistence)
```

### IS025 - body

```markdown
Keep account, management, and battle data authoritative and durable across
sign-out, sign-in, and server restart.

## Acceptance Criteria

- [ ] Persist account ID and display name; per-animal levels, residual XP,
  welfare, and training date; turns, credits, resets, facility levels, and
  pending purchases.
- [ ] Persist battle participants or CPU profile, mode, locked snapshots,
  conditions, rules versions, seed, ordered events, outcome, awards, reward
  counters and reservations, and idempotent management transaction records.
- [ ] Authorize queue, battle, and management operations against the signed-in
  account; another account cannot operate them.
- [ ] Reject client-submitted authoritative levels, statistics, bonuses, turns,
  resources, completion times, CPU decisions, rolls, damage, winners, and awards.
- [ ] Never substitute local progress when authoritative server progress cannot
  be loaded; display an explicit error.

## Related

- [Browser delivery and persistence](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#browser-delivery-and-persistence)
```

### IS026 - body

```markdown
Transmit matchmaking changes in real time and restore authoritative state after
a client reconnects.

## Acceptance Criteria

- [ ] Deliver matchmaking state changes through a real-time connection.
- [ ] On reconnect, load a server-authoritative snapshot rather than assuming
  that missed events were received.
- [ ] Recover the stored battle and account state without re-running simulation
  or granting duplicate rewards.
- [ ] Report lost connections and unavailable battle results explicitly.

## Related

- [Browser delivery and persistence](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#browser-delivery-and-persistence)
```

### IS027 - body

```markdown
Limit gameplay data collection and support verified account-deletion requests.
Regional age, privacy, consent, and backup-retention requirements need review
before public launch.

## Acceptance Criteria

- [ ] Gameplay does not require precise location or real names, and battle
  history is retained while an account is active.
- [ ] After a verified deletion request, delete account-linked history,
  progression, facilities, and economy records within 30 days, subject to legally
  required retention and backup expiration.
- [ ] Review and document applicable regional age, privacy, consent, and backup
  retention requirements before public launch; the 13-and-older target alone
  is not treated as legal compliance.

## Related

- [Browser delivery and persistence](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#browser-delivery-and-persistence)
```

### IS028 - body

```markdown
Present an understandable, non-graphic browser game that players can use on
desktop and mobile without requiring sound or combat inputs.

## Acceptance Criteria

- [ ] Home, collection, selection, matchmaking, battle, and results screens
  expose their documented information and actions.
- [ ] Accessibility, supported-browser, art, and optional-audio acceptance criteria
  are satisfied.

## Related

- [Screens and user experience](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#screens-and-user-experience)
```

### IS029 - body

```markdown
Give players a home and collection view for their account, animals, and daily
management choices.

## Acceptance Criteria

- [ ] Home exposes sign-in, battle modes, turn and credit balances, and reset
  time in UTC and the player's local equivalent.
- [ ] Collection cards show all six starters, profiles, level, XP, welfare,
  readiness bonus, and next welfare decay time.
- [ ] Eligible care and directed-training actions are available from the
  collection; rejected actions show explicit reasons.
- [ ] Players can enter a battle without spending management turns.

## Related

- [Screens and user experience](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#screens-and-user-experience)
```

### IS030 - body

```markdown
Make animal selection, queueing, fallback, and matchup decisions understandable
before an automatic battle begins.

## Acceptance Criteria

- [ ] Let players choose and lock an animal; show battle mode, weather, roster
  statistics, and bonuses first while keeping terrain hidden until both choices
  are locked.
- [ ] Show search time, cancel, the CPU fallback offer, and continue-waiting
  controls without silently accepting an opponent.
- [ ] Reveal opponent type, animals, levels, terrain, bonuses, condition
  modifiers, and provisional reward eligibility before acceptance.
- [ ] Show finalized reward eligibility before presentation, and report
  canceled matches, stale actions, and lost connections explicitly.

## Related

- [Screens and user experience](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#screens-and-user-experience)
```

### IS031 - body

```markdown
Present the stored battle events and explain the result without requiring
combat inputs or depicting graphic injury.

## Acceptance Criteria

- [ ] Show animal names and levels, health bars with numeric values, and
  readable attacks, misses, impacts, knockouts, and event information.
- [ ] Each player can independently skip or use reduced-motion presentation;
  skipping reveals the stored result without canceling or awarding it again.
- [ ] Results show winner or draw, damage, hits and misses, remaining health,
  opponent type, XP, credits, and any level gained.
- [ ] Explain observed differences without claiming a single statistic
  definitively caused the outcome. Battle Again starts a fresh battle in the
  previous mode; a return to facilities is available.
- [ ] Provide a textual battle summary without forcing a screen reader to
  announce every animation.

## Related

- [Battle presentation](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#battle-presentation)
```

### IS032 - body

```markdown
Validate that the complete game loop is usable on supported desktop and mobile
browsers with keyboard, mouse, and touch.

## Acceptance Criteria

- [ ] The complete loop works with keyboard alone and at a 360-pixel viewport;
  interactive controls also work with touch and mouse.
- [ ] Visible focus indicators, readable text contrast, reduced motion, mute
  controls, and a textual result are available.
- [ ] Health and outcomes are not conveyed by color alone, and screen readers
  are not forced to announce every battle animation.
- [ ] Current stable Chrome, Edge, Firefox, and Safari show a complete
  non-graphic battle and textual result.

## Related

- [Screens and user experience](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#screens-and-user-experience)
```

### IS033 - body

```markdown
Create reusable, stylized low-poly animal and arena art while preserving a
non-graphic tone and the stated art budget.

## Acceptance Criteria

- [ ] Use placeholders during the prototype and produce readable low-poly
  representations of the six starters and varied fictional arenas.
- [ ] Distinguish species through movement and anatomy; avoid cute mascot
  proportions, human weapons, blood, wounds, death, and photorealistic injuries.
- [ ] Keep pets, deliberately helpless opponents, extinct or fantasy species,
  and human fighters out of the first-release roster.
- [ ] Reuse rigs, framing, and camera behavior where possible; facility
  management uses cards and icons rather than 3D building scenes.
- [ ] Keep total art spending below $5,000.

## Related

- [Art and audio direction](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#art-and-audio-direction)
```

### IS034 - body

```markdown
Add optional audio that supports battle presentation without carrying required
game information.

## Acceptance Criteria

- [ ] Provide short animal, movement, and impact cues and subdued music.
- [ ] Start audio only after browser-permitted user interaction and provide mute.
- [ ] Players can understand outcomes and complete the loop without sound.

## Related

- [Art and audio direction](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#art-and-audio-direction)
```

### IS035 - body

```markdown
Validate the first-release experience and prepare a small private beta with
decisions and results recorded rather than assumed.

## Acceptance Criteria

- [ ] End-to-end, supported-device, performance, balance, and playtest checks
  meet their respective documented criteria or record unresolved results.
- [ ] The private-beta cloud provider and monthly cost ceiling are decided
  before an implementation depends on them.

## Related

- [Validation and acceptance](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#validation-and-acceptance)
```

### IS036 - body

```markdown
Exercise the complete browser-to-server game loop for human and CPU opponents,
including account isolation and recovery.

## Acceptance Criteria

- [ ] Two separate browsers in compatible queues complete a human battle, and
  one player completes CPU Battle with no other human online.
- [ ] Quick Battle offers CPU fallback after 15 seconds; waiting or canceling
  never silently accepts it, and human/CPU assignment races create no duplicate.
- [ ] Both clients see the same battle ID, conditions, outcome, and consistent
  per-player XP changes; selection privacy, reveal, acceptance, decline, and
  timeout follow the documented flow.
- [ ] Another account cannot operate a player's queue, match, or facilities.
- [ ] Closing a browser after battle creation, reconnecting, and skipping replay
  do not lose the stored result or duplicate progression.
- [ ] Progress, balances, turns, and pending upgrades survive sign-out,
  sign-in, and server restart; battles remain playable with no turns or rewards.

## Related

- [End-to-end acceptance](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#end-to-end-acceptance)
```

### IS037 - body

```markdown
Measure the prototype against its documented loading and animation targets.
The representative Android model remains to be selected.

## Acceptance Criteria

- [ ] On a 10 Mbps connection with 100 ms latency, measure time to a playable
  home screen against the five-second target.
- [ ] Measure battle presentation against at least 30 frames per second on a
  mid-range Android phone from roughly 2021 and record the specific test model.
- [ ] Measure a battle presentation against the usual 20-to-60-second target and
  a handful-of-matches session against the approximate two-to-five-minute target.
- [ ] Record the results and any unmet target as prototype evidence, not as an
  already-validated release claim.

## Related

- [End-to-end acceptance](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#end-to-end-acceptance)
```

### IS038 - body

```markdown
Resolve the hosting constraints for a small private beta before selecting an
implementation that depends on them.

## Acceptance Criteria

- [ ] Select a cloud provider and a monthly private-beta cost ceiling for review.
- [ ] Record the chosen provider and ceiling alongside the goal of minimizing
  monthly hosting costs; do not claim that a budget has already been approved.

## Related

- [Browser delivery and persistence](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#browser-delivery-and-persistence)
```

### IS039 - body

```markdown
Playtest whether players enjoy and understand automatic battles and whether
daily management is engaging without feeling like mandatory welfare upkeep.

## Acceptance Criteria

- [ ] Evaluate CPU difficulty as facilities develop, human queue times and
  weather-pool fragmentation, progression pace, and reward limits.
- [ ] Evaluate outcome clarity, facility disparity and decline rates, daily-turn
  choices, and whether welfare upkeep feels like a chore.
- [ ] Record findings and use them to review proposed tuning and whether a
  future equal-level mode is warranted; do not introduce that mode into the
  first release without a separate decision.

## Related

- [Development milestones](https://github.com/dkirby-ms/animalvs/blob/main/docs/gdd.md#development-milestones)
```

<!-- markdown-table-prettify-ignore-end -->
