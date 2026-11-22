-- DayZero initial schema (Supabase PostgreSQL)
-- Apply in Supabase SQL editor when database setup starts.
-- No local Docker Postgres.

create extension if not exists "pgcrypto";

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  resume_text text,
  skills jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  company text not null,
  role text not null,
  job_description text,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

create table if not exists company_research (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade,
  overview text,
  job_requirements jsonb default '[]'::jsonb,
  news jsonb default '[]'::jsonb,
  insights jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists research_sources (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade,
  title text not null,
  url text not null,
  provider text not null,
  created_at timestamptz not null default now()
);

create table if not exists interview_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade,
  question text not null,
  category text,
  difficulty text,
  question_order int,
  created_at timestamptz not null default now()
);

create table if not exists interview_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade,
  question_id uuid references interview_questions(id) on delete cascade,
  answer_text text,
  feedback text,
  evaluation jsonb,
  created_at timestamptz not null default now()
);

create table if not exists interview_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade,
  summary text,
  strengths jsonb default '[]'::jsonb,
  improvement_areas jsonb default '[]'::jsonb,
  skill_analysis jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists onboarding_plans (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade,
  days_1_30 jsonb,
  days_31_60 jsonb,
  days_61_90 jsonb,
  created_at timestamptz not null default now()
);

create table if not exists onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references onboarding_plans(id) on delete cascade,
  task_title text not null,
  phase text not null,
  completed boolean not null default false,
  due_day int,
  created_at timestamptz not null default now()
);

create index if not exists idx_interview_sessions_candidate on interview_sessions(candidate_id);
create index if not exists idx_company_research_session on company_research(session_id);
create index if not exists idx_interview_questions_session on interview_questions(session_id);
create index if not exists idx_interview_answers_session on interview_answers(session_id);
