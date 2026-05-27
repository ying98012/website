/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_OAUTH_CLIENT_ID?: string;
  readonly PUBLIC_OAUTH_PROXY_URL?: string;
  readonly PUBLIC_OAUTH_SCOPE?: string;
  readonly PUBLIC_OAUTH_ALLOWED_LOGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
