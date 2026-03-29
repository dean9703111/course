# 環境篇：從零安裝開發工具

> 不管你有沒有程式背景，只要學會與 AI 對話的技巧，就能生成一套涵蓋前後端與資料庫的系統。

---

## 安裝開發工具

### 🛠️ 本課程需要的工具

- **Antigravity**（或 Cursor / VSCode）：AI 程式碼編輯器
- **Node.js**：專案運行環境，建議透過 NVM 安裝
- **Claude Code**：驅動 OpenSpec 的 AI Agent
- **OpenSpec**：規格驅動開發的核心工具
- **Docker**：標準化容器，解決資料庫環境問題

### ⚙️ 安裝 Node.js（透過 NVM）

```prompt [label="Mac 安裝 NVM"]
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

```prompt [label="Windows 請至 GitHub 下載 exe"]
https://github.com/coreybutler/nvm-windows/releases
```

```prompt [label="安裝最新 LTS 版本的 Node.js"]
nvm install --lts
```

### 🤖 安裝 Claude Code

Claude Code 可以透過終端機指令安裝，也可以在編輯器的 Extensions 搜尋「Claude Code」直接安裝外掛，對新手更為友善。

```prompt [label="macOS / Linux / WSL"]
curl -fsSL https://claude.ai/install.sh | bash
```

```prompt [label="Windows PowerShell"]
irm https://claude.ai/install.ps1 | iex
```

> **目前 Claude Code 僅付費版可使用**
> 登入後在對話框輸入 `/login` 進行授權，確認可以正常回覆後再繼續。

### 📦 安裝 OpenSpec

```prompt [label="全局安裝 OpenSpec"]
npm install -g @fission-ai/openspec@latest
```

透過 OpenSpec，你只要用白話的方式與 AI 對話，就能建立完善的規格。日後擴增功能時，人類和 AI 都有對應的文件可以參考——這可以避免用 AI 寫程式時，相同功能重複被寫好幾次的痛點。

### 🐳 安裝 Docker

到 Docker 官網根據作業系統下載安裝後即可使用，不需要特別註冊登入。

你可以把 Docker 想成一個「標準化的容器」——把專案需要的環境打包在裡面，不管 Mac 還是 Windows，打開就能跑，也方便未來多人維護專案。

---

# 初版篇：用 OpenSpec 從 0 到 1

> 最難的並不是 0 到 1，但有了 OpenSpec，這段路走得更穩。

---

## 初始化 OpenSpec 專案

### 🚀 openspec init 一鍵設定

建立一個空白的專案資料夾，開啟後在終端機執行：

```prompt [label="初始化 OpenSpec"]
openspec init
```

初始化時會詢問你使用哪些 AI 工具（可多選），選擇後會在專案目錄新增對應的資料夾，例如 `.claude`，裡面存放的是驅動 OpenSpec 功能的 **Agent Skills 技能包**。

> **Agent Skills 的核心價值**
> 你不需要背指令——當需求涉及專案的新增、修改、刪除等任務時，AI 會自動調用這些技能。這才更符合 Vibe Coding 的開發流程。

### 📋 OpenSpec 的四個核心指令

| 指令 | 用途 |
|------|------|
| `/opsx:explore` | 自由發想、調查問題、釐清需求 |
| `/opsx:propose` | 提案與架構設計 |
| `/opsx:apply` | 依照 tasks 實作程式碼 |
| `/opsx:archive` | 完成後歸檔與整理規範 |

## 設計第一版需求

### 💬 提示詞架構（以出缺勤系統為例）

```prompt [label="出缺勤系統初始需求"]
請設計一個出缺勤管理系統，員工可以透過此系統打卡上下班
權限分成管理者與一般使用者，管理者可以修改、新增/刪除使用者
新增使用者時，會發送 Email 給予登入密碼
員工可透過系統請假、申請加班，申請假單需要簽核流程，並且有年假、補休申請，代理人制度

