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
    user_id uuid not null,  -- Removed foreign key constraint for development
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

-- Drop existing policies if they exist
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can insert their own generations" on generations;
drop policy if exists "Users can update their own generations" on generations;
drop policy if exists "Users can delete their own generations" on generations;

-- Create permissive policies for testing
create policy "Allow all operations on generations"
    on generations for all
    using (true)
    with check (true);

-- Table: flashcards
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references generations(id) on delete set null,
    user_id uuid not null  -- Removed foreign key constraint for development
);

-- Enable RLS for flashcards table
alter table flashcards enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can insert their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;

-- Create permissive policies for testing
create policy "Allow all operations on flashcards"
    on flashcards for all
    using (true)
    with check (true);

-- Table: generation_error_logs
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null,  -- Removed foreign key constraint for development
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Enable RLS for generation_error_logs table
alter table generation_error_logs enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own error logs" on generation_error_logs;
drop policy if exists "Users can insert their own error logs" on generation_error_logs;

-- Create permissive policies for testing
create policy "Allow all operations on error logs"
    on generation_error_logs for all
    using (true)
    with check (true);

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