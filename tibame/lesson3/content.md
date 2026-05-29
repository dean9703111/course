


---

# 導入測試：讓維護與擴充更有底氣

> 市場不會為爛產品買單；加入自動化測試，是 Vibe Coding **從玩具走向產品的關鍵**

> 其實就算你不說，AI 有時也會自己主動加上去，但這個行為是不可空的

## 建立適合專案的測試工作流

### 🔀 驗證生成測試的 Skill

[flow]
1. 建立資料夾 — 存放測試清單
2. AI 撰寫清單 — 類型、說明、輸入、期待輸出
3. 人類 Review — 確認情境有無遺漏
4. AI 撰寫測試 — 描述與文件一致
5. 自主驗證 — 最多嘗試 5 次
[/flow]

```prompt [label="生成測試案例"]
（拖入要測試的檔案，ex: src/pages/LoginPage.tsx）
生成測試
```

#### 人類要確認測試清單符合預期

![會建立 doc 資料夾來存放測試清單](./assets/test-doc.png)

#### 確認生成的測試運作正常

![可輸入 npm run test 來手動驗證](./assets/npm-run-test.png)

### 💡 實務建議
- 不要一口氣生成所有測試，`先放一個檔案`確認結果符合預期
- 每個頁面/模組有`獨立的測試程式`，方便定位問題
- 測試案例會隨規格變更而調整，`不可能一次到位`

> **千萬不要嫌寫測試浪費時間，測試其實是在幫你加速開發。**
> 現在儘管有 AI 輔助撰寫測試程式，我們還是要仔細檢查 AI 給的測試情境是否合理、有遺漏。

