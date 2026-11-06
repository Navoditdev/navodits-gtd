-- Preparation for cloud sync. Apply to the selected Supabase project only.
-- Each account owns one versioned workspace. Offline edits will use the
-- revision for optimistic concurrency, preventing a blind last-write-wins save.
begin;

create table public.navodit_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint workspace_state_object check (jsonb_typeof(state) = 'object'),
  constraint workspace_state_version check (state ? 'version' and state -> 'version' = '1'::jsonb)
);

alter table public.navodit_workspaces enable row level security;
revoke all on public.navodit_workspaces from public, anon, authenticated;
grant select on public.navodit_workspaces to authenticated;
grant insert (user_id, state, revision) on public.navodit_workspaces to authenticated;
grant update (state, revision) on public.navodit_workspaces to authenticated;

create policy "Read your own workspace"
  on public.navodit_workspaces for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Create your own workspace"
  on public.navodit_workspaces for insert to authenticated
  with check ((select auth.uid()) = user_id and revision = 1);

create policy "Update your own workspace"
  on public.navodit_workspaces for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create function public.navodit_workspace_revision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'Workspace ownership cannot change';
  end if;
  if new.revision <> old.revision + 1 then
    raise exception 'Workspace revision must increase by one';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.navodit_workspace_revision() from public, anon, authenticated;
create trigger navodit_workspace_revision
  before update on public.navodit_workspaces
  for each row execute function public.navodit_workspace_revision();

commit;
