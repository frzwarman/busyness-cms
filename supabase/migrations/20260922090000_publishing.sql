-- Publishing: immutable page versions, published pointers, restore, and anon-readable published content.

create table public.page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  number integer not null,
  document jsonb not null,
  note text,
  source text not null default 'publish' check (source in ('publish', 'restore')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (page_id, number)
);
create index page_versions_page_idx on public.page_versions(page_id, number desc);

alter table public.pages add column published_version_id uuid references public.page_versions(id) on delete set null;
alter table public.pages add column published_at timestamptz;
-- Theme snapshot taken at the last publish of any page; the public site never reads the draft theme.
alter table public.sites add column published_theme jsonb;

-- Versions are history: no UPDATE ever; DELETE only as part of deleting the page (cascade) via delete_page().
create or replace function public.page_versions_immutable()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then raise exception 'page_versions are immutable' using errcode = 'P0001'; end if;
  if tg_op = 'DELETE' and coalesce(current_setting('siteos.allow_version_delete', true), '') <> 'on' then
    raise exception 'page_versions cannot be deleted' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;
create trigger page_versions_immutable before update or delete on public.page_versions
  for each row execute function public.page_versions_immutable();

alter table public.page_versions enable row level security;
create policy "site members read versions" on public.page_versions for select to authenticated
  using (public.has_site_role(site_id, 'viewer'));

-- delete_page must permit the cascade.
create or replace function public.delete_page(p_page uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_slug text;
begin
  select site_id, slug into v_site, v_slug from public.pages where id = p_page;
  if v_site is null then return; end if;
  if not public.has_site_role(v_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  perform set_config('siteos.allow_version_delete', 'on', true);
  delete from public.pages where id = p_page;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'page.deleted', 'page', p_page::text, jsonb_build_object('slug', v_slug));
end $$;

-- Publish: snapshot the current draft into an immutable version and move the pointer. Publisher role or above.
-- Structural validation happens here; section-level schema validation is done by the Studio with the registry
-- before calling (and again by the renderer, which skips invalid sections rather than failing the page).
create or replace function public.publish_page(p_page uuid, p_note text default null)
returns table (version_id uuid, number integer)
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_doc jsonb; v_num integer; v_id uuid; v_theme jsonb;
begin
  select d.site_id, d.document into v_site, v_doc from public.page_drafts d where d.page_id = p_page;
  if v_site is null then raise exception 'page not found' using errcode = 'P0002'; end if;
  if not public.has_site_role(v_site, 'publisher') then raise exception 'forbidden' using errcode = '42501'; end if;
  if jsonb_typeof(v_doc -> 'sections') <> 'array' or (v_doc ->> 'slug') is null or (v_doc ->> 'title') is null then
    raise exception 'invalid document' using errcode = 'P0001';
  end if;
  select coalesce(max(v.number), 0) + 1 into v_num from public.page_versions v where v.page_id = p_page;
  insert into public.page_versions(page_id, site_id, number, document, note, source, created_by)
    values (p_page, v_site, v_num, v_doc, p_note, 'publish', auth.uid()) returning id into v_id;
  update public.pages set published_version_id = v_id, published_at = now(), updated_at = now() where id = p_page;
  select theme into v_theme from public.sites where id = v_site;
  update public.sites set published_theme = v_theme where id = v_site;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'page.published', 'page', p_page::text, jsonb_build_object('version', v_num, 'note', p_note));
  return query select v_id, v_num;
end $$;

create or replace function public.unpublish_page(p_page uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_site uuid;
begin
  select site_id into v_site from public.pages where id = p_page;
  if v_site is null then return; end if;
  if not public.has_site_role(v_site, 'publisher') then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.pages set published_version_id = null, published_at = null where id = p_page;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id)
    values (v_site, auth.uid(), 'page.unpublished', 'page', p_page::text);
end $$;

-- Restore: copy a historical version into the draft as a new revision. History stays linear and intact.
create or replace function public.restore_version(p_version uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_page uuid; v_doc jsonb; v_num integer; v_rev integer;
begin
  select site_id, page_id, document, number into v_site, v_page, v_doc, v_num from public.page_versions where id = p_version;
  if v_site is null then raise exception 'version not found' using errcode = 'P0002'; end if;
  if not public.has_site_role(v_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.page_drafts set document = v_doc, revision = revision + 1, updated_at = now(), updated_by = auth.uid()
    where page_id = v_page returning revision into v_rev;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'page.restored', 'page', v_page::text, jsonb_build_object('from_version', v_num));
  return v_rev;
end $$;

-- ---------------------------------------------------------------------------
-- Public (anon) read of PUBLISHED content only. No table is exposed; drafts are never reachable here.
-- ---------------------------------------------------------------------------
create or replace function public.get_published_site(p_site_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'slug', s.slug,
    'theme', coalesce(s.published_theme, s.theme),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'slug', p.slug, 'title', p.title) order by p.sort_order, p.created_at)
      from public.pages p where p.site_id = s.id and p.published_version_id is not null
    ), '[]'::jsonb)
  )
  from public.sites s
  where s.slug = p_site_slug and exists (select 1 from public.pages p where p.site_id = s.id and p.published_version_id is not null)
$$;

create or replace function public.get_published_page(p_site_slug text, p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'versionId', v.id,
    'versionNumber', v.number,
    'publishedAt', p.published_at,
    'page', v.document,
    'site', public.get_published_site(p_site_slug)
  )
  from public.sites s
  join public.pages p on p.site_id = s.id and p.slug = p_slug
  join public.page_versions v on v.id = p.published_version_id
  where s.slug = p_site_slug
$$;

revoke all on function public.publish_page(uuid, text) from public;
revoke all on function public.unpublish_page(uuid) from public;
revoke all on function public.restore_version(uuid) from public;
revoke all on function public.get_published_site(text) from public;
revoke all on function public.get_published_page(text, text) from public;
grant execute on function public.publish_page(uuid, text) to authenticated;
grant execute on function public.unpublish_page(uuid) to authenticated;
grant execute on function public.restore_version(uuid) to authenticated;
grant execute on function public.get_published_site(text) to anon, authenticated;
grant execute on function public.get_published_page(text, text) to anon, authenticated;
