-- Milestone 7: site settings (SEO, structured data, branding), redirects, forms and submissions.

alter table public.sites add column settings jsonb not null default '{}'::jsonb;
alter table public.sites add column published_settings jsonb;

create or replace function public.update_site_settings(p_site uuid, p_settings jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_site_role(p_site, 'editor') then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.sites set settings = p_settings, updated_at = now() where id = p_site;
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id) values (p_site, auth.uid(), 'settings.changed', 'site', p_site::text);
end $$;

-- Redirects: old path → new path (or absolute URL). Suggested when a published slug changes.
create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  from_path text not null check (from_path ~ '^/[^\s?#]*$'),
  to_path text not null check (to_path ~ '^(/[^\s]*|https?://[^\s]+)$'),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  unique (site_id, from_path)
);
alter table public.redirects enable row level security;
create policy "members read redirects" on public.redirects for select to authenticated using (public.has_site_role(site_id, 'viewer'));
create policy "editors write redirects" on public.redirects for all to authenticated
  using (public.has_site_role(site_id, 'editor')) with check (public.has_site_role(site_id, 'editor'));

-- Forms: definition + submissions. Public submission goes through submit_form() only.
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  -- [{ id, type, label, required, options[], placeholder, maxLength }]
  fields jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,  -- { successMessage, submitLabel, notifyEmail }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index forms_site_idx on public.forms(site_id);

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  data jsonb not null,
  meta jsonb not null default '{}'::jsonb,  -- { page, referer, userAgent } — never IPs or secrets
  status text not null default 'new' check (status in ('new', 'read')),
  created_at timestamptz not null default now()
);
create index form_submissions_form_idx on public.form_submissions(form_id, created_at desc);
create index form_submissions_site_idx on public.form_submissions(site_id, created_at desc);

alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;
create policy "members read forms" on public.forms for select to authenticated using (public.has_site_role(site_id, 'viewer'));
create policy "editors write forms" on public.forms for all to authenticated
  using (public.has_site_role(site_id, 'editor')) with check (public.has_site_role(site_id, 'editor'));
create policy "members read submissions" on public.form_submissions for select to authenticated using (public.has_site_role(site_id, 'viewer'));
create policy "editors update submissions" on public.form_submissions for update to authenticated
  using (public.has_site_role(site_id, 'editor')) with check (public.has_site_role(site_id, 'editor'));
create policy "editors delete submissions" on public.form_submissions for delete to authenticated using (public.has_site_role(site_id, 'editor'));
-- No insert policy: submissions arrive via submit_form() from the public site (anon).

