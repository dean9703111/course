# 常見痛點：穩定性不足、難以維護、無法驗證

> 一句話 AI 就能生成有前端、後端、資料庫的系統，但...你敢用嗎？

## 不要讓 AI 的「快」，變成未來的「債」

### 😓 三大痛點

- **穩定性**：請 AI 解決目前的問題，改完後發現過去正常的功能被改壞了
- **複雜度**：功能持續增加，靠人工逐一確認流程，耗時又容易有遺漏
- **擴充性**：架構逐漸複雜後，任何修改都可能引發連鎖影響，出狀況時連問題都不知道如何定位

> **如果這些個問題能引起你的共鳴，恭喜你！**
> 這代表你已經進入了下一個階段，開始思考如何讓 Vibe Coding 的成果真正可靠。
> 其實在沒有 AI 的時代，這些問題就已經存在；**但 AI 寫程式速度太快，所以這些問題被加倍放大。**

> 不管是今天的分享，還是未來的課程；我要做的不是破壞你原有的工作流，而是告訴你 AI 在原有的工作流上能帶來哪些幫助

## 從網頁版 AI 轉為程式碼編輯器
> 網頁版的 AI 只能告訴你該怎麼做，AI Agent 能直接幫你完成工作

- 能閱讀更完整的上下文
- 可以執行指令（Python、Node、Command Line）
- 很棒的 RAG 工具（用白話文查詢）

> AI Agent 的能力：
> 不只是「問一句答一句」的聊天機器人，而是能理解你的任務脈絡、操作你的檔案、串接多個步驟，幫你從頭到尾把事情做完的 AI 助手。

---

# AI 時代下的迷思：不是「學習工具」，而是「解決痛點」

> **我以前也走過一段彎路。**  
> 我以為只要一直學新東西、解更難的題，就會被認可。但考試世界給我們一個假象：分數高，就代表你「做對了選擇」。  
> **在 AI 時代，很多問題並不需要你先學會一整門新技術；需要的是你願意把問題拆清楚、願意往深處想，而不是急著從別人手上抄一個通用答案。**  
> 因為在實務裡，答案往往無法通用：每間公司有自己的文化與限制，每個人也有自己的背景。你覺得理所當然的 Markdown，對另一群人可能是第一次接觸——**當知識的圍籬出現，我們要做的不是嘲笑，而是搭一座橋，讓彼此能一起把事情做完。**

## 工具間的差異沒有你想像的大

老實講，AI Agent 的差異，並沒有社群媒體上說的那麼誇張，對絕大多數的使用者而言，我們會使用到的就是下面 4 個：
- MCP: 首先 MCP 可以讓我們去使用其他工具的 API 來做事，這可以確保工具操作上的穩定性
- Rules: 這是給專案的規範，通常不會寫太多，因為會佔用到上下文的空間
- Commands: 接下來說到的 Commands 就像是遊戲中的「主動技能」，通常會設計成一個工作流，裡面涵蓋了多個 Skills，需要主動觸發
- Skills: AI 雖然有記憶功能，但他不一定會完整記住你的習慣、規範，所以 Skills 就派上用場了，你可以把自己日常工作中執行的任務的細節、技巧、判斷模式放進去，這樣 AI 遇到相關任務時，就會主動觸發

而上面提到的 MCP、Rules、Commands、Skills，其實每個工具都有

## 導入 AI 的真義：釐清責任，而不是堆疊 Agent

> **導入 AI，不代表工作只剩「叫 AI 做」。**  
> 把「AI 能做到的事」跟「人必須負責的判斷」分清楚，關係才會健康、結果才會穩。

我不迷信那種「終端機開一排、很多 Agent 平行跑」的炫技畫面——**能照順序做完、根本不需要解衝突的流程，硬拆成多 Agent，通常只是在浪費 Token 與管理成本。**（現實世界還有額度問題。）

你可以讓 Claude 呼叫 Codex 來解決問題。

**好的結果，不該靠暴力嘗試拼運氣；而是靠清楚的方向、可重複的工作流、以及人類在關鍵節點的決策。**

## 出現新名詞很焦慮

現在幾乎每天都有新的名詞出現，但這件事從 2022 年底，ChatGPT 剛出來的時候就已經是這樣了

