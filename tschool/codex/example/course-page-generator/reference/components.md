# Component Mapping Reference

Markdown 語法 → HTML 元件的完整對照。產生 HTML 時依此規則轉換。

## 1. Section（主章節）

**Markdown：**
```markdown
# 新專案：用 SDD 讓 AI 根據規格建立專案
> 規格驅動開發（Spec-Driven Development）— 讓 AI 不只寫程式，還幫你建立完善的規格文件
```

**HTML：**
```html
<hr class="divider">
<section class="section" id="new-project">
  <div class="reveal">
    <span class="section-label"><span class="num">1</span> 新專案</span>
    <h2>用 SDD 讓 AI 根據規格建立專案</h2>
    <p class="lead">
      規格驅動開發（Spec-Driven Development）— 讓 AI 不只寫程式，還幫你建立完善的規格文件
    </p>
  </div>
```

規則：
- `#` 標題以冒號分為 label 和 title（`# LABEL：TITLE`），冒號前為 section-label，冒號後為 h2
- 若無冒號，整個作為 h2，section-label 使用簡短版
- 緊接著的 `>` blockquote 作為 `.lead` 段落
- 自動遞增編號（第一個主章節 = 1）
- 標題以 emoji＋空白＋文字開頭（`# 📝 課後問題：…`）→ 非編號章節，emoji 放進 `.num` 取代序號、不佔編號；變體選擇子、ZWJ（👨‍💻）、膚色、旗幟（🇹🇼）等 emoji 序列整串算一個圖示；只有 emoji 沒有文字時照一般章節處理（lint `empty-heading`）
- `id`（`text.mjs` 的 `generateId()`）：標題剝除開頭 emoji 與 `| branch:`／`[工具名]` 標記後，**完全等於**下表關鍵字、或以「關鍵字＋`：`／`:`」開頭 → 用固定錨點（「總結與展望」「新專案常見錯誤」這類只是包含關鍵字的標題不算）；否則取標題中的英數字轉 kebab-case（最多 40 字），沒有英數字時用流水號（`section-N`）；重複時加 `-2`、`-3`（lint `duplicate-heading`）。`##` 套同一規則再加 `sub-` 前綴
- 固定錨點對照（`STABLE_ANCHOR_MAP`；這些 id 已隨課程頁分享出去，只增不改）：

| 標題關鍵字（每個「」是一個鍵） | id |
|---|---|
| 「新專案」 | `new-project` |
| 「舊專案」 | `old-project` |
| 「導入測試」 | `testing` |
| 「總結」「課程總結」 | `summary` |
| 「OpenSpec 初始化」 | `openspec-init` |
| 「從零建立專案」 | `create-project` |
| 「建立專案規則」「接受變更並建立專案規則」「建立專案規則、加入版本控制」 | `project-rules` |
| 「OpenSpec 迭代」 | `openspec-iterate` |
| 「設定 Commit Skill」「Commit Skill」 | `commit-skill` |
| 「設定 PR Skill」「PR Skill」 | `pr-skill` |
| 「Git Worktree 並行開發」「Worktree」「認識 Git Worktree」「透過 Git Worktree 提升協作效率」「Git Worktree 提高協作效率」「認識 Git Worktree，了解多人專案協作技巧」 | `worktree` |
| 「gen-test-cases」「gen-test-cases 工作流設計」 | `gen-test` |
| 「GitHub Action 自動化」「GitHub Action」「CI/CD 篇」 | `github-action` |

- 第一個 section 前加 `<hr class="divider">`

## 2. Sub-section（子章節）

**Markdown：**
```markdown
## OpenSpec 初始化
```

**HTML：**
```html
<div class="reveal" id="sub-openspec-init">
  <div class="sub-title"><span class="bar"></span>OpenSpec 初始化</div>
```

規則：
- `##` 標題轉為 `.sub-title`
- 自動產生 `id`（加 `sub-` 前綴）
- 出現在 TOC 的子項目中

## 3. Card（卡片）

**Markdown：**
```markdown
### 🔧 為什麼需要 OpenSpec？
- AI 寫程式越來越快，但專案越改越亂
- 關鍵人物離職，沒有文件，系統知識直接斷層
- 解法：白話文對話 → AI 自動建立規格文件
  - 子項用縮排表示
  - 渲染成母項內的巢狀清單
```

**HTML：**
```html
<div class="group-block" data-seg="1">
  <div class="group-header"><span class="icon">🔧</span> 為什麼需要 OpenSpec？</div>
  <div class="group-body">
    <ul>
      <li>AI 寫程式越來越快，但專案越改越亂</li>
      <li>關鍵人物離職，沒有文件，系統知識直接斷層</li>
      <li>解法：白話文對話 → AI 自動建立規格文件
        <ul class="nested">
          <li>子項用縮排表示</li>
          <li>渲染成母項內的巢狀清單</li>
        </ul>
      </li>
    </ul>
  </div>
</div>
```

規則：
- `###` 標題帶 emoji → `.group-header`，emoji 放在 `.icon` span 中；emoji 序列（變體選擇子、ZWJ、膚色、旗幟，例 👨‍💻、🏳️‍🌈、🇹🇼）整串當 icon，icon 後可不空格（沒有 emoji 時 lint `card-no-emoji`、只有 emoji 沒有文字時 `empty-heading`）
- 底下的 bullet list → `.group-body` 內的 `<ul>`
- 縮排的 `- ` 子項（任何 > 0 的縮排都算）→ 母項內的 `<ul class="nested">`；與 Loose List 相同，最多支援 **1 層巢狀**，更深的子項會被併入當前子項的文字
- 底下的段落 → `.group-body` 內的 `<p class="loose-text">`
- 整個 card 包在 `<div class="reveal">` 中

## 4. Prompt Block（終端機提示塊）

**Markdown：**
~~~markdown
```prompt [label="安裝指令"]
npm install -g @fission-ai/openspec@latest
openspec init
```
~~~

**HTML：**
```html
<div class="prompt-block">
  <div class="prompt-header">
    <div class="dots"><span></span><span></span><span></span></div>
    Terminal
    <span class="label">安裝指令</span>
  </div>
  <div class="prompt-body">npm install -g @fission-ai/openspec@latest
openspec init</div>
</div>
```

