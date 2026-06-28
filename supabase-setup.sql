-- ============================================================
-- Marist Water Polo — Supabase setup
-- Run this entire script once in the Supabase SQL Editor.
-- ============================================================

-- 1. Year-scoped counter table for sequential registration IDs
CREATE TABLE IF NOT EXISTS reg_id_counters (
  year    integer PRIMARY KEY,
  counter integer NOT NULL DEFAULT 0
);

-- 2. Function: atomically increments counter and returns next MWP-YYYY-NNNN
CREATE OR REPLACE FUNCTION generate_reg_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  current_year integer := EXTRACT(YEAR FROM now())::integer;
  next_num     integer;
BEGIN
  INSERT INTO reg_id_counters (year, counter)
  VALUES (current_year, 1)
  ON CONFLICT (year) DO UPDATE
    SET counter = reg_id_counters.counter + 1
  RETURNING counter INTO next_num;

  RETURN 'MWP-' || current_year::text || '-' || LPAD(next_num::text, 4, '0');
END;
$$;

-- 3. Members table
CREATE TABLE IF NOT EXISTS members (
  id                      uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  reg_id                  text        UNIQUE NOT NULL DEFAULT '',
  first_name              text        NOT NULL DEFAULT '',
  last_name               text        NOT NULL DEFAULT '',
  gender                  text,
  date_of_birth           date,
  grade                   text,
  age_on_jan1             integer,
  member_type             text        DEFAULT 'player',
  mobile                  text,
  home_phone              text,
  email                   text,
  street_address          text,
  suburb                  text,
  city                    text,
  postcode                text,
  institution             text,
  medical_notes           text,
  photo                   text,         -- base64 data URL; keep photos under 1 MB
  registration_mode       text,
  family_group_name       text,
  accepted_terms          boolean     DEFAULT false,
  linked_child_name       text,
  -- Parent 1
  parent_first_name       text,
  parent_last_name        text,
  parent_email            text,
  parent_mobile           text,
  parent_relationship     text,
  parent_occupation       text,
  parent_volunteer        boolean     DEFAULT false,
  parent_volunteer_roles  text[]      DEFAULT '{}',
  parent_volunteer_other  text,
  parent_is_player        boolean     DEFAULT false,
  -- Parent 2
  parent2_first_name      text,
  parent2_last_name       text,
  parent2_email           text,
  parent2_mobile          text,
  parent2_relationship    text,
  parent2_occupation      text,
  parent2_volunteer       boolean     DEFAULT false,
  parent2_volunteer_roles text[]      DEFAULT '{}',
  parent2_volunteer_other text,
  parent2_is_player       boolean     DEFAULT false,
  created_at              timestamptz DEFAULT now()
);

-- 4. Trigger: auto-assign reg_id before every insert
CREATE OR REPLACE FUNCTION set_reg_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.reg_id := generate_reg_id();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_reg_id ON members;
CREATE TRIGGER trg_set_reg_id
BEFORE INSERT ON members
FOR EACH ROW EXECUTE FUNCTION set_reg_id();

-- 5. Row Level Security — enable but allow anon read/write for club use.
--    Tighten these policies before going public.
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reg_id_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_members"  ON members          FOR SELECT USING (true);
CREATE POLICY "anon_insert_members"  ON members          FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_select_counters" ON reg_id_counters  FOR SELECT USING (true);
CREATE POLICY "anon_update_counters" ON reg_id_counters  FOR UPDATE USING (true);
CREATE POLICY "anon_insert_counters" ON reg_id_counters  FOR INSERT WITH CHECK (true);
