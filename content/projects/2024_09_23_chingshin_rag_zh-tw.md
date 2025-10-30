---
title: "靜心 RAGi"
category: "全端開發"
subcategory: "校園專案"
description: "一個基於 RAG 的客製化聊天機器人，使用 Svelte、PyTorch 與 FastAPI 打造，且未使用 LangChain 等一體式框架。"
imageUrl: "images/optimized/projects/2024_09_23_chingshing_ragi/titlecard.webp"
year: "2023-2024"
date: "2024-09-23"
role: "設計師與開發者"
technologies: ["Svelte", "PyTorch", "FastAPI"]
pinned: 6
featured: true
---

## 專案概覽
Chingshin RAGi 源於我們對校務系統在資源分配上低效的觀察。靜心高中作為私立學校，知名度有限，學生與家長對學校政策時常有疑問，而網站導覽的複雜更讓資訊取得變得不易。我們將此視為訓練開發經驗的良機，透過結合 RAG 技術打造客製化聊天機器人，全程未使用 LangChain 等一體式框架。

專案初期由 Ak 指導，而我主要負責後端 SQLite 資料庫建置、向量檢索開發，以及後期的介面優化。最終，本專案於**國家科學及技術委員會**主辦的 [**GenAI Star 競賽**](https://genaistars.org.tw/news/35)中榮獲**特優**，並代表靜心在研華文教基金會 ACT 論壇以全英文發表。
  
---

## 實作細節

### 資料庫
資料庫是 RAG 系統的基石，同時儲存向量嵌入索引與每筆資料的完整內容。

-  我們未採用 Pinecone、ChromaDB 等向量資料庫，而以 **SQLite** 搭配向量嵌入的 **JSON 格式**儲存，提升彈性。
-  起初嘗試透過 PyTorch 自 **TAIDE-7B** 提取最後一層隱藏層，期望統一 embedding 與生成任務，但模型的效能與準確性不理想。
-  後續改用專門的 embedding 模型 **bge-small-zh-v1.5**，大幅提升速度與精準度。
-  使用 **BeautifulSoup (BS4)** 爬取學校網站內容，並以程式自動化匯入資料庫。

### 搜尋引擎
我們實作一套結合「字詞搜尋」與「語意搜尋」的**混合式搜尋引擎**：

-  **字詞搜尋（Lexical search）**：回應迅速，處理關鍵字查詢表現優異；採用 BM25 排名。
-  **語意搜尋（Semantic search）**：以向量嵌入理解自然語言查詢。
-  開發後期導入 **HNSWlib** 與 **multi-threading** 優化，顯著降低搜尋延遲。
-  以 **spaCy** 進行 NER 作為前置步驟，判斷使用者意圖，動態選擇最適合的搜尋策略。

### API 模組
-  以 **FastAPI** 打造，重視它的高效能與對 **WebSocket** 的良好支援。
-  初期基於成本效益採用 **Gemini API**。
-  後期因模型啟動速度更快，遷移至 **OpenAI API**。
-  遷移後啟用 **streaming responses**，大幅改善使用者體驗。

### 前端
-  前端使用 **Svelte**，開發效率高、輕量且效能佳，適合小型應用。
-  開發後期新增**下拉式選單**，提升互動體驗。

---

## 專案宣傳工作

### 簡報設計
決賽準備期間，我用 Affinity Designer 從零建立全新的視覺語言。中文版簡報利用中文字形的等寬特性達到視覺平衡，字體組合採「內文宋體＋標題蘭亭黑」。同時也為研華文教基金會 ACT 論壇製作全英文版本，並強化與 SDGs 的連結（我仍然最喜歡中文版的呈現）。

![中文版簡報](images/optimized/projects/2024_09_23_chingshing_ragi/rag_chinese_slides.webp)
![英文版簡報](images/optimized/projects/2024_09_23_chingshing_ragi/rag_english_slides.webp)

### 影片設計
為參加 GenAI Star 競賽，我製作了一段簡短介紹影片，展示 Chingshin RAGi 的功能與特色，內容涵蓋設計理念及簡單的展示。
![Chingshin RAGi 介紹影片](https://drive.google.com/file/d/1A833CcgTPK7o6xh1lr7BhCPZIABs1oLc/view?usp=sharing)

---

## 致謝
感謝出色的團隊夥伴，特別謝謝 PM Chaney 在各項協調與雜務上的辛勞，以及 Raymond 對 FastAPI 模組的貢獻；感謝 Ak 的指導與支持，也謝謝林逸萍主任對本專案的信任與鼓勵。這個專案不但深化了我們的技術能力，也讓我們在實務中切實體驗 RAG 技術的價值與潛力。

封面 mockup 由 [Mockup Free](https://unsplash.com/photos/a-cell-phone-with-the-number-fifteen-on-it-NcmG1X1DWrI) 的素材製作而成。