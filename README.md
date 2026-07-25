# 個人求職作品集網站 (Astro)

以 Astro 建置的個人作品集網站。內容由 `src/content/**` 的 Markdown 驅動，透過 Pages CMS 編輯；推送到 `main` 後由 GitHub Actions 自動部署到 GitHub Pages。

## 網站與後台

| 項目     | 網址                                       |
| -------- | ------------------------------------------ |
| 網站     | https://ying98012.github.io/website/       |
| 管理後台 | https://ying98012.github.io/website/admin/ |
| CMS 平台 | [pagescms.org](https://pagescms.org/)      |
| 原始碼   | https://github.com/ying98012/website       |

## 核心特點

- **Git-based CMS**：Pages CMS 儲存後直接 commit 到 GitHub，觸發部署。
- **Content Collections**：以 schema 管理 projects 與各靜態頁內容。
- **多頁導覽**：首頁、全部專案、專案詳情、經歷、技術棧、聯絡我。
- **精選／全部分離**：首頁只顯示 `featured: true`；`/projects/` 顯示全部專案。
- **Play Store 風格詳情頁**：封面比例、截圖輪播、影片、多筆 README／外部連結。
- **README-only 串接**：詳情頁外部連結指向 `portfolio-readmes` 展示站（可選填）。
- **安全加固**：`BaseLayout` 以 meta CSP 適配 GitHub Pages。
- **自動部署**：push `main` 後執行 `lint`、`typecheck`、`build` 與 Pages deploy。

## 技術棧

- **框架**：Astro 5 + React 19
- **樣式**：Tailwind CSS + PostCSS
- **內容**：Astro Content Collections + Markdown
- **部署**：GitHub Pages + GitHub Actions
- **內容後台**：Pages CMS（設定檔：根目錄 `.pages.yml`，並保留 `admin/config.yml`）

## 本機開發

```bash
npm install
npm run dev
```

常用檢查：

```bash
npm run lint
npm run typecheck
npm run build
```

路徑別名：`@/*` → `./src/*`（見 `tsconfig.json`）。

## 專案結構

```text
.
├── .github/workflows/deploy.yml
├── .pages.yml
├── .prettierignore          # CMS 產出的 src/content/**/*.md 不進 Prettier 檢查
├── admin/
│   ├── config.yml
│   └── index.html
├── public/uploads/
├── src/
│   ├── components/          # ProjectCard、ProjectMediaCarousel、TopNav…
│   ├── content/
│   │   ├── config.ts        # Content Collections schema
│   │   ├── projects/        # 各專案 *.md（例如 schoolgps.md）
│   │   ├── home-page/content.md
│   │   ├── experience-page/content.md
│   │   ├── stack-page/content.md
│   │   └── contact-page/content.md
│   ├── layouts/BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro              # 首頁（精選專案）
│   │   ├── experience.astro
│   │   ├── stack.astro
│   │   ├── contact.astro
│   │   ├── admin/index.astro
│   │   └── projects/
│   │       ├── index.astro          # 全部專案
│   │       └── [slug].astro         # 專案詳情
│   └── styles/global.css
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## 內容管理（Pages CMS）

### 第一次使用

1. 開啟站內 `/admin/`，或到 [pagescms.org](https://pagescms.org/) 登入。
2. 用 GitHub 登入，授權 Pages CMS App 可寫入 `ying98012/website`。
3. 選擇此 repo；介面依 `.pages.yml` 顯示可編輯內容。
4. Save 後會 commit 到 `main` 並觸發部署（通常數分鐘；請到 Actions 確認成功）。

### 後台可編輯項目

| 後台項目        | 對應檔案                                 | 影響頁面                                   |
| --------------- | ---------------------------------------- | ------------------------------------------ |
| Projects        | `src/content/projects/*.md`              | 首頁精選、全部專案、專案詳情               |
| Home Page       | `src/content/home-page/content.md`       | 首頁標題、按鈕、精選區標題                 |
| Experience Page | `src/content/experience-page/content.md` | 經歷頁                                     |
| Stack Page      | `src/content/stack-page/content.md`      | 技術棧頁（技能、工具、Foundations） |
| Contact Page    | `src/content/contact-page/content.md`    | 聯絡我頁                                   |

### 修改一般頁面（首頁／經歷／技術棧／聯絡）

1. Pages CMS 左側選對應項目。
2. 改欄位後 Save，確認 commit 成功。
3. 到 GitHub Actions 確認 **Deploy Portfolio** 為成功，再強制重新整理網站。

### 專案：新增

1. 選 `Projects` → `Add an entry`。
2. **必填**：
   - `Project Title`：標題
   - `Slug`：**只用英數與連字號**（例如 `schoolgps`），對應 `/projects/schoolgps/`。勿用純中文，否則可能出現 `Invalid extension ""` 無法儲存。
   - `Summary`：簡短說明
   - `Tech Stack`：技術標籤
   - `Cover Image`：封面圖（上傳至 `public/uploads/`）
   - `Published At`：發布日（列表由新到舊）
3. **選填**：
   - `Cover Aspect`：正方形／直式／橫式（預設正方形）
   - `Screenshots`：多張截圖（詳情頁橫向輪播）
   - `Video URL`：影片連結
   - `README URLs`：多筆「標籤 + 網址」（未填則詳情頁不顯示主 CTA）
   - `Content`：詳情正文
   - `Featured`：是否出現在首頁精選
4. Save 後新增 `src/content/projects/<slug>.md` 並觸發部署。

建議先在 `portfolio-readmes` 建好展示頁，再填 `README URLs`。Slug 建立後不建議再改。

### 專案：修改／刪除／精選

- **修改**：開啟該專案 → 改欄位 → Save → 等部署。
- **刪除**：Actions → Delete；無法從 CMS 一鍵還原，需從 Git 歷史救回。
- **精選**：`Featured = true` 才上首頁；`/projects/` 仍顯示全部。全部關閉精選時，首頁會顯示「目前沒有精選專案」。

### 本機直接改 Markdown（進階）

```bash
npm run dev
```

編輯 `src/content/**` 後，commit／push 到 `main` 同樣會部署。

## 部署與除錯

### 部署設定

- `astro.config.mjs`：`site: "https://ying98012.github.io"`、`base: "/website"`
- `.github/workflows/deploy.yml`：push `main` 時 build 並 `actions/deploy-pages`
- Actions：https://github.com/ying98012/website/actions

若 repo 名稱或帳號變更，請同步改 `site`／`base` 與 README 連結。

### CMS 已 Save 但網站沒變？

1. **不必本機再 push**：Pages CMS Save 已寫入 GitHub。
2. 到 Actions 看 **Deploy Portfolio** 是否失敗（常見原因：內容格式／建置錯誤）。
3. `src/content/**/*.md` 已列入 `.prettierignore`，避免 CMS 產出 Markdown 被 Prettier 擋下。
4. 部署成功後用 Ctrl+F5 強制重新整理。
5. 確認網址：全部專案為 `/website/projects/`，詳情為 `/website/projects/<slug>/`。

## README 展示站（README-only）

詳情頁透過 `readmeUrls` 顯示外部連結；未填則不顯示按鈕區。

```yaml
readmeUrls:
  - label: README 展示頁
    url: https://ying98012.github.io/portfolio-readmes/schoolgps/
```

建議：

1. 在公開的 `portfolio-readmes` 維護展示內容。
2. 原始碼可放 private repo。
3. 先建展示頁，再回來填本站 `readmeUrls`。
