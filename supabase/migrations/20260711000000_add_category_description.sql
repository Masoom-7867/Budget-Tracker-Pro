-- The category-manager UI has a description field (add/edit form + list
-- display) that the original schema never actually had a column for,
-- causing every category insert/update to fail. This adds it.

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS description TEXT;
