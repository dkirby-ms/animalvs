CREATE TABLE accounts (
  id uuid PRIMARY KEY,
  issuer text NOT NULL,
  subject text NOT NULL,
  namespace text NOT NULL CHECK (namespace IN ('local', 'entra')),
  state jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  UNIQUE (issuer, subject),
  CHECK (jsonb_typeof(state) = 'object')
);

CREATE TABLE deleted_identities (
  fingerprint text PRIMARY KEY,
  deleted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE management_transactions (
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL,
  request_hash text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, transaction_id)
);

CREATE TABLE battle_reservations (
  battle_id uuid PRIMARY KEY,
  definition jsonb NOT NULL,
  request_hash text NOT NULL,
  reward_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('reserved', 'awarded'))
);

CREATE TABLE reservation_accounts (
  battle_id uuid NOT NULL REFERENCES battle_reservations(battle_id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  PRIMARY KEY (battle_id, account_id)
);

CREATE TABLE battles (
  id uuid PRIMARY KEY REFERENCES battle_reservations(battle_id) ON DELETE CASCADE,
  record jsonb NOT NULL,
  request_hash text NOT NULL
);

CREATE TABLE reward_counters (
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  reward_date date NOT NULL,
  mode text NOT NULL CHECK (mode IN ('human', 'cpu')),
  reserved integer NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  awarded integer NOT NULL DEFAULT 0 CHECK (awarded >= 0),
  PRIMARY KEY (account_id, reward_date, mode)
);

CREATE TABLE pair_reward_counters (
  first_account uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  second_account uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  reward_date date NOT NULL,
  reserved integer NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  awarded integer NOT NULL DEFAULT 0 CHECK (awarded >= 0),
  CHECK (first_account < second_account),
  PRIMARY KEY (first_account, second_account, reward_date)
);
CREATE INDEX account_battle_lookup ON reservation_accounts(account_id, battle_id);
