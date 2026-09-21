-- SQLSTATE 40001 (serialization_failure) is retried by PostgREST/poolers, which turned a revision
-- conflict into a hang. Use P0001 (raise_exception) with a stable message instead.
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
  return v_rev + 1;
end $$;
