---
title: "AAAI 2025 教育影片"
category: "影片製作"
subcategory: "LLM 安全"
description: "為 AAAI 2025 製作一部三分鐘的教育影片，深入淺出地介紹大型語言模型安全領域中的攻擊與防禦。"
imageUrl: "images/optimized/projects/2025_01_05_aaai_video/titlecard.webp"
year: "2025"
date: "2025-01-05"
role: "影片製作人"
technologies: ["DaVinci Resolve", "Affinity Designer"]
pinned: 4
featured: true
locked: false

---

## 專案概覽
[AAAI](https://aaai.org) 作為人工智慧領域的頂尖學術會議，在 2025 年發起了一場[教育影片競賽](https://aaai.org/about-aaai/aaai-awards/aaai-educational-ai-videos/)，旨在透過三分鐘短片普及 AI 各領域的知識。這對我而言是個絕佳的機會，得以結合自身在語言模型安全領域的經驗與對影片製作的熱忱，最終，我以一部探討語言模型攻擊與防禦的影片參賽。

![最後的成片](https://www.youtube.com/watch?v=eSuEhZpHesU&t=2s&pp=ygUZYWFhaSBlZHVjYXRpb25hbCBhaSB2aWRlbw%3D%3D)

---

## 影片內容
這部影片的核心目標，是在三分鐘內向不具備專業背景的觀眾，清晰地闡述大型語言模型安全中的「越獄攻擊」（Jailbreak Attacks）與其防禦機制。為此，我採用了經典的「問題－解決方案」敘事結構，並藉由具體案例和生動比喻，將複雜的技術概念轉化為易於理解的內容。

1.  **開場：引人入勝的懸念 (0:00 - 0:30)**
    影片開頭直接拋出一個發人深省的情境：「想像一下，你要求一個頂尖 AI 打破自己的規則——而它照做了。」接著引用 OpenAI 官方承認的潛在風險（如設計生化武器），迅速建立起主題的嚴肅性與重要性，從而抓住觀眾的目光。

2.  **中段：攻擊手法——從具體到抽象 (0:30 - 1:30)**
    此段落由淺入深地介紹兩種攻擊方式。首先，以「角色扮演」這個直觀的比喻解釋早期的攻擊手法，並舉出「[DAN](https://www.reddit.com/r/ChatGPTPromptGenius/comments/106azp6/dan_do_anything_now/)」作為具體案例。隨後，將威脅升級，介紹更為複雜的「AI 攻擊 AI」概念（如 [PAIR](https://arxiv.org/abs/2310.08419) 系統），營造出威脅不斷演進的緊張氛圍。

3.  **轉折：攻防之間的對壘 (1:40 - 2:35)**
    在揭示攻擊的威脅後，影片順勢轉入解決方案的探討。我使用「為手機安裝安全軟體」的比喻，讓觀眾理解防禦機制的核心思想：在不重塑模型的基礎上，額外增添保護層。接著介紹兩種防禦策略（[SmoothLLM](https://arxiv.org/abs/2310.03684) 的擾動檢測與 [Llama Guard](https://arxiv.org/abs/2312.06674) 的分類過濾），具體展示了研究人員應對挑戰的巧思。

4.  **結尾：持續的挑戰與展望 (2:35 - 3:00)**
    影片結尾並未止步於當前的攻防現況，而是放眼未來。透過點出新的攻擊目標（多模態模型）來強調這場競賽的持續性，同時也說明防禦方正積極佈局，從自我防禦機制到更智能的安全模型，最終畫下一個充滿希望的註解。

---

## 影片製作
![最後的時間線](images/optimized/projects/2025_01_05_aaai_video/full_timeline.webp)
在整個製作流程中，影片拍攝反倒是相對單純的環節。架設好燈光與腳架後，A-roll 的部分只需對著鏡頭說話即可。儘管我在鏡頭前的表現有些生澀，仍在短時間內順利完成了拍攝。

後期製作同樣在 DaVinci Resolve Studio 19 中完成。除了基礎剪輯與音效設計，這次我將大部分心力投入到動態設計（Motion Graphics），以視覺化方式闡述抽象概念。為了讓風格平易近人，我選擇了 Apple 的 Emoji 風格作為視覺基調，並為每個核心概念設計了對應的圖示與動畫。

![先在 Affinity Designer 中編排好圖示](images/optimized/projects/2025_01_05_aaai_video/element_design.webp)

其中，開場的動畫序列是製作過程中耗時最長的部分。它要呼應影片開頭的懸念，更要透過一個仿 ChatGPT 的介面來揭示主題。其製作流程大致如下：
1.  **介面設計**：參考 ChatGPT 的實際介面後，我在 Fusion 中重新打造了一個風格相似的版型。
2.  **動畫設計**：使用 Fusion 的 Text+ 工具，將文字與圖示結合，並設計動態效果。
3.  **音效設計**：利用 3D 攝影機為介面增添縮放與運鏡效果，並在主時間軸上搭配對應的打字與提示音效。

![開頭片段的 Fusion 節點樹](images/optimized/projects/2025_01_05_aaai_video/opening_seq_comp.webp)

儘管這是我首次挑戰此類影片，整個過程卻進行得非常順利，僅花費約兩週時間便完成了所有後期工作。最終，這部影片在 AAAI 競賽中獲得肯定，也進一步昇華了我對影像敘事的熱情與理解。

---

## 心得
我很慶幸能有這次機會，將對語言模型安全的鑽研與對影片創作的喜愛合而為一。過程中，我不只學習到寶貴的動態設計技巧，更深刻體會到，那些如 [Vox](https://www.youtube.com/@Vox) 和 [Kurzgesagt](https://www.youtube.com/@kurzgesagt) 的頂尖頻道，其背後是多麽龐大的心血結晶，即便擁有專業團隊，每一個精緻畫面的背後，都堆疊著難以想像的時間與精力。

期望未來能將這次的經驗應用到更多的創作中，持續磨練自己的技能。相信這次的經驗不只是一次成功的專案，更是探索科技傳播與視覺敘事可能性的起點。

---

## 致謝
感謝 AK 將這個競賽資訊分享給我，以及他在影片劇本轉寫初期提供的建議，讓我能更清晰地表達核心概念。

封面 mockup 由 [Micro Volume](https://microvolume.gumroad.com/l/macbook1) 的素材製作而成。