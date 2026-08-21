-- Arcana Squad player progression.
-- Every query against these tables must be scoped to the authenticated user_id.

create table if not exists arcana_profiles (
  user_id text primary key references "user" ("id") on delete cascade,
  active_guardian text not null default 'lynx',
  active_quest text,
  daily_draw_date date,
  daily_draw_card_id text,
  accessibility jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint arcana_profiles_guardian_check
    check (active_guardian in ('turtle', 'otter', 'lizard', 'raven', 'lynx'))
);

create table if not exists arcana_card_unlocks (
  user_id text not null references "user" ("id") on delete cascade,
  card_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create table if not exists arcana_deck_cards (
  user_id text not null references "user" ("id") on delete cascade,
  slot smallint not null,
  card_id text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, slot),
  constraint arcana_deck_slot_check check (slot between 1 and 12)
);

create table if not exists guardian_progress (
  user_id text not null references "user" ("id") on delete cascade,
  guardian_id text not null,
  evolution_stage text not null default 'hatch',
  xp integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, guardian_id),
  constraint guardian_progress_guardian_check
    check (guardian_id in ('turtle', 'otter', 'lizard', 'raven', 'lynx')),
  constraint guardian_progress_xp_check check (xp >= 0)
);

create table if not exists arcana_achievements (
  user_id text not null references "user" ("id") on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists arcana_card_unlocks_user_idx on arcana_card_unlocks (user_id, unlocked_at desc);
create index if not exists guardian_progress_user_idx on guardian_progress (user_id, updated_at desc);
create index if not exists arcana_achievements_user_idx on arcana_achievements (user_id, unlocked_at desc);
