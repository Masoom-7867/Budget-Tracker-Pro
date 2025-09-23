-- Location: supabase/migrations/20250923124056_budget_tracker_complete.sql
-- Schema Analysis: Fresh project - no existing database functionality detected
-- Integration Type: NEW_MODULE - Creating complete financial management database
-- Dependencies: none (fresh schema creation)

-- =====================================
-- 1. Extensions & Types
-- =====================================

-- Create types for categories and transactions
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');
CREATE TYPE public.category_type AS ENUM ('income', 'expense');
CREATE TYPE public.user_role AS ENUM ('admin', 'user');
CREATE TYPE public.budget_period AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');

-- =====================================
-- 2. Core Tables (no foreign keys)
-- =====================================

-- Critical intermediary table for auth
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type public.category_type NOT NULL,
    icon TEXT,
    color TEXT DEFAULT '#6B7280',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- 3. Dependent Tables (with foreign keys)
-- =====================================

-- Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type public.transaction_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Budget goals table
CREATE TABLE public.budget_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    budgeted_amount DECIMAL(12,2) NOT NULL CHECK (budgeted_amount >= 0),
    period public.budget_period DEFAULT 'monthly'::public.budget_period,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Savings goals table
CREATE TABLE public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    icon TEXT,
    color TEXT DEFAULT '#059669',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Savings transactions table
CREATE TABLE public.savings_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    savings_goal_id UUID REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    type public.transaction_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- 4. Indexes
-- =====================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- Categories indexes  
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_type ON public.categories(type);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_type ON public.transactions(type);

-- Budget goals indexes
CREATE INDEX idx_budget_goals_user_id ON public.budget_goals(user_id);
CREATE INDEX idx_budget_goals_category_id ON public.budget_goals(category_id);
CREATE INDEX idx_budget_goals_period ON public.budget_goals(period);

-- Savings goals indexes
CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX idx_savings_goals_target_date ON public.savings_goals(target_date);

-- Savings transactions indexes
CREATE INDEX idx_savings_transactions_user_id ON public.savings_transactions(user_id);
CREATE INDEX idx_savings_transactions_goal_id ON public.savings_transactions(savings_goal_id);
CREATE INDEX idx_savings_transactions_date ON public.savings_transactions(date);

-- =====================================
-- 5. Functions (BEFORE RLS policies)
-- =====================================

-- Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
    );
    RETURN NEW;
END;
$$;

-- Function to calculate budget spent amount
CREATE OR REPLACE FUNCTION public.calculate_budget_spent(budget_goal_id UUID)
RETURNS DECIMAL(12,2)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(SUM(t.amount), 0)
    FROM public.transactions t
    JOIN public.budget_goals bg ON bg.category_id = t.category_id
    WHERE bg.id = budget_goal_id
    AND t.type = 'expense'
    AND t.date >= bg.start_date
    AND (bg.end_date IS NULL OR t.date <= bg.end_date);
$$;

-- =====================================
-- 6. Enable RLS
-- =====================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================
-- 7. RLS Policies
-- =====================================

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for all other tables
CREATE POLICY "users_manage_own_categories"
ON public.categories
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_budget_goals"
ON public.budget_goals
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_savings_goals"
ON public.savings_goals
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_savings_transactions"
ON public.savings_transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =====================================
-- 8. Triggers
-- =====================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================
-- 9. Mock Data with Authentication
-- =====================================

DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
    
    -- Category IDs
    salary_cat_id UUID := gen_random_uuid();
    freelance_cat_id UUID := gen_random_uuid();
    food_cat_id UUID := gen_random_uuid();
    transport_cat_id UUID := gen_random_uuid();
    shopping_cat_id UUID := gen_random_uuid();
    entertainment_cat_id UUID := gen_random_uuid();
    bills_cat_id UUID := gen_random_uuid();
    healthcare_cat_id UUID := gen_random_uuid();
    
    -- Goal IDs
    emergency_goal_id UUID := gen_random_uuid();
    vacation_goal_id UUID := gen_random_uuid();
    car_goal_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@budgettracker.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@budgettracker.com', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Demo User", "role": "user"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Insert default categories for admin user
    INSERT INTO public.categories (id, name, type, icon, color, user_id) VALUES
        (salary_cat_id, 'Salary', 'income', 'Briefcase', '#059669', admin_uuid),
        (freelance_cat_id, 'Freelance', 'income', 'Code', '#2563EB', admin_uuid),
        (food_cat_id, 'Food & Dining', 'expense', 'UtensilsCrossed', '#D97706', admin_uuid),
        (transport_cat_id, 'Transportation', 'expense', 'Car', '#2563EB', admin_uuid),
        (shopping_cat_id, 'Shopping', 'expense', 'ShoppingBag', '#7C3AED', admin_uuid),
        (entertainment_cat_id, 'Entertainment', 'expense', 'Film', '#BE185D', admin_uuid),
        (bills_cat_id, 'Bills & Utilities', 'expense', 'Receipt', '#6B7280', admin_uuid),
        (healthcare_cat_id, 'Healthcare', 'expense', 'Heart', '#DC2626', admin_uuid);

    -- Insert sample transactions
    INSERT INTO public.transactions (user_id, category_id, type, amount, description, date) VALUES
        (admin_uuid, salary_cat_id, 'income', 5000.00, 'Monthly salary payment', '2025-09-15'),
        (admin_uuid, freelance_cat_id, 'income', 750.00, 'Web development project', '2025-09-12'),
        (admin_uuid, food_cat_id, 'expense', 125.50, 'Grocery shopping at Whole Foods', '2025-09-21'),
        (admin_uuid, transport_cat_id, 'expense', 65.75, 'Gas station fill-up', '2025-09-19'),
        (admin_uuid, shopping_cat_id, 'expense', 299.99, 'New laptop accessories', '2025-09-18'),
        (admin_uuid, entertainment_cat_id, 'expense', 65.00, 'Movie tickets and dinner', '2025-09-17'),
        (admin_uuid, bills_cat_id, 'expense', 1200.00, 'Monthly rent payment', '2025-09-16'),
        (admin_uuid, healthcare_cat_id, 'expense', 120.00, 'Dental checkup', '2025-09-15');

    -- Insert budget goals
    INSERT INTO public.budget_goals (user_id, category_id, name, budgeted_amount, period, start_date) VALUES
        (admin_uuid, food_cat_id, 'Food & Dining Budget', 1500.00, 'monthly', '2025-09-01'),
        (admin_uuid, transport_cat_id, 'Transportation Budget', 1000.00, 'monthly', '2025-09-01'),
        (admin_uuid, entertainment_cat_id, 'Entertainment Budget', 600.00, 'monthly', '2025-09-01'),
        (admin_uuid, shopping_cat_id, 'Shopping Budget', 800.00, 'monthly', '2025-09-01');

    -- Insert savings goals
    INSERT INTO public.savings_goals (id, user_id, name, description, target_amount, current_amount, target_date, icon, color) VALUES
        (emergency_goal_id, admin_uuid, 'Emergency Fund', 'Build a 6-month emergency fund for financial security', 15000.00, 8750.00, '2025-12-31', 'Shield', '#DC2626'),
        (vacation_goal_id, admin_uuid, 'Vacation to Europe', 'Save for a dream vacation to Europe', 5000.00, 2100.00, '2025-08-15', 'Plane', '#2563EB'),
        (car_goal_id, admin_uuid, 'Car Down Payment', 'Down payment for a reliable vehicle', 8000.00, 3200.00, '2025-10-31', 'Car', '#059669');

    -- Insert savings transactions
    INSERT INTO public.savings_transactions (user_id, savings_goal_id, type, amount, description, date) VALUES
        (admin_uuid, emergency_goal_id, 'income', 500.00, 'Monthly emergency fund contribution', '2025-09-20'),
        (admin_uuid, vacation_goal_id, 'income', 300.00, 'Vacation fund savings from bonus', '2025-09-18'),
        (admin_uuid, car_goal_id, 'income', 750.00, 'Car fund contribution from freelance', '2025-09-15'),
        (admin_uuid, emergency_goal_id, 'income', 250.00, 'Additional emergency fund boost', '2025-09-10');

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- =====================================
-- 10. Cleanup Function (for testing)
-- =====================================

CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs first
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@budgettracker.com';

    -- Delete in dependency order (children first)
    DELETE FROM public.savings_transactions WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.savings_goals WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.budget_goals WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.transactions WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.categories WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);
    
    -- Delete auth.users last
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
    
    RAISE NOTICE 'Test data cleanup completed';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;