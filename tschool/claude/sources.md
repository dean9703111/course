# 素材來源與改編紀錄

本檔供講師備課核對，不是學員操作講義。底稿為 `course/tahoho/content.md`（達和企業內訓，較新版）；章節標題、小節順序、概念、比喻、Insight 沿用底稿，只換範例成教師與學校行政情境。

## 講義章節對照

| 講義章節 | 底稿檔案與原段落 | 範例怎麼改 |
| --- | --- | --- |
| 🙋 課前回顧 | `course/bics/lesson2/content.md` 第 1～43 行寫法 | 回顧第 1 堂 ChatGPT、第 2 堂 Codex，只列重點，不要求記得操作 |
| 起手式：AI 的能力，取決於你給它哪些工具 ＋ 開工設定：隱私、偏好、權限，一次設好（兩章） | tahoho 第 55 行起（痛點 1～3、使用時機、名詞、模型選擇；隱私與設定拆成「開工設定」章） | 法律研究 Prompt 改為「閱讀日家長通知」；痛點舉例換成家長訊息、教學計畫、研習公告；刪「Cowork vs Claude Code」小節（第 4 堂處理）；新增「今天的資料底線」卡 |
| 資料安全：上傳學生資料前，先做去識別化（原為起手式的一節，獨立成章） | `video/surfshark_esim/surfshark/講稿.md`「痛點：去識別化很繁瑣」「① 為什麼需要去識別化」「② 去識別化工具實戰 Demo」STEP 1～7；按鈕與分頁名稱對照工具原始碼 `~/Documents/external_project/data-deidentification/src/ui/` | 六步驟只用一張 flow 回顧（完整操作在第 1 堂）；合約 Word 改為多工作表的虛構學生名冊；STEP 7 的「客戶編號」改為「學號」自訂規則；給 AI 的任務改為統計行政區與找聯絡資料缺漏（需維持預設「部分保留」）；不搬「③ 打造客製化的工具」、廣告段、釣魚段 |
| 串接日常工具：透過 Connector 讓 AI 長出眼睛和手 | tahoho 第 228 行起（Gmail 分類、信件脈絡、Calendar） | 分類規則改為家長／主任來信、研習公告、電子報；脈絡彙整與日曆範例改用 `example/reading-day/03-活動郵件串.md`、`04-模擬行事曆.md`（14:00 與模擬教研會衝突）；刪 M365 小節與第二個 interactive；新增「練習前準備」卡（下載包、各檔用途、把信件與行程放進測試帳號的步驟）與三個「沒有連接權限改貼文字」的 Prompt（分類用 `08-分類練習信件.md`） |
| 建立專屬知識庫：建立 Project 不必每次重講背景 | tahoho 第 393 行起（為什麼要 Project、專案指令、上傳 PDF、Drive 連結） | 議事錄／採購規範改為 `01-閱讀日草案`、`02-閱讀日決議`；Drive 步驟改用 `05-假物資收據.csv`；驗證三問改為「場地被取代」「待確認與沒寫的分別照實回答（報名截止日＝待確認、校外作家＝沒有記錄）」「補一格後合計更新」；刪法規內規 insight |
| 把好方法變成 SOP：設計 Skill 站在更高的起點 ＋ 分享與深入：把 Skill 傳出去，也看懂它怎麼運作（兩章，後者含分享匯入、結構、使用經驗） | tahoho 第 631 行起（為什麼要 Skill、skill-creator、分享匯入、結構、使用經驗） | work-report 日報 Skill 改為 `parent-notice` 家長通知 Skill；驗證一為「沒提供就標待確認」、驗證二為「放進 Project 讀到決議」；刪「優化版加信箱行事曆」、info-card-generator 下載包與字卡 prompt；Skill 結構的互動 HTML 改為表格 |
| 結語 | `course/bics/lesson1/content.md` 第 1120 行起 | 本堂重點回顧＋第 4 堂 Cowork 預告 |

不搬 tahoho 第 856 行起的 Cowork、Vibe Coding、課程總結、諮詢時段（第 4 堂範圍）。

## 練習素材

