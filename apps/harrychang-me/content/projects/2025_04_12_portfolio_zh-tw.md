---
title: "個人網站"
category: "網站開發"
subcategory: "個人專案"
description: "一個基於 Turborepo monorepo 架構的雙網域作品集，採用 Next.js 打造，並整合了檔案式 CMS 與共享元件庫。"
imageUrl: "images/optimized/projects/2025_04_12_portfolio_design/titlecard.webp"
year: "2025"
date: "2025-04-12"
role: "設計師與開發者"
technologies: ["Next.js", "React", "TypeScript", "TailwindCSS"]
pinned: 5
featured: true
---

## 專案概覽

這個專案是一個現代化、高效能的平台，設計上能透過單一、統一的程式碼庫，同時運行 `harrychang.me` 和 `lab.harrychang.me` 兩個不同的網域。專案採用 **Turborepo monorepo** 架構，有效管理多個 Next.js 應用程式。選擇此架構是為了簡化開發流程，讓我能在主要作品集與實驗性網站之間共享程式碼，同時也為我姐姐的個人網站 `emilychang.me` 的開發提供支援。

主要作品集的核心，是一套客製化的 Markdown 內容管理系統。這套架構會在網站 build 階段，直接解析共用的 `content/` 目錄中的 Markdown 檔案來生成靜態頁面。這讓主網站不需依賴傳統資料庫，達成了高效能且易於維護的成果。

前端採用 **React** 與 **TypeScript** 開發，確保了程式碼庫的穩健性與型別安全。使用者介面則用 **TailwindCSS**，透過它 utility-first 的特性，實現了快速開發。網站的三欄式版面設計，靈感來自 [Joseph Zhang](https://joseph.cv/) 的作品集。

![作品集網站在 Affinity 中的版面與規劃](images/optimized/projects/2025_04_12_portfolio_design/affinity_branding-thumb.webp)
### 以內容為核心的多網域架構

這個專案的心臟是它極具彈性的架構。透過 Next.js 的 middleware，系統能根據不同的 subdomain 動態重寫請求，將使用者導向主要作品集或實驗性網站，而這一切都由同一個 Next.js 應用程式驅動。主要作品集的內容以 Markdown 檔案形式儲存，使其扮演了一個 Headless CMS 的角色。一個客製化程式會透過以下幾個關鍵函式庫來處理這些檔案：

-   `gray-matter`：用於解析每個檔案頭部的 YAML frontmatter，來提取 metadata。
-   `remark` 與 `remark-html`：將 Markdown 內容轉換為 HTML，以便在網頁上渲染。

這樣的架構將內容與呈現方式完全分離，讓更新網站內容就像操作 Git 一樣簡單。

### 技術亮點

在開發過程中，我特別著重於網站的效能、擴展性與功能的實現。



**Monorepo 的高效率**：透過 **Turborepo**，我們能將共用的 UI 元件、Hooks 與工具函式集中於 `packages/ui` 和 `packages/lib`，讓多個應用程式共享。這大幅減少了重複的程式碼，並簡化了依賴管理。

**靜態與動態渲染**：主要作品集採用靜態網站生成（SSG）以追求效能。所有頁面都在建置階段預先渲染完成，結合 Next.js 自動化的 code-splitting，確保了最快的載入速度。實驗性網站則採用動態渲染，以支援由資料庫驅動的功能。

**動態媒體處理**：我開發了一個名為 `transformMedia` 的客製化 Remark 插件，用來智慧地處理不同類型的媒體。它會遍歷 Markdown 結構，自動嵌入帶有自訂預覽圖的 YouTube 和 Google Drive 影片，同時將標準的圖片標籤轉換為優化過的 figure 元素，具備延遲載入與微光載入動畫。

**圖片最佳化**：透過 Scripting，自動將圖片轉換為現代的 WebP 格式並調整尺寸，同時產生低解析度的圖片預覽圖，用來實現模糊載入的視覺效果。

**國際化（i18n）**：網站透過客製化的客戶端 React Context，完整支援英文與繁體中文。內容是依據檔案後綴（`_zh-tw.md`）進行本地化，當特定內容的中文版本不存在時，網站會自動顯示英文版本。

![效能、無障礙、最佳實務與 SEO 皆獲得滿分的 Lighthouse 檢測報告](images/optimized/projects/2025_04_12_portfolio_design/lighthouse_benchmark.webp)

### 內容與功能

這個作品集旨在展示多元的作品與想法。

-   [**專案列表**](https://harrychang.me/#projects)：展示所有專案，每個專案都有獨立的頁面，包含詳細的描述、圖片與影片。
-   [**攝影畫廊**](https://harrychang.me/#gallery)：一系列影像的集合，每張圖片都有專屬的頁面進行詳細展示，並透過客製化的畫框系統提升視覺呈現效果。
-   [**理念**](https://harrychang.me/manifesto)：一個專屬頁面，用來表達驅動我的核心原則，讓讀者能更專注地閱讀。
-   [**論文閱讀**](https://harrychang.me/paper-reading)：動態更新的學術論文閱讀筆記列表。
-   [**工具與設定**](https://harrychang.me/uses)：列出我日常使用的工具與軟體。

本站的原始程式碼已開源於 [GitHub](https://github.com/Harrychangtw/portfolio-monorepo)，並採用 CC BY-NC 4.0 授權。網站內所有文字與圖片內容則保留版權。