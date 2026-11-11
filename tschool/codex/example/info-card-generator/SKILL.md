---
name: info-card-generator
description: 把內部知識素材（規範、SOP、會議決議、教育訓練重點、公告，或只有一個主題）提煉成一組可直接貼進簡報、公告或群組的知識卡：封面 → 每卡一概念 → 結尾回顧。以約定 Markdown DSL 撰寫，經 lint（criteria 全過）後由 build script 產出 1080×1350 PNG 系列圖（支援深／淺色主題）。當使用者說「做知識卡」「知識圖卡」「資訊圖卡」「重點卡」「把這份規範做成圖卡」「教育訓練圖卡」「輪播圖」「carousel」時使用。
---

# Info Card Generator

素材 → 提煉（封面＋排卡）→ `content.md`（DSL）→ `node scripts/lint.mjs <dir>` 全過 → `node scripts/build.mjs <dir>` → `assets/cards/<theme>/NN.png`

## 專案結構

```
info-card-generator/
├── SKILL.md
├── scripts/
│   ├── dsl.mjs        # DSL 解析＋渲染（build / lint 共用）
│   ├── config.mjs     # 兩層 config 載入（global → deck → frontmatter）
│   ├── lint.mjs       # criteria 檢查（可獨立執行）
│   └── build.mjs      # index.html + Puppeteer 逐卡出 PNG
├── reference/
│   ├── base.html          # 渲染模板（design token + 元件 CSS）
│   ├── hooks.md           # 封面公式庫、排卡模板、每卡規則、結尾卡公式
│   ├── content-example.md # 完整 DSL 範例（AI 使用守則）
│   └── config-example.yaml
└── example/               # 可直接 build 的煙霧測試 deck
    ├── config/global.yaml
    └── ai-usage-rules/{config.yaml, content.md}

<root>/
├── config/global.yaml     # 組織層（label、theme、accent/hot、background、criteria）
└── <deck-dir>/
    ├── config.yaml        # 本副牌覆蓋（選用）
    ├── content.md         # DSL 內容
    ├── index.html         # build 產出（瀏覽器預覽，右下角切深淺色）
    └── assets/cards/{dark,light}/NN.png
```

## Workflow

### Step 0：判斷輸入類型

| 情境 | 判斷依據 | 行動 |
|------|----------|------|
| 只有主題 | 一句話主題，無素材 | 先反問 1–2 題（給哪個部門看？要放在簡報、公告還是群組？），再進 Step 1 |
| 有素材 | 規範／SOP／議事錄／講稿／筆記 | 直接進 Step 1；若素材是單一檔案，deck 預設建立在素材同層的 `info-card/` |
| 有現有目錄 | 指定既有 deck 資料夾 | 讀取後依需求修 content.md，跳 Step 3 |

### Step 1：提煉（產 content.md 之前，先想清楚）

讀 [hooks.md](reference/hooks.md)，產出**提煉摘要**給使用者確認（素材非常明確時可直接進 Step 2，但摘要仍要在回覆中列出）：

1. **核心主張**：一句話。這副牌只為這句話服務。
2. **受眾**：哪些同仁看到會停下來（新人、送簽的人、主管）。
3. **封面主標**：先從素材找同仁真的會踩的點（退件理由、常見誤解），不先寫文件標題；說明為什麼這句會讓目標受眾停下來。
4. **封面公式**：六選一＋一句理由。用到數字時，指出數字在素材的哪裡。
5. **排卡結構**：規範型／教學型／清單型／對比型 四選一，列出每張卡的一句話大綱（5–10 張）。
6. **依據**：結尾卡要寫的文件名、版本、條號。

### Step 2：寫成 DSL content.md

依下方語法約定撰寫。核心轉換原則：**萃取重點，不逐字轉錄**；內容盡量落在結構元件內，避免整卡裸段落；規範、決議的關鍵句用引言保留原文。

#### DSL 語法約定

