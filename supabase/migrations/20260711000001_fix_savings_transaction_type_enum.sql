-- The savings-tracker UI (add/withdraw money, history display, balance
-- calculations) is built entirely around 'deposit' / 'withdrawal' as the
-- transaction type - see src/pages/savings-tracker/index.jsx and
-- SavingsHistory.jsx. But savings_transactions.type was defined using the
-- shared `transaction_type` enum, which only allows 'income' / 'expense'.
-- That mismatch is why adding money fails with:
--   invalid input value for enum transaction_type: "deposit"
--
-- Fix: give savings_transactions its own enum with the values the frontend
-- actually sends, and migrate any existing seed rows across.

CREATE TYPE public.savings_transaction_type AS ENUM ('deposit', 'withdrawal');

ALTER TABLE public.savings_transactions
  ALTER COLUMN type DROP DEFAULT,
  ALTER COLUMN type TYPE public.savings_transaction_type
    USING (
      CASE type::text
        WHEN 'income' THEN 'deposit'
        WHEN 'expense' THEN 'withdrawal'
      END
    )::public.savings_transaction_type;
