---
title: "古韻今唱戲劇演出"
category: "戲劇演出"
subcategory: "影片製作"
description: "年度戲劇盛事，學生重新詮釋中華文學經典，展現十一愛班獲獎作品的精彩演出。"
imageUrl: "images/optimized/projects/2024_08_19_classics_reimagined/titlecard.webp"
year: "2024"
date: "2024-08-19"
role: "影片拍攝、剪輯、攝影"
technologies: ["Affinity Designer", "DaVinci Resolve"]
pinned: 7
featured: true
---

## 專案概覽
「古韻今唱」是我們學校的年度戲劇盛事，由高中十年級與十一年級學生以班級為單位參與。活動旨在鼓勵學生以創新的方式重新詮釋中華文學經典，並將音樂表演作為核心元素。在這次競賽中，我們班（十一年愛班）的作品《亂世殘陽》最終榮獲第一名，演出獲得評審團的高度肯定。

---

## 劇本概覽

本劇名為《亂世殘陽》，以明末清初的亂世為背景，圍繞著吳三桂、李自成與名妓陳圓圓三人之間的情感糾葛與命運交錯，重新演繹了這段波瀾壯闊的歷史。

故事始於明朝的窮途末路。闖王李自成大軍兵臨城下，崇禎皇帝在絕望中自刎，結束了大明王朝。當時鎮守山海關的吳三桂，因不滿朝廷腐敗，對李自成一度抱有期望。然而，命運的轉捩點在於名妓陳圓圓。李自成入京後，其手下大將強佔了身為吳三桂愛妾的陳圓圓，並將她獻給李自成。這「衝冠一怒為紅顏」的奪妻之恨，加上家人被脅持，最終促使吳三桂引清兵入關，徹底改變了歷史走向。劇情隨後展現了人物命運的巨大反轉：李自成兵敗後下落不明，最終遁入空門；而吳三桂則加官晉爵，享盡榮華，卻也漸漸冷落了曾為之奮戰的陳圓圓。

全劇在多年後的一場相會中達到高潮。化身為僧的李自成與被冷落的陳圓圓再次相遇，兩人共同感嘆在時代洪流中「是非成敗轉頭空」的無奈與滄桑。故事最終在英雄末路、紅顏寂寥的悲劇氛圍中落下帷幕。

---

## 謝幕影片製作

延續去年拍攝的經驗，我在今年也是持續負責整個謝幕影片的拍攝及剪輯工作，希望用有點「過於炫技」的方式來呈現演出背後每位同學的負責工作。

