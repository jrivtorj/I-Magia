-- I-magIA · esquema de base de datos para Supabase
-- Ejecutar una vez en: Supabase → SQL Editor → New query → pegar → Run

create extension if not exists pgcrypto;

create table if not exists public.stories (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title              text,
  pictogram_sequence jsonb not null default '[]'::jsonb,
  generated_prompt   text,
  story_text         text,
  story_image_url    text,
  language           text not null default 'es',
  status             text not null default 'completed'
                     check (status in ('illustrating', 'completed')),
  created_at         timestamptz not null default now()
);

create index if not exists stories_user_created_idx on public.stories (user_id, created_at desc);

alter table public.stories enable row level security;

-- Los proyectos recientes de Supabase no conceden permisos automáticos sobre tablas nuevas.
grant select, insert, update, delete on public.stories to service_role;
grant select, insert, delete on public.stories to authenticated;

-- Cada usuario solo ve, crea y borra SUS cuentos.
drop policy if exists "stories_select_own" on public.stories;
create policy "stories_select_own" on public.stories
  for select using (auth.uid() = user_id);

drop policy if exists "stories_insert_own" on public.stories;
create policy "stories_insert_own" on public.stories
  for insert with check (auth.uid() = user_id);

drop policy if exists "stories_delete_own" on public.stories;
create policy "stories_delete_own" on public.stories
  for delete using (auth.uid() = user_id);
-- Sin política de UPDATE: solo el servidor (service role) actualiza (p. ej. la imagen).

-- Lectura pública de UN cuento por su id (enlaces compartidos), sin exponer el listado.
create or replace function public.get_story(story_id uuid)
returns table (
  id uuid, title text, pictogram_sequence jsonb, story_text text,
  story_image_url text, language text, status text, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select s.id, s.title, s.pictogram_sequence, s.story_text,
         s.story_image_url, s.language, s.status, s.created_at
  from public.stories s where s.id = story_id;
$$;

-- Contador global ("cuentos creados por la comunidad") sin exponer los cuentos.
create or replace function public.count_stories()
returns bigint
language sql stable security definer set search_path = public as $$
  select count(*) from public.stories;
$$;

grant execute on function public.get_story(uuid) to anon, authenticated;
grant execute on function public.count_stories() to anon, authenticated;

-- Almacenamiento de ilustraciones (bucket público de solo lectura; escribe el servidor).
insert into storage.buckets (id, name, public)
values ('story-images', 'story-images', true)
on conflict (id) do nothing;
