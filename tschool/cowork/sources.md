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
| 工具思維：Vibe Coding 是什麼／風險與邊界／從自己的需求出發／班級小工具，原來可以自己做 | 第 1115～1190 行 | 維護績效 → 班級抽籤工具；醫院排班與課前訪談故事為講師自己的經驗，排班故事依專訪 Q4 擴寫（見下方「講師專訪內容」）；新增「🧰 班級小工具」清單（2026-11-10 重組），「🎯 用日常工作開始嘗試」併入清單下方的條列，刪「工程師的角色，也在改變」洞察與「🐛 遇到錯誤很正常」卡 |
| 動手實作：用白話文做出班級抽籤工具（第一版抽一人、第二版分組） | 第 1192～1222 行（ERP Skill 做成網頁） | 2026-11-10 重組：原本只輸入人數的分組器，改成同一個 `class-tool.html` 跨版本延續：v1 名單抽一人 → v2 加分組與「不能同組」隱性規則；保留規格表、驗收表、錯誤回報 prompt 的寫法；兩版用 `| branch:v1-抽一人`、`| branch:v2-分組` 標記 |
| （同章）純前端減少資安疑慮 | 第 1224～1258 行 | 去掉 SheetJS／Excel 說明，補一句「貼給 AI 的內容仍會送雲端」；改為「練習只用座號」 |
| 版本控制：存檔點，就是 AI 時代的後悔藥 | 第 1260～1323 行 | 2026-11-10 重組：刪除 GitHub 建 repo、Pages、Claude Code 雲端優化、PR 與 merge 段落；改成「Git＝遊戲存檔點」比喻、三句話對照表（存檔／列出存檔點／回到上一個存檔點），在 Code 分頁（Claude Code 本機）建立第一個存檔點，再用第三版「一次抽多人」走完「存檔 → 加功能 → 驗收 → 存檔或回到上一版」並故意改壞一次；branch、PR、GitHub 只在「案例回顧」的進階洞察帶過 |
| 規格驅動開發：複雜的工具，先畫設計圖再蓋房子 | 無（新增） | 「先畫設計圖再蓋房子」比喻；把本堂的需求表、驗收表對應成迷你規格；附講師 Spec-Kit 影片（嵌入）與 OpenSpec 影片（連結），不實作 |
| 課程總結 | 第 1337～1462 行 | 回顧改成四堂系列；刪去諮詢時段（第 1466 行起） |

## 講師專訪內容

來源：`video/ppa/專訪邀約/回覆草稿.md`（PPA 合作專訪，講師本人回答）。本堂只用 Q4 與 Q5 的開頭、結尾；Q5 中段的報帳、PDF 表單、少量資料試跑等細節分給第 1、2 堂。

| 專訪段落 | 放在哪裡 | 元件 | 改寫重點 |
| --- | --- | --- | --- |
| Q4：醫院排班工具（Claude Code 做出第一版，護理長試用後浮現隱性規則） | 「工具思維」章 →「從自己的需求出發」，下一節接「🧰 班級小工具」清單 | `### 🏥` 卡片＋三步 flow，接自問自答洞察「為什麼班級工具，由老師自己做最合適？」 | 事實照專訪（班別相接、包班、跨月夜班接白班）；體會轉成老師情境（哪些學生不適合同組、哪些條件要平均分配）；原「課前訪談小故事」洞察濃縮成同一框裡的一句引言；「動手實作」章的「專業是最後一哩路」補 ex 呼應 |
| Q5 開頭與結尾：先找重複、格式固定、能判斷對錯的任務；跑順第一個流程再套用；最後為結果負責的是你自己 | 「課程總結」→「回顧：這個系列走過的路」最後，復盤 prompt 之後、Q&A 之前 | `### 🚀` 卡片＋三步 flow，收在洞察金句 | ex 用本系列做過的任務（行政週報、作業繳交登記、家長通知），不用專訪的報帳例子 |

為了控制篇幅一併精簡：「🎯」卡第三條醫院排班改短（細節移到新卡；2026-11-10 重組時整張「🎯」卡併入「🧰 班級小工具」下方條列）；刪「課前訪談小故事」的原因、方案兩條（「等數週甚至幾個月才修正」不再出現）；刪「⚡ 把該省的力氣省下來」中與新卡重複的「把工作的某個環節變順」一條。

## 練習素材（build 時自動打包成 `assets/<資料夾名>.zip`）

| 資料夾 | 內容 | 用在哪 |
| --- | --- | --- |
| `example/homework-sheet/` | 可列印的空白「作業繳交登記」簽收表（html）與使用說明 | 照片批量轉存 Excel |
| `example/reading-day/` | `01`〜`05` 閱讀日資料、`07` 輪值條件放進 `school-ai-demo/input`；`00` 使用說明與 `06` 練習名單與測試紀錄表留在外面 | 閱讀日摘要、輪值安排；`06` 用在抽籤工具三個版本的驗收 |