[lab-session title="🛠️  實作時間" duration="15 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 觸發生成測試的 Skill
- 確認測試清單符合預期
- 驗證測試程式運行如預期
[/lab-session]

## 加入 CI/CD 自動化

### 🔁 加入 GitHub Action 自動化

- 每次推送到 GitHub 都觸發測試
- 測試完畢生成覆蓋率報告

```prompt [label="自動化測試"]
我希望在 GitHub Action 加入自動化測試的流程
每一個分支將更新推送到 GitHub 都會觸發一次自動化測試
測試完畢後，要生成覆蓋率報告讓我下載
```

![GitHub Action 的 CI/CD](./assets/github-cicd.png)

> **測試覆蓋率不需追求 100%**
> 重要邏輯都包含在測試程式內，才是最重要的；有了測試，規格書上的功能才能被真正驗證。

[lab-session title="🛠️  實作時間" duration="15 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 加入 GitHub Action 自動化
- 切換 branch
- 生成 commit
- Push 到 GitHub
- 建立 Pull Request 到 develop
[/lab-session]

### 🛡️ 設計保護 Branch 的規則

**免費版必須為「Public」的 Repo 才能進行設定**

- 設定 `main` / `develop` 為保護分支
- 只有「通過測試」的分支才能合併

![選擇 Settings ⭢ 選擇 Branches 下面的「Add branch ruleset」](./assets/branch-rule.png)

- name 的部分你可以輸入「Protect main branch」
- 「Enforcement status」切換到 Active 才會生效
- Target branch 需要**分兩次**加入：先輸入 `main` 按 Add，再輸入 `develop` 按 Add（不能用逗號寫在同一筆，否則 Applies to 0 targets）

![Target branch 輸入要保護的 branches](./assets/protect-branches.png)

- 把`Require a pull request before merging`這個必須「用 PR 才能合併的選項」打勾。
- 將`Require status checks to pass`打勾，以及下面的`Require branches to be up to date before merging`」`也打勾，這是在設定「測試必須通過才能合併」。
- 點擊`Add Checks`，搜尋 test，然後把他打勾，這就是要檢查的項目。

![自動生成的 Test 名稱可能略有不同](./assets/test-check.png)

### 🎯 模擬失敗情境，確認會擋住

1. 故意把測試案例弄失敗
2. 建立「Pull request」，確認合併目標為「main/develop」時是否會無法合併

![測試不過時，Merge pull request 無法點擊](./assets/merge-disable.png)

> **小提醒**
> 你注意到 `pre-commit` 沒有觸發嗎？如果觸發的話，根本不會等到 CI/CD 時才發現問題。
> 你可以請 AI 改寫 pre-commit 讓他涵蓋到這塊的測試：`我希望 pre-commit hook 能攔截 vehicle-management 的測試失敗`

[lab-session title="🛠️  實作時間" duration="10 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 確認目前為 Public Repo
- 設計保護 Branch 的規則
- 故意把測試案例弄失敗後更新到雲端
- 確認合併目標為「develop」時會無法合併
[/lab-session]

## 認識 Git Worktree，了解多人專案協作技巧

### 🌳 讓每個 AI Agent 有獨立的工作區

- 多人協作專案時，你可能要同時撰寫**新功能、Code Review、修 Bug**
- 用 Git Stash 時常會混亂
- 使用 Worktree 可以區隔工作區，AI 可以獨立運作

![可以搭配 Git Worktree Manager 管理](./assets/git-worktree.png)

### 🌳 開發、測試、修 Bug 三線並行

| 工作情境 | Worktree 用途 |
| --- | --- |
| **開發新功能** | 在獨立目錄開分支開發，不影響主線 |
| **Code Review** | 切到別人的分支，不需要 stash 當前工作 |
| **修緊急 Bug** | 直接從 main 開一個 worktree 修，不打斷進行中的開發 |

> **使用心得**
> **Git Worktree 主要的目的不是「平行開發」，而是方便處理不同性質的「任務」。**
> AI 執行的效率已經非常高了，與其平行開發後解衝突，還不如**把精力放在 Code Review 上面確保專案穩定性**。

---


---

# 使用 MCP：賦予 AI 使用外部工具的權限

## 為什麼需要 Postman？

> **MCP 是 AI 與外部工具之間的標準插座**
> 前面用 `F12 → Network` 只能看到「前端有打的 API」，而且看完即丟。
> 真正要驗證後端，需要一個能`主動發出 Request`、能`重複執行`、能`模擬不同身份`的工具。

### 🤔 只靠瀏覽器測 API 的三個痛點

- **被動**：F12 只看得到前端`觸發過`的請求，沒有對應按鈕的 API 根本測不到
- **難重現**：想測「缺欄位」「沒權限」「Token 過期」這些`錯誤情境`，瀏覽器很難湊出來
- **無法累積**：今天測過的請求，明天又要從頭點一次，`情境沒有被保存下來`

### 📮 Postman 是後端 API 的測試台

把每一支 API 變成一張可重複執行的「Request 卡片」，存好`網址、Header、Body`，按一下就能驗證後端回應。

到 [Postman 官網下載頁](https://www.postman.com/downloads/) 依作業系統下載安裝。

> **記得註冊並登入帳號**
> 後面要用的 **MCP** 與 **環境同步**功能需要登入；用 Email 或 Google 註冊都可以，免費方案就夠本堂課使用。

### 🔗 結合 MCP，讓 AI 幫你建立與測試

Postman 提供官方 MCP Server，串上後 AI 就能`直接幫你建立 Request、設定變數、甚至跑測試`。

| 沒有 MCP | 有了 MCP |
| --- | --- |
| 一支一支手動填 URL、Header、Body | 用白話文描述情境，AI 自動建立 Request |
| 錯誤情境要自己想、自己湊 | AI 依規格補齊`正確 / 錯誤 / 權限`各種案例 |
| 改一次 API 要回頭逐張改 | 請 AI 依最新規格批次更新 |

![Postman 把每支 API 變成可重複執行的卡片](./assets/postman-overview.png)

## 安裝 Postman MCP 與 Token 設定

> **官方文件是唯一真實來源**
> MCP 的安裝指令與 Server 位置會隨版本更新，請以 [Postman MCP Server 官方文件](https://learning.postman.com/docs/developer/postman-api/mcp-server/) 為準，本段提供的是目前可運作的範例。

### 🔑 取得 Postman API Key

MCP 需要一把 API Key 來代表「你」操作 Postman。

1. 登入 Postman 後，點右上角頭像 → **Settings** → **API keys**
2. 點 **Generate API Key**，命名後複製產生的金鑰
3. 詳細步驟參考 [Postman API Key 官方說明](https://learning.postman.com/docs/developer/postman-api/authentication/)

> **API Key 等於你的帳號權限**
> 這把金鑰`不要 commit 進 Git`、不要貼到公開頻道。如果外洩，回到同一頁 **Revoke** 後重新產生即可。

### 🔌 在 Claude Code 設定 Postman MCP

用 `claude mcp add` 把官方 MCP Server 接進來（金鑰透過環境變數帶入，不要寫死在指令裡）。

```terminal [label="新增 Postman MCP（HTTP 遠端 Server）"]
claude mcp add --transport http postman https://mcp.postman.com/mcp \
  --header "Authorization: Bearer ${POSTMAN_API_KEY}"
```

```terminal [label="先把金鑰放進環境變數"]
export POSTMAN_API_KEY="你剛剛產生的金鑰"
```

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
- 用 `claude mcp add` 接上 Postman MCP，並用 `/mcp` 確認連線
[/lab-session]

## 根據專案 API 設計 Request

> **好的 Request 集合 = 一份活的 API 文件**
> 每支 API 都要寫清楚`描述`、抽出`變數`，並涵蓋`正確、錯誤、不同權限`的情境，
> 這樣 Request 不只是測試，更是團隊可以照著操作的說明書。

### 🚀 一句話讓 AI 建好整組 Collection

不用一支一支慢慢教，直接請 AI 讀專案後端 API，把`環境、變數、所有 API 與各種情境`一次建立完善。

```prompt [label="一次建立完整的 Postman Collection"]
參考專案後端 API，用 Postman MCP 幫我建立一整組「VMS」測試 Collection：

1. 建立「VMS Local」環境，變數含 base_url（預設 http://localhost:3000/api）、admin_token、user_token
2. 登入 API 成功情境（admin / admin12345）的測試腳本，要自動把回傳 token 寫入對應變數
3. 依後端建立 登入 / 車輛 / 員工 三個資料夾，每支 Request 都要有清楚描述、用 {{base_url}} 與 Authorization: Bearer {{token}} 變數，並涵蓋：
   - 正確情境（200 / 201）
   - 錯誤情境（缺欄位 400、查無資料 404、未帶 Token 401、選項不合法 400）
   - 權限情境（員工 API 改用 user_token，預期 403）
```

> **為什麼一次建立就好？**
> 變數、Token 自動寫入、各種情境彼此是有關聯的；與其分多次補，不如`一次給足上下文`，
> 讓 AI 照規格把整組建完，你只要負責確認`情境有沒有漏`。

![用一段指令請 AI 把整組 Collection 建好](./assets/postman-collection.png)

### 🧪 在 Postman 逐一驗證不同情境

AI 建好後，回到 Postman `親手跑過一遍`，確認後端在每種情境的回應都符合預期。

#### 🔐 登入 API：先拿到 Token

| 情境 | 輸入 | 預期回應 |
| --- | --- | --- |
| ✅ 正確登入 | `admin / admin12345` | `200`，回傳 `token`（自動寫入變數） |
| ❌ 密碼錯誤 | `admin / wrong` | `401 Unauthorized` |
| ❌ 缺欄位 | 只給 `username` | `400 Bad Request` |

#### 🚗 車輛 API：完整 CRUD 與錯誤

| 情境 | 方法 / 路徑 | 預期回應 |
| --- | --- | --- |
| ✅ 查詢列表 | `GET {{base_url}}/vehicles` | `200`，回傳車輛陣列 |
| ✅ 新增車輛 | `POST {{base_url}}/vehicles` | `201`，回傳建立的車輛 |
| ❌ 欄位驗證 | `POST` 缺車牌 / 廠牌不在選項內 | `400 Bad Request` |
| ❌ 查無資料 | `GET {{base_url}}/vehicles/99999` | `404 Not Found` |
| ❌ 未帶 Token | 任一車輛 API 不帶 `Authorization` | `401 Unauthorized` |

> **後端有做選項檢查，Request 也要驗**
> 前面優化時把廠牌、狀態設計成`下拉選單`，後端 API 也會檢查選項。
> 記得跑一張`故意送出不存在選項`的 Request，確認後端真的擋下來（回 `400`）。

#### 👥 員工 API：切換 Token 驗證權限

員工管理`僅管理者可操作`，切換 `admin_token` / `user_token` 就能驗證權限控管是否確實。

| 身份 | 使用變數 | 存取員工 API | 預期回應 |
| --- | --- | --- | --- |
| 管理者 | `{{admin_token}}` | 可檢視 / 新增 / 編輯 / 刪除 | `200 / 201` |
| 一般使用者 | `{{user_token}}` | 不允許 | `403 Forbidden` |
| 未登入 | 不帶 Token | 不允許 | `401 Unauthorized` |

![同一支 API 切換 Token，驗證權限是否確實擋住](./assets/postman-permission.png)

### 🤖 改完 API，請 AI 重跑整組

> **情境用例設計成 Request，就是 E2E 測試的雛形**
> 把「正確流程」「錯誤輸入」「越權存取」都沉澱成可重複執行的 Request，
> 之後改完 API 只要請 AI`重跑整組`並用表格回報結果，就能快速確認`沒有改 A 壞 B`。

[lab-session title="🛠️  實作時間" duration="15 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 用一段指令請 AI 建好整組 VMS Collection（環境、變數、所有 API 與情境）
- 在 Postman 逐一驗證登入 / 車輛 / 員工的正確、錯誤、權限情境
- 改動 API 後請 AI 重跑整組，確認沒有改壞
[/lab-session]


---


---

# 部署上線：用 Docker 打包，靠 MCP 一句話發佈

> **能在 localhost 跑，不等於能交付**
> 產品要讓別人用得到，必須先`打包成標準化的 image`，再`部署到雲端`並掛上 `HTTPS`。
> 這一段循序漸進：先用 Docker 打包，再用 Zeabur MCP 部署，最後補上基礎的網路防護。

## 用 Docker 把專案打包成 image

### 🐳 為什麼要先做出 image？

還記得第二堂用 Docker 跑 Postgres 嗎？那時 Docker 幫我們`把資料庫環境標準化`；
現在要上線，換成`把整個專案`打包成一份 image。

- **環境一致**：image 把 `Node 版本、套件、設定`通通鎖在裡面，避免「在我電腦可以跑」
- **一次打包、到處執行**：本地 build 出來的 image，Zeabur 拿去跑`結果一模一樣`
- **可重現**：每次部署都是`同一份基底`，出問題容易回溯是程式還是環境

> **資料庫不用自己打包**
> Postgres 這類服務 Zeabur 直接提供，我們`只打包自己的前後端程式`，資料庫到雲端再接上去就好。

### 📝 請 AI 寫 Dockerfile

把專案丟給 AI，請它依專案結構產生 `Dockerfile` 與 `.dockerignore`。

```prompt [label="生成 Dockerfile"]
參考專案結構，幫後端服務寫一份多階段建置（multi-stage build）的 Dockerfile：
1. build 階段安裝套件、編譯
2. 最終映像只保留執行所需檔案，基底用輕量的 node:20-alpine
3. 對外開放 3000 port，啟動指令為正式環境的 start
同時建立 .dockerignore，排除 node_modules、.env、.git，避免 image 過大或把機密打包進去
```

> **為什麼要 multi-stage 與 .dockerignore？**
> `multi-stage` 讓最終 image 不含編譯工具，`體積更小、攻擊面更少`；
> `.dockerignore` 確保 `.env`、金鑰`不會被打包進 image`，這是上線前最容易踩的雷。

![AI 依專案結構產生的 Dockerfile](./assets/dockerfile-generated.png)

### 🔨 本地 build 並跑起來驗證

上雲之前，先在本地確認 image `build 得起來、跑得動`。

```terminal [label="build 出 image"]
docker build -t vms-backend .
```

```terminal [label="跑起來測試（對應 3000 port）"]
docker run --rm -p 3000:3000 --env-file .env vms-backend
```

打開瀏覽器或用 Postman 打 `http://localhost:3000`，確認回應正常，就代表 image 沒問題。

> **本地能跑，雲端才有意義**
> 如果 image 在本地就起不來，丟到雲端只會`更難 debug`。先在熟悉的環境驗證，是最省時間的做法。

[lab-session title="🛠️  實作時間" duration="15 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 請 AI 產生 Dockerfile 與 .dockerignore
- 確認 .dockerignore 有排除 .env、node_modules
- 本地 docker build 出 image
- docker run 跑起來，用瀏覽器或 Postman 驗證回應正常
[/lab-session]

## 用 Zeabur 把產品搬上雲端

> **第一次靠手動引導，之後全交給 MCP**
> 建立專案、`選擇機房`這種「一次性的決定」我們手動在後台做；
> 真正每天會`重複`的部署與迭代，再交給 MCP 用白話文處理。

### ☁️ 為什麼選 Zeabur 這類託管平台？

| 自己租 VM | 用 Zeabur |
| --- | --- |
| 要自己裝環境、設防火牆、上 SSL | 平台`自動處理`建置、TLS、網域 |
| 出事要自己 SSH 進去查 | 後台或 MCP `直接看 logs` |
| 擴充要自己調設定 | 介面上`點一下`或請 AI 處理 |

對個人與小團隊，把`維運瑣事交給平台`，才能把時間留給產品本身。

### 🌏 建立專案、選擇機房（一次性引導）

到 [Zeabur](https://zeabur.com/) 用 GitHub 登入後：

[flow]
1. 建立 Project — 點 `Create Project`，取一個專案名稱
2. 選擇機房（Region）— 挑`離使用者最近`的節點，例如台灣使用者選 `Tokyo`
3. 確認方案 — 免費方案足夠本堂課練習，正式營運再升級
[/flow]

> **機房為什麼要選近的？**
> 機房離使用者越近，`網路延遲越低`、體驗越好；台灣使用者選東京通常比選美國節點快得多。
> 這個選擇`部署後不易更動`，所以放在最前面手動決定。

![建立 Project 並選擇離使用者最近的機房](./assets/zeabur-create-project.png)

### 🔑 取得 Zeabur API Key

MCP 需要一把 API Key 代表「你」操作 Zeabur。

1. 進入 **Dashboard → Settings → API Keys**
2. 點 **Generate new API key**
3. 點眼睛圖示顯示金鑰，立刻`複製保存`

> **金鑰只會顯示這一次**
> Zeabur 的 API Key`關閉頁面後就看不到`，請當下就存好。`不要 commit 進 Git`；外洩就回同一頁刪除後重新產生。

![到 Settings → API Keys 產生並複製金鑰](./assets/zeabur-api-key.png)

[lab-session title="🛠️  實作練習"]
- 用 GitHub 登入 Zeabur
- 建立 Project 並選擇離你最近的機房
- 產生 API Key 並安全保存
[/lab-session]

## 接上 Zeabur MCP，用白話文部署

> **官方文件是唯一真實來源**
> MCP 的套件名稱與啟動方式會隨版本更新，請以 [Zeabur MCP 官方文件](https://zeabur.com/docs/en-US/mcp) 為準，本段是目前可運作的範例。

### 🔌 在 Claude Code 設定 Zeabur MCP

一樣把金鑰`透過環境變數`帶入，不要寫死在指令裡。

```terminal [label="先把 Token 放進環境變數"]
export ZEABUR_TOKEN="你剛剛產生的 API Key"
```

```terminal [label="新增 Zeabur MCP（透過 npx 啟動）"]
claude mcp add zeabur -e ZEABUR_TOKEN=${ZEABUR_TOKEN} -- npx -y @zeabur/mcp-server
```

#### 驗證 MCP 是否連線成功

```prompt [label="在 Claude Code 中確認"]
/mcp
```

| 預期狀態 | 代表意義 |
| --- | --- |
| `zeabur ✔ connected` | 連線成功，AI 已可操作 Zeabur |
| `zeabur ✘ failed` | Token 錯誤或過期，回上一步重新產生 |
| 清單中沒有 `zeabur` | 指令未成功執行，重新跑一次 `claude mcp add` |

![輸入 /mcp 確認 Zeabur 已連線](./assets/zeabur-mcp-connected.png)

### 🚀 一句話完成第一次部署

連上後，直接用白話文請 AI 部署。AI 會`建立服務、上傳 image、設定 port`。

```prompt [label="部署到 Zeabur"]
用 Zeabur MCP 把這個專案部署到我剛建立的 Project：
1. 後端用我們的 Dockerfile 建置成服務
2. 另外建立一個 Postgres 服務給後端使用
3. 部署完成後給我服務的網址
```

> **為什麼能「一句話」就部署？**
> MCP 把 Zeabur 的`建立服務、設定、查 log`都變成 AI 能呼叫的工具，
> 你描述`想達成的結果`，AI 負責`一步步呼叫 API`，不用在後台來回點。

![請 AI 透過 MCP 完成部署並回傳網址](./assets/zeabur-deployed.png)

### 🔧 部署後的迭代也靠 MCP

上線不是結束，後續調整一樣用白話文交給 AI。

| 想做的事 | 對 AI 說 |
| --- | --- |
| 設定環境變數 | 「把 DATABASE_URL、JWT_SECRET 設到後端服務的環境變數」 |
| 綁定網域 + HTTPS | 「幫後端服務綁一個 Zeabur 提供的網域，並確認有 HTTPS」 |
| 查錯誤 | 「抓最近的部署 log，看看為什麼啟動失敗」 |
| 重新部署 | 「我推了新的程式，幫我重新部署後端服務」 |

> **環境變數要在雲端設定，不要寫進 image**
> 資料庫連線、JWT 密鑰這些`會因環境不同`的值，要在 Zeabur 的`環境變數`設定；
> 這樣同一份 image 在本地、雲端都能用，金鑰也`不會被打包`進去。

[lab-session title="🛠️  實作時間" duration="20 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 設定 ZEABUR_TOKEN 環境變數，用 `claude mcp add` 接上 Zeabur MCP，並用 `/mcp` 確認
- 請 AI 部署後端與 Postgres 服務，拿到對外網址
- 請 AI 設定必要的環境變數，綁定網域並確認 HTTPS
- 打開網址，確認線上服務可以正常登入
[/lab-session]

## 上線前的基礎網路防護

> **公開到網路上，就會有人來敲門**
> 服務一上線，掃描機器人`幾分鐘內`就會找上門。上線前先補上這幾道基本防線。

### 🛡️ 五個一定要做的防護

| 防護項目 | 為什麼重要 | 怎麼做 |
| --- | --- | --- |
| **強制 HTTPS** | 沒加密的連線，`帳密、Token 會被攔截` | Zeabur 綁定網域後`自動發 TLS 憑證`，確認用 https 進站 |
| **機密放環境變數** | 金鑰寫死在程式裡，`一推上 Git 就外洩` | DB 密碼、JWT 密鑰`一律用環境變數`，`.env 不進 Git` |
| **設定 CORS 白名單** | 開放 `*` 等於`誰都能打你的 API` | 只允許`自己的前端網域`跨域存取 |
| **資料庫不對公網** | DB 直接暴露，`等於把金庫門打開` | 用 Zeabur `專案內部網路`連線，不對外開 port |
| **換掉預設帳密** | `admin / admin12345` 是教學用，`上線等於沒鎖門` | 上線前`改成強密碼`，移除測試帳號 |

### 🤖 請 AI 幫你做上線前體檢

不用自己逐項檢查，先請 AI 對照清單掃一遍。

```prompt [label="上線前安全體檢"]
這個專案準備部署上線，幫我做一次基礎的安全檢查：
1. 檢查是否有金鑰、密碼寫死在程式碼裡，應改用環境變數
2. 檢查 CORS 設定是否限制在我的前端網域，而不是開放 *
3. 確認資料庫只走內部網路、沒有對公網開放
4. 列出仍使用預設 / 測試帳密的地方
逐項回報現況與建議的修法
```

> **防護是`持續`的，不是`一次性`的**
> 這裡列的是`最低標`。隨著使用者變多，再逐步加上`登入頻率限制`、`錯誤訊息不洩漏細節`、`相依套件定期更新`等防護。

[lab-session title="🛠️  實作時間" duration="15 分鐘" hint="有問題歡迎提出，你的問題可能是大家的問題"]
- 請 AI 做一次上線前安全體檢
- 確認機密都走環境變數、`.env` 沒進 Git
- 把預設帳密改成強密碼
- 確認線上服務走 HTTPS、資料庫沒有對公網開放
[/lab-session]

---