規則：
- 用 `prompt` 作為 fenced code block 的語言標記
- `[label="..."]` 可選，顯示在右上角
- header 中間文字預設為 "Prompt"，若內容是 shell 指令則用 "Terminal"
- body 內容保持原樣（`white-space: pre-wrap`）
- **主體支援巢狀 ``` fence**：body 內可再放 fenced code（帶語言如 ```` ```json ````，或成對的裸 ```` ``` ````）。裸 fence 的判定規則：往後掃描若在遇到標題／分隔線／其他區塊起點之前還有 ≥2 個裸 ```` ``` ````（巢狀收尾＋外層收尾）即視為巢狀起點，否則視為外層收尾——因此外層收尾是最後一個落單的 ```` ``` ````
- **超過 10 行時自動折疊**：頁面載入後 JS 偵測，顯示前 10 行並在底部加「展開 ▾」按鈕；展開後按鈕變為「收合 ▴」。複製按鈕永遠抓取完整內容（`textContent` 不受 CSS overflow 影響）。列印與簡報模式自動顯示全文，不受折疊影響。

## 4b. Code Block（程式碼塊）

**Markdown：**
~~~markdown
```code [label="CLAUDE.md 範例"]
# 專案規範
請用繁體中文回答
```
~~~

**HTML：** 與 Prompt Block 相同結構，header 文字改為 `Code`。

規則：
- 用 `code` 作為 fenced code block 的語言標記
- `[label="..."]` 可選，顯示在右上角
- header 固定顯示 "Code"（不自動偵測）
- 適合展示設定檔、程式碼片段等非終端機內容

## 5. Insight Box（洞察框）

**Markdown：**
```markdown
> **AI 正在改變企業決策**
> 過去 Dashboard 這類系統，企業通常找廠商購買、支付年費維護。
> 但 Vibe Coding 的出現正讓企業做出不同的選擇。
```

**HTML：**
```html
<div class="insight">
  <div class="insight-title">AI 正在改變企業決策</div>
  <p>過去 Dashboard 這類系統，企業通常找廠商購買、支付年費維護。</p>
  <p style="margin-top:.5rem">但 Vibe Coding 的出現正讓企業做出不同的選擇。</p>
</div>
```

規則：
- blockquote 第一行以 `**粗體**` 開頭 → insight box；`**` 必須成對，`> **標題` 沒有結尾 `**` 時整段當一般引言、星號原樣顯示（lint `unclosed-bold`）
- 粗體文字成為 `.insight-title`
- 後續段落（以空行分隔）分別成為 `<p>` 元素
- blockquote 內可用 ``` 圍出程式碼區塊，渲染成 code 區域（沿用 prompt-block 樣式，含複製按鈕）。支援語言與標籤語法 `` ```terminal [label="..."] ``；未標語言時依內容自動判斷 Terminal / Code。段落與程式碼依書寫順序交錯呈現，bullets 一律置於最後
- 若 blockquote 不以粗體開頭，則判斷為普通引言或 lead 文字

**blockquote 內含程式碼：**
````markdown
> **經驗分享**
> 如果想跳過「開始實作」這段，可以用
> ```terminal [label="拉取遠端 branch"]
> git fetch origin
> git checkout -b feature/fullstack-foundation origin/feature/fullstack-foundation
> ```
````

## 5b. Warning Box（警告框）

**Markdown：**
```markdown
[warning title="操作注意"]
執行前請確認已備份資料，此操作無法復原。
- 刪除後 30 天內仍可從資源回收桶還原
- 超過 30 天將永久消失
[/warning]
```

**HTML：**
```html
<div class="warning">
  <div class="warning-title">⚠️ 操作注意</div>
  <p>執行前請確認已備份資料，此操作無法復原。</p>
  <ul>
    <li>刪除後 30 天內仍可從資源回收桶還原</li>
    <li>超過 30 天將永久消失</li>
  </ul>
</div>
```

規則：
- `[warning]...[/warning]` 包裹內容
- `title="..."` 為選填，有值時自動加 ⚠️ 前綴顯示為粗體標題
- 內容支援純段落文字與 `- item` 條列（可混用）
- 換行規則與 insight 一致：單換行在同段內以 `<br>` 換行；空行分隔為不同段落
- 使用 `--accent2`（琥珀/橘金）左側邊框色系，視覺上與 insight（⏳ 洞察）明顯區隔
- 整個區塊包在 `<div class="reveal">` 中

## 6. Flow Steps（流程步驟）

**Markdown：**
```markdown
[flow]
1. proposal.md — 確認目標與範圍
2. design.md — 技術選型與風險評估
3. specs/ — 按功能分類的詳細規格
4. task.md — 任務清單，完成自動打勾
[/flow]
```

**HTML：**
```html
<div class="flow">
  <div class="flow-step">
    <div class="step-num">1</div>
    <div class="step-content">
      <div class="step-title">proposal.md</div>
      <div class="step-desc">確認目標與範圍</div>
    </div>
  </div>
  <div class="flow-step">
    <div class="step-num">2</div>
    <div class="step-content">
      <div class="step-title">design.md</div>
      <div class="step-desc">技術選型與風險評估</div>
    </div>
  </div>
  <!-- ... -->
</div>
```

規則：
- 使用 `[flow]...[/flow]` 包裹列表，支援 ordered list（`1. `）與 unordered list（`- `）
- 每個項目以 ` — `、` – ` 或 ` - `（前後要有空白）分隔標題和描述
- 若無分隔符，整行作為 step-title，step-desc 留空
- 一定要用 `[flow]` 包裹；`###` 卡片標題含「流程」「步驟」不會自動轉換

## 6b. Case（情境／痛點／處理方案）

**Markdown：**
```markdown
[case title="📄 文件生成"]
情境：每天要產出大量 Email、公文、會議記錄、合約
痛點：
- 格式重複、內容大同小異，卻吃掉大量工時
方案：
- 提供「範本」讓 AI `參考格式`
- 用 AI 快速`生成初版`
- 人負責`審核結果、優化流程`
[/case]
```

**HTML：**
```html
<div class="group-block case-card">
  <div class="group-header"><span class="icon">📄</span> 文件生成</div>
  <div class="group-body">
  <div class="case-flow">
    <div class="case-step case-step--scenario">
      <span class="case-step__label">情境</span>
      <div class="case-step__body">
        <p>每天要產出大量 Email、公文、會議記錄、合約</p>
      </div>
    </div>
    <div class="case-step case-step--pain">
      <span class="case-step__label">痛點</span>
      <div class="case-step__body">
        <ul><li>格式重複、內容大同小異，卻吃掉大量工時</li></ul>
      </div>
    </div>
    <div class="case-step case-step--solution">
      <span class="case-step__label">方案</span>
      <div class="case-step__body">
        <ul>
          <li>提供「範本」讓 AI <code>參考格式</code></li>
          <!-- ... -->
        </ul>
      </div>
    </div>
  </div>
  </div>
</div>
```

規則：
- `[case]...[/case]` 包裹一個應用場景，內部依序寫 `情境：`、`痛點：`、`方案：` 三段（`處理方案：` 視同 `方案：`；全形／半形冒號皆可）
- 每段冒號後可直接寫行內文字，也可在下一行起用 `- ` 條列（兩者可並存）；段落標籤可省略不寫（例如只有情境＋方案）
- `title="..."` 為選填；開頭帶 emoji 時會如卡片標題放進 `.icon`。整體渲染為 `group-block` 變體，網頁／列印／簡報模式的卡片樣式與「簡報模式一卡一頁」行為都與 `###` 卡片一致；省略 title 且緊接在 `###` 卡片之後時，區塊會歸入該卡片內
- 三段各有專屬色：情境（藍）、痛點（橙）、方案（綠），左側有垂直連接線串起三個標籤
- 適用場景：介紹「AI 應用案例」「導入前後對比」等需要 問題脈絡 → 解法 敘事的內容；多個案例就寫多個 `[case]` 區塊

## 7. Tags（標籤）

