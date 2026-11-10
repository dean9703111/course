# 第 2 堂素材來源與改編紀錄

本檔供講師備課與追溯；不作為學員頁章節。講義章節與概念沿用作者過去的 Cowork（EDA）與生成圖片（BiCS）講義，只把工具換成 Codex App、範例換成校園情境。所有校園資料均為虛構。

## 章節對照

| 講義章節 | 底稿檔案與原段落 | 範例怎麼改 |
|---|---|---|
| 課前回顧 | [BiCS 第 2 堂](../../bics/lesson2/content.md) 第 1～43 行「課前回顧：上一堂學了什麼？」 | 回顧第 1 堂 ChatGPT 的 Prompt 六個技巧（沿用底稿「Prompt 技巧應用」寫法，對應第 1 堂技巧 1～6）、記憶與自訂、Project；「6 個成果」改為本堂 4 個成果 |
| 初探 Codex（章；原「讓 AI 動手處理檔案」開場與初探 Codex App） | [EDA](../../eda/content.md) 約 1053～1082 行「初探 Cowork」 | Cowork 換 Codex 桌面版；選資料夾沿用，改用 `reading-delivery` 素材包；Claude 付費方案說明刪除 |
| 多格式資料彙整（章） | EDA 約 1084～1116 行「多格式資料彙整」 | 凌亂專案資料夾改為閱讀探索日（活動條件、教學目標、工作分配、物資、異動紀錄、通知格式、含錯通知）；彙整成活動摘要與待辦清單，並用通知格式檢查含錯通知 |
| 照片與表單（章）：照片批量轉存 Excel | EDA 約 1118～1162 行「照片批量轉存 Excel」 | 發票收據改為手寫虛構回條照片（座號、參加與否、陪同家長人數、備註）→ 回條名單；素材包附可列印的 `回條範本.html`；與第 4 堂 Cowork 的收據範例區隔；Skill 段沿用底稿 Insight 原文並改為預告 |
| 照片與表單（章）：自動填入不同格式的表單 | EDA 約 1164～1197 行「自動填入不同格式的表單」 | 專案管理表改為活動申請表（空白表與填寫規則放在素材包 `input/活動申請表_空白.csv`，沿用底稿「先讀懂表單規則再填入」的做法；講義附預期結果對照表）與簽辦公文草稿；缺值標「待確認」 |
| 圖片起手式（章）：AI 圖片的著作權 | [BiCS 第 2 堂](../../bics/lesson2/content.md) 約 1199～1214 行 | 沿用兩點確認；法律判斷改為「依一般說法」並提醒個案確認 |
| 圖片起手式（章）：在 Codex 建立圖像 | BiCS 約 1216～1252 行「建立圖像」 | ChatGPT／Gemini 介面步驟刪除，改為 Codex 對話描述；沿用「後面不重複步驟」 |
| 教材與活動配圖（章）：懶人包、活動流程、流程圖 | BiCS 約 1254～1443 行「懶人包、行程表、流程圖」 | 懶人包→家長通知懶人包；員工旅遊行程→校外教學流程；新人訓練流程→事實與意見學習流程 |
| 教材與活動配圖（章）：活動海報、教材示意圖 | BiCS 約 1445～1524 行「影片封面、圖片加文字」「食物模擬」 | 影片封面→活動海報底圖（標題留白自己排）；食物模擬→水的三態教材示意圖 |
| 課程總結、下一堂預告 | EDA 約 1201～1208 行總結；[Claude 講義](../claude/content.md) | 預告第 3 堂 Claude（Connector、Project、Skill） |

## 官方核對

以下頁面已於 2026-11-05 使用 web open 實際讀取。

- [Projects and chats](https://learn.chatgpt.com/docs/projects)：桌面專案包含連接電腦資料夾的 local projects；與 ChatGPT Project 區別。
- [Local environments](https://learn.chatgpt.com/docs/environments/local-environment)：Codex 的本機環境與桌面工作方式；未向零基礎學員要求編輯 `.codex` 設定。
- [Image generation](https://learn.chatgpt.com/docs/image-generation)：在互動對話描述圖片、生成及修改圖片；使用相關額度。講義未固定模型、價格或保證所有帳號可用，並有 ChatGPT 圖片替代流程。
- 照片轉 Excel 段：官方文件未保證 Codex 可讀手寫照片或直接寫 `.xlsx`，講義已加上「讀不清先標黃」與「改存 CSV（UTF-8 含 BOM，不確定處寫在備註）」的替代說法；授課前請實測。
- Codex 桌面版的官方下載連結尚未核對，講義未放連結；授課前確認後補上。

## 練習素材

- `example/reading-delivery/`（build 時自動打包為 `assets/reading-delivery.zip`）：第 1 堂「閱讀探索日」延伸材料，Markdown／CSV／TXT 已可直接使用，故意含錯通知供核對。
- `input/活動申請表_空白.csv`：填表練習用的空白表，每列一個欄位並附填寫規則；預期答案列在講義「對照預期結果」卡片。
- `回條範本.html`：可列印的回條範本（A4 一張 4 份，欄位：座號、是否參加、陪同家長人數、備註），學員手寫 3～5 張虛構回條後拍照，放進 `回條照片/`。
- `使用說明.md`：只說明各資料夾用途，不寫核對答案。

## 待補圖片

content.md 已在對應位置放 `<!-- 待補圖片：檔名｜說明 -->` 註解；底稿的 EDA 截圖為 Cowork 介面、BiCS 截圖為 ChatGPT／Gemini 介面，不適用於 Codex，故未搬入。

| 建議檔名 | 對應位置／截圖要求 |
|---|---|
| `assets/codex-app-entry.png` | 初探 Codex App：桌面版入口與登入後主畫面 |
| `assets/codex-folder.png` | 選資料夾：選取「閱讀活動練習」後的畫面，虛線紅框標工作位置 |
| `assets/receipt-photos.png` | 照片轉 Excel：3 張用回條範本手寫的虛構回條照片，其中 1 張有潦草字跡 |
| `assets/receipt-excel-result.png` | 辨識結果寫進 Excel，不確定格標黃 |
| `assets/form-fill-result.png` | 活動申請表填入結果，預定日期標「待確認」、擬議場地寫在備註 |
| `assets/codex-image-first.png` | 在 Codex 對話描述並生成第一張圖 |
| `assets/flowchart-result.png` | 學習流程圖生成結果，註明 AI 生成示意圖 |
| `assets/poster-background-result.png` | 活動海報底圖生成結果，註明 AI 生成示意圖 |

## 教學限制

- 真實學生資料的上傳、校務系統寫入、寄送通知、對外發布與使用付費 API，均非本練習要求。
- `seo.url` 等網址是沿用站台目錄慣例的預定路徑，不表示已發布。