| 語法 | 用途 | 範例 |
|------|------|------|
| `===` | 分卡（獨立一行） | — |
| `@cover` `@point` `@code` `@summary` | 卡片類型（卡片第一行） | 第 1 張必為 cover、最後必為 summary |
| `[badge] 文字` | 頂部膠囊標籤 | `[badge] 📋 採購與簽核規範 · v2.3` |
| `[big] 文字` | 一句話 punchline，整卡視覺主角 | `[big] 金額看==全期累計==` |
| `[stamp] 文字` | 系列章印（部門／系列名） | `[stamp] 採購部 · 規範速讀` |
| `# 大標` | H1，可連續多行堆疊 | 封面主標用 |
| `## 段標` | H2（自帶強調底線），**一卡限一個** | `## 金額決定誰來核` |
| 一般段落 | body 文字，連續行合併換行 | — |
| `1. **標題**：說明` | 編號卡盒 | — |
| `- **標題**：說明` | 條列卡盒 | — |
| `[ok] 文字` / `[no] 文字` | ✅／❌ 對照盒 | 對比型必備 |
| `[warn] 文字` | ⚠️ 警示條 | 例外、紅線 |
| `[tip] 文字` | 💡 重點框 | 每卡的記憶點 |
| `[flow] A -> *B -> C` | 自適應流程卡，只給有先後順序的事；依估算視覺寬度決定：放得進一行就橫排（格間有 › 箭頭），放不下自動轉兩欄 stepper（Z 字閱讀，順序由編號承載，不畫連接線）。`*` 開頭＝強調節點，**只標這張卡在講的那一步**（門檻、決策點、最常漏的一步），沒有就不加；不要習慣性標最後一個 | `[flow] 送件 -> *三家比價 -> 核決`（本卡在講比價）<br>`[flow] 頭像 -> Settings -> Privacy`（導覽路徑，不加 `*`） |
| `> 引言` | 引言框（可多行） | 規範原文、決議原句 |
| ` ```lang 檔名 ` | 程式碼視窗（窗控＋檔名列＋語法上色） | ` ```yaml SKILL.md ` |
| `***` | 裝飾分隔線 | — |
| `**重點**` | 強調色粗體（accent） | — |
| `==標記==` | 螢光標記膠囊 | 封面關鍵詞 |
| `!!衝擊!!` | 衝擊色（關鍵數字、警告字） | `!!300 萬!!` |
| `` `code` `` | 行內程式碼 | — |

frontmatter（選填，覆蓋 config）：`title` / `label` / `ratio` / `theme` / `background`。

### Step 3：Lint（criteria 全過才准出圖）

```bash
node scripts/lint.mjs <deck-dir>
```

逐項輸出 pass/fail。**error 修到零、warning 逐條人工確認**後才進 Step 4。criteria 定義在 config 的 `criteria:` 區塊（= Define 這副牌「點先算對」的尺），主要項目：卡數 5–10、封面必含強調記號、一卡一概念、字數上限、結尾卡必含重點回顧（可再要求「依據：」出處）、禁用語（AI 腔）、未考證數字警告。

### Step 4：Build 出圖

```bash
node scripts/build.mjs <deck-dir>              # 依 config 的 brand.theme
node scripts/build.mjs <deck-dir> --theme both # 深淺各出一套
```

Build 會自動：跑 lint → 注入 token → 產 `index.html` → Puppeteer **溢版檢查**（任何一張內容超出畫布即中止並指出卡號）→ 逐卡截 1080×1350 PNG（× `export.scale`）。溢版就回 Step 2 精簡文字或拆卡，不要用 `--force` 交差。

Build 同時會固定產出 `assets/preview-<theme>.png`（整副牌 5 欄總覽圖），並在最後印出「交付清單」。

### Step 5：交付（固定，每次一樣）

使用者在對話裡只需要「看得到整副牌」，要用檔案時再下載整包。所以交付固定兩項，用 present_files 一次呈現：

1. `assets/preview-dark.png`、`assets/preview-light.png`（有出的主題才附）——一張圖看完整副牌
2. deck 目錄打包成一個 zip（含 `content.md`、`config/`、`assets/cards/`、`index.html`）——要用檔案就下載這包

回覆內容：提煉摘要（Step 1 的六項）＋「為了塞進畫布做的取捨」，並提醒要改內容就改 `content.md` 重跑，不要直接修圖。
**不要**逐張 present 單卡 PNG，也不要另外 present `content.md`（都在 zip 裡）；使用者點名要看哪張再單獨給。

## 內容鐵律

1. **禁止捏造**：金額、條號、日期、統計數字必須出自素材或可考證；查無來源 → 換非數字封面或留 `<!-- TODO: 待補來源 -->`。lint 會對 `%`、`N 倍` 類數字發出警告，逐條確認。
2. **一卡一概念**：一張 @point 只有一個 `##`。想講兩件事就拆卡。
3. **禁 AI 腔**：criteria 的 `forbidden` 清單（可擴充），lint 強制。
4. **結尾卡完整**：重點回顧（條列／tip／引言）＋ 依據。規範、制度類素材把 `require_source` 開起來，讓同仁能回到原文核對。
5. **封面先講處境**：封面不是文件標題頁。主標優先用同仁會說出口的卡關句（「提案單被退回補件，多半是這幾條沒看到」），再用副標補承諾；避免用條號、抽象名詞當第一眼主角。
6. **流程卡只給流程，`*` 只給重點**：`[flow]` 用在真的有先後順序的事（操作步驟、簽核鏈、before → after）。`*` 是「這張卡的文字在講哪一步」的指標：warn 在講反例驗收，就標 `*反例驗收`；門檻卡在講 300 萬要送董事會，就標 `*董事會`。純導覽路徑（頭像 → Settings → Privacy）或沒有特定重點的流程不加 `*`，整副牌不是每個 flow 都要亮一格。lint 會對「`*` 落在最後一步」與「每個 flow 都有 `*`」發警告，逐條確認。

