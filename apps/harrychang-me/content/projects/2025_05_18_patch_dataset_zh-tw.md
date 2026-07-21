---
title: "PATCH 繁中資料集"
category: "學術研究"
subcategory: "LLM 安全"
description: "PATCH 是我透過共同第一作者研究開發，首個專為繁體中文 LLM 安全評估設計的大規模對抗性資料集。它利用量身制定的對抗性方法，透過參數高效的微調來實現有效的繁體中文安全分類器。"
imageUrl: "images/optimized/projects/2025_05_18_patch_dataset/titlecard.webp"
year: "2025"
date: "2025-05-18"
role: "共同第一作者"
pinned: 3
featured: true
technologies: [PyTorch, ChromaDB, HF Transformers]
tooltip: "共同第一作者的 EACL 研究，建立了首個繁體中文的大規模對抗性安全資料集。"
---

大型語言模型（LLM）徹底改變了我們與 AI 互動的方式，但確保其安全性始終是一項貓抓老鼠的挑戰。對於服務於台灣、香港及全球僑民社群數百萬人口的繁體中文而言，這項挑戰尤其嚴峻。儘管其廣泛使用，與簡體中文相比，繁體中文的資源仍然嚴重不足，尤其缺乏專門的安全評估資源。現有的多語言安全機制往往無法充分考慮繁體中文獨特的語言特性和文化細微差異，這在為該語言建構穩健的安全系統方面留下了關鍵的缺口。

