---
name: course-page-generator
description: 把主題、講稿、大綱或筆記轉成約定格式的 content.md（Markdown DSL），再用內附的 build script 產出單一 HTML 的線上簡報／線上講義（自動目錄、深淺色、簡報模式、列印與 PDF、分享 QR）。當使用者說「做線上簡報」「做線上講義」「課程頁」「做講義網頁」「把講稿變網頁」「把這份講稿轉成課程頁面」「幫我生成課程頁面」「設計 XX 的講義並生成網頁」「重 build」「content.md 語法怎麼寫」，或在含有 content.md、config.yaml 的資料夾工作時使用。需要電腦有 Node.js；build 不用安裝其他套件。
---

# Course Page Generator

主題或講稿 → `content.md`（本 skill 的核心：格式轉換）→ `build.mjs` → `index.html`（瀏覽器打開就是線上講義，按 `P` 變簡報）

## 開始前

- **`SKILL_DIR`**：本 `SKILL.md` 所在的資料夾。下面的指令都要換成它的實際路徑；路徑有空白時記得加引號。
- **需要 Node.js**（建議 20 以上）：先跑 `node --version`。沒有的話不要自行安裝，先用白話告訴使用者要裝什麼、為什麼、去哪裡下載（Node.js 官網），等使用者同意再處理。
- `build.mjs` 只用 Node.js 內建功能，不需要 `npm install`。OG 縮圖與 PDF 匯出是選用功能，另外需要 puppeteer（見 Step 4）。

## 目錄慣例

```
<工作資料夾>/                 # 使用者開啟的資料夾
├── config/
│   ├── global.yaml          # 共用設定（講者、頁尾）；build 從講義資料夾往上找最多 4 層
│   └── assets/author.*      # 講者頭像（選用，副檔名可省略）
└── <講義資料夾>/             # 一份講義一個資料夾，用英文小寫 kebab-case（ex: chatgpt-desktop）
    ├── config.yaml          # 這份講義的設定（deep merge 覆蓋 global）
    ├── content.md           # 結構化講稿（沒有 frontmatter）
    ├── index.html           # build 產出
    ├── example/<主題名>/     # （選用）build 時打包成 assets/<主題名>.zip，給 [download] 用
    └── assets/              # 圖片、打包出的 zip
```

## Step 0：判斷輸入情境

| 情境 | 判斷依據 | 行動 |
|---|---|---|
| 只有主題 | 一句話主題／標題，沒有講稿 | 主題生成流程 → Step 2〜3 |
| 有講稿內容 | 講稿文字、大綱、筆記、投影片文字、資料夾裡的檔案 | 從 Step 1 開始，內容以素材為準 |
| 有現有目錄 | 指定已存在的講義資料夾 | 讀 content.md／config.yaml 後從 Step 1 開始 |
| 只要重 build | content.md 或圖片已改好 | 直接 Step 3 |

### 主題生成流程

1. **先確認四件事**（使用者已經給了就不要再問；缺的一次問完）：受眾（誰會看、已經會什麼）、目標（看完能做到什麼）、使用情境與時間（上課投影、跟著操作、課後複習；大約幾分鐘）、一定要涵蓋的重點。
2. **先回覆章節大綱**：3〜5 個 `#` 章節，每個章節一行說明，等使用者確認；使用者說「直接做」就略過等待，但大綱仍要列出。
3. **決定資料夾**：主題轉 kebab-case 英文（`chatgpt-desktop`）；使用者有指定路徑就用，否則建在目前的工作資料夾底下。
4. **建立** `<講義資料夾>/config.yaml`、`content.md` 與空的 `assets/`；工作資料夾沒有 `config/global.yaml` 就照 Step 2 建一份。
5. **寫 content.md**：每個 `#` 章節 1〜2 個 `##`、每個 `##` 2〜3 張 `### Emoji` 卡片；最後放 `[summary]`。沒有素材時，軟體介面、方案價格、規定、數字這類可能已經改變的內容不要寫成肯定句，標 `待確認` 並在回覆中逐條列出。
6. 跑 Step 3，回報結果。

## Step 1：講稿轉 content.md

這是本 skill 的核心任務。輸入可能是演講筆記、半結構化 Markdown 或投影片文字，依「轉換指引」與「寫作風格」轉成 `content.md`。

- **語法總表**見 [reference/syntax-table.md](reference/syntax-table.md)（每種語法的寫法、用途、範例）。
- HTML 對照與細部規則：[reference/components.md](reference/components.md)；可以直接 build 的完整範例：[example/demo/content.md](example/demo/content.md)。

### 常犯錯誤 Top 10

方括號內是 lint rule id；每次 build 都會帶行號印出來。

