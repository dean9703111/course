# 素材來源與改編對照

本檔供講師備課核對，不是學員操作講義。所有學生、活動資料均為虛構。

2026-11-16 改版重點：資料夾由 `cowork/` 改名為 `claudecode/`；講義全文不再使用「Cowork」這個名稱，一律寫「Claude 桌面版」；刪除「排程」與「閱讀日摘要與輪值」兩章；前半段完全共用第 3 堂的案例（行政文件案例庫與 admin-template Skill），結構比照第 2 堂「上一堂的專案，改成直接讀資料夾」；Vibe Coding 主案例由班級抽籤工具改成班級官網，全程在 Code 分頁（Local）操作。

## 講義章節對照

| 講義章節 | 底稿 | 範例怎麼改 |
| --- | --- | --- |
| 課前回顧 | 參考 `course/bics/lesson2/content.md` 第 1～43 行寫法 | 回顧第 3 堂 Connector／Project／Skill，列出本堂 5 個成果 |
| 讓 AI 直接動手：安裝 Claude 桌面版 | 結構比照 `codex/content.md`「安裝 ChatGPT 桌面版」 | 開場比較改成「網頁版 🆚 桌面版」，對齊第 2 堂的說法；第一步先到官網下載 App、用上一堂的帳號登入（連結用不必登入就能開的 `claude.com/download`） |
| （同章）上一堂的案例庫，改成直接讀資料夾 | 結構比照 `codex/content.md`「上一堂的專案，改成直接讀資料夾」；問題沿用 `claude/content.md` Project 章的驗證 prompt；選資料夾與使用提醒出自 `course/tahoho/content.md` 第 856～871 行 | 素材與第 3 堂完全相同（9 份 Word＋本學期活動一覽），不新增案例；選資料夾與使用提醒放在下載素材之後，在案例裡操作，介面名稱不寫死，待截圖時以當下版本為準；對照表改成「網頁版 Project 🆚 桌面版資料夾」；補一個洞察：Project 的指示不會跟過來，規則要寫進 prompt |
| （同章）Skill 跟著帳號走 | 沿用第 3 堂的 `admin-template` Skill 與呼叫方式 | 第 3 堂寫閱讀日通知，本堂改寫期末班親會通知（活動一覽裡唯一「已確認」又有對應案例的項目），成品直接存成 Word 進資料夾；附技能包給沒上過第 3 堂的學員匯入 |
| （同章）檔名雜亂的資料夾，也可以請它整理 | 無（新增一張卡） | 兌現第 3 堂「下一堂讓 AI 直接動手整理檔名」的預告；只給通用 prompt（先列對照表、確認後才改名），不另做素材 |
| 班級官網：每天都要發的訊息，給它一個固定的家 | `course/tahoho/content.md` 第 1115～1190 行（Vibe Coding 概念、風險、從需求出發） | 保留 Vibe Coding 定義、玩具與工具、醫院排班故事；新增「班級訊息散落各處」痛點、班刊比喻的名詞表（Markdown、轉換程式、Git、GitHub、GitHub Pages、GitHub Actions）、三個分頁與六個步驟總覽、公開網站的邊界 |
| 動手做：一步一步蓋出班級官網（第 0～5 步） | 流程參考 `course/tsgh/content.md` 第 1166～1323 行（先讀懂、先問方案、親手驗收）與第 1512～1643 行（Git、GitHub Pages）；環境安裝的說法承接第 2 堂「Skill 第一次在 Codex 執行，可能遇到的問題」 | 步驟切小：0 規劃與環境檢測 → 1 生成網站 → 2 用 Markdown 編輯 → 3 加入 Git → 4 發布到 GitHub Pages（GitHub Actions 自動產生網頁）→ 5 更新聯絡簿、公告附檔案、課表圖片轉 Markdown。不做 GitHub 網頁拖拉上傳、Code 雲端、PR 與 merge |
| 規格驅動開發 | 無（2026-11-10 新增） | 迷你規格的對應改成第 0 步的目標說明與每一步的驗收表 |
| 課程總結 | `course/tahoho/content.md` 第 1337～1462 行 | 四堂回顧、summary 與 Q&A 改成桌面版整理檔案與班級官網 |

## 講師專訪內容

來源：`video/ppa/專訪邀約/回覆草稿.md`（PPA 合作專訪，講師本人回答）。本堂只用 Q4 與 Q5 的開頭、結尾。