**Markdown：**
```markdown
[tags]
- [orange] 人工手打：耗時且風格不一致
- [purple] AI 自動生成：長短隨機、中英混雜
- [green] 解法：git-smart-commit Skill
[/tags]
```

**HTML：**
```html
<div class="tags">
  <span class="tag orange">人工手打：耗時且風格不一致</span>
  <span class="tag purple">AI 自動生成：長短隨機、中英混雜</span>
  <span class="tag green">解法：git-smart-commit Skill</span>
</div>
```

可用顏色：`green`, `orange`, `purple`, `blue`

⚠️ 帶顏色的 `- [color] text` 項目**必須**放在 `[tags]...[/tags]` 區塊內才會生效。獨立使用時會被當成普通文字，不會套用顏色樣式。

## 7b. Loose List（一般條列／編號清單，支援 1 層巢狀）

**Markdown：**
```markdown
1. 驗證系統有 `uv` 與 `ffmpeg`
2. 依平台自動挑 backend：
   - macOS Apple Silicon → `mlx-whisper`
   - Linux/Windows + NVIDIA → `faster-whisper`
   - 其他（CPU-only）→ `openai-whisper`
3. 跑 `run.sh`
```

**HTML：**
```html
<ol class="loose-list ordered">
  <li>驗證系統有 <code>uv</code> 與 <code>ffmpeg</code></li>
  <li>依平台自動挑 backend：
    <ul class="loose-list nested">
      <li>macOS Apple Silicon → <code>mlx-whisper</code></li>
      ...
    </ul>
  </li>
  <li>跑 <code>run.sh</code></li>
</ol>
```

規則：
- 頂層 `1. 2. 3.` → `<ol class="loose-list ordered">`，瀏覽器自帶編號（跳號會被重新編 1/2/3）
- 頂層 `- ` → `<ul class="loose-list">`，用 `::before` 圓點
- 子層用縮排（任何 > 0 的縮排都算，建議用 3 spaces 對齊 `1. ` 後的位置）；marker 各自獨立（父 ordered + 子 unordered 等混用都允許）
- 最多支援 **1 層巢狀**（depth 2）。再往下的子項會被併入當前 item 的文字（lint `nested-too-deep`）
- 同一層混用 `1.` 與 `-` 不會拆成兩個清單：類型依第一項決定，其餘項目併進去，中間的空行也不會斷開（lint `list-marker-mixed`）；要分開請在中間放段落或卡片
- 非 list 但縮排的續行會併入當前 item（多行段落寫法）
- `- [x]`（checklist）與 `- [color]`（tags）有獨立元件，不會被當成 list item

## 7c. Table Column Widths（表格欄寬）

標準 Markdown 表格直接渲染為 `.content-table`（每格預設 `min-width: 120px`）。需要控制某欄寬度時，在該欄**標題儲存格尾**附 `[width:值]`：

**Markdown：**
```markdown
| | 模糊指令[width:120] | 完整指令 |
|---|---|---|
| 範例 | 幫我寫 | 幫我用 Python 寫排序 |
```

**HTML：**
```html
<div class="table-wrap">
  <table class="content-table">
    <colgroup>
      <col>
      <col style="width:120px">
      <col>
    </colgroup>
    <thead>
      <tr>
        <th class="align-left"></th>
        <th class="align-left col-w">模糊指令</th>
        <th class="align-left">完整指令</th>
        ...
```

規則：
- 裸數字視為 px，也接受 `%`／`rem`／`em`／`ch`（例：`[width:30%]`）；標記會從顯示文字中移除
- 有標記的欄位掛 `col-w`（取消該欄預設 `min-width: 120px`，欄寬以指定值為準）；未標記的欄行為**完全不變**（auto）
- 值不合法時不視為標記，原樣顯示在標題文字裡讓作者發現
- 可同時標多欄；沒有任何標記的表格零改變

## 7d. Table First Column & Line Breaks（第一欄粗體與儲存格換行）

表格第一欄視為`列標籤`，build 時**自動粗體**，不需要手寫 `**`。儲存格內要換行就寫 `<br>`；第一欄用 `<br>` 分成兩行時，**只有第一行粗體**，第二行起是一般字重的補充說明（不用再加括號）。

**Markdown：**
```markdown
| 情境 | 痛點 |
|---|---|
| 📋 行政瑣事<br>家長通知、公文、會議記錄 | 格式固定、內容重複 |
| 怎麼開始 | 打開網頁登入 |
```

**HTML：**
```html
<td class="align-left"><strong>📋 行政瑣事</strong><br>家長通知、公文、會議記錄</td>
<td class="align-left"><strong>怎麼開始</strong></td>
```

規則：
- 只作用在 `<tbody>` 的第一欄；標題列（`<th>`）本來就是粗體
- 第一行已經含 `**…**`（例：`📋 **行政瑣事**<br>…`）或是空的，就原樣保留、不重複包；所以舊講稿手寫的粗體不用改
- `<br>` 可用在任何儲存格；其他欄位的換行不影響字重

## 8. Checklist（勾選清單）

**Markdown：**
```markdown
- [x] 電子郵件格式錯誤 → 前端擋住、不呼叫 API
- [x] 密碼不符規則 → 顯示對應錯誤訊息
- [x] 格式正確 → 呼叫 Mock API → 成功取得 Token
```

**HTML：**
```html
<ul class="checklist">
  <li>電子郵件格式錯誤 → 前端擋住、不呼叫 API</li>
  <li>密碼不符規則 → 顯示對應錯誤訊息</li>
  <li>格式正確 → 呼叫 Mock API → 成功取得 Token</li>
</ul>
```

規則：
- `- [x]` 項目 → checklist（CSS 自帶 ✓ 圖示）

適用場景：表達「已驗證」「已完成」「已踩過的坑」等**帶有完成語意**的事項清單。
- ✅ 適合：測試情境清單、踩坑紀錄、已確認的檢查項目
- ❌ 不適合：核心觀點、重點摘要、一般條列（這些應使用卡片 `###` + 普通 list `- item`）

## 9. Summary Grid（總結卡片）

**Markdown：**
```markdown
# 總結
[summary]
- 🏗️ **新專案 — SDD** | OpenSpec + Spec-Driven Development，讓 AI 根據規格建立 Dashboard
- ⚙️ **舊專案 — Skills** | 設計 Commit / PR / Worktree Skills，讓 AI 有規範可循
- 🧪 **導入測試 — CI/CD** | 用 Workflow 驅動 AI 撰寫測試，搭配 GitHub Action 守住品質
[/summary]
```

**HTML：**
```html
<div class="summary-grid">
  <div class="summary-card">
    <div class="sc-icon">🏗️</div>
    <h4>新專案 — SDD</h4>
    <p>OpenSpec + Spec-Driven Development，讓 AI 根據規格建立 Dashboard</p>
  </div>
  <!-- ... -->
</div>
```

規則：
- `[summary]...[/summary]` 包裹的 list
- 每項格式：`emoji **標題** | 描述`
- emoji → `.sc-icon`，粗體 → `<h4>`，`|` 後面 → `<p>`

## 10. Image（獨立圖片）

