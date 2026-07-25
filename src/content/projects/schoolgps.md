---
title: 校園導航與資訊整合平台
slug: schoolgps
summary: 校園室內導航與 AI 助手 Android App，解決多樓教學大樓內 GPS 失效問題。
techStack:
  - Kotlin
  - Jetpack Compose
  - Mapbox
  - Firebase
  - Gemini
  - Room
coverImage: /uploads/專題圖片/Screenshot_20260725_164637.jpg
screenshots:
  - /uploads/專題圖片/Screenshot_20260725_164637.jpg
  - /uploads/專題圖片/Screenshot_20260725_164656.jpg
videoUrl: https://youtu.be/oAL-C9KxIZs
readmeUrls:
  - label: README 展示頁
    url: https://ying98012.github.io/portfolio-readmes/%E6%A0%A1%E5%9C%92%E6%99%BA%E6%85%A7%E8%81%8A%E5%A4%A9%E5%8A%A9%E6%89%8B/
featured: true
publishedAt: 2026-07-25
---
以國立勤益科技大學工程館為場域，結合自建室內路網、樓層偵測與 AI 助手，讓使用者在 B1～7F 仍能穩定導航與查詢校園資訊。

- 自建室內路網 + Dijkstra，支援豎井三段式跨樓（樓梯／電梯不混用）
- WiFi／ESP32 雙模式樓層偵測，並以 PDR 在 GPS 失訊時延續導航
- AI 校園助手整合校網公告、FAQ 與 Gemini，並以 Firebase 管理帳號與額度