面對新名詞，我自己會在三個面向判斷：
- 第一，讓子彈飛一下，看一個月後，這個名詞是否還是反覆被提到，如果是的話，代表確實有它的重要性，而且這時網路上的教學會比較完整
- 第二，看到底有多少使用人數，以及是否有人真的用這個技術，做出有意義的應用，因為目前看下來，有 9 成以上的名詞都是炒作
- 第三，再確認這個技術值得了解後，先看有「實戰」的教學影片；我希望大家記住一個觀念，技術好，不代表你需要學，適合自己，才是最重要的。

## 這堂課真正想講的核心：流程、誤解、與人機分工

我會分享很多 AI 應用技巧，但更重要的是：**它如何改善你「現在正在發生」的工作流**。

當你把流程改善之後，團隊通常會更快暴露出新的不足——可能是誤解、可能是規範缺口、可能是 Review 節奏跟不上。  
**這些不足不是失敗，而是下一輪優化的入口。** 我會用實務案例把整條鏈路講清楚：**哪些一定要人來決定，哪些可以放心交給 AI 去處理。**

---

# 前置作業：課程會用到的工具、技術

### 🛠️ 環境準備
- **[Git](https://git-scm.com/install/windows)** — 版本控制工具，用來追蹤每次改動
- **[GitHub 帳號](https://github.com)** — 雲端 Git 儲存庫，用來管理專案
- **[nvm](https://github.com/nvm-sh/nvm)** — Node.js 版本管理工具，方便切換
- **[Python](https://www.python.org/downloads/)** — Agent Skills 的 scripts 大部分使用 Python 撰寫
- **[Cursor](https://cursor.com/)**、**[Antigravity](https://antigravity.google/)**、**[VSCode](https://code.visualstudio.com/)** — 安裝任一款程式碼編輯器（IDE）
- **[Docker](https://www.docker.com/)** — 獲得一致的環境

### ⚙️ 認識 Rules / Commands / Skills

- **Rules** — 專案的規範，通常不會寫太多，因為會佔用到上下文的空間
- **Commands** — 像遊戲中的「主動技能」，通常會設計成一個工作流，涵蓋多個 Skills，需要主動觸發
- **Skills** — 把日常工作中執行任務的細節、技巧、判斷模式放進去，AI 遇到相關任務時會主動觸發

因為每個 AI Agent 的路徑不同，可以使用 [dotagents](https://github.com/dean9703111/dotagents) 來協助建立 symlinks。

```prompt [label="將 Agent Skills 同步到指定的 AI Agent"]
npx @dean9703111/dotagents
```

https://github.com/forrestchang/andrej-karpathy-skills/tree/main

## 透過 MCP 連結其他工具

讓 AI 使用其他工具的 API 來做事，確保工具操作上的穩定性

---

# 開發：如何導入工作流
> 了解 AI 可以在哪些環節加入，人類要在哪裡把關。

> **Work Smart 比 Work Hard 更值錢（尤其在 AI 之後）。**  
> 寫了多少行程式、多修幾個 bug，未必會自動轉成「對團隊的價值」；但如果你能把某個協作環節變順——讓大家少踩坑、少重工、少在無聊的事情上耗神——那通常會同時帶來 **Credit** 與 **可累積的職涯資本**。

## 上下文的重要性（Jira MCP）

### 📋 設定 MCP

許多公司都是使用 Jira 來管理任務執行狀況，並透過 Confluence 存放規格

- **Atlassian MCP** — 讀取 Jira Tickets 實作，透過 Confluence 驗證
- 讓 AI 能直接存取任務描述、驗收條件，不需要人工轉述

**安裝 Atlassian MCP**

```prompt [label="請 AI 幫你安裝 Atlassian MCP"]
幫我安裝 Atlassian MCP，並設定好 Jira 和 Confluence 的連線
```

安裝完成後，在 `.mcp.json` 會看到類似這樣的設定：

```json [label=".mcp.json"]
{
  "mcpServers": {
    "mcp-atlassian": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://your-domain.atlassian.net",
        "JIRA_USERNAME": "your@email.com",
        "JIRA_API_TOKEN": "your_api_token",
        "CONFLUENCE_URL": "https://your-domain.atlassian.net",
        "CONFLUENCE_USERNAME": "your@email.com",
        "CONFLUENCE_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

> API Token 在 [Atlassian 帳號設定](https://id.atlassian.com/manage-profile/security/api-tokens) 產生，記得加入 `.gitignore` 避免 token 外洩。

### 📐 設計專案的 Lint

**為什麼 AI 時代更需要 Lint？**

- 即使有 Rules 規範，但 AI 生成的格式（ex: 縮排、引號）可能每次都不一樣
- 沒有 Lint，可能重構時會產生很多無效的 Diff 分散 Review 的注意
- 有 Lint，AI 就算格式寫錯，commit 前就會被擋下來

**設定 Claude Code 的 Pre-commit Hook**

透過 Claude Code 的 `PreToolUse` hook，當 AI 嘗試執行 `git commit` 時，自動先跑 Lint 檢查。格式沒過就不讓 commit：

```json [label=".claude/settings.json"]
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git commit*)",
            "command": "npx eslint . --ext .js,.ts 2>&1 | tee /dev/stderr; exit ${PIPESTATUS[0]}",
            "statusMessage": "Running lint before commit..."
          }
        ]
      }
    ]
  }
}
```

這樣不管 AI 寫了什麼，commit 之前都會先過一關。

## 規格驅動開發（SDD）

### 🔧 為什麼需要 OpenSpec？

- AI 寫程式越來越快，但專案越改越亂，甚至越改越壞
- 關鍵人物離職，沒有文件，系統知識直接斷層
- 解法：白話文對話 → AI 自動建立規格文件 → 根據規格驅動開發

### 📦 安裝與初始化
- 選擇使用的 AI 工具（ex: Claude Code）
- 產生 `.claude` 的 Agent Skills

```terminal [label="安裝指令"]
npm install -g @fission-ai/openspec@latest
openspec init
```

> **補充：關於 Claude Code 小技巧**  
> 課程裡會帶到，但我不希望你把它當成唯一重點——**工具迭代太快**。我更在意你能不能 **分析問題**、能不能設計 **可遷移到下一個工具** 的協作方式與工作流。  
> 否則你上再多「工具課」，也很難長出真正可帶走的本質能力。

我們沒有背指令的必要性

```prompt [label="查看 Skill"]
我想知道 openspec 目前安裝的 skill 用途
請使用表格呈現，用白話簡短描述
```

### 📋 OpenSpec 如何建立文件規格

[flow]
1. proposal.md — 確認目標與範圍
2. design.md — 技術選型與風險評估
3. specs/ — 按功能分類的詳細規格
4. task.md — 任務清單，完成自動打勾
[/flow]

### 🎯 從零建立專案

Prompt 設計三要素：

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

```prompt [label="開始實作"]
開始實作
```

### 🚀 啟動專案進行歸檔

第一次啟動可以請 AI 幫忙，因為 AI 有很高的機率在第一版遇到零星錯誤

```prompt [label="讓 AI 協助啟動"]
請幫我啟動專案
```

如果覺得外觀太過慘烈，可以讓 AI 參考 [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 修正一下

```prompt [label="美化頁面"]
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

