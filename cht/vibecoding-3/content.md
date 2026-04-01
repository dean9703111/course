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
4. 打開終端機，輸入 `npm install` 安裝套件（安裝後會存放到 `node_modules` 資料夾）
5. 輸入 `npm run dev` 啟動專案，點擊網址即可瀏覽網頁
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
> 這邊用 Mock Service Worker 來模擬後端（右下角按鈕可模擬不同 API 情境），方便釐清錯誤方向

### 🛡️ 角色與權限

- 把資訊儲存在「應用程式 ⭢ 本機儲存空間 ⭢ localhost」下面的 msw_user_role
- 有 Token（auth_token），才能呼叫後續 API；沒有 Token，直接導向登入頁
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
> 知道 API 路徑的人可以繞過前端呼叫 API（ex: Postman、Curl），這是設計上必須注意的細節。

---

# Workflow 篇：讓 AI 幫你寫測試

> 工作流讓 AI 根據明確步驟執行，產出可信、可追蹤的測試程式（部分 AI Agent 名詞為 Command）。

---

## Rule / Workflow / Skill 的差異

### 📋 三者使用場景
在合適的時機點使用，才會得到最大的效果，並節省 Token 的消耗

[flow]
1. Rule — 全場景適用的通用規範，每次對話都會自動載入
2. Workflow — 有明確步驟、需要主動用 `/` 觸發的工作流
3. Skill — 特定情境的專業技能包，AI 根據需求自行判斷使用
[/flow]

> **不建議把 Rule 寫太多**
> 每次開啟新對話，AI 都會讀取完整的 Rule 文件。過多的 Rule 不僅佔用上下文空間、浪費 Token，還可能因資訊過載導致 AI 忽略規則。

下面的為 Cursor 內部員工分享的 Rules 範例
```terminal [label="參考 Rules"]
DO NOT GIVE ME HIGH LEVEL SHIT, IF I ASK FOR FIX OR EXPLANATION, I WANT ACTUAL CODE OR EXPLANATION!!! I DON'T WANT "Here's how you can blablabla"

- Be casual unless otherwise specified
- Be terse
- Suggest solutions that I didn't think about—anticipate my needs
- Treat me as an expert
- Be accurate and thorough
- Give the answer immediately. Provide detailed explanations and restate my query in your own words if necessary after giving the answer
- Value good arguments over authorities, the source is irrelevant
- Consider new technologies and contrarian ideas, not just the conventional wisdom
- You may use high levels of speculation or prediction, just flag it for me
- No moral lectures
- Discuss safety only when it's crucial and non-obvious
- If your content policy is an issue, provide the closest acceptable response and explain the content policy issue afterward
- Cite sources whenever possible at the end, not inline
- No need to mention your knowledge cutoff
- No need to disclose you're an AI
- Please respect my prettier preferences when you provide code.
- Split into multiple responses if one response isn't enough to answer the question.

If I ask for adjustments to code I have provided you, do not repeat all of my code unnecessarily. Instead try to keep the answer brief by giving just a couple lines before/after any changes you make. Multiple code blocks are ok.
```

## gen-test-cases 工作流設計

### 📝 設計工作流執行步驟
讓他扮演一位經驗豐富的軟體測試專家

[flow]
1. STEP 1：建立 test 資料夾，存放 Markdown 格式的測試清單
2. STEP 2：AI 根據指定模板撰寫測試案例清單（測試類型、說明、範例輸入、期待輸出）
3. STEP 3：確認範圍符合預期後，AI 撰寫測試程式，描述與文件一致
4. STEP 4：AI 自主執行驗證，通過後回頭在文件內打勾
5. STEP 5：限制最多嘗試 5 次，避免 AI 在錯誤方向狂奔
[/flow]

> **小技巧**
> 以「狀態」的概念來管理，有測試通過才會標記；並給他幾個測試類型的範例參考

### 💡 先文件、後程式的設計邏輯

- 先確認 AI 發想的測試情境是否有遺漏
- 確認後才讓 AI 開始撰寫程式
- 一口氣生成的話，如果結果不對，不但浪費時間還浪費 Token

> **建議每個頁面都有獨立的測試程式**
> 這樣日後修改遇到問題時，可以快速定位是哪個頁面的功能出了問題。