| # | 錯誤 | 正確寫法 |
|---|---|---|
| 1 | 不在任何元件裡的裸段落 `[loose-paragraph]` | 收進 `###` 卡片條列、`> **洞察**` 或其他元件 |
| 2 | `###` 卡片標題沒有 emoji 開頭 `[card-no-emoji]`；標題剝掉 emoji／冒號後沒有字 `[empty-heading]` | `### 🔧 為什麼需要這一步？`；emoji 序列（👨‍💻、🇹🇼）整串算一個圖示 |
| 3 | 同一章節兩個同名 `##`、或兩個同名 `#` `[duplicate-heading]` | 改成不同標題（否則目錄重複、錨點變 `-2`），或用 `## [工具名] 標題` 做成分頁 |
| 4 | 容器沒關、多出結尾或標籤拼錯 `[unclosed-container]`／`[orphan-close]`／`[unknown-tag]` | 每個 `[flow]`、```` ``` ````、`[html]`… 都要成對；fence 只認 `prompt`／`terminal`／`code` |
| 5 | 全版區塊（`[lab-session]`／`[qa-session]`／`[survey]`／`[interactive]`）放在第一個 `#` 之前 `[fullpage-before-section]` | 移到第一個 `#` 章節底下，否則不會自成一頁、列印與簡報也不出現 |
| 6 | 圖檔不存在或大小寫不符、`[download dir=]` 沒有 `example/<dir>`、`[html src=]` 檔案不存在 `[image-missing]`／`[download-target-missing]`／`[html-src-missing]` | 先放好檔案再引用；圖片路徑寫 `assets/x.png`，不寫 `./assets/`、`images/` `[asset-path-style]` |
| 7 | 缺必要屬性、非法值、空元件 `[missing-attr]`／`[invalid-value]`／`[empty-block]` | `[youtube]` 要 `id`、`[pr]` 要 `from`／`to`、`[survey]` 要 `url`；`[tags]` 只有 green／orange／purple／blue、`[[color:]]` 五色、`[time]` 每堂要 `date`／`time`；屬性一律雙引號 |
| 8 | `- [green] 文字` 寫在 `[tags]` 外、`[summary]` 行缺 `\|`、`- Q:` 沒接 `A:` `[tag-color-outside-tags]`／`[summary-no-separator]`／`[qa-missing-answer]` | 包進 `[tags]…[/tags]`；`- 🏗️ **標題** \| 描述`；`- Q:` 下一行兩格縮排 `A:` |
| 9 | `**` 沒成對（`> **標題` 沒關會讓洞察框變一般引言）`[unclosed-bold]`、文字裡的裸 `<` `[bare-lt]`、貼進看不見的控制字元 `[control-char]` | 補上結尾 `**`（要顯示 `**` 本身就包進反引號）；`<` 寫 `&lt;`；刪掉控制字元 |
| 10 | 同一層清單混用 `1.` 與 `-` `[list-marker-mixed]`、`##` 分頁裡再放 `### [標記]` `[nested-tabs]` | 整層用同一種標記；分頁只做一層 |

等級：error 只有 `image-missing`／`download-target-missing`／`html-src-missing`，加 `--check` 時讓 build 失敗（exit 2、不寫 index.html）；warn 照樣產出、交付前要清掉；info 是建議。config.yaml 引號沒關不論有沒有 `--check` 都是硬錯誤（exit 1）。

## Step 2：確認或建立 Config

兩層 deep merge：物件逐鍵覆蓋、陣列（`socials`、`nav`）整個取代。

| 檔案 | 內容 | 何時建 |
|---|---|---|
| `<工作資料夾>/config/global.yaml` | `instructor`（name／tagline／bio／avatar／stats／socials）、`footer`、`seo.site_name` | 第一次使用建一次，之後每份講義共用 |
| `<講義資料夾>/config.yaml` | `page`（title／badge／hero_title／subtitle）、`seo`、`quotes`、選用的 `nav` | 每份講義一份，只寫要覆蓋的欄位 |

- **沒有 `config/global.yaml` 時**：把 [example/config/global.yaml](example/config/global.yaml) 複製到 `<工作資料夾>/config/global.yaml`，問使用者「講義上要顯示的名字與一句話介紹」填進去；使用者不想填就保留示範文字，並在交付時提醒要改。沒有這個檔，頁面的講者介紹會是空的。
- 全部可用的鍵與註解：[reference/config-example.yaml](reference/config-example.yaml)（打錯鍵名 build 會 warn 並提示最接近的鍵）。
- `content.md` **沒有 frontmatter**：標題、SEO、開場／結尾金句、講者資訊都寫在 config，不寫進講稿。
- `nav`（Hero 導覽按鈕）預設從 `#` 章節自動產生，要自訂文字才寫。
- `quotes.opening`／`quotes.closing`：沒有就依內容的核心精神各寫一段。
- 頁面要放上網才需要：`seo.url`（有值時 build 會把網址做成分享 QR）、`seo.image`（必須是絕對 URL）。只在自己電腦或檔案分享時留空即可。
- `socials[].platform` 支援 Medium／Facebook／Threads／YouTube／GitHub／LinkedIn／Email。