### 📐 建立專案規則

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

### ✨ 用 OpenSpec 迭代新功能

> **為什麼 1 到 100 比 0 到 1 更難？**
> 如果沒有規格文件，下次改功能時 AI 不知道之前的設計邏輯，可能把同一個功能重複寫好幾次，或改 A 壞 B。
>
> 用 OpenSpec 每次迭代都會在 Source Control 留下規格變更，AI 跟人類都有文件可以參考。關鍵人物離職最痛的不是少了一個人，而是系統知識直接斷層。

```prompt [label="新增功能"]
增加使用者紀錄頁面，供管理者查看
使用 OpenSpec
```

```prompt [label="確認後實作"]
開始實作
```

```prompt [label="歸檔變更"]
幫我歸檔
```

**Tips**: 不是所有事情都需要觸發 OpenSpec，像 branch 命名直接讓 AI 想就好

```prompt [label="新增分支"]
分析目前的變更內容，依照 camelCase 命名規則生成 feature branch 名稱，並建立與 checkout 該 branch
```

## 導入測試：讓維護與擴充更有底氣
> 市場不會為爛產品買單；加入自動化測試，是 Vibe Coding 從玩具走向產品的關鍵

### 🛡️ 為什麼 Vibe Coding 一定要測試？

[flow]
1. 穩定性 — 請 AI 修 bug，結果舊功能壞掉
2. 複雜度 — 功能越多，人工測試越不可能覆蓋全部
3. 擴充性 — 功能間有相依性，修改可能引發連鎖影響
[/flow]

