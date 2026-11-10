# 素材來源與改編對照

本檔供講師備課核對，不是學員操作講義。所有學生、活動資料均為虛構。

## 講義章節對照

| 講義章節 | 底稿（`course/tahoho/content.md`） | 範例怎麼改 |
| --- | --- | --- |
| 課前回顧 | 參考 `course/bics/lesson2/content.md` 第 1～43 行寫法 | 回顧第 3 堂 Connector／Project／Skill，列出本堂 5 個成果 |
| 照片轉 Excel：讓 AI 直接操作你電腦上的檔案（初探 Cowork） | 第 856～871 行 | 沿用 Chat vs Cowork 比較與使用提醒；授權視窗圖用通用截圖 |
| （同章）照片批量轉存 Excel | 第 873～920 行 | 發票報銷 → 手寫「作業繳交登記」簽收表（座號、日期、狀態）；學員用空白簽收表（`example/homework-sheet/`，講師課前印好發下）手寫 3 張虛構表拍照 |
| 檔案分析與排班：讀取多格式檔案分析資訊 | 第 922～948 行 | 同仁問題＋附檔 → 閱讀日虛構資料包（`example/reading-day/`）整理已確認／待確認摘要 |
| （同章）案例：閱讀日的老師輪值安排 | 第 950～974 行（訓練安排） | 八人二帳號十堂課 → 8 位老師、3 站點、3 節輪值；條件寫在 `example/reading-day/07-輪值條件.md`（對應底稿的訓練安排.xlsx）；Email 通知改為通知草稿；保留「先釐清再排」與「這個結果讓人滿意嗎？」 |
| 排程：固定要做的事，讓 AI 時間到自己跑 | 第 1058～1111 行 | 環保法規追蹤 → 教育部公告追蹤；流程、表格欄位、提醒維持原文；表格後另附可複製的 prompt。底稿在排程前的「Skill 並非最佳選項」洞察移到本章結尾，當作進入「工具思維」章的過場 |
| 工具思維：Vibe Coding 是什麼／風險與邊界／從自己的需求出發 | 第 1115～1190 行 | 維護績效 → 班級分組器；醫院排班與課前訪談故事為講師自己的經驗，保留 |
| 動手實作：把班級分組器做成網頁 | 第 1192～1222 行（ERP Skill 做成網頁） | 改為不需名冊的純前端分組器，附規格表、測試表、錯誤回報 prompt |
| （同章）純前端減少資安疑慮、案例回顧 | 第 1224～1258 行 | 去掉 SheetJS／Excel 說明，補一句「貼給 AI 的內容仍會送雲端」 |
| 版本控制：建立 Git 版本控制 | 第 1260～1323 行 | ERP 網頁 → 分組器；Claude Code 優化改為加「投影模式」 |
| 課程總結 | 第 1337～1462 行 | 回顧改成四堂系列；刪去諮詢時段（第 1466 行起） |

## 練習素材（build 時自動打包成 `assets/<資料夾名>.zip`）

| 資料夾 | 內容 | 用在哪 |
| --- | --- | --- |
| `example/homework-sheet/` | 可列印的空白「作業繳交登記」簽收表（html）與使用說明 | 照片批量轉存 Excel |
| `example/reading-day/` | `01`〜`05` 閱讀日資料、`07` 輪值條件放進 `school-ai-demo/input`；`00` 使用說明與 `06` 測試紀錄表留在外面 | 閱讀日摘要、輪值安排；`06` 用在分組器驗證 |

`example/reading-day/` 的 `00`、`06` 已依本堂內容改寫並新增 `07`，和第 3 堂（`claude/example/reading-day/`）的複本不再相同。

輪值條件有解，備課核對用的一組排法（休息：第 1 節 C、H；第 2 節 A、G；第 3 節 B、D）：

| 節次 | 入場報到 | 共讀區 | 書籤製作 |
| --- | --- | --- | --- |
| 第 1 節 | A、G | B、D | E、F |
| 第 2 節 | C、H | B、E | D、F |
| 第 3 節 | A、F | C、G | E、H |

## 刪掉的底稿範例

- 「案例：ERP 維護績效」整段（分析工作表、逆向工程設計程式、ERP Skill、erp-raw 下載包）：企業內容，且與老師情境無關。
- 「讀收據寫 Excel」範例包（cowork-excel）與費用報銷單據。
- 「同仁問題範例.xlsx」課前需求包（cowork-needs-folder）。
- ERP 網頁工具下載包與 GitHub Pages 範例網址。

## 待補圖片清單（content.md 中以 HTML 註解標示）

| 講義位置 | 建議檔名 | 要拍什麼 |
| --- | --- | --- |
| 初探 Cowork | claude-cowork-ui.png | Cowork 分頁與「Manually approve」；需用乾淨帳號重拍（底稿原圖側欄有企業專案名稱） |
| 照片轉 Excel | cowork-choose-folder.png | 「Add folder」選取「簽收表照片」資料夾 |
| 照片轉 Excel | claude-cowork-photo-excel.png | 辨識結果寫進 Excel，不確定格標黃（用虛構簽收表） |
| 照片轉 Excel | claude-cowork-photo-excel-skill.png | 設計成 Skill 並標出「Save」 |
| 閱讀日摘要 | cowork-choose-folder-one.png | 選取 `school-ai-demo` 單一資料夾 |
| 輪值案例 | cowork-discuss.png、cowork-not-ok-result.png | AI 反問條件、AI 初步排出的輪值表 |
| 排程 | claude-scheduled-task.png | Scheduled → New task → Create with Claude |
| 排程 | claude-scheduled-test.png、claude-scheduled-test-result.png | Run now 與執行結果（教育部公告追蹤） |
| 分組器 | cowork-group-tool-states.png | 輸入、正常結果、錯誤提醒三個狀態 |
| Claude Code 優化 | claude-code-optimize.png、claude-code-merge.png、claude-code-merge2.png、claude-code-result.png | 以分組器專案重拍 |
| 復盤 | ai-summary.png | 6 份復盤報告畫面；要用有一個月以上對話紀錄的帳號重拍（全新帳號沒有歷史、跑不出結果），原圖含講師個人工作內容，重拍後遮蔽客戶名稱與個資再放 |

## 已搬入 assets/ 的通用截圖

claude-cowork-permissions.png、github-new-repo.png、github-pages-setting.png、framework.png、terminal.png（均已確認無企業內容；GitHub 圖中的專案名稱僅為示範）。

## 待換圖片

已放進講義、但畫面露出其他客戶或課程內容的截圖；`content.md` 對應位置有 `<!-- 待換圖：… -->` 註解。

| 檔名 | 問題與重拍要點 |
|---|---|
| `assets/github-new-repo.png` | 頁面露出三總課程範例 repo「nurse-shift-scheduler」；重拍時捲到不顯示其他 repo 的位置，或裁掉下方列表 |
| `assets/github-pages-setting.png` | repo 名稱是三總課程的「monthly-report-tool」，和講義的 class-group-tool 不同，圖中分支顯示 master；用 class-group-tool 重拍後可拿掉圖說的「僅為示範」 |
