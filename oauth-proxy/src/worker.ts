/**
 * GitHub OAuth Proxy for the static admin UI.
 *
 * Endpoints:
 *   POST /exchange  -> { code, redirectUri } => { access_token, scope, token_type }
 *   POST /revoke    -> { access_token }      => { revoked: true }
 *   GET  /health    -> { ok: true }
 *
 * Secrets (set via `wrangler secret put`):
 *   - GITHUB_CLIENT_ID
 *   - GITHUB_CLIENT_SECRET
 *
 * Vars (defined in wrangler.toml):
 *   - ALLOWED_ORIGINS  (CSV)
 *   - ALLOWED_LOGINS   (CSV, lower-case GitHub logins)
 */

export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ALLOWED_ORIGINS: string;
  ALLOWED_LOGINS: string;
}

interface ExchangeBody {
  code?: unknown;
  redirectUri?: unknown;
}

interface RevokeBody {
  access_token?: unknown;
}

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
} as const;

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowList = parseList(env.ALLOWED_ORIGINS);
  const isAllowed = origin !== null && allowList.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(
  status: number,
  body: unknown,
  cors: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...cors },
  });
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

async function verifyAllowedLogin(
  accessToken: string,
  env: Env,
): Promise<{ ok: boolean; login?: string; reason?: string }> {
  const allowed = parseList(env.ALLOWED_LOGINS).map((login) =>
    login.toLowerCase(),
  );
  if (allowed.length === 0) {
    return { ok: true };
  }
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "weiying-portfolio-oauth-proxy",
    },
  });
  if (!response.ok) {
    return { ok: false, reason: `github_user_fetch_failed_${response.status}` };
  }
  const user = (await response.json()) as { login?: string };
  const login = (user.login ?? "").toLowerCase();
  if (!login) {
    return { ok: false, reason: "github_user_login_missing" };
  }
  if (!allowed.includes(login)) {
    return { ok: false, login, reason: "login_not_allowed" };
  }
  return { ok: true, login };
}

async function handleExchange(
  request: Request,
  env: Env,
  cors: HeadersInit,
): Promise<Response> {
  const body = await readJson<ExchangeBody>(request);
  if (!body || typeof body.code !== "string" || body.code.length === 0) {
    return jsonResponse(
      400,
      { error: "invalid_request", message: "missing code" },
      cors,
    );
  }

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    client_secret: env.GITHUB_CLIENT_SECRET,
    code: body.code,
  });
  if (typeof body.redirectUri === "string" && body.redirectUri.length > 0) {
    params.set("redirect_uri", body.redirectUri);
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "weiying-portfolio-oauth-proxy",
      },
      body: params.toString(),
    },
  );

  if (!tokenResponse.ok) {
    return jsonResponse(
      502,
      { error: "github_token_endpoint_failed", status: tokenResponse.status },
      cors,
    );
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
  };

  if (tokenPayload.error || !tokenPayload.access_token) {
    return jsonResponse(
      400,
      {
        error: tokenPayload.error ?? "no_access_token",
        message:
          tokenPayload.error_description ??
          "GitHub did not return an access token.",
      },
      cors,
    );
  }

  const verification = await verifyAllowedLogin(tokenPayload.access_token, env);
  if (!verification.ok) {
    // 立即撤銷 token，避免遺留授權
    await revokeToken(tokenPayload.access_token, env).catch(() => undefined);
    return jsonResponse(
      403,
      {
        error: "forbidden",
        message: "此 GitHub 帳號未被允許登入管理後台。",
        reason: verification.reason,
        login: verification.login,
      },
      cors,
    );
  }

  return jsonResponse(
    200,
    {
      access_token: tokenPayload.access_token,
      scope: tokenPayload.scope ?? "",
      token_type: tokenPayload.token_type ?? "bearer",
      login: verification.login ?? null,
    },
    cors,
  );
}

async function revokeToken(accessToken: string, env: Env): Promise<Response> {
  const basic = btoa(`${env.GITHUB_CLIENT_ID}:${env.GITHUB_CLIENT_SECRET}`);
  return fetch(
    `https://api.github.com/applications/${env.GITHUB_CLIENT_ID}/token`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${basic}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "weiying-portfolio-oauth-proxy",
      },
      body: JSON.stringify({ access_token: accessToken }),
    },
  );
}

async function handleRevoke(
  request: Request,
  env: Env,
  cors: HeadersInit,
): Promise<Response> {
  const body = await readJson<RevokeBody>(request);
  if (
    !body ||
    typeof body.access_token !== "string" ||
    body.access_token.length === 0
  ) {
    return jsonResponse(
      400,
      { error: "invalid_request", message: "missing access_token" },
      cors,
    );
  }
  const response = await revokeToken(body.access_token, env);
  if (response.status === 204) {
    return jsonResponse(200, { revoked: true }, cors);
  }
  return jsonResponse(
    response.status,
    { revoked: false, status: response.status },
    cors,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const allowList = parseList(env.ALLOWED_ORIGINS);
    if (origin && !allowList.includes(origin)) {
      return jsonResponse(403, { error: "origin_not_allowed" }, cors);
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(200, { ok: true }, cors);
    }
    if (request.method === "POST" && url.pathname === "/exchange") {
      return handleExchange(request, env, cors);
    }
    if (request.method === "POST" && url.pathname === "/revoke") {
      return handleRevoke(request, env, cors);
    }
    return jsonResponse(404, { error: "not_found" }, cors);
  },
} satisfies ExportedHandler<Env>;
