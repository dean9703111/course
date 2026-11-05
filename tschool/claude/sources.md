# 素材來源與改編紀錄

本檔供講師備課核對，不是學員操作講義。核對日：2026-11-05。課堂範例均為教學改編；沒有校方提供的政策、日期或正式資料，因此不代填這些資訊。

## 既有素材 → 本堂改編

| 來源 | 原有內容／可回查小節 | 本堂使用方式 |
| --- | --- | --- |
| [EDA 講義](../../eda/content.md) | 「起手式：AI 的能力，取決於你給它哪些工具」「了解使用時機、合作方式」 | 保留工具分工與痛點，以教師重複交代年級、行政重複交代活動資訊改編。 |
| [EDA 講義](../../eda/content.md) | 「Notion 知識庫存取、限定搜尋範圍」「出處可追溯」「不知道的問題會誠實回覆」 | 改為兩份虛構閱讀日文件，保留指定範圍、引用來源與故意問無答案題的驗證法。 |
| [EDA 講義](../../eda/content.md) | 「建立專屬知識庫」「設計專案指令」「變更的決策可追溯邏輯」 | 活動草案→決議替代，要求明確取代依據，不僅因日期較新就當作核准。 |
| [EDA 講義](../../eda/content.md) | 「彙整對話生成 Skill」「分享 & 匯入 Skill」「Skill 使用經驗」 | 將提案 SOP 改為活動通知檢查；保留先實戰、後萃取、換任務重測。 |
| [TSGH 講義](../../tsgh/content.md) | 開場「今天所有練習，都使用去識別化的虛擬範例」與「上傳前，先過個資這一關」 | 沿用假資料與人工負責原則；醫療指引不移植成學校規定。 |
| [Connector 影片](../../../video/manus/ep2-連結器（Connector／MCP）/origin.md) | 「沒有連接器，人類就是搬運工」「限定範圍、要求出處」「詢問範圍外的問題」 | 僅借用工具分工與驗證觀念；不把 Manus Gmail 寫入能力當成 Claude 通用能力。 |
| [Skill 影片](../../../video/manus/ep3-技能（Skill）/origin.md) | 「技能＝給 AI 的 SOP 手冊」「把過去與 AI 對話的流程，轉化成重複使用的技能」「驗證技能」 | 改編為教師／行政通知 SOP；不沿用 Manus 排程、發布等產品能力。 |
| [Project 影片](../../../video/manus/ep4-專案（Project）/origin.md) | 「痛點②：開新對話，一切重來」「用指令＋文件，建立專案記憶助理」 | 沿用背景沉澱觀念，改成課務工作區；不沿用 Manus 即時修改或共享權限承諾。 |

## 官方功能核對

