# 生成式 AI 研習：教師與學校行政 AI 實戰課

對象為學校老師與學校行政，預設會使用瀏覽器與辦公軟體，沒有程式開發背景。共四堂，每堂 19:00~21:00。

每堂的大綱沿用講師過去分享的講義，章節順序、概念與說明照舊，只把範例換成老師與學校行政的日常（家長通知、活動籌備、班級經營、教材製作）。校園情境與練習資料是教學改編，不代表曾替特定學校執行的成果。

| 堂次 | 日期 | 底稿 | 講義 Markdown | 預覽頁 | 課堂成果 |
| --- | --- | --- | --- | --- | --- |
| 1：ChatGPT | 11/23 | BICS 第 1 堂（前導＋ChatGPT 實戰應用）＋BICS 第 2 堂「生成圖片」＋去識別化影片講稿 | [content.md](chatgpt/content.md) | [index.html](chatgpt/index.html) | 網頁版 vs 桌面版、三家 AI 功能對標、學生輔導紀錄去識別化、家長通知 Prompt、教材圖片生成、記憶與自訂、連接外部工具、閱讀探索日專案 |
| 2：Codex | 11/24 | EDA「讓 AI 動手處理檔案」＋安美諾「簡報設計 Skill」，工具換成 ChatGPT 桌面版的 Codex | [content.md](codex/content.md) | [index.html](codex/index.html) | 老師版 Skill（資訊卡、線上講義、校園簡報）、單元備課包彙整、手寫報名表照片轉 Excel |
| 3：Claude | 11/26 | 達和（起手式、Connector、Project、Skill）＋去識別化影片講稿 | [content.md](claude/content.md) | [index.html](claude/index.html) | 學生名冊去識別化（自訂規則）、信件分類與行事曆、閱讀日 Project、家長通知 Skill |
| 4：Cowork | 11/27 | 達和（Cowork、Vibe Coding、課程總結） | [content.md](cowork/content.md) | [index.html](cowork/index.html) | 簽收表照片轉 Excel、閱讀日摘要與輪值、排程、班級抽籤分組工具（Git 存檔點）、SDD 延伸 |

## 備課與來源

各堂 `sources.md` 記錄底稿段落對照、範例怎麼改，以及待補圖片清單：

- [ChatGPT 來源與圖片](chatgpt/sources.md)
- [Codex 來源與圖片](codex/sources.md)
- [Claude 來源與圖片](claude/sources.md)
- [Cowork 來源與圖片](cowork/sources.md)

通用的介面截圖已從底稿 `assets/` 複製過來；顯示範例結果的截圖還沒拍，位置用 `<!-- 待補圖片：… -->` 註解標在 `content.md`，不建立失效的圖片連結。正式上課前用授課帳號補拍，操作圖用虛線紅框標出控件。

學生與家長資料一律虛構。練習素材放在各堂 `example/`，講義內附下載連結。

## 上課前確認

- 以授課帳號確認各工具功能、授權範圍與校方帳號限制；沒有連接器權限時，使用講義提供的檔案練習方式。
- 操作畫面可能隨版本調整，圖片需配合現場版本補拍。
- ChatGPT 的資料控管入口沿用 BICS 原文「個人化 → 資料控管」，授課前以當時介面確認。
- Codex 的手寫報名表照片辨識、能否直接寫出 `.xlsx`，授課前實測一次（講義已附「不確定先標黃」「改存 CSV」的備案）。
- Codex 的老師版 Skill：`@` 或 `$` 哪個能列出技能、技能包安裝核准畫面、授課電腦能否用 `python3` 產出 PPTX（Mac、Windows 各試一次）；備案是把技能 zip 匯入 ChatGPT 網頁版「技能」。
- 第 4 堂的 Git 存檔點在 Claude 桌面版 Code 分頁操作（社群回報 Cowork 掛載資料夾跑 Git 會卡 `index.lock`）；Windows 學員課前先裝 Git。
- 各堂授課前確認清單詳見各自的 `sources.md`。
- 學員任教學段與學校實際核准政策尚未指定，因此沒有代填。
- `content.md` 是內容來源；修改後需重新產生 `index.html` 與 `assets/og-image.jpg`。

從本儲存庫根目錄執行（每堂各跑一次）：

```bash
node .agents/skills/course-page-generator/scripts/build.mjs course/tschool/chatgpt --check
node .agents/skills/course-page-generator/scripts/generate-og.mjs course/tschool/chatgpt
```

將最後的 `chatgpt` 替換為 `codex`、`claude` 或 `cowork`，即可更新對應講義。
