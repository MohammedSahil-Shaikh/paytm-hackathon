-- DayZero persistence schema
-- Run once in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- 1) Candidates
create table if not exists public.candidates (
  id text primary key,
  name text not null,
  email text,
  resume_text text,
  skills text[] not null default '{}',
  experience text[] not null default '{}',
  strengths text[] not null default '{}',
  skill_gaps text[] not null default '{}',
  target_role text not null,
  target_company text not null,
  created_at timestamptz not null default now()
);

-- 2) Interview sessions (mirrors InterviewSession)
create table if not exists public.interview_sessions (
  id text primary key,
  candidate_id text references public.candidates (id) on delete set null,
  candidate jsonb not null,
  research jsonb not null,
  job_description text not null default '',
  planned_questions jsonb not null default '[]'::jsonb,
  current_question_index integer not null default 0,
  current_question jsonb,
  answers jsonb not null default '[]'::jsonb,
  transcript jsonb not null default '[]'::jsonb,
  follow_ups_for_current_original integer not null default 0,
  originals_completed integer not null default 0,
  status text not null check (status in ('created', 'active', 'completed')),
  source text not null check (source in ('ai', 'mock')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_sessions_candidate_id_idx
  on public.interview_sessions (candidate_id);
create index if not exists interview_sessions_status_idx
  on public.interview_sessions (status);

-- 3) Interview reports
create table if not exists public.interview_reports (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique
    references public.interview_sessions (id) on delete cascade,
  candidate_id text references public.candidates (id) on delete set null,
  overall_summary text not null,
  strengths text[] not null default '{}',
  improvement_areas text[] not null default '{}',
  skill_analysis jsonb not null default '[]'::jsonb,
  answer_feedback jsonb not null default '[]'::jsonb,
  recommendations text[] not null default '{}',
  source text check (source in ('ai', 'mock')),
  created_at timestamptz not null default now()
);

-- 4) Onboarding plans
create table if not exists public.onboarding_plans (
  id uuid primary key default gen_random_uuid(),
  candidate_id text references public.candidates (id) on delete set null,
  report_id uuid references public.interview_reports (id) on delete set null,
  employee_name text not null,
  company text not null,
  role text not null,
  phases jsonb not null default '[]'::jsonb,
  source text check (source in ('ai', 'mock')),
  created_at timestamptz not null default now()
);

create index if not exists onboarding_plans_candidate_id_idx
  on public.onboarding_plans (candidate_id);

-- updated_at helper for sessions
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists interview_sessions_set_updated_at on public.interview_sessions;
create trigger interview_sessions_set_updated_at
before update on public.interview_sessions
for each row execute function public.set_updated_at();

-- RLS: enable, no public write policies.
-- Server secret/service_role key bypasses RLS automatically.
alter table public.candidates enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_reports enable row level security;
alter table public.onboarding_plans enable row level security;
