CREATE TABLE matchmaking_state (
  account_id uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle', 'queued', 'proposed', 'accepted', 'declined', 'cancelled', 'expired')),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  match_id uuid,
  opponent_account_id uuid REFERENCES accounts(id),
  expires_at timestamptz,
  accepted boolean NOT NULL DEFAULT false,
  CHECK (
    (status = 'proposed' AND match_id IS NOT NULL AND opponent_account_id IS NOT NULL AND expires_at IS NOT NULL)
    OR (status = 'accepted' AND match_id IS NOT NULL AND opponent_account_id IS NOT NULL AND expires_at IS NULL)
    OR (status NOT IN ('proposed', 'accepted') AND match_id IS NULL AND opponent_account_id IS NULL AND expires_at IS NULL)
  ),
  CHECK ((status IN ('proposed', 'accepted')) OR accepted = false),
  CHECK (status <> 'accepted' OR accepted = true)
);

INSERT INTO matchmaking_state(account_id)
SELECT id FROM accounts
ON CONFLICT (account_id) DO NOTHING;
