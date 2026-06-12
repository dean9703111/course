[time]
- label: 第 1 堂
  date: 5/30（六）
  time: 13:30~16:30
  des: **打造懂你的 AI 助手**：設定開發環境，掌握 AI Agent 進階技巧，建立專屬 Agent Skills 護城河
  link: [課程講義](https://deanlin.net/course/tibame/lesson1)
- label: 第 2 堂
  date: 6/6（六）
  time: 13:30~16:30
  des: **規格驅動開發 (SDD)**：讓 AI 根據規格建立全端系統，並搭配自製 Skill 優化開發流程
  link: [課程講義](https://deanlin.net/course/tibame/lesson2)
- label: 第 3 堂
  date: 6/13（六）
  time: 13:30~16:30
  des: **團隊協作與專案部署**：建立自動化測試，了解 Worktree 應用時機，同時用 MCP 操作外部工具將專案部署上線
  active: true
[/time]

# 課前回顧：全端系統可以在電腦運行了

## 建立 User 層級的 Claude Code GitHub Repository

### 🖥️ 讓 Claude Code 不用重頭設計

- 使用者層級的 `skills`、`hooks`、`settings.json`、`CLAUDE.md` 平常散落在 `~/.claude/` 目錄
- 如果沒有`版本控制`，一旦**換機器、重灌系統**，這些累積的心血就得從頭設定一次
- 把它們放進 GitHub repo，用 `git` 管理版本、用 `symlink` 連回原位
- 達成：**版本可追溯、跨裝置同步、隨時可還原、專案有更好的起點**

![強烈建議大家建立 User 層級的 Repo 來管理、同步](./assets/user-dot-agents-repo.png)

> **參考資源**
> - [講者範例 Repository](https://github.com/deancourse/user-dot-agents)
> - 建議跟著[講義步驟實作](https://deanlin.net/course/tibame/lesson2/#user-claude-code-github-repository)

### 🤖 AI 的成果可能不完全正確

上週的範例 Repository 其實有個小問題，由於 Shell Script 是給`每個 Skill` 個別建立 symlink，而不是給 `skills 資料夾`建立 symlink。

因此會有如下問題：
1. 在`user-dot-agents`底下建立的 Skill，需要**執行 Script 才會同步**到 User 層級的`~/.claude/skills`中
2. 當 Skill 新增到 User 層級的`~/.claude/skills`時，`user-dot-agents`下的 Skill **不會自動更新**

```prompt [label="修復問題"]
目前的 script 好像不是直接同步 skills 資料夾，而是根據下面資料夾同步，這樣我新增 skill 時，不會自動建立軟連結，請協助修改
```

有興趣了解差異的可以看 [commit 變更](https://github.com/deancourse/user-dot-agents/commit/c5d88595e3bb1bfa0f22477aac7720658e78357b)

![持續使用的專案，會發現可以優化的細節](./assets/user-dot-agents-enhance.png)

### ✅ 確認同步生效

```prompt [label="讓 Claude 找出來源"]
目前 User 層級的 CLAUDE.md、hooks、skills、settings.json，原始資料夾與檔案在哪裡？
```

![CLAUDE.md、hooks、skills、settings.json 有成功建立軟連結](./assets/claude-folder.png)

![輸入 /skills 確認技能可以順利顯示](./assets/claude-skill-list.png)

![輸入 /permissions 確認 deny 指令有同步](./assets/deny-dangerous-commands.png)

> **這個 Repository 可以放在電腦的任何位置**
> 我們是透過`symlink`來建立**資料夾、檔案**之間的軟連結，因此專案放在任何位置皆可。
> 重要的是變更時記得`commit`與`push`來更新，並且更新後其他台電腦要`pull`下載更新。
> 如果害怕**忘記這些操作**，可以跟 AI 討論設計 `Shell Script`，設計概念如下：
> - 登入電腦後，自動拉取最新檔案（若有衝突會引導使用者進入專案處理）
> - 每 30 分檢查是否有變更
> - 有變更才需要執行 commit 與 push
> - commit 訊息可以使用「auto sync user agents: YYYY-MM-DD HH:mm:ss」

## 在隔離環境（Sandbox）執行 Claude Code

### 🐳 安裝 Docker

到 [Docker 官網](https://www.docker.com/) 根據自己的作業系統下載安裝後，就可以直接使用，不需要特別註冊、登入帳號。

![不需註冊，確認有運行即可](./assets/docker-running.png)

> **安裝完成後，記得啟動 Docker Desktop**
> Docker 安裝完並不會自動啟動。請在應用程式中找到 Docker Desktop 並打開，**註冊相關步驟都可以直接 Skip**，看到左下角顯示綠色的 Running 狀態，才代表 Docker 已經準備好了。
> 也可以在終端機執行 `docker --version` 來確認有安裝成功。

### 🏝️ 在隔離環境執行 Claude Code

#### 下載 Dev Containers

在 IDE 的 Extensions 搜尋「Dev Containers」 並安裝。

![安裝 Dev Containers 外掛](./assets/dev-containers.png)

#### 下載測試範例，啟動 Sanbox

可以下載[練習用的 GitHub Repository](https://github.com/deancourse/claude-code-docker-container-demo)體驗。

![GitHub 專案可以直接下載體驗](./assets/claude-code-docker-container-demo.png)

開啟後，輸入「F1」貼上 `Dev Containers: Reopen in Container`

![啟動完成後，左下角就會顯示 Claude Code Sandbox](./assets/success-sandbox.png)

> **如果啟動失敗**
> 可以嘗試`關掉後重啟`，如果還是不行，將錯誤訊息貼到 Claude Code 進行分析。
> Windows 可以嘗試 `wsl --update` 更新到新版。

#### 確認讀取不到外部資訊，在隔離環境運作

在終端機輸入 `claude`，第一次需要登入帳號。

目前這個是完全獨立的環境，所以過去 `User Scope 的相關設定都不會出現`（ex: Skills、Rules、Plugins、Perminssions）。

![會是一個乾淨的 Claude 原廠設定](./assets/init-claude-setting.png)

隔離環境可以透過 `claude --dangerously-skip-permissions` 啟動，這時給 Claude 任務時，**除了會跟你釐清細節外，執行過程不會再詢問權限相關問題**。

```prompt [label="讀取外部資料"]
幫我列出桌面有哪些檔案
```

![確認無法聯繫到外部資源後，再讓 AI 放手執行](./assets/cannot-access-external-resouce.png)

### 🎯 用 OpenSpec 規格驅動開發（SDD）

- **Skills** — AI 在對話過程中自動觸發的技能包，不需要背指令
- **Commands** — 用 `/opsx` 前綴強制驅動：apply / archive / explore / propose
- 可透過 `openspec config profile` 擴充更多 workflows

```terminal [label="安裝 OpenSpec"]
npm install -g @fission-ai/openspec@latest
openspec init
```

#### STEP 1: 提出需求觸發 OpenSpec Skill 進行規劃

```prompt [label="觸發 OpenSpec Skill(propose)"]
設計車輛管理系統，包含以下功能：
- 登入頁面（帳號密碼驗證，區分管理者與一般使用者）
- 首頁儀表板（上方顯示關鍵數據卡片，下面顯示資料圖表）
- 車輛管理頁（可檢視、新增、編輯、刪除車輛資料）
- 員工管理頁（僅管理者可檢視、新增、編輯、刪除員工資料）

前端使用 React 搭配 Magic UI(shadcn@latest)，後端使用 Express，資料庫用 Postgres
資料庫希望透過 Docker 啟動，並且要包含 Postgres Admin 網頁
這是初步需求，我們可以透過討論釐清細節後，參考 OpenSpec 的 skill 執行
```

#### STEP 2: 確認規劃符合需求後，根據 Spec 規劃執行

```prompt [label="開始實作(apply)"]
開始實作
```

提出需求後觸發 OpenSpec 的 Skills 後，相關的規格文件都會存放在 `changes` 資料夾底下。

[flow]
1. proposal.md — 確認目標與範圍
2. design.md — 技術選擇與風險評估
3. specs/ — 按功能分類的詳細規格
4. task.md — 任務清單，完成自動打勾
[/flow]

![AI 完成的只是初稿，請審閱是否如預期](./assets/openspec-markdown.png)

#### STEP 3: 確認結果符合預期後進入歸檔

```prompt [label="歸檔（sync + archive）"]
功能符合預期，進行歸檔
```

![建議都選擇「Sync now」讓 AI 幫忙整合](./assets/sync-openspec.png)

![歸檔後 specs 就會有規格文件了](./assets/sync-openspec2.png)

### 🤖 讓 AI 執行專案時有規則

**CLAUDE.md** 是給「做事」用的，**openspec/config.yaml** 是給「規劃」用的

```prompt [label="初始化 CLAUDE.md"]
/init
```

![CLAUDE.md 可以讓 AI 快速理解 Code Base](./assets/claude-md.png)

```prompt [label="OpenSpec 設定"]
Please read openspec/config.yaml and help me fill it out
with details about my project, tech stack, and conventions
```

![openspec/config.yaml 讓規劃時負擔更輕](./assets/openspec-config-yaml.png)

> **legacy（既有）專案**
> 如果想在舊專案`導入 Claude Code、OpenSpec`，執行完上面的指令後，AI 執行的品質會好很多。

### 🛡️ 讓 AI 犯錯時被擋下

- `Lint + pre-commit`：commit 前自動擋掉格式錯誤與測試失敗
- `Git Flow`：main / develop / feature 分支策略，出包有回頭路
- 重點不是讓 AI 不犯錯，而是`設計讓錯誤被攔截`的機制

![讓檢查自動發生，並了解錯誤在哪裡](./assets/precommit-error.png)

### 🧩 把經驗沉澱成 Skill

- 根據公司、團隊客製 `Branch Name / Commit / PR` 個 Skill，讓 AI 有規範可循
- Skill 的價值：教會一次，下次都站在`更高的起點`

![範例的 Skill 只是參考，請根據需求客製化](./assets/skill-exmaples.png)

> **能「做出來」不等於能「交付」**
> 上一堂的系統功能跑得起來，但你敢直接交給別人用嗎？
> 怎麼確定`改 A 不會壞 B`、怎麼讓別人`在自己的電腦也跑得起來`——這正是這一堂要補上的。

### 🎯 這一堂，補上「品質」與「上線」的最後一哩

[flow]
1. 導入測試 — 了解測試注意事項、用 Skill 生成`測試案例`
2. 加入自動化 - 用 `CI/CD` 守住品質，並設定要`保護的 Branch`
3. 團隊協作 - 認識 `Worktree` 使用時機，讓協作更輕鬆
4. 使用 MCP — 讓 AI 協助建立 `Postman Requests`，驗證 API 更靈活
4. 部署上線 — 將前後端打包成 `Docker image`，透過 `Zeabur` 白話文部署迭代
[/flow]

---

# 導入測試：讓維護與擴充更有底氣

> 市場不會為爛產品買單；加入自動化測試，是 Vibe Coding **從玩具走向產品的關鍵**

## 上週專案存在什麼問題？

### 🗂️ 下載課程範例 Repository | branch:main

[下載或 Fork 練習用 Repository](https://github.com/deancourse/tibame-lesson3) 後，可以跟著課程進度操作。

```terminal [label="僅 Clone 課程 main branch Repo"]
git clone --branch main --single-branch git@github.com:deancourse/tibame-lesson3.git
cd tibame-lesson3
```

> **還沒設定 SSH Key？**
> 如果 clone 失敗，代表尚未設定 GitHub SSH 金鑰。
> 請參考 [GitHub 官方教學](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) 完成設定。

#### 同步 Skills 到不同 AI Agent

```prompt [label="將 Agent Skills 同步到指定的 AI Agent"]
npx @dean9703111/dotagents
```

![讓不同 AI Agents 共用 Skills](./assets/dotagents.png)

> 單一來源管理，未來維護更方便，修改一次就能在所有工具中生效；此套件會在 `.agents` 底下管理。

### 🚀 啟動專案

你可以執行請 AI 幫忙啟動專案，但一個專案`如果想長期維護，至少要知道如何手動啟動`。

```terminal [label="完成專案初始化"]
cp .env.example .env          # 第一次先複製出來、按需修改
docker compose up -d          # 啟 db (Postgres) + pgadmin (5050)
npm install                   # 安裝所有 workspace 依賴
npm run db:migrate            # 建立 schema
npm run seed                  # 建立第一個 admin（讀 .env 的 SEED_ADMIN_*）
npm run seed:mock             # 選用：塞 30 員工 + 50 車輛模擬資料，方便看 dashboard / 分頁
```

![在終端機貼上指令完成初始化作業](./assets/init-project.png)

> **小提醒**
> 如果 `Docker Conatiner 啟動失敗`的問題，通常原因如下：
> 1. 若出現**指令錯誤**，可能是因為 Docker 版本較舊，建議升級，或是改用 `docker-compose up -d` 啟動
> 2. 若`卡在 Starting 狀態`，通常是因為有`port 衝突`，可以到 Docker Desktop 查看。

```terminal [label="啟動專案"]
npm run dev
```

啟動完成後，可以進入 local 本地網址: http://localhost:3087

登入帳號密碼:
- **帳號**: admin
- **密碼**: admin12345

![透過登入確認前後端與資料庫皆順利啟動](./assets/check-fullstack-start.png)

[lab-session title="🛠️  實作練習"]
- 下載課程[範例 Repository](https://github.com/deancourse/tibame-lesson3)
- 同步 Skills 到不同 AI Agent: `npx @dean9703111/dotagents`
- 啟動專案，並登入確認前後端與資料庫皆順利啟動
[/lab-session]

### ⚠️ AI 生成的測試可能會污染資料庫

就算沒有要求，AI 有時也會主動`撰寫測試程式`；但測試程式不是有寫就好，還需要考量到許多面向。

```terminal [label="開新終端機執行測試指令"]
npm run test
```

在執行上次 AI 自動寫的程式時，會有如下`嚴重問題`：
1. 後端測試程式會`污染資料庫`
2. 測試行為被`寫入 Audit Log（使用者紀錄）`
3. 執行越多次，`資料庫越亂`；甚至重複執行，`預期通過卻出現錯誤`

![資料被清空，刷新會回到首頁](./assets/ai-gen-test-issues1.png)

剛剛登入的 Admin 在`刷新後會被登出`，可以到 PGAdmin 頁面看資料發生了什麼事: http://localhost:5050/browser/

![使用者紀錄被清除，還被塞入測試資料](./assets/ai-gen-test-issues2.png)

## 將後端測試改為 TestDB

> 不是要 AI「不要動資料庫」，而是`給它一個動了也沒關係的資料庫`。

### 🛠️ 兩種方案：MockDB 與 TestDB

> MockDB 是`模擬別人`，TestDB 是`隔離自己`。

| 方案 | 它在模擬什麼 | 使用情境 |
| --- | --- | --- |
| **MockDB** | 模擬`外部系統 / 第三方 API`的回應格式 | 後端要呼叫金流、簡訊、其他微服務，但測試時不想真的打對方 API，可以用 Mock 模擬對方不同情境回應的資料 |
| **TestDB** | 你`自己系統`專用的測試資料庫 | 驗證自己的 API 是否正確，但不想動到正式 DB，就另開一個一樣的 DB 供測試使用 |

- **MockDB**：我不在乎對方 API 背後邏輯，我只在乎`它回應的的格式`，所以根本不需要真資料庫，模擬回應就好。
- **TestDB**：要確認`自己寫的 API 業務邏輯`都符合預期，會牽涉到`資料庫真實行為`，所以一定要有一個真的（但可拋棄的）資料庫。

### 🤖 讓後端測試改用 TestDB | branch:feature/isolate-api-test-database

> 這堂課沒有使用第三方 API 服務，所以設計 TestDB 示範

```prompt [label="讓後端測試改用 TestDB"]
目前的 API 測試會改寫實際的 DB
我希望執行測試時，會有專屬的 TestDB，並確保每次測試都是乾淨的環境
且 PGAdmin 也能觀察測試結果
若涉及指令、規則，完成任務後更新 CLAUDE.md、README.md
```

待 AI 修改完畢後，`先復原專案 DB 資料`；這樣才能驗證執行測試時`不會對原有 DB 造成影響`。

```terminal [label="復原專案 DB"]
npm run seed        # 建立第一個 admin（讀 .env 的 SEED_ADMIN_*）
npm run seed:mock   # 選用：塞 30 員工 + 50 車輛模擬資料
```

#### 驗證結果符合預期

```terminal [label="重啟 PGAdmin 讓測試 DB 也能看見"]
! docker compose restart pgadmin
```

然後執行測試指令，確認不會動到原有 DB，並且 [PGAdmin](http://localhost:5050/browser/) 也可看到測試 DB

```terminal [label="執行測試"]
npm run test
```

![到 pgadmin 確認測試 DB 可以檢視](./assets/pgadmin-test-db.png)

> **了解 PR 的重要性**
> 為了讓大家更清楚`專案脈絡`，**每個 branch 都有建立 PR**，這樣回顧調整內容時，會更輕鬆。

[pr from="feature/isolate-api-test-database" to="develop" title="test: 隔離 API 測試資料庫為獨立的 vms_test，避免動到開發 DB" url="https://github.com/deancourse/tibame-lesson3/pull/1"]

[lab-session title="🛠️  實作練習"]
- 執行 `npm run test` 了解測試會污染資料庫
- 讓後端測試`改用 TestDB`
- 透過 `seed 指令` 將資料還原
- 執行 `npm run test` 確認確認不會動到原有 DB，並且 PGAdmin 也可看到測試 DB
[/lab-session]

## 建立適合專案的測試工作流

### 🔀 驗證生成測試的 Skill | branch:feature/restructure-tests-with-type-groups

[flow]
1. 建立資料夾 — 存放測試清單
2. AI 撰寫清單 — 類型、說明、輸入、期待輸出
3. 人類 Review — 確認情境有無遺漏
4. AI 撰寫測試 — 描述與文件一致
5. 自主驗證 — 最多嘗試 5 次
[/flow]

```prompt [label="描述要測試情境"]
列出「登入」操作，前後端會涉及的檔案
並根據 gen-test-cases skill 建立測試文件
```

#### 人類要確認測試清單符合預期

![會建立 doc 資料夾來存放前後端測試清單](./assets/test-doc.png)

```prompt [label="讓 AI 撰寫測試"]
撰寫測試程式
```

#### 確認生成的測試運作正常

![輸入 npm run test 來手動驗證](./assets/npm-run-test.png)

> **在實戰過程中，你會持續優化 Agent Skill**
> 生成測試案例的 Skill，直到講課前我在根據自己的需求`持續優化`。

[pr from="feature/restructure-tests-with-type-groups" to="develop" title="test: 依測試類型重構登入測試並建立測試案例文件" url="https://github.com/deancourse/tibame-lesson3/pull/2"]

### 💡 實務建議
- 不要一口氣生成所有情境的測試，`根據情境設計`會更好理解
- 每個頁面/模組有`獨立的測試程式`，方便定位問題
- 測試案例會隨規格變更而調整，`不可能一次到位`

> **千萬不要嫌寫測試浪費時間，測試其實是在幫你加速開發。**
> 現在儘管有 AI 輔助撰寫測試程式，我們還是要仔細檢查 AI 給的測試情境是否合理、有遺漏。

[lab-session title="🛠️  實作練習"]
- 觸發生成測試的 Skill
- 確認測試清單符合預期
- 驗證測試程式運行如預期
[/lab-session]

# 加入自動化：用 CI/CD 守住專案品質，設定 Branch Rule

## 為什麼專案需要 CI/CD？

> **把「人類會忘記做的事」，變成「推上 GitHub 就自動發生的事」。**

### 🤔 白話理解 CI/CD

| 名詞 | 白話翻譯 | 在做什麼 |
| --- | --- | --- |
| **CI**（Continuous Integration，持續整合） | 「每次交作業，自動批改」 | 每次 push / 開 PR，自動跑`測試、Lint、Build`，確認你的程式跟大家的`合得起來` |
| **CD**（Continuous Deployment，持續部署） | 「批改通過，自動上架」 | 確認沒問題後，自動`打包、部署`到測試或正式環境 |

在 GitHub 上，這一切由 **GitHub Actions** 完成：在 Repository 根目錄 `.github/workflows/` 放一份 YAML 設定檔，描述「`什麼事件發生`時，要`依序做哪些事`」，GitHub 就會幫你在雲端的乾淨機器上執行。

### 🧠 哪些「人類會忘記的事」可以交給它？

回想一下，這些事你是不是`偶爾`會忘：

- 改完程式，**忘記跑測試**就直接 push
- 只測了自己改的部分，**沒發現改 A 壞了 B**
- 合併前**忘記確認 Lint / Build** 有沒有過
- 上線流程靠記憶力：**漏了一個步驟**，半夜被叫起來救火

CI/CD 的價值不是「做得比人好」，而是**它永遠不會忘記、不會偷懶、不會看心情**——每一次 push 都用同一套標準檢查。

> **在 AI 寫程式的年代尤其重要**
> AI 產出程式的速度遠超過人類 Review 的速度，`你不可能每次都手動驗證所有功能`。
> CI/CD 就是那道**不管是人還是 AI 寫的 Code，都得通過的關卡**。

### 📐 設計 CI/CD 的兩個關鍵思維

**1️⃣ 階段化設計（先快後慢，越早失敗越省錢）**

把檢查依「速度」排序成關卡，前面的關卡失敗就`直接喊停`，不浪費時間跑後面的：

[flow]
1. Lint / 格式檢查 — 幾秒鐘，最快發現低級錯誤
2. 單元測試 — 幾十秒，驗證邏輯正確
3. 整合測試 / Build — 幾分鐘，驗證整體合得起來
4. 部署 — 前面全過才執行，確保上線的是好東西
[/flow]

如果順序倒過來——先花 10 分鐘 Build 完才發現一個分號打錯，那就是在`浪費等待時間`。

**2️⃣ 平行執行（互不依賴的事，就同時做）**

- `前端測試`和`後端測試`互不相干，拆成兩個 job **同時跑**，總時間取決於最慢的那個，而不是兩者相加
- 原則：**有依賴關係的用階段串起來，沒依賴關係的就平行攤開**

> **CI 跑越快，大家越願意用**
> 一條要等 30 分鐘的 CI，工程師會想盡辦法繞過它；一條 3 分鐘的 CI，大家會自然依賴它。
> `階段化 + 平行化`就是在買「願意被檢查」這件事。

## 加入 GitHub Action 自動化

### 🔁 設計 GitHub Action 要做的事 | branch:feature/add-github-actions-ci

- 每次推送到 GitHub 都`觸發測試`
- 先`檢查 Lint`，然後前後端`平行測試`
- 測試完畢生成`覆蓋率報告`

```prompt [label="自動化測試"]
在 GitHub Action 加入自動化流程
每一個分支(branch)將更新推送到 GitHub 時都會觸發
先檢查 Lint，然後前後端平行測試
測試完畢後，要生成覆蓋率報告讓我下載
若現有資源不足以完成目標，請安裝對應套件
```

![GitHub Action 初步設計的 CI/CD](./assets/github-cicd.png)

### ✅ 驗證 GitHub Action 符合預期

```prompt [label="設計完成後記得提交"]
切換 branch、設計 commit、然後 push
```

到 [GitHub 頁面](https://github.com/)，切換到 Actions 分頁，確認有成功觸發。

![每次 Push 都會觸發一個 Action](./assets/trigger-github-action.png)

![點擊進去後，可以看到完整的流程](./assets/trigger-github-action2.png)

![最下方的 Artifacts 有測試報告可以下載，解壓縮打開 html 即可檢視](./assets/test-report.png)

> **測試覆蓋率不需追求 100%**
> 重要邏輯都包含在測試程式內，才是最重要的；有了測試，規格書上的功能才能被真正驗證。
> **人記不住的，就交給 AI 吧**，[這是第一版 GitHub Action 執行的狀況](https://github.com/deancourse/tibame-lesson3/actions/runs/27251992685) 。

[pr from="feature/add-github-actions-ci" to="develop" title="chore: 新增 GitHub Actions CI 流程與前後端 coverage 設定" url="https://github.com/deancourse/tibame-lesson3/pull/3"]

[lab-session title="🛠️  實作練習"]
- 加入 GitHub Action 自動化
- 切換 branch
- 生成 commit
- Push 到 GitHub
- 到 GitHub 的 Actions 頁面確認有順利觸發
[/lab-session]

## 更新專案使用套件

> 套件升級就像`牙痛`：拖得越久，治療成本越高；但過去「看牙」實在太痛，所以大家能拖就拖。

### 🤔 為什麼套件版本要更新？

- **安全漏洞**：舊版套件的 `漏洞`是公開資訊，等於告訴駭客「我家的門鎖壞在哪」；許多資安事件的源頭就是`一個沒更新的套件`
- **Bug 與效能**：你遇到的詭異問題，很可能`新版早就修好了`，不更新等於一直繞路
- **生態系一直往前走**：Node.js、框架、周邊套件彼此牽動，`拖越久落差越大`，最後想升都升不動
- **越晚升越貴**：小版本一路跟，每次改一點；拖到被迫`一次跳好幾個大版本`，就是把小手術拖成大刀

### 😖 過去升級版本，為什麼大家能拖就拖？

| 挑戰 | 發生了什麼 |
| --- | --- |
| **相依性地獄** | 套件之間互相依賴，升了 A 卻壞了 B，`牽一髮動全身` |
| **不向前相容** | 大版本常有 `Breaking Changes`，API 用法整個改掉，原本正常的程式直接壞 |
| **遷移文件苦工** | 要逐一啃 `Changelog / Migration Guide`，跨好幾個版本時，文件得一版一版讀 |
| **看不到商業價值** | 升級完`畫面長一樣、功能沒變多`，對老闆來說像是「花一週什麼都沒做」 |
| **沒測試就是賭博** | 沒有自動化測試的團隊，升級後`不知道壞了什麼`，只能上線後等使用者回報 |

所以許多團隊都是在**不得已**（資安稽核、套件停止維護、新功能被卡）的狀態下才升級——但這樣累積的隱患更多。

> **現在的局面不一樣了**
> 前面我們已經補上`自動化測試`與 `CI/CD`，升級後**壞了什麼馬上看得到**；
> 而啃 Changelog、改 Breaking Changes 這些苦工，正好是 **AI 最擅長的事**。
> 過去「不划算」的升級任務，現在變成`可定期安排的例行維護`。

### 🆙 更新專案套件版本、GitHub Action 使用工具 | branch:feature/upgrade-major-dependencies

1. AI 安裝的`套件未必是最新版本`，因此可能**會有漏洞**
2. 剛剛設計的`GitHub Action`，裡面有許多**工具是舊版所以會出現警告**。

```prompt [label="確保 AI 取得套件的最新文件"]
/plugin install context7
```

安裝完成後，`Claude 重啟才能找到 context7` 並使用。

```prompt [label="使用 contenxt7 檢查套件版本並協助升級"]
使用 contenxt7 檢查專案前後端套件版本、以及 GitHub Action 工具，並協助更新到最新版本。
並確認更新後，自動化測試沒有出現錯誤。
```

![套件升級跟專案重構是很像的，涉及範圍大、風險高](./assets/use-contexnt7-upgrade-project.png)

> **個人經驗**
> 這次升級橫跨多個大版本（React 19、Express 5、Prisma 7…），放在過去至少是`以週為單位`的工程；
> 有了 AI 搭配自動化測試，一個指令就能完成大部分苦工。詳細的變更可以[參考這個 PR](https://github.com/deancourse/tibame-lesson3/pull/4)。

### ✅ 驗證更新後的內容符合預期

![重構與升級需要較長的時間](./assets/refactor-upgrade-long-time.png)

> **經驗分享**
> 根據過去經驗，這類`升級作業`，AI 大約需要`花費 30~50 分鐘左右`（過去讓人類來搞，時間單位都是以「週」起跳的）。
> 如果練習想`跳過「升級重構」這段`，可以用下面方案，這樣有需要時，後續可以用 git switch [branch] 切換練習分支
> ```
> git remote add upstream git@github.com:deancourse/tibame-lesson3.git
> git fetch upstream
> git switch feature/upgrade-major-dependencies
> ```

就算基礎的測試全都通過，還是建議大家要`親手跑一次流程`。

```terminal [label="確認專案可以順利啟動"]
npm install           # lockfile 全量更新，須重裝相依
npm run db:migrate    # 順帶執行 prisma generate，重建 gitignored 的 generated client
```

![有些套件的更新可能會影像畫面、行為，需要自行確認](./assets/check-update1.png)

```terminal [label="確認專案測試都通過"]
npm run test
```

![可以手動測試確認原有邏輯有通過](./assets/check-update2.png)

[pr from="feature/upgrade-major-dependencies" to="develop" title="chore: 升級主要相依至最新版" url="https://github.com/deancourse/tibame-lesson3/pull/4"]

[lab-session title="🛠️  實作練習"]
- 更新專案套件版本、GitHub Action 使用工具
- 驗證更新後的內容符合預期
- 切換 branch
- 生成 commit
- Push 到 GitHub
[/lab-session]

## 設計保護 Branch 的規則

> **Branch 保護就像機場安檢**：不管你是誰、再怎麼趕時間，`沒通過檢查就是不能登機`。
> 程式碼也一樣——**只有通過測試、通過 Review 的變更，才能進入 `main/develop`**，沒有例外。

### 🤔 為什麼重要的 Branch 需要保護？

`main`（正式）和 `develop`（開發）是**所有人共用的基準**。

大家的分支（branch）都從這裡長出來、最後也都合併回這裡。一旦它壞了，影響的不是一個人，而是`整個團隊 + 線上的使用者`。

沒有保護規則時，這些事`隨時可能發生`：

| 情境 | 後果 |
| --- | --- |
| 手滑直接 `push` 到 main | 沒測過的程式`直接進到正式版`，全團隊跟著踩雷 |
| 趕時間跳過測試就合併 | 「我改很小應該沒事」——`出事的永遠是這句話` |
| AI Agent 推錯分支 | AI 執行力強、動作快，`推錯目標時破壞力也大` |
| 沒人 Review 就合併 | 問題上線後才被使用者發現，`修復成本最高` |

**保護規則的本質：把「靠自覺」變成「靠制度」。**

- 規則不是不信任誰，而是`讓對的流程成為唯一的路`。想合進受保護的分支，就必須`走 PR、過測試`，沒有例外
- 還記得前面建好的 `CI/CD` 嗎？只要測試不過，**合併按鈕直接變灰色**，而不只是「亮紅燈提醒你」

### 🛡️ 設計保護 Branch 的規則

**免費版必須為「Public」的 Repo 才能進行設定**

- 設定 `main` / `develop` 為保護分支
- 只有「通過測試」的分支才能合併

![選擇 Settings ⭢ 選擇 Branches 下面的「Add branch ruleset」](./assets/branch-rule.png)

- **Ruleset Name**：可以輸入`Protect main/develop branch`
- **Enforcement status**：切換到 `Active` 才會生效

![name 可以自由定義，但 Status 記得切到 Active](./assets/branch-rule2.png)

- **Target branch**：需要**分兩次**加入，選擇「Add target ⭢ Include by pattern」
- 先輸入 `main` 按 Add，再輸入 `develop` 按 Add

![Target branch 輸入要保護的 branches](./assets/protect-branches.png)

#### Branch rules

- 把`Require a pull request before merging`這個必須「用 PR 才能合併的選項」打勾。
- 將`Require status checks to pass`打勾，以及下面的`Require branches to be up to date before merging`」`也打勾，這是在設定「測試必須通過才能合併」。
- 點擊`Add Checks`，搜尋 test，然後把他打勾，這就是要檢查的項目。

![自動生成的 Test 名稱可能略有不同](./assets/test-check.png)

完成上述設定後，滑到最下面點擊`Create`便可建立 Rule。

![之後在 Rulesets 分頁，就能看到](./assets/complete-rulesets.png)

### 🎯 模擬失敗情境，確認會擋住 | branch:feature/test-fail-condition

#### STEP 1：故意把測試案例弄失敗

編輯後端 API 的測試程式 `apps/api/src/routes/auth.test.ts`，故意讓判斷結果不匹配。

![把 404 改成 999 讓結果出錯](./assets/create-error.png)

#### STEP 2：繞過 pre-commit 檢查

![因為過去有設計 pre-commit，所以用正常路徑會 commit 失敗](./assets/create-error2.png)

```terminal [label="繞過 pre-commit 檢查並 Push"]
git checkout -b feature/test-fail-condition
git add apps/api/src/routes/auth.test.ts
git commit --no-verify -m "test fail condition"
git push --set-upstream origin feature/test-fail-condition
git checkout feature/develop # 最後切回 develop 方便後續操作
```

#### STEP 3：建立「Pull request」

確認合併目標為「develop」時是否會無法合併。

[pr from="feature/test-fail-condition" to="develop" title="test fail condition" url="https://github.com/deancourse/tibame-lesson3/pull/5"]

![測試不過時，Merge pull request 無法點擊](./assets/merge-disable.png)

[lab-session title="🛠️  實作練習"]
- 確認目前為 Public Repo
- 設計保護 Branch 的規則
- 故意把測試案例弄失敗後更新到 GitHub
- 確認合併目標為「develop」時會無法合併
[/lab-session]

# 認識 Git Worktree：了解多人專案協作技巧

> **讓同一個專案「分身」出好幾個資料夾，每個資料夾各停在不同分支，互不干擾。**

## 當專案有多個分支同時進行

### 😵 先看沒有 Worktree 時的日常 | branch:feature/develop

你正在 `feature/A-function` 分支寫新功能，寫到一半：

1. 同事敲你：「幫我 Review 一下程式（`feature/B-function`）」
2. QA 測試敲你：「版本有 Bug，請修復（`release/1.0.0`）」

如果你只有一個資料夾，就代表只能停在一個分支，只好：
1. 把寫到一半的程式用 `git stash` 暫存
2. 切對應分支處理
3. 處理完再切回來，用 `git stash pop` 把暫存撈出來。

> **實戰經驗**
> 如果一個專案`同時處理多個任務`，那`git stash`暫存的東西，往往會在切來切去、恢復的過程搞丟。

## Git Worktree 提高協作效率

### 🌳 Worktree 概念：與其切來切去，不如多開幾個資料夾

- `git worktree` 可以替同一個專案**多開幾個資料夾**，每個資料夾`各自停在一個分支`
- 它們**共用同一份 Git 紀錄**——不是笨重的「整包再 clone 一次」，而是輕量的分身
- 寫到一半的東西`原封不動留在原資料夾`，你只是「走到另一個房間做另一件事」，回來繼續就好

打開 Extentions，搜尋 `Git Worktree Manager` 來安裝外掛。

![可以搭配 Git Worktree Manager 管理](./assets/git-worktree.png)

### 🆚 開發、Review、修 Bug 三線並行

| 工作情境 | 沒有 Worktree | 有 Worktree |
| --- | --- | --- |
| **開發新功能** | 跟其他任務搶同一個資料夾 | 在`獨立資料夾`安心開發，不影響主線 |
| **Code Review** | 先 stash 手上的工作再切分支 | `直接開一個資料夾`看別人的分支 |
| **修緊急 Bug** | 打斷開發、暫存半成品 | 用有問題的分支`另開一個資料夾`修 |

> **使用心得**
> **Git Worktree 主要的目的不是「平行開發」，而是方便處理不同性質的「任務」。**
> AI 執行的效率已經非常高了，與其平行開發後解衝突，還不如**把精力放在 Code Review 上面確保專案穩定性**。

## 使用 pnpm 減少硬碟浪費

### 💽 全局安裝 pnpm

因為 Git Worktree 會`建立多個工作目錄`，而 Node.js 專案的 `node_modules 動輒上百 MB`。

如果用 npm 安裝會消耗大量硬碟資源，因此我推薦大家`使用 pnpm 這款套件`。

pnpm 會將`所有套件存放在電腦的一個共用儲存區`，各專案的 `node_modules 則是透過連結指向同一份套件`。

```terminal [label="全局安裝"]
npm install -g pnpm 
```

### 🆕 在新的 Worktree 工作區設計 pnpm 環境 | branch:feature/pnpm-demo

1. 點擊「Add Worktree」
2. 選擇「Create New branch」
3. 輸入「feature/pnpm-demo」

![用 Add Worktree 選擇 feature/pnpm-demo](./assets/worktree-pnpm.png)

因為 pnpm 跟 npm 安裝方式略有不同，可以請 Claude 協助設計

```prompt [label="請 AI 協助設定並安裝"]
我想要讓專案也可以透過「pnpm install」安裝套件，幫我設計環境，並確認可以啟動專案，處理安裝環境這塊即可
完成後將操作寫入 README.md 文件
```

### 🧩 透過 pnpm 安裝套件、啟動專案

```terminal [label="安裝專案套件"]
pnpm install
```

![用 pnpm 來安裝套件](./assets/worktree-pnpm2.png)

```terminal [label="啟動專案"]
cp .env.example .env
pnpm run dev
```

![如果啟動失敗，多半是後端 API Port 衝突導致(原本有開的要先關閉)](./assets/worktree-pnpm3.png)

> **向前相容的重要性**
> 雖然 pnpm 很好用，但也要考量到`並非所有人都使用`；且導入新功能，建議以最`小影響範圍來導入`。

[pr from="feature/pnpm-demo" to="develop" title="chore: 新增 pnpm 安裝支援（npm / pnpm 雙 lockfile 並行）" url="https://github.com/deancourse/tibame-lesson3/pull/6"]

### ✅ 任務完成後移除 Worktree

儘管 pnpm 可以透過`共用套件節省硬碟空間`，但專案`本身的文件`也是很佔硬碟空間的。

成熟的系統，拋開套件不算，可能`光程式檔案就要上百 MB`；而**一個人手上可能有數個系統，每個系統又有多個 Worktree 工作區**，這樣硬碟容易遇到瓶頸。

![Worktree 要找時間移除](./assets/remove-worktree.png)

[lab-session title="🛠️  實作練習"]
- 建立一個新的 Worktree 工作區（建議使用 Git Worktree Manager）
- `npm install -g pnpm` 全局安裝 pnpm，減少硬碟浪費
- 切到 `feature/pnpm` 分支
- 在新的 Worktree 工作區透過 pnpm 安裝套件 `pnpm install`
- 在新的 Worktree 工作區開啟 AI Agent 處理任務，原資料夾繼續開發
- 確認兩邊工作互不影響
- 任務完成後，移除 Worktree 工作區（若不移除，資料夾會越來越多）
[/lab-session]

---

# 初探 Postman：測試後端 API 更靈活

## 為什麼需要 Postman？

> 網頁用 `F12 → Network` 只能看到「前端打的 API」。
> 真正要驗證後端，需要一個能`主動發出 Request`、能`重複執行`、能`模擬不同身份`的工具。

### 🤔 只靠瀏覽器測 API 的三個痛點 | branch:develop

- **被動**：F12 只看得到前端`觸發`的請求（Request），但實務上有`很多 API 不會在網頁顯示`（ex: 第三方 API）。
- **難重現**：想測「缺欄位、沒權限、Token 過期」這些`錯誤情境`，瀏覽器很難實現。
- **無法累積**：今天測過的請求（Request），明天又要從頭點一次，`情境沒有被保存下來`

> **經驗分享**
> 許多管理後台，`操作路徑極為複雜`；如果用瀏覽器光是要點到對應的測試情境，都需要花許多力氣。
> 這樣不如使用`Postman`來精準打擊，不需要透過瀏覽器慢慢來。

### 📮 Postman 是後端 API 的測試台

把每一支 API 變成一張可重複執行的「Request 卡片」，存好`網址、Header、Body`，按一下就能驗證後端回應。

到 [Postman 官網下載頁](https://www.postman.com/downloads/) 依作業系統下載安裝。

![Postman 有一定的學習成本，但是個很棒的工具](./assets/download-postman.png)

> **請註冊並登入帳號**
> 後面要用的 `MCP` 功能需要登入；用 Email 或 Google 註冊都可以，**免費方案就夠本堂課使用**。

### 🔗 結合 MCP，讓 AI 幫你建立與測試

Postman 提供官方 MCP Server，串上後 AI 就能`直接幫你建立 Request、設定變數、甚至跑測試`。

| 沒有 MCP | 有了 MCP |
| --- | --- |
| 一支一支手動填 URL、Header、Body | 用白話文描述情境，AI 自動建立 Request |
| 錯誤情境要自己想、自己湊 | AI 依規格補齊`正確 / 錯誤 / 權限`各種案例 |
| 改一次 API 要回頭逐張改 | 請 AI 依最新規格批次更新 |

## 安裝 Postman MCP 與 Token 設定

### 🔑 取得 Postman API Key

MCP 需要一把 API Key 來代表「你」操作 Postman。

登入 Postman 後，點右上角 **Settings** → **Account settings** → **API keys** → **Generate API Key**

![到達 API Key 頁面](./assets/postman-api-list.png)

![命名後，複製產生的金鑰，他只會出現一次](./assets/postman-api-gen.png)

> **API Key 等於你的帳號權限**
> 這把金鑰`不要 commit 進 Git`、不要貼到公開頻道。如果外洩，可以透過 **Regenerate** 重新產生即可。

```terminal [label="把金鑰放進環境變數"]
export POSTMAN_API_KEY="你剛剛產生的金鑰"
```

### 🔌 在 Claude Code 設定 Postman MCP

用 `claude mcp add` 把官方 MCP Server 接進來（金鑰透過環境變數帶入，不要寫死在指令裡）。

```terminal [label="新增 Postman MCP（HTTP 遠端 Server）"]
claude mcp add --transport http postman https://mcp.postman.com/mcp \
  --header "Authorization: Bearer ${POSTMAN_API_KEY}"
```

![這段指令會讓 Postman 根據專案寫入 MCP 設定](./assets/postman-mcp-init.png)

#### 驗證 MCP 是否連線成功

```prompt [label="在 Claude Code 中確認"]
/mcp
```

| 預期狀態 | 代表意義 |
| --- | --- |
| `postman ✔ connected` | 連線成功，AI 已可呼叫 Postman 工具 |
| `postman ✘ failed` | 金鑰錯誤或過期，回上一步重新產生 API Key |
| 清單中沒有 `postman` | 指令未成功執行，重新跑一次 `claude mcp add` |

![輸入 /mcp 可查看已連線的 MCP Server](./assets/postman-mcp-connected.png)

[lab-session title="🛠️  實作練習"]
- 下載並安裝 Postman，完成註冊登入
- 產生 Postman API Key 並設定環境變數
- 用 `claude mcp add` 接上 Postman MCP
- 用 `export POSTMAN_API_KEY="xxx"` 把金鑰設定在環境變數
- 用 `/mcp` 確認連線（connected）
[/lab-session]

## 根據專案 API 設計 Request

> **好的 Request 集合 = 一份活的 API 文件**
> 每支 API 都要寫清楚`描述`、抽出`變數`，並涵蓋`正確、錯誤、不同權限`的情境，
> 這樣 Request 不只是測試，更是團隊可以照著操作的說明書。

### 🚀 讓 AI 建好整組 Collection

可以直接請 AI 讀專案後端 API，把`環境、變數、所有 API 與各種情境`一次建立完善。

```prompt [label="一次建立完整的 Postman Collection"]
使用 Postman MCP 建立「tibame-practice」的 Workspace

並參考專案後端 API，幫我建立一整組「VMS」測試 Collection：

1. 建立「VMS Local」環境，環境變數含 base_url（預設 http://localhost:3087/api）、admin_token、user_token
2. 依後端功能分類子資料夾，命名規則：名稱（英文），比如：車輛（vehicle）
3. 每個 API 端點只建一支 Request，Request 名稱清楚標示方法與功能以及 api path（如「取得車輛 - vehicles/{id}」），預設參數帶入可成功執行的正確情境；但登入的 Request 要有 Admin 跟一般 User，這樣方便切換測試
4. 登入 Request 加 post-response script：依回應角色自動把 csrfToken 寫入 admin_token / user_token；建立類 Request 自動把回應 id 存成環境變數供後續請求引用
```

![AI 完成的的時候我超感動，過去手動建立超費時間](./assets/postman-collection.png)

> **瑣碎的任務，就交給 AI 吧！**
> 變數、Token 自動寫入、各種情境彼此是有關聯的；與其分多次補，不如`一次給足上下文`，讓 AI 照規格把整組建完，你只要負責確認`情境有沒有漏`。

### 🧪 在 Postman 驗證不同情境

AI 建好後，回到 Postman `親手執行`來確認後端回應符合預期。

#### 🔐 登入 API：先拿到 Token

| 情境 | 輸入 | 預期回應 |
| --- | --- | --- |
| ✅ 正確登入 | `admin / admin12345` | `200`，回傳 `token`（自動寫入變數） |
| ❌ 密碼錯誤 | `admin / wrong` | `401 Unauthorized` |
| ❌ 缺欄位 | 只給 `username` | `400 Bad Request` |

![登入後會順利帶入 Token](./assets/postman-login.png)

#### 🚗 車輛 API：完整 CRUD 與錯誤

| 情境 | 方法 / 路徑 | 預期回應 |
| --- | --- | --- |
| ✅ 查詢列表 | `GET {{base_url}}/vehicles` | `200`，回傳車輛陣列 |
| ❌ 欄位驗證 | `POST` 缺車牌 / 廠牌不在選項內 | `400 Bad Request` |
| ❌ 查無資料 | `GET {{base_url}}/vehicles/99999` | `404 Not Found` |
| ❌ 未帶 Token | 任一車輛 API 不帶 `Authorization` | `401 Unauthorized` |

![錯誤的參數會被成功攔截](./assets/postman-params.png)

> **後端有做選項檢查，Request 也要驗**
> 前面優化時把廠牌、狀態設計成`下拉選單`，後端 API 也會檢查選項。
> 記得跑一張`故意送出不存在選項`的 Request，確認後端真的擋下來（回 `400`）。
> **有點 Vibe Coding 出來的電商平台，會將價格透過前端傳送給後端，如果防護沒做好，那打 API 是什麼就是什麼。**

#### 👥 員工 API：切換 Token 驗證權限

員工管理`僅管理者可操作`，切換 `admin_token` / `user_token` 就能驗證權限控管是否確實。

| 身份 | 使用變數 | 存取員工 API | 預期回應 |
| --- | --- | --- | --- |
| 管理者 | `{{admin_token}}` | 可檢視 / 新增 / 編輯 / 刪除 | `200 / 201` |
| 一般使用者 | `{{user_token}}` | 不允許 | `403 Forbidden` |
| 未登入 | 不帶 Token | 不允許 | `401 Unauthorized` |

![同一支 API 切換 Token，驗證權限是否確實擋住](./assets/postman-permission.png)

[lab-session title="🛠️  實作練習"]
- 用一段指令請 AI 建好整組 VMS Collection（環境、變數、所有 API 與情境）
- 在 Postman 驗證登入 / 車輛 / 員工的正確、錯誤、權限情境
[/lab-session]

---

# 部署上線：用 Docker 打包，透過 Zeabur 部署上線

> **能在 localhost 跑，不等於能上線**
> 產品要讓別人使用，建議先用 Dockerfile `定義標準化的打包方式`，再`部署到雲端`。

## 用 Dockerfile 定義專案的打包方式

### 🐳 為什麼要先寫好 Dockerfile？

- **環境一致**：Dockerfile 把 `Node 版本、套件、設定`通通寫成明確步驟，避免發生「在我電腦可以跑」的窘境
- **一次設計、到處建置**：同一份 Dockerfile，`本地與雲端 build 出來的 image 一模一樣`，Zeabur 拿去就能照著建
- **可重現**：每次部署都從`同一份設計圖`建出來，出問題容易回溯是`程式還是環境`

### 📝 請 AI 寫 Dockerfile | branch:feature/add-docker-production-setup

請 AI 依專案結構產生 `Dockerfile` 與 `.dockerignore`。

```prompt [label="生成 Dockerfile"]
扮演一位專業的 DevOps，幫專案前、後端寫一份多階段建置（multi-stage build） Dockerfile：
1. build 階段安裝套件、編譯
2. 最終映像只保留執行所需檔案，基底用輕量的 node:24-alpine
3. 建立 .dockerignore，排除 node_modules、.env、.git，避免 image 過大或把機密打包進去
4. 建立 docker-compose-prod.yml，可以完成前後端與資料庫的啟動，只有前端有對外端口
最後將啟動指令更新到 README.md
```

> **為什麼要 multi-stage 與 .dockerignore？**
> `multi-stage` 讓最終 image 不含編譯工具，`體積更小、攻擊面更少`；
> `.dockerignore` 確保 `.env`、金鑰`不會被打包進 image`，這是上線前最容易踩的雷。

![AI 依專案結構產生的 Dockerfile](./assets/dockerfile-generated.png)

![設計模擬正式環境啟動的檔案 docker-compose-prod.yml](./assets/docker-compose-generated.png)

### 🔨 本地 build 並跑起來驗證

上雲之前，先在本地確認 image `build 得起來、跑得動`。

```terminal [label="生成前後端資料庫 image 並啟動"]
docker compose -f docker-compose-prod.yml up -d --build
```

![在 Docker Desktop 觀察執行後啟動狀態](./assets/docker-desktop.png)

> **本地能跑，雲端才有意義**
> 如果 image 在本地就起不來，丟到雲端只會`更難 debug`。先在熟悉的環境驗證，是最省時間的做法。
> 雖然後續用 Zeabur 作為部署範例，但有了這個`docker-compose-prod.yml 在 AWS、GCP 等平台都很好部署`。

[pr from="feature/add-docker-production-setup" to="develop" title="chore: 新增 Docker production 部署環境" url="https://github.com/deancourse/tibame-lesson3/pull/7"]

[lab-session title="🛠️  實作練習"]
- 請 AI 產生前後端的 Dockerfile 與 .dockerignore
- 本地 docker build 出 image 並跑起來
- 用瀏覽器驗證回應正常
[/lab-session]

## 用 Zeabur 把產品搬上雲端

### ☁️ 為什麼選 Zeabur 這類託管平台？

> **使用講者連結註冊有 29 美金（有效期為 30 天）**
> 使用講者連結註冊: https://zeabur.com/events?code=deanlin0613 可以`免費體驗`

| 自己租 VM | 用 Zeabur |
| --- | --- |
| 要自己裝環境、設防火牆、上 SSL | 平台`自動處理`建置、TLS、網域 |
| 出事要自己 SSH 進去查 | 後台或用 Skill `直接看 logs` |

對個人與小團隊，把`維運瑣事交給平台`，才能把時間留給產品本身。

註冊完成後，到[付款方式](https://zeabur.com/account/billing)頁面，確認餘額有 29 美金，`無需綁信用卡`。

![29 美金體驗期限為 30 天](./assets/check-free-credits.png)

### 🌏 建立伺服器

[註冊 Zeabur 後](https://zeabur.com/events?code=deanlin0613)，我們要來建立伺服器

[flow]
1. 建立伺服器 - 從 Zeabur 購買伺服器
2. 服務商 - AWS、GCP 最穩定
3. 機房區域 — 挑`離使用者最近`的節點，例如台灣使用者選 `亞洲`
3. 確認方案 — 免費方案足夠本堂課練習，正式營運再升級
[/flow]

> **機房為什麼要選近的？**
> 機房離使用者越近，`網路延遲越低`、體驗越好；台灣使用者選東京通常比選美國節點快得多。

![建立 Server 並選擇離使用者最近的機房](./assets/zeabur-create-server.png)

> **個人經驗**
> 使用 AWS、GCP 的伺服器通常`最穩定`，但相對的`金額較高`。
> 如果想要節省經費，其他的服務商也不錯，但如果你選擇`中國區域`，Docker image 與一些連線`需要額外調整`。

[lab-session title="🛠️  實作練習"]
- 用[推薦連結](https://zeabur.com/events?code=deanlin0613)註冊 Zeabur
- 在[付款方式](https://zeabur.com/account/billing)，確認餘額有 29 美金
- 建立伺服器
[/lab-session]

### 🧩 安裝 Zeabur 官方 Skill 執行更順利

Zeabur 提供`官方的 Claude Code Skill`。它把`部署、查 log、綁網域、管資料庫`等操作包成一組 Skill，白話文操作更方便。

```terminal [label="安裝 Zeabur 官方 Skill（在終端機執行）"]
claude plugin marketplace add zeabur/zeabur-claude-plugin
claude plugin install zeabur@zeabur
```

```terminal [label="確認自己登入成功"]
確認我現在登入的 Zeabur 帳號
```

![第一次執行時，會需要透過瀏覽器登入給予授權](./assets/zeabur-skill-login.png)

> **多帳號警告**
> 如果有多個 Zeabur 帳號，請在自己的電腦登出，`確認當前所使用的帳號`。
> Zeabur Skill 雖然好用，但`犯錯率並不低`，尤其如果你`有綁信用卡，那更危險`。

### 🚀 用白話文完成部署 | branch:feature/add-zeabur-deployment-setup

登入帳號後，用白話文就能讓 AI 部署。

![直接給予對應的伺服器 ID 能加快部署效率](./assets/zeabur-server-info.png)

```prompt [label="部署到 Zeabur"]
Zeabur 使用這個伺服器 [伺服器 id]
參考 docker-compose-prod.yml 的架構，用 Zeabur 把這個專案部署到伺服器
注意：Zeabur 的 Docker 服務一律監聽 8080，所有服務（proxy、web、api）都改成聽 8080
然後使用「vms-deanlin」作為子域名，若重名就在後面加上 6 位 hash 值
```

> **使用 Skill 要注意的事情**
> Zeabur Skill 將的`建立服務、設定、查 log`都變成 AI 能呼叫的工具，你描述`想達成的結果`，AI 負責`一步步呼叫 API`，不用在到後台來回點。
> 但使用什麼伺服器，我個人建議還是`自己選擇會更好`。
> 另外第一次部署大約`會需要 15~30 分鐘`，中間 Zeabur 會遇到各式各樣的錯誤，然後想辦法自己解決。

![在儀表板確認 Zeabur 成功完成部署](./assets/zeabur-dahboard-deployed.png)

### ✅ 驗證部署是否成功

![登入頁可以渲染](./assets/zeabur-dahboard-load.png)

> **範例專案的管理者帳密僅為練習用，登入後記得調整密碼**

![管理者可以登入](./assets/zeabur-dahboard-login.png)

> **小提醒**
> 目前的免費方案，是`無法在線上看到資料庫內容`的，如果想看到就需要拿出魔法小卡，升級到 Dev 級別。
> 提醒大家，這個真的要小心，因為`你可能會沒有意識到自己正在消費`。

[pr from="feature/add-zeabur-deployment-setup" to="develop" title="chore: 新增 Zeabur 部署設定" url="https://github.com/deancourse/tibame-lesson3/pull/8"]

[lab-session title="🛠️  實作練習"]
- 使用 Zeabur 完成部署作業
- 取得對外網址
- 打開網址，確認線上服務可以正常登入
[/lab-session]

## 部署完成只是下一個開始

### 🛡️ 距離完善還有很長一段路  | branch:none

上線前，我們在意的是`功能做不做得出來`；但上線後你會發現，**「能跑」只是基礎**。

真實世界還有`攻擊、流量、效能`等課題在等著你。

#### 機器人瘋狂嘗試登入，怎麼辦？
- **常見攻擊**：`暴力破解`（用程式一秒試幾百組密碼）、`撞庫攻擊(憑證填充攻擊)`（拿其他網站外洩的帳密來你家試，因為多數人到處用同一組密碼）
- **應對方案**：登入`失敗 5 次就鎖定`一段時間（Rate Limiting）、`封鎖惡意 IP`、重要操作加上`兩步驟驗證`

#### 使用者變多，服務開始變慢？
- **常見情境**：一台機器扛不住，CPU 跑滿、回應越來越慢，甚至`直接掛掉`
- **應對方案**：`垂直擴充`（換更大台的機器，最簡單但有上限）、`水平擴充`（多開幾台機器分流，搭配 Load Balancer 把流量分配出去）

#### 資料庫越來越慢，查一筆要好幾秒？
- 常見原因：資料量從 1 千筆變 100 萬筆後，`沒建索引`的查詢就像在沒有目錄的字典裡逐頁翻找
- **應對方案**：幫常查的欄位`建立索引`（Index）、用`讀寫分離`分散壓力、熱門資料放進 `Redis` 這類快取，不用每次都問資料庫

> **不用現在就會，但要知道它們存在**
> 這些問題`通常不會在第一天發生`，但等它發生時才開始學就太晚了。
> 遇到問題時，可以把情境描述給 AI，讓它幫你`分析現況、給出符合規模的方案`。

### 🌐 註冊自己的網域，更有專業感

部署完成後，平台給你的預設網址通常長這樣：`vms-dean.zeabur.app`。

練習夠用，但如果你想把作品`放上履歷、分享給客戶`，自己的網域會專業得多。

| 平台預設網址 | 自己的網域 |
| --- | --- |
| `vms-deanlin.zeabur.app` | `vms.dean.net` |
| 一看就知道是託管平台 | 像一個`正式的產品` |
| 平台收回或改名就失效 | 網域跟著你，`搬家也帶得走` |

先看懂一條網址是怎麼組成的：

[html src="./html/url-structure.html"]

- 你買的其實是`主網域 + 頂級網域`（`dean.net`）這一段
- 買下來後，`子網域`隨你免費開（`vms`、`blog`、`api`⋯⋯），一個網域就能掛多個專案

[flow]
1. 挑選網域 — `主網域 `想一個`好記的名字`，`頂級網域`建議選擇「**.com、.dev、.app、.net**」
2. 註冊購買 — 一年通常只要幾百塊台幣，可以直接在 Zeabur 上購買（或是選擇 `Namecheap/Cloudflare`）
3. 綁定服務 — 在 Zeabur 後台或直接請 AI 幫你把網域綁到服務上
[/flow]

> **個人經驗**
> 網域是少數`花小錢、長面子`的投資；
> 同一個網域還能透過`子網域`掛上多個專案（例如 `blog.dean.com`、`vms.dean.com`），買一次用很久。

[lab-session title="🛠️  實作練習"]
- 請 AI 檢查目前部署的安全疑慮，並修正高風險項目
- （選做）購買一個自己的網域，綁定到 Zeabur 服務上
[/lab-session]


---


# 技術名詞：了解這系列課程用到的技術

> 用分類的方向來呈現所有技術，說明功能與在專案的使用時機

## 🤖 AI 助手核心概念

> 到底什麼是 AI Agent，以及跟它溝通時會遇到的名詞。

| 名詞 | 白話解釋 | 課程中的使用時機 |
| --- | --- | --- |
| **AI Agent** | 不只是「問一句答一句」的聊天機器人，而是能理解任務、操作你的檔案、自己串好多個步驟，從頭到尾把事情做完的 AI 助手 | 從整理圖片、彙整文件到寫整套系統 |
| **Claude Code** | Anthropic 推出的 AI Agent 工具，在終端機輸入 `claude` 就能跟它對話、請它動手做事 | 第 1 堂安裝後，三堂課都用它來開發 |
| **終端機（Terminal）** | 用「打字下指令」操作的黑色視窗；Claude Code 就在這裡操作 | 安裝工具、啟動 Claude Code、執行各種指令 |
| **IDE** | 程式碼編輯器（如 Cursor、VSCode、Antigravity），工程師寫程式的主要工作環境，內建終端機跟檔案管理 | 第 1 堂擇一安裝，整個課程的操作介面 |
| **Token** | AI 計費與計算容量的單位，可以想成 AI 的「貨幣」；講越多話、讀越多檔案，消耗越多 | 課程不斷提醒：限制讀取範圍、不要亂裝 Skill，都是為了省 Token |
| **Context（上下文）** | AI 當下「記得住的對話內容」，容量有限；塞太滿會被壓縮（Compact），AI 就可能忘記前面講過的事 | 用 `/clear` 開新對話、裝 Status Line 監控，都是在管理它 |
| **多模態（Multimodal）** | AI 不只看得懂文字，還能看圖片、聽聲音 | 第 1 堂讓 AI 辨識圖片並自動分類 |
| **Prompt（提示詞）** | 你對 AI 下的指令。描述得越清楚，AI 做得越準 | 每一堂課的對話框內容都是 Prompt |
| **Plan Mode** | Claude 的「先規劃、不動手」模式，AI 會先提出方案讓你確認，再開始改東西 | 第 2 堂用它請 AI 提出 UI 優化方案 |
| **Status Line** | 顯示在 Claude Code 下方的狀態列，讓你看到 Token 用量、Context 剩多少 | 第 1 堂安裝，避免「額度用完了都不知道」 |
| **Sandbox（隔離環境）** | 一個跟你電腦完全隔開的「安全遊戲室」，AI 在裡面怎麼玩都弄不壞你的真實檔案 | 第 2 堂搭配 Docker + Dev Containers，讓 AI 放手執行 |

## 🧩 讓 AI 更聽話的四大機制

> AI 預設是「每次都從零開始」的，這四個機制就是把你的經驗「教」給它的方法，也是課程最重要的觀念。

| 名詞 | 白話解釋 | 課程中的使用時機 |
| --- | --- | --- |
| **Rules（CLAUDE.md）** | AI 的「員工手冊」，每次對話都會先讀，記錄專案技術、規範、注意事項；寫太多會佔用 Context | 可以用 `/init` 初始化，讓 AI 快速理解專案 |
| **Agent Skills** | AI 的「SOP」，把任務的做法寫成文件放著；AI 看到相關任務會`自動觸發`，教會一次永遠記得 | 三堂課的主軸：音檔轉字幕、生成講義、Commit / PR / 測試...都做成 Skill |
| **Commands** | 要你`手動輸入 /` 才會執行的指令，適合把多個 Skills 串成完整工作流 | 第 1 堂用 `/video-srt-card-des` 一次跑完字幕、字卡、文案 |
| **MCP** | 一種「標準轉接頭」，讓 AI 能用統一的方式呼叫外部工具的功能（像 Postman、瀏覽器） | 第 2 堂接 Playwright MCP 驗證網頁、第 3 堂接 Postman MCP 建測試 |
| **Plugin** | 擴充 Claude Code「本身」功能的外掛（可參考此[專案自行製作](https://github.com/dean9703111/promo-writer)） | 第 2 堂安裝 context7、claude-md-management |
| **Hook** | 在 AI 執行動作「前後」自動插入的檢查程式，例如執行指令前先攔截危險操作 | 第 1 堂用 PreToolUse Hook 加強危險指令防護 |
| **Permissions（權限設定）** | 規定 AI 哪些指令可以做、哪些絕對禁止（例如 `rm -rf` 刪檔案、`sudo` 最高權限） | 第 1 堂的安全設定 |
| **skill-creator** | 用對話就能產生 Skill 骨架，不用從零手寫 | 第 1 堂用它做出第一個 commit Skill |
| **context7** | 幫 AI 即時抓取「套件最新文件」的 Plugin；因為 AI 的知識有時效性，不補充就可能寫出過時程式 | 第 3 堂升級專案套件時使用 |

## 🛠️ 開發環境工具

> 把這些想成「廚房裡的基本廚具」：AI 是大腦，這些工具是它的雙手，缺了它什麼都做不了。

| 名詞 | 白話解釋 | 課程中的使用時機 |
| --- | --- | --- |
| **Node.js** | 讓 JavaScript 程式能在你電腦上執行的環境；本課程的前後端專案都靠它跑 | 第 1 堂安裝，執行專案與各種工具 |
| **nvm** | Node.js 的「版本切換器」，不同專案需要不同版本時，一行指令就能切換 | 第 1 堂用它安裝 Node.js LTS 版 |
| **npm / npx** | npm 是 Node.js 的「套件商店＋安裝員」；npx 則是「不安裝、直接執行一次」的快捷方式 | `npm install` 裝套件、`npx` 跑 dotagents 等工具 |
| **pnpm** | npm 的省空間版本：所有專案共用同一份套件倉庫，避免每個資料夾都塞幾百 MB 的重複檔案 | 第 3 堂搭配 Worktree 多資料夾時使用 |
| **Python / pip** | 程式語言與它的套件安裝員；很多 Agent Skills 的腳本（scripts）是用 Python 寫的 | 第 1 堂解析 PDF/Word/PPT、音檔轉字幕都靠它 |
| **uv** | Python 界的新一代「環境＋套件管理員」，會自動找對的 Python 版本、自動裝缺的套件 | 第 1 堂 audio-to-srt Skill 背後用它 |
| **alias（別名）** | 幫指令取「綽號」，例如讓 `python` 跟 `python3` 都指向同一個版本，避免版本錯亂 | 第 1 堂統一 Python 版本 |
| **symlink（軟連結）** | 檔案的「捷徑」：檔案本體放在 A 處，但在 B 處放一個捷徑指過去，兩邊看到的是同一份 | 第 2 堂把 `~/.claude/` 設定連回 GitHub Repo 管理 |
| **Shell Script** | 把一連串終端機指令寫成一個檔案，執行一次就自動跑完所有步驟 | 第 2 堂的 `install.sh` 一鍵建立所有軟連結 |
| **環境變數（.env）** | 存放「不能公開的祕密」（資料庫密碼、金鑰）的檔案，程式啟動時讀取，且絕不上傳到 GitHub | 專案的資料庫帳密、JWT 密鑰... 都放這 |

## 🌿 版本控制與團隊協作

> 想像 Git 是專案的「時光機＋多人共筆系統」：每個改動都有存檔點，出事隨時可以回到過去。

| 名詞 | 白話解釋 | 課程中的使用時機 |
| --- | --- | --- |
| **Git** | 版本控制工具，幫程式碼拍「存檔快照」，記錄誰在什麼時候改了什麼 | 第 1 堂安裝，貫穿全課程 |
| **GitHub** | 把 Git 存檔放上雲端的網站，讓多人協作、多台電腦同步 | 存放課程範例與你的專案 |
| **Repository（Repo）** | 一個專案的「資料倉庫」，包含所有程式碼與歷史紀錄 | 每堂課都會 clone 課程範例 Repo |
| **commit** | 一次「存檔」動作，附上訊息說明這次改了什麼 | 設計 Commit Skill 讓 AI 自動拆分、寫出規範的訊息 |
| **push / pull** | push 是把本地存檔「上傳」到 GitHub；pull 是把雲端更新「下載」回來 | 每次完成功能後同步 |
| **branch（分支）** | 從主線「分岔出去的平行世界」，在分支上開發不會影響正式版本 | 設計 Branch Name Skill 統一命名規則 |
| **Git Flow** | 一套分支管理策略：`main 放穩定版、develop 放開發版、feature 開發新功能、hotfix 救火` | 第 2 堂導入，保護對外服務的穩定性 |
| **Pull Request（PR）** | 「請求合併」：把分支的改動整理成一份說明文件，讓隊友審核通過後才合併進主線 | 設計 PR Skill 自動生成說明，第 3 堂每個功能都走 PR |
| **Code Review** | 隊友（或另一個 AI）幫你檢查程式碼有沒有問題，再決定能不能合併 | 第 2 堂用 `/codex:review` 讓 AI 當第二雙眼睛 |
| **git stash** | 把「寫到一半的東西」先塞進臨時抽屜，切去忙別的，回來再拿出來 | 第 3 堂說明沒有 Worktree 時的痛點 |
| **Git Worktree** | 讓同一個專案「分身」出多個資料夾，每個停在不同分支；開發、Review、修 Bug 三線並行不打架 | 第 3 堂搭配 Git Worktree Manager 外掛使用 |
| **Branch 保護規則（Ruleset）** | GitHub 上的「安檢門」：規定 main/develop 必須走 PR、測試通過才能合併，沒有例外 | 第 3 堂設定，故意弄壞測試驗證真的會被擋 |
| **GitHub CLI（gh）** | 用終端機指令直接操作 GitHub（開 PR、建 Issue），不用切回瀏覽器點來點去 | 第 2 堂安裝，PR Skill 用它建立 PR |

## 📐 規格與開發流程

> 「先想清楚再動手」的方法論：沒有規格，AI 的「快」會變成未來的「債」。

| 名詞 | 白話解釋 | 課程中的使用時機 |
| --- | --- | --- |
| **Vibe Coding** | 全憑感覺跟 AI 對話、邊聊邊生程式的開發方式；快是快，但結果不可控、難維護 | 課程要解決的痛點：從玩具走向產品 |
| **SDD（規格驅動開發）** | 先把「要做什麼」寫成規格文件，AI 照著規格做事；改功能時也有文件可追溯 | 第 2 堂的主軸 |
| **OpenSpec** | 實現 SDD 的工具，引導 AI 走「提案 → 設計 → 規格 → 任務」流程，文件存在 `openspec/` 資料夾 | 第 2 堂從 0 到 1 建車輛管理系統、新增 Audit Log |
| **proposal / design / specs / tasks** | OpenSpec 的四份文件：目標範圍、技術選擇、詳細規格、任務清單（做完自動打勾） | 每次用 OpenSpec 開發都會生成 |
| **歸檔（archive）** | 功能驗證完成後，把這次的變更規格「合併回主規格文件」，留下完整紀錄 | 每個功能完成後執行，避免知識斷層 |
| **單一責任原則** | 一個 Skill（或程式）只專心做好一件事，要改的時候才不會改 A 壞 B | 第 1 堂設計 Skill 的核心心法 |

## 🏗️ 全端系統組成

> 一個完整的網站系統像一間餐廳：前端是「用餐區」、後端是「廚房」、資料庫是「倉庫」。

| 名詞 | 白話解釋 | 課程中的使用時機 |
| --- | --- | --- |
| **前端** | 使用者看到、點到的網頁畫面與操作介面（餐廳的用餐區） | 車輛管理系統的登入頁、儀表板 |
| **後端** | 在背後處理資料、判斷邏輯的程式（看不到的廚房） | 處理登入驗證、車輛資料的增刪改查 |
| **資料庫** | 儲存所有資料的地方，可以想成一個超大型、會自動整理的 Excel | 存放員工、車輛、操作紀錄 |
| **API** | 前端跟後端之間的「點餐窗口」：前端送出請求（Request），後端回應結果（Response） | 用 F12 觀察、用 Postman 測試 |
| **React** | 最流行的前端框架之一，用「元件」組裝網頁畫面 | 車輛管理系統的前端 |
| **Vite** | 前端專案的「開發伺服器＋打包工具」，讓開發時改了程式畫面馬上更新 | 前端專案的地基 |
| **shadcn/ui、Magic UI** | 現成的漂亮 UI 元件庫，按鈕、表格、彈窗直接拿來用 | 讓 AI 生成的畫面不那麼樸素 |
| **Express** | Node.js 上最常用的後端框架，用來接收請求、回傳資料 | 車輛管理系統的後端 |
| **Prisma** | 後端跟資料庫之間的「翻譯官」（ORM），讓你用程式語言操作資料庫，不用手寫 SQL | 後端存取 Postgres 的橋樑 |
| **Postgres（PostgreSQL）** | 老牌、可靠的關聯式資料庫 | 課程專案的資料庫，用 Docker 啟動 |
| **pgAdmin** | Postgres 的「圖形化管理介面」，用網頁就能瀏覽、編輯資料庫內容 | 驗證資料有沒有被測試污染 |
| **CRUD** | 新增（Create）、讀取（Read）、更新（Update）、刪除（Delete）——資料操作的四個基本動作 | 車輛、員工管理頁的核心功能 |
| **Migration** | 資料庫的「裝修工程紀錄」：每次改資料表結構都留下紀錄，別人照著跑就能得到一樣的資料庫 | `npm run db:migrate` 建立 schema |
| **Seed / Mock data** | 幫資料庫「塞入初始資料／假資料」，方便測試各種情境，不用手動一筆筆建 | `npm run seed:mock` 塞 30 員工＋50 車輛 |
| **JWT / Cookie / Session** | 三種「證明你已登入」的方式：JWT 像防偽通行證、Cookie 是瀏覽器幫你帶著的小卡、Session 是號碼牌（本人資料鎖在伺服器） | 第 2 堂比較四種使用者驗證方案 |
| **OAuth** | 「用 Google / FB 帳號登入」背後的機制，把驗證身份外包給大公司 | 驗證方案比較表中介紹 |
| **HTTP 狀態碼** | API 回應的「結果代號」：200 成功、400 請求有誤、401 沒登入、403 沒權限、404 找不到 | Postman 測試各種情境的預期回應 |
| **Chrome DevTools（F12）** | 瀏覽器內建的「透視鏡」，能看到網頁載入了什麼、打了哪些 API、有沒有報錯 | 第 2 堂用 Network 分頁觀察後端 API |

## ✅ 品質保證與測試

> AI 寫程式的速度遠超人類檢查的速度，這一類工具的精神是：**與其要求 AI 不犯錯，不如設計「犯錯會被自動攔下」的機制。**

| 名詞 | 白話解釋 | 課程中的使用時機 |
| --- | --- | --- |
| **Lint（ESLint）** | 程式碼的「自動糾察隊」，檢查風格不一致、沒用到的變數、低級錯誤 | 第 2 堂故意寫錯誤程式體驗它的攔截 |
| **pre-commit** | 在每次 commit「之前」自動跑的檢查，Lint 不過、測試不過就不准存檔 | 第 2 堂體驗 commit 被擋下 |
| **單元測試 / 整合測試** | 單元測試驗證「單一小功能」對不對；整合測試驗證「多個部分組起來」能不能動 | `npm run test` 執行，CI 自動跑 |
| **測試覆蓋率** | 測試程式「涵蓋了多少比例的程式碼」；不用追求 100%，重要邏輯有測到才是重點 | GitHub Actions 自動產報告供下載 |
| **MockDB** | 「模擬別人」：假裝成第三方 API 的回應，測試時不用真的打對方服務 | 第 3 堂兩種測試方案比較 |
| **TestDB** | 「隔離自己」：另開一個可拋棄的測試專用資料庫，測試怎麼弄髒都不影響正式資料 | 第 3 堂修復「測試污染資料庫」的問題 |
| **Postman** | 後端 API 的「測試台」，把每支 API 存成可重複執行的 Request 卡片，能模擬錯誤情境、切換身份 | 第 3 堂搭配 MCP 讓 AI 一次建好整組測試 |
| **Playwright MCP** | 讓 AI 能「操作真的瀏覽器」：點擊、填表、截圖，驗證畫面與互動 | 第 2 堂驗證 Audit Log 頁面功能 |
| **Chrome DevTools MCP** | 讓 AI 能看「瀏覽器底層」：實際的 API 請求、console 錯誤、效能數據 | 與 Playwright 互補，診斷網路與底層問題 |
| **CI（持續整合）** | 「每次交作業，自動批改」：每次 push 自動跑 Lint、測試、Build | 第 3 堂用 GitHub Actions 實作 |
| **CD（持續部署）** | 「批改通過，自動上架」：檢查沒問題後自動打包、部署上線 | CI/CD 概念介紹 |
| **GitHub Actions** | GitHub 提供的自動化機器人：在 `.github/workflows/` 放一份設定檔，描述「什麼事件發生時做哪些事」 | 第 3 堂設計「Lint → 前後端平行測試 → 覆蓋率報告」流程 |

## 🚀 打包與部署上線

> 「在我電腦可以跑」是工程師最常見的災難；這一類工具確保你的系統搬到任何地方都能跑。

| 名詞 | 白話解釋 | 課程中的使用時機 |
| --- | --- | --- |
| **Docker** | 「標準化的容器」：把專案需要的環境（程式、套件、設定）整個打包，不管誰的電腦打開就能跑 | 第 2 堂啟動資料庫、第 3 堂打包整個系統 |
| **Dockerfile** | 容器的「打包設計圖」，一步步寫明要裝什麼、怎麼建置 | 第 3 堂請 AI 撰寫前後端的 Dockerfile |
| **Image / Container** | Image 是照設計圖做好的「模具」，Container 是用模具跑起來的「實體」；一個 Image 可以開很多個 Container | 本地 build 驗證後才上雲端 |
| **multi-stage build** | 分階段打包：編譯用的工具留在第一階段，最終成品只保留執行必需的檔案，體積更小、更安全 | Dockerfile 的設計要求 |
| **.dockerignore** | 打包時的「排除清單」，確保 `.env` 密碼、`node_modules` 不會被打進貨櫃 | 避免機密外洩、Image 過大 |
| **docker-compose** | 「多貨櫃調度表」：一個檔案描述資料庫、前端、後端怎麼一起啟動 | `docker compose up -d` 一鍵啟動全部服務 |
| **Dev Containers** | IDE 外掛，讓你「直接在 Docker 容器裡開發」，搭配出一個安全的隔離環境 | 第 2、3 堂建立 Claude Code Sandbox |
| **Zeabur** | 雲端託管平台：你給它 Docker 設計圖，它幫你處理伺服器、網址、SSL 憑證等維運瑣事 | 第 3 堂用白話文＋官方 Skill 完成部署 |
| **port（連接埠）** | 同一台電腦上不同服務的「門牌號碼」，例如前端 3087、pgAdmin 5050；兩個服務搶同一個門牌就會衝突 | 啟動失敗時最常見的原因 |
| **網域（Domain）** | 你的網站地址（如 `dean.net`）；買下主網域後，子網域（`vms.dean.net`、`blog.dean.net`）隨你免費開 | 第 3 堂讓作品更專業的選做題 |
| **API Key** | 代表「你本人權限」的長串金鑰，給程式或 AI 代替你操作服務用；絕不能 commit 進 Git 或公開 | Postman MCP 的授權設定 |
| **Rate Limiting** | 「限流」：例如登入失敗 5 次就鎖一段時間，防止機器人暴力嘗試密碼 | 上線後的安全課題 |
| **Load Balancer** | 「分流員」：流量太大時，把使用者分配到多台機器，避免一台被打掛 | 水平擴充的關鍵角色 |
| **Index（索引）** | 資料庫的「目錄頁」：資料百萬筆時，沒索引就像在沒目錄的字典逐頁翻找 | 資料庫變慢時的第一個解法 |
| **Redis（快取）** | 超高速的「臨時記憶層」：熱門資料放這裡，不用每次都去問資料庫 | 上線後效能優化的方向 |

# 總結：從「讓專案跑起來」到「上線到公開環境」

[summary]
- 🧪 **用測試取代人工驗證** | 給 AI 一個動了也沒關係的 TestDB，讓測試清單先過人類 Review；**測試不是浪費時間，是在幫你加速開發**
- 🤖 **把「人會忘記的事」交給 CI/CD** | 每次 push 自動跑 Lint 與測試，搭配 Branch 保護規則，**不管是人還是 AI 寫的 Code，都得通過同一道關卡**
- 🌳 **用 Worktree 處理多線任務** | 開發、Code Review、修 Bug 各開一個資料夾互不干擾；**把精力放在 Review，而不是切換分支**
- 📮 **讓 AI 操作外部工具** | Postman 建整組測試情境、Zeabur 白話文部署；**你描述目標，AI 負責一步步呼叫工具**
- 🚀 **上線只是下一個開始** | 上線後的攻擊、流量、效能課題，**不用現在就會，但要知道它們存在**
[/summary]

## 三堂課的旅程：AI 時代的開發者價值

- **第 1 堂** — 把瑣事交給 AI Agent，用 Agent Skills 讓教過一次的事永遠記得
- **第 2 堂** — 用規格驅動開發（SDD），讓 AI 的「快」不會變成未來的「債」
- **第 3 堂** — 補上測試、自動化、部署，讓做出來的東西**敢交付、能維護、成功上線**

> **真正值錢的不是工具，而是知道什麼時候用、怎麼組合**
> 工具會一直換，但`判斷問題 → 設計解法 → 驗證結果`的能力會一直跟著你。
> 好的結果，不該靠消耗 Token 拼運氣；而是靠**清楚的方向、可重複的工作流、以及人類在關鍵節點的決策**。

[qa-session title="Q&A 時間"]
[/qa-session]
