-- SiteOS core schema: organizations → sites → pages/drafts, membership roles, RLS.
-- Every business table carries site_id; access is decided by site_members + role, server-side.

create extension if not exists pgcrypto;

create type public.member_role as enum ('owner', 'admin', 'editor', 'publisher', 'viewer');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 63),
  business_type text not null default 'generic',
  theme jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_members (
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (site_id, user_id)
);
create index site_members_user_idx on public.site_members(user_id);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  slug text not null check (slug ~ '^/([a-z0-9-]+(/[a-z0-9-]+)*)?$'),
  title text not null check (length(title) between 1 and 120),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);
create index pages_site_idx on public.pages(site_id);

-- One mutable draft per page. `revision` powers optimistic concurrency (see save_page_draft).
create table public.page_drafts (
  page_id uuid primary key references public.pages(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  revision integer not null default 1,
  document jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create index page_drafts_site_idx on public.page_drafts(site_id);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  site_id uuid references public.sites(id) on delete cascade,
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_site_idx on public.audit_logs(site_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Role helpers (security definer so they can read site_members under RLS)
-- ---------------------------------------------------------------------------
create or replace function public.site_role(p_site uuid)
returns public.member_role
language sql stable security definer set search_path = public
as $$
  select role from public.site_members where site_id = p_site and user_id = auth.uid()
$$;

-- Role ranking: owner > admin > publisher > editor > viewer. Publisher can do everything an editor can.
create or replace function public.role_rank(r public.member_role)
returns integer language sql immutable
as $$
  select case r when 'owner' then 5 when 'admin' then 4 when 'publisher' then 3 when 'editor' then 2 when 'viewer' then 1 end
$$;

create or replace function public.has_site_role(p_site uuid, p_min public.member_role)
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce(public.role_rank(public.site_role(p_site)) >= public.role_rank(p_min), false)
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.sites enable row level security;
alter table public.site_members enable row level security;
alter table public.pages enable row level security;
alter table public.page_drafts enable row level security;
alter table public.audit_logs enable row level security;

create policy "org members read org" on public.organizations for select to authenticated
  using (exists (select 1 from public.organization_members m where m.organization_id = id and m.user_id = auth.uid()));

create policy "org members read memberships" on public.organization_members for select to authenticated
  using (exists (select 1 from public.organization_members m where m.organization_id = organization_id and m.user_id = auth.uid()));

create policy "site members read site" on public.sites for select to authenticated
  using (public.has_site_role(id, 'viewer'));
create policy "admins update site" on public.sites for update to authenticated
  using (public.has_site_role(id, 'admin')) with check (public.has_site_role(id, 'admin'));
create policy "owners delete site" on public.sites for delete to authenticated
  using (public.has_site_role(id, 'owner'));
-- No insert policy: sites are created through create_site().

create policy "site members read members" on public.site_members for select to authenticated
  using (public.has_site_role(site_id, 'viewer'));
create policy "admins manage members" on public.site_members for all to authenticated
  using (public.has_site_role(site_id, 'admin')) with check (public.has_site_role(site_id, 'admin'));

create policy "site members read pages" on public.pages for select to authenticated
  using (public.has_site_role(site_id, 'viewer'));
create policy "editors write pages" on public.pages for all to authenticated
  using (public.has_site_role(site_id, 'editor')) with check (public.has_site_role(site_id, 'editor'));

create policy "site members read drafts" on public.page_drafts for select to authenticated
  using (public.has_site_role(site_id, 'viewer'));
-- Drafts are written only through save_page_draft() / create_page() to enforce revisions.

create policy "site members read audit" on public.audit_logs for select to authenticated
  using (public.has_site_role(site_id, 'viewer'));

-- ---------------------------------------------------------------------------
-- RPCs (security definer; every one re-checks the caller's role)
-- ---------------------------------------------------------------------------
create or replace function public.create_site(p_name text, p_slug text, p_theme jsonb, p_business_type text default 'generic')
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_org uuid; v_site uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  insert into public.organizations(name) values (p_name) returning id into v_org;
  insert into public.organization_members(organization_id, user_id, role) values (v_org, auth.uid(), 'owner');
  insert into public.sites(organization_id, name, slug, theme, business_type) values (v_org, p_name, p_slug, p_theme, p_business_type) returning id into v_site;
  insert into public.site_members(site_id, user_id, role) values (v_site, auth.uid(), 'owner');
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'site.created', 'site', v_site::text, jsonb_build_object('name', p_name));
  return v_site;
end $$;

create or replace function public.create_page(p_site uuid, p_slug text, p_title text, p_document jsonb)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_page uuid;
begin
  if not public.has_site_role(p_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  insert into public.pages(site_id, slug, title, sort_order)
    values (p_site, p_slug, p_title, coalesce((select max(sort_order) + 1 from public.pages where site_id = p_site), 0))
    returning id into v_page;
  -- The document's id must be the page id so links by page id resolve.
  insert into public.page_drafts(page_id, site_id, document, updated_by)
    values (v_page, p_site, jsonb_set(p_document, '{id}', to_jsonb(v_page::text)), auth.uid());
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (p_site, auth.uid(), 'page.created', 'page', v_page::text, jsonb_build_object('slug', p_slug, 'title', p_title));
  return v_page;
end $$;

-- Optimistic concurrency: the caller sends the revision it last saw. Mismatch → error 'revision_conflict'.
create or replace function public.save_page_draft(p_page uuid, p_expected_revision integer, p_document jsonb)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_rev integer; v_slug text; v_title text;
begin
  select site_id, revision into v_site, v_rev from public.page_drafts where page_id = p_page for update;
  if v_site is null then raise exception 'page not found' using errcode = 'P0002'; end if;
  if not public.has_site_role(v_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  if v_rev <> p_expected_revision then
    raise exception 'revision_conflict' using errcode = '40001', detail = v_rev::text;
  end if;
  update public.page_drafts set document = p_document, revision = v_rev + 1, updated_at = now(), updated_by = auth.uid()
    where page_id = p_page;
  v_slug := p_document ->> 'slug'; v_title := p_document ->> 'title';
  update public.pages set slug = coalesce(v_slug, slug), title = coalesce(v_title, title), updated_at = now() where id = p_page;
  return v_rev + 1;
end $$;

create or replace function public.update_site_theme(p_site uuid, p_theme jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_site_role(p_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.sites set theme = p_theme, updated_at = now() where id = p_site;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id)
    values (p_site, auth.uid(), 'theme.changed', 'site', p_site::text);
end $$;

create or replace function public.delete_page(p_page uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_slug text;
begin
  select site_id, slug into v_site, v_slug from public.pages where id = p_page;
  if v_site is null then return; end if;
  if not public.has_site_role(v_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  delete from public.pages where id = p_page;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'page.deleted', 'page', p_page::text, jsonb_build_object('slug', v_slug));
end $$;

revoke all on function public.create_site(text, text, jsonb, text) from public;
revoke all on function public.create_page(uuid, text, text, jsonb) from public;
revoke all on function public.save_page_draft(uuid, integer, jsonb) from public;
revoke all on function public.update_site_theme(uuid, jsonb) from public;
revoke all on function public.delete_page(uuid) from public;
grant execute on function public.create_site(text, text, jsonb, text) to authenticated;
grant execute on function public.create_page(uuid, text, text, jsonb) to authenticated;
grant execute on function public.save_page_draft(uuid, integer, jsonb) to authenticated;
grant execute on function public.update_site_theme(uuid, jsonb) to authenticated;
grant execute on function public.delete_page(uuid) to authenticated;
