export type Env = {
  ASSETS: R2Bucket;
  STUDIO_ORIGIN: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  PUBLIC_ASSET_BASE_URL: string;
  /** HMAC key for short-lived upload tickets. */
  UPLOAD_SIGNING_SECRET: string;
  /** Optional: Cloudflare zone + API token (Cache Purge permission) to purge published URLs on publish. */
  CF_ZONE_ID?: string;
  CF_API_TOKEN?: string;
};
