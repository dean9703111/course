# 測試篇：為什麼自動化測試是 Vibe Coding 的必修課

---

## 你一定遇過這些問題

### 😓 三大痛點

- **穩定性**：請 AI 解決目前的問題，改完後發現過去正常的功能被改壞了
- **複雜度**：功能持續增加，靠人工逐一確認流程，耗時又容易有遺漏
- **擴充性**：架構逐漸複雜後，任何修改都可能引發連鎖影響，出狀況時連問題都不知道如何定位

> **如果這幾個問題能引起你的共鳴，恭喜你**
> 這代表你已經進入了下一個階段，開始思考如何讓 Vibe Coding 的成果真正可靠。

## 測試程式的設計流程

[flow]
1. 哪裡需要測試 — 透過實際案例了解系統設計的基礎概念，從前端網頁功能、後端 API 回覆、使用者權限等角度，說明測試的重要性
2. 生成測試程式 — 分享如何設計工作流讓 AI 撰寫測試程式，以及人類應該在哪些環節審核，避免重要功能沒有被測到
3. 加入 GitHub Action — 把測試加入 GitHub Action，每次更新專案都會自動化測試；限制只有測試通過才能合併到主分支，保證專案品質
4. 獲得測試報告 — 每次測試完成後獲得漂亮的測試報告，用來檢驗產品的穩定性
[/flow]

## 前置作業

