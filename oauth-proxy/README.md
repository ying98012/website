# OAuth Proxy（Cloudflare Worker）

本目錄提供管理後台所需的 **GitHub OAuth 2.0 授權碼交換代理**，作為純靜態 GitHub Pages 站台的伺服端補強。

```
[Astro 靜態站]  --(code)-->  [Cloudflare Worker]  --(client_secret + code)-->  [GitHub]
                <-(token)--                       <--(access_token)--
```

## 端點

| Method | Path        | 用途                                                |
| ------ | ----------- | --------------------------------------------------- |
| GET    | `/health`   | 健康檢查                                            |
| POST   | `/exchange` | 將授權碼換成 access token，並驗證白名單 GitHub 帳號 |
| POST   | `/revoke`   | 撤銷 access token（登出時呼叫）                     |

`/exchange` 與 `/revoke` 受 `Origin` 白名單限制（在 `wrangler.toml` 的 `ALLOWED_ORIGINS` 設定）。

## 一次性設定

### 1. 建立 GitHub OAuth App（正式環境）

進入 GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App，填入：

- **Application name**：`weiying-portfolio-admin`（任意）
- **Homepage URL**：`https://ying98012.github.io/website/`
- **Authorization callback URL**（GitHub OAuth App 只能填一個）：
  - `https://ying98012.github.io/website/admin/callback/`

> 若要本機開發，請另外建立第二個 OAuth App，將 callback 設為
> `http://localhost:4321/admin/callback/`。

建立後記下 **Client ID**，並 Generate 一個 **Client secret**。

### 2. 安裝與登入 wrangler

```bash
cd oauth-proxy
npm install
npx wrangler login
```

### 3. 設定機密（不會進 git）

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

### 4. 調整 `wrangler.toml`

- `ALLOWED_ORIGINS`：列出所有允許呼叫的前端來源（站台正式域名 + 本機 dev）。
- `ALLOWED_LOGINS`：列出允許登入管理後台的 GitHub 帳號（小寫，逗號分隔）。

### 5. 部署

```bash
npm run deploy
```

Wrangler 會回傳 Worker 的 URL，例如：

```
https://weiying-portfolio-oauth.<account>.workers.dev
```

把這個 URL 填到專案根目錄 `.env`（或 GitHub Actions `vars`）的 `PUBLIC_OAUTH_PROXY_URL`。

## 本機開發

```bash
cp .dev.vars.example .dev.vars   # 填入 Client ID / Secret
npm run dev                      # 預設啟動於 http://localhost:8787
```

開發時請把專案根目錄的 `PUBLIC_OAUTH_PROXY_URL` 指向 `http://localhost:8787`。

## 安全注意事項

- `GITHUB_CLIENT_SECRET` 僅存在 Worker secret，**永不**回傳給瀏覽器。
- Worker 會以 `ALLOWED_ORIGINS` 限制 CORS，避免被其他站台呼叫。
- `/exchange` 取得 token 後立即以 `GET /user` 驗證 GitHub 帳號是否在 `ALLOWED_LOGINS`，未通過則直接撤銷該 token。
- 前端使用 `state` 參數防 CSRF；access token 僅放在 `sessionStorage`，分頁關閉即失效。
