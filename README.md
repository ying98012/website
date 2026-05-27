# 個人求職作品集網站 (Astro)

這是一個面向前端/軟體工程職缺的作品集網站，以 Astro 靜態生成為核心，內容以 Markdown 方式維護，並透過 GitHub Actions 自動部署至 GitHub Pages。

## 核心特點

- **內容可維護**：以 Markdown 作為作品資料來源，直接透過 Git 版本管理維護。
- **多媒體展示**：作品詳情頁支援 YouTube/Vimeo 影片嵌入。
- **頁面化導覽**：新增獨立的 `經歷`、`技術棧`、`聯絡我` 頁面，並由頂部導覽列直接切換。
- **技術導向視覺**：Obsidian Synth 深色基調 + Vibrant 重點強調（Hybrid）。
- **自動部署**：`main` 分支推送後自動執行 lint、typecheck、build 與 Pages 部署。

## 技術棧

- **框架**：Astro 5 + React 19
- **樣式**：Tailwind CSS（自訂 Obsidian/Vibrant Token）
- **內容**：Astro Content Collections + Markdown
- **部署**：GitHub Pages + GitHub Actions

## 本機開發

```bash
npm install
npm run dev
```

常用指令：

```bash
npm run lint
npm run typecheck
npm run build
```

## 專案結構

```text
.
├── .github/workflows/deploy.yml
├── admin/
│   └── index.html              # 舊版入口，自動轉跳至 /admin/
├── oauth-proxy/                # GitHub OAuth Cloudflare Worker
│   ├── src/worker.ts
│   ├── wrangler.toml
│   └── README.md
├── public/
│   ├── robots.txt
│   └── uploads/
├── src/
│   ├── components/
│   ├── content/
│   │   ├── config.ts
│   │   └── projects/
│   ├── layouts/
│   ├── lib/
│   │   └── auth.ts             # 前端 OAuth 客戶端工具
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── index.astro     # 登入入口
│   │   │   └── callback.astro  # OAuth 授權碼回呼處理
│   │   ├── admin-dashboard.astro
│   │   ├── contact.astro
│   │   ├── experience.astro
│   │   ├── index.astro
│   │   ├── projects/[slug].astro
│   │   └── stack.astro
│   └── styles/global.css
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## 管理後台 GitHub OAuth 2.0 登入

管理後台 (`/admin/`) 已啟用 GitHub OAuth 2.0 登入。由於 GitHub Pages 為純靜態，token 交換採用獨立的 Cloudflare Worker（位於 `oauth-proxy/`）作為伺服端代理。

### 啟用步驟

1. **建立 GitHub OAuth App**
   - GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
   - GitHub OAuth App 的 Authorization callback URL 只能填一個，正式環境請填：
     - `https://ying98012.github.io/website/admin/callback/`
   - 若要本機開發，請建立第二個 OAuth App，callback 填：
     - `http://localhost:4321/admin/callback/`
   - 記下 **Client ID**，並 Generate **Client Secret**。

2. **部署 OAuth Proxy（Cloudflare Worker）**

   ```bash
   cd oauth-proxy
   npm install
   npx wrangler login
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   npm run deploy
   ```

   - 編輯 `oauth-proxy/wrangler.toml` 的 `ALLOWED_ORIGINS`（站台域名 + dev origin）與 `ALLOWED_LOGINS`（允許登入的 GitHub 帳號）。
   - 詳細說明見 `oauth-proxy/README.md`。

3. **設定前端環境變數**

   複製 `.env.example` 為 `.env` 並填入：

   ```bash
   PUBLIC_OAUTH_CLIENT_ID=<從 OAuth App 取得的 Client ID>
   PUBLIC_OAUTH_PROXY_URL=https://weiying-portfolio-oauth.<account>.workers.dev
   PUBLIC_OAUTH_SCOPE=public_repo read:user
   PUBLIC_OAUTH_ALLOWED_LOGINS=ying98012
   ```

   - GitHub Pages 部署時，於 GitHub repo 的 **Settings → Secrets and variables → Actions → Variables** 設定相同的 `PUBLIC_OAUTH_*` 變數，並在 `.github/workflows/deploy.yml` 的 build 步驟以 `env:` 注入。

### 安全模型

- `GITHUB_CLIENT_SECRET` 只存在 Cloudflare Worker secret，前端永遠看不到。
- 前端登入流程使用 `state` 參數防 CSRF。
- access token 僅放在 `sessionStorage`，分頁關閉立即失效。
- Worker 取得 token 後立刻以 `GET /user` 驗證 GitHub 帳號是否在 `ALLOWED_LOGINS` 白名單；不在白名單則立刻撤銷 token 並回 403。
- 登出時前端會呼叫 Worker `/revoke` 來確實撤銷該 token。

## 部署注意事項

- `astro.config.mjs` 目前使用：
  - `site: https://ying98012.github.io`
  - `base: /website`
- 若 repository 名稱或 GitHub 帳號不同，請同步調整上述值，並更新 OAuth App 的 callback URL 與 `oauth-proxy/wrangler.toml` 的 `ALLOWED_ORIGINS`。