- `example/reading-day/`：虛構閱讀日資料，build 時打包為 `assets/reading-day.zip`（8 個檔）。
- 新增 `08-分類練習信件.md`：10 封虛構信件（家長詢問、主任交辦、同事請託、研習通知、校內公告、副本、已處理回覆、電子報、廠商促銷、過期邀請），基準日 2030-05-06；參考分類為重要 1～3、封存 4～7、刪除候選 8～10，答案只寫在講義、不寫在素材檔。底稿是讓學員整理自己的信箱，這份只當沒有連接權限時的備案（講師也可寄進測試信箱補拍標籤結果圖）。
- `00-使用說明.md` 已補 05、06、08 的用途。`course/tschool/cowork/example/reading-day/` 是第 4 堂的複本，那邊的 07 是「輪值條件」，所以本堂新增檔用 08、跳過 07；兩包的 00 說明各自維護，沒有互相同步。
- `example/student-roster/學生名冊-虛構.xlsx`：去識別化練習用，build 時打包為 `assets/student-roster.zip`。三個工作表：「基本資料」（學號、班級、座號、姓名、性別、身分證字號、戶籍地址）、「家長聯絡」（學號、學生姓名、家長姓名、關係、手機、市話、Email）各 12 列，「說明」標明全為虛構。身分證字號符合檢核碼、道路名為「練習路／範例街／示範路／虛構路」、Email 用 example.com；除座號外都是文字型儲存格（工具不處理數值儲存格）。已用工具原始碼的偵測函式實跑：內建規則命中姓名 36、身分證 12、地址 12、手機 11、市話 6、Email 10，學號 0；加自訂規則 `S\d{6}(?!\d)`（類別「識別碼」）後學號 24 格全中、12 個編碼。參考答案：板橋 4、中和 3、永和 2、土城 2、萬華 1；缺 Email＝張語彤、許博鈞，缺手機＝蔡睿恩。
- 所有學生、家長、日期與數字皆為虛構；報名方式、截止日、費用維持「待確認」，不得自行填入。

## 圖片

已複製（tahoho 通用介面截圖，已看過畫面無企業內容；設定頁背景有一行極淡的對話標題，可接受）：`claude-privacy.png`、`claude-general-setting.png`、`claude-capabilities.png`、`claude-memory.png`、`claude-gmail.png`、`claude-gmail-permissions-list.png`、`claude-gmail-permissions-check.png`。

未搬（畫面含達和專案名稱、Blackbao 信件、會議內容或其他客戶資料）：`claude-projects`、`claude-project-create`、`claude-project-init`、`claude-project-connect-drive`、`claude-project-drive`、`claude-skill-creator`、`claude-skill-download`、`claude-skill-upload`、`claude-skill-upload2`、`claude-calendar`、`claude-calendar-create`、`claude-calendar-gmail` 等。

## 待補圖片

