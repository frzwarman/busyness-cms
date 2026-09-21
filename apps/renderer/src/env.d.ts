interface ImportMetaEnv {
  readonly PUBLIC_STUDIO_ORIGIN?: string;
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_PUBLISHABLE_KEY?: string;
  /** Site served at the root path when no /s/:site prefix or platform subdomain is present. */
  readonly DEFAULT_SITE_SLUG?: string;
  /** e.g. sites.example.com → https://kopi-sudut.sites.example.com serves site "kopi-sudut". */
  readonly PUBLIC_PLATFORM_DOMAIN?: string;
}
