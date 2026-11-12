<!-- 語法總表：每種語法的寫法、用途與範例。 -->

# content.md 語法總表

共 35 種語法：結構型 12 種、區塊元件 23 種（blocks.mjs registry）。

- 完整範例：[example/demo/content.md](../example/demo/content.md)
- 每種語法產出的 HTML 結構與細部規則：[components.md](components.md)

## 總表

| 語法 | 用途 | 範例 |
|---|---|---|
| `# LABEL：TITLE` | 主章節：自動編號 1／2／3，冒號前為章節 label、後為標題（冒號式命題）；沒有冒號時整行當標題（lint `section-no-colon`）；標題剝掉 emoji／冒號後沒有字報 `empty-heading`、同名章節報 `duplicate-heading`。錨點 id：標題完全等於固定關鍵字（新專案、總結、Commit Skill…）或以「關鍵字：」開頭時用固定 id（對照表見 components.md §1），其餘取英數字轉 kebab-case。第一個 `#` 之前的內容落在頁首區，全版區塊放那裡不會自成一頁（lint `fullpage-before-section`） | `# 新專案：用 SDD 讓 AI 根據規格建立專案` |
| `# Emoji TITLE` | 非編號主章節：標題以 emoji＋空格＋文字開頭時，emoji 取代序號且不佔編號（課後問題、補充資料）；變體選擇子、ZWJ（👨‍💻）、膚色、旗幟（🇹🇼）等 emoji 序列整串算一個圖示；只有 emoji 沒有文字時不算非編號章節（lint `empty-heading`）；冒號拆分與 branch 照常運作 | `# 📝 課後問題：設計你自己的 AI Agent Repo` |
| `> lead（緊接 # 的下一行）` | 章節引言：緊接 `#` 的 `>` 行（不以 `**` 開頭）成為章節 lead，可連續多行 | [見範例](#section-lead) |
| `## Title` | 子章節：收進 TOC（id 加 `sub-` 前綴，固定錨點規則同 `#`）；用完整句或動賓短語、不帶 emoji；同一章節內不要重名（lint `duplicate-heading`，同一個分頁群組內同名不算） | `## OpenSpec 初始化` |
| `### Emoji Title` | 卡片：一律以語意化 emoji 開頭（lint `card-no-emoji`；emoji 序列整串當 icon，icon 後可不空格）；下接 `- ` 條列（支援 1 層巢狀）與段落，其後緊接的區塊元件併入同一張卡；不在卡片或元件裡的段落報 `loose-paragraph` | [見範例](#card) |
| `#### Title` | 小標：章節內的四級標題，不進 TOC | `#### STEP 1：建立專案` |
| `---` | 章節分隔慣例：放在 `#` 章節之間（頁面上的分隔線由 build 自動產生） | [見範例](#divider) |
| `- item／1. item（縮排一層巢狀）` | 一般條列／編號清單：子層任意縮排（建議 3 空格），最多 1 層巢狀，更深的併入上一層（lint `nested-too-deep`）；縮排續行併入當前項；同一層混用 `1.` 與 `-` 會併成同一個清單、類型依第一項決定（lint `list-marker-mixed`），空行不會把清單斷開 | [見範例](#loose-list) |
| `` **粗體**／`code`／[文字](url)／<br> `` | 行內格式：粗體、行內程式碼（也當中文螢光筆）、連結、網址自動連結、`<br>` 換行；反引號內的 `**`、`[[…]]`、圖片、連結與網址都不轉換、照字面顯示；`**` 要成對（lint `unclosed-bold`），反引號外的 `<` 要寫 `&lt;`（lint `bare-lt`）；反引號內的 `<`、`&` 會自動跳脫、照字面顯示 | `` 用 `中文關鍵詞` 標重點，**粗體**收束，詳見 [官方文件](https://example.com) `` |
| `[[標籤]]／[[color:標籤]]` | 行內小徽章：無色為中性灰，color 可為 red／green／orange／purple／blue；表格儲存格、列點、段落都能用 | `Deep Research [[orange:付費]]、Search [[green:免費]]、舊版 [[red:已棄用]]` |
| `標題 \| branch:NAME／\| branch:none` | 分支標記：加在 `#`／`##`／`###` 標題尾端，左側畫 git 分支線並沿用到後續標題；`branch:none` 回主線；`\| branch:` 後面空白時標記會被剝掉、視同沒寫（lint `branch-empty`）；配色依分支名前綴（main 綠、develop 藍、feature 紫、release 青、hotfix 橘） | [見範例](#branch) |
| `## [工具名] 標題／### [Label\|color] 標題` | 工具分頁：連續帶前綴的同層標題組成分頁群組，連續同名合併為同一分頁、未標記的同層標題結束群組；ChatGPT／Gemini／Claude 有品牌色，`\|color` 可指定 red／orange／green／blue／purple；label 內不可再有 `\|`（lint `tab-label-pipe`）；`[]`／`[\|red]` 沒有名稱不成立分頁；分頁不可巢狀，`##` 分頁裡的 `### [標記]` 只會變成一般卡片（lint `nested-tabs`） | [見範例](#tabs) |
| `[youtube id="…" title="…"]／[youtube id="…"]說明[/youtube]` | YouTube 影片 16:9 嵌入；單行或區塊形式（中間文字當說明）；`id` 是網址 `v=` 後的值；列印模式改顯示連結 | [見範例](#youtube) |
| `[image-text position="left\|right" width="N"]…[/image-text]` | 圖文並排：內含一張 `![](…)` 與段落／`- ` 條列；`width` 為圖片佔比 %（預設 40）；單張直式圖用 `position="right"`、`width` 25〜32；≤ 900px 改上下排列 | [見範例](#image-text) |
| `[gallery]…[/gallery]` | 多圖相簿：每行一張 `![圖說](路徑)`，等高排列、寬度依比例，超出容器橫向捲動；適合連續多張直式圖或比例不一的一組圖 | [見範例](#gallery) |
| `![alt](src)／![alt](src){max-width=200px}` | 獨立一行的圖片：置中顯示、alt 成為圖說（寫成完整句子）；`{max-width=…}` 限寬；路徑寫 `assets/`（不加 `./`）；寫在段落或列點中則為行內圖 | `![架構示意圖：三層服務之間的資料流](assets/architecture.png)` |
| `\| 欄 \| 欄 \|＋\|---\|---\|；欄名尾附 [width:120]` | 標準 Markdown 表格；分隔列 `:---:`／`---:` 控制對齊；標題儲存格尾附 `[width:值]` 指定欄寬（裸數字＝px，也接受 %／rem／em／ch，未標的欄 auto）；儲存格可用 `[[標籤]]`；儲存格內用 `<br>` 換行；**第一欄自動粗體**（不用手寫 `**`），用 `<br>` 分兩行時只有第一行粗體 | [見範例](#table) |
| ```` ```prompt [label="…"]／```terminal／```code … ``` ```` | 可複製的 Prompt／終端機／程式碼區塊：`prompt` 內容以 shell 指令開頭時 header 顯示 Terminal、`code` 固定顯示 Code；主體可再放巢狀 fence；超過 10 行自動折疊；語言標識一律小寫 | [見範例](#prompt) |
| `[html]…[/html]／[html src="檔案.html"]` | 自訂 HTML，以 `iframe srcdoc` 渲染（CSS 與外層隔離、高度自動延展）；`[html src="…"]` 單行形式在 build 前讀入課程目錄下的 HTML 檔（路徑相對課程目錄，檔案不存在報 `html-src-missing`）；內容裡的本地 `<img src>` 與頁面圖片走同一套處理：依 `--images` 內嵌 base64 或維持相對路徑，有較新的同名 .webp 就改用 | [見範例](#raw-html) |
| `[flow]…[/flow]` | 流程步驟：每行 `1. ` 或 `- ` 一步，` — `（或 ` – `／` - `，前後要有空白）前為步驟標題、後為說明 | [見範例](#flow) |
| `[tags]…[/tags]` | 彩色標籤列：每行 `- [green\|orange\|purple\|blue] 文字`；帶色的 `- [color]` 行必須包在 `[tags]` 內，獨立使用不套色 | [見範例](#tags) |
| `[case title="…"]…[/case]` | 情境／痛點／方案三段式案例卡：每段冒號後寫文字或下接 `- ` 條列（可並存），`處理方案：` 視同 `方案：`；多個案例寫多個 `[case]` | [見範例](#case) |
| `[summary]…[/summary]` | 總結卡片格：每行 `- emoji **標題** \| 描述`，缺 `\|` 的行不會出現；課程最後一段用它收束 | [見範例](#summary) |
| `[time]…[/time]` | 課程時間軸：每堂以 `- label:`（或任一 `- 欄位:`）起頭、其餘欄位縮排兩格；`date`、`time` 必填（缺了報 `invalid-value`），`des`／`link`／`marker` 選填；`time` 寫上課起訖時刻（如 `19:00~21:00`），不寫「約 100 分鐘」這類時長或節奏說明（節奏分配放講師備註 `<!-- -->`）；`active: true`（或 `status: past\|current\|upcoming`）標記目前堂；也可一行寫一堂的精簡寫法 `5/30（六）\| 13:30~16:30 \| 主題`，前面加不加 `- ` 都可以 | [見範例](#class-timeline) |
| `[qa-session title="…"]…[/qa-session]` | 全版 QA 頁：內容空白＝等待提問畫面；`- Q:` 下一行兩格縮排 `A:` 組成 accordion；`title` 預設「Q&A 時間」 | [見範例](#qa-session) |
| `[lab-session title="…" duration="…" hint="…"]…[/lab-session]` | 全版實作時間頁：`- ` 行為編號任務（可空白）；`title` 預設「🛠️ 實作時間」、`duration` 顯示時間膠囊、`hint` 有預設提示語 | [見範例](#lab-session) |
| `[interactive title="…"]…[/interactive]` | 全版互動環節頁（說明會／直播停下來和聽眾說話）：內文為講師話術、保留換行，連續 `- ` 行渲染為條列；`title` 預設「💬 互動環節」 | [見範例](#interactive) |
| `[warning title="…"]…[/warning]` | 警告框：`title` 自動加 ⚠️；內容可混用段落與 `- ` 條列，單換行同段換行、空行分段；權限／金流／個資等敏感場景用 | [見範例](#warning) |
| `[bonus title="…"]…[/bonus]` | Bonus 按鈕＋彈窗：內容支援段落（空行分段）、`- ` 清單、粗體、行內程式碼；`title` 預設「Bonus」；點遮罩、✕ 或 Esc 關閉 | [見範例](#bonus) |
| `[feedback title="…" btn="…" desc="…"]…[/feedback]` | 回饋儀表板（按鈕＋彈窗）：面板以 `stats:`／`bars:`／`compare:`／`quotes:`／`changes:` 開頭，下接 `- ` 項目、欄位以 `\|` 分隔；`changes` 的目標標題可跳到該段；問卷資料先去識別化 | [見範例](#feedback) |
| `[survey title="…" url="…" hint="…" btn="…"]…[/survey]` | 全版滿意度問卷頁：`url` 有值才顯示按鈕；結尾標籤必寫；實體企業課放在 qa-session 前 | [見範例](#survey) |
| `[download dir="…" label="…" desc="…"]／[download file="assets/…"]` | 下載卡（單行）：`dir` 對應 `example/<dir>/`，build 自動打包成 `assets/<dir>.zip`；`file` 直接連既有檔，副檔名標籤自動顯示；zip 要與 index.html 一起部署 | [見範例](#download) |
| `[pr from="…" to="…" title="…" desc="…" url="…" status="…"]` | Git PR／MR 卡片（單行）：`from`／`to` 為分支（必填）；`status` 為 merged／open／draft／closed；`number` 省略時從 `url` 解析 | `[pr from="feature/login" to="main" title="新增登入流程" desc="補上表單驗證" url="https://github.com/owner/repo/pull/42" status="merged"]` |
| `> **標題**＋後續 > 行` | 洞察框（講者旁白的主要載體，常用問句標題自問自答）：後續 `>` 行為內文、`>` 空行分段，支援 `- ` 條列與 fenced code；不以粗體開頭則為純引言；標題的 `**` 要成對，`> **標題` 沒有結尾 `**` 時整段當一般引言、星號原樣顯示（lint `unclosed-bold`） | [見範例](#insight) |
| `- [x] 項目` | 勾選清單（行首不縮排）：只用於已驗證／已完成的事項（測試情境、踩坑紀錄）；一般重點改用卡片條列 | [見範例](#checklist) |

## 結構型語法

### section

- 語法：`# LABEL：TITLE`
- 說明：主章節：自動編號 1／2／3，冒號前為章節 label、後為標題（冒號式命題）；沒有冒號時整行當標題（lint `section-no-colon`）；標題剝掉 emoji／冒號後沒有字報 `empty-heading`、同名章節報 `duplicate-heading`。錨點 id：標題完全等於固定關鍵字（新專案、總結、Commit Skill…）或以「關鍵字：」開頭時用固定 id（對照表見 components.md §1），其餘取英數字轉 kebab-case。第一個 `#` 之前的內容落在頁首區，全版區塊放那裡不會自成一頁（lint `fullpage-before-section`）
- HTML 對照：[components.md §1. Section（主章節）](components.md#1-section主章節)

```markdown
# 新專案：用 SDD 讓 AI 根據規格建立專案
```

### section-emoji

- 語法：`# Emoji TITLE`
- 說明：非編號主章節：標題以 emoji＋空格＋文字開頭時，emoji 取代序號且不佔編號（課後問題、補充資料）；變體選擇子、ZWJ（👨‍💻）、膚色、旗幟（🇹🇼）等 emoji 序列整串算一個圖示；只有 emoji 沒有文字時不算非編號章節（lint `empty-heading`）；冒號拆分與 branch 照常運作
- HTML 對照：—（components.md 無對應章節）

```markdown
# 📝 課後問題：設計你自己的 AI Agent Repo
```

### section-lead

- 語法：`> lead（緊接 # 的下一行）`
- 說明：章節引言：緊接 `#` 的 `>` 行（不以 `**` 開頭）成為章節 lead，可連續多行
- HTML 對照：[components.md §1. Section（主章節）](components.md#1-section主章節)

```markdown
# 新專案：用 SDD 讓 AI 根據規格建立專案
> 規格驅動開發（Spec-Driven Development）
```

### sub-title

- 語法：`## Title`
- 說明：子章節：收進 TOC（id 加 `sub-` 前綴，固定錨點規則同 `#`）；用完整句或動賓短語、不帶 emoji；同一章節內不要重名（lint `duplicate-heading`，同一個分頁群組內同名不算）
- HTML 對照：[components.md §2. Sub-section（子章節）](components.md#2-sub-section子章節)

```markdown
## OpenSpec 初始化
```

### card

- 語法：`### Emoji Title`
- 說明：卡片：一律以語意化 emoji 開頭（lint `card-no-emoji`；emoji 序列整串當 icon，icon 後可不空格）；下接 `- ` 條列（支援 1 層巢狀）與段落，其後緊接的區塊元件併入同一張卡；不在卡片或元件裡的段落報 `loose-paragraph`
- HTML 對照：[components.md §3. Card（卡片）](components.md#3-card卡片)

```markdown
### 🔧 為什麼需要 OpenSpec？
- AI 寫程式越來越快，但專案越改越亂
- 解法：白話文對話 → AI 自動建立規格文件
  - 子項用縮排表示
```

### minor-title

- 語法：`#### Title`
- 說明：小標：章節內的四級標題，不進 TOC
- HTML 對照：—（components.md 無對應章節）

```markdown
#### STEP 1：建立專案
```

### divider

- 語法：`---`
- 說明：章節分隔慣例：放在 `#` 章節之間（頁面上的分隔線由 build 自動產生）
- HTML 對照：—（components.md 無對應章節）

```markdown
- 上一章的最後一點

---

# 下一章：新的命題
```

### loose-list

- 語法：`- item／1. item（縮排一層巢狀）`
- 說明：一般條列／編號清單：子層任意縮排（建議 3 空格），最多 1 層巢狀，更深的併入上一層（lint `nested-too-deep`）；縮排續行併入當前項；同一層混用 `1.` 與 `-` 會併成同一個清單、類型依第一項決定（lint `list-marker-mixed`），空行不會把清單斷開
- HTML 對照：[components.md §7b. Loose List（一般條列／編號清單，支援 1 層巢狀）](components.md#7b-loose-list一般條列編號清單支援-1-層巢狀)

```markdown
1. 驗證系統有 `uv` 與 `ffmpeg`
2. 依平台自動挑 backend：
   - macOS Apple Silicon → `mlx-whisper`
   - 其他（CPU-only）→ `openai-whisper`
3. 跑 `run.sh`
```

### inline

- 語法：`` **粗體**／`code`／[文字](url)／<br> ``
- 說明：行內格式：粗體、行內程式碼（也當中文螢光筆）、連結、網址自動連結、`<br>` 換行；反引號內的 `**`、`[[…]]`、圖片、連結與網址都不轉換、照字面顯示；`**` 要成對（lint `unclosed-bold`），反引號外的 `<` 要寫 `&lt;`（lint `bare-lt`）；反引號內的 `<`、`&` 會自動跳脫、照字面顯示
- HTML 對照：[components.md §19. Inline Elements](components.md#19-inline-elements)

```markdown
用 `中文關鍵詞` 標重點，**粗體**收束，詳見 [官方文件](https://example.com)
```

### inline-tag

- 語法：`[[標籤]]／[[color:標籤]]`
- 說明：行內小徽章：無色為中性灰，color 可為 red／green／orange／purple／blue；表格儲存格、列點、段落都能用
- HTML 對照：[components.md §19. Inline Elements](components.md#19-inline-elements)

```markdown
Deep Research [[orange:付費]]、Search [[green:免費]]、舊版 [[red:已棄用]]
```

### branch

- 語法：`標題 | branch:NAME／| branch:none`
- 說明：分支標記：加在 `#`／`##`／`###` 標題尾端，左側畫 git 分支線並沿用到後續標題；`branch:none` 回主線；`| branch:` 後面空白時標記會被剝掉、視同沒寫（lint `branch-empty`）；配色依分支名前綴（main 綠、develop 藍、feature 紫、release 青、hotfix 橘）
- HTML 對照：[components.md §17. Branch Line（左側分支指示線）](components.md#17-branch-line左側分支指示線)

```markdown
# 建立功能 | branch:main
## 登入表單 | branch:feature/login
### 🔥 緊急修補 | branch:hotfix/csrf
## 合併收尾 | branch:none
```

### tabs

- 語法：`## [工具名] 標題／### [Label|color] 標題`
- 說明：工具分頁：連續帶前綴的同層標題組成分頁群組，連續同名合併為同一分頁、未標記的同層標題結束群組；ChatGPT／Gemini／Claude 有品牌色，`|color` 可指定 red／orange／green／blue／purple；label 內不可再有 `|`（lint `tab-label-pipe`）；`[]`／`[|red]` 沒有名稱不成立分頁；分頁不可巢狀，`##` 分頁裡的 `### [標記]` 只會變成一般卡片（lint `nested-tabs`）
- HTML 對照：[components.md §17b. Tool Tabs（工具分頁）](components.md#17b-tool-tabs工具分頁)

```markdown
## [ChatGPT] 用 ChatGPT 生成圖片
## [Gemini] 用 Nano Banana 生成圖片
## 共通的收尾小節

### [方案 A|red] 紅色路線
### [方案 B|blue] 藍色路線
```

## 區塊元件

### youtube

- 語法：`[youtube id="…" title="…"]／[youtube id="…"]說明[/youtube]`
- 說明：YouTube 影片 16:9 嵌入；單行或區塊形式（中間文字當說明）；`id` 是網址 `v=` 後的值；列印模式改顯示連結
- HTML 對照：[components.md §12. YouTube Embed（YouTube 影片嵌入）](components.md#12-youtube-embedyoutube-影片嵌入)

```markdown
[youtube id="dQw4w9WgXcQ" title="Demo 影片"]

[youtube id="dQw4w9WgXcQ"]
這是一段示範影片的說明
[/youtube]
```

### image-text

- 語法：`[image-text position="left|right" width="N"]…[/image-text]`
- 說明：圖文並排：內含一張 `![](…)` 與段落／`- ` 條列；`width` 為圖片佔比 %（預設 40）；單張直式圖用 `position="right"`、`width` 25〜32；≤ 900px 改上下排列
- HTML 對照：[components.md §11. Image-Text（圖文並排）](components.md#11-image-text圖文並排)

```markdown
[image-text position="right" width="30"]
![產品的主要介面](assets/screenshot.png)
這是產品的主要介面，提供 **直覺式操作**。
- 支援拖放操作
- 即時預覽結果
[/image-text]
```

### gallery

- 語法：`[gallery]…[/gallery]`
- 說明：多圖相簿：每行一張 `![圖說](路徑)`，等高排列、寬度依比例，超出容器橫向捲動；適合連續多張直式圖或比例不一的一組圖
- HTML 對照：[components.md §11b. Gallery（多圖相簿）](components.md#11b-gallery多圖相簿)

```markdown
[gallery]
![端午節賀卡成果](assets/card-dragon.png)
![中秋節賀卡成果](assets/card-moon.png)
![春節賀卡成果](assets/card-cny.png)
[/gallery]
```

### image

- 語法：`![alt](src)／![alt](src){max-width=200px}`
- 說明：獨立一行的圖片：置中顯示、alt 成為圖說（寫成完整句子）；`{max-width=…}` 限寬；路徑寫 `assets/`（不加 `./`）；寫在段落或列點中則為行內圖
- HTML 對照：[components.md §10. Image（獨立圖片）](components.md#10-image獨立圖片)

```markdown
![架構示意圖：三層服務之間的資料流](assets/architecture.png)
```

### table

- 語法：`| 欄 | 欄 |＋|---|---|；欄名尾附 [width:120]`
- 說明：標準 Markdown 表格；分隔列 `:---:`／`---:` 控制對齊；標題儲存格尾附 `[width:值]` 指定欄寬（裸數字＝px，也接受 %／rem／em／ch，未標的欄 auto）；儲存格可用 `[[標籤]]`；儲存格內用 `<br>` 換行；**第一欄自動粗體**（不用手寫 `**`），用 `<br>` 分兩行時只有第一行粗體
- HTML 對照：[components.md §7c. Table Column Widths（表格欄寬）](components.md#7c-table-column-widths表格欄寬)

```markdown
| 情境 | 模糊指令[width:120] | 完整指令 |
|---|---|---|
| 寫程式<br>給工程師 | 幫我寫 | 幫我用 Python 寫排序 [[green:推薦]] |
```

### prompt

- 語法：```` ```prompt [label="…"]／```terminal／```code … ``` ````
- 說明：可複製的 Prompt／終端機／程式碼區塊：`prompt` 內容以 shell 指令開頭時 header 顯示 Terminal、`code` 固定顯示 Code；主體可再放巢狀 fence；超過 10 行自動折疊；語言標識一律小寫
- HTML 對照：[components.md §4. Prompt Block（終端機提示塊）](components.md#4-prompt-block終端機提示塊)

````markdown
```prompt [label="安裝指令"]
npm install -g @fission-ai/openspec@latest
```

```prompt [label="口語化意圖"]
幫我把這份講稿轉成課程頁
```
````

### raw-html

- 語法：`[html]…[/html]／[html src="檔案.html"]`
- 說明：自訂 HTML，以 `iframe srcdoc` 渲染（CSS 與外層隔離、高度自動延展）；`[html src="…"]` 單行形式在 build 前讀入課程目錄下的 HTML 檔（路徑相對課程目錄，檔案不存在報 `html-src-missing`）；內容裡的本地 `<img src>` 與頁面圖片走同一套處理：依 `--images` 內嵌 base64 或維持相對路徑，有較新的同名 .webp 就改用
- HTML 對照：[components.md §13. Raw HTML（自訂 HTML 區塊）](components.md#13-raw-html自訂-html-區塊)

```markdown
[html]
<div style="display:flex;gap:12px">
  <div style="flex:1;padding:16px">面板 A</div>
  <div style="flex:1;padding:16px">面板 B</div>
</div>
[/html]

[html src="diagram.html"]
```

### flow

- 語法：`[flow]…[/flow]`
- 說明：流程步驟：每行 `1. ` 或 `- ` 一步，` — `（或 ` – `／` - `，前後要有空白）前為步驟標題、後為說明
- HTML 對照：[components.md §6. Flow Steps（流程步驟）](components.md#6-flow-steps流程步驟)

```markdown
[flow]
1. proposal.md — 確認目標與範圍
2. design.md — 技術選型與風險評估
3. task.md — 任務清單，完成自動打勾
[/flow]
```

### tags

- 語法：`[tags]…[/tags]`
- 說明：彩色標籤列：每行 `- [green|orange|purple|blue] 文字`；帶色的 `- [color]` 行必須包在 `[tags]` 內，獨立使用不套色
- HTML 對照：[components.md §7. Tags（標籤）](components.md#7-tags標籤)

```markdown
[tags]
- [orange] 人工手打：耗時且風格不一致
- [purple] AI 自動生成：長短隨機
- [green] 解法：git-smart-commit Skill
[/tags]
```

### case

- 語法：`[case title="…"]…[/case]`
- 說明：情境／痛點／方案三段式案例卡：每段冒號後寫文字或下接 `- ` 條列（可並存），`處理方案：` 視同 `方案：`；多個案例寫多個 `[case]`
- HTML 對照：[components.md §6b. Case（情境／痛點／處理方案）](components.md#6b-case情境痛點處理方案)

```markdown
[case title="📄 文件生成"]
情境：每天要產出大量 Email、公文、會議記錄
痛點：
- 格式重複、內容大同小異，卻吃掉大量工時
方案：
- 提供「範本」讓 AI `參考格式`
- 人負責審核結果
[/case]
```

### summary

- 語法：`[summary]…[/summary]`
- 說明：總結卡片格：每行 `- emoji **標題** | 描述`，缺 `|` 的行不會出現；課程最後一段用它收束
- HTML 對照：[components.md §9. Summary Grid（總結卡片）](components.md#9-summary-grid總結卡片)

```markdown
[summary]
- 🏗️ **新專案 — SDD** | 讓 AI 根據規格建立專案
- ⚙️ **舊專案 — Skills** | 讓 AI 有規範可循
[/summary]
```

### class-timeline

- 語法：`[time]…[/time]`
- 說明：課程時間軸：每堂以 `- label:`（或任一 `- 欄位:`）起頭、其餘欄位縮排兩格；`date`、`time` 必填（缺了報 `invalid-value`），`des`／`link`／`marker` 選填；`time` 寫上課起訖時刻（如 `19:00~21:00`），不寫「約 100 分鐘」這類時長或節奏說明（節奏分配放講師備註 `<!-- -->`）；`active: true`（或 `status: past|current|upcoming`）標記目前堂；也可一行寫一堂的精簡寫法 `5/30（六）| 13:30~16:30 | 主題`，前面加不加 `- ` 都可以
- HTML 對照：—（components.md 無對應章節）

```markdown
[time]
- label: 第 1 堂
  date: 5/30（六）
  time: 13:30~16:30
  des: 打造懂你的 AI 助手
  link: [課程錄影](https://example.com/replay)
- label: 第 2 堂
  date: 6/6（六）
  time: 13:30~16:30
  des: 規格驅動開發
  active: true
[/time]
```

### qa-session

- 語法：`[qa-session title="…"]…[/qa-session]`
- 說明：全版 QA 頁：內容空白＝等待提問畫面；`- Q:` 下一行兩格縮排 `A:` 組成 accordion；`title` 預設「Q&A 時間」
- HTML 對照：[components.md §15. QA Session（問答區塊）](components.md#15-qa-session問答區塊)

```markdown
[qa-session title="常見問題"]
- Q: 這套工具適合初學者嗎？
  A: 完全適合，不需要先懂程式。
[/qa-session]

[qa-session title="Q&A 時間"]
[/qa-session]
```

### lab-session

- 語法：`[lab-session title="…" duration="…" hint="…"]…[/lab-session]`
- 說明：全版實作時間頁：`- ` 行為編號任務（可空白）；`title` 預設「🛠️ 實作時間」、`duration` 顯示時間膠囊、`hint` 有預設提示語
- HTML 對照：[components.md §14. Lab Session（實作時間區塊）](components.md#14-lab-session實作時間區塊)

```markdown
[lab-session title="🛠️ 實作時間" duration="15 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 設定你的第一個 Agent Skill
- 執行 build 並確認 HTML 正確輸出
[/lab-session]
```

### interactive

- 語法：`[interactive title="…"]…[/interactive]`
- 說明：全版互動環節頁（說明會／直播停下來和聽眾說話）：內文為講師話術、保留換行，連續 `- ` 行渲染為條列；`title` 預設「💬 互動環節」
- HTML 對照：[components.md §14b. Interactive Moment（說明會互動環節）](components.md#14b-interactive-moment說明會互動環節)

```markdown
[interactive title="開場 warm-up"]
看過類似翻車經驗的，在留言區打「`+1`」
- 也歡迎分享你看過最瞎的翻車現場
[/interactive]
```

### warning

- 語法：`[warning title="…"]…[/warning]`
- 說明：警告框：`title` 自動加 ⚠️；內容可混用段落與 `- ` 條列，單換行同段換行、空行分段；權限／金流／個資等敏感場景用
- HTML 對照：[components.md §5b. Warning Box（警告框）](components.md#5b-warning-box警告框)

```markdown
[warning title="權限注意"]
執行前請確認已備份資料，此操作無法復原。
- 不要無腦 Accept
- 涉及金流要再三確認
[/warning]
```

### bonus

- 語法：`[bonus title="…"]…[/bonus]`
- 說明：Bonus 按鈕＋彈窗：內容支援段落（空行分段）、`- ` 清單、粗體、行內程式碼；`title` 預設「Bonus」；點遮罩、✕ 或 Esc 關閉
- HTML 對照：—（components.md 無對應章節）

```markdown
[bonus title="🎁 幕後製作心得"]
這裡是**彈窗內容**，支援基本 Markdown：

- 清單用 `- item`
- 粗體用 `**文字**`
[/bonus]
```

### feedback

- 語法：`[feedback title="…" btn="…" desc="…"]…[/feedback]`
- 說明：回饋儀表板（按鈕＋彈窗）：面板以 `stats:`／`bars:`／`compare:`／`quotes:`／`changes:` 開頭，下接 `- ` 項目、欄位以 `|` 分隔；`changes` 的目標標題可跳到該段；問卷資料先去識別化
- HTML 對照：[components.md §14a-2. Feedback Dashboard（回饋儀表板：按鈕＋彈窗）](components.md#14a-2-feedback-dashboard回饋儀表板按鈕彈窗)

```markdown
[feedback title="上一堂課的回饋" btn="📊 上一堂課的回饋" desc="成效問卷｜9 份回覆"]
stats:
- 8.9 小時 | 每週自評省下的時間

compare: 每週花在各類工作的時間 | 訓練前 | 目前 | 小時
- 資料整理與分析 | 11.9 | 5.4

bars: 使用時遇到的困難 | 人 | 9
- 操作介面不熟悉 | 5

quotes: 同仁分享的實際案例
- 每月報表現在一個指令完成 | 財務部

changes: 這堂課怎麼回應你們的回饋 | 你們說 | 這堂課
- 操作介面不熟悉 → 每個功能都附操作截圖 | 使用時機
[/feedback]
```

### survey

- 語法：`[survey title="…" url="…" hint="…" btn="…"]…[/survey]`
- 說明：全版滿意度問卷頁：`url` 有值才顯示按鈕；結尾標籤必寫；實體企業課放在 qa-session 前
- HTML 對照：[components.md §16. Survey（課程滿意度問卷區塊）](components.md#16-survey課程滿意度問卷區塊)

```markdown
[survey title="課程滿意度問卷" url="https://forms.gle/xxxx" btn="填寫問卷"]
[/survey]
```

### download

- 語法：`[download dir="…" label="…" desc="…"]／[download file="assets/…"]`
- 說明：下載卡（單行）：`dir` 對應 `example/<dir>/`，build 自動打包成 `assets/<dir>.zip`；`file` 直接連既有檔，副檔名標籤自動顯示；zip 要與 index.html 一起部署
- HTML 對照：[components.md §14a. Download Card（範例檔下載按鈕）](components.md#14a-download-card範例檔下載按鈕)

```markdown
[download dir="brand-copywriting" label="下載「品牌文案」範例包" desc="品牌指南、產品資訊（解壓即用）"]
[download file="assets/proposal-refiner.skill" label="下載 Proposal Refiner Skill"]
```

### pr

- 語法：`[pr from="…" to="…" title="…" desc="…" url="…" status="…"]`
- 說明：Git PR／MR 卡片（單行）：`from`／`to` 為分支（必填）；`status` 為 merged／open／draft／closed；`number` 省略時從 `url` 解析
- HTML 對照：—（components.md 無對應章節）

```markdown
[pr from="feature/login" to="main" title="新增登入流程" desc="補上表單驗證" url="https://github.com/owner/repo/pull/42" status="merged"]
```

### insight

- 語法：`> **標題**＋後續 > 行`
- 說明：洞察框（講者旁白的主要載體，常用問句標題自問自答）：後續 `>` 行為內文、`>` 空行分段，支援 `- ` 條列與 fenced code；不以粗體開頭則為純引言；標題的 `**` 要成對，`> **標題` 沒有結尾 `**` 時整段當一般引言、星號原樣顯示（lint `unclosed-bold`）
- HTML 對照：[components.md §5. Insight Box（洞察框）](components.md#5-insight-box洞察框)

```markdown
> **為什麼要有洞察框？**
> 因為講者的旁白需要載體。
>
> 第二段落用空行分隔。
> - 也支援條列
```

### checklist

- 語法：`- [x] 項目`
- 說明：勾選清單（行首不縮排）：只用於已驗證／已完成的事項（測試情境、踩坑紀錄）；一般重點改用卡片條列
- HTML 對照：[components.md §8. Checklist（勾選清單）](components.md#8-checklist勾選清單)

```markdown
- [x] 電子郵件格式錯誤 → 前端擋住、不呼叫 API
- [x] 格式正確 → 呼叫 Mock API → 成功取得 Token
```
