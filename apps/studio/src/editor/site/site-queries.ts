import { listForms, listRedirects, listSubmissions } from '@siteos/db';
import { supabase } from '@/lib/supabase';

export const formsQuery = (siteId: string) => ({
  queryKey: ['forms', siteId],
  queryFn: () => listForms(supabase, siteId),
});
export const redirectsQuery = (siteId: string) => ({
  queryKey: ['redirects', siteId],
  queryFn: () => listRedirects(supabase, siteId),
});
export const submissionsQuery = (siteId: string, formId?: string, since?: string) => ({
  queryKey: ['submissions', siteId, formId ?? 'all', since ?? 'all'],
  queryFn: () => listSubmissions(supabase, siteId, { formId, since }),
});