**Markdown：**
```markdown
![架構示意圖](images/architecture.png)
```

**HTML：**
```html
<figure class="content-image">
  <img src="images/architecture.png" alt="架構示意圖" loading="lazy">
  <figcaption>架構示意圖</figcaption>
</figure>
```

規則：
- 獨立一行的 `![alt](src)` → 圖片區塊，置中顯示
- `alt` 文字自動成為 `<figcaption>` 圖片說明
- 若 `alt` 為空則不產生 figcaption
- 圖片包在 `<div class="reveal">` 中
- 行內圖片（在文字段落或列表中）則以 `<img class="inline-image">` 渲染

## 11. Image-Text（圖文並排）

**Markdown：**
```markdown
[image-text position="left" width="50"]
![產品截圖](images/screenshot.png)
這是產品的主要介面，提供了 **直覺式操作** 體驗。
- 支援拖放操作
- 即時預覽結果
[/image-text]
```

**HTML：**
```html
<div class="image-text" style="--img-width:50%">
  <div class="image-text__img">
    <img src="images/screenshot.png" alt="產品截圖" loading="lazy">
  </div>
  <div class="image-text__body">
    <p>這是產品的主要介面，提供了 <strong>直覺式操作</strong> 體驗。</p>
    <ul>
      <li>支援拖放操作</li>
      <li>即時預覽結果</li>
    </ul>
  </div>
</div>
```

規則：
- `[image-text]...[/image-text]` 包裹圖片與文字
- `position="left"`（預設）：圖片在左、文字在右
- `position="right"`：圖片在右、文字在左
- `width="N"` 設定圖片佔比百分比（預設 40），例如 `width="30"` 或 `width="60"`
- 文字區域支援段落、**粗體**、`程式碼`、連結、列表等行內格式
- 響應式：平板（≤ 900px）及手機自動改為上下排列（圖片在上）
- 整個區塊包在 `<div class="reveal">` 中

## 11b. Gallery（多圖相簿）

**Markdown：**
```markdown
[gallery]
![端午節賀卡成果](assets/card-dragon.png)
![中秋節賀卡成果](assets/card-moon.png)
![春節賀卡成果](assets/card-cny.png)
[/gallery]
```

**HTML：**
```html
<div class="gallery">
  <figure class="gallery__item">
    <img src="assets/card-dragon.png" alt="端午節賀卡成果" loading="lazy">
    <figcaption>端午節賀卡成果</figcaption>
  </figure>
  <!-- ...其餘 item -->
</div>
```

規則：
- `[gallery]...[/gallery]` 內每行一張 `![圖說](路徑)`，非圖片行忽略
- **等高呈現**：所有圖片統一高度（`--gallery-h`：桌機 480px、平板 ≤900px 380px、手機 ≤600px 300px），寬度依原始比例自動；混合比例（直式＋橫式）也能排成視覺和諧的一列，不裁切內容
- 單張圖寬度上限 `min(80vw, 640px)`，避免超寬橫圖獨佔整列
- 總寬未超出容器時整列置中（以首末 item 的 `margin:auto` 實現，避免 `justify-content:center` 搭配 overflow 的裁切問題）；超出時橫向捲動（scroll-snap 對齊）
- 超過 3 張時 build 會額外標上 `gallery--scroll` class（現行樣式行為相同，保留供客製）
- alt 文字渲染為每張圖下方的 figcaption 圖說
- 列印模式自動換行平鋪，不裁切
- 適用情境：**連續多張直式（portrait）圖片**或比例不一的一組圖——單張直式圖建議改用 `[image-text position="right"]`（左文右圖）
- 整個區塊包在 `<div class="reveal">` 中

## 12. YouTube Embed（YouTube 影片嵌入）

**Markdown（單行）：**
```markdown
[youtube id="dQw4w9WgXcQ" title="Demo 影片"]
```

**Markdown（區塊，含說明文字）：**
```markdown
[youtube id="dQw4w9WgXcQ"]
這是一段示範影片的說明
[/youtube]
```

**HTML：**
```html
<div class="youtube-embed">
  <div class="youtube-wrapper" data-id="dQw4w9WgXcQ">
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo 影片" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
  </div>
  <p class="youtube-caption">Demo 影片</p>
</div>
```

規則：
- `id` 為 YouTube 影片 ID（網址中 `v=` 後面的值）
- `title` 為選填的影片標題/說明，會顯示在影片下方
- 區塊形式 `[youtube]...[/youtube]` 中間的文字作為 caption
- 影片以 16:9 比例響應式嵌入
- 列印模式下 iframe 隱藏，改為顯示 YouTube 連結
- 整個區塊包在 `<div class="reveal">` 中

## 13. Raw HTML（自訂 HTML 區塊）

**Markdown：**
```markdown
[html]
<div style="display:flex;gap:12px">
  <div style="flex:1;padding:16px;border:1px solid #ccc;border-radius:8px">
    <h3>左側面板</h3>
    <p>任何自訂 HTML 內容</p>
  </div>
  <div style="flex:1;padding:16px;border:1px solid #ccc;border-radius:8px">
    <h3>右側面板</h3>
    <p>包含完整的 CSS 樣式</p>
  </div>
</div>
[/html]
```

**HTML：**
```html
<iframe class="raw-html-frame" srcdoc="..." frameborder="0" scrolling="no"
  style="width:100%;border:none;overflow:hidden"
  onload="this.style.height=this.contentDocument.documentElement.scrollHeight+'px'">
</iframe>
```

規則：
- `[html]...[/html]` 包裹的內容會原封不動嵌入 `<iframe srcdoc>` 中
- CSS 完全隔離，不會影響外層課程頁面的樣式
- 內容可以是完整的 HTML 文件（含 `<!DOCTYPE html>`、`<style>` 等），也可以是 HTML 片段
- iframe 載入後自動調整高度以符合內容
- 內容裡的本地 `<img src="assets/…">` 與頁面上的圖片走同一套處理（build 把 srcdoc 解碼後改寫再編回去）：依 `--images` 內嵌 base64 或維持相對路徑，有較新的同名 `.webp` 就改用；不注入 `<base href>`，相對路徑以課程頁 URL 為基底；找不到的圖 build 會印「在 [html] 區塊內」的警告
- 適合需要獨立樣式的互動元件、對比圖表、自訂排版等場景

**外部檔案（`[html src="…"]`）：**
```markdown
[html src="diagram.html"]
```

- 單行語法、不需結束標籤；整行只能有這個標記
- `src` 路徑相對於課程目錄（`content.md` 所在資料夾）
- build 在解析前把檔案內容展開成 `[html]…[/html]`，之後與上面的 Raw HTML 完全相同
- 檔案不存在時印出警告並略過這一行（`build.mjs --check` 時為 `html-src-missing` 錯誤）

## 14. Lab Session（實作時間區塊）

**Markdown：**
```markdown
[lab-session title="🛠️ 實作時間" duration="15 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 設定你的第一個 Agent Skill
- 執行 build 並確認 HTML 正確輸出
[/lab-session]
```