-- Validates a public submission against the form definition and stores it. Anonymous callers only need the form id.
create or replace function public.submit_form(p_form uuid, p_data jsonb, p_meta jsonb default '{}'::jsonb)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_fields jsonb; f jsonb; v jsonb; clean jsonb := '{}'::jsonb; key text; ftype text; maxlen integer; v_id uuid; n integer := 0;
begin
  select site_id, fields into v_site, v_fields from public.forms where id = p_form;
  if v_site is null then raise exception 'form not found' using errcode = 'P0002'; end if;
  if jsonb_typeof(p_data) <> 'object' then raise exception 'invalid submission' using errcode = 'P0001'; end if;
  if (select count(*) from jsonb_object_keys(p_data)) > 40 then raise exception 'too many fields' using errcode = 'P0001'; end if;
  for f in select * from jsonb_array_elements(v_fields) loop
    key := f ->> 'id'; ftype := f ->> 'type'; maxlen := coalesce((f ->> 'maxLength')::integer, case when ftype = 'textarea' then 4000 else 300 end);
    v := p_data -> key;
    if v is null or v = 'null'::jsonb or (jsonb_typeof(v) = 'string' and length(v #>> '{}') = 0) then
      if (f ->> 'required')::boolean then raise exception 'missing_required' using errcode = 'P0001', detail = key; end if;
      continue;
    end if;
    if ftype = 'checkbox' then
      if jsonb_typeof(v) <> 'boolean' then raise exception 'invalid_field' using errcode = 'P0001', detail = key; end if;
    else
      if jsonb_typeof(v) <> 'string' then raise exception 'invalid_field' using errcode = 'P0001', detail = key; end if;
      if length(v #>> '{}') > maxlen then raise exception 'too_long' using errcode = 'P0001', detail = key; end if;
      if ftype = 'email' and (v #>> '{}') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email' using errcode = 'P0001', detail = key; end if;
      if ftype in ('select', 'radio') and not (f -> 'options') ? (v #>> '{}') then raise exception 'invalid_option' using errcode = 'P0001', detail = key; end if;
    end if;
    clean := clean || jsonb_build_object(key, v);
    n := n + 1;
  end loop;
  if n = 0 then raise exception 'empty submission' using errcode = 'P0001'; end if;
  insert into public.form_submissions(form_id, site_id, data, meta)
    values (p_form, v_site, clean, jsonb_build_object('page', left(p_meta ->> 'page', 300), 'referer', left(p_meta ->> 'referer', 300), 'userAgent', left(p_meta ->> 'userAgent', 200)))
    returning id into v_id;
  return v_id;
end $$;

-- Public read of a form's definition (needed to render it on the live site).
create or replace function public.get_public_form(p_form uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object('id', f.id, 'name', f.name, 'fields', f.fields, 'settings', f.settings) from public.forms f where f.id = p_form
$$;

create or replace function public.get_redirect(p_site_slug text, p_path text)
returns text
language sql stable security definer set search_path = public
as $$
  select r.to_path from public.redirects r join public.sites s on s.id = r.site_id where s.slug = p_site_slug and r.from_path = p_path limit 1
$$;

-- Published site payload now carries settings (SEO, structured data, branding) snapshotted at publish.
create or replace function public.get_published_site(p_site_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'slug', s.slug,
    'theme', coalesce(s.published_theme, s.theme),
    'settings', coalesce(s.published_settings, s.settings, '{}'::jsonb),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'slug', p.slug, 'title', p.title, 'updatedAt', p.published_at) order by p.sort_order, p.created_at)
      from public.pages p where p.site_id = s.id and p.published_version_id is not null
    ), '[]'::jsonb)
  )
  from public.sites s
  where s.slug = p_site_slug and exists (select 1 from public.pages p where p.site_id = s.id and p.published_version_id is not null)
$$;

-- Publish also snapshots settings.
create or replace function public.publish_page(p_page uuid, p_note text default null, p_document jsonb default null)
returns table (version_id uuid, number integer)
language plpgsql security definer set search_path = public
as $$
declare v_site uuid; v_doc jsonb; v_num integer; v_id uuid;
begin
  select d.site_id, d.document into v_site, v_doc from public.page_drafts d where d.page_id = p_page;
  if v_site is null then raise exception 'page not found' using errcode = 'P0002'; end if;
  if not public.has_site_role(v_site, 'publisher') then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_document is not null then
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
  update public.sites set published_theme = theme, published_settings = settings where id = v_site;
  perform public.refresh_asset_usages(p_page, 'published', v_doc);
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (v_site, auth.uid(), 'page.published', 'page', p_page::text, jsonb_build_object('version', v_num, 'note', p_note));
  return query select v_id, v_num;
end $$;

revoke all on function public.update_site_settings(uuid, jsonb) from public;
revoke all on function public.submit_form(uuid, jsonb, jsonb) from public;
revoke all on function public.get_public_form(uuid) from public;
revoke all on function public.get_redirect(text, text) from public;
grant execute on function public.update_site_settings(uuid, jsonb) to authenticated;
grant execute on function public.submit_form(uuid, jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_public_form(uuid) to anon, authenticated;
grant execute on function public.get_redirect(text, text) to anon, authenticated;
