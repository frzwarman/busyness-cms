/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_PREVIEW_ORIGIN?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_EDGE_ORIGIN?: string;
  readonly VITE_ASSET_BASE_URL?: string;
}
