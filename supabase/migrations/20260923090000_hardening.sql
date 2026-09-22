-- Which draft pages link to a page (typed internal links), for delete warnings.
create or replace function public.page_refs(p_page uuid)
returns table (page_id uuid, page_title text, section_id text)
language sql stable security definer set search_path = public
as $$
  select distinct d.page_id, p.title, s ->> 'id'
  from public.page_drafts d
  join public.pages p on p.id = d.page_id
  join public.pages target on target.id = p_page and target.site_id = d.site_id
  cross join lateral jsonb_array_elements(coalesce(d.document -> 'sections', '[]'::jsonb)) s
  where public.has_site_role(d.site_id, 'viewer')
    and d.page_id <> p_page
    and (s -> 'props')::text like '%"pageId":"' || p_page::text || '"%'
$$;
revoke all on function public.page_refs(uuid) from public;
grant execute on function public.page_refs(uuid) to authenticated;