**HTML：**
```html
<div class="lab-session">
  <div class="lab-session__deco" aria-hidden="true">⚙</div>
  <div class="lab-session__inner">
    <h3 class="lab-session__title">🛠️ 實作時間</h3>
    <p class="lab-session__hint">有問題歡迎提出，你的問題可能是大家的問題</p>
    <div class="lab-session__duration">⏱ 15 分鐘</div>
  </div>
  <div class="lab-task-list">
    <div class="lab-task-item">
      <span class="lab-task-num">1</span>
      <span class="lab-task-text">設定你的第一個 Agent Skill</span>
    </div>
    <div class="lab-task-item">
      <span class="lab-task-num">2</span>
      <span class="lab-task-text">執行 build 並確認 HTML 正確輸出</span>
    </div>
  </div>
</div>
```

規則：
- `[lab-session]...[/lab-session]` 包裹整個實作區塊
- `title="..."` 為選填，預設 `🛠️ 實作時間`
- `duration="..."` 為選填，顯示帶 ⏱ 前綴的時間膠囊
- `hint="..."` 為選填，預設 `有問題歡迎提出，你的問題可能是大家的問題`
- `- item` 行作為任務清單，自動編號
- 整個區塊渲染為獨立的全螢幕 `<section class="lab-page">`
- 使用 `--accent2` 色系（金/橙），與 `[qa-session]` 的 `--accent` 視覺有所區分

## 14a. Download Card（範例檔下載按鈕）

**Markdown：**
```markdown
[download dir="brand-copywriting" label="下載「品牌文案」範例包" desc="品牌指南、產品資訊、文案案例（解壓即用）"]
```

**HTML：**
```html
<a class="download-card" href="assets/brand-copywriting.zip" download>
  <span class="download-card__icon" aria-hidden="true">⬇</span>
  <span class="download-card__body">
    <span class="download-card__label">下載「品牌文案」範例包</span>
    <span class="download-card__desc">品牌指南、產品資訊、文案案例（解壓即用）</span>
  </span>
  <span class="download-card__ext">ZIP</span>
</a>
```

規則：
- 單行語法，不需結束標籤；渲染為內容流中的一張可點擊下載卡片（非全螢幕）。
- `dir="..."`：對應 `<course-dir>/example/<dir>/`，build 時自動打包成 `assets/<dir>.zip`，按鈕連到此 zip。
- `file="..."`：要直接連既有檔案時用此參數取代 `dir`（例：`file="assets/handout.zip"`），副檔名不限。
- `dir` 與 `file` 都沒有時不輸出任何東西。
- `label="..."`：按鈕主文字（選填，預設取 `dir`，沒有 `dir` 時取 `file`）。`desc="..."`：下方小字說明（選填）。
- 右側 `.download-card__ext` 標籤依實際副檔名大寫顯示（`.zip`→`ZIP`、`.skill`→`SKILL`、`.pdf`→`PDF`），沒有副檔名顯示 `FILE`。
- 打包用 Node 內建 zlib 並設 UTF-8 檔名旗標，Mac／Windows 皆可直接解壓、不含 `__MACOSX`／`.DS_Store`。

## 14a-2. Feedback Dashboard（回饋儀表板：按鈕＋彈窗）

**Markdown：**
```markdown
[feedback title="上一堂課的回饋：9 位同仁怎麼說" btn="📊 上一堂課的回饋" desc="資料來源：成效問卷｜9 份回覆"]
stats:
- 8.9 小時 | 每週自評省下的時間
- 2.1 → 3.3 | 熟悉度（1–5 分）

compare: 每週花在各類工作的時間 | 訓練前 | 目前 | 小時
7 類工作合計：每人每週從 39.2 小時降到 19.7 小時
- 資料整理與分析 | 11.9 | 5.4

bars: 使用時遇到的困難（可複選） | 人 | 9
- 操作介面不熟悉 | 5

quotes: 同仁分享的實際案例
- 每月報表原本要逐筆核對，現在一個指令完成 | 財務部

changes: 這堂課怎麼回應你們的回饋 | 你們說 | 這堂課
- 操作介面不熟悉 → 每個功能都附操作截圖 | 使用時機
[/feedback]
```

**HTML（按鈕＋ build 時預先渲染的 `<template>`）：**
```html
<div class="feedback-wrap">
  <button class="feedback-btn" type="button" data-feedback-title="上一堂課的回饋：9 位同仁怎麼說">📊 上一堂課的回饋</button>
  <template class="feedback-tpl">
    <div class="fb">
      <p class="fb-desc">…</p>
      <section class="fb-panel fb-panel--stats">…</section>
      <section class="fb-panel fb-panel--compare">…</section>
      …
    </div>
  </template>
</div>
```

屬性：`title`＝彈窗標題（預設「課程回饋」）、`btn`＝按鈕文字（預設同 title）、`desc`＝彈窗頂端小字（資料來源）。

面板（以 `關鍵字: 標題 | 選項…` 開頭，後接 `- ` 項目；項目欄位以 `|` 分隔）：

| 面板 | 標題列選項 | 項目格式 | 呈現 |
|---|---|---|---|
| `stats:` | — | `- 數值 \| 說明 \| 補充（選填）` | KPI 數字磚；數值尾端文字（`小時`、`人`）自動縮小，數字部分超過 5 字（如 `2.1 → 3.3`）自動縮小字級 |
| `bars:` | `\| 單位 \| 最大值` | `- 名稱 \| 數值` | 橫向長條；最大值省略時取最大項 |
| `compare:` | `\| 前標籤 \| 後標籤 \| 單位` | `- 名稱 \| 前 \| 後` | 前後對比雙長條＋自動算變化 %（前值為 0 時不顯示 %） |
| `quotes:` | — | `- 引言 \| 出處（選填）` | 引言卡片 |
| `changes:` | `\| 左標籤 \| 右標籤`（預設 回饋／調整） | `- 回饋 → 調整 \| 目標標題（選填）` | 「回饋 → 調整」對照卡；有目標標題時出現「前往段落 →」 |

規則：
- 面板內不是 `- ` 開頭的文字行 → 面板說明小字；第一個面板之前的文字行 → 彈窗開頭說明。
- `→` 也可寫成 `->`。
- 「前往段落」依**標題文字**比對（忽略空白與 emoji，先找完全相同、再找包含）：`#` 章節、`##` 小節、`###` 卡片皆可。點擊後關閉彈窗、捲到該段並高亮約 2.5 秒；目標在非作用中分頁時會先切換分頁。
- 圖表全部以 CSS 繪製（`--w` 寬度變數），跟隨主題色與深淺色模式；無外部依賴。
- 彈窗沿用 `[bonus]` 的 modal 外框（加寬至 920px；≤640px 全螢幕）。
- 簡報模式：彈窗可開啟（蓋在簡報上層），按 `Esc` 只關彈窗、不退出簡報；放在第一個 `#` 之前時，會自成一張置中的按鈕投影片。
- PDF 匯出：每個面板各自一頁。
- 資料若來自問卷，放上公開講義前請先去識別化（人名、客戶名、內部系統名）。

## 14b. Interactive Moment（說明會互動環節）