## 實際操作 Demo
> 這套工作流主要用來撰寫**前端專案的單元測試**，你可以根據自己的需求自行調整。
>
> 比如你想設計 Code Review 的 Workflow，也可以輸入 `code-review`，這樣就會新增一個同名的工作流檔案，可以自行撰寫，也可以透過與 AI 互動來生成工作流細節。

### ⚠️ 先用一個檔案來測試
建議大家請 AI 撰寫測試程式時，不要讓他一口氣生成，而是先放一個檔案（src/pages/LoginPage.tsx）。
確認執行結果與期待相符在擴大範圍，否則一口氣生成，如果結果不是你要的，那不但浪費時間還浪費 Token。

[flow]
1. AI 要求建立對應的 test 資料夾 → 點擊 Accept 接受
2. AI 參考 Markdown 文件撰寫測試案例清單，初始狀態皆為空（未通過）
3. 根據測試類型分類，確認輸入輸出的描述與期待相符
4. 如有缺漏可直接討論；確認沒問題後請他「**繼續**」
5. AI 寫好測試程式後詢問是否執行 → 點擊 Accept 執行
6. 測試通過後，AI 回頭更新測試清單，標注通過狀態 ✅
7. 如果想人工手動觸發測試，可以在終端機輸入 `npm run test`
[/flow]

