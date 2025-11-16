---
title: "2025 POWERPLAY"
category: "戲劇演出"
subcategory: "影片製作"
description: "十一愛學生主導的年度英文戲劇盛事，旨在展現對愛情的見解。"
imageUrl: "images/optimized/projects/2025_01_08_powerplay/titlecard.webp"
year: "2025"
date: "2025-01-05"
role: "影片拍攝、剪輯、攝影"
technologies: ["DaVinci Resolve", "Affinity Designer"]
pinned: 8
featured: true
locked: false
---


## 專案概覽
「POWERPLAY」是我們學校年度的英文戲劇盛事，所有環節皆由學生主導。從劇本創作、演員選拔到舞台設計，均由十一年級學生一手包辦。今年的主題是「LOVE」，我們班級融合了理科生的科技實力與對愛情的獨到見解，透過三個相互關聯的故事，深度探討了愛情的多樣性與複雜性。

---

## 劇本概覽

- **主題**：透過三個獨立又環環相扣的故事，探討愛情中「友情」、「信任」與「善意謊言」的複雜性。
- **架構**：故事由一位列車長串連，列車依序停靠「友情至上」、「相信我」和「為愛說謊」三站，每一站都上演一幕關於愛情難題的短劇。

### 第一幕：友情至上 (Friendship First)
**情節**：Ethan 向好友 Allie 告白，卻遭到拒絕，Allie 表示她只將他視為朋友。Ethan 在內心的天使與惡魔的交戰中感到崩潰，認為世界毀滅。最終，在朋友的開導和自我反思後，他體悟到友情的可貴，並選擇修補與 Allie 的關係，將友情放在第一位。

### 第二幕：相信我 (Trust Me)
**情節**：Tom 和 Phoebe 正在進行遠距離戀愛。Tom 收到一張匿名照片，暗示 Phoebe 對他不忠。在內心天使與惡魔的煽動下，Tom 的懷疑逐漸加深，並在電話中與 Phoebe 爆發激烈衝突。直到兩人見面，Phoebe 拿出證據澄清誤會後，Tom 才意識到自己缺乏信任。兩人最終和解，並承諾未來將以溝通解決問題。

### 第三幕：為愛說謊 (Lie for Love)
**情節**：Angie 的阿嬤極力反對她與在便利商店工作的男友 Chaney 交往。為了讓阿嬤接受 Chaney，在內心惡魔的慫恿下，Angie 撒謊說自己懷孕了。這個謊言引發了劇烈的家庭衝突，但也迫使阿嬤面對自己過度的控制慾。最終，阿嬤意識到自己的錯誤並選擇放手，而 Angie 也坦承了謊言。一家人和解，體會到幸福比任何條件都重要。

### 結局
列車抵達終點站。列車長總結道：愛是建立在友誼、信任和誠實之上的深刻連結。它關乎價值、關懷與陪伴，帶領乘客們迎向「希望」。

---

