/**
 * 管理後台 GitHub OAuth 2.0 客戶端工具。
 *
 * - 走 Authorization Code Flow，token 交換在 Cloudflare Worker 完成。
 * - access token 僅放在 sessionStorage，分頁關閉即失效。
 * - 使用 state 參數防 CSRF。
 * - 提供 isAuthenticated / requireAuth / logout 等高階 API 供頁面使用。
 */

const STORAGE_KEYS = {
  token: "admin_oauth_token",
  scope: "admin_oauth_scope",
  user: "admin_oauth_user",
  state: "admin_oauth_state",
  next: "admin_oauth_next",
} as const;

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";

export interface AdminUser {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  htmlUrl: string;
}

export interface OAuthClientConfig {
  clientId: string;
  proxyUrl: string;
  scope: string;
  allowedLogins: string[];
  baseUrl: string;
}

interface ExchangeResponse {
  access_token: string;
  scope: string;
  token_type: string;
  login: string | null;
}

interface ExchangeErrorResponse {
  error: string;
  message?: string;
  login?: string;
}

function readPublicEnv(name: string): string {
  const env = import.meta.env as Record<string, string | undefined>;
  return (env[name] ?? "").trim();
}

export function loadOAuthConfig(): OAuthClientConfig {
  const baseUrl = import.meta.env.BASE_URL;
  const clientId = readPublicEnv("PUBLIC_OAUTH_CLIENT_ID");
  const proxyUrl = readPublicEnv("PUBLIC_OAUTH_PROXY_URL").replace(/\/$/, "");
  const scope = readPublicEnv("PUBLIC_OAUTH_SCOPE") || "public_repo read:user";
  const allowedLogins = readPublicEnv("PUBLIC_OAUTH_ALLOWED_LOGINS")
    .split(",")
    .map((login) => login.trim().toLowerCase())
    .filter(Boolean);
  return { clientId, proxyUrl, scope, allowedLogins, baseUrl };
}

export function isOAuthConfigured(
  config: OAuthClientConfig = loadOAuthConfig(),
): boolean {
  return Boolean(config.clientId && config.proxyUrl);
}

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function callbackUrl(baseUrl: string): string {
  const origin = window.location.origin;
  const path = `${baseUrl.replace(/\/$/, "")}/admin/callback/`;
  return `${origin}${path}`;
}

export function startLogin(nextPath?: string): void {
  const config = loadOAuthConfig();
  if (!isOAuthConfigured(config)) {
    throw new Error(
      "OAuth 尚未設定：請填入 PUBLIC_OAUTH_CLIENT_ID 與 PUBLIC_OAUTH_PROXY_URL。",
    );
  }
  const state = randomState();
  sessionStorage.setItem(STORAGE_KEYS.state, state);
  if (nextPath) {
    sessionStorage.setItem(STORAGE_KEYS.next, nextPath);
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.next);
  }
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(config.baseUrl),
    scope: config.scope,
    state,
    allow_signup: "false",
  });
  window.location.assign(`${GITHUB_AUTHORIZE_URL}?${params.toString()}`);
}

export class OAuthCallbackError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "OAuthCallbackError";
  }
}

export async function handleOAuthCallback(
  searchParams: URLSearchParams,
): Promise<{ user: AdminUser; nextPath: string }> {
  const config = loadOAuthConfig();
  if (!isOAuthConfigured(config)) {
    throw new OAuthCallbackError("OAuth 尚未設定", "missing_config");
  }
  const errorParam = searchParams.get("error");
  if (errorParam) {
    throw new OAuthCallbackError(
      searchParams.get("error_description") ?? errorParam,
      errorParam,
    );
  }
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    throw new OAuthCallbackError(
      "缺少 code 或 state 參數",
      "missing_code_or_state",
    );
  }
  const expectedState = sessionStorage.getItem(STORAGE_KEYS.state);
  sessionStorage.removeItem(STORAGE_KEYS.state);
  if (!expectedState || expectedState !== state) {
    throw new OAuthCallbackError(
      "state 驗證失敗，請重新登入。",
      "state_mismatch",
    );
  }

  const response = await fetch(`${config.proxyUrl}/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      redirectUri: callbackUrl(config.baseUrl),
    }),
  });

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => ({}))) as ExchangeErrorResponse;
    const message = payload.message ?? `OAuth 交換失敗（${response.status}）`;
    throw new OAuthCallbackError(
      message,
      payload.error ?? `http_${response.status}`,
    );
  }

  const payload = (await response.json()) as ExchangeResponse;
  if (!payload.access_token) {
    throw new OAuthCallbackError("回應缺少 access_token", "no_access_token");
  }

  sessionStorage.setItem(STORAGE_KEYS.token, payload.access_token);
  sessionStorage.setItem(STORAGE_KEYS.scope, payload.scope ?? "");

  const user = await fetchAuthenticatedUser(payload.access_token);
  if (
    config.allowedLogins.length > 0 &&
    !config.allowedLogins.includes(user.login.toLowerCase())
  ) {
    await revokeStoredToken();
    throw new OAuthCallbackError(
      `GitHub 帳號 ${user.login} 未在管理後台白名單。`,
      "login_not_allowed",
    );
  }
  sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

  const next = sessionStorage.getItem(STORAGE_KEYS.next);
  sessionStorage.removeItem(STORAGE_KEYS.next);
  return {
    user,
    nextPath: next ?? `${config.baseUrl.replace(/\/$/, "")}/admin-dashboard/`,
  };
}

async function fetchAuthenticatedUser(token: string): Promise<AdminUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) {
    throw new OAuthCallbackError(
      `無法取得 GitHub 使用者（${response.status}）`,
      `github_user_${response.status}`,
    );
  }
  const data = (await response.json()) as {
    login: string;
    name: string | null;
    avatar_url: string | null;
    html_url: string;
  };
  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    htmlUrl: data.html_url,
  };
}

export function getStoredToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEYS.token);
}

export function getStoredUser(): AdminUser | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken() && getStoredUser());
}

export async function revokeStoredToken(): Promise<void> {
  const config = loadOAuthConfig();
  const token = getStoredToken();
  clearSession();
  if (!token || !isOAuthConfigured(config)) return;
  try {
    await fetch(`${config.proxyUrl}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token }),
    });
  } catch {
    // 即使 revoke 失敗也忽略，本地 session 已清除
  }
}

export function clearSession(): void {
  if (typeof sessionStorage === "undefined") return;
  for (const key of Object.values(STORAGE_KEYS)) {
    sessionStorage.removeItem(key);
  }
}

export interface RequireAuthOptions {
  loginPath: string;
  nextPath?: string;
}

/**
 * 用於受保護頁面：若未登入則導向 loginPath，並把 nextPath 記住於下一次登入完成後自動回跳。
 */
export function requireAuth(options: RequireAuthOptions): AdminUser | null {
  if (typeof window === "undefined") return null;
  const user = getStoredUser();
  const token = getStoredToken();
  if (user && token) return user;
  if (options.nextPath) {
    sessionStorage.setItem(STORAGE_KEYS.next, options.nextPath);
  }
  window.location.replace(options.loginPath);
  return null;
}
