-- Adds the monthly 50/30/20 budget breakdown feature to the Budget Goals
-- page (a separate tab alongside the existing simple budget-goal list).
--
-- monthly_budgets: one row per user per calendar month, holding that
-- month's income. The 50/30/20 split is fixed and computed in the app
-- from this income value, not stored per-row.
--
-- budget_line_items: individual planned expense lines (Rent, Fuel,
-- Netflix, etc.) placed under one of the three buckets for a given
-- monthly_budgets row. `category_id` is optional and is used to help
-- auto-match this line item against the user's actual transactions for
-- that month (to work out "date paid" / whether it's on track).

CREATE TYPE public.budget_bucket_type AS ENUM ('needs', 'wants', 'debt_savings');

CREATE TABLE public.monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    monthly_income DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (monthly_income >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, month, year)
);

CREATE TABLE public.budget_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
    bucket public.budget_bucket_type NOT NULL,
    name TEXT NOT NULL,
    planned_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (planned_amount >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monthly_budgets_user_month_year ON public.monthly_budgets(user_id, year, month);
CREATE INDEX idx_budget_line_items_monthly_budget_id ON public.budget_line_items(monthly_budget_id);
CREATE INDEX idx_budget_line_items_user_id ON public.budget_line_items(user_id);

ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_monthly_budgets"
ON public.monthly_budgets
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_budget_line_items"
ON public.budget_line_items
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