> **參考資源**
> - 第一次接觸 Git 與 Node.js 的朋友，可以參考我[過去拍的影片複習](https://youtu.be/5DEV_K0JauQ)
> - 教學使用的工具為 Antigravity，設定與使用可以[參考這個影片](https://youtu.be/-FW5DgQEV0M)

### ‍💻 下載與啟動專案
我用 Vibe Coding 寫了一個有「登入頁、儀表板、管理後台、Mock API」的[前端專案](https://github.com/deancourse/vibe-coding-testing-practice) 讓大家一起練習


[flow]
1. 點擊 Fork，將專案複製到自己的帳號下
2. 點擊 Code，複製專案網址
3. 打開程式碼編輯器，點擊 `Clone Repository`，貼上網址並選擇下載路徑
4. 打開 `package.json`，確認 `dependencies` 與 `devDependencies` 中的套件
5. 打開終端機，輸入 `npm install` 安裝套件（安裝後會存放到 `node_modules` 資料夾）
6. 輸入 `npm run dev` 啟動專案，點擊網址即可瀏覽網頁
[/flow]

> **多了解專案的架構，Vibe Coding 可以走得更遠**
> 你也可以直接在 AI 對話視窗說「幫我安裝套件並啟動專案」來搞定一切，但理解專案結構會讓你受益更多。

## 從登入頁了解測試範圍

### 🔐 格式驗證（前端）

- 電子郵件格式錯誤時，有錯誤提示
- 密碼格式錯誤時，有對應的錯誤提示
- 格式正確時，才會呼叫後端 API

> **判斷是否有傳送到後端**
> 打開 F12（點擊滑鼠右鍵），選擇檢查，來開啟「開發人員工具」，可在「網路」的分頁瀏覽（Fetch/XHR）

### 🔌 API 回傳模擬（Mock API）

- 密碼錯誤時，有錯誤提示
- 帳號不存在時，有錯誤提示
- 登入成功後，有拿到 Token

> **前後端任務未必是並行**
> 這邊用 Mock Service Worker 來模擬後端，方便釐清錯誤方向

### 🛡️ 角色與權限

- 把資訊儲存在「應用程式 ⭢ 本機儲存空間 ⭢ localhost」下面的 msw_user_role
- 有 Token，才能呼叫後續 API；沒有 Token，直接導向登入頁
- 管理者才能看到「管理後台」；一般用戶看不到，也無法誤闖

> **寫測試不是浪費時間，是在加速開發**
> 有了測試，你才能更放心地新增與修改功能；遇到問題時也能快速定位，而不是一個個慢慢嘗試。

## 測試的重要性

### 📋 應涵蓋的測試情境
根據十幾年的開發經驗，寫測試其實是在加速開發；讓你更放心地新增與修改功能，遇到問題時也能快速定位。

[flow]
1. 登入功能 — 帳號密碼輸入、格式驗證、登入成功與失敗
2. API 回傳 — 各種回應狀態的處理（成功、錯誤、例外）
3. 角色權限 — 不同角色看到的畫面與可執行的操作
4. Token 驗證 — 有無 Token 時的存取控制與頁面導向
5. 介面差異 — 根據角色或狀態呈現不同的 UI 元素
[/flow]

### 🔄 為什麼 Vibe Coding 更需要測試

- Vibe Coding 經常修改流程、調整權限、變動 API
- 缺少測試案例，無法判斷這次修改是否影響其他功能
- 測試案例會隨規格變更與實際操作持續調整，不太可能一次到位
- 有了測試，需求規格的內容才能真正被驗證

> **前端驗證不等於安全**
> 前端做的格式驗證（如帳號格式、密碼格式），後端也不能少。
> 
> 知道 API 路徑的人可以直接用 Terminal（curl）繞過前端呼叫 API，這是設計上必須注意的細節。

---

# Workflow 篇：讓 AI 幫你寫測試

> 工作流讓 AI 根據明確步驟執行，產出可信、可追蹤的測試程式。

---

## Rule / Workflow / Skill 的差異

### 📋 三者使用場景

[flow]
1. Rule — 全場景適用的通用規範，每次對話都會自動載入
2. Workflow — 有明確步驟、需要主動用 `/` 觸發的工作流
3. Skill — 特定情境的專業技能包，AI 根據需求自行判斷使用
[/flow]

> **不建議把 Rule 寫太多**
> 每次開啟新對話，AI 都會讀取完整的 Rule 文件。過多的 Rule 不僅佔用上下文空間、浪費 Token，還可能因資訊過載導致 AI 忽略規則。

## gen-test-cases 工作流設計

### 📝 五步驟工作流

[flow]
1. STEP 1：建立 test 資料夾，存放 Markdown 格式的測試清單
2. STEP 2：AI 根據指定模板撰寫測試案例清單（測試類型、說明、範例輸入、期待輸出）
3. STEP 3：確認範圍符合預期後，AI 撰寫測試程式，描述與文件一致
4. STEP 4：AI 自主執行驗證，通過後回頭在文件內打勾
5. STEP 5：限制最多嘗試 5 次，避免 AI 在錯誤方向狂奔
[/flow]

### 💡 先文件、後程式的設計邏輯

- 先確認 AI 發想的測試情境是否有遺漏
- 確認後才讓 AI 開始撰寫程式
- 一口氣生成的話，如果結果不對，不但浪費時間還浪費 Token

> **建議每個頁面都有獨立的測試程式**
> 這樣日後修改遇到問題時，可以快速定位是哪個頁面的功能出了問題。

---

# CI/CD 篇：GitHub Action 自動化測試

> 測試加入 CI/CD 後，每次推送程式都會自動驗證，守住專案的最後一道防線。

---

## 先了解 Git Flow

### 🌿 分支策略基礎

- **main**：主分支，對外的穩定版本
- **develop**：開發分支，日常更新都推送到這裡
- 功能完善後，透過 **Pull Request** 合併到 main

> **為什麼需要分支策略？**
> 如果把邏輯錯誤或功能不完善的版本直接推送到主分支，產品就壞掉了。分支策略的目的，是保護對外服務的穩定性。

## 設定 GitHub Action

### ⚙️ 自動化測試指令

```prompt [label="請 AI 設定 GitHub Action"]
我希望在 GitHub Action 加入自動化測試的流程

每一個分支將更新推送到 GitHub 都會觸發一次自動化測試

測試完畢後，要生成覆蓋率報告讓我下載
```

### 📊 測試報告說明

- 成功是綠色勾勾，失敗是紅色叉叉
- Artifacts 區塊可下載測試覆蓋率報告
- 可了解哪些功能測試完整、哪些還需要補充

[tags]
- [green] 測試覆蓋率高的模組
- [orange] 覆蓋率不足，需補充測試
- [purple] 不需追求 100%，重要邏輯測到才是重點
[/tags]

## 用 Ruleset 保護主分支

### 🔒 GitHub Ruleset 設定步驟

[flow]
1. Settings → Rules → Ruleset → New branch ruleset
2. Target branch 選擇 main（預設主分支）
3. 勾選「Require a pull request before merging」
4. 勾選「Require status checks to pass」
5. 新增 Test 作為必須通過的檢查項目，儲存設定
[/flow]

> **設定完成後，只有測試通過的分支才能合併到主分支**
> 這是在多人協作時，保護專案品質不被破壞的基礎設計。

---

# Skills 篇：讓 AI 從庸才走向專家

> Skill 的出現，讓 AI 的價值可以持續累積。只要教會一次，他就永遠記得怎麼做。

---

## 什麼是 Agent Skill？

### 🎒 Skill 的結構

- **提示詞（Prompt）**：精心設計的指令
- **程式腳本（Scripts）**：可執行的自動化程式
- **參考資源（Reference）**：補充 AI 判斷所需的資料

### 🔍 Skill 的三個執行階段

[flow]
1. Discovery（發現）：AI 讀取技能名稱與描述，判斷是否與任務相關
2. Activation（啟動）：匹配成功後，才完整讀取整份 Skill 文件
3. Execution（執行）：根據文件描述逐步執行任務
[/flow]

> **Skill 為什麼能節省 Token？**
> Rule 每次都會讀完整文件；Skill 在匹配需求前只讀標題與描述。就像 Google 搜尋時先看標題摘要，確認相關再點進去。

## 安裝別人的 Skill

### 📦 各工具的 Skill 路徑

| 工具 | Project Skill 路徑 | Global Skill 路徑 |
|------|-------------------|------------------|
| Cursor | `.cursor/skills` | `~/.cursor/skills` |
| Claude | `.claude/skills` | `~/.claude/skills` |
| Codex | `.codex/skills` | `~/.codex/skills` |
| Antigravity | `.agent/skills` | `~/.gemini/antigravity/global_skills` |

### 🔗 Symlink：一份 Skill 多工具共用

```prompt [label="Mac 建立 Symlink"]
ln -s /path/to/shared/skills ~/.cursor/skills
```

單一來源管理，未來維護更方便，修改一次就能在所有工具中生效。

## 使用 Skill 的安全注意事項

### ⚠️ 安裝第三方 Skill 前，確認這三點

- **來源可信**：從信任的管道安裝，GitHub 上可參考 Star 數量初步判斷
- **Scripts 安全**：查看 `scripts` 目錄下有沒有危險操作（呼叫外部 URL、修改檔案、存取敏感資料）
- **SKILL.md 內容**：確認是否有敏感指令，例如把 `.env` 傳送到特定網址

[tags]
- [blue] 來源可信的官方 Skill
- [orange] 社群 Skill，建議先看 scripts
- [purple] 先在 Project 測試，確認再移到 Global
[/tags]

## 建立自己的 Skill

### 🛠️ 從對話萃取 Skill 的技巧

每次與 AI 協作解決問題後，不要急著關閉對話框，用這個指令彙整：

```prompt [label="萃取 Skill 提示詞"]
請將上方對話整理成以下內容，並在最後設計一個可以重現結果的提示詞：

1. 起初怎麼提問
2. 中間如何引導與調整
3. 最終是如何得出這個成果的
```

> **過去解決過的問題，不應該再花時間解決第二次**
> 這個技巧用得越久，你的 AI Agent 會越來越強大，成為別人難以跨越的護城河。

## Workflow + Skill 組合應用

### 🔄 以影音後期工作流為例

```prompt [label="audio-to-srt-cards Workflow"]
按照下面步驟執行

STEP 1: 使用「mp3-to-srt」的 Skill 將音檔轉成逐字稿
STEP 2: 使用「reference-cards」的 Skill 用逐字稿生成參考字卡
```

### 💡 組合設計的好處

- 每個 Skill 可以獨立維護與更新
- Workflow 只負責串接流程
- 整體架構更有彈性，1+1 大於 2

[summary]
- 🧪 **自動化測試** | 解決穩定性、複雜度、擴充性三大痛點，守住專案的底線
- 🔄 **Workflow 寫測試** | 先文件確認範圍，再讓 AI 撰寫程式，避免浪費 Token
- ⚙️ **GitHub Action** | 每次推送自動觸發測試，搭配 Ruleset 保護主分支
- 🎒 **Agent Skills** | 特定情境的技能包，教會一次永遠記得，持續累積 AI 的價值
- 🔗 **Workflow + Skill** | 組合應用讓複雜流程穩定可重複，成為你的競爭護城河
[/summary]