| 專訪段落 | 放在哪裡 | 改寫重點 |
| --- | --- | --- |
| Q4：醫院排班工具（Claude Code 做出第一版，護理長試用後浮現隱性規則） | 「班級官網」章 →「從自己的需求出發」 | 事實照專訪；體會轉成老師情境（家長最常問什麼、哪些資訊不能公開） |
| Q5 開頭與結尾：先找重複、格式固定、能判斷對錯的任務；最後為結果負責的是你自己 | 「課程總結」→「下課後的第一步」 | ex 用本系列做過的任務（行政週報、家長通知、每日聯絡簿） |

## 練習素材（build 時自動打包成 `assets/<資料夾名>.zip`）

| 資料夾 | 內容 | 用在哪 |
| --- | --- | --- |
| `example/行政文件案例庫/` | 第 3 堂 `claude/example/admin-cases/` 的 9 份 Word 與 `claude/assets/本學期活動一覽.csv` 的複本，內容沒有改 | 直接讀資料夾問答、用 Skill 寫期末班親會通知 |
| `assets/admin-template.zip` | 第 3 堂 `claude/assets/admin-template.zip` 的複本（單一檔案下載，不經 example 打包） | 沒上過第 3 堂的學員匯入 Skill |
| `example/班級官網素材/` | `親子共讀夜活動通知.docx`、`校外教學行前通知.docx`（內容取自第 2 堂）、`親子共讀夜報名表.pdf`（由 `codex/tools/signup-photos/報名表範本_空白.html` 印出）、`五年三班課表.png` | 官網第 1 步的公告來源、第 5 步的附件與課表 |
| `example/班級官網完成範例/` | 做完第 2 步的網站：`content/` 三份 Markdown、`build.mjs`、`package.json`、`CLAUDE.md`、`README.md` | 沒跟上的學員從第 3 步接著做 |

備課核對用的重點：

- **前半段的預期答案**：校外教學 114 的紀錄是飲食與過敏、暈車座位、退費；期末班親會依活動一覽是 2027-06-07（星期一）19:00–20:30、六年三班教室、回條、已確認，案例 `會議邀請-班親會-114` 的 9 月 19 日不可沿用；案例庫沒有畢業典禮的通知。班親會 114 的「發出後的紀錄」是線上參加、帶孩子、停車三個問題。
- **兩堂的虛構設定不同**：前半段沿用第 3 堂（六年三班、2027 年 5～6 月），後半段的班級官網沿用第 2 堂（五年三班、2026 年 11～12 月）。兩段各自獨立，講義沒有把它們接成同一條故事線。
- **第 3 堂的素材改版時要同步**：`example/行政文件案例庫/` 與 `assets/admin-template.zip` 是複本，第 3 堂更新後要重新複製。
- **課表刻意留的考點**：大下課、午餐與午休是橫跨整列的合併格；週三下午三節合併成「12:40 放學」；科任課格內有老師與教室小字；表格下方三條備註。全週 32 節。課表原始檔是用 HTML 排版後截圖，沒有留在 repo。
- **完成範例**：`build.mjs` 用 `marked` 把 `content/*.md` 轉成 `site/*.html`，連結全用相對路徑，雙擊 `site/index.html` 或放在 GitHub Pages 子路徑都能用；已在本機 `npm install`、`npm run build` 驗證。zip 打包不含 `.` 開頭的檔案，所以範例裡沒有 `.gitignore` 與 GitHub Actions 設定，這兩樣由學員在第 3、4 步請 AI 建立。

## 刪掉的內容

- 2026-11-16：親子共讀夜的照片改名與報到表（曾寫好又撤掉，改成完全共用第 3 堂案例，不另做素材）、閱讀日摘要與老師輪值整章（`example/reading-day/`，不是第 2 堂的案例；第 3 堂仍保有自己的閱讀日素材）、簽收表照片轉 Excel（`example/homework-sheet/`）、Manus 影片延伸（第 2 堂已嵌入同一支）、「排程」整章、班級抽籤工具 v1～v3、Local Git 存檔點章與「故意改壞」練習、「純前端＝資料不出你的電腦」一節、閱讀日的 `06-測試紀錄空白表.md`。
- 更早刪除的底稿範例：「案例：ERP 維護績效」、讀收據寫 Excel、同仁問題範例、ERP 網頁工具與 GitHub Pages 範例網址。

## 待補圖片清單（content.md 中以 HTML 註解標示）

