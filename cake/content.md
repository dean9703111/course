# 前置需求：開始前請先確認環境已就緒
> 電腦需要安裝以下工具，才能往後續流程操作

## 必要工具安裝

- **[Git](https://git-scm.com/install/windows)** — 版本控制工具，用來追蹤每次改動
- **[GitHub 帳號](https://github.com)** — 雲端 Git 儲存庫，用來管理專案
- **[nvm](https://github.com/nvm-sh/nvm)** — Node.js 版本管理工具，方便切換
- **[Python](https://www.python.org/downloads/)** — Agent Skills 的 scripts 大部分使用 Python 撰寫 
- **[Cursor](https://cursor.com/)**、**[Antigravity](https://antigravity.google/)**、**[VSCode](https://code.visualstudio.com/)** — 安裝任一款程式碼編輯器（IDE）

```terminal [label="安裝 Node.js（透過 nvm）"]
nvm install --lts
nvm use --lts
node -v
```

## 課程範例 Repository

[下載 Repository](https://github.com/deancourse/cake-2026-build-with-ai.git) 後，可以跟著課程進度操作，裡面有事先安裝好的 Agent Skills（放在 `.agents` 資料夾下）

```terminal [label="Clone 課程 Repo"]
git clone git@github.com:deancourse/cake-2026-build-with-ai.git
cd cake-2026-build-with-ai
```

> **還沒設定 SSH Key？**
> 如果 clone 失敗，代表尚未設定 GitHub SSH 金鑰。
> 請參考 [GitHub 官方教學](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) 完成設定，或改用 HTTPS：`https://github.com/deancourse/cake-2026-build-with-ai.git`

## 設定 Agent Skills
> 第一次接觸的朋友，可以透過[這支影片深入了解](https://youtu.be/xe00zJEtuMo)

因為每個 AI Agent 的路徑不同，可以使用 [dotagents](https://github.com/iannuttall/dotagents) 來協助建立 symlinks。

```prompt [label="將 Agent Skills 同步到指定的 AI Agent"]
npx @iannuttall/dotagents
```

---

# 新專案：用 SDD 讓 AI 根據規格建立專案
> 規格驅動開發（Spec-Driven Development）— 讓 AI 不只寫程式，[還幫你建立完善的規格文件](https://youtu.be/FeQv7mngg6Q)

## OpenSpec 初始化

> **為什麼需要 OpenSpec？**
> 
> - AI 寫程式越來越快，但專案越改越亂，甚至越改越壞
> - 關鍵人物離職，沒有文件，系統知識直接斷層
> - 解法：白話文對話 → AI 自動建立規格文件 → 根據規格驅動開發

### 📦 安裝與初始化
- 選擇使用的 AI 工具（ex: Claude Code）
- 產生 `.claude` 的 Agent Skills

```terminal [label="安裝指令"]
npm install -g @fission-ai/openspec@latest
openspec init
```

### ⚡ Skills 與 Commands
- **Skills** — AI 在對話過程中自動觸發的技能包，不需要背指令
- **Commands** — 用 `/opsx` 前綴強制驅動：apply / archive / explore / propose
- 可透過 `openspec config profile` 擴充更多 workflows

```prompt [label="查看 Skill"]
我想知道 openspec 目前安裝的 skill 用途
請使用表格呈現，用白話簡短描述
```

## 從零建立專案

### 🎯 Prompt 設計三要素

[flow]
1. 專案目標 — 大方向描述需求，AI 會釐清細節
2. 使用技術 — 指定使用技術，便於團隊接手
3. 細節討論 — 提醒 AI 主動提問，釐清模糊需求
[/flow]

> 使用「Plan Mode」，並請 AI 與自己釐清細節會得到更好的結果；下面 Prompt 是讓大家快速體驗完整流程

```prompt [label="建立 MVP 系統"]
設計車輛管理系統，包含以下功能：
- 登入頁面（帳號密碼驗證，區分管理者與一般使用者）
- 首頁儀表板（上方顯示關鍵數據卡片，下面顯示資料圖表）
- 車輛管理頁（可檢視、新增、編輯、刪除車輛資料）
- 員工管理頁（僅管理者可檢視、新增、編輯、刪除員工資料）

前端使用 React + Vite8，使用 MSW Mock API 模擬後端回應
參考 openspec 的 skill 執行，以最小可行性方案來規劃
```

### 📋 OpenSpec 自動建立規格文件

[flow]
1. proposal.md — 確認目標與範圍
2. design.md — 技術選型與風險評估
3. specs/ — 按功能分類的詳細規格
4. task.md — 任務清單，完成自動打勾
[/flow]

```prompt [label="開始實作"]
開始實作
```

### 🚀 啟動專案進行歸檔

第一次啟動可以請 AI 幫忙，因為 AI 有很高的機率在第一版遇到零星錯誤

```prompt [label="讓 AI 協助啟動"]
請幫我啟動專案
```

如果覺得外觀太過慘烈，可以讓 AI 參考 [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 修正一下

```prompt [label="讓 AI 協助啟動"]
參考 UI/UX SKill 美化頁面
```

初步確認功能符合預期後，請他將變更歸檔

```prompt [label="歸檔"]
功能符合預期，進行歸檔
```

> **AI 正在改變企業決策**
> 過去出缺勤、考核這類內部系統，企業通常找廠商購買、支付年費維護。但 Vibe Coding 的出現正讓企業做出不同的選擇。
>
> 有些企業導入 Vibe Coding 的目標不是取代工程師，而是讓熟悉業務的人有能力設計出符合使用需求的產品原型，再交給工程師做優化與維護。
>
> 用 OpenSpec 建立規格文件 — 就是讓這個交接過程有據可循，而不是一團無文件的程式碼丟過去。

## 建立專案規則

### 📐 生成 CLAUDE、OpenSpec 專案參考規則

**CLAUDE.md** 是給「做事」用的，**openspec/config.yaml** 是給「規劃」用的

```prompt [label="初始化規則"]
/init
```

```prompt [label="OpenSpec 設定"]
Please read openspec/config.yaml and help me fill it out
with details about my project, tech stack, and conventions
```

### 🗂️ 設計 README.md、.gitignore 並加入版控

初版完成後，要加入版控；未來更新時，才會清楚 AI 到底改了哪些細節

```prompt [label="設計 .gitignore、README.md"]
請幫我設計專案的「.gitignore」但「.claude、openspec」要加入版本控制
並且將「專案簡介與啟動方式」寫入 README.md
```

> 先使用內建的 AI 來 Generate Commit，Commit 後將變更 Sync Changes 更新上去

---

# 舊專案：根據情境設計 Skills，讓 AI 有執行依據
> 最難的不是 0 到 1，而是 1 到 100；透過 Skills 設計，讓 AI 在迭代功能、版本控制、Code Review 都有規範可循

## OpenSpec 迭代

### ✨ 用 OpenSpec 新增新功能

```prompt [label="新增功能"]
增加使用者紀錄頁面，供管理者查看
使用 OpenSpec
```

```prompt [label="確認後實作"]
開始實作
```

> **為什麼 1 到 100 比 0 到 1 更難？**
> 如果沒有規格文件，下次改功能時 AI 不知道之前的設計邏輯，可能把同一個功能重複寫好幾次，或改 A 壞 B。
>
> 用 OpenSpec 每次迭代都會在 Source Control 留下規格變更，AI 跟人類都有文件可以參考。關鍵人物離職最痛的不是少了一個人，而是系統知識直接斷層。

```prompt [label="歸檔變更"]
幫我歸檔
```

**Tips**: 不是所有事情都需要觸發 OpenSpec，向 branch 命名直接讓 AI 想就好

```prompt [label="新增分支"]
分析目前的變更內容，依照 camelCase 命名規則生成 feature branch 名稱，並建立與 checkout 該 branch
```

## 設定 Commit Skill
> 根據需求建立 Agent Skills，能實際給予幫助的，才是好的 Skill

### 📝 為什麼需要 Commit Skill？
- 分析變更的檔案 → 判斷應拆成幾個 commit → 分段提交
- 不同功能的修改分開 commit，讓邏輯可被追蹤
- 保持好習慣：每做完一件事就 commit，不要多功能混一起

[tags]
- [orange] 人工手打：耗時且風格不一致
- [purple] AI 自動生成：長短隨機、中英混雜
- [green] 解法：git-smart-commit Skill
[/tags]

```prompt [label="拆分 Commit"]
新增 commit
```

## 設定 PR Skill

### 🔀 git-pr-description Skill

- 比對當前分支與目標分支的差異
- 讀取 commit 訊息與變更檔案
- 參考 `pr-template` 生成 Title 與 Description

```prompt [label="生成 PR"]
撰寫 PR，與 main branch 比對
```

> **人，才是 AI 的瓶頸**
> Code Review 的速度已經跟不上 AI 寫程式的速度。當人成為 AI 的瓶頸時，要去想的是如何降低門檻，而不是放棄審核。
>
> 每個功能單獨驗證，Code Review 時只需專注一件事。雖然每一步都是 AI 在執行，但如果沒有業界經驗，其實不知道怎麼串起這些工具。**真正值錢的不是工具本身，而是知道什麼時候用、怎麼組合。**

---

# 導入測試：讓維護與擴充更有底氣
> 市場不會為爛產品買單；加入自動化測試，是 Vibe Coding 從玩具走向產品的關鍵

### 🛡️ 為什麼 Vibe Coding 一定要測試？

[flow]
1. 穩定性 — 請 AI 修 bug，結果舊功能壞掉
2. 複雜度 — 功能越多，人工測試越不可能覆蓋全部
3. 擴充性 — 功能間有相依性，修改可能引發連鎖影響
[/flow]

> 不寫測試才浪費時間 — 測試讓你敢大膽修改，遇錯快速定位

## 建立適合專案的測試工作流

### 🔄 測試撰寫流程

[flow]
1. 建立資料夾 — 存放測試清單
2. AI 撰寫清單 — 類型、說明、輸入、期待輸出
3. 人類 Review — 確認情境有無遺漏
4. AI 撰寫測試 — 描述與文件一致
5. 自主驗證 — 最多嘗試 5 次
[/flow]

下面以 command 指令形式強制觸發任務

```prompt [label="生成測試案例"]
/Gen Test Cases 
（拖入要測試的檔案，ex: src/pages/LoginPage.tsx）
```

> **從玩具到產品，差的就是測試**
> 很多時候 AI 只是修好了眼前的錯誤，但過程中改壞了過去的邏輯。千萬不要嫌寫測試浪費時間，測試其實是在幫你加速開發。
>
> 現在有 AI 了，你不用自己寫測試程式，只要審核 AI 給的測試情境是否有遺漏就好。

### 💡 實務建議
- 不要一口氣生成所有測試，先放一個檔案確認結果符合預期
- 每個頁面/模組有獨立的測試程式，方便定位問題
- 測試案例會隨規格變更而調整，不可能一次到位

## GitHub Action 自動化

### 🔁 自動化測試流程
- 每次推送到 GitHub 都觸發測試
- 測試完畢生成覆蓋率報告
- 設定 Branch Protection Rule：測試通過才能合併到主分支（將 Require status checks to pass 打勾，然後輸入「test」）

測試覆蓋率不需追求 100%，重要的邏輯都要測試到。有了測試，規格書上的功能才能被真正驗證。

```prompt [label="自動化測試"]
我希望在 GitHub Action 加入自動化測試的流程
每一個分支將更新推送到 GitHub 都會觸發一次自動化測試
```

> **不可能掌握某個技能就變大師**
> 講師設計的教材是最佳體驗路徑，但換到自己的專案情境一定會遇到不一樣的問題。回去後不要只是複製指令，而是把流程搬到自己的專案試一遍。
>
> **學習 AI 不是搜集指令複製貼上，更重要的是了解應用情境後，透過實踐調整為適合自己的工作流。**


---

# 總結：今天的三大主軸

[summary]
- 🏗️ **新專案 — SDD** | OpenSpec: 讓 AI 產生完善文件後，用規格驅動開發，完成從零到一的步驟
- ⚙️ **舊專案 — Skills** | 設計 Commit / PR / Code Review Skills，讓 AI 在大型專案中有規範可循
- 🧪 **導入測試 — CI/CD** | 用指令（Command）驅動 AI 撰寫測試，搭配 GitHub Action 守住品質底線
[/summary]

[bonus title="🎁 幕後製作心得"]
這個課程網頁的製作，走過了一段從「結果不可控」到「完全掌控」的歷程。

1. **遇到痛點** — Vibe Coding 出來的網頁，調整內容都要改 HTML，非常不方便
2. **逆推結構** — 讓 AI 把現有網頁拆解，對應成一套可用 Markdown 撰寫的格式
3. **內容與版型分離** — 只需改 Markdown，自動套用對應版型，細節完全可控
4. **設計 Agent Skill** — 不是讓 AI 生成網頁，而是讓 AI 學會「這份 Markdown 怎麼寫」
5. **模板生成器思維** — AI 負責生成結構化內容，程式再把內容轉成最終網頁
[/bonus]
