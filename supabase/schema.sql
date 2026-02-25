-- ============================================================
-- Vibe Code Showdown — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your tables.
-- After running, go to Database > Replication and enable
-- realtime for the "claims" table.
-- ============================================================

-- 1. Sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  phase text not null default 'login',
  participants text[] not null default '{}',
  presentation_order text[] not null default '{}',
  voter_order text[] not null default '{}',
  current_round int not null default 0,
  locked boolean not null default false
);

-- 2. Claims (who has tapped their name / finished voting)
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  voter_name text not null,
  status text not null default 'claimed',
  created_at timestamptz default now(),
  constraint claims_unique_voter unique (session_id, voter_name)
);

-- 3. Votes (individual category scores)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  voter_name text not null,
  participant_name text not null,
  category_id text not null,
  score int not null check (score >= 1 and score <= 5),
  is_ceo boolean not null default false,
  created_at timestamptz default now(),
  constraint votes_unique_score unique (session_id, voter_name, participant_name, category_id)
);

-- ============================================================
-- Row Level Security — allow anonymous read/write
-- ============================================================

alter table sessions enable row level security;
alter table claims enable row level security;
alter table votes enable row level security;

-- Sessions: anyone can read; anyone can insert
create policy "sessions_select" on sessions for select using (true);
create policy "sessions_insert" on sessions for insert with check (true);
create policy "sessions_update" on sessions for update using (true);

-- Claims: anyone can read; anyone can insert; anyone can update
create policy "claims_select" on claims for select using (true);
create policy "claims_insert" on claims for insert with check (true);
create policy "claims_update" on claims for update using (true);

-- Votes: anyone can read; anyone can insert (upsert)
create policy "votes_select" on votes for select using (true);
create policy "votes_insert" on votes for insert with check (true);

-- ============================================================
-- Enable realtime on claims table
-- (also do this in Dashboard > Database > Replication)
-- ============================================================
alter publication supabase_realtime add table claims;
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table votes;
