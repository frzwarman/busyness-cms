-- Owner-only site deletion. Returns the R2 keys of the site's assets so the caller can remove the bytes.
create or replace function public.delete_site(p_site uuid)
returns text[]
language plpgsql security definer set search_path = public
as $$
declare v_keys text[]; v_name text; v_org uuid;
begin
  if not public.has_site_role(p_site, 'owner') then raise exception 'forbidden' using errcode = '42501'; end if;
  select coalesce(array_agg(v.key), '{}') into v_keys from public.asset_variants v join public.assets a on a.id = v.asset_id where a.site_id = p_site;
  select name, organization_id into v_name, v_org from public.sites where id = p_site;
  delete from public.sites where id = p_site;
  -- The organization goes with its last site.
  delete from public.organizations o where o.id = v_org and not exists (select 1 from public.sites s where s.organization_id = o.id);
  insert into public.audit_logs(site_id, actor, action, entity_type, entity_id, metadata)
    values (null, auth.uid(), 'site.deleted', 'site', p_site::text, jsonb_build_object('name', v_name));
  return v_keys;
end $$;
revoke all on function public.delete_site(uuid) from public;
grant execute on function public.delete_site(uuid) to authenticated;
