-- Assets: metadata in Postgres, bytes in R2 (keys derived from ids, never from user input).

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  filename text not null check (length(filename) between 1 and 255),
  mime_type text not null,
  size integer not null check (size > 0),
  width integer,
  height integer,
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  alt text not null default '',
  decorative boolean not null default false,
  caption text not null default '',
  tags text[] not null default '{}',
  focal_x real not null default 0.5 check (focal_x between 0 and 1),
  focal_y real not null default 0.5 check (focal_y between 0 and 1),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, sha256)
);
create index assets_site_idx on public.assets(site_id, created_at desc);

create table public.asset_variants (
  asset_id uuid not null references public.assets(id) on delete cascade,
  name text not null check (name in ('original', '1920', '960', '320')),
  key text not null,
  mime_type text not null,
  width integer,
  height integer,
  size integer not null,
  primary key (asset_id, name)
);

-- Which sections reference which assets, per draft and per published version. Maintained by save/publish.
create table public.asset_usages (
  asset_id uuid not null references public.assets(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  page_id uuid not null references public.pages(id) on delete cascade,
  section_id text not null,
  kind text not null check (kind in ('draft', 'published')),
  primary key (asset_id, page_id, section_id, kind)
);
create index asset_usages_page_idx on public.asset_usages(page_id, kind);

alter table public.assets enable row level security;
alter table public.asset_variants enable row level security;
alter table public.asset_usages enable row level security;
create policy "site members read assets" on public.assets for select to authenticated using (public.has_site_role(site_id, 'viewer'));
create policy "site members read variants" on public.asset_variants for select to authenticated
  using (exists (select 1 from public.assets a where a.id = asset_id and public.has_site_role(a.site_id, 'viewer')));
create policy "site members read usages" on public.asset_usages for select to authenticated using (public.has_site_role(site_id, 'viewer'));

-- Refresh usages for one page + kind by walking the document for assetId fields.
create or replace function public.refresh_asset_usages(p_page uuid, p_kind text, p_document jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; sec jsonb; aid text;
begin
  select site_id into v_site from public.pages where id = p_page;
  if v_site is null then return; end if;
  delete from public.asset_usages where page_id = p_page and kind = p_kind;
  for sec in select * from jsonb_array_elements(coalesce(p_document -> 'sections', '[]'::jsonb)) loop
    for aid in select distinct v #>> '{}' from jsonb_path_query(sec -> 'props', 'strict $.**.assetId') v where jsonb_typeof(v) = 'string' loop
      if aid ~ '^[0-9a-f-]{36}$' and exists (select 1 from public.assets a where a.id = aid::uuid and a.site_id = v_site) then
        insert into public.asset_usages(asset_id, site_id, page_id, section_id, kind)
          values (aid::uuid, v_site, p_page, sec ->> 'id', p_kind) on conflict do nothing;
      end if;
    end loop;
  end loop;
end $$;

-- Hook usages into saving and publishing.
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
    raise exception 'revision_conflict' using errcode = 'P0001', detail = v_rev::text, hint = 'Reload the page to get the latest draft.';
  end if;
  update public.page_drafts set document = p_document, revision = v_rev + 1, updated_at = now(), updated_by = auth.uid()
    where page_id = p_page;
  v_slug := p_document ->> 'slug'; v_title := p_document ->> 'title';
  update public.pages set slug = coalesce(v_slug, slug), title = coalesce(v_title, title), updated_at = now() where id = p_page;
  perform public.refresh_asset_usages(p_page, 'draft', p_document);
  return v_rev + 1;
end $$;

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
  perform public.refresh_asset_usages(p_page, 'published', v_doc);
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'page.published', 'page', p_page::text, jsonb_build_object('version', v_num, 'note', p_note));
  return query select v_id, v_num;
end $$;

-- Register an uploaded asset. Keys are computed here from ids so clients cannot point at other objects.
create or replace function public.create_asset(
  p_id uuid, p_site uuid, p_filename text, p_mime text, p_size integer, p_width integer, p_height integer, p_sha256 text,
  p_variants jsonb  -- [{name, mime, width, height, size}]
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v jsonb; ext text;
begin
  if not public.has_site_role(p_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  insert into public.assets(id, site_id, filename, mime_type, size, width, height, sha256, uploaded_by)
    values (p_id, p_site, p_filename, p_mime, p_size, p_width, p_height, p_sha256, auth.uid());
  for v in select * from jsonb_array_elements(p_variants) loop
    ext := case v ->> 'mime' when 'image/webp' then 'webp' when 'image/jpeg' then 'jpg' when 'image/png' then 'png' when 'image/gif' then 'gif' when 'application/pdf' then 'pdf' else 'bin' end;
    insert into public.asset_variants(asset_id, name, key, mime_type, width, height, size)
      values (p_id, v ->> 'name', format('sites/%s/assets/%s/%s.%s', p_site, p_id, v ->> 'name', ext), v ->> 'mime', (v ->> 'width')::integer, (v ->> 'height')::integer, (v ->> 'size')::integer);
  end loop;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (p_site, auth.uid(), 'asset.uploaded', 'asset', p_id::text, jsonb_build_object('filename', p_filename, 'size', p_size));
  return p_id;
end $$;

create or replace function public.update_asset(p_id uuid, p_alt text, p_decorative boolean, p_caption text, p_tags text[], p_focal_x real, p_focal_y real)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_site uuid;
begin
  select site_id into v_site from public.assets where id = p_id;
  if v_site is null then raise exception 'asset not found' using errcode = 'P0002'; end if;
  if not public.has_site_role(v_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.assets set alt = p_alt, decorative = p_decorative, caption = p_caption, tags = p_tags, focal_x = p_focal_x, focal_y = p_focal_y, updated_at = now() where id = p_id;
end $$;

-- Refuses while the asset is referenced unless an admin forces it. Returns the R2 keys to delete.
create or replace function public.delete_asset(p_id uuid, p_force boolean default false)
returns text[]
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_uses integer; v_keys text[];
begin
  select site_id into v_site from public.assets where id = p_id;
  if v_site is null then return '{}'; end if;
  if not public.has_site_role(v_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  select count(*) into v_uses from public.asset_usages where asset_id = p_id;
  if v_uses > 0 and not (p_force and public.has_site_role(v_site, 'admin')) then
    raise exception 'asset_in_use' using errcode = 'P0001', detail = v_uses::text, hint = 'Remove the image from those sections first, or ask an admin to force delete.';
  end if;
  select coalesce(array_agg(key), '{}') into v_keys from public.asset_variants where asset_id = p_id;
  delete from public.assets where id = p_id;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'asset.deleted', 'asset', p_id::text, jsonb_build_object('forced', p_force, 'usages', v_uses));
  return v_keys;
end $$;

revoke all on function public.refresh_asset_usages(uuid, text, jsonb) from public;
revoke all on function public.create_asset(uuid, uuid, text, text, integer, integer, integer, text, jsonb) from public;
revoke all on function public.update_asset(uuid, text, boolean, text, text[], real, real) from public;
revoke all on function public.delete_asset(uuid, boolean) from public;
grant execute on function public.create_asset(uuid, uuid, text, text, integer, integer, integer, text, jsonb) to authenticated;
grant execute on function public.update_asset(uuid, text, boolean, text, text[], real, real) to authenticated;
grant execute on function public.delete_asset(uuid, boolean) to authenticated;
