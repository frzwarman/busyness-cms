import { getPublishState, listVersions } from '@siteos/db';
import { supabase } from '@/lib/supabase';

export const publishStateQuery = (pageId: string) => ({
  queryKey: ['publish', pageId],
  queryFn: () => getPublishState(supabase, pageId),
});
export const versionsQuery = (pageId: string) => ({
  queryKey: ['versions', pageId],
  queryFn: () => listVersions(supabase, pageId),
});

export function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
