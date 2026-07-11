-- The savings-goal form (SavingsGoals.jsx) collects a monthly contribution
-- amount, uses it to estimate time-to-goal, and displays it on each goal
-- card - but the savings_goals table never had a matching column, causing
-- every goal creation to fail with:
--   Could not find the 'monthly_contribution' column of 'savings_goals'

ALTER TABLE public.savings_goals
  ADD COLUMN IF NOT EXISTS monthly_contribution DECIMAL(12,2) DEFAULT 0 CHECK (monthly_contribution >= 0);
