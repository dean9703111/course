# 14 種版型與簡報計畫格式

模板：`assets/School_Slides_Template.pptx`（16:9，15 頁）。第 1 頁是版型 01 封面，第 2 頁是版型 00 使用說明（產出時不使用），第 3～15 頁依序是版型 02～14。

每個文字框都有名稱（例如 `title`、`point-1-title`），簡報計畫用這些名稱填字。`layout-label`（版型說明小字）產出時會自動刪除，`footer` 與 `page-no` 由腳本自動填。

**照片框**只有版型 01、06、14 有：在該頁加 `"image": "圖片路徑"`，腳本會把圖片完整放進照片框（等比例縮放、不裁切）；不放圖就用 `"remove": ["image-placeholder", "deco-tape"]` 刪掉照片框。

## 版型一覽

| 版型 | 名稱 | 用途 | 可填欄位 | 內容上限 |
|---|---|---|---|---|
| 01 | 封面 | 第一頁 | `badge` 場合、`title` 主標（可用 `\n` 換行）、`subtitle`、`meta` 日期｜報告人｜班級 | 主標 8～16 字；右側照片框（直式）用 `image` 放圖，或用 `remove` 刪掉 |
| 02 | 今天的流程 | 議程 | `title`、`agenda-N-time`／`agenda-N-title`／`agenda-N-desc`（N = 1～5） | 最多 5 項；沒填的項目自動移除 |
| 03 | 章節分隔 | 換段落、換氣 | `section-no`（01、02…）、`title`、`subtitle` | 一份簡報 2～4 個章節 |
| 04 | 一句話重點 | 一頁只說一件事 | `statement`、`support`、`sticky-note` | 重點句 ≤ 30 字 |
| 05 | 三個重點 | 理念、原則、收穫 | `title`、`point-N-title`、`point-N-desc`（N = 1～3） | 剛好 3 點最好看 |
| 06 | 左文右圖 | 用照片說明 | `title`、`lead`、`bullets`（清單，最多 3 項）、`action` | 用 `image` 指定圖片，自動放進右側照片框；一頁一張 |
| 07 | 雙欄比較 | 以前 vs 現在、A vs B | `title`、`compare-N-head`、`compare-N-bullets`（清單）、`compare-N-fit`（N = 1～2）、`conclusion` | 每欄 3 點 |
| 08 | 步驟流程 | 報名、請假、操作步驟 | `title`、`step-N-title`、`step-N-desc`（N = 1～4）、`note` | 剛好 4 步最好看；多的拆頁 |
| 09 | 時間軸 | 學期行事、活動籌備 | `title`、`milestone-N-date`／`-title`／`-desc`（N = 1～5）、`note` | 最多 5 個日期；第 3 個是珊瑚橘（放最重要的日子） |
| 10 | 表格 | 作息、分組、科目重點 | `title`、`note`，另用 `table` 填表格 | 最多 5 列（含標題列）× 4 欄；欄數少會自動刪欄 |
| 11 | 分工與窗口 | 誰負責什麼 | `title`、`role-N-name`、`role-N-duty`、`role-N-contact`、`role-N-badge`（不填就用名稱第一個字）（N = 1～4） | 4 個角色 |
| 12 | 請家長配合 | 配合事項＋截止日 | `title`、`check-N`（N = 1～4）、`reminder-title`、`reminder-text`、`deadline` | 最多 4 項 |
| 13 | 數字亮點 | 成果、統計 | `title`、`stat-N-number`／`-unit`／`-label`（N = 1～3）、`interpretation` | 只放有來源的數字，`interpretation` 寫來源 |
| 14 | 結尾與聯絡 | 最後一頁 | `title`（預設「謝謝聆聽」）、`subtitle`、`contact`、`deadline` | 照片框用 `image` 放圖，或用 `remove` 刪掉 |

## 各場合的建議頁序（10 頁內）

| 場合 | 建議頁序 |
|---|---|
| 上課簡報（學生；素材是講義或圖文教材） | 01 封面 → 04 今天要回答的問題 → 06 用圖說明重點（教材有幾張關鍵的圖就用幾頁，中間穿插其他版型）→ 07 兩個概念的比較 → 10 整理表 → 08 實驗或操作步驟 → 05 三個重點回顧 → 14 課堂練習或下一節預告 |
| 班親會（家長） | 01 封面 → 02 流程 → 05 班級經營理念 → 13 上學期成果（有資料才放）→ 10 學習重點 → 09 重要日程 → 12 請家長配合 → 11 聯絡窗口 → 14 結尾 |
| 教學觀摩／研習分享（同事） | 01 封面 → 04 一句話重點 → 03 章節 → 07 以前 vs 現在 → 08 我的做法 → 06 課堂照片 → 05 三個收穫 → 12 或 08 給同事的建議 → 14 結尾 |
| 學生活動說明（學生或家長） | 01 封面 → 06 活動是什麼 → 09 時程 → 08 報名步驟 → 10 分組或費用 → 12 要準備什麼 → 14 結尾與截止日 |

## 簡報計畫 JSON

```json
{
  "output": "output/班親會簡報.pptx",
  "footer": "星光國小｜五年三班｜下學期班親會",
  "slides": [
    {"layout": 1, "text": {"badge": "下學期班親會", "title": "敢說，\n也說得有依據",
      "subtitle": "這學期我們一起陪孩子做的 3 件事", "meta": "2027/2/27（六）｜王老師｜五年三班"},
      "remove": ["image-placeholder", "deco-tape"]},
    {"layout": 5, "text": {"title": "班級經營的三個原則",
      "point-1-title": "先敢說", "point-1-desc": "先讓孩子敢說，\n再讓孩子說得有依據",
      "point-2-title": "天天讀", "point-2-desc": "每天晨讀 20 分鐘",
      "point-3-title": "說出下次", "point-3-desc": "犯錯沒關係，說出下次怎麼做"}},
    {"layout": 6, "text": {"title": "晨讀時間長這樣", "lead": "每天 20 分鐘",
      "bullets": ["自己選書", "讀完寫一句心得", "每週一次好書分享"], "action": "請每週一帶一本課外書"},
      "image": "output/班級紀錄_素材/圖片/圖01.jpg"},
    {"layout": 10, "text": {"title": "下學期學習重點", "note": "每月一篇短文寫作"},
      "table": [["科目", "學習重點"], ["國語", "閱讀理解與摘要"], ["數學", "分數與小數的應用"]]},
    {"layout": 14, "text": {"subtitle": "歡迎提問", "contact": "聯絡簿留言（最快）", "deadline": "[待補：回條截止日]"}}
  ]
}
```

- `output`：產出檔案位置（相對於目前的工作資料夾）
- `footer`：每頁左下角，寫學校、班級或處室、場合
- `text`：欄位名稱對文字；`\n` 換行；`bullets` 類欄位用清單
- `table`：第一列是標題列
- `image`：要放進照片框的圖片（只有版型 01、06、14），路徑相對於目前的工作資料夾；支援 PNG、JPG、GIF，其他格式請使用者在 PowerPoint 手動放
- `image-fit`：預設完整顯示整張圖；照片想填滿照片框可以寫 `"cover"`（會裁切上下或左右），圖表、示意圖不要用
- `image-alt`：圖片的替代文字，沒寫就用該頁標題
- `remove`：要刪掉的圖形名稱，例如不放照片時刪 `image-placeholder` 與 `deco-tape`
- 沒有填的項目（例如流程只填 3 項）會連同裝飾自動移除
