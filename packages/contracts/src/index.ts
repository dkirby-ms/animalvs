import { z } from "zod";

export const animalIds = ["tiger", "lion", "bear", "hippo", "rhino", "crocodile"] as const;
export const animalId = z.enum(animalIds);
const integer = z.number().int().min(0).max(2_000_000_000);
const date = z.iso.date();
const timestamp = z.iso.datetime();
export const uuid = z.uuid();
const modifiers = z.record(z.string().max(80), z.number().finite());

export const animalSchema = z.strictObject({
  animalId, level: integer.min(1), residualXp: integer,
  welfare: integer.max(100), lastTrainingDate: date.nullable(),
});
export const facilitySchema = z.strictObject({ facilityId: z.string().min(1).max(80), level: integer });
export const purchaseSchema = z.strictObject({
  id: uuid, facilityId: z.string().min(1).max(80), targetLevel: integer.min(1),
  completesAt: timestamp, creditsSpent: integer, turnsSpent: integer,
});
export const economySchema = z.strictObject({
  credits: integer, turns: integer.max(48), lastResetDate: date,
});
export const accountSchema = z.strictObject({
  id: uuid, displayName: z.string().min(1).max(40), revision: integer,
  economy: economySchema, animals: z.array(animalSchema).length(6),
  facilities: z.array(facilitySchema), pendingPurchases: z.array(purchaseSchema),
}).superRefine((account, ctx) => {
  for (const [label, ids] of [
    ["animals", account.animals.map(animal => animal.animalId)],
    ["facilities", account.facilities.map(facility => facility.facilityId)],
    ["purchases", account.pendingPurchases.map(purchase => purchase.id)],
  ] as const) {
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", message: `Duplicate ${label} are not allowed.` });
    }
  }
});
export const profileCommandSchema = z.strictObject({
  transactionId: uuid, expectedRevision: integer,
  displayName: z.string().trim().min(1).max(40).regex(/^[\p{L}\p{N} _.-]+$/u),
});
export const deletionCommandSchema = z.strictObject({ confirmation: z.literal("DELETE") });

export const matchmakingStatusSchema = z.enum([
  "idle", "queued", "proposed", "accepted", "declined", "cancelled", "expired",
]);
export const matchmakingStateSchema = z.strictObject({
  revision: integer,
  status: matchmakingStatusSchema,
  matchId: uuid.nullable(),
  expiresAt: timestamp.nullable(),
  accepted: z.boolean(),
}).superRefine((state, ctx) => {
  const active = state.status === "proposed" || state.status === "accepted";
  if (
    (active && state.matchId === null) ||
    (state.status === "proposed" && state.expiresAt === null) ||
    (state.status === "accepted" && (state.expiresAt !== null || !state.accepted)) ||
    (!active && (state.matchId !== null || state.expiresAt !== null || state.accepted))
  ) {
    ctx.addIssue({ code: "custom", message: "Matchmaking state fields do not match its lifecycle status." });
  }
});
export const matchmakingRevisionCommandSchema = z.strictObject({ expectedRevision: integer });
export const matchmakingProposalCommandSchema = z.strictObject({
  expectedRevision: integer, matchId: uuid,
});

export const lockedChoiceSchema = z.strictObject({
  accountId: uuid.nullable(), animalId, level: integer.min(1),
  statistics: z.strictObject({ vitality: integer, power: integer, guard: integer, speed: integer }),
  facilityBonuses: modifiers, readinessBonuses: modifiers, xpModifier: z.number().min(0).max(10),
});
export const battleEventSchema = z.strictObject({
  sequence: integer, kind: z.string().min(1).max(80),
  actor: z.enum(["first", "second", "system"]), text: z.string().max(1000),
  values: modifiers,
});
export const awardSchema = z.strictObject({
  accountId: uuid, animalId, xp: integer, credits: integer,
});
export const battleDefinitionSchema = z.strictObject({
  id: uuid, mode: z.enum(["human", "cpu"]), cpuProfileId: z.string().min(1).max(80).nullable(),
  choices: z.tuple([lockedChoiceSchema, lockedChoiceSchema]),
  weather: z.string().min(1).max(80), terrain: z.string().min(1).max(80),
  conditionModifiers: modifiers,
  rulesVersions: z.strictObject({ combat: z.string().min(1), rewards: z.string().min(1) }),
  seed: z.string().min(1).max(256),
});
export const battleSchema = battleDefinitionSchema.extend({
  events: z.array(battleEventSchema).max(10000),
  outcome: z.enum(["first", "second", "draw"]), awards: z.array(awardSchema).max(2),
  completedAt: timestamp,
}).superRefine((battle, ctx) => {
  const first = battle.choices[0].accountId;
  const second = battle.choices[1].accountId;
  if (!first || (battle.mode === "human" ? !second || second === first || battle.cpuProfileId !== null
    : second !== null || !battle.cpuProfileId)) {
    ctx.addIssue({ code: "custom", message: "Invalid battle participants or CPU profile." });
  }
  if (battle.events.some((event, index) => event.sequence !== index)) {
    ctx.addIssue({ code: "custom", message: "Events must be contiguous and ordered from zero." });
  }
  const awarded = new Set<string>();
  for (const award of battle.awards) {
    if (![first, second].includes(award.accountId) || awarded.has(award.accountId) ||
        !battle.choices.some(choice => choice.accountId === award.accountId && choice.animalId === award.animalId)) {
      ctx.addIssue({ code: "custom", message: "Awards must belong to distinct human participants." });
    }
    awarded.add(award.accountId);
  }
});
export const snapshotSchema = z.strictObject({
  account: accountSchema,
  matchmaking: matchmakingStateSchema,
  battles: z.array(battleSchema),
  pendingBattles: z.array(battleDefinitionSchema),
  serverTime: timestamp,
});

/** Account-scoped matchmaking state with a revision independent from account progress. */
export type MatchmakingState = z.infer<typeof matchmakingStateSchema>;
/** Authoritative snapshot read from PostgreSQL; never a client write payload. */
export type Snapshot = z.infer<typeof snapshotSchema>;
/** Server-authored replay record, including frozen inputs and ordered results. */
export type Battle = z.infer<typeof battleSchema>;
/** Persisted player projection, with monotonic revision for stale-action checks. */
export type PlayerAccount = z.infer<typeof accountSchema>;