| 講義位置 | 建議檔名 | 要拍什麼 |
| --- | --- | --- |
| 去識別化 STEP 1 | deid-roster-sheets.png | 工具載入「學生名冊-虛構.xlsx」的預覽，紅框標三個工作表頁籤與「部分保留」，學號欄仍是原文 |
| 去識別化 STEP 2 | deid-roster-rule-form.png | 「偵測規則」新增自訂規則表單（名稱學號、類別識別碼、規則、測試文字命中），紅框標「複製 AI 提示詞」「新增規則」 |
| 去識別化 STEP 2 | deid-roster-rule-result.png | 回「去識別化」分頁的「家長聯絡」工作表，整欄學號變成 S[識別碼] |
| 去識別化 STEP 3 | deid-roster-claude.png | Claude 讀 .deid.xlsx 後的行政區統計與三筆缺漏，標記原樣保留並提供 Excel 下載 |
| 去識別化 STEP 4 | deid-roster-restore.png | 「還原」分頁放入 Claude 產出的 Excel 與編碼表，紅框標已還原筆數與「下載還原文件」 |
| Gmail 標籤結果 | claude-gmail-result-check-school.png | 完成後回 Gmail 看到「重要／封存／刪除候選」標籤（把 08-分類練習信件 寄進測試信箱的虛構信件） |
| 信件脈絡彙整 | claude-gmail-integration-school.png | 三封閱讀日信件整理出的時間線與待確認清單 |
| 回覆草稿 | claude-gmail-res-school.png | AI 擬的回覆草稿（不寄出） |
| Google Calendar 連接 | claude-calendar-school.png | Connectors 頁 Calendar 的 Connect 按鈕（側欄無真實專案名） |
| 信件轉行事曆 | claude-calendar-gmail-school.png | 事件草稿與 14:00 衝突提醒、建議 15:00 |
| New project | claude-projects-school.png | Projects 頁點 New project |
| 建立專案 | claude-project-create-school.png | 填入「閱讀日活動籌備」的 Create a project 視窗 |
| 專案指令 | claude-project-instructions-school.png | 貼入 Instructions 後的畫面 |
| 出處與取代 | claude-project-source-school.png | 回答「多功能教室，原為圖書室」並附出處 |
| 誠實說沒有 | claude-project-nothing-school.png | 報名截止日回答「決議寫待確認」、校外作家回答「目前文件沒有記錄」 |
| Drive 連接 | claude-project-connect-drive-school.png | Connectors 頁 Google Drive 連接 |
| Files 選 Drive | claude-project-drive-school.png | Files「+」→ Drive，已貼虛構收據試算表 |
| 雲端更新 | claude-project-drive-update-school.png | 補完 C 後合計由 210 變 250 |
| skill-creator | claude-skill-creator-school.png | Customize → Skills 中的 skill-creator |
| 儲存 Skill | claude-skill-parent-notice.png | parent-notice 的 Save skill |
| 被動觸發 | claude-skill-parent-notice-chat.png | 新對話觸發，缺項標「待確認」 |
| Project 內觸發 | claude-skill-parent-notice-project.png | 在 Project 觸發，帶出多功能教室，報名方式與聯絡方式仍標「待確認」 |
| 下載 Skill | claude-skill-download-school.png | Skill 右上「⋮」→ Download |
| 匯入 Skill | claude-skill-upload2-school.png | Upload skill 拖放區 |

content.md 各處以 `<!-- 待補圖片：檔名｜要拍什麼 -->` 註解標出位置，沒有引用不存在的圖片。

## 官方功能核對提醒

- 介面入口與可用功能依帳號、管理設定與版本不同；找不到時以講師示範或貼入虛構文字完成同一練習。
- Project 雲端連結「改完即更新」依底稿說法，講義已補一句「沒更新就請 AI 說明讀到哪個版本」。

## 待換圖片

已放進講義、但畫面露出其他客戶或課程內容的截圖；`content.md` 對應位置有 `<!-- 待換圖：… -->` 註解。

| 檔名 | 問題與重拍要點 |
|---|---|
| `assets/claude-memory.png` | 上方標題列（模糊但讀得出）是達和案例對話「委託廢棄物遭非法棄置的責任研究」；在新對話或練習對話中開設定重拍 |
| `assets/claude-privacy.png` | 上方標題列（模糊但讀得出）是達和案例對話「委託廢棄物遭非法棄置的責任研究」；在新對話或練習對話中開設定重拍 |
| `assets/claude-general-setting.png` | 上方標題列（模糊但讀得出）是達和案例對話「委託廢棄物遭非法棄置的責任研究」；在新對話或練習對話中開設定重拍 |
| `assets/claude-capabilities.png` | 上方標題列（模糊但讀得出）是達和案例對話「委託廢棄物遭非法棄置的責任研究」；在新對話或練習對話中開設定重拍 |
| `assets/claude-gmail.png` | 側欄露出達和案例對話「委託廢棄物遭非法棄置的責任研究」與釘選的「PPA 線上課程」；重拍時側欄只留練習對話，或裁掉側欄 |
| `assets/claude-gmail-permissions-list.png` | 側欄露出達和案例對話「委託廢棄物遭非法棄置的責任研究」與釘選的「PPA 線上課程」；重拍時側欄只留練習對話，或裁掉側欄 |
| `assets/claude-gmail-permissions-check.png` | 側欄露出達和案例對話「委託廢棄物遭非法棄置的責任研究」與釘選的「PPA 線上課程」；用閱讀日練習信件重拍授權視窗，側欄只留練習對話 |
