import { createHash, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { z } from "zod";
import {
  accountSchema, animalIds, battleDefinitionSchema, battleSchema, profileCommandSchema,
  snapshotSchema, uuid, type Battle, type PlayerAccount, type Snapshot,
} from "../../../packages/contracts/src/index.js";
import type { Identity } from "./auth.js";
import { transaction } from "./database.js";
import { PlatformError } from "./errors.js";

type AccountRow = { id: string; state: unknown; revision: number };
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

/** PostgreSQL authority boundary. Only profile intent is public; gameplay mutations are trusted server calls. */
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
      return id;
    });
  }

  /** Read a consistent authoritative snapshot. Recovery never invokes a game engine or grants rewards. */
  async snapshot(accountId: string): Promise<Snapshot> {
    return transaction(this.pool, async client => {
      await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
      const result = await client.query<AccountRow>("SELECT id,state,revision FROM accounts WHERE id=$1", [accountId]);
      const row = result.rows[0];
      if (!row) throw notFound();
      const completed = await client.query<{ record: unknown }>(
        `SELECT b.record FROM battles b JOIN reservation_accounts p ON p.battle_id=b.id
         WHERE p.account_id=$1 ORDER BY b.record->>'completedAt' DESC LIMIT 50`, [accountId]);
      const pending = await client.query<{ definition: unknown }>(
        `SELECT r.definition FROM battle_reservations r JOIN reservation_accounts p USING(battle_id)
         WHERE p.account_id=$1 AND r.status='reserved' ORDER BY r.battle_id`, [accountId]);
      return snapshotSchema.parse({
        account: decode(row), battles: completed.rows.map(item => item.record),
        pendingBattles: pending.rows.map(item => item.definition), serverTime: new Date().toISOString(),
      });
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
         UNION SELECT id FROM accounts WHERE id=$1 ORDER BY account_id`, [accountId]);
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
      for (const row of related.rows) if (row.account_id !== accountId) {
        await writeAccount(client, await loadLocked(client, row.account_id));
      }
      await client.query("DELETE FROM accounts WHERE id=$1", [accountId]);
      await client.query("INSERT INTO deleted_identities(fingerprint) VALUES($1)", [fingerprint(identity)]);
    });
  }
}
