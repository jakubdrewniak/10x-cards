-- Migration: Initial Schema Setup
-- Description: Creates the core tables for the flashcard application including generations, flashcards, and error logs
-- with appropriate relationships, constraints, and security policies.
-- Author: AI Assistant
-- Date: 2024-03-19

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- Table: generations
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash text not null,
    source_text_length integer not null,
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS for generations table
alter table generations enable row level security;

-- RLS Policies for generations table
comment on table generations is 'Stores information about flashcard generation sessions';

-- Authenticated users can view only their own generations
create policy "Users can view their own generations"
    on generations for select
    to authenticated
    using (auth.uid() = user_id);

-- Authenticated users can insert their own generations
create policy "Users can insert their own generations"
    on generations for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Authenticated users can update their own generations
create policy "Users can update their own generations"
    on generations for update
    to authenticated
    using (auth.uid() = user_id);

-- Authenticated users can delete their own generations
create policy "Users can delete their own generations"
    on generations for delete
    to authenticated
    using (auth.uid() = user_id);

-- Table: flashcards
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references generations(id) on delete set null,
    user_id uuid not null references auth.users(id) on delete cascade
);

-- Enable RLS for flashcards table
alter table flashcards enable row level security;

-- RLS Policies for flashcards table
comment on table flashcards is 'Stores individual flashcards created by users';

-- Authenticated users can view only their own flashcards
create policy "Users can view their own flashcards"
    on flashcards for select
    to authenticated
    using (auth.uid() = user_id);

-- Authenticated users can insert their own flashcards
create policy "Users can insert their own flashcards"
    on flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Authenticated users can update their own flashcards
create policy "Users can update their own flashcards"
    on flashcards for update
    to authenticated
    using (auth.uid() = user_id);

-- Authenticated users can delete their own flashcards
create policy "Users can delete their own flashcards"
    on flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- Table: generation_error_logs
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Enable RLS for generation_error_logs table
alter table generation_error_logs enable row level security;

-- RLS Policies for generation_error_logs table
comment on table generation_error_logs is 'Stores error logs from flashcard generation attempts';

-- Authenticated users can view only their own error logs
create policy "Users can view their own error logs"
    on generation_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

-- Authenticated users can insert their own error logs
create policy "Users can insert their own error logs"
    on generation_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create indexes for better query performance
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_generations_user_id on generations(user_id);
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- Create trigger function for updating updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for flashcards table
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Create trigger for generations table
create trigger update_generations_updated_at
    before update on generations
    for each row
    execute function update_updated_at_column(); 