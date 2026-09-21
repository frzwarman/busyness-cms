import { countAssetUsages, listAssets } from '@siteos/db';
import { supabase } from '@/lib/supabase';

export const assetsQuery = (siteId: string) => ({
  queryKey: ['assets', siteId],
  queryFn: () => listAssets(supabase, siteId),
});
export const usageCountsQuery = (siteId: string) => ({
  queryKey: ['asset-usages', siteId],
  queryFn: () => countAssetUsages(supabase, siteId),
});

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