| 講義位置 | 建議檔名 | 要拍什麼 |
| --- | --- | --- |
| 安裝桌面版 | claude-desktop-download.png | 官網下載頁的 Download 按鈕與 macOS、Windows 下載選項 |
| 選資料夾 | claude-desktop-choose-folder.png | 桌面版新對話的選擇資料夾入口與權限模式（乾淨帳號） |
| 直接讀資料夾 | claude-desktop-folder-qa.png | 三個問題的回答與每題後面的出處檔名 |
| Skill 清單 | claude-desktop-skill-list.png | 桌面版輸入「/」後清單裡的 admin-template |
| 匯入 Skill（已補） | claude-desktop-skill-upload.png | 上傳外掛程式畫面：側欄外掛程式、admin-template.zip、預覽（已加虛線紅框） |
| 更新 Skill | claude-desktop-skill-update.png | AI 列出要改的段落（資料來源、交付方式），確認後才更新 |
| 寫通知 | claude-desktop-skill-notice.png | AI 說明選用的案例，資料夾裡多出新的 Word 檔 |
| Code 分頁 | claude-code-open-folder.png | 環境「Local」、資料夾「class-website」與權限模式 |
| 第 0 步 | claude-code-step0-plan.png、claude-code-step0-install.png | 環境檢查結果；安裝工具的核准提示（Mac、Windows 各一） |
| 第 1 步 | class-website-v1.png | 第一版官網首頁（手機與電腦寬度） |
| 第 2 步 | class-website-edit-md.png | 記事本改 Markdown 與重新整理後的聯絡簿對照 |
| 第 3 步 | claude-code-first-save.png | 第一個存檔點「班級官網第一版」 |
| 第 4 步 | github-login-device.png、github-actions-success.png、class-website-phone.png | 登入驗證碼畫面、Actions 綠色勾勾、手機打開網址 |
| 第 5 步 | class-website-timetable.png | 原始課表圖片與轉成 Markdown 後的課表分頁對照 |
| 復盤 | ai-summary.png | 6 份復盤報告畫面；要用有一個月以上對話紀錄的帳號重拍，遮蔽客戶名稱與個資 |

## 已搬入 assets/ 的通用截圖

claude-desktop-permissions.png（授權視窗，2026-11-16 由 claude-cowork-permissions.png 改名）、framework.png、terminal.png（均已確認無企業內容）。

## 講師影片（頻道「工程師下班有約」）

| 影片 | 放在哪裡 | 形式 |
| --- | --- | --- |
| 【Claude Code × Spec-Kit 教學】用規格驅動開發全端專案（https://youtu.be/16IIi5uNx_M） | 規格驅動開發 →「🎬 延伸學習」 | 嵌入 `[youtube]` |
| 【Claude Code 實戰】一次搞懂 OpenSpec，讓專案每次迭代都有依據（https://youtu.be/FeQv7mngg6Q） | 同上 | 連結 |

## 授課前要實測（講義內容尚未用授課帳號跑過）

- **介面名稱**：桌面版選資料夾的入口、權限模式的名稱；Code 分頁的環境「Local」、「Open folder…」、權限模式「Accept edits」（2026-11-10 依 [Claude Code Desktop](https://code.claude.com/docs/en/desktop) 核對，授課前再看一次）。
- **Skill 在桌面版資料夾的行為**：`admin-template` 的 SKILL.md 寫的是「用 Projects 工具查案例，不要去本機檔案系統找」，並用網頁版的方式交付檔案。講義改成先請 AI 更新 Skill（有選資料夾就從資料夾讀案例、成品存進資料夾，沒選才去專案找），再用一句話呼叫；請實測在桌面版能否用對話直接更新 Skill、更新後是否照做、Word 檔是否真的出現在資料夾；也確認網頁版建立的 Skill 在桌面版輸入「/」時看得到。
- **前半段的隔離環境**：講義寫「前半段的對話有一套備好工具的隔離環境，Code 分頁的 Local 用的是你電腦上的工具」，請以當下版本確認這個差異仍然成立。
- **環境安裝**：Mac、Windows 各跑一次第 0 步，確認 AI 安裝 Node.js、Git、GitHub CLI 的方式與核准畫面；Windows 的 Code 分頁（Local）是否要先裝 Git for Windows；學校電腦沒有安裝權限時的備案（講師示範，學員看畫面）。
- **GitHub 登入**：`gh auth login` 是互動式流程（瀏覽器輸入驗證碼），確認能在 Code 分頁內完成；卡住時的備案是請學員自己開終端機執行。
- **GitHub Pages**：AI 能否用 GitHub CLI 把 Pages 來源設成 GitHub Actions；第一次發布大約多久；講義寫的「1～2 分鐘」是否符合。
- **不公開信箱**：第 3 步請 AI 用 GitHub 的 noreply 信箱設定 Git，確認 AI 設定的格式正確、推送不會被擋。
- **課表轉換**：把 `五年三班課表.png` 拖進 Code 分頁的對話，確認能附加圖片，並對照講義的驗收表看 AI 常錯在哪裡。
- **Mac 的「文字編輯」**：確認打開 `.md` 是純文字模式，存檔不會變成 RTF。
- 學員課前先註冊 GitHub 帳號，可以省下課堂時間。
