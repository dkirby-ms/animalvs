import { createHash, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { z } from "zod";
import {
  accountSchema, animalIds, battleDefinitionSchema, battleSchema, matchmakingStateSchema,
  profileCommandSchema, snapshotSchema, uuid, type Battle, type MatchmakingState, type PlayerAccount, type Snapshot,
} from "../../../packages/contracts/src/index.js";
import type { Identity } from "./auth.js";
import { transaction } from "./database.js";
import { PlatformError } from "./errors.js";

type AccountRow = { id: string; state: unknown; revision: number };
type MatchmakingRow = {
  account_id: string; status: MatchmakingState["status"]; revision: number; match_id: string | null;
  expires_at: Date | string | null; accepted: boolean;
};
type Definition = z.infer<typeof battleDefinitionSchema>;
const notFound = () => new PlatformError(404, "not_found", "The requested player record is unavailable.");
const conflict = () => new PlatformError(409, "stale_action", "Progress changed. Reload before trying again.");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const fingerprint = (identity: Identity) => hash([identity.issuer, identity.subject]);
const dateSchema = z.iso.date();
const limitsSchema = z.strictObject({ account: z.number().int().positive(), pair: z.number().int().positive() });

function decode(row: AccountRow): PlayerAccount {
  return accountSchema.parse({ ...z.record(z.string(), z.unknown()).parse(row.state), id: row.id, revision: row.revision });
}

function matchmakingProjection(row: MatchmakingRow): MatchmakingState {
  return matchmakingStateSchema.parse({
    revision: row.revision,
    status: row.status,
    matchId: row.match_id,
    expiresAt: row.expires_at === null ? null :
      row.expires_at instanceof Date ? row.expires_at.toISOString() : new Date(row.expires_at).toISOString(),
    accepted: row.accepted,
  });
}

async function loadLocked(client: PoolClient, id: string): Promise<PlayerAccount> {
  const result = await client.query<AccountRow>("SELECT id,state,revision FROM accounts WHERE id=$1 FOR UPDATE", [id]);
  const row = result.rows[0];
  if (!row) throw notFound();
  return decode(row);
}

async function writeAccount(client: PoolClient, state: PlayerAccount) {
  const next = accountSchema.parse({ ...state, revision: state.revision + 1 });
  const { id, revision, ...body } = next;
  await client.query("UPDATE accounts SET state=$2,revision=$3 WHERE id=$1", [id, body, revision]);
  return next;
}

function participants(definition: Definition) {
  const ids = definition.choices.flatMap(choice => choice.accountId ? [choice.accountId] : []).sort();
  if (ids.length !== (definition.mode === "human" ? 2 : 1) || new Set(ids).size !== ids.length ||
      (definition.mode === "cpu" ? !definition.cpuProfileId || definition.choices[1].accountId !== null
        : definition.cpuProfileId !== null) || !definition.choices[0].accountId) {
    throw new PlatformError(422, "invalid_battle", "Invalid human participants or CPU profile.");
  }
  return ids;
}

async function expireProposal(client: PoolClient, accountId: string): Promise<void> {
  const result = await client.query<MatchmakingRow>(
    `SELECT account_id,status,revision,match_id,expires_at,accepted FROM matchmaking_state
     WHERE account_id=$1 AND status='proposed' AND expires_at <= now()`, [accountId]);
  const state = result.rows[0];
  if (!state?.match_id) return;
  const pair = await client.query<MatchmakingRow>(
    `SELECT account_id,status,revision,match_id,expires_at,accepted FROM matchmaking_state
     WHERE match_id=$1 AND status='proposed' ORDER BY account_id FOR UPDATE`, [state.match_id]);
  if (pair.rows.length !== 2) return;
  await client.query(
    `UPDATE matchmaking_state
     SET status='expired',revision=revision+1,match_id=NULL,opponent_account_id=NULL,
         expires_at=NULL,accepted=false
     WHERE match_id=$1 AND status='proposed' AND expires_at <= now()`, [state.match_id]);
}

/** PostgreSQL authority boundary for profile, matchmaking, and trusted gameplay state. */
export class PlayerStore {
  constructor(private readonly pool: Pool, private readonly namespace: "local" | "entra") {}

  /** Resolve or create a stable identity; a deleted identity cannot recreate progress implicitly. */
  async accountFor(identity: Identity): Promise<string> {
    return transaction(this.pool, async client => {
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [fingerprint(identity)]);
      const deleted = await client.query("SELECT 1 FROM deleted_identities WHERE fingerprint=$1", [fingerprint(identity)]);
      if (deleted.rowCount) throw new PlatformError(410, "account_deleted", "Application data was deleted. Contact support before creating another account.");
      const existing = await client.query<{ id: string; namespace: string }>(
        "SELECT id,namespace FROM accounts WHERE issuer=$1 AND subject=$2", [identity.issuer, identity.subject]);
      if (existing.rows[0]) {
        if (existing.rows[0].namespace !== this.namespace) throw new PlatformError(403, "identity_boundary", "Identity environment mismatch.");
        return existing.rows[0].id;
      }
      const id = randomUUID();
      const state = {
        displayName: "Player", economy: { credits: 0, turns: 24, lastResetDate: new Date().toISOString().slice(0, 10) },
        animals: animalIds.map(animalId => ({ animalId, level: 1, residualXp: 0, welfare: 0, lastTrainingDate: null })),
        facilities: [], pendingPurchases: [],
      };
      accountSchema.parse({ ...state, id, revision: 0 });
      await client.query("INSERT INTO accounts(id,issuer,subject,namespace,state) VALUES($1,$2,$3,$4,$5)",
        [id, identity.issuer, identity.subject, this.namespace, state]);
      await client.query("INSERT INTO matchmaking_state(account_id) VALUES($1)", [id]);
      return id;
    });
  }

  /** Read a consistent authoritative snapshot. Recovery never invokes a game engine or grants rewards. */
  async snapshot(accountId: string): Promise<Snapshot> {
    return transaction(this.pool, async client => {
      await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
      await expireProposal(client, accountId);
      const result = await client.query<AccountRow>("SELECT id,state,revision FROM accounts WHERE id=$1", [accountId]);
      const row = result.rows[0];
      if (!row) throw notFound();
      const matchmaking = await client.query<MatchmakingRow>(
        `SELECT account_id,status,revision,match_id,expires_at,accepted
         FROM matchmaking_state WHERE account_id=$1`, [accountId]);
      if (!matchmaking.rows[0]) throw notFound();
      const completed = await client.query<{ record: unknown }>(
        `SELECT b.record FROM battles b JOIN reservation_accounts p ON p.battle_id=b.id
         WHERE p.account_id=$1 ORDER BY b.record->>'completedAt' DESC LIMIT 50`, [accountId]);
      const pending = await client.query<{ definition: unknown }>(
        `SELECT r.definition FROM battle_reservations r JOIN reservation_accounts p USING(battle_id)
         WHERE p.account_id=$1 AND r.status='reserved' ORDER BY r.battle_id`, [accountId]);
      return snapshotSchema.parse({
        account: decode(row), matchmaking: matchmakingProjection(matchmaking.rows[0]), battles: completed.rows.map(item => item.record),
        pendingBattles: pending.rows.map(item => item.definition), serverTime: new Date().toISOString(),
      });
    });
  }

  /** Queue the authenticated account at its current matchmaking revision. */
  async enqueueMatchmaking(accountId: string, expectedRevision: number): Promise<MatchmakingState> {
    return this.updateQueueState(accountId, expectedRevision, "queued");
  }

  /** Leave a queue only when the authenticated account still owns the expected queued state. */
  async cancelMatchmaking(accountId: string, expectedRevision: number): Promise<MatchmakingState> {
    return this.updateQueueState(accountId, expectedRevision, "cancelled");
  }

  private async updateQueueState(
    accountId: string, expectedRevision: number, next: "queued" | "cancelled",
  ): Promise<MatchmakingState> {
    return transaction(this.pool, async client => {
      await client.query("SELECT id FROM accounts WHERE id=$1 FOR UPDATE", [accountId]);
      const result = await client.query<MatchmakingRow>(
        `SELECT account_id,status,revision,match_id,expires_at,accepted
         FROM matchmaking_state WHERE account_id=$1 FOR UPDATE`, [accountId]);
      const current = result.rows[0];
      if (!current) throw notFound();
      if (current.revision !== expectedRevision) throw conflict();
      if (next === "queued" && current.status === "queued") return matchmakingProjection(current);
      if (next === "cancelled" && current.status === "cancelled") return matchmakingProjection(current);
      const allowed = next === "queued"
        ? ["idle", "accepted", "declined", "cancelled", "expired"]
        : ["queued"];
      if (!allowed.includes(current.status)) throw conflict();
      const updated = await client.query<MatchmakingRow>(
        `UPDATE matchmaking_state
         SET status=$2,revision=revision+1,match_id=NULL,opponent_account_id=NULL,
             expires_at=NULL,accepted=false
         WHERE account_id=$1
         RETURNING account_id,status,revision,match_id,expires_at,accepted`, [accountId, next]);
      return matchmakingProjection(updated.rows[0]!);
    });
  }

  /**
   * Create a proposal for two accounts already in the queue.
   *
   * @returns Both account-scoped proposal states, ordered by account ID.
   * @throws A `PlatformError` when either account is missing or no longer queued.
   */
  async proposeMatch(firstAccountId: string, secondAccountId: string): Promise<MatchmakingState[]> {
    const ids = [uuid.parse(firstAccountId), uuid.parse(secondAccountId)].sort();
    if (ids[0] === ids[1]) throw new PlatformError(422, "invalid_match", "A proposal requires two different players.");
    const matchId = randomUUID();
    const expiresAt = new Date(Date.now() + 60_000);
    return transaction(this.pool, async client => {
      const accounts = await client.query<{ id: string }>(
        "SELECT id FROM accounts WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE", [ids]);
      if (accounts.rowCount !== 2) throw notFound();
      const states = await client.query<MatchmakingRow>(
        `SELECT account_id,status,revision,match_id,expires_at,accepted
         FROM matchmaking_state WHERE account_id=ANY($1::uuid[]) ORDER BY account_id FOR UPDATE`, [ids]);
      if (states.rowCount !== 2 || states.rows.some(state => state.status !== "queued")) throw conflict();
      await client.query(
        `UPDATE matchmaking_state AS state
         SET status='proposed',revision=state.revision+1,match_id=$2,
             opponent_account_id=CASE WHEN state.account_id=$3 THEN $4::uuid ELSE $3::uuid END,
             expires_at=$5,accepted=false
         WHERE state.account_id=ANY($1::uuid[])`, [ids, matchId, ids[0], ids[1], expiresAt]);
      const updated = await client.query<MatchmakingRow>(
        `SELECT account_id,status,revision,match_id,expires_at,accepted
         FROM matchmaking_state WHERE account_id=ANY($1::uuid[]) ORDER BY account_id`, [ids]);
      return updated.rows.map(matchmakingProjection);
    });
  }

  /** Accept the matching proposal only for the authenticated account and its current revision. */
  async acceptMatchmaking(
    accountId: string, matchId: string, expectedRevision: number,
  ): Promise<MatchmakingState> {
    return this.respondToProposal(accountId, matchId, expectedRevision, "accept");
  }

  /** Decline the matching proposal for both participants without exposing account identifiers. */
  async declineMatchmaking(
    accountId: string, matchId: string, expectedRevision: number,
  ): Promise<MatchmakingState> {
    return this.respondToProposal(accountId, matchId, expectedRevision, "decline");
  }

  private async respondToProposal(
    accountId: string, matchId: string, expectedRevision: number, response: "accept" | "decline",
  ): Promise<MatchmakingState> {
    uuid.parse(accountId);
    uuid.parse(matchId);
    return transaction(this.pool, async client => {
      const initial = await client.query<MatchmakingRow & { opponent_account_id: string | null }>(
        `SELECT account_id,status,revision,match_id,opponent_account_id,expires_at,accepted
         FROM matchmaking_state WHERE account_id=$1`, [accountId]);
      const initialState = initial.rows[0];
      if (!initialState?.opponent_account_id || initialState.match_id !== matchId) throw conflict();
      const ids = [accountId, initialState.opponent_account_id].sort();
      const accounts = await client.query<{ id: string }>(
        "SELECT id FROM accounts WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE", [ids]);
      if (accounts.rowCount !== 2) throw notFound();
      const locked = await client.query<MatchmakingRow & { opponent_account_id: string | null; is_expired: boolean }>(
        `SELECT account_id,status,revision,match_id,opponent_account_id,expires_at,accepted,
                expires_at <= now() AS is_expired
         FROM matchmaking_state WHERE account_id=ANY($1::uuid[]) ORDER BY account_id FOR UPDATE`, [ids]);
      const own = locked.rows.find(state => state.account_id === accountId);
      const other = locked.rows.find(state => state.account_id !== accountId);
      if (!own || !other || own.match_id !== matchId || other.match_id !== matchId ||
          own.opponent_account_id !== other.account_id || other.opponent_account_id !== own.account_id) {
        throw conflict();
      }
      if (own.status === "proposed" && own.is_expired) {
        await client.query(
          `UPDATE matchmaking_state
           SET status='expired',revision=revision+1,match_id=NULL,opponent_account_id=NULL,
               expires_at=NULL,accepted=false
           WHERE account_id=ANY($1::uuid[]) AND match_id=$2 AND status='proposed'
             AND expires_at <= now()`, [ids, matchId]);
        const expired = await client.query<MatchmakingRow>(
          `SELECT account_id,status,revision,match_id,expires_at,accepted
           FROM matchmaking_state WHERE account_id=$1`, [accountId]);
        return matchmakingProjection(expired.rows[0]!);
      }
      if (own.revision !== expectedRevision || own.status !== "proposed" ||
          other.status !== "proposed" && other.status !== "accepted") throw conflict();
      if (response === "decline") {
        await client.query(
          `UPDATE matchmaking_state
           SET status='declined',revision=revision+1,match_id=NULL,opponent_account_id=NULL,
               expires_at=NULL,accepted=false
           WHERE account_id=ANY($1::uuid[]) AND match_id=$2`, [ids, matchId]);
      } else if (other.status === "accepted" || other.accepted) {
        await client.query(
          `UPDATE matchmaking_state
           SET status='accepted',revision=revision+1,expires_at=NULL,accepted=true
           WHERE account_id=ANY($1::uuid[]) AND match_id=$2`, [ids, matchId]);
      } else if (own.accepted) {
        return matchmakingProjection(own);
      } else {
        await client.query(
          `UPDATE matchmaking_state SET revision=revision+1,accepted=true
           WHERE account_id=$1 AND match_id=$2`, [accountId, matchId]);
      }
      const updated = await client.query<MatchmakingRow>(
        `SELECT account_id,status,revision,match_id,expires_at,accepted
         FROM matchmaking_state WHERE account_id=$1`, [accountId]);
      return matchmakingProjection(updated.rows[0]!);
    });
  }

  /** Deny private battle reads to nonparticipants without revealing whether the battle exists. */
  async battle(accountId: string, battleId: string): Promise<Battle> {
    uuid.parse(battleId);
    const result = await this.pool.query<{ record: unknown }>(
      `SELECT b.record FROM battles b JOIN reservation_accounts p ON p.battle_id=b.id
       WHERE b.id=$1 AND p.account_id=$2`, [battleId, accountId]);
    if (!result.rows[0]) throw notFound();
    return battleSchema.parse(result.rows[0].record);
  }

  /** Persist an intent exactly once; conflicting reuse and stale revisions fail explicitly. */
  async profile(accountId: string, input: unknown): Promise<PlayerAccount> {
    const command = profileCommandSchema.parse(input);
    return this.management(accountId, command.transactionId, command.expectedRevision, command,
      account => ({ ...account, displayName: command.displayName }));
  }

  /**
   * Trusted gameplay transaction. The callback runs under the account lock and must have no external effects.
   * Idempotent retries return the stored result; changed requests with the same ID are rejected.
   */
  async management(accountId: string, transactionId: string, expectedRevision: number, intent: unknown,
    apply: (account: PlayerAccount) => PlayerAccount): Promise<PlayerAccount> {
    uuid.parse(transactionId);
    return transaction(this.pool, async client => {
      const account = await loadLocked(client, accountId);
      const prior = await client.query<{ request_hash: string; result: unknown }>(
        "SELECT request_hash,result FROM management_transactions WHERE account_id=$1 AND transaction_id=$2",
        [accountId, transactionId]);
      const digest = hash(intent);
      if (prior.rows[0]) {
        if (prior.rows[0].request_hash !== digest) throw new PlatformError(409, "idempotency_conflict", "Transaction ID was already used for a different action.");
        return accountSchema.parse(prior.rows[0].result);
      }
      if (account.revision !== expectedRevision) throw conflict();
      const changed = accountSchema.parse(apply(structuredClone(account)));
      if (changed.id !== account.id || changed.revision !== account.revision) throw conflict();
      const next = await writeAccount(client, changed);
      await client.query(
        "INSERT INTO management_transactions(account_id,transaction_id,request_hash,result) VALUES($1,$2,$3,$4)",
        [accountId, transactionId, digest, next]);
      return next;
    });
  }

  /**
   * Persist frozen battle inputs and reserve daily reward capacity before simulation.
   * Limits and date are server rules inputs. Locks are taken in stable account-ID order.
   */
  async reserveBattle(input: unknown, rewardDate: string, limits: z.infer<typeof limitsSchema>): Promise<void> {
    const definition = battleDefinitionSchema.parse(input);
    const ids = participants(definition);
    dateSchema.parse(rewardDate);
    limitsSchema.parse(limits);
    await transaction(this.pool, async client => {
      for (const id of ids) await loadLocked(client, id);
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [definition.id]);
      const prior = await client.query<{ request_hash: string }>("SELECT request_hash FROM battle_reservations WHERE battle_id=$1", [definition.id]);
      const digest = hash([definition, rewardDate]);
      if (prior.rows[0]) {
        if (prior.rows[0].request_hash !== digest) throw conflict();
        return;
      }
      for (const id of ids) {
        const counter = await client.query(
          `INSERT INTO reward_counters(account_id,reward_date,mode,reserved) VALUES($1,$2,$3,1)
           ON CONFLICT(account_id,reward_date,mode) DO UPDATE SET reserved=reward_counters.reserved+1
           WHERE reward_counters.reserved+reward_counters.awarded < $4 RETURNING account_id`,
          [id, rewardDate, definition.mode, limits.account]);
        if (!counter.rowCount) throw new PlatformError(409, "reward_limit", "Daily reward capacity is exhausted.");
      }
      if (ids.length === 2) {
        const counter = await client.query(
          `INSERT INTO pair_reward_counters(first_account,second_account,reward_date,reserved) VALUES($1,$2,$3,1)
           ON CONFLICT(first_account,second_account,reward_date) DO UPDATE SET reserved=pair_reward_counters.reserved+1
           WHERE pair_reward_counters.reserved+pair_reward_counters.awarded < $4 RETURNING first_account`,
          [ids[0], ids[1], rewardDate, limits.pair]);
        if (!counter.rowCount) throw new PlatformError(409, "pair_reward_limit", "Pair reward capacity is exhausted.");
      }
      await client.query("INSERT INTO battle_reservations VALUES($1,$2,$3,$4,'reserved')",
        [definition.id, definition, digest, rewardDate]);
      for (const id of ids) {
        await client.query("INSERT INTO reservation_accounts VALUES($1,$2)", [definition.id, id]);
        await writeAccount(client, await loadLocked(client, id));
      }
    });
  }

  /**
   * Atomically store a server-resolved replay and apply XP to the latest locked animal state.
   * Retries cannot grant twice. The pure callback owns game formulas and runs only on first commit.
   */
  async completeBattle(input: unknown, applyAward: (
    account: PlayerAccount, award: Battle["awards"][number],
  ) => PlayerAccount["animals"][number]): Promise<void> {
    const battle = battleSchema.parse(input);
    const ids = participants(battle);
    await transaction(this.pool, async client => {
      const accounts = new Map<string, PlayerAccount>();
      for (const id of ids) accounts.set(id, await loadLocked(client, id));
      const reserved = await client.query<{ definition: unknown; reward_date: string }>(
        "SELECT definition,reward_date::text FROM battle_reservations WHERE battle_id=$1 FOR UPDATE", [battle.id]);
      if (!reserved.rows[0]) throw new PlatformError(409, "reservation_required", "Battle must be stored before completion.");
      const definition = battleDefinitionSchema.parse(
        Object.fromEntries(Object.keys(battleDefinitionSchema.shape).map(key => [key, Reflect.get(battle, key)])));
      if (hash(definition) !== hash(battleDefinitionSchema.parse(reserved.rows[0].definition))) throw conflict();
      const digest = hash(battle);
      const prior = await client.query<{ request_hash: string }>("SELECT request_hash FROM battles WHERE id=$1", [battle.id]);
      if (prior.rows[0]) {
        if (prior.rows[0].request_hash !== digest) throw conflict();
        return;
      }
      for (const award of battle.awards) {
        const account = accounts.get(award.accountId);
        if (!account) throw conflict();
        const animal = applyAward(structuredClone(account), award);
        if (animal.animalId !== award.animalId) throw conflict();
        account.animals = account.animals.map(current => current.animalId === animal.animalId ? animal : current);
        account.economy.credits += award.credits;
      }
      for (const account of accounts.values()) await writeAccount(client, account);
      await client.query("INSERT INTO battles VALUES($1,$2,$3)", [battle.id, battle, digest]);
      await client.query("UPDATE battle_reservations SET status='awarded' WHERE battle_id=$1", [battle.id]);
      await client.query(
        `UPDATE reward_counters SET reserved=reserved-1,awarded=awarded+1
         WHERE account_id=ANY($1::uuid[]) AND reward_date=$2 AND mode=$3`, [ids, reserved.rows[0].reward_date, battle.mode]);
      if (ids.length === 2) await client.query(
        `UPDATE pair_reward_counters SET reserved=reserved-1,awarded=awarded+1
         WHERE first_account=$1 AND second_account=$2 AND reward_date=$3`,
        [ids[0], ids[1], reserved.rows[0].reward_date]);
    });
  }

  /** Immediately erase application records after authenticated confirmation; tombstone prevents implicit recreation. */
  async deleteAccount(identity: Identity, accountId: string): Promise<void> {
    await transaction(this.pool, async client => {
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [fingerprint(identity)]);
      const related = await client.query<{ account_id: string }>(
        `SELECT DISTINCT p.account_id FROM reservation_accounts p
         WHERE p.battle_id IN (SELECT battle_id FROM reservation_accounts WHERE account_id=$1)
         UNION SELECT id FROM accounts WHERE id=$1
         UNION SELECT opponent_account_id FROM matchmaking_state
           WHERE account_id=$1 AND opponent_account_id IS NOT NULL
         ORDER BY account_id`, [accountId]);
      for (const row of related.rows) await loadLocked(client, row.account_id);
      const owned = await client.query("SELECT id FROM accounts WHERE id=$1 AND issuer=$2 AND subject=$3",
        [accountId, identity.issuer, identity.subject]);
      if (!owned.rowCount) throw notFound();
      await client.query(
        `UPDATE reward_counters c SET reserved=c.reserved-released.count
         FROM (
           SELECT p.account_id,r.reward_date,r.definition->>'mode' AS mode,count(*)::int AS count
           FROM battle_reservations r JOIN reservation_accounts p USING(battle_id)
           WHERE r.status='reserved' AND r.battle_id IN
             (SELECT battle_id FROM reservation_accounts WHERE account_id=$1)
           GROUP BY p.account_id,r.reward_date,r.definition->>'mode'
         ) released
         WHERE c.account_id=released.account_id AND c.reward_date=released.reward_date AND c.mode=released.mode`, [accountId]);
      // Remove shared replay records too: they contain both participants' frozen data.
      await client.query(
        `DELETE FROM battle_reservations WHERE battle_id IN
         (SELECT battle_id FROM reservation_accounts WHERE account_id=$1)`, [accountId]);
      await client.query(
        `UPDATE matchmaking_state
         SET status='cancelled',revision=revision+1,match_id=NULL,opponent_account_id=NULL,
             expires_at=NULL,accepted=false
         WHERE account_id<>$1 AND opponent_account_id=$1`, [accountId]);
      for (const row of related.rows) if (row.account_id !== accountId) {
        await writeAccount(client, await loadLocked(client, row.account_id));
      }
      await client.query("DELETE FROM accounts WHERE id=$1", [accountId]);
      await client.query("INSERT INTO deleted_identities(fingerprint) VALUES($1)", [fingerprint(identity)]);
    });
  }
}
