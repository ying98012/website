# 個人求職作品集網站 (Astro + Pages CMS)

這是一個面向前端/軟體工程職缺的作品集網站，以 Astro 靜態生成為核心，搭配 Pages CMS 做 Git-backed 內容管理，並透過 GitHub Actions 自動部署至 GitHub Pages。

## 核心特點

- **內容可維護**：以 Markdown 作為作品資料來源，CMS 可直接編輯。
- **多媒體展示**：作品詳情頁支援 YouTube/Vimeo 影片嵌入。
- **技術導向視覺**：Obsidian Synth 深色基調 + Vibrant 重點強調（Hybrid）。
- **自動部署**：`main` 分支推送後自動執行 lint、typecheck、build 與 Pages 部署。

## 技術棧

- **框架**：Astro 5 + React 19
- **樣式**：Tailwind CSS（自訂 Obsidian/Vibrant Token）
- **內容**：Astro Content Collections + Markdown
- **CMS**：Pages CMS（設定於 `admin/config.yml`）
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
│   ├── config.yml
│   └── index.html
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
│   │   ├── index.astro
│   │   └── projects/[slug].astro
│   └── styles/global.css
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## 部署注意事項

- `astro.config.mjs` 目前使用：
  - `site: https://ying98012.github.io`
  - `base: /website`
- 若 repository 名稱或 GitHub 帳號不同，請同步調整上述值。
