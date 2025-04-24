-- Migration: Allow guest generations
-- Description: Modifies the generations table to allow null user_id for guest users
-- Author: AI Assistant
-- Date: 2024-03-19

-- Allow null user_id in generations table
alter table generations alter column user_id drop not null;

-- Drop existing RLS policies for generations table
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can insert their own generations" on generations;
drop policy if exists "Users can update their own generations" on generations;
drop policy if exists "Users can delete their own generations" on generations;
drop policy if exists "Allow guest generations" on generations;
drop policy if exists "Allow guest to view generations" on generations;

-- Create new RLS policies that handle both authenticated and anonymous users
create policy "Allow users to view their own generations"
    on generations for select
    to authenticated, anon
    using (
        (auth.uid() = user_id) -- authenticated users can see their own
        or
        (user_id is null) -- anyone can see guest generations
    );

create policy "Allow users to insert generations"
    on generations for insert
    to authenticated, anon
    with check (
        (auth.uid() = user_id) -- authenticated users can insert with their id
        or
        (user_id is null) -- anonymous users can insert with null user_id
    );

create policy "Allow users to update their own generations"
    on generations for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Allow users to delete their own generations"
    on generations for delete
    to authenticated
    using (auth.uid() = user_id); 