**Markdown：**
```markdown
[interactive title="開場 warm-up"]
前面分享了許多常見的翻車經驗，如果有身旁**看過類似經驗，可以在留言區「`+1`」**
也歡迎在聊天室**分享你看過最瞎的翻車現場**！
[/interactive]
```

**HTML：**
```html
<section class="interactive-page" id="...">
  <div class="interactive-session">
    <div class="interactive-session__deco" aria-hidden="true">💬</div>
    <div class="interactive-session__inner">
      <h3 class="interactive-session__title">翻車經驗分享</h3>
    </div>
    <div class="interactive-script">
      <div class="interactive-script__mark" aria-hidden="true">"</div>
      <div class="interactive-script__body">前面分享了許多常見的翻車經驗</div>
    </div>
  </div>
</section>
```

規則：
- `[interactive]...[/interactive]` 包裹整個互動區塊（用於說明會 / 直播的「停下來跟聽眾說話」場景，元件邏輯與 `lab-session` 類似但視覺語彙是對話而非任務）
- `title="..."` 為選填，預設 `💬 互動環節`，建議寫該次互動的主題（例：開場 warm-up、痛點打擊、翻車經驗分享）
- 區塊內文字作為**講師話術**呈現於下方引號卡片，保留換行；可使用 `**粗體**` `` `code` `` `[連結](url)` 等行內格式
- 連續以 `- ` 開頭的行渲染為條列（`<ul class="interactive-script__list">`，圓點使用 `--accent4`）；條列前後的空行由清單間距取代
- 渲染為獨立的全螢幕 `<section class="interactive-page">`，使用 `--accent4` 色系（藍紫），與 `lab-session`（金/橙任務感）視覺有所區分
- 互動「時機 / 對應段落 / 互動目的」屬於設計時的參考，不進元件；元件只呈現現場可用的標題與腳本

## 15. QA Session（問答區塊）

**Markdown（純提問畫面）：**
```markdown
[qa-session title="Q&A 時間"]
[/qa-session]
```

**Markdown（含預設問答）：**
```markdown
[qa-session title="常見問題"]
- Q: 這套工具適合初學者嗎？
  A: 完全適合，我們設計了引導式流程，不需要先懂程式。
- Q: 費用如何計算？
  A: 基本功能免費，進階功能採訂閱制，詳見官網。
[/qa-session]
```

**HTML：**
```html
<div class="qa-session">
  <div class="qa-session__deco" aria-hidden="true">?</div>
  <div class="qa-session__inner">
    <h3 class="qa-session__title">Q&amp;A 時間</h3>
    <p class="qa-session__hint">歡迎提問，一起深入探討</p>
  </div>
  <!-- 有 items 時才產生 .qa-list -->
  <div class="qa-list">
    <div class="qa-item">
      <button class="qa-question" aria-expanded="false" onclick="toggleQA(this)">
        <span class="qa-badge qa-badge--q">Q</span>
        <span class="qa-q-text">這套工具適合初學者嗎？</span>
        <svg class="qa-chevron" ...><!-- chevron icon --></svg>
      </button>
      <div class="qa-answer">
        <div class="qa-answer-inner">
          <span class="qa-badge qa-badge--a">A</span>
          <div class="qa-a-text">完全適合，我們設計了引導式流程...</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

規則：
- `[qa-session]...[/qa-session]` 包裹整個問答區塊
- `title="..."` 為選填，預設 `Q&A 時間`
- 每個問答項目以 `- Q: 問題` 開頭，下一行 `  A: 答案`（兩格縮排）
- 若無 Q&A 項目，只呈現全版視覺畫面（適合作為課程開放提問的場景佔位）
- 點擊問題按鈕展開/收合答案（accordion）
- 整個區塊由 `<section class="qa-page">` 包成獨立全螢幕頁面；舊版產物若仍在一般 `.section` 中，也會以 100vh/100dvh 呈現
- 完整支援深色/淺色模式與所有主題色切換

## 16. Survey（課程滿意度問卷區塊）

**Markdown：**
```markdown
[survey title="課程滿意度問卷" url="https://forms.gle/..." hint="您的意見是我們進步的動力" btn="填寫問卷"]
[/survey]
```

**HTML：**
```html
<div class="survey-session">
  <div class="survey-session__deco" aria-hidden="true">★</div>
  <div class="survey-session__inner">
    <h3 class="survey-session__title">課程滿意度問卷</h3>
    <p class="survey-session__hint">您的意見是我們進步的動力</p>
    <a class="survey-btn" href="https://forms.gle/..." target="_blank" rel="noopener">填寫問卷</a>
  </div>
</div>
```

規則：
- `[survey]...[/survey]` 包裹整個問卷區塊
- `title="..."` 為選填，預設 `課程滿意度問卷`
- `url="..."` 為選填，有值時顯示按鈕連結；無值時只顯示標題與提示
- `hint="..."` 為選填，預設 `您的意見是我們進步的動力`
- `btn="..."` 為選填，按鈕文字預設 `填寫問卷`
- 整個區塊包成獨立全螢幕 `<section class="survey-page">`
- 使用 `--accent3` → `--accent` 漸層色系，視覺上與 qa/lab 區塊有所區分

## 17. Branch Line（左側分支指示線）

在 `#`/`##`/`###` 標題尾端加上 ` | branch:NAME`：

```
# 建立功能 | branch:main
## 登入表單 | branch:feature/login
### 🔥 緊急修補 | branch:hotfix/csrf
## 合併收尾 | branch:none
```

branch tag 是插入在標題前的**真實內容流元件**；rail 容器只放各區段的線（彎出+竪線+彎入）：

```html
<!-- 內容流：tag 插在區段起點標題前（佔垂直空間、不疊加） -->
<a class="branch-flag branch-flag--feature" href="#sub-login" data-anchor="sub-login">feature/login</a>
<div class="sub-title" id="sub-login">登入表單</div>

<!-- rail（左側；每區段一段線，JS 連到對應 flag） -->
<div class="branch-line" id="branch-line">
  <div class="branch-seg branch-seg--feature" data-anchor="sub-login" data-end="sub-merge"
       data-endkind="branch" data-branch="feature/login"></div>
</div>
<div class="branch-tip" id="branch-tip"></div>
```

