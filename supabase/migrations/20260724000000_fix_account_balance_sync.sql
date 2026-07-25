-- Bug fix: adding/editing/deleting a transaction against a bank/cash
-- account never actually adjusted that account's balance - `balance` was
-- only ever touched by the user manually on the Accounts page.
--
-- Fix with a trigger (not application code) so it's correct regardless of
-- which path creates/changes a transaction: manual add, the edit modal,
-- CSV bulk import, or anything added later.
--
-- Deliberately skips accounts of type 'savings': that balance is always
-- computed live from savings_transactions (see accounts page), never
-- from this column, so adjusting it here would just be a harmless no-op
-- that's never read - but we exclude it explicitly for clarity.

CREATE OR REPLACE FUNCTION public.adjust_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  old_effect DECIMAL(12,2);
  new_effect DECIMAL(12,2);
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.account_id IS NOT NULL THEN
      new_effect := CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END;
      UPDATE public.accounts
      SET balance = balance + new_effect
      WHERE id = NEW.account_id AND type != 'savings';
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverse whatever the row used to contribute, then apply what it
    -- contributes now - correctly handles amount, type, or account changing.
    IF OLD.account_id IS NOT NULL THEN
      old_effect := CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END;
      UPDATE public.accounts
      SET balance = balance - old_effect
      WHERE id = OLD.account_id AND type != 'savings';
    END IF;
    IF NEW.account_id IS NOT NULL THEN
      new_effect := CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END;
      UPDATE public.accounts
      SET balance = balance + new_effect
      WHERE id = NEW.account_id AND type != 'savings';
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.account_id IS NOT NULL THEN
      old_effect := CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END;
      UPDATE public.accounts
      SET balance = balance - old_effect
      WHERE id = OLD.account_id AND type != 'savings';
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_adjust_account_balance ON public.transactions;
CREATE TRIGGER trg_adjust_account_balance
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.adjust_account_balance();

-- One-time correction: apply the net effect of every transaction that was
-- already linked to a bank/cash/other account before this trigger existed,
-- so balances become accurate retroactively instead of only going forward.
UPDATE public.accounts a
SET balance = balance + COALESCE((
  SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
  FROM public.transactions t
  WHERE t.account_id = a.id
), 0)
WHERE a.type != 'savings';