> 不寫測試才浪費時間 — 測試讓你敢大膽修改，遇錯快速定位

### 🔄 建立適合專案的測試工作流

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
> 現在儘管有 AI 輔助撰寫測試程式，我們還是要仔細檢查 AI 給的測試情境是否合理、有遺漏。

### 💡 實務建議
- 不要一口氣生成所有測試，先放一個檔案確認結果符合預期
- 每個頁面/模組有獨立的測試程式，方便定位問題
- 測試案例會隨規格變更而調整，不可能一次到位

## 建立自動化測試（CI/CD）

### 🔁 自動化測試流程
- 每次推送到 GitHub 都觸發測試
- 測試完畢生成覆蓋率報告
- 設定 Branch Protection Rule（ex: protected-by-tests）：測試通過才能合併到主分支（將 Require status checks to pass 打勾，然後輸入「test」）

測試覆蓋率不需追求 100%，重要的邏輯都要測試到。有了測試，規格書上的功能才能被真正驗證。

```prompt [label="自動化測試"]
我希望在 GitHub Action 加入自動化測試的流程
每一個分支將更新推送到 GitHub 都會觸發一次自動化測試
```

## 拆分 Commit 讓變更可以被追蹤

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

## 設計 PR 讓 Code Review 更輕鬆

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
> 設計 Commit、PR 的 Skill 就是透過優化流程讓開發更順暢。雖然每一步都是 AI 在執行，但如果沒有實務經驗，其實不知道怎麼串起這些工具。**真正值錢的不是工具本身，而是知道什麼時候用、怎麼組合。**

## 透過 Git Worktree 提升協作效率

### 🌳 多 Agent 並行開發
- 不同功能使用不同 feature branch，搭配 Git Worktree 建立獨立工作區
- 每個 Worktree 可同時跑不同 dev server，讓多個 AI Agent 並行開發
- 設計 `git-worktree-design` Skill：一個指令拆分任務、建立 Worktree、安裝套件、新增 SPEC

```prompt [label="Worktree 並行開發"]
採用 Worktree，新增通知中心彈窗、資料匯出 CSV 功能、常見 QA 問答區
```

### ⚠️ Worktree 注意事項
- 合併時可能有衝突：各分支獨立開發，不知彼此變更
- 建議共用功能優先開發、主分支變更時其他 Worktree 先同步
- 設計好流程才能提升效率

---

## 我在公司怎麼推：用 Workshop 把「個人習慣」變成「團隊資產」

我在公司推動 **Cursor** 導入時，開過一場線上 Workshop：讓同事理解編輯器能帶來哪些幫助（**Rules、限制文件範圍、Code Review、生成 Test Cases** 等）。  
後來 **Agent Skills** 推出後，我又開了一場 Workshop，讓大家理解如何從公司 / 部門 / 專案層級設計 Skills；現在也維護一個共用的 **Agent Skills Repository**，依情境與層級取用。

我強調的一直不是「AI 讓我寫得多快」，而是：**哪些重複、無聊、但又會影響協作品質的事，值得交給 AI**——例如：

- 需求規格草稿、測試案例整理  
- Pull Request 描述、Commit 前 Code Review 的檢查清單  
- 分段 Commit 訊息、Branch 命名規範  

這些事很多人不擅長、也不想做，但它們會直接影響 **Review 效率** 與 **專案可維護性**。**既然人不想做，那就設計成 AI 能做、而且做得一致。**

> **在請 AI 幫忙生 PR 草稿之前，我早就先在 GitLab 用 Template 把「團隊要寫什麼」講清楚。**  
> AI 不是魔法；它更像加速器：**你先有協作意識與模板，AI 才有辦法把品質放大。**

還有一個很務實的例子：教育訓練影片整理。以前 3 小時的內容要整理成可用文件很痛苦；現在我會用 AI **自動轉 SRT**、再 **標註段落重點**。這種痛點常常「做起來不難，但一直沒人做」——**只要你做了，貢獻通常會被記得很久。**

