export type Env = {
  ASSETS: R2Bucket;
  STUDIO_ORIGIN: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  PUBLIC_ASSET_BASE_URL: string;
  /** HMAC key for short-lived upload tickets. */
  UPLOAD_SIGNING_SECRET: string;
};