機制：
- `enterBranch()` 維護區段狀態並回填 `endAnchorId` 與 `endKind`（`branch`=切到新分支、`none`=回主線、`end`=延伸到內容結尾）。
- `buildBranchTags()` 輸出各區段的 rail 線 `.branch-seg`（帶 `data-anchor`/`data-end`/`data-endkind`/`data-branch`）；`branchFlag(anchorId)` 在區段起點標題（section-label / sub-title / 帶 branch 的 group-block）**前**插入真實的 `.branch-flag` tag。帶 branch token 的 `###` 卡片會額外生成 `id` 作為錨點。
- CSS：`.branch-seg` 用 `border-left`（竪線）+ `border-top`/`border-top-left-radius`（彎出）+ `border-bottom`/`border-bottom-left-radius`（彎入）；`data-endkind="none"|"end"` 以 `::after` 在彎入末端加收尾圓點。`.branch-flag` 為 `display:block; width:fit-content; margin:5px 0`（真實佔位、上下各 5px、不疊加遮擋）；hover 只 `scale`（不變色、不出 tooltip）。tag 已脫離 rail，故 hover tag 不會觸發線變粗或 tooltip。
- `.branch-flag + .sub-title { margin-top:0 }`：tag 後若接自帶大上邊距的標題（sub-title 的 3.5rem），改由 tag 的 5px 決定間距，確保各層級一致。
- JS `layoutBranchRail()`（**非每幀**；load / resize / `fonts.ready` / `ResizeObserver(body)`）以 `offsetTop` 累加求**布局座標**（不受 reveal 進場動畫 transform 影響）：`left =` 內容框左緣 − 20px、`top =` 對應 `.branch-flag` 的中線（分叉點在 tag 中間）、`bottom =` 下一區段 flag 中線（彎出相接）／結束標題上方／footer。`.branch-line` 為 `position:absolute`，隨內容自然捲動、不需每幀重算。
- hover 線本體時於游標處顯示 `.branch-tip`（fixed，內容取 `data-branch`）。
- **只有設了 branch 的區段才畫線**；主線與 `branch:none` 之後不畫線。
- **sticky 繼承**：標記持續沿用到後續標題，直到新的 `branch:xxx` 或 `branch:none`（回主線）。
- **空值**：`| branch:` 後面沒寫分支名時，標記照樣從標題剝掉、視同沒有標記（沿用目前的分支狀態）；lint `branch-empty`（info）提醒補分支名或改寫 `branch:none`。
- **配色 key**（`branchColorKey()`，取分支名 `/` 前第一段）：`main`/`master`→綠、`develop`/`dev`→藍、`feature`/`feat`→紫、`release`→青、`hotfix`/`fix`/`bugfix`→橘，其餘→灰；rail 經 `.branch-seg--KEY`、tag 經 `.branch-flag--KEY` 設 `--seg-color`。
- TOC 不受影響；無任何 branch 區段時 JS 將 `.branch-line` `display:none`。
- OG（`?og=1`）、簡報、列印模式下隱藏。

## 17b. Tool Tabs（工具分頁）

在 `##` 或 `###` 標題**開頭**加 `[工具名] `，連續帶標記的同層級標題組成一個分頁群組：

```
## [ChatGPT] 用 ChatGPT 生成圖片
## [ChatGPT] ChatGPT 的延伸主題   ← 連續同名 → 合併同一 pane
## [Gemini] 用 Nano Banana 生成圖片
## 共通小節                        ← 未標記 → 結束群組
```

**自訂顏色**：在 label 後加 `|color` 手動指定顏色（`## [Label|color]`），可選 `red`／`orange`／`green`／`blue`／`purple` 五色；不加則沿用品牌自動配色。適合方案比較（方案 A／B／C、Before／After）等非工具情境。

**視覺形式**：`##` 級渲染為資料夾式分頁列（`.tab-bar--sub`，未選為純文字頁籤）；`###` 級渲染為卡片式頁籤（`.tab-bar--card`），坐在下方內容面板上緣——面板的上邊框從非作用中頁籤下方連續透出，作用中頁籤以工具色底線壓過、與面板連成一體。

```
### [方案 A|red] 紅色分頁
### [方案 B|blue] 藍色分頁
### [Notion|purple] 未知工具也能自由指定顏色
```

```html
<!-- 群組起點：分頁列（隨內容捲動，不 sticky；wrapper 帶 .tab-bar-wrap；進場動畫規則見下方「進場動畫」） -->
<div class="reveal tab-bar-wrap">
  <div class="tab-bar" role="tablist" data-tabgroup="tabs-1">
    <button class="tab-btn tab-btn--chatgpt is-active" role="tab" aria-selected="true"
            data-tabgroup="tabs-1" data-pane="0">ChatGPT</button>
    <button class="tab-btn tab-btn--gemini" role="tab" aria-selected="false"
            data-tabgroup="tabs-1" data-pane="1">Gemini</button>
  </div>
</div>

<!-- pane 內每個 block 的 reveal wrapper（結構保持扁平，不包大容器）-->
<div class="reveal tab-pane-el tab-pane-active" data-tabgroup="tabs-1" data-tabpane="0">
  <div class="sub-title" id="sub-...">用 ChatGPT 生成圖片
    <span class="tab-pane-tag tab-pane-tag--chatgpt">ChatGPT</span> <!-- 網頁隱藏；列印/簡報顯示 -->
  </div>
</div>
```

機制：
- parser（`parse.mjs` 的 `extractTab()` ＋ `assignTabGroups()` 後處理）：掃描 section.blocks 中連續帶 `tab` 的 `sub-title`／`card` run，起點插入 `{type:'tab-bar'}`，pane 內每個 block 標 `tabGroup`/`tabPane`；連續同名合併同一 pane。
- **結構保持扁平**：不建巢狀容器，改以 reveal wrapper／全版 `<section>`（lab/qa 等落在 pane 內時）掛 `data-tabgroup`/`data-tabpane` 與 `.tab-pane-el`；pane 0 預設 `.tab-pane-active`，其餘由 CSS `display:none` 隱藏——PDF 匯出與簡報模式的「逐 reveal child」管線因此照常運作。
- `groupBlocks()` 會把 card 的 tab 資訊傳遞到 group block；group children 收集遇到 `tab-bar` 即中止（避免吞掉分頁列）。
- **配色 key**（`resolveTabKey()`）：`[Label|color]` 有指定且合法時用指定色（`red`/`orange`/`green`/`blue`/`purple`，見 `TAB_COLORS`）；否則走 `tabColorKey()` 品牌自動配色：`chatgpt`/`gpt`/`openai`→綠 #10a37f、`gemini`/`google`→藍 #4285f4、`claude`/`anthropic`→珊瑚橘 #d97757，其餘 `default`→主題 accent。經 `.tab-btn--KEY` 與 `.tab-pane-tag--KEY` 設 `--tab-color`/`--tab-rgb`。
- JS（`activateTabPane()`）：切換同群組各元素的 `.tab-pane-active`；新顯示的 reveal 直接補 `visible`（隱藏期間 IntersectionObserver 不會觸發）；`syncHiddenTabSections()` 隱藏「內容全在非作用中 pane」的 section 與其前置 divider。若 `###` 分頁跨過 lab／qa 等全版區塊而落到新的 `.section`，會替目前作用中的後續 pane 加上 joined class，移除前後 section padding 與中間 divider，避免第二、三個 tab 出現大空隙。
- **進場動畫**：`##` 級分頁列（`.tab-bar-wrap--sub`）停用 reveal（`opacity:1 !important`＋子元素 `transform:none`），獨立分頁列一開始就可見；`###` 級（`--card`）因頁籤與面板邊框相連，保留 reveal 並由 app.js 把分頁列 wrapper 與作用中 pane 的第一個 `.tab-pane-el` 雙向配對（`__revealBuddy`）——IntersectionObserver 觸發任一方時兩者同影格加 `visible`，共用同一組 transition 完全同步，避免頁籤先現身、面板才滑入的割裂感。
- 錨點防呆：TOC 點擊／hashchange／載入帶 hash 時，先 `revealTabPaneFor(el)` 切到目標所屬 pane 再捲動；scroll-spy（`updateToc`）以 `getClientRects().length` 略過隱藏錨點。
- **TOC 收合**（`assignTabGroups()` 尾端）：`##` 級群組內全部小節同名（剝除 `[工具名]` 後 `stripInlineMarkdown` 相同）→ `section.subs` 只留一筆、錨點改指到分頁列（tab-bar 掛 `id`，`tabs-<slug>`；build.mjs 一併收進 `ALL_ANCHOR_IDS`）。分頁列永遠可見 → 點擊只捲動、不切換使用者選中的分頁；scroll-spy 的「最近前一個 TOC 錨點」規則把群組內所有 pane 錨點映回這一筆。部分同名 → 去重但保留相異條目、錨點不改；各 pane 標題原有 `#sub-…` id 一律保留（深連結不受影響）。
- 列印（PDF）與簡報模式：`#print-slides`/`#pres-deck` 內強制展開所有 pane、隱藏 `.tab-bar`、顯示 `.tab-pane-tag` chip（展開規則不能只放 `@media print`——greedy packer 在螢幕上量測時就需要 pane 可見）；兩條管線的 walk 都會跳過 tab-bar 的 reveal。
- 單一 pane 的群組照樣顯示分頁列（作為工具標示，結構就緒、之後加工具即成多分頁）。
- pane 內的全版區塊（qa/lab/survey/interactive）：parser 會把 pane 的 label／配色 key 補到 block 上（`assignTabGroups()`），render 時標題內嵌 `.tab-pane-tag` chip——網頁隱藏、列印／簡報顯示。
- 限制：label 不可含 `|`（`split('|')` 保留給顏色）；分頁不可巢狀（`###` tab 落在 `##` pane 內會被收進該 pane，不會形成第二層 tab-bar）。
- 簡報模式：進入時的起始定位會跳過隱藏 pane 的錨點（`getClientRects().length` 過濾）；每張 slide 記住來源 pane（`stampPaneRef()`），退出時先 `activateTabPane()` 還原再捲動。