## 視覺原則（固定一套）

- 視覺識別**固定一套**：不新增任意 style pack、不在 content.md 內寫任何色碼或樣式。內容只寫語意（`**` `==` `!!` `[ok]`…），長相由 token 決定。
- 可調視覺變數只放 config：`brand.label`、`brand.accent`、`brand.hot`、`brand.background`、`brand.layout`。`accent` / `hot` 各含 dark/light 兩值；**深淺不是反轉是重新映射**——淺色模式的 accent 必須是深色（例：`#FFC24D` → `#7E570F`），確保米色底上對比 ≥ 4.5:1；`--on-acc` 由 build 依亮度自動計算。要換成公司 CI 色時，兩個模式分別給值。
- `brand.label` 顯示在每張卡底部（部門或系列名，例：「採購部 · 規範速讀」）；留空就只剩進度點。
- `brand.background` 控制整副牌背景風格，允許值：`minimal`（乾淨微光）、`grid`（科技格線）、`gradient`（大面積漸層）、`halo`（光圈＋層次，預設）。不要在單張卡片內改背景，避免視覺不一致。
- 模板會依每張卡內容密度自動套用 `hero` / `airy` / `balanced` / `dense` 尺度，空間足夠時整組字級、元件、間距一起放大；內容較多時只小幅收斂。不要只為了放大單一標題而硬塞樣式，比例要整體一致。
- `brand.layout.mode` 控制視覺語氣：`tutorial` 穩定教學（內部知識卡預設）、`punchy` 強化停留、`editorial` 偏雜誌。`brand.layout.cover_visual: pain-flow` 會在封面加入痛點循環，預設是「翻規範 → 問前輩 → 被退件」；可用 `brand.layout.cover_steps` 依素材改成更準確的核心行為。`brand.layout.rhythm: varied` 會讓不同主元件卡片有更明顯的節奏差。
- 深色＝黑體科技感、淺色＝明體雜誌感（字體人格由 token 切換），這是設計的一部分，不要改。投影用深色、列印或貼公告用淺色。

## Config 兩層

| 檔案 | 用途 | 必要性 |
|------|------|--------|
| `config/global.yaml` | 組織層：label、theme、accent/hot、background、export、criteria | 首次建立一次（build 從 deck 目錄向上搜尋 ≤ 4 層） |
| `<deck-dir>/config.yaml` | 本副牌覆蓋（deep merge；arrays 整個取代） | 選用 |

完整範例：[config-example.yaml](reference/config-example.yaml)

## 依賴與 Troubleshooting

- 依賴：repo 內 `npm i -D yaml puppeteer`；claude.ai 沙盒則在工作目錄 `npm i yaml puppeteer-core`。
- **claude.ai 沙盒**：上傳後 skill 掛在唯讀路徑（`/mnt/skills/user/info-card-generator/`），scripts 可直接從該路徑執行——依賴解析內建「工作目錄 fallback」，裝在 cwd 的 `node_modules` 也找得到。deck 目錄請建在可寫位置（如 `/home/claude/<deck>`），build 只往 deck 目錄寫檔，不會動到 skill 本體。
- **找不到 Chrome**：build 依序自動掃描 `PUPPETEER_EXECUTABLE_PATH` → macOS Chrome → `/usr/bin/chromium*` → `PUPPETEER_CACHE_DIR` → `~/.cache/puppeteer` → 所有 `/home/*/.cache/puppeteer`（root 執行沙盒時的常見位置，已內建，不再需要手動 export cache dir）。都沒有時才需手動指定 `PUPPETEER_EXECUTABLE_PATH`。
- **root 執行**：`--no-sandbox` 等旗標已內建於 launch args。
- **沙盒中文字型**：模板字體堆疊已含 `Noto Sans/Serif CJK TC`；若截圖出現豆腐字，安裝 `fonts-noto-cjk`。
- **煙霧測試**：`node scripts/build.mjs example/ai-usage-rules --theme both`（於 skill 目錄執行）應產出 7 張 × 2 主題。

## Reference Files

- 封面公式與排卡模板：[hooks.md](reference/hooks.md)
- DSL 完整範例：[content-example.md](reference/content-example.md)
- Config 範例：[config-example.yaml](reference/config-example.yaml)
- 渲染模板：[base.html](reference/base.html)

## 更新紀錄

- 2026-09-21：固定交付（總覽圖＋zip）；`[flow]` 兩欄 stepper 移除誤導的連接線、橫排改用 › 箭頭、橫排／兩欄改依視覺寬度判斷；引言框取消合成斜體；淺色 `==標記==` 改實色塊＋深字；頁尾 t3 對比提升至 AA、進度點放大。舊 deck 重 build 會有這些差異。