- [Use connectors to extend Claude’s capabilities](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)：確認來源權限、連接器功能各有差異、Customize → Connectors 與工具權限。實際可用性依帳號／組織設定。
- [What are projects?](https://support.claude.com/en/articles/9517075-what-are-projects)：確認知識檔案與專案指令，並記錄新版 beta 正分批推送；講義不固定承諾所有人有同一介面。
- [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)：確認必要 name／description、資料夾＋Markdown、ZIP 資料夾結構、啟用與新案例測試。講義 SKILL.md 用大寫命名，符合開放 Agent Skills 慣例。

### 舊素材未直接沿用的說法

- 不保證 Project 雲端來源「即時更新」，改為人工核對版本與引用。
- 不複製舊免費額度、模型版本、付費限制。
- 不將提示詞指定範圍當成來源服務的安全權限隔離。

## 待補圖片

| 講義位置 | 建議檔名 | 畫面要求 |
| --- | --- | --- |
| 起手式 | assets/claude-workflow-map.png | 校園版工具分工；圖解而非產品截圖。 |
| Connector 授權 | assets/claude-connector-permissions.png | 當前入口、測試帳號、權限範圍；控件虛線紅框，遮帳號。 |
| Project 建立 | assets/claude-project-reading-day.png | 同框呈現活動專案、指令及兩份虛構來源。 |
| Skill 匯入與驗證 | assets/claude-school-notice-skill.png | 啟用入口與載入紀錄；不只展示生成文案。 |

圖片尚未拍攝，content.md 各處以 HTML 註解提醒，沒有引用不存在的圖片。

## 100分鐘擴充版：情境、金句與產出對照

| 來源 | 原情境／觀念 | 本次校園改編與交付 |
| --- | --- | --- |
| [Manus ep1](../../../video/manus/ep1-introduction/origin.md) | 「讓AI把事情做完，跟讓AI把事情做好，其實是兩件事」；先優化需求、反問、確認大綱才生成 | 轉成先訂完成標準、讓AI問3個關鍵問題；主線一個完整工具，先規格再動手。 |
| [Manus ep2](../../../video/manus/ep2-連結器（Connector／MCP）/origin.md) | 多封郵件脈絡→Calendar事件；把瑣碎交給AI，把決策留給自己 | 閱讀日三封模擬郵件→變更摘要→時區與衝突提案；Calendar寫入僅講師測試事件，不直接寄邀請。 |
| [Manus ep3](../../../video/manus/ep3-技能（Skill）/origin.md) | 七步提案優化（反問→利害關係人→挑錯→改稿）；最珍貴是打磨過程 | 改為家長/導師/行政三方挑錯，再封裝通知SOP；測第二活動是否保留未知欄位。 |
| [Manus ep4](../../../video/manus/ep4-專案（Project）/origin.md) | 新人培訓與交接；同樣背景說第三次就值得開Project；排程讓AI準時來找你 | 共用活動事實生成三對象版本，提供承辦接手問題；排程概念移到第4堂課後示範，依Claude官方能力重新核對。 |
| [Manus ep5](../../../video/manus/ep5-my-computer/origin.md) | 多格式彙整、照片進Excel、不確定留空標黃、先讀表單規則 | 活動摘要/追蹤表/檢核三件套示範；假物資CSV210元已知小計與1筆未知分開，不假稱完成照片OCR。 |
| [Amiino講義](../../amiino/content.md) | 567–606紅藍隊；1255–1332先做對流程再Skill；903起先大綱/預覽/格式/成品 | 通知加入無來源100元費用的挑錯互動，Skill含反問與驗收；分組工具先規格、再改善投影與黑白列印。 |

### 新增官方核對

- [Google Workspace connectors](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors)：Gmail查信/草稿、Calendar讀寫事件、Drive搜尋與讀檔等功能；附件metadata不代表附件內容已讀。講義只用測試帳號，主線可貼文字完成。
- [Schedule recurring tasks in Claude Cowork](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork)：確認Scheduled入口、排程管理、可手動試跑與暫停；官方有雲端排程，也保留特定本機任務的例外。講義只示範可用雲端假資料，不承諾離線電腦檔案永遠可讀。

### 可下載材料

`example/reading-day/`含00使用說明、01活動草案、02活動決議、03三封郵件、04模擬行事曆、05假物資CSV、06空白測試紀錄。content.md的`[download dir="reading-day"]`由build打包到assets/reading-day.zip。
兩堂各自附同包，可獨立上課，毋須先取得ChatGPT/Codex資料。分組器仍是課堂請AI生成的目標，素材包沒有假裝已完成的工具。

### 課程節奏

起手式10＋Connector30＋Project25＋Skill30＋收束5＝100分鐘，不含QA/休息。主線：郵件摘要、Project、通知SOP；Calendar/Drive由講師示範，延伸出題與更新版文件放課後。分段含授權/下載/匯入緩衝。
新增待補圖片：assets/claude-mail-calendar-demo.png（郵件/時區/衝突）、assets/claude-three-audiences.png（三對象版本）、assets/claude-notice-red-team.png（無來源費用挑錯）。原有四張仍保留。
