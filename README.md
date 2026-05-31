# 個人求職作品集網站 (Astro)

這是一個以 Astro 建置的個人作品集網站，前端頁面由 `src/content/**` 的 Markdown 內容驅動，並整合 Pages CMS 進行可視化編輯。程式碼推送到 `main` 後，會由 GitHub Actions 自動部署到 GitHub Pages。

## 核心特點

- **Git-based CMS**：使用 Pages CMS 直接編輯 repo 內容並提交變更。
- **內容模型清楚**：透過 Astro Content Collections 管理 projects 與各靜態頁內容。
- **多頁導覽**：首頁、經歷、技術棧、聯絡我與作品詳情頁分離。
- **技術展示友善**：支援作品縮圖、技術標籤與 YouTube/Vimeo 影片嵌入。
- **自動部署**：push `main` 後執行 `lint`、`typecheck`、`build` 與 Pages deploy。

## 技術棧

- **框架**：Astro 5 + React 19
- **樣式**：Tailwind CSS + PostCSS
- **內容**：Astro Content Collections + Markdown
- **部署**：GitHub Pages + GitHub Actions

## 本機開發

```bash
npm install
npm run dev
```

常用檢查指令：

```bash
npm run lint
npm run typecheck
npm run build
```

## 專案結構

```text
.
├── .github/workflows/deploy.yml
├── .pages.yml
├── admin/
│   ├── config.yml
│   └── index.html
├── public/uploads/
├── src/
│   ├── components/
│   ├── content/
│   │   ├── config.ts
│   │   ├── projects/
│   │   ├── home-page/content.md
│   │   ├── experience-page/content.md
│   │   ├── stack-page/content.md
│   │   └── contact-page/content.md
│   ├── layouts/
│   ├── pages/
│   │   ├── admin/index.astro
│   │   ├── index.astro
│   │   ├── experience.astro
│   │   ├── stack.astro
│   │   ├── contact.astro
│   │   └── projects/[slug].astro
│   └── styles/global.css
├── astro.config.mjs
├── postcss.config.cjs
├── tailwind.config.mjs
└── package.json
```

## 內容管理（Pages CMS）

目前唯一後台為 **Pages CMS**。

- 站內入口：`/admin/`（`src/pages/admin/index.astro`）
- CMS 平台：[pagescms.org](https://pagescms.org/)

使用流程：

1. 用 GitHub 帳號登入 Pages CMS。
2. 確認已授權 Pages CMS App 可寫入 repo `ying98012/website`。
3. CMS 會讀取根目錄 `.pages.yml`（並保留 `admin/config.yml` 相容配置）。
4. 儲存後會直接 commit 到 GitHub，觸發網站自動部署。

## 部署設定（GitHub Pages）

目前部署目標：

- 網站：`https://ying98012.github.io/website/`
- 管理入口：`https://ying98012.github.io/website/admin/`

關鍵設定：

- `astro.config.mjs`
  - `site: "https://ying98012.github.io"`
  - `base: "/website"`
- `.github/workflows/deploy.yml`
  - push `main` 時執行 build 與 `actions/deploy-pages`

若 repo 名稱或帳號更動，請同步調整 `site` / `base` 與相關連結。
