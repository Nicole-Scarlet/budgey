-- =============================================================
-- Supabase SQL: join_group_by_invite RPC function + RLS policies
-- Paste this into the Supabase SQL Editor and run it.
-- =============================================================

-- 1. RPC function for joining groups (bypasses RLS safely)
CREATE OR REPLACE FUNCTION join_group_by_invite(p_invite_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_group RECORD;
    v_user_id UUID;
    v_existing RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN json_build_object('error', 'Not authenticated');
    END IF;

    SELECT * INTO v_group
    FROM groups
    WHERE invite_code = p_invite_code;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Group not found. Please check the invite code and try again.');
    END IF;

    SELECT * INTO v_existing
    FROM group_members
    WHERE group_id = v_group.id AND user_id = v_user_id;

    IF FOUND THEN
        RETURN json_build_object('error', 'You are already a member of this group.');
    END IF;

    INSERT INTO group_members (group_id, user_id, role, share_income, share_savings, share_investments, share_debts)
    VALUES (v_group.id, v_user_id, 'member', false, false, false, false);

    RETURN json_build_object(
        'success', true,
        'group', json_build_object(
            'id', v_group.id,
            'name', v_group.name,
            'description', v_group.description,
            'invite_code', v_group.invite_code,
            'budget_limit', v_group.budget_limit,
            'budget_period', v_group.budget_period,
            'created_by', v_group.created_by
        )
    );
END;
$$;

-- 2. RLS policies for "groups" table
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create groups" ON groups;
CREATE POLICY "Users can create groups"
    ON groups FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Members can read their groups" ON groups;
CREATE POLICY "Members can read their groups"
    ON groups FOR SELECT
    TO authenticated
    USING (
        id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Creator can update group" ON groups;
CREATE POLICY "Creator can update group"
    ON groups FOR UPDATE
    TO authenticated
    USING (
        id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    );

-- 3. RLS policies for "group_members" table
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read group members" ON group_members;
CREATE POLICY "Members can read group members"
    ON group_members FOR SELECT
    TO authenticated
    USING (
        group_id IN (SELECT gm2.group_id FROM group_members gm2 WHERE gm2.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can join groups" ON group_members;
CREATE POLICY "Users can join groups"
    ON group_members FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Members can update own settings" ON group_members;
CREATE POLICY "Members can update own settings"
    ON group_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Members can leave groups" ON group_members;
CREATE POLICY "Members can leave groups"
    ON group_members FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
