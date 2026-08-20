create table if not exists scores (
  id           serial primary key,
  user_id      text,
  display_name text not null,
  score        integer not null,
  rooms        integer not null,
  hero_id      text not null,
  created_at   timestamptz not null default now()
);
create index if not exists scores_score_idx on scores (score desc);
