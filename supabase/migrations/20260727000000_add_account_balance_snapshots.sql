-- Powers the Net Worth Trend report. Accounts only ever stored a *current*
-- balance, never a history - this table captures one snapshot per account
-- per calendar month, so a trend line becomes possible.
--
-- Per the user's request, this is asset-only for now: no liability account
-- type exists yet, so "net worth" here is really "total asset balance",
-- tracked going forward from whenever this feature first runs - there is
-- no way to backfill genuine historical balances that were never recorded.

CREATE TABLE public.account_balance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (account_id, year, month)
);

CREATE INDEX idx_account_balance_snapshots_user_year_month
  ON public.account_balance_snapshots(user_id, year, month);

ALTER TABLE public.account_balance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_account_balance_snapshots"
ON public.account_balance_snapshots
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