## 謝幕影片製作
延續上次「[古韻今唱](https://www.harrychang.me/projects/2024_08_19_classics_reimagined_zh-tw)」的成功經驗，我再次擔綱一分鐘謝幕影片的拍攝與剪輯。這次也嘗試從旁協助對剪輯抱有熱忱的同學，最終由他獨立完成了長達八分鐘的幕後花絮影片。

![最後的成片](https://drive.google.com/file/d/1HUxfhr16vn-gAso3RF1Vz-ShMEpfnStO/view?usp=sharing)

### 製作設備
- **相機**: FUJIFILM X-T5
- **鏡頭**: SIGMA 18-50mm f/2.8
- **穩定器**: DJI RS3 Mini
- **剪輯軟體**: DaVinci Resolve Studio 19
- **設計軟體**: Affinity Designer
- **音樂來源**: 取自 Epidemic Sound & Motion Array

### 事前準備及拍攝
有了先前的經驗，這次的工作流程更為順暢。主要流程分為四個步驟：
1. **音樂分析與結構規劃**：將選定音樂導入 DaVinci Resolve，分析其節奏與結構，並將影片總長控制在一分鐘左右，以此確立敘事框架。
2. **鏡頭規劃**：根據音樂節拍，在時間軸上規劃各段落的鏡頭，並在節奏點標記剪輯點。鏡頭運動以推、拉、環繞為主，營造流暢的視覺動感。
3. **開頭與結尾設計**：這次的開頭、結尾以及中間幾個用到「漂浮拍立得」的畫面有經過特別的編排。
4. **現場拍攝**：依據規劃進行拍攝，過程中反覆拍攝每個鏡頭（通常五次以上），以確保運鏡速度與畫面穩定性，為後期製作奠定良好基礎。

### 後期剪輯
![最後的時間線](images/optimized/projects/2025_01_08_powerplay/fulltimeline.webp)
本次剪輯流程與前次專案相似，但我將更多心力投注在以下幾個關鍵段落的精雕細琢上：

#### 開頭的螢幕拉出轉場
開頭採用了從螢幕中拉出的轉場效果，雖然技法與上次類似，但在運鏡的複雜度上更具挑戰性。
![開頭鏡頭拉出的 Node Tree](images/optimized/projects/2025_01_08_powerplay/opening.webp)
1. 拍攝素材時，確認螢幕上是顯示定位用的畫面。
2. 用 Planar Tracker 跟蹤螢幕邊緣，並將欲顯示的畫面貼上去。
3. 加上一個 3D Camera，在畫面一開始調整視角到畫面貼滿整個螢幕
4. 加上關鍵幀、Color Correction 及 Motion Blur。

#### 中段的漂浮拍立得
我藉此機會嘗試結合 Camera Tracker，在 3D 空間中實現了漂浮拍立得的特效，這次的實踐也讓我深刻體會到 Fusion 的強大功能。
![漂浮拍立得的 Node Tree](images/optimized/projects/2025_01_08_powerplay/floating.webp)
1. 首先在 Affinity Designer 中設計拍立得的外觀，並匯出為 PNG 圖檔。
2. 於 DaVinci Resolve Fusion 頁面中，使用 Camera Tracker 追蹤鏡頭運動，算出 3D 空間。
3. 手動清理追蹤點的雜訊，將 3D 場景轉換至平面後，置入拍立得圖像。
4. 精心調整每張拍立得的出現時機，讓它們完美對應音樂節奏。

####  結尾段落
在影片收尾階段，我專注於以下幾個執行細節，以提升整體質感：
1. **轉場優化**: 在每個 Speed Ramp 轉場前一兩幀，使用 Magic Mask 將主體分離出來，使其在轉場時能優先出現，增強視覺衝擊力。同時，也搭配了精細的音效設計。
2. **空間層次感**: 在演藝廳的場景中，為漂浮的拍立得疊加上椅子和麥克風的 Mask，創造出更豐富的空間層次感。
3. **結尾設計**: 結尾採用了橫向移動後縮回畫面的設計，其執行技巧與開頭的拉出效果相似，僅為反向操作。

![演藝廳漂浮拍立得的 Node Tree](images/optimized/projects/2025_01_08_powerplay/closing.webp)
![最後橫向轉場會用 Magic Mask 抓出椅子的元素](images/optimized/projects/2025_01_08_powerplay/credit-v2_01_01_16_20.webp)
![在演藝廳的漂浮拍立得會疊加椅子、麥克風的 Mask 來增加空間感](images/optimized/projects/2025_01_08_powerplay/credit-v2_01_01_14_21.webp)

---

## 劇照

![](images/optimized/projects/2025_01_08_powerplay/DSCF2377.webp)
![](images/optimized/projects/2025_01_08_powerplay/DSCF3700.webp)
![](images/optimized/projects/2025_01_08_powerplay/DSCF3706.webp)
![](images/optimized/projects/2025_01_08_powerplay/DSCF4045.webp)
![](images/optimized/projects/2025_01_08_powerplay/DSCF4047.webp)
![](images/optimized/projects/2025_01_08_powerplay/DSCF4048.webp)
![](images/optimized/projects/2025_01_08_powerplay/DSCF4080.webp)
![](images/optimized/projects/2025_01_08_powerplay/DSCF4089.webp)

---

## 心得
相較於上次，POWERPLAY 的準備時間更為充裕，這也讓我們有機會實現更多大膽的創意。除了演員們精湛的演出，我們班最大的亮點無疑是那台可電動行駛的火車道具，以及 Raymond 運用 After Effects 製作的動態背板。每次火車電動登場，都瞬間成為全場焦點；而動態背板的工程更是浩大，由衷佩服 Raymond 的毅力，尤其在劇本與畫面頻繁調整的壓力下，他總能迅速完成修改，非常不容易。

對我個人而言，這次的影片製作是一次寶貴的學習歷程。透過在 Fusion 中實踐 Camera Tracker 與 3D 空間的整合，我對 DaVinci Resolve 的強大功能有了更深的理解。這次的專案不但讓我磨練了剪輯技巧，更讓我對視覺敘事的可能性，有了更深刻的領悟。

---

## 致謝
感謝所有參與這次演出的同學們，從編劇、導演到演員，每個人都為這部作品付出了無數心血。特別感謝 Raymond, Allie 等人的努力，讓我們的火車道具與動態背板成為全場的亮點。也特別感謝 Henry 與 Kai 拍攝及製作的幕後花絮，讓我們能夠更全面地記錄這次的精彩演出。這次的經歷將永遠留在我的心中，並激勵我在未來繼續探索影像製作的無限可能。 