`example/reading-day/` 的 `00` 已依本堂內容改寫並新增 `07`，和第 3 堂（`claude/example/reading-day/`）的複本不再相同。`06` 在 2026-11-10 改成抽籤工具的練習名單（1號〜10號）與 v1～v3 驗收紀錄表，並同步複製到第 3 堂的 `06`（兩份內容相同）。

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
- 2026-11-10 重組時刪除：分組器的「投影模式」優化 prompt、GitHub 建 repo 與 Pages 步驟、Claude Code 雲端連接 GitHub、建立 PR 並 merge 的 prompt、「雲端改程式很方便，但有它的缺陷」警告。

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
| 抽籤工具第一版 | cowork-class-tool-v1.png | 貼上 1號〜10號、按抽籤後放大顯示抽中的座號 |
| 抽籤工具第二版 | cowork-class-tool-v2.png | 10 人分 3 組的結果，紅框標「不能同組」設定欄與分組結果 |
| Code 分頁 | claude-code-open-folder.png | Code 分頁輸入框下方的環境「Local」、資料夾「class-tool」與權限模式（乾淨帳號） |
| 第一個存檔點 | claude-code-first-save.png | Claude 回報已建立「v2：抽一人＋分組」並列出存檔紀錄 |
| 回到上一版 | claude-code-restore.png | 故意改成黑底紅字的畫面，與回到上一個存檔點後恢復原樣的左右對照 |
| 復盤 | ai-summary.png | 6 份復盤報告畫面；要用有一個月以上對話紀錄的帳號重拍（全新帳號沒有歷史、跑不出結果），原圖含講師個人工作內容，重拍後遮蔽客戶名稱與個資再放 |

## 已搬入 assets/ 的通用截圖

claude-cowork-permissions.png、framework.png、terminal.png（均已確認無企業內容）。github-new-repo.png、github-pages-setting.png 在 2026-11-10 重組時因不再引用而刪除（畫面原本就露出其他課程的 repo 名稱）。

## 待換圖片

目前沒有。原本的兩張 GitHub 截圖已隨章節重組刪除。

## 講師影片（頻道「工程師下班有約」）

| 影片 | 放在哪裡 | 形式 |
| --- | --- | --- |
| 【Manus 桌面版教學】讓 AI 操作電腦，從資料夾彙整報告、辨識圖片寫 Excel、自動填表單（https://youtu.be/WGHQuCI3iJk） | 初探 Cowork →「🎬 延伸參考：同一類的桌面 Agent」 | 連結（第 1 堂已嵌入同一支） |
| 【Cursor 教學】安裝 3 款讓 Vibe Coding 效率翻倍的工具（https://www.youtube.com/watch?v=5DEV_K0JauQ&t=836s，13:56 起） | 版本控制 →「🧰 先確認電腦有 Git」 | 帶時間點的連結 |
| 【Claude Code × Spec-Kit 教學】用規格驅動開發全端專案（https://youtu.be/16IIi5uNx_M） | 規格驅動開發 →「🎬 延伸學習」 | 嵌入 `[youtube]` |
| 【Claude Code 實戰】一次搞懂 OpenSpec，讓專案每次迭代都有依據（https://youtu.be/FeQv7mngg6Q） | 同上 | 連結 |

## 官方功能核對（2026-11-10）

- Git 安裝：[Git 官網 Windows](https://git-scm.com/install/windows)（Git for Windows 安裝檔，2.56.0，另有 winget）；[Git 官網 macOS](https://git-scm.com/install/mac)（Homebrew、MacPorts 或 Xcode Command Line Tools `xcode-select --install`）。
- Code 分頁：[Claude Code Desktop quickstart](https://code.claude.com/docs/en/desktop-quickstart)：Code 分頁需要付費方案；App 已內建 Claude Code，不用另裝 Node.js 或 CLI；環境選「Local」、資料夾控制項選「Open folder…」。
- [Claude Code Desktop](https://code.claude.com/docs/en/desktop)：Worktree 預設關閉，Claude 直接在專案資料夾工作；權限模式為 Manual／Accept edits／Plan／Auto／Bypass（舊版叫 Ask permissions／Auto accept edits／Plan mode），Accept edits 會自動套用檔案修改，但執行其他指令前仍會詢問；多數 Mac 內建 Git，Windows 缺 Git 時依提示安裝 Git for Windows。
- 為什麼存檔點不在 Cowork 做：查不到官方說明 Cowork 支援 Git；社群回報（claudeissues.com #55206、#56324、#61343、#62545、#85577）指出 Cowork 掛載的資料夾無法刪除檔案，`git` 會留下 `.git/index.lock`、`git add` 可能沒有實際加入檔案。改在 Code 分頁的本機工作階段操作，授課前在 Mac、Windows 各實測一次。
- 授課前確認：學員電腦能否自行安裝 Git（Windows 建議課前裝好）；Code 分頁權限模式的名稱與位置；Code 分頁第一次執行 Git 時的確認視窗長相。