## Step 3：Build

```bash
node "<SKILL_DIR>/scripts/build.mjs" <講義資料夾> --check
```

build CLI：`build.mjs <dir> [<dir>...] [--all <root>] [--check] [--images=embed|link|auto] [--json] [--quiet]`

| 旗標 | 作用 |
|---|---|
| `--check` | lint 與 config 的 error 讓 build 失敗（exit 2）；交付前一律加 |
| `--images=auto`（預設） | 單張 ≤ 150 KB 內嵌 base64，其餘用相對路徑，**要連同 `assets/` 一起分享** |
| `--images=embed`／`link` | 全部內嵌（只傳一個 index.html 給別人時用）／全部相對路徑 |
| `--all <root>` | 掃描 `<root>` 下所有含 content.md 的子目錄一起 build |

- exit code：0 成功、1 硬錯誤（content.md 不存在、YAML 引號沒關）、2 `--check` 未過。
- 結尾摘要印元件統計、圖片張數、HTML 大小與 lint 數；回報使用者時直接引用這段摘要。
- 依行號修到沒有 error、warn 清空再交付；語法疑問查 syntax-table.md。
- **執行後沒有任何輸出**：通常是路徑寫錯，先確認 `<SKILL_DIR>/scripts/build.mjs` 存在，不要當成成功。

## Step 4：選用功能（需要時才做）

| 功能 | 指令 | 需要 |
|---|---|---|
| 本地預覽：存檔自動重 build、頁面自動更新 | `node "<SKILL_DIR>/scripts/dev.mjs" <講義資料夾> --open`（預設埠 3000，`--port 8080` 可改） | 只要 Node.js |
| OG 縮圖（貼連結到社群時的預覽圖，1200×630） | `node "<SKILL_DIR>/scripts/generate-og.mjs" <講義資料夾>` → `assets/og-image.jpg` | puppeteer |
| PDF 講義（1280×720 一頁一張） | `node "<SKILL_DIR>/scripts/export-pdf.mjs" <講義資料夾>` → `assets/講義.pdf` | puppeteer |
| 截圖轉 WebP（圖片很多、檔案太大時） | `node "<SKILL_DIR>/scripts/optimize-images.mjs" <講義資料夾>` | cwebp |

- OG 縮圖與 PDF 只有使用者要把頁面放上網分享、或明確要求時才做。puppeteer 會另外下載一份瀏覽器（檔案不小），安裝前先說明並取得同意：在 `SKILL_DIR` 執行 `npm install puppeteer`；也可以用電腦上已有的 Chrome（設定環境變數 `PUPPETEER_EXECUTABLE_PATH`）。
- 沒有 puppeteer 也能匯出 PDF：用瀏覽器打開 `index.html`，點左上的 ⚙️ 設定 →「匯出 PDF」。

## 產出的頁面怎麼用

- **線上講義**：瀏覽器打開 `index.html`；左側是自動目錄，目錄上方可以調整字級、切換深淺色，⚙️ 裡還有主題色彩、匯出 PDF 與分享 QR。
- **線上簡報**：按 `P`（或右下角「簡報模式」）進入簡報模式，方向鍵換頁；網址加 `?present=1` 開頁就直接進簡報。
- **列印／PDF**：網址加 `?print=1` 會直接排成一頁一張的版面。
- **分享**：把 `index.html` 連同 `assets/` 一起傳給別人或放到雲端硬碟；只想傳一個檔就用 `--images=embed` 重 build。

## 轉換指引

> **核心原則：講義是傳遞資訊的載體，「萃取重點」而非「逐字轉錄」。** 略過口語過場（大家好、接下來我們看）、贅字與自言自語，直接提煉成條列、圖表或卡片。

1. **萃取章節結構**：移除口語過場，找出主題轉換點，對應 `#` 主章節與 `##` 子章節。
2. **資訊卡片化（最重要）**：長段解說提煉成 `### Emoji Title` 卡片與條列；所有內容都要落在結構化元件內，不留裸段落。
   - ❌ 直接把講稿貼成段落：`一開始我把課程大綱交給 AI，第一版完成度很高。`
   - ✅ 提煉成卡片＋洞察：
     ```markdown
     ### 💡 第一版很快，但改不動
     - 把課程大綱直接交給 AI，第一版完成度很高
     - 但 AI 會自行增減文字，想修改得回去改 HTML

     > **不能只停留在 AI 幫我生成第一版**
     > 講義要維護的是內容，不是 HTML。
     ```
