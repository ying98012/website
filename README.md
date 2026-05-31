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
│   ├── config.yml              # Pages CMS schema（相容配置）
│   └── index.html              # 舊版入口，自動轉跳至 /admin/
├── public/
│   ├── robots.txt
│   └── uploads/
├── src/
│   ├── components/
│   ├── content/
│   │   ├── config.ts
│   │   └── projects/
│   ├── layouts/
│   ├── pages/
│   │   ├── admin/index.astro   # Pages CMS 管理入口說明
│   │   ├── contact.astro
│   │   ├── experience.astro
│   │   ├── index.astro
│   │   ├── projects/[slug].astro
│   │   └── stack.astro
│   └── styles/global.css
├── .pages.yml                  # Pages CMS 主設定
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## 內容管理（Pages CMS）

本專案已改為 **Pages CMS** 作為唯一後台內容管理方式。

管理入口：`/admin/`

### 使用流程

1. 前往 [pagescms.org](https://pagescms.org/) 並使用 GitHub 登入。
2. 確保已安裝 Pages CMS GitHub App，且本 repo (`ying98012/website`) 有寫入權限。
3. 開啟 repo 後，Pages CMS 會讀取根目錄 `.pages.yml`（及 `admin/config.yml` 相容配置）。
4. 編輯並儲存內容後，變更會直接提交到 GitHub，再由 GitHub Actions 自動部署。

### 設定檔重點

- `.pages.yml`：Pages CMS 主設定，定義 collections、欄位、媒體路徑。
- `admin/config.yml`：保留相容配置，內容與 `.pages.yml` 同步。

## 部署注意事項（GitHub Pages）

- `astro.config.mjs` 目前使用：
  - `site: https://ying98012.github.io`
  - `base: /website`
- 若 repository 名稱或 GitHub 帳號不同，請同步調整上述值。