今天，我很高興能分享我的共同第一作者研究：**PATCH (Prompt Assortment for Traditional Chinese Hazards)**，這是首個專為繁體中文安全評估設計的大規模對抗性資料集。這項研究已被 [EACL 2026 SRW (Non-archival)](https://2026.eacl.org/program/srw-accepted/#:~:text=PATCH%20Dataset:%20Empowering%20Traditional%20Chinese%20Safety%20Classifiers%20for%20Lightweight%20LLM) 錄取，它代表了一項持續進行的研究，未來將進一步改善並投稿至其他會議。由於這項工作仍在進行中，資料集與 Codebase 尚未公開，但將在最終發表後釋出。

### 什麼是 PATCH？

PATCH 是一個全面的安全評估資源，包含超過 82 萬個 prompts，其中包括 231,924 個不安全 prompts 和 593,020 個安全 prompts。與現有主要專注在簡體中文或使用不適合輸入分類的評估格式的中文安全資料集不同，PATCH 是專為訓練和評估繁體中文安全分類器而設計的。

此資料集與 [MLCommons 風險分類法](https://github.com/mlcommons/ailuminate) 對齊，涵蓋了從暴力犯罪到選舉假訊息等 13 個不同的危害類別。這種標準化的分類法確保了與 Llama Guard 等現有安全框架的相容性，同時能夠對各種類型的威脅進行系統性的評估。

### PATCH 的優勢

PATCH 透過幾項關鍵創新，解決了現有繁體中文安全資源的限制：

1.  **規模與多樣性：** PATCH 擁有超過 23 萬個不安全的 prompts，涵蓋 13 個危害類別，為分類器訓練提供了充足的數據量。這一規模遠遠超過現有的中文安全資料集，後者通常只包含數千個範例。
2.  **對抗性複雜度：** 此資料集整合了兩種互補的生成策略。PATCH-GPT 提供基線的有害 prompts，而 PATCH-RT 則採用了改良的 [Rainbow Teaming](https://arxiv.org/abs/2402.16822) 方法，生成對抗性、複雜的 prompts，用以測試分類器應對複雜攻擊的牢固性。
3.  **文化與語言真實性：** PATCH 非單純翻譯英文資料集，而是融入了繁體中文特有的攻擊策略，包括注音符號、本地的社會政治議題，以及基於文化的攻擊內容，這些都是基於翻譯的方法所無法捕捉的。
4.  **人工驗證：** 一個經過精心策劃的人工標註子集（PATCH-H）提供了黃金標準的評估數據，這些數據由具備自然語言處理專業知識的繁體中文母語者從零開始撰寫。

---

### 資料集建構：多階段流程

PATCH 資料集是透過一個系統化的流程構建的，結合了自動化生成與嚴謹的品質控制。

![framed:PATCH 資料流程總覽，涵蓋合成生成階段（Safe Content、PATCH-GPT、PATCH-RT）以及 PATCH-H 基準的人工策展階段。](images/optimized/projects/2025_05_18_patch_dataset/data_pipeline.webp)

![PATCH 資料集中不安全樣本在 13 個 MLCommons 危害類別以及兩種生成方法（PATCH-RT 和 PATCH-GPT）中的分佈情況。](images/optimized/projects/2025_05_18_patch_dataset/patch_distribution.webp)

#### 直接有害 Prompt 生成 (PATCH-GPT)

不安全範例的基礎子集是使用 GPT-3.5 和 GPT-4 模型生成的，針對 MLCommons 分類法中定義的 13 個危害類別。這些 prompts 代表了常見、直接的有害請求，並透過自動化進行了擴增，以增加長度和風格上的變化。

#### 規避性有害 Prompt 生成 (PATCH-RT)

為了用複雜規避策略的數據來補充 prompt 難度範圍，我們開發了一個客製化的對抗性生成框架，其靈感來自 Rainbow Teaming 的 quality-diversity 方法。此框架利用擔任不同角色的 LLM 反覆生成和最佳化 prompts：一個 Mutator 負責生成針對特定攻擊風格或攻擊領域的變體，一個 Judge 負責評估其有效性，還有一個 Sub-mutator 則進行針對性的最佳化，並融入繁體中文的特有元素。由此產生的 PATCH-RT prompts 通常具有更長的敘事、嵌入式指令，或引用虛構的地區情境，使有害請求看起來合法或迷惑安全系統。

#### 安全內容調整

安全內容部分源自 [ChatGPT-Corpus](https://github.com/PlexPt/chatgpt-corpus)，並使用 [繁化姬](https://zhconvert.org/) 工具轉換為繁體中文。此工具能進行字元對應，還能調整地域特定的術語和措辭，進而確保與繁體中文社群相關的語言和文化真實性。

---

### 驗證真實世界的漏洞

為了證明 PATCH 的實際應用價值，我們使用人工標註的 PATCH-H 子集對多種 LLM 進行了評估。結果顯示，模型普遍存在顯著的漏洞。

![各種 LLM 在人工標註的 PATCH-H 子集中的 130 個不安全 prompts 上的攻擊成功率（ASR），涵蓋了從輕量級開源模型到大規模專有系統。](images/optimized/projects/2025_05_18_patch_dataset/patch_asr.webp)

攻擊成功率從 13% 到高達 98% 不等，這表明即使是先進的模型也易受到針對性的繁體中文輸入的攻擊。凸顯了像 PATCH 這樣訓練和評估資源的需求。

---

### 微調策略：尋找高效路徑

利用 PATCH，我們系統性地評估了開發繁體中文安全分類器的不同方法，比較了 Llama Guard 3 1B、RoBERTa 和 Longformer 等架構在 FFT、LoRA 和 [Chat-Vector](https://arxiv.org/abs/2310.04799) 方法下的表現。

#### 關鍵發現：LoRA 效能媲美 FFT

結果發現，經過 LoRA 微調的模型達到的分類效能可與 FFT 相媲美，同時大幅降低了運算需求。

![在 PATCH 測試集上的繁體中文安全效能比較，對比了基準模型 Llama Guard 3 1B 與使用 FFT、LoRA 及 Chat-Vector 方法調整後的模型。](images/optimized/projects/2025_05_18_patch_dataset/patch_main_result.webp)

Baseline 模型 Llama Guard 3 1B 在 zero-shot 設定下，其繁體中文內容審核能力有限，F1 分數僅為 0.781。相比之下，FFT 和 LoRA 均實現了近乎完美的分類，F1 分數超過 0.99。值得注意的是，經過 LoRA 微調的 Llama Guard 取得了 0.996 的 F1 分數和 0.999 的最高整體 recall，而運算成本卻大幅降低。

試圖透過向量加減而非訓練來轉移能力的 Chat-Vector 方法，則被證明效果差得多，凸顯了數據驅動微調的價值。

#### 在人工編寫數據上的穩健性

為了驗證在合成數據上的訓練能夠轉化為真實世界的穩健性，我們在人工標註的 PATCH-H 子集上對所有模型進行了評估。

![在人工標註的 PATCH-H 子集上的效能表現，展示了在合成 PATCH 資料集上調整後的模型。](images/optimized/projects/2025_05_18_patch_dataset/patch_human_result.webp)

經 LoRA 微調的 Llama Guard 3 1B 表現最佳，F1 分數達到 0.869，recall 高達 0.946。這驗證了我們的合成數據方法：在對抗性的 PATCH 資料集上進行訓練，模型能夠處理人工編寫輸入中的細微之處。

---

### 意外的收穫：跨語言效益

也許最有趣的發現是，在英文安全基準上評估經 PATCH 微調的模型時，觀察到了跨語言的泛化能力。

![在 PATCH 資料集上微調後模型的跨語言英文安全效能。](images/optimized/projects/2025_05_18_patch_dataset/patch_crosslingual.webp)

經 LoRA 微調的 Llama Guard 3 1B 在英文數據上的表現明顯優於基準模型及其 FFT 的對應版本，F1 分數達到 0.950。定性分析顯示，這種改善源於糾正了特定類型的錯誤：LoRA 減少了對良性技術性 prompts 的 false positives，更減少了對使用角色扮演或混淆等手法的隱晦有害輸入的 false negatives。

我們推測，LoRA 的更新使模型得以保留其廣泛的英語知識，同時從 PATCH 細膩的對抗性範例中學習更抽象的安全原則，從而增強了跨語言的穩健性。

---

### 結論與未來方向

PATCH 代表了在解決繁體中文 LLM 安全對齊不足方面邁出的一步。我們的實驗發現，針對性的微調相較於基準模型能帶來顯著的提升，而 LoRA 已成為開發繁體中文安全分類器的一種高度實用的方法。

此資料集及相關程式碼將在最終發表後公開，以促進後續研究。未來的研究將專注於使用真實世界數據擴充 PATCH、探索其他參數高效的技術，並研究跨語言安全能力轉移背後的機制。

---

## 致謝

我衷心感謝我的共同第一作者陳炯睿在整個專案中的合作與付出。我還要感謝我們的指導教授蔡教授，給予了寶貴的指導與支持。最後，我也感謝學長 AK 提供的回饋，他的寫作建議和早期指導為這項研究奠定了基礎。
