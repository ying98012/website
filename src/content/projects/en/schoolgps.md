---
title: Campus Navigation & Info Platform
projectSlug: schoolgps
summary: An indoor campus navigation and AI assistant Android app that works when GPS fails inside multi-floor teaching buildings.
techStack:
  - Kotlin
  - Jetpack Compose
  - Mapbox
  - Firebase
  - Gemini
  - Room
coverImage: /uploads/Gemini_Generated_Image_lm7dj7lm7dj7lm7d.png
coverAspect: square
screenshots:
  - /uploads/專題圖片/Screenshot_20260725_164637.jpg
  - /uploads/專題圖片/Screenshot_20260725_164656.jpg
  - /uploads/專題圖片/Screenshot_20260725_164659.jpg
  - /uploads/專題圖片/Screenshot_20260725_164755.jpg
  - /uploads/專題圖片/Screenshot_20260725_164803.jpg
  - /uploads/專題圖片/Screenshot_20260725_164810.jpg
  - /uploads/專題圖片/Screenshot_20260725_164816.jpg
videoUrl: https://youtu.be/oAL-C9KxIZs
readmeUrls:
  - label: README showcase
    url: https://ying98012.github.io/portfolio-readmes/SchoolGPS%20-%20%E6%A0%A1%E5%9C%92%E6%99%BA%E6%85%A7%E5%8A%A9%E6%89%8B/
featured: true
publishedAt: 2026-07-25
---
Built for the Engineering Building at National Chin-Yi University of Technology, combining a custom indoor road network, floor detection, and an AI assistant so users can navigate and look up campus information reliably from B1 through 7F.

- Custom indoor graph + Dijkstra, with a three-stage vertical shaft model that keeps stairs and elevators separate
- Dual-mode WiFi / ESP32 floor detection, with PDR to continue navigation when GPS is unavailable
- AI campus assistant integrating school announcements, FAQ, and Gemini, with Firebase for accounts and quotas