## 18. Share QR Code（分享 QR Code）

非 Markdown 區塊，**由 config 自動觸發**：`config.yaml` 的 `seo.url` 有值（或 build 由 GitHub Pages 自動推導出 url）時生成；為空則整顆按鈕隱藏。

**Config 觸發：**
```yaml
seo:
  url: "https://yourdomain.com/<course-dir>/"   # 有值才生成 QR
```

**HTML（設定面板入口按鈕 + 全螢幕 Modal）：**
```html
<!-- 設定面板內的入口按鈕 -->
<button class="settings-export-btn" id="qr-code-btn">🔗 顯示 QRCode</button>

<!-- QRCode Modal：{{QR_SVG}} = 內嵌 SVG QR、{{QR_URL}} = seo.url -->
<div class="qr-overlay" id="qr-overlay">
  <div class="qr-modal">
    <button class="qr-modal-close" id="qr-modal-close" aria-label="關閉">✕</button>
    <h3>掃描獲得線上講義</h3>
    <div class="qr-code-box" id="qr-code-box">{{QR_SVG}}</div>
    <a class="qr-url" id="qr-url" href="{{QR_URL}}" target="_blank" rel="noopener">{{QR_URL}}</a>
  </div>
</div>
```

機制：
- `qrSvg(url)`（`build.mjs`）用內建的 `scripts/qrcode-vendor.cjs`（QR Code Generator，MIT，build 時以 `createRequire` 載入、零外部依賴）將網址編成模組陣列，逐格輸出 `<rect>` 組成 `shape-rendering="crispEdges"` 的純黑白 `<svg>`（含 2 模組白邊），注入 `{{QR_SVG}}`；`{{QR_URL}}` 為 `seo.url`。
- url 來源：`seo.url` →（未設時）`detectGitHubPagesBase()` 推導的 `<ghPagesBase>/<coursePath>/`；兩者皆無 → 不生成（`{{QR_SVG}}` / `{{QR_URL}}` 留空）。
- JS：QR box 內無 `svg` 時把 `#qr-code-btn` `display:none`（url 為空的情況）。點按鈕開 overlay（順手收起設定面板）；關閉方式為點遮罩、右上 ✕、或 `Esc`。
- CSS：overlay 為 `position:fixed; inset:0` 半透明遮罩，modal 內 QR 以 `min(58vh,80vw)` 等比置中放大，手機（≤700px）撐滿全螢幕；列印模式 `@media print` 隱藏 overlay。

## 19. Inline Elements

| Markdown | HTML | 說明 |
|---|---|---|
| `**bold**` | `<strong>` | 粗體 |
| `` `code` `` | `<code>` | 行內程式碼 |
| `[text](url)` | `<a href="url">text</a>` | 連結 |
| `[[標籤]]`／`[[orange:標籤]]` | `<span class="inline-tag orange">標籤</span>` | 行內小徽章。無色時為中性灰；可指定 `red`／`green`／`orange`／`purple`／`blue`。表格儲存格、卡片列點、段落都能用（例：功能比較表標「付費」「免費」） |
| 一般段落 | `<p>` | card 或 section 內的段落 |

- 反引號優先：`` `…` `` 內的 `**`、`[[…]]`、圖片、連結與網址都不轉換、照字面顯示（例：`` `**/*.md` `` 不會變粗體）。反引號內的 `<`、`&` 也會自動跳脫、照字面顯示（例：`` `成本 < 1 元` ``）；反引號外的 `<` 才要寫 `&lt;`（lint `bare-lt`）。
- `**` 要成對（反引號內的不算），落單的會原樣顯示星號（lint `unclosed-bold`）。

## 20. Wrapping Rules

- 每個獨立元件都包在 `<div class="reveal">` 中以啟動滾動動畫
- 連續的 card + prompt-block 可以在同一個 reveal wrapper 中
- insight box 通常獨立一個 reveal wrapper

## Social Link SVG Icons

用於 instructor section 和 footer 的社群連結 icon：

| Platform | SVG |
|---|---|
| Medium | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42S14.2 15.54 14.2 12s1.51-6.42 3.38-6.42 3.38 2.88 3.38 6.42zm2.94 0c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z"/></svg>` |
| Facebook | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` |
| Threads | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.287 3.263-.809.993-1.927 1.587-3.324 1.768-1.138.147-2.258-.058-3.15-.579-1.005-.586-1.65-1.524-1.818-2.638-.322-2.15.946-3.71 2.476-4.407.967-.44 2.164-.685 3.553-.731-.21-1.118-.658-1.905-1.348-2.365-.823-.548-1.943-.685-3.125-.61l-.145-2.118c1.508-.098 2.995.097 4.165.86 1.024.668 1.73 1.69 2.102 3.058.8-.065 1.559-.033 2.24.128 2.346.555 3.844 2.086 4.33 4.13.612 2.573-.134 5.46-2.392 7.35-1.895 1.588-4.258 2.392-7.028 2.392z"/></svg>` |
| YouTube | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` |
| GitHub | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>` |
| LinkedIn | `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` |
| Email | `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>` |
