-- Content library (reusable entries sections can reference) and global sections (edit once, appears everywhere).

create table public.content_entries (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  collection text not null check (collection ~ '^[a-z][a-z0-9-]{1,40}$'),
  data jsonb not null,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create index content_entries_site_idx on public.content_entries(site_id, collection, sort_order);

create table public.globals (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  -- { type, schemaVersion, props } — a section without page identity
  section jsonb not null,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create index globals_site_idx on public.globals(site_id);

alter table public.content_entries enable row level security;
alter table public.globals enable row level security;
create policy "members read content" on public.content_entries for select to authenticated using (public.has_site_role(site_id, 'viewer'));
create policy "editors write content" on public.content_entries for all to authenticated
  using (public.has_site_role(site_id, 'editor')) with check (public.has_site_role(site_id, 'editor'));
create policy "members read globals" on public.globals for select to authenticated using (public.has_site_role(site_id, 'viewer'));
create policy "editors insert globals" on public.globals for insert to authenticated with check (public.has_site_role(site_id, 'editor'));
create policy "editors delete globals" on public.globals for delete to authenticated using (public.has_site_role(site_id, 'editor'));
-- Updates go through save_global() so concurrent edits are detected.

create or replace function public.save_global(p_id uuid, p_expected_revision integer, p_section jsonb, p_name text default null)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_rev integer;
begin
  select site_id, revision into v_site, v_rev from public.globals where id = p_id for update;
  if v_site is null then raise exception 'global not found' using errcode = 'P0002'; end if;
  if not public.has_site_role(v_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  if v_rev <> p_expected_revision then raise exception 'revision_conflict' using errcode = 'P0001', detail = v_rev::text; end if;
  update public.globals set section = p_section, name = coalesce(p_name, name), revision = v_rev + 1, updated_at = now(), updated_by = auth.uid() where id = p_id;
  return v_rev + 1;
end $$;

-- Which draft pages/sections reference an entry (picked ids) or a global. Small per-site data; scanned on demand.
create or replace function public.content_entry_refs(p_entry uuid)
returns table (page_id uuid, page_title text, section_id text)
language sql stable security definer set search_path = public
as $$
  select d.page_id, p.title, s ->> 'id'
  from public.page_drafts d
  join public.pages p on p.id = d.page_id
  join public.content_entries e on e.id = p_entry and e.site_id = d.site_id
  cross join lateral jsonb_array_elements(coalesce(d.document -> 'sections', '[]'::jsonb)) s
  where public.has_site_role(d.site_id, 'viewer')
    and (s -> 'props' -> 'source' -> 'ids') ? p_entry::text
$$;

create or replace function public.global_refs(p_global uuid)
returns table (page_id uuid, page_title text, section_id text)
language sql stable security definer set search_path = public
as $$
  select d.page_id, p.title, s ->> 'id'
  from public.page_drafts d
  join public.pages p on p.id = d.page_id
  join public.globals g on g.id = p_global and g.site_id = d.site_id
  cross join lateral jsonb_array_elements(coalesce(d.document -> 'sections', '[]'::jsonb)) s
  where public.has_site_role(d.site_id, 'viewer')
    and s ->> 'globalId' = p_global::text
$$;

-- Publish now accepts the resolved document (content + globals inlined by the Studio) so every version is
-- self-contained. The draft keeps its references. Without p_document the raw draft is published as before.
drop function public.publish_page(uuid, text);
create or replace function public.publish_page(p_page uuid, p_note text default null, p_document jsonb default null)
returns table (version_id uuid, number integer)
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_doc jsonb; v_num integer; v_id uuid; v_theme jsonb;
begin
  select d.site_id, d.document into v_site, v_doc from public.page_drafts d where d.page_id = p_page;
  if v_site is null then raise exception 'page not found' using errcode = 'P0002'; end if;
  if not public.has_site_role(v_site, 'publisher') then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_document is not null then
    -- Same page identity as the draft; only section contents may differ (resolution).
    if (p_document ->> 'id') <> (v_doc ->> 'id') or (p_document ->> 'slug') <> (v_doc ->> 'slug') then
      raise exception 'resolved document does not match the draft' using errcode = 'P0001';
    end if;
    v_doc := p_document;
  end if;
  if jsonb_typeof(v_doc -> 'sections') <> 'array' or (v_doc ->> 'slug') is null or (v_doc ->> 'title') is null then
    raise exception 'invalid document' using errcode = 'P0001';
  end if;
  select coalesce(max(v.number), 0) + 1 into v_num from public.page_versions v where v.page_id = p_page;
  insert into public.page_versions(page_id, site_id, number, document, note, source, created_by)
    values (p_page, v_site, v_num, v_doc, p_note, 'publish', auth.uid()) returning id into v_id;
  update public.pages set published_version_id = v_id, published_at = now(), updated_at = now() where id = p_page;
  select theme into v_theme from public.sites where id = v_site;
  update public.sites set published_theme = v_theme where id = v_site;
  perform public.refresh_asset_usages(p_page, 'published', v_doc);
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'page.published', 'page', p_page::text, jsonb_build_object('version', v_num, 'note', p_note));
  return query select v_id, v_num;
end $$;

revoke all on function public.save_global(uuid, integer, jsonb, text) from public;
revoke all on function public.content_entry_refs(uuid) from public;
revoke all on function public.global_refs(uuid) from public;
revoke all on function public.publish_page(uuid, text, jsonb) from public;
grant execute on function public.save_global(uuid, integer, jsonb, text) to authenticated;
grant execute on function public.content_entry_refs(uuid) to authenticated;
grant execute on function public.global_refs(uuid) to authenticated;
grant execute on function public.publish_page(uuid, text, jsonb) to authenticated;