3. **標記指令與操作**：程式碼、指令、Prompt 範例用 ```` ```prompt [label="口語化意圖"] ```` 包裹（安裝類用 ```` ```terminal ````）。
4. **整理流程步驟**：講到操作或邏輯步驟時整理成 `[flow]…[/flow]`。
5. **提煉深度觀點**：核心洞察、反思、重要結論轉成 `> **Title**` 洞察框。
6. **產生總結**：最後一段用 `[summary]…[/summary]` 歸納精華。
7. **搜尋並插入圖片**：內容適合配圖時，先找 `<講義資料夾>/assets/` 裡的圖，依檔名挑最合適的插入 `![完整圖說](assets/檔名)`；找不到就在該處留 `<!-- 待補圖片：{圖片描述} -->`，並在回覆中彙整所有缺圖位置。不要引用不存在的圖檔。
8. **驗證格式**：跑 `build.mjs <講義資料夾> --check`，依行號修到沒有 error、warn 清空。

## 寫作風格（預設值，使用者有自己的習慣就照使用者的）

### 標題

- `#` 主章節用**冒號式命題**「LABEL：一句賣點」（例：`# 常見痛點：穩定性不足、難以維護、無法驗證`）；章節之間放 `---`。
- `##` 用完整句或動賓短語，不帶 emoji。
- `###` 卡片**一律以語意化 emoji 開頭**（😓 痛點、🎯 目標、⚠️ 警告、✅ 正確、🆚 對比、🛠️ 實作、🛡️ 安全）；emoji 對應內容語意，不要隨機裝飾。

### 骨架

- **痛點開場**：第一個 `#` 先立痛點、引發共鳴，再進入解法。
- **操作小節的節奏**：情境說明 → 可複製的 ```` ```prompt ```` → `[lab-session]` 練習。
- **`[lab-session]` 的 title 依受眾命名**：工程師「🛠️ 實作時間」、一般使用者「實戰演練」、學生「實作練習」。
- **收尾**：`[summary]`（格式 `- emoji **標題** | 一句話說明`）→ 選用的 `[bonus]` → `[qa-session title="Q&A 時間"]`。

### 語氣與文字

- 對讀者說話用「你」，講自身經驗用「我」，建立共識用「我們」。
- 口語、可以有幽默感；每個大段末尾收在一句可以截圖傳播的金句洞察框。
- 技術名詞保留英文，首次出現可「中文（English）」對照。
- 全形中文標點；中英文之間加半形空格；箭頭統一 `→`；舉例用「（ex: …）」。
- **行內反引號當螢光筆**：`` `中文關鍵詞` `` 用於句中強調，不限程式碼。
- 圖片 alt 寫成完整圖說句子；code fence 語言標識一律小寫。

### 教學手法

- **洞察框自問自答**：`> **為什麼…？**` 問句標題開頭，後續行給答案。
- **比喻先行**：新名詞先給生活比喻再講定義。
- **before／after 對比**：「人工 vs AI」「過去 vs 現在」用表格或 `[tags]` 呈現；表格第一欄是列標籤，build 會自動粗體，不要手寫 `**`。
- **安全叮嚀**：涉及權限、金流、個資時用 `[warning]`，提醒「按下同意，責任就是你的」。

## 交付

回覆使用者：

- `index.html` 的位置；用瀏覽器打開就能看，按 `P` 進簡報模式
- build 摘要（章節數、元件、lint 結果）
- 需要使用者確認的地方：標了 `待確認` 的內容、缺圖位置、`global.yaml` 裡還沒改的示範文字
- 想修改就直接說「第 2 章改成…」：改的是 `content.md`，改完重 build，請使用者重新整理頁面

## 禁止事項

- 不發明語法總表沒有的標記；不直接手改 `index.html`（下次 build 會被蓋掉）
- 不留裸段落，不逐字轉錄講稿
- 不編造素材裡沒有的數字、日期、引用與人名；沒把握的內容標 `待確認`
- 不放真實個資（學生姓名、聯絡方式、成績）；需要舉例就用虛構資料並註明
- 不修改 `SKILL_DIR` 裡的模板與程式；要調整版型請先跟使用者確認

## Reference Files

- 語法總表：[reference/syntax-table.md](reference/syntax-table.md)
- 元件 HTML 對照與細部規則：[reference/components.md](reference/components.md)
- Config 全鍵範例：[reference/config-example.yaml](reference/config-example.yaml)
- 可直接 build 的範例：[example/config/global.yaml](example/config/global.yaml)、[example/demo/](example/demo/content.md)
- 頁面模板（build 時內嵌成單一 HTML）：`reference/base.html`、`reference/theme.css`、`reference/app.js`
