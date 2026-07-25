# 個人求職作品集網站 (Astro)

這個專案是以 Astro 建置的個人作品集網站。主要內容由 `src/content/**` 的 Markdown 驅動，並透過 Pages CMS 管理；程式碼推送到 `main` 後，會由 GitHub Actions 自動部署到 GitHub Pages。

## 核心特點

- **Git-based CMS**：使用 Pages CMS 直接編輯內容並提交到 repo。
- **內容模型清楚**：透過 Astro Content Collections 管理 projects 與各靜態頁內容。
- **多頁導覽**：首頁、經歷、技術棧、聯絡我、專案詳情頁完整分離。
- **README-only 串接**：專案詳情頁的外部連結改為 README 展示站（`portfolio-readmes`）。
- **安全加固**：在 `BaseLayout` 以 meta 方式加入 CSP（適配 GitHub Pages 無自訂 header 情境）。
- **自動部署**：push `main` 後執行 `lint`、`typecheck`、`build` 與 Pages deploy。

## 技術棧

- **框架**：Astro 5 + React 19
- **樣式**：Tailwind CSS + PostCSS
- **內容**：Astro Content Collections + Markdown
- **部署**：GitHub Pages + GitHub Actions
- **內容後台**：Pages CMS

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
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── admin/index.astro
│   │   ├── index.astro
│   │   ├── experience.astro
│   │   ├── stack.astro
│   │   ├── contact.astro
│   │   └── projects/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/global.css
├── astro.config.mjs
├── postcss.config.cjs
├── tailwind.config.mjs
└── package.json
```

## 內容管理（Pages CMS）

- 站內入口：`https://ying98012.github.io/website/admin/`
- CMS 平台：[pagescms.org](https://pagescms.org/)
- 設定檔：根目錄 `.pages.yml`（並保留 `admin/config.yml` 相容配置）

### 第一次使用

1. 開啟站內 `/admin/`，或直接到 [pagescms.org](https://pagescms.org/) 登入。
2. 用 GitHub 帳號登入，並授權 Pages CMS App 可寫入 repo `ying98012/website`。
3. 在 Pages CMS 選擇此 repo；介面會依 `.pages.yml` 顯示可編輯內容。
4. 儲存後會直接 commit 到 GitHub，觸發網站自動部署（通常數分鐘後生效）。

### 後台有哪些內容可編輯

| 後台項目        | 對應檔案                                 | 影響頁面                     |
| --------------- | ---------------------------------------- | ---------------------------- |
| Projects        | `src/content/projects/*.md`              | 首頁精選、全部專案、專案詳情 |
| Home Page       | `src/content/home-page/content.md`       | 首頁標題、按鈕、精選區標題   |
| Experience Page | `src/content/experience-page/content.md` | 經歷頁                       |
| Stack Page      | `src/content/stack-page/content.md`      | 技術棧頁                     |
| Contact Page    | `src/content/contact-page/content.md`    | 聯絡我頁                     |

### 修改一般頁面內容（首頁／經歷／技術棧／聯絡）

1. 進入 Pages CMS，左側選擇對應項目（例如 `Home Page`）。
2. 修改欄位（標題、說明、按鈕文字／連結等）。
3. 按 Save／儲存，確認 commit 成功。
4. 等待 GitHub Actions 部署完成後重新整理網站查看。

### 專案：新增

1. 左側選擇 `Projects`。
2. 點右上角 `Add an entry`。
3. 填寫必填欄位：
   - `Project Title`：專案標題
   - `Slug`：網址用英文代號（例如 `ai-ops-dashboard`），會對應 `/projects/ai-ops-dashboard/`
   - `Summary`：簡短說明（詳情頁側欄會顯示）
   - `Tech Stack`：技術標籤列表
   - `Cover Image`：封面圖（上傳後會放到 `public/uploads/`）
   - `Published At`：發布日期（列表依此由新到舊排序）
4. 選填：
   - `Cover Aspect`：封面顯示比例，可選 正方形／直式／橫式（未選為正方形）
   - `Screenshots`：作品截圖，可一次多選上傳（詳情頁橫向展示；可不上傳）
   - `README URLs`：可新增多筆「標籤 + 網址」（例如 README 展示頁、Demo），不填則詳情頁不顯示連結按鈕
   - `Video URL`、正文 `Content`（詳情頁內文）、`Featured`（是否上首頁精選）
5. Save 後會新增 `src/content/projects/<slug>.md`，並觸發部署。

新增前建議先在 `portfolio-readmes` 建好同名 slug 展示頁，再回來填 `README URLs`。`Slug` 建立後不建議再改，否則舊網址會失效。

### 專案：修改

1. 左側選擇 `Projects`。
2. 在列表點開要改的專案。
3. 修改需要的欄位後 Save。
4. 等待部署完成，到網站確認首頁／全部專案／詳情頁。

### 專案：刪除

1. 左側選擇 `Projects`。
2. 開啟該專案，或在列表該列的 `Actions`。
3. 選擇 Delete／刪除並確認。
4. Save／確認後會刪除對應 `.md`；下次部署後網站不再顯示該專案。

刪除無法從 CMS 一鍵還原，若誤刪需從 GitHub commit 歷史還原檔案。

### 修改精選專案（Featured）

首頁「精選專案」區**只顯示** `Featured = true` 的專案；「全部專案」頁會顯示全部。

1. 進入 Pages CMS → `Projects`。
2. 開啟要調整的專案。
3. 找到 `Featured` 開關：
   - 打開（`true`）：出現在首頁精選，卡片會顯示 Featured 標籤
   - 關閉（`false`）：只出現在「全部專案」頁
4. 儲存後等待部署，再檢查首頁與「全部專案」頁。

若所有專案都關閉 Featured，首頁精選區會顯示「目前沒有精選專案」。

### 本機直接改 Markdown（進階）

不經過 CMS 也可以直接編輯 `src/content/**`：

```bash
npm run dev
```

- 新增：新增 `src/content/projects/<slug>.md`
- 修改：編輯對應 `.md` 的 frontmatter／正文
- 刪除：刪除該 `.md` 檔
- 精選：設 `featured: true` 或 `false`

改完後 commit／push 到 `main` 同樣會觸發部署。

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

## README 展示站（README-only）

作品詳情頁可透過 `README URLs` 新增多筆外部連結（標籤 + 網址）；未填則不顯示連結區。

- 基底網址（常用）：`https://ying98012.github.io/portfolio-readmes/`
- 連結欄位：`src/content/projects/*.md` 的 `readmeUrls`
- 範例：

```yaml
readmeUrls:
  - label: README 展示頁
    url: https://ying98012.github.io/portfolio-readmes/ai-ops-dashboard/
```

建議內容維護策略：

1. 在 `portfolio-readmes`（公開 repo）維護 README 展示內容。
2. 真正原始碼放 private repo，不對外公開。
3. 新增作品時先建立同名 slug 展示頁，再更新本專案對應 `readmeUrls`。