![最後的成片](https://drive.google.com/file/d/1aGQ9TryQcT7zw273gwb_uJrxAr64fmaa/view?usp=sharing)

### 製作設備
- **相機**: FUJIFILM X-T5
- **鏡頭**: SIGMA 18-50mm f/2.8
- **穩定器**: DJI RS3 Mini
- **剪輯軟體**: DaVinci Resolve Studio 19
- **設計軟體**: Affinity Designer
- **音樂來源**: 取自 Motion Array

### 製作思路
#### 事前準備及拍攝
整個影片會希望用比較快的節奏來呈現整個演出過程，會先在下載完音樂後做幾個步驟：
1. **音樂節奏分析**: 將選定的音樂導入 DaVinci Resolve，進行節奏分析與結構編排，將總長度控制在約一分鐘，確立影片的敘事框架。
2. **安排素材**: 根據音樂節拍，在時間軸上規劃每個段落的鏡頭，並在節奏點上預設剪輯點。鏡頭運動以推、拉、環繞為主，創造流暢的視覺動感。
3. **編排頭尾**: 因為頭尾會有比較炫技的部分，為了要讓拍攝更有效率，更知道要取得哪些鏡頭，我會先安排頭尾需要拍的一些鏡頭。
4. **素材拍攝**: 在根據音樂節奏安排好素材後，會開始進行拍攝，過程中會盡量確保每個鏡頭的速度和統一性，讓後期不那麼痛苦，這個過程非常漫長，往往需要每個鏡頭拍五遍以上，才能確保每個鏡頭都能達到預期的效果。


#### 後期剪輯
![最後的時間線](images/optimized/projects/2024_08_19_classics_reimagined/full_timeline.webp)
1. **素材整理與初剪**： 將拍攝好的素材導入 DaVinci Resolve，依規劃放置於時間軸上。
2. **轉場搭配**: 在每段素材的起點與終點新增 Speed Curve，頭尾快，中間慢（0.4x）
3. **開頭編排**: 開頭用 Fusion 從電腦螢幕的畫面無縫縮放，並銜接到第一個高速推拉鏡頭。
4. **影片收尾**: 結尾設計與開頭呼應，以縮放「離開」螢幕的方式呈現，並用 Mask Transition 結束影片。這段轉場的製作相當複雜：
    - 先錄一段電腦打開，螢幕顯示定位畫面，並請同學隨著鏡頭拉出時走過鏡頭前並關掉螢幕。
    - 將要轉場的畫面用 Fusion 的 Planar Tracker 追蹤螢幕上的畫面，並轉成 Corner Pin 將其固定在螢幕上。
    - 將整個場景移到一個 3D Plane 上，並加入一個 3D Camera，在片段的一開始將它調整到只顯示螢幕上的畫面（這個部分非常、非常耗時間）。
    - 為相機打上關鍵幀，比較重要的點是因為虛擬相機跟真實相機都會有運動，兩者之間需要做一些調整。
    - 在螢幕縮放過程，為螢幕上的畫面加上 Color Correction 跟 Motion Blur，讓整個轉場更自然。
    - 轉到 Color Page 用 Magic Mask 加上 Mask Transition。
5. **音效設計**: 在每個銜接點都會疊接 Riser, Whoosh, Impact 作為基本的轉場銜接，為了加深一些特色，或使用 Gear Wind 或高壓電的電流聲。
6. **影片調色**: 影片拍攝原為 10 bit 4:2:2 F-log2 格式，這次調色主要嘗試了 DaVinci Resolve Studio 19 新增的 Film Looks Creator 功能，簡化了流程，也讓調色工作變得更高效、更愉快。

![片尾轉場的 Fusion Node Tree](images/optimized/projects/2024_08_19_classics_reimagined/closing_squence_fusion_comp.webp)
    

### 拍立得拍攝
在影片製作之外，為了讓片頭更具溫度與紀念意義，我額外使用閃光燈為每位同學拍攝了拍立得風格的照片，並記錄下他們想說的話，將這些珍貴的瞬間融入影片之中。
![拍立得照片整理在 Affinity Designer](images/optimized/projects/2024_08_19_classics_reimagined/polaroid_design.webp)

---

## 劇照
![](images/optimized/projects/2024_08_19_classics_reimagined/_DSF3005%2086%20Edited.webp)
![](images/optimized/projects/2024_08_19_classics_reimagined/_DSF3072%2090%20Edited.webp)
![](images/optimized/projects/2024_08_19_classics_reimagined/DSCF1949%206%20Edited.webp)
![](images/optimized/projects/2024_08_19_classics_reimagined/DSCF2915%2024%20Edited.webp)
![](images/optimized/projects/2024_08_19_classics_reimagined/DSCF2930%2029%20Edited.webp)
![](images/optimized/projects/2024_08_19_classics_reimagined/DSCF4477%2018%20Edited.webp)
![](images/optimized/projects/2024_08_19_classics_reimagined/DSCF4551%2022%20Edited.webp)

---

## 心得
雖然在籌備過程中，我的主要角色是記錄者而非表演者，但這也讓我有幸能以獨特的視角，見證班級團隊合作的每一個精彩瞬間——從背板設計、服裝挑選，到導演指導、演員詮釋，乃至音樂編排，同學間齊心協力的光景至今仍歷歷在目。

儘管拍攝過程充滿挑戰，但當影片播畢、聽見全場掌聲的那一刻，我深信為這短短一分半鐘所付出的所有心力，都是值得且無悔的。

---

## 致謝
感謝所有參與這次演出的同學們，特別是兩位導演、編劇、以及所有在幕後默默付出的夥伴們。你們的努力和創意讓這次演出成為可能，也讓我有機會用影像記錄下這段美好的回憶。



