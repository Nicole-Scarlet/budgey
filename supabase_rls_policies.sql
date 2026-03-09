-- =============================================================
-- COMPLETE FIX: RLS Policies for ALL tables
-- This replaces ALL previous policies. Paste into Supabase SQL Editor.
-- =============================================================

-- ============================================
-- STEP 1: Create a SECURITY DEFINER function
-- that bypasses RLS to check group membership.
-- This prevents the infinite recursion error.
-- ============================================
CREATE OR REPLACE FUNCTION get_my_group_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT group_id FROM group_members WHERE user_id = auth.uid();
$$;

-- ============================================
-- STEP 2: Drop ALL existing policies to start clean
-- ============================================

-- group_members policies
DROP POLICY IF EXISTS "Members can read group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Members can update own settings" ON group_members;
DROP POLICY IF EXISTS "Members can leave groups" ON group_members;

-- groups policies
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Members can read their groups" ON groups;
DROP POLICY IF EXISTS "Creator can update group" ON groups;

-- categories policies
DROP POLICY IF EXISTS "Users can read own and group categories" ON categories;
DROP POLICY IF EXISTS "Users can insert categories" ON categories;
DROP POLICY IF EXISTS "Users can update own and group categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own and group categories" ON categories;

-- transactions policies
DROP POLICY IF EXISTS "Users can read own and group transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own and group transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own and group transactions" ON transactions;

-- debts policies
DROP POLICY IF EXISTS "Users can read own and group debts" ON debts;
DROP POLICY IF EXISTS "Users can insert debts" ON debts;
DROP POLICY IF EXISTS "Users can update own and group debts" ON debts;
DROP POLICY IF EXISTS "Users can delete own and group debts" ON debts;

-- debt_payments policies
DROP POLICY IF EXISTS "Users can read related debt payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can insert debt payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can update related debt payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can delete related debt payments" ON debt_payments;

-- settings policies
DROP POLICY IF EXISTS "Users can read own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON settings;

-- ============================================
-- STEP 3: Enable RLS on all tables
-- ============================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: group_members policies
-- Uses auth.uid() directly (no self-reference)
-- ============================================
CREATE POLICY "Members can read group members"
    ON group_members FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR group_id IN (SELECT get_my_group_ids()));

CREATE POLICY "Users can join groups"
    ON group_members FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update own settings"
    ON group_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Members can leave groups"
    ON group_members FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- STEP 5: groups policies
-- Uses the safe function instead of subquery
-- ============================================
CREATE POLICY "Users can create groups"
    ON groups FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Members can read their groups"
    ON groups FOR SELECT
    TO authenticated
    USING (id IN (SELECT get_my_group_ids()));

CREATE POLICY "Members can update group"
    ON groups FOR UPDATE
    TO authenticated
    USING (id IN (SELECT get_my_group_ids()));

-- ============================================
-- STEP 6: categories policies
-- ============================================
CREATE POLICY "Users can read own and group categories"
    ON categories FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

CREATE POLICY "Users can insert categories"
    ON categories FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own and group categories"
    ON categories FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

CREATE POLICY "Users can delete own and group categories"
    ON categories FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

-- ============================================
-- STEP 7: transactions policies
-- ============================================
CREATE POLICY "Users can read own and group transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

CREATE POLICY "Users can insert transactions"
    ON transactions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own and group transactions"
    ON transactions FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

CREATE POLICY "Users can delete own and group transactions"
    ON transactions FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

-- ============================================
-- STEP 8: debts policies
-- ============================================
CREATE POLICY "Users can read own and group debts"
    ON debts FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

CREATE POLICY "Users can insert debts"
    ON debts FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own and group debts"
    ON debts FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

CREATE POLICY "Users can delete own and group debts"
    ON debts FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        group_id IN (SELECT get_my_group_ids())
    );

-- ============================================
-- STEP 9: debt_payments policies
-- ============================================
CREATE POLICY "Users can read related debt payments"
    ON debt_payments FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        debtid IN (
            SELECT id FROM debts 
            WHERE user_id = auth.uid() OR 
            group_id IN (SELECT get_my_group_ids())
        )
    );

CREATE POLICY "Users can insert debt payments"
    ON debt_payments FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update related debt payments"
    ON debt_payments FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        debtid IN (
            SELECT id FROM debts 
            WHERE user_id = auth.uid() OR 
            group_id IN (SELECT get_my_group_ids())
        )
    );

CREATE POLICY "Users can delete related debt payments"
    ON debt_payments FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        debtid IN (
            SELECT id FROM debts 
            WHERE user_id = auth.uid() OR 
            group_id IN (SELECT get_my_group_ids())
        )
    );

-- ============================================
-- STEP 10: settings policies (personal only)
-- ============================================
CREATE POLICY "Users can read own settings"
    ON settings FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
    ON settings FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
    ON settings FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own settings"
    ON settings FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- STEP 11: Enable Realtime for all tables
-- ============================================
BEGIN;
    DROP PUBLICATION IF EXISTS supabase_realtime;
    CREATE PUBLICATION supabase_realtime FOR TABLE 
        transactions, 
        categories, 
        groups, 
        group_members, 
        debts, 
        debt_payments,
        profile;
COMMIT;
