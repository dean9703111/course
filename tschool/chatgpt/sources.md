# 第 1 堂素材來源與改編紀錄

本檔供講師備課與追溯；不作為學員頁章節。章節與說明沿用 BICS 第 1 堂講義，只把範例換成學校老師與行政的日常情境；學生資料一律虛構。未搬入 BICS「Gemini Notebook」整章。

2026-11-10 改版：新增「網頁版與桌面版」「三大 AI 功能對標」與「圖片生成」章，融入講師專訪回覆兩段，並為了維持 2 小時精簡多處段落（見下方「2026-11-10 改版紀錄」）。

## 講義章節對照

| 講義章節 | 底稿 | 範例怎麼改 |
|---|---|---|
| 認識生成式 AI：如果不會，問 AI 不香嗎？ | `course/bics/lesson1/content.md` 12–38 行 | 痛點括號補上備課、家長通知、會議記錄 |
| 認識生成式 AI：初探生成式 AI | BICS 第 1 堂 40–103 行 | 書籍案例沿用；「Prompt Engineering 依舊重要」卡片刪除（Prompt 章已涵蓋）；「AI 工具這麼多」卡片與工具比較圖移到選擇工具章 |
| 認識生成式 AI：生成式 AI 應用場景 | BICS 第 1 堂 105–138 行 | 「各行各業案例」改為導師／授課教師／行政／學務；三張 `[case]` 濃縮成一張「情境／痛點／AI 先做／你負責」表格 |
| 選擇工具：網頁版與桌面版 | 新寫；依 OpenAI 官方說明（見下方「官方來源」） | 網頁版 vs 桌面版對照表、桌面版多出的四項能力、「對話 vs 工作」（原在資料安全章）、Codex 是第 2 堂主角 |
| 選擇工具：三大 AI 功能對標 | BICS 第 1 堂 140–195 行的功能對照表，依三家官方說明重寫 | 改成九個功能類別＋三家網頁版／桌面版網址；加入四堂系列 flow 與「熟悉一個最重要」 |
| 選擇工具：資訊安全 | BICS 第 1 堂 219–260 行 | 警告框加一條學生資料不貼；第三方工具卡補「桌面版從官方連結下載」 |
| 選擇工具：免費 VS 付費 | BICS 第 1 堂 262–300 行＋講師專訪回覆 Q1 前半 | 刪除主觀評分表與「拿回時間」「選擇生態系」兩張卡；改為專訪的「付費是分水嶺」卡，收在「用好 AI 需要系統性學習」 |
| 能力與風險：AI 的能力範圍 | BICS 第 1 堂 300–347 行 | 幻覺清單改為出考題、引用課綱法規；「最新資訊不等於正確資訊」併成一條；課綱 insight 刪除（與 warning 重複） |
| 能力與風險：AI 的逆向工程 | 講師文章〈[小心！你的 AI 可能被人控制了](https://deanlin.net/blog/202511/prompt-injection-risks/)〉＋影片〈AI 陷阱 EP1〉（BICS 第 1 堂原用合約範例） | 改用〈再別康橋〉作業：Word 白底版給 ChatGPT（照唯一解答亂寫）、網頁版 [deanlin.net/prompt-inject-exmaple](https://deanlin.net/prompt-inject-exmaple/) 給 Gemini（最後一行加 AI 聲明）；範例檔放講師 [Google 雲端資料夾](https://drive.google.com/drive/folders/1WXeC4aqqLkq4mwimhgIV0qLn1rkBHgeu?usp=sharing)（白底／黑字兩版，2026-11-10 確認未登入可瀏覽）；新增「老師反過來用」insight，註明不能當抄襲證據；講師示範＋課後自行操作 |
| 資料安全：帳號安全與基本設定 | BICS 第 1 堂 427–454 行 | 設定步驟與截圖沿用；「對話 vs 工作」移到選擇工具章 |
| 資料安全：上傳敏感資料前，先做去識別化 | 非 BICS 底稿；來源為 `video/surfshark_esim/surfshark/講稿.md`「痛點：去識別化很繁瑣」「多重驗證＋去識別化」「去識別化工具分享」「① 為什麼需要去識別化」「② 去識別化工具實戰 Demo」STEP 1–6 與結語提醒 | 企業合約改為虛構「學生個別輔導紀錄」（`assets/學生個別輔導紀錄.docx`）；STEP 5 的 Prompt 改為整理給輔導室的摘要；STEP 7 自訂規則只留一句預告（第 3 堂 Claude 講）；按鈕與分頁名稱對過工具原始碼（`~/Documents/external_project/data-deidentification`）；本次改版未動 |
| Prompt 撰寫 | BICS 第 1 堂 456–611 行＋講師專訪回覆 Q3 第二個技巧 | 六技巧共用「國小高年級晨間閱讀」例子；技巧 5 合併「先反問」與專訪的「選擇題發想」，新增「家長通知 3 個切角」Prompt；「拿到答案後」兩張卡併成一張 |
| 圖片生成 | `course/tschool/codex/content.md` 改版前快照（308–474 行「圖片起手式」「教材與活動配圖」），更早出處為 `course/bics/lesson2/content.md` 1197–1585 行「生成圖片」 | 操作改為 ChatGPT「+」→「創作圖像」、下載圖片（不存 `output/`）；保留著作權、第一張閱讀情境圖、家長懶人包、學習流程圖、海報底圖、一句回饋修改；刪去校外教學活動流程圖與水的三態教材示意圖（後者「精確內容對照課本」併入檢查卡）；修改步驟加入官方說明的「選取區域」 |
| 個人化：記憶與自訂 | BICS 第 1 堂 613–735 行 | 兩個實戰演練合併成一個；「工具都是類似的」卡片（Gemini／Claude 設定圖）與第二個互動投票刪除，改在自訂結尾一句帶到第 3 堂 |
| 連接外部工具：Gmail 與行事曆 | BICS 第 1 堂 745–816 行 | 改為講師示範；刪除「資訊散落」insight 與兩個外掛綜合運用的待補圖 |
| 建立專案 | BICS 第 1 堂 818–954 行 | 專案情境改為「高年級閱讀理解行動研究（教師社群）」，素材包 `example/reading-research`（研究計畫書、分工與共備記錄、文獻與背景資料、評量規準與學習單格式），不放信件與行事曆；實戰演練 15 → 10 分鐘；分享專案兩個 STEP 併成一張卡 |
| 結語 | BICS 第 1 堂 1120–1142 行 | 重點回顧加入工具對標與圖片生成；新增「熟悉一個」insight；下一堂預告改為第 2 堂新內容（現成 Skill 做資訊卡、講義、簡報 → 彙整備課資源資料夾 → 手寫報名表照片轉 Excel） |

## 講師專訪內容放在哪裡

來源：`video/ppa/專訪邀約/回覆草稿.md`（講師本人回覆）。只用以下兩段，其餘題目保留給其他堂。

| 專訪段落 | 講義位置 | 改寫方式 |
|---|---|---|
| Q1 前半：付費是分水嶺；付費後仍抱怨 AI 忘記交代、產出不穩定，是不知道 Project、Skill；用好 AI 需要系統性學習 | 選擇工具 → 免費 VS 付費 →「💳 我觀察到的第一個分水嶺：有沒有付費」卡＋「使用 AI 沒有門檻，但用好 AI 需要系統性學習」insight | 三條條列＋一則 insight，連到四堂系列設計；Q1 後半的剪片工作流未使用 |
| Q3 第二個技巧：用選擇題的方式發想 | Prompt 撰寫 →「🙋 技巧 5：讓 AI 先反問，或先出選擇題」 | 與原本的「先反問」合併成一張卡；以「我自己備課最常用」現身說法；Prompt 改為閱讀探索日家長通知的 3 個切角 |

## 講師 YouTube 影片（頻道「工程師下班有約」，2026-11-10 以 oEmbed 核對標題）

| 影片 | 講義位置 | 用途 |
|---|---|---|
| [【Manus 桌面版教學】讓 AI 操作電腦，從資料夾彙整報告、辨識圖片寫 Excel、自動填表單](https://youtu.be/WGHQuCI3iJk) | 選擇工具 → 網頁版與桌面版 →「🎬 延伸參考：桌面 Agent 實際能做到什麼」 | 桌面版能存取檔案、操作電腦的延伸參考；帶出第 2 堂 Codex、第 4 堂 Cowork 是同一類能力 |
| [【Manus 實戰教學】從研究、簡報到個人網站，帶你掌握普通人也能上手的 AI Agent](https://youtu.be/P4dO-vsiE1Q) | 選擇工具 → 三大 AI 功能對標 →「🎬 延伸學習：Manus 也是一種 AI Agent」 | 呼應「熟悉一個最重要，其他都有對標」 |
| [【AI 陷阱 EP1】小心！你的 ChatGPT 可能被人控制了｜實測人類看不見的隱藏指令（Prompt Injection）](https://youtu.be/s9YM-Z2g8Xo) | 能力與風險 → AI 的逆向工程 →「🔬 在作業裡藏指令，AI 就照著亂答」 | 〈再別康橋〉作業示範的完整影片；BICS 第 1 堂原本就有嵌入 |

兩支影片各嵌在不同的 `##` 小節（每個小節一支），課堂不播放，作為課後延伸。

## 官方來源（2026-11-10 查證）

help.openai.com 對自動抓取回應 403，OpenAI 功能以 learn.chatgpt.com 與 chatgpt.com 官方頁面為主。

| 講義內容 | 來源 | 查到的重點 |
|---|---|---|
| ChatGPT 桌面版下載 | [chatgpt.com/download](https://chatgpt.com/download) | 桌面版帶入 ChatGPT Work 與 Codex；「Existing Codex app users can update to ChatGPT and open Codex」；「ChatGPT Work is available on Plus, Pro, Business, and Enterprise plans」 |
| 桌面版能力（檔案、App、瀏覽器、排程） | [ChatGPT desktop app](https://learn.chatgpt.com/codex/app) | 支援 macOS、Windows、Linux；Chat／Work 切換、選 ChatGPT 或 Codex；「ChatGPT can use the files and context in the location you choose」；可用瀏覽器、桌面 App、外掛，並可排程 |
| 對話／工作／Codex 的分工 | [ChatGPT Work and Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)（help.openai.com 擋自動抓取，2026-11-10 以瀏覽器讀取） | Chat「fast, conversational assistance」；Work「an agent designed for longer, multi-step work and finished deliverables」，用途為研究、分析、文件、試算表、簡報、報告、Site；Codex「remains dedicated to software development and technical work」，用途為寫程式、除錯、測試與指令、程式專案；Work 網頁與手機在雲端、不能直接讀本機檔案，桌面版經同意可用本機檔案與 App；Codex 是獨立畫面、紀錄與 ChatGPT 分開；「Work follows the same usage structure as Codex」 |
| 電腦使用（操作 App） | [Computer use](https://learn.chatgpt.com/codex/computer-use) | 「available on macOS and Windows with ChatGPT Work and Codex」；Mac 需螢幕錄製與輔助使用權限；可隨時停止或接手 |
| 內建瀏覽器、瀏覽器擴充功能 | [Browser](https://learn.chatgpt.com/codex/browser)、[Browser extension](https://learn.chatgpt.com/codex/chrome-extension) | 網頁版與桌面版都有內建瀏覽器；擴充功能支援 Chrome、Edge、Brave、Opera、Vivaldi，由桌面版控制 |
| Windows 版 | [Windows desktop app](https://learn.chatgpt.com/codex/windows/windows-app) | Microsoft Store 安裝；支援排程、內建瀏覽器、檔案預覽、外掛與 Skills |
| ChatGPT 圖片生成 | [Image generation](https://learn.chatgpt.com/docs/image-generation) | 網頁版在對話中要求生成；可選取特定區域描述修改；文字要短並用引號標出；用量依方案與工作區設定 |
| ChatGPT 圖像庫與下載 | [Images in ChatGPT](https://help.openai.com/en/articles/11084440-images-in-chatgpt)（經搜尋摘要，原頁 403） | 生成的圖片自動存到「Images」；用圖片選單的 Save 下載 |
| 「+」→「創作圖像」入口 | BICS 第 2 堂截圖 `chatgpt-image1.png`（2026-08） | 官方頁未寫入口位置，授課前以介面確認 |
| Claude 桌面版、Cowork | [claude.com/download](https://claude.com/download)、[Get started with Cowork](https://support.claude.com/en/articles/13345190-get-started-with-cowork) | macOS、Windows（Linux beta）；Cowork 限付費方案（Pro、Max、Ultra、Team、Enterprise）；桌面版可直接讀寫本機檔案、瀏覽器與電腦使用 |
| Claude in Chrome | [Get started with Claude in Chrome](https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome) | 付費方案 |
| Claude 圖片生成 | 第三方整理（ex: [godofprompt.ai](https://godofprompt.ai/blog/can-claude-generate-images/)） | 沒有內建圖片生成，只能畫圖表／SVG；未找到 Anthropic 官方明文 |
| Gemini 桌面版 | [gemini.google/desktop](https://gemini.google/desktop/)（`gemini.google/mac` 會轉址到這裡）、[Google 部落格：Gemini app now on macOS](https://blog.google/innovation-and-ai/products/gemini-app/gemini-app-now-on-mac-os/) | Mac（macOS 15 以上、Apple Silicon）與 Windows 10 以上；Option／Alt + 空白鍵叫出；Mac 版可用「任務」模式整理本機檔案；Windows 版功能陸續推出 |
| Gemini Spark | 第三方報導（[9to5Google](https://9to5google.com/?p=720238)、[PPC Land](https://ppc.land/google-restricts-new-mac-ai-agent-to-99-99-ultra-subscribers/)） | Mac 版「Connected folders」；先開放美國 AI Ultra；未讀到 Google 原文 |
| Gemini 筆記本（Notebooks） | [Google 部落格：notebooks in Gemini](https://blog.google/innovation-and-ai/products/gemini-app/notebooks-gemini-notebooklm/) | 2026-04 推出，與 NotebookLM 同步 |
| Gemini Skills 取代 Gems | [About the transition from Gems to skills](https://support.google.com/gemini/answer/18560919?hl=en)、[Workspace Updates](https://workspaceupdates.googleblog.com/2026/09/skills-gemini-app-workspace.html) | 個人帳號：11/17 Gems 轉唯讀、12/17 移除；Workspace 教育版 2027-06 |
| Gemini in Chrome 自動瀏覽 | [Google 部落格：Gemini 3 auto browse](https://blog.google/products-and-platforms/products/chrome/gemini-3-auto-browse/) | 2026-01 預覽，限美國 AI Pro／Ultra |

## 授課前確認

- ChatGPT「+」→「創作圖像」入口、側欄「圖像」與「下載」按鈕的中文名稱
- ChatGPT 免費版能否使用 Codex、桌面版各功能在免費／Plus 的開放範圍（第三方報導說三種模式所有方案都有，官方下載頁說 Work 限 Plus 以上；講義採官方說法）
- 電腦使用在 Windows 版與台灣地區是否可用
- 對照表中 Gemini 的中文介面名稱（筆記本、應用程式、個人化設定）；Spark 與 Gemini in Chrome 自動瀏覽在台灣是否開放
- Claude 沒有內建圖片生成（只查到第三方整理）
- 舊版 ChatGPT Mac App 是否已改名 ChatGPT Classic（第三方報導，講義未寫）

## 已複製的圖片

- 來自 `course/bics/lesson1/assets/`（通用介面或概念圖）：c012-i5、c015-i14、c030-i25、c031-i27、c037-i36、c038-i37、c043-i41、c049-i46、c050-i47、c066-i59、c068-i62、c069-i64、c069-i66、c072-i69、chatgpt-gmail、chatgpt-calendar、chatgpt-plus-only、chatgpt-project-create、illust-info-overload、illust-find-key-info。
- 來自 `course/bics/lesson2/assets/chatgpt-image1.png` → `assets/chatgpt-image-create.png`（2026-11-10 複製；已開圖確認：只有「+」選單與風格範例，頭像為講師縮寫 DE，沒有客戶內容）。
- 來自講師文章 `deanlin.net/blog/202511/prompt-injection-risks/images/`（2026-11-10 下載，講師自己的截圖）：圖 10 → `prompt-inject-word-content.webp`、圖 11 → `prompt-inject-word-hide.webp`、圖 5 → `prompt-inject-chatgpt-1.webp`、圖 7 → `prompt-inject-chatgpt-2.webp`、圖 12 → `prompt-inject-web-page.webp`、圖 14 → `prompt-inject-gemini-result.webp`。
- 本次改版後未再使用、但仍留在 `assets/`：`c072-i69.png`、`illust-info-overload.jpg`、`illust-find-key-info.jpg`。

## 待補圖片

content.md 已在對應位置留 HTML 註解，不建立失效的圖片連結。截圖請使用練習帳號，遮住信箱與姓名。

| 建議檔名 | 要拍什麼 |
|---|---|
| `chatgpt-desktop-modes.png` | ChatGPT 桌面版主畫面，紅框標出「對話／工作」切換與 Codex 入口（新） |
| `new-chat-per-topic.png` | 左側欄「新對話」位置（紅框） |
| `deid-upload.png` | 去識別化工具首頁，把「學生個別輔導紀錄.docx」拖進虛線上傳區（紅框：上傳區、貼上文字框） |
| `deid-preview.png` | 輔導紀錄的預覽畫面，敏感資料換成方括號類別（紅框：「輸出設定」的「全部隱藏」） |
| `deid-manual-add.png`、`deid-cancel.png` | 圈選學號後的浮動視窗（類別「識別碼」、紅框「新增為去識別化項目」）；點「易分心」標記後的確認視窗（紅框「取消去識別化」） |
| `deid-download.png` | 上方工具列（紅框「下載（文件＋編碼表）」）與下載到的 `.deid.docx`、`.mapping.csv` |
| `deid-chatgpt.png` | ChatGPT 讀取去識別化輔導紀錄後產出的摘要，方括號代號原樣保留，並提供 Word 檔 |
| `deid-restore.png` | 「還原」分頁上傳兩個檔案後顯示已還原筆數（紅框「下載還原文件」） |
| `ai-response-example.png` | 依自訂格式回覆的晨間閱讀做法與比較表 |
| `image-first-result.png` | 閱讀情境圖生成結果，註明 AI 生成示意圖（新） |
| `image-download.png` | 點開生成圖片後的檢視畫面，紅框標出「下載」（新） |
| `flowchart-result.png` | 學習流程圖生成結果（新，原屬第 2 堂） |
| `poster-background-result.png` | 活動海報底圖生成結果（新，原屬第 2 堂） |
| `image-edit-select.png` | 用「選取」工具圈出背景區域並輸入修改指令，紅框標出選取工具（新） |
| `memory-first-ask.png`、`memory-save.png`、`memory-new-chat.png`、`memory-self-summary.png` | 記憶測試四步驟畫面 |
| `custom-about-you.png`、`custom-test.png` | 「關於你」填寫、新對話不交代背景提問（回覆帶入暱稱、任教年級並在結尾反問） |
| `chatgpt-gmail-permissions.png`、`chatgpt-calendar-permissions.png` | Gmail、Calendar 授權權限勾選 |
| `gmail-summary.png` | 閱讀探索日四封籌備信的脈絡整理結果（測試信箱） |
| `calendar-confirm.png`、`calendar-created.png` | 建立前提供草稿並提醒與「高年級學年會議」衝突、建立成功 |
| `project-new.png`、`project-files.png`、`project-setting.png`、`project-instructions.png` | 建立專案、上傳四個素材檔、專案設定與指令 |
| `project-verify-source.png`、`project-verify-decision.png`、`project-verify-nothing.png`、`project-verify-notice.png` | 四個驗證問題的回覆（出處、決策、沒有記錄、依範本寫通知初稿） |
| `project-share-invite.png` | 分享邀請與權限設定 |

改版時移除的待補圖片（不必再拍）：`claude-personalization.png`、`calendar-gmail-result.png`、`project-init.png`、`project-share-member-view.png`。

## 課前準備：Gmail 與 Google Calendar 示範

「連接外部工具」兩個範例讀的是測試帳號，素材包的文字檔不會自動變成信件或行程。

1. 準備一個只放練習資料的 Google 測試帳號，在 ChatGPT 連接 Gmail 與 Google Calendar。
2. 照 `example/reading-assistant/往來信件.txt` 的順序，把四封信寄進測試信箱：主旨與內文照抄，寄件者用自己的另一個測試帳號或別名；與會者只會是這些測試帳號，不要填真實同事的信箱（建立事件會真的寄出邀請）。
3. 照 `行事曆.txt` 在測試行事曆建立兩筆現有行程（12/2 圖書室書籍盤點、12/3 高年級學年會議）。
4. 素材的日期以 2026/11/23 上課為基準（信件 11/16–11/19、會議 12/3）；改期開課時，三組日期一起往後移，星期也要重對。
5. 信件裡寫的日期是內文；Gmail 顯示的收信時間會是實際寄出的時間，不影響兩個範例。

## 去識別化範例檔：自動偵測結果

`assets/學生個別輔導紀錄.docx`（講義直接連這個檔下載，單一檔案不打包 zip）全為虛構，以工具的 `scripts/lib/render-docx.ts` 產生。2026-11-10 用工具原始碼的 `parseDocx` → `detect(BUILTIN_PATTERNS)` 實跑：自動偵測 24 筆（編碼表 12 列），去識別化後再還原與原文完全一致。

| 內容 | 結果 |
|---|---|
| 林宥辰、陳美華、林建宏、張雅婷、黃志明（姓名） | 自動隱藏 |
| A135792469（身分證，檢核碼正確）、民國 103 年 5 月 12 日（「出生日期」標籤後） | 自動隱藏 |
| 0912-345-678（手機）、(02)2765-4321（市話）、meihua.chen@example.com、台北市信義區松仁路100號5樓 | 自動隱藏 |
| 學號 1140317、班級座號「六年三班 17 號」 | 不會隱藏，STEP 3 練習圈選新增（類別選「識別碼」） |
| 「上課容易分心」的「易分心」 | 誤判為姓名，STEP 3 練習「取消去識別化」 |

改動範例文字後要重跑偵測：姓名規則靠姓氏＋前後文，換一個詞就可能多出或少掉誤判。工具改版後，講義裡的按鈕名稱（開始去識別化、輸出設定、調整 ▾、全部隱藏、新增為去識別化項目、取消去識別化、展開偵測清單、下載（文件＋編碼表）、下載還原文件）也要重對。

## 驗收答案（不放進素材包，避免被 AI 當成知識庫）

| 範例 | 預期看到 |
|---|---|
| 彙整信件脈絡 | 會議由 12/2（三）15:00 改到 12/3（四）14:00–14:30；場地原訂圖書室，改用多功能教室只是提議、尚待確認；30 份閱讀單可能不夠，會議上確認；活動日期未定 |
| Gmail＋行事曆 | 事件：2026/12/3（四）14:00–14:30、教務處會議室；議程三項（場地、閱讀單份數、活動日期候選時段）；與會者為教學組、行政組、高年級導師三個角色；提醒與「高年級學年會議」13:30–14:30 重疊；先給草稿再建立 |
| 專案：出處 | 帶鉛筆、水壺；免費；出處為活動條件.md |
| 專案：決策 | 原訂圖書室；郵件提議改多功能教室、尚待確認，12/3 籌備會議才討論；不能說已改地點 |
| 專案：沒有記錄 | 報名截止日期「目前文件沒有記錄」；12/3 是籌備會議，不能當成活動日期或截止日 |
| 專案：依範本寫初稿 | 順序為標題 → 活動目的 → 對象與已知條件 → 攜帶物品 → 待確認事項；不超過 300 字；日期、地點、報名方式標「待確認」；活動目的來自教學目標.md（區分事實與意見）；不出現「校長已核准」等宣稱 |
| 圖片：懶人包 | 有主題、3 個重點、一句話總結；圖中沒有自行加入日期、校名、校徽或 QR Code；「免費」「鉛筆、水壺」字樣正確 |

## 待換圖片

已放進講義、但畫面露出其他客戶或課程內容的截圖；`content.md` 對應位置有 `<!-- 待換圖：… -->` 註解。

| 檔名 | 問題與重拍要點 |
|---|---|
| `assets/c068-i62.png` | 側欄「專案」露出「安美諾行銷文案」（下一列「GSK競爭對手分析」也露出一半）；重拍時側欄只留練習專案，或裁掉側欄 |
| `assets/chatgpt-gmail.png` | 側欄「專案」露出「安美諾行銷文案」「GSK競爭對手分析」「青農專題簡報」；重拍時側欄只留練習專案，或裁掉側欄 |
| `assets/chatgpt-calendar.png` | 側欄「專案」露出「安美諾行銷文案」；重拍時側欄只留練習專案，或裁掉側欄 |

`assets/c072-i69.png`（Gemini 側欄露出個人與其他課程對話標題）已不在講義中使用；若之後要放回，仍需裁掉側欄或重拍。

## 2026-11-10 改版紀錄

- **新增**：網頁版 vs 桌面版（含 Codex 預告）、三大 AI 功能對標表＋四堂系列 flow、圖片生成章（約 20 分鐘）、專訪兩段。
- **刪除或濃縮**：Prompt Engineering 重要性卡；三張應用場景 `[case]` → 一張表；「AI 工具這麼多」卡移到對標段；付費評分表、「拿回時間」「選擇生態系」兩張卡；「最新資訊」卡併入幻覺清單；課綱 insight；逆向工程實戰演練改示範；技巧 5 的「建議根據實際情況填寫」insight；「拿到答案後」兩卡併一；記憶與自訂兩個演練併一、刪「工具都是類似的」卡與第二個互動投票；外部工具「資訊散落」insight；專案分享兩步驟併一。
- **時間**：實戰演練合計 15＋12＋7＋5＋10＝49 分鐘；各章分鐘數寫在 content.md 的講師備註。