### 「槍打出頭鳥怎麼辦？」

首先，我在課程裡分享的，多半是我已在職場驗證過的路線。  
其次，**方向如果真的走偏，組織通常會比你更急著修正**；而在很多團隊裡，願意站出來把流程推動起來的人反而稀缺——你反而更可能換到資源與關注，而不是被「默默消失」。

如果你公司有 **one-on-one**，那其實就是把課堂所學「每週拿去公司試錯與對齊」的最佳場景。  
多數公司都想導入 AI，但真的知道怎麼落地的人很少；**當你成為那個能把方法講清楚、把流程跑起來的人，話語權通常會跟著來。** 推動時也更有「名份」：你可以用主管／老闆在乎的語言，去換到時間、人力與制度上的支持。

---

## 被看見的方式：圍繞痛點，而不是圍繞你心裡的分數

很多人會委屈：「我很努力、最難的我也扛了，為什麼主管不提拔我？」  
很多時候不是你不夠強，而是 **你沒有把成果，翻成團隊聽得懂、也覺得重要的語言**。

**世界沒有義務認識你；世界只會記得你能帶來什麼改變。**  
所以除了 AI 技術本身，我也會談一件同樣現實的事：**怎麼用市場／組織能接受的敘事，把你的工作變成「可感知的價值」。**

> 我後來能接到不少企業內訓、也能開線上課、大家願意來聽分享——本質上靠的是 **口碑**。我自媒體經營超過 6 年、寫了超過 500 篇文章，也拍了很多 Vibe Coding 教學；**那些長期累積的「可被驗證的輸出」，最後才會變成別人願意給你的機會。**  
> 不管最後報名人數多少，我都會在能力範圍內把交付做到最好——**因為口碑這種東西，只會被作品與結果記住。**

如果你對更完整的實作路徑有興趣，歡迎報名線上課程。我是鼎淵，我們，下班有約。

> **賣課不丟人，賣沒價值的課才丟人。** 我也會用同一套標準要求自己的內容品質。

這堂課想帶你從不同視角去用 AI：**做出不同選擇、累積不同槓桿，最後就會拿到不同的成果。**

---

# 總結：

[summary]
- 🏗️ **痛點** | AI 寫程式很快，但穩定性不足、難以維護、無法驗證，這些問題在 AI 時代被加倍放大
- 🛠️ **前置作業** | 選對工具、理解 MCP / Rules / Commands / Skills 四大核心概念，打好協作基礎
- ⚙️ **開發工作流** | 用 SDD 規格驅動開發、設計 Commit / PR / Worktree Skills、導入測試與 CI/CD，讓流程可靠可追蹤
[/summary]

> **不可能掌握某個技能就變大師**
> 講師設計的教材是最佳體驗路徑，但換到自己的專案情境一定會遇到不一樣的問題。回去後不要只是複製指令，而是把流程搬到自己的專案試一遍。
>
> **學習 AI 不是搜集指令複製貼上，更重要的是了解應用情境後，透過實踐調整為適合自己的工作流。**

[bonus title="🎁 幕後製作心得"]
這個課程網頁的製作，走過了一段從「結果不可控」到「完全掌控」的歷程。

1. **遇到痛點** — Vibe Coding 出來的網頁，調整內容都要改 HTML，非常不方便
2. **逆推結構** — 讓 AI 把現有網頁拆解，對應成一套可用 Markdown 撰寫的格式
3. **內容與版型分離** — 只需改 Markdown，自動套用對應版型，細節完全可控
4. **設計 Agent Skill** — 不是讓 AI 生成網頁，而是讓 AI 學會「這份 Markdown 怎麼寫」
5. **模板生成器思維** — AI 負責生成結構化內容，程式再把內容轉成最終網頁
[/bonus]


---

# 直播優惠：輸入折扣碼

## 感謝參與今日直播

#### 結帳輸入「20260423」，享優惠價再折 1,000 元 ( 優惠只到 2026/4/23 23:59 )

| [填寫回饋問卷可取得直播回放](https://tibame.tw/OkOdq) | [報名 Claude AI 全端開發工作流](https://tibame.tw/Zmnts) |
| :---: | :---: |
| ![回饋問卷 QR Code](assets/問卷.jpg) | ![課程報名 QR Code](assets/報名.png) |