前端使用 React，後端使用 Express，資料庫用 Postgres
希望透過 Docker 啟動，並且要包含 Postgres Admin 網頁
這是初步需求，我們可以透過討論釐清細節後，參考 openspec 的 skill 執行
```

提示詞分成三塊設計：

[flow]
1. 專案目標 — 描述系統功能，初始模糊沒關係，AI 會主動提問釐清細節
2. 使用技術 — 指定前後端與資料庫技術，若未來要交給工程師維護，一定要先確認技術棧
3. 細節討論 — 提醒 AI 透過討論完善規格，並觸發 OpenSpec 的 Skill
[/flow]

> **使用 Plan Mode 讓規劃更詳盡**
> 在對話框切換成 Plan Mode，AI 會先設計一份完整的實作規劃書，你可以瀏覽確認後再點 Yes 繼續執行。若想加速體驗，可在提示詞最後加上「以最小可行性方案來規劃」。

## OpenSpec 的規格文件結構

### 📁 自動生成的四份核心文件

[flow]
1. proposal.md — 確認目標是否正確、範圍是否合理
2. design.md — 說明技術選型的理由，以及可能遇到的風險與處理方案
3. specs 資料夾 — 根據功能區分資料夾，分別建立詳細的規格文件
4. task.md — 執行任務的驗收清單，完成後才打勾
[/flow]

確認規劃符合預期後，在對話窗說「開始實作」，AI 就會根據規格撰寫程式。

## 驗證初版、完成歸檔

### ✅ 請 AI 協助啟動專案

AI 完成初版後，建議請他協助啟動：

```prompt [label="請 AI 幫忙啟動專案"]
幫我啟動專案，我想在 Local 開發前後端程式
只有 Postgres 跟 Postgres Admin 用 Docker 啟動
如果根目錄 README.md 沒有操作步驟，請協助補充
```

> **第一版遇到 Bug 很正常**
> AI 有很高的機率在初版遇到零星錯誤，可以先讓他自我修正。確認功能大致符合預期後，再繼續下一步。

### 🏗️ 初版專案架構說明

- **frontend**：前端網頁畫面與操作邏輯
- **backend**：資料處理、與資料庫溝通
- **.env**：環境變數，存放資料庫帳密等隱私資訊，不可上傳版控
- **README.md**：專案簡介與 Local 開發步驟

確認功能符合預期後，告訴 AI 進行歸檔：

```prompt [label="歸檔初版"]
功能符合預期，進行歸檔
```

specs 資料夾下就會出現對應的規格文件，archives 也會記錄此次的歸檔版本。

## 完成初版後的兩個設定

### 📌 建立 CLAUDE.md 與 OpenSpec Config

初版完成後，在 Claude 對話窗輸入 `/init`，他會掃描專案結構，在根目錄建立 `CLAUDE.md`——這份文件每次對話開始時自動載入，幫助 Claude 了解這個專案的架構、技術與開發規則。

```prompt [label="讓 AI 填寫 OpenSpec 設定"]
Please read openspec/config.yaml and help me fill it out
with details about my project, tech stack, and conventions
```

- **CLAUDE.md**：告訴 AI 這個專案「怎麼做」
- **openspec/config.yaml**：告訴 OpenSpec「怎麼規劃」

---

# 版控篇：建立 Git，準備走向 1 到 N

> 初版完成後，立刻建立版本控制——這是讓 Vibe Coding 走遠的地基。

---

## 為什麼初版後要立刻建 Git

### ⚠️ 沒有版控的風險

- 每個指令都可能大幅改動專案程式
- AI 修改的結果未必是你要的，甚至會把正常功能改壞
- 沒有版控，就沒有辦法把改壞的內容救回來

> **這不只是壞習慣，而是實際的風險**
> 如果某次 AI 的修改讓系統壞掉，卻沒有版控，你只能從頭開始。

## 設定 .gitignore

```prompt [label="請 AI 設計 .gitignore"]
請幫我設計專案的「.gitignore」
但「.claude、openspec」要加入版本控制
```

[tags]
- [green] 必須加入版控：.claude、openspec、README.md
- [orange] 不可上傳：.env（有帳密等隱私資訊）
- [purple] 不需上傳：node_modules（套件可重新安裝）、dist（自動生成）
[/tags]

## 建立第一個 Commit，推送到 GitHub

[flow]
1. 點擊左側 Source Control → Initialize Repository
2. 點擊 Generate，讓 AI 根據變更內容產生 commit 訊息
3. 確認描述符合預期後點擊 Commit
4. 點擊 Sync Changes 上傳到 GitHub（第一次會詢問專案名稱）
5. 若不打算公開原始碼，選擇 Private 隱私模式
[/flow]

---

# 迭代篇：從 1 到 N 的功能開發流程

> 有了 OpenSpec 的規格、Git 的版控，每一次迭代都是有跡可循的進化。

---

## 迭代流程概覽

### 🔄 每次新增功能的完整循環

[flow]
1. 提出需求 → OpenSpec 透過討論釐清規格
2. 確認規格文件符合預期
3. 告訴 AI 開始實作
4. 驗證功能符合預期
5. 告訴 AI 歸檔，記錄此次變更
6. 建立 feature branch、拆分 Commit、生成 PR
[/flow]

這個循環是「1 到 N」的核心——每次迭代都有規格為依據，每次變更都可以被追蹤。

## STEP 1：提出需求，讓 OpenSpec 規格化

### 💬 以「忘打卡處理」功能為例

```prompt [label="提出新功能需求"]
幫我設計忘打卡的處理方案，讓規則彈性一點，使用 OpenSpec
```

AI 會主動提問釐清細節，然後建立：

- 需求變更的規格文件
- 技術設計說明
- 任務驗收清單（task.md）

> **先看規格，再執行**
> 由於有 Git，可以在 Source Control 中看到 AI 撰寫的規格變更。確認符合預期後再說「開始實作」，是保持品質的關鍵步驟。

## STEP 2：實作與驗證

### 🔍 確認功能符合預期

AI 完成調整後，若功能涉及後端與資料庫，建議先重啟服務再測試：

```prompt [label="重啟後端確認功能"]
請協助確認資料庫變更是否執行，並幫我重新啟動後端程式
```

如果測試時找不到新功能的入口，直接告訴 AI：

```prompt [label="找不到功能入口"]
我找不到使用忘打卡的地方
```

有疑問就直接問，遇到錯誤就描述錯誤，AI 會繼續協助修正。

## STEP 3：歸檔，記錄此次迭代

確認功能符合預期後，告訴 AI 歸檔：

```prompt [label="歸檔此次迭代"]
幫我歸檔
```

archive 裡面會多一個資料夾，放的就是這次的變更內容；specs 也會對應更新。

> **每次迭代都歸檔，是知識不斷層的基礎**
> 日後人員異動，下一個接手的人不管是人類還是 AI，都有完整的規格文件可以參考。

## STEP 4：Agent Skill 命名 Branch

### 🌿 為什麼每個功能要有獨立的 Branch？

把不同功能混在同一個 Branch 裡，Code Review 時看不出每個功能對應哪些檔案，審核的人一頭霧水，品質就此滑落。

`git-worktree-design` Skill 會自動完成以下動作：

[flow]
1. 確認目前分支狀況，以及是否有未提交的變更
2. 根據功能將需求拆成獨立的 feature branch，用表格預覽讓你確認
3. 依照命名規範建立 feature branch
4. 在 branch 中新增這個功能的 SPEC，確保 AI 開發方向一致
[/flow]

```prompt [label="觸發 Branch 命名"]
採用 feature branch，新增忘打卡處理功能
```

## STEP 5：Agent Skill 拆分 Commit

### 📦 一個 Commit 沒有意義

AI 輔助開發時，很可能一口氣改了很多檔案。如果全部放在一個 Commit，這個 Commit 跟沒寫一樣——未來發生問題時，無法追溯設計邏輯。

`git-smart-commit` Skill 會自動完成以下動作：

- 分析所有變更的檔案，判斷哪些屬於同一個邏輯單元
- 建議將變更拆成多個語意清晰的 Commit
- 以一致的語言、格式生成每個 Commit 的訊息

```prompt [label="觸發拆分 Commit"]
新增 commit
```

> **Commit 訊息的品質，決定未來維護的難度**
> 若今天任務是「新增多語系」，可能動到十幾個檔案；讓 Skill 幫你判斷哪些屬於同一邏輯、哪些應該分段，遠比人工判斷更有效率。

## STEP 6：Agent Skill 生成 PR

### 📋 好的 PR 讓 Code Review 變輕鬆

PR 是讓團隊成員理解「你到底做了什麼」的關鍵文件。如果隨便寫，審核的人通常也是隨意看看，直接讀程式碼去理解功能設計，實在太消耗腦力了。

`git-pr-description` Skill 會自動完成以下動作：

[flow]
1. 預設比對目標分支為 master（可自行調整為 main / develop）
2. 讀取差異的檔案與 Commit 訊息，分析變更內容
3. 根據 pr-template 範例生成 PR 標題與描述草稿
4. 描述中包含：變更摘要、測試案例、截圖建議
[/flow]

```prompt [label="觸發生成 PR 草稿"]
撰寫 PR
```

> **建議前端 PR 附上截圖**
> 附圖可以大幅減少 Code Review 者的認知負擔，同時也是你自己確認功能符合預期的過程。

## 合併後的收尾

### ✅ 完整迭代收尾流程

[flow]
1. 複製 AI 生成的 PR 草稿到 GitHub，人工確認後點擊 Merge
2. 回到主分支執行 git pull，確認合併後功能正常
3. 若出現合併衝突，建議回到本地編輯器解決，確認後再推送
4. 合併完成後移除 feature branch，避免分支過多管理困難
[/flow]

---

# 補充篇：讓系統更穩定的下一步

> 初版完成、功能持續迭代後，自動化測試是讓品質不崩潰的最後一道防線。

---

## 為什麼需要自動化測試？

### 🧪 Vibe Coding 的穩定性問題

[tags]
- [orange] 請 AI 修 Bug，舊功能被改壞
- [orange] 功能越來越多，人工測試越來越耗時
- [orange] 出問題時，不知道從哪個功能開始定位
[/tags]

這些問題在加入自動化測試後，都能得到改善。

> **加入測試，不代表專案無懈可擊**
> 但至少能守住專案的底線——確保每次修改都沒有破壞既有功能。

## 如何銜接自動化測試

### 🔗 與目前工作流的整合點

在完成功能歸檔、拆好 Commit、建立好 PR 之後，自動化測試是最後一道防線：

[flow]
1. 為每個功能頁面撰寫測試案例（可搭配 gen-test-cases Workflow）
2. 加入 GitHub Action，每次推送自動觸發測試
3. 在 GitHub Ruleset 設定「測試通過才能合併」
4. 每次完成 PR 後，可以下載測試覆蓋率報告
[/flow]

> **Code Review 的速度，已經跟不上 AI 寫程式的速度**
> 自動化測試不是選配，而是在 AI 加速開發後，讓品質底線不崩潰的必要投資。

[summary]
- 🛠️ **環境安裝** | Node.js + Claude Code + OpenSpec + Docker，一次到位
- 📋 **0 到 1 建置** | 白話提示詞 → AI 主動提問 → 規格確認 → 開始實作
- 🌿 **版控建立** | 初版完成後立刻建 Git，設定 .gitignore，保護隱私資訊
- 🔄 **1 到 N 迭代** | 需求 → OpenSpec 規格化 → 實作 → 驗證 → 歸檔，每次都有跡可循
- 🌿 **Branch 命名** | git-worktree-design Skill 確保功能獨立、Code Review 清晰
- 📦 **拆分 Commit** | git-smart-commit Skill 讓每個變更語意清晰、可追蹤
- 📋 **生成 PR** | git-pr-description Skill 讓協作資訊一致，降低 Code Review 負擔
- 🧪 **自動化測試** | 守住系統底線，讓 Vibe Coding 的成果從玩具走向產品
[/summary]
