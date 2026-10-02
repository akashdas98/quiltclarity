/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  readonly PUBLIC_ROBOTS_NOINDEX?: string;
  readonly PUBLIC_SIMPLE_ANALYTICS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