> ** 安全提醒：不要無腦點擊 Accept**
> 如果看不懂 AI 執行的指令，建議先把指令複製起來詢問確認，曾有網友遇過 [AI 直接刪除整顆硬碟的案例](https://www.reddit.com/r/google_antigravity/comments/1p82or6/google_antigravity_just_deleted_the_contents_of/)

### 🤔 為什麼這樣做

- 光是 3 個功能不多的頁面，就涵蓋相當多的測試情境。
- 若用人工測試，即便是小專案，也要花好幾分鐘手動跑完流程，且容易有遺漏。
- 加入自動化測試後，你只要放給他跑就好。

> **隨著專案擴增，效益會更加明顯**
> 功能動輒成千上萬的大型專案，沒有自動化測試，任何不起眼的改動都可能在意想不到的地方引發問題。

---

# CI/CD 篇：GitHub Action 自動化測試

> 測試加入 CI/CD 後，每次推送程式都會自動驗證，守住專案的最後一道防線。

---

## 先了解 Git Flow

### 🌿 分支策略基礎

- **main(master)**：主分支，對外的穩定版本，只接受來自 develop 的 Pull Request
- **develop**：開發分支，日常更新都推送到這裡
- **feature/xxx**：功能分支，開發單一功能時從 develop 切出，完成後合併回 develop
- **release/xxx**：發布準備分支，從 develop 切出，只做版本號調整與小修復，完成後合併回 main 與 develop
- **hotfix/xxx**：緊急修復分支，直接從 main 切出，修完後同時合併回 main 與 develop

> **為什麼需要分支策略？**
> 如果把邏輯錯誤或功能不完善的版本直接推送到主分支，產品就壞掉了。分支策略的目的，是保護對外服務的穩定性。

### 🚀 建立第一個分支

如果你是第一次接觸，可以先從 main 分支出 develop，來了解為什麼需要用不同分支開發。

```terminal [label="進行分支"]
git checkout -b develop
```

## 設定 GitHub Action

### ⚙️ 自動化測試指令
到與 AI 的對話窗中輸入以下內

```prompt [label="請 AI 設定 GitHub Action"]
我希望在 GitHub Action 加入自動化測試的流程
每一個分支將更新推送到 GitHub 都會觸發一次自動化測試
測試完畢後，要生成覆蓋率報告讓我下載
```

### 📤 推送到 GitHub
等 AI 將 GitHub Action 內容更新完畢後，將變更推送到 GitHub
Commit 訊息可以由 AI 自動生成，或自己手動輸入

```terminal [label="撰寫 commit"]
1. 撰寫 pages 頁面下的測試案例
2. 在 GitHub Action 增加自動測試的流程
```

### 📊 測試報告說明
到 [GitHub](https://github.com/) 查看執行結果：
- 成功是綠色勾勾，失敗是紅色叉叉
- Artifacts 區塊可下載測試覆蓋率報告（打開資料夾下的 index.html 便可確認）
- 可了解哪些功能測試完整、哪些還需要補充

> **經驗分享**
> 在測試覆蓋率這塊，我們沒必要追求 100%；而是重要的邏輯都要測試到，這才是最重要的。

## 用 Ruleset 保護主分支

### 🔒 GitHub Ruleset 設定步驟
如果你希望只有「通過測試」的分支才能合併到主分支，就需要多做一設定。

[flow]
1. Settings → Rules → Ruleset → New branch ruleset
2. Ruleset Name: protect main branch
3. 將「Enforcement status」切換到 Active
4. Target branch 選擇「Include default branch」（預設主分支 main）
5. 勾選「Require a pull request before merging」用 PR 才能合併的選項
6. 勾選「Require status checks to pass」限制測試必須通過才能合併
7. 勾選「Require branches to be up to date before merging」確保合併前分支有更新到最新版
8. 點擊「Add Checks」，新增 Test 作為必須通過的檢查項目，儲存設定
[/flow]

> **設定完成後，只有測試通過的分支才能合併到主分支**
> 這是在多人協作時，保護專案品質不被破壞的基礎設計。

## 驗證分支保護有生效

### 🧪 實際驗證：故意製造錯誤
故意讓一個測試失敗，驗證 Pull Request 是否真的會被擋下。

[flow]
1. 到專案挑一個測試案例，故意把預期結果弄壞
2. 在終端機執行 `npm run test`，確認看到錯誤訊息
3. 將這個錯誤推上去，commit 填寫 `test PR failure condition`
4. 回到 GitHub，點擊「Pull requests」→ 建立新的 PR
5. **注意**：如果你是 fork 的專案，base 要改成自己的帳號，compare 選擇 develop
[/flow]

填寫 PR 的 description（幫助其他人與未來的自己了解更新內容）：
```prompt [label="撰寫 PR"]
1. 撰寫 pages 頁面下的測試案例
2. 在 GitHub Action 增加自動測試的流程
```

開出 PR 後會自動觸發一次測試，因為測試有錯誤，合併按鈕會是**灰色**，符合預期。

### ✅ 修正後驗證通過
接著回到專案，把問題修正回來，commit 填寫 `test PR success condition`。
推上去後回到 GitHub，稍等一段時間，合併按鈕會變成**綠色**，可以順利合併。

> 有了 Ruleset 保護主分支後，至少能保證合併進來的功能都是經過基礎驗證的。

---

# Skills 篇：讓 AI 從庸才走向專家

> Skill 的出現，讓 AI 的價值可以持續累積。只要教會一次，他就永遠記得怎麼做。

---

## 什麼是 Agent Skill？

### 🎒 Skill 的結構

- **提示詞（Prompt）**：精心設計的指令
- **程式腳本（Scripts）**：可執行的程式
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

### 👣 下載練習專案

為了方便大家了解 Skill 如何運作，我在 GitHub 上傳了一個[練習用專案](https://github.com/dean9703111/ai-agent-skills-practice)

到 GitHub 頁面點擊 `Code`，複製 Repository 連結後，就可以用 `git clone` 下載到本機。

```prompt [label="下載練習專案"]
git clone git@github.com:dean9703111/ai-agent-skills-practice.git
```

在 Antigravity Clone 專案

[flow]
1. 到 GitHub 開啟練習專案，點擊 `Code` 複製網址
2. 回到 Antigravity，選擇 `Git Clone`
3. 貼上 Repository 網址，下載到本機
4. 開啟剛 clone 下來的專案資料夾
[/flow]

### 📦 各工具的 Skill 路徑

這次使用 Antigravity 示範，如果你平常習慣的是 Cursor、Copilot、Claude 或 Codex，也完全沒問題。對 Skill 來說，核心概念都一樣，差別通常只是安裝路徑不同。


| 工具 | Project Skill 路徑 | Global Skill 路徑 |
|------|-------------------|------------------|
| Cursor | `.cursor/skills` | `~/.cursor/skills` |
| Copilot (VSCode) | `.github/skills` | `-` |
| Claude | `.claude/skills` | `~/.claude/skills` |
| Codex | `.codex/skills` | `~/.codex/skills` |
| Antigravity | `.agent/skills` | `~/.gemini/antigravity/global_skills` |

因為每個 AI Agent 的路徑不同，可以使用 [dotagents](https://github.com/iannuttall/dotagents) 來協助建立 symlinks。

```prompt [label="將 Agent Skills 同步到指定的 AI Agent"]
npx @iannuttall/dotagents
```

單一來源管理，未來維護更方便，修改一次就能在所有工具中生效；此套件會在 `.agents` 底下管理。

### 🎬 用實作理解 Skill 運作邏輯

這邊我用一組影音工作流的 Skills 來示範：

- `audio-to-srt`：把音訊轉成字幕檔
- `srt-enhancer`：優化字幕內容與斷句
- `srt-card-annotator`：設計字卡與畫面標註
- `srt-social-summary`：生成影片介紹與社群貼文

之所以用這組技能舉例，是想提醒大家，AI Agent 並不是只能拿來寫程式。
像是分析素材、整理內容、協助創作，這類工作其實也非常適合交給 Skill 來處理。

#### Skill - Discovery

把測試用的音訊檔（audio-example.m4a）拖曳進去，然後輸入：

```prompt [label="觸發 Skill"]
轉 SRT 字幕檔
```

這時候 AI 不會立刻執行程式，而是先搜尋目前專案裡有沒有跟這個任務相關的 Skill。

#### Skill - Activation

如果它成功匹配到像 `audio-to-srt` 這樣的 Skill，才會開始完整閱讀那份 `SKILL.md`。

在這之前，AI 通常只會先讀技能名稱與描述，這也是 Skill 能節省 Token 的原因。

從 AI 的視角來看，很像我們用 Google 搜尋時，會先看標題和摘要，確認相關之後才點進去閱讀全文。

#### Skill - Execution

真正進入執行階段後，AI 才會依照文件裡的步驟逐步完成任務。

[flow]
1. 先驗證環境，確認 Python、必要套件與輸入音檔是否齊全
2. 如果缺少依賴，AI 會提示並協助安裝所需資源
3. 確認前置條件沒問題後，才開始逐字稿轉換、文字切割與時間軸調整
4. 最後輸出對應的 `srt` 字幕檔
[/flow]

> **小提醒**
> 真正執行任務的步驟，通常會放在 Skill 的 `scripts` 資料夾裡，這個案例就是用 Python 腳本來完成字幕處理。所以當 AI 詢問你是否要執行指令時，實際上就是準備呼叫那些腳本。

### 📚 References：讓 Skill 補充情境知識

Skill 不只有 `scripts` 這個執行腳本的資料夾，通常還會搭配一個 `references` 資料夾，專門放補充資料。

這邊我用 `srt-social-summary` 這個 Skill 當例子。假設我想把同一支影片發布到 Facebook、Threads、YouTube 等不同平台，那每個平台的寫法其實都不太一樣。

像是：

- Hashtag 要怎麼下
- 開頭怎麼寫比較吸引人
- 不同平台的語氣與篇幅怎麼調整

```prompt [label="測試有參考 references"]
產生社群宣傳文案
```

> **漸進式揭露（Progressive Disclosure）**
> 這些細節其實不需要全部塞進 `SKILL.md`。比較好的做法，是把它們整理到 `references` 裡，等 AI 判斷有需要時再去讀取。這就是一種的技巧。



## 使用第三方 Skill

### 🔎 尋找第三方 Skill

接下來我們要為專案新增一個 Skill。這邊推薦大家可以到 [SkillAgent Skills Marketplace](https://skillsmp.com/) 搜尋現成的 Skill。

很多人會把自己整理好的 Skill 分享出來讓其他人直接安裝使用，你可以在這裡透過英文關鍵字搜尋自己想找的能力。

例如你想設計形象網站，就可以輸入 `frontend-design`。找到想安裝的 Skill 後，直接複製頁面上提供的安裝指令即可。

> **執行安裝指令前，先確認 Node.js 已安裝**
> 如果沒有安裝 Node.js，這類指令通常會無法執行。我之前有整理過 Python、Node.js、Git 的安裝教學，可以從[這支影片](https://youtu.be/5DEV_K0JauQ)查看。

### 📥 安裝第三方 Skill

接下來把畫面切回 Antigravity，點擊上方的 `Toggle Panel` 打開下方終端機，然後把剛剛複製的安裝指令貼上去。

[flow]
1. 開啟 Antigravity 的終端機，貼上頁面提供的安裝指令
2. 在清單中找到想安裝的 Skill，這裡以 `frontend-design` 為例
3. 按下 `Enter` 後，選擇要安裝到哪個工具（原則不需要特別選，因為大部分都是通用的）
4. 安裝範圍先選 `Project`，在單一專案中測試
5. 最後選 `Yes` 開始安裝
[/flow]


### 💬 安裝後如何使用 Skill

理解安裝原理之後，就可以回到右側的 AI 對話視窗，直接輸入和需求對應的提示詞。

```prompt [label="使用已安裝的 Skill"]
彙整「Agent Skills」的重要資訊後，設計一個有專業質感的中文教學網頁
```

送出提示詞後，AI 會先找到對應的 `SKILL.md`，確認有沒有和這個需求匹配的 Skill，接著才開始讀取內容並執行。

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

### ✅ Skill 使用經驗

- Skill 不是裝越多，AI 就越強
- 如果同一類型的 Skill 裝了兩個以上，當需求命中時，常常會一起觸發
- 這不只會增加 Token 消耗，也容易讓 AI 在執行過程中卡住或走偏
- 在提示詞的世界裡，1 + 1 不一定大於 2，甚至可能小於 1

> **同類型的 Skill，建議擇優安裝一個**
> 像前端網頁生成這類需求，如果同時安裝多個相近 Skill，AI 反而要花更多成本判斷該遵循哪一套規則，結果未必更好。

網路上的 Skill 雖然很多，但不是每一個都真的能讓 AI 變強
- 有些 Skill 描述看起來很厲害，實際使用時效果卻不穩定
- 有些會增加上下文負擔，卻沒有提供足夠的專業價值
- 有些甚至會讓 AI 的行為變得更難預測

> **先在 Project 測試，再決定要不要放到 Global**
> 建議先用獨立專案驗證 Skill 的運作是否符合預期。真的有用、而且具備通用性，再放進 Global Skill，避免把整體工作流越裝越亂。

## 建立自己的 Skill

儘管網路上有很多 Skill，但未必能符合自己實際的工作流。

如果找不到合適的，那我們就自己建立，會需要開啟一個空的資料夾來操作。

### 🧩 安裝 Skill Development

不知道怎麼下手可以先請 AI 幫忙生成一個初版。

```prompt [label="安裝 Skill Development"]
npx skills add anthropics/claude-code
```

接著在清單中選擇 `Skill Development`，先安裝在目前這個 Project 就好。

### 🛠️ 建立第一個 Skill：音訊轉 SRT

安裝完畢後，開一個新的對話窗，直接描述自己想建立的 Skill。

這邊我是請 AI 幫我建立一個用 Python 將音訊檔轉成 `srt` 字幕檔的 Skill，並把規則一次講清楚：

```prompt [label="建立 audio-to-srt Skill"]
我想要建立一個透過 Python 將音訊檔轉成 srt 逐字稿的 Skill
使用 openai-whisper 套件
我可以設定每行最多幾個字，若沒填寫預設最多 22 字，最少 4 個字
時間軸若不連續，當間隔小於 0.3s 時，後面需要往前補
執行時會先檢查環境與套件是否安裝，並確認有提供音訊檔
將最後輸出的 srt 檔命名為「origin.srt」
```

你會看到 AI 在執行過程中，確實有參考剛剛安裝的 `Skill Development`。

稍等一段時間後，AI Agent 就會依照這個 Skill，幫我們建立一個新的 Skill。

### 🧱 拆解 SKILL.md 的結構

打開建立好的 `SKILL.md`，可以看到它大致分成三個部分：

- 最上面是 Meta Data，也就是 AI Agent 一開始會先讀取的資訊
- 其中最重要的是 `description`，寫得越具體，AI 越容易在正確的情境下找到它
- 下面則是 Skill 的描述與執行步驟，告訴 AI 應該如何完成這個任務

描述執行的流程如下：

[flow]
1. 先檢查環境，確認 Python、對應套件與輸入音訊檔是否存在
2. 前置條件通過後，才開始執行 Python 腳本
3. 根據規則切分字幕文字與調整時間軸
4. 最後輸出 `origin.srt`
[/flow]

而 `scripts` 資料夾，就是 AI 幫我們寫好的 Python 腳本存放位置。

### 🧪 測試 Skill

得到 Skill 初版後，接下來最重要的不是立刻安裝更多 Skill，而是驗證它的運作是否符合預期。

這邊先開一個新的對話窗，提供一個音訊檔，然後輸入：

```prompt [label="測試 audio-to-srt"]
轉成字幕檔
```

如果一切正常，你會看到 AI 順利找到剛剛設計的 Skill，並根據規則開始執行。

稍等一段時間後，`srt` 字幕檔就會產生。我們可以從幾個重點來驗證：

- 檔名是否為 `origin.srt`
- 每行是否符合最長 22 字、最少 4 個字的規則
- 前後段時間軸是否有依照規則黏合

如果你跟著教學做到這一步，代表你已經完成了第一個真正能運作的 Skill。

### 🪄 建立第二個 Skill：替字幕補上參考字卡

接著我再示範建立一個有關聯性的 Skill。

這個 Skill 的目標，是請 AI 在 `srt` 字幕檔內判斷適合增加字卡的位置，提升後期剪輯效率。

```prompt [label="建立 reference-cards Skill"]
我想要建立一個在 srt 逐字稿文字下方補上「參考字卡」的 Skill
只能在每段字幕的「文字區塊」下方新增字卡行，不可更改原本的時間碼與原字幕文字。
我希望的結構是 `[字卡](word:xxx / type:yyy)`
- word：必須是從該段內容萃取出的「重點詞/短句」（10~16 字內，避免太長）
- type：必須從 references/*.yaml 定義的 type 之一選擇(金色重點、白色提醒、紅色警告、藍色列點)
每 10 段字幕內，至少要新增 2 個字卡，字卡必須「貼合情境」選型：
  - 有風險、錯誤、踩雷 → 紅色警告
  - 建議、提醒、注意事項 → 白色提醒
  - 條列、步驟、清單感 → 藍色列點
  - 核心結論、最關鍵一句 → 金色重點
將最後輸出的 srt 檔命名為「reference-cards.srt」
請勿使用 Python 之類的腳本，必須要用 AI 來判斷
```

Skill 完成後，我們開一個新的視窗，把上一步生成的 `origin.srt` 放進去，然後輸入：

```prompt [label="測試 reference-cards"]
給我字卡重點
```

稍等一段時間後，可以看到 `reference-cards.srt` 出現。

點進去後，你會發現 AI 有根據字幕內容，設計出適合插入字卡的位置與類型。

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

### 🔄 以影音工作流為例

我們可以設計 Worflow 讓 Skills 穩定觸發

[flow]
1. 在「Workflows」分頁下，選擇「Workspace」在工作區建立
2. 名稱打 `audio-to-srt-cards`
3. 描述寫 `將音檔轉成逐字稿後，再生成字卡的工作流`
[/flow]

內容描述每一步要參考的 Skill 就可以了(根據實際的名稱替換)

```prompt [label="audio-to-srt-cards Workflow"]
按照下面步驟執行

STEP 1: 使用「mp3-to-srt」的 Skill 將音檔轉成逐字稿
STEP 2: 使用「reference-cards」的 Skill 用逐字稿生成參考字卡
```

完成後輸入`/`，選擇剛剛建立的 Workflow，將音訊檔放進去。

稍等一段時間，就可以看到工作流有根據我們的指引，參考對應的 Skill 完成任務了！

### 💡 組合設計的好處

- 每個 Skill 可以獨立維護與更新
- Workflow 只負責串接流程
- 整體架構更有彈性，1+1 大於 2

# 總結

[summary]
- 🧪 **自動化測試** | 解決穩定性、複雜度、擴充性三大痛點，守住專案的底線
- 🔄 **Workflow 寫測試** | 先文件確認範圍，再讓 AI 撰寫程式，避免浪費 Token
- ⚙️ **GitHub Action** | 每次推送自動觸發測試，搭配 Ruleset 保護主分支
- 🎒 **Agent Skills** | 特定情境的技能包，教會一次永遠記得，持續累積 AI 的價值
- 🔗 **Workflow + Skill** | 組合應用讓複雜流程穩定可重複，成為你的競爭護城河
[/summary]

[youtube id="Rb0_LutRIaw" title="Workflow 複習影片"]
[youtube id="xe00zJEtuMo" title="AI Agents 複習影片"]

## [掌握用 AI 開發全端專案的技巧](https://tibame.tw/Zmnts)
[![掌握用 AI 開發全端專案的技巧](/assets/ad.jpg)](https://tibame.tw/Zmnts)
