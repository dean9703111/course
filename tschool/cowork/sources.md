# 素材來源與改編紀錄

本檔供講師備課核對，不是學員操作講義。核對日：2026-11-05。課堂範例均為教學改編；沒有校方提供的政策、日期或正式資料，因此不代填這些資訊。

## 既有素材 → 本堂改編

| 來源 | 原有內容／可回查小節 | 本堂使用方式 |
| --- | --- | --- |
| [EDA 講義](../../eda/content.md) | 「讓 AI 動手處理檔案」「初探 Cowork」「多格式資料彙整」 | 延續指定資料夾、成品交付；改為閱讀日摘要、input/output 分離，增加來源與讀取失敗驗收。 |
| [TSGH 講義](../../tsgh/content.md) | 「Vibe Coding」相關單元、「把範例帶回家：Fork ＋ Clone 後用編輯器開啟」與版控段落 | 保留需求先行、測試迭代、版控回頭路；以分組器取代醫療工具，Git 只作選配。 |
| [桌面版影片](../../../video/manus/ep5-my-computer/origin.md) | 「讓 AI 操作前，先知道三件事」「多格式資料彙整成指定報告」 | 只借用縮小授權、新增檔案代替覆蓋、保留原始檔等方法；不把 Manus 介面與額度套給 Cowork。 |
| [去識別化影片](../../../video/surfshark_esim/surfshark/講稿.md) | 「手動去識別化的問題」約 229 行、「人工調整」約 286 行、「結語」約 420 行 | Excel 多工作表漏遮、PDF 白框可複製、對照表不能一起給 AI、自動偵測人工複核；改為學生資料教學案例。 |
| [去識別化影片](../../../video/surfshark_esim/surfshark/講稿.md) | 「在 AI 時代，打造客製化的工具」「從自己的需求出發」約 335–395 行 | 小工具先縮小範圍、不先加資料庫、做第一版後持續迭代。沒有把純前端一概等同零外送。 |
| [原影片備份稿](../../../video/surfshark_esim/esim_backup/講稿.md) | 約 517–529 行：講者為內訓做去識別化工具，分享後收到校園用途回饋 | 這是講者原有經驗，講義明確分開「原經驗」與「校園改編」。不延伸宣稱已替學校部署／經校方核准。 |

## 官方功能核對

- [Get started with Claude Cowork](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)：確認可承接多步驟任務、專業文件成品、桌面本機讀寫能力。官方目前亦有雲端任務及 web/mobile 支援，Chat/Cowork 正整合；不照抄舊 EDA 的「僅桌面可用」或「Project 永遠分開」。
- 上述文件明確描述雲端任務；講義據此提醒本機檔案入口並不代表模型全在本機。成品是否外送則需另外檢查該 HTML 程式、外部資源與請求。

## 案例邊界與授課前準備

- 本堂是請學員用 AI 生成並驗收分組器的操作講義，不附已完成工具，也不假稱已實測特定 AI 生成結果。
- 先準備兩份上一堂閱讀日虛構文件（草案：圖書室；明確取代場地的決議：多功能教室；報名方式未定）。
- 上課不開真實學生名冊，分組僅使用 1 至 N 臨時數字編號；教師自行判斷教學適用性。
- 無外部請求、無儲存為這次工具的需求與驗收目標，不能因 AI 聲稱遵守便當作已驗證。
- 去識別化補充保留重要判斷，不將技術處理寫成法律核准或保證匿名。

## 待補圖片

| 講義位置 | 建議檔名 | 畫面要求 |
| --- | --- | --- |
| 初探 Cowork | assets/cowork-folder-scope.png | 當前桌面資料夾授權入口、input/output；虛線框出實際授權範圍。 |
| 分組器實作 | assets/cowork-group-tool-states.png | 正常輸入、結果與錯誤輸入三狀態；生成後實測再截。 |
| 去識別化補充 | assets/school-deidentification-example.png | 全虛構資料，遮姓名後仍可辨識的敘述線索對照。 |
| 選配版控 | assets/group-tool-version-history.png | 假資料專案的 Commit 與 Diff，無帳號敏感資訊。 |

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

回顧8＋Cowork交付20＋需求邊界12＋分組器45＋版控8＋總結7＝100分鐘，不含QA/休息。主線：摘要、一個完整分組器、投影/列印與驗收紀錄；成品包/假物資表由講師示範，行政抽籤與排程為課後加碼，不另派全班實作。
新增待補圖片：assets/cowork-deliverable-pack.png（三件套）、assets/group-tool-projector.png（投影）、assets/group-tool-print-delivery.png（黑白列印/說明/紀錄）。原有四張仍保留。
