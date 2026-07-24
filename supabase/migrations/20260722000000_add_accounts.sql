-- Adds an "Accounts" concept to the app: Nedbank/Capitec/Cash-style
-- accounts with a manually-maintained balance (no live bank feed is
-- available), plus a special 'savings' account type that represents the
-- existing Savings Tracker feature rather than storing its own balance.
--
-- For type = 'savings': the `balance` column is NOT used. The real balance
-- is always computed from savings_transactions (as the Savings Tracker
-- page already does) so there is exactly one source of truth for it.
--
-- For type = 'bank' / 'cash' / 'other': `balance` is manually maintained
-- by the user in the Accounts tab, since there's no live feed to derive it
-- from automatically.

CREATE TYPE public.account_type AS ENUM ('bank', 'savings', 'cash', 'other');

CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type public.account_type NOT NULL DEFAULT 'bank',
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    icon TEXT DEFAULT 'Landmark',
    color TEXT DEFAULT '#2563EB',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name)
);

-- Link transactions to the account they were paid from/into. Nullable so
-- existing transactions (created before this feature) remain valid.
ALTER TABLE public.transactions
  ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;

CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_accounts"
ON public.accounts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
