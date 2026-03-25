# 課前複習：三個工具，三種定位
> 上週介紹了 Gemini、Google AI Studio 和 Antigravity — 先幫大家回憶它們各自的角色

## Gemini ⮕ Google AI Studio ⮕ Antigravity

### 🧠 Gemini（入門）[官網](https://gemini.google.com)
- 打開網頁就能做網站
- 透過對話就能拿到網頁草稿、版面結構
- 適合腦力激盪、嘗試風格

### 🧪 Google AI Studio（進階）[官網](https://aistudio.google.com/)
- 能做出完整的 App 原型
- 可以直接在瀏覽器上操作
- 結果可以部署或是搭配 GitHub 版本控制

### 🚀 Antigravity（AI 程式編輯器）[官網](https://antigravity.google/)
- 讓 Vibe Coding 可維護、擴充的工具
- 能清楚知道 AI 每次做了哪些事
- 可以透過限制範圍增加成功率

[tags]
- [blue] Gemini — 聊天問答，快速取得靈感
- [purple] AI Studio — 產品原型，過渡期工具
- [green] Antigravity — 寫程式的主力工具
[/tags]

---

# 為什麼使用 IDE：我厭倦在 AI 工具間複製貼上
> 網頁版的 AI 只能告訴你該怎麼做，AI Agent 能直接幫你完成工作

## 工具越多，流程越碎

### ‍💻 一開始的工作方式
- 本職是工程師，只拿程式碼編輯器來寫程式
- 創作文章、資料彙整還是靠 ChatGPT 或 NotebookLM
- 不同任務需要切換不同工具

### 😩 痛點 1：複製貼上讓人煩躁
- 企業內訓時，主辦方提供的參考資料格式不一（Word / PDF / PPT）
- 資料之間有重複內容，需要人工比對與彙整
- NotebookLM 雖然能幫忙整理，但上傳 → 複製 → 貼上的動作無趣又耗時

### 🎬 痛點 2：瑣碎的事情太多
- 每支影片都要處理：腳本設計、字卡規劃、音效建議、宣傳導流
- 這些事情各自不難，但加在一起非常耗時
- 拍了幾支影片後，熱情快被瑣碎的流程消耗殆盡

## 轉念：讓 AI 代勞

> 於是我開始思考 — 有哪些任務可以交給 AI 處理？
> 有沒有可能，把任務集中到一個工具搞定？

[flow]
1. 格式轉換 — Word / PDF / PPT 丟進來，AI 自動解析
2. 資訊彙整 — 去除重複資訊、合併重點
3. 內容生成 — 影片腳本、字卡、宣傳文案一條龍產出
4. 流程自動化 — 設計工作流，讓 AI 自動執行每一步
[/flow]

> **這就是 AI Agent 的潛力：** 不只是「問一句答一句」的聊天機器人，而是能理解你的任務脈絡、操作你的檔案、串接多個步驟，幫你從頭到尾把事情做完的 AI 助手。

---

# 前置工具安裝：解鎖 AI Agent 的完整能力
> AI Agent 能做多少事，取決於你給它多少工具 — Python、Node.js、Git 三件套裝好，能力直接翻倍

## ① Python — 突破文件與爬蟲限制

### 🎯 為什麼要裝 Python？
- 安裝 Python **不只是為了寫程式**，而是讓 AI Agent 有更多解決方案
- 沒裝 Python 的 AI Agent，遇到不同格式的檔案會無法辨識、處理
- 裝了之後，AI 會自動安裝對應套件來處理各種格式

### 📦 安裝 Python
到 [Python 官網](https://www.python.org/) 根據作業系統下載安裝檔，安裝完成後開啟終端機。

輸入 `python --version` 確認，如果沒有反應，請改用 `python3 --version`。

### 課程範例 Repository

[下載 Repository](https://github.com/dean9703111/vibe-coding-ai-agent-practice) 後，可以跟著課程進度操作

```terminal [label="Clone 課程 Repo"]
git clone git@github.com:dean9703111/vibe-coding-ai-agent-practice.git
cd vibe-coding-ai-agent-practice
```

### 📄 實戰：提取文件資訊
許多人把程式碼編輯器（IDE）當成 RAG 工具，用它快速檢索、分析、統整資訊。
但他只能檢索「文字檔」（Markdown / txt / JavaScript / Python 等），遇到 Word / PPT / PDF 預設無法解析。
有了 Python，這一切就變成了可能。

```prompt [label="提取文件內容"]
資料夾有 pdf/ppt/doc 等多種格式的文件，我想請你用 python 套件把所有文件內的「文字」取出來，並確定可以用繁體中文顯示。
並建立一個「doc」的資料夾，用 Markdown 的格式儲存，並整理文字結構，設計合適的大標、中標、小標，方便閱讀。
如果 ppt/doc 裡面有圖片，請建立一個「img」的資料夾，然後辨識完圖片後命名圖片檔名。
```

> **AI Agent 會自動設計執行步驟** 安裝 Python 套件 → 解析文件 → 提取文字與圖片 → 建立資料夾並儲存 → 辨識圖片命名檔名。
>
> 完成後，「doc」與「img」資料夾中就能看到提取的內容，省去手動複製貼上的步驟。

### 🔍 實戰：用 RAG 彙整資料
文字提取完成後，把「doc」資料夾拖到 AI 對話框，讓 AI 知道要處理的範圍，接著讓他彙整資訊

```prompt [label="彙整講師形象素材"]
我是個講師，正在準備個人形象網站的素材，內容要呈現如下資訊：
- 擅長領域: 搭配可以佐證的資訊
- 個人成就: 找出可數據化的成就，展現實力的強大
- 課程資訊: 課程主題、說明、價格、受眾、預期成果
請先建立「integrate」資料夾，並將上面提到的面向用 Markdown 格式建立，並像個善於推銷自己的 KOL 般，用自信的語氣撰寫文案
```

稍等一段時間，「integrate」資料夾就會出現 AI 按需求彙整好的內容。

### 🎙️ 實戰：將音訊檔變成 SRT 逐字稿
如果有會議、訪談、錄音的等資訊，想要把它轉換成 SRT 逐字稿，也可以直接交給 AI 處理

```prompt [label="將音訊檔變成 SRT 逐字稿"]
透過 python whisper 套件將檔案轉換成 srt 逐字稿
完成後檢查是否都轉換成繁體中文，並優化錯漏字
```

---

## ② Node.js — 讓網頁從堪用變專業

### 🎯 為什麼要裝 Node.js？
- 沒有 Node.js，AI 只能用基礎 HTML + CSS 做簡單網頁
- 裝了之後，就能使用 Vue / React / Angular 三大前端框架
- 框架生成的結果更符合現代審美，未來擴充功能也有豐富套件可用

### 📦 安裝 Node.js（透過 NVM）
建議透過 NVM 安裝，方便日後在不同 Node.js 版本間切換。
- **Mac** — 終端機執行 `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | terminal`
- **Windows** — 到 [NVM for Windows](https://github.com/coreybutler/nvm-windows/releases) 下載 exe 安裝檔。

安裝完成後，確認 NVM 已就緒：
```terminal
nvm -v
```

接著安裝最新 LTS 版本的 Node.js：
```terminal
nvm install --lts
```

最後確認安裝成功：
```terminal
node -v
```

---

## ③ Git — Vibe Coding 的後悔藥

### 🎯 為什麼要裝 Git？
- Vibe Coding 時，每個指令都可能大幅調整專案程式碼
- AI 修改的結果未必正確，甚至可能把正常功能改壞
- Git 能幫你記錄每次變更，隨時退回任何版本

### 📦 安裝 Git
到 [Git 官網](https://git-scm.com/) 下載安裝檔，安裝後確認：

```terminal
git -v
```

完成初始化設定（請替換成自己的名字與信箱）：
```terminal
git config --global user.name "baobao"
git config --global user.email "baobao@gmail.com"
```

### 🔑 產生 SSH Key
SSH Key 用來確保這台電腦有權限操作 GitHub 上的專案
**注意：請不要使用公司信箱註冊**

```terminal
ssh-keygen -t ed25519 -C "baobao@gmail.com"
```

生成後，顯示公鑰（下一步會用到）：
```terminal
cat ~/.ssh/id_ed25519.pub
```

### 🐙 註冊 GitHub 並綁定 SSH Key
必須要完成這一步，後續專案才能上傳到雲端控制
**注意：請不要使用公司信箱註冊**

[flow]
1. 到 [GitHub](https://github.com/) 使用 Gmail 註冊帳號
2. 點擊右上角頭像 → Settings
3. 側邊欄選擇「SSH and GPG Keys」
4. 點擊「New SSH Key」，貼上剛剛的公鑰
[/flow]

[tags]
- [green] Python — 解鎖文件解析、網頁爬蟲能力
- [blue] Node.js — 使用前端框架，網頁更專業
- [orange] Git — 版本控制，改壞隨時退回
[/tags]

---

# 技術選擇：零成本全端架構
> 不需要伺服器、不用綁信用卡 — React + Google Apps Script + Google Sheets，免費打造可上線的全端專案

## 全端三層架構

### 🖥️ 前端：React
- 使用者瀏覽的畫面介面
- 知名框架，大量現成元件讓 AI 有素材可用
- 選擇 React Vite 快速啟動專案

### ⚙️ 後端：Google Apps Script
- 處理邏輯判斷的核心，打開瀏覽器就能使用
- 新手友善，取代傳統 Python、Node.js、PHP 的複雜設置
- 從 Google Sheet 擴充功能直接配置，工具間相依性清楚

### 🗄️ 資料庫：Google Sheets
- 大家熟悉的試算表，打開就能看並編輯
- 取代 MySQL、Postgres、Mongo 的複雜架設
- 可公開特定工作表供 API 存取

> **為什麼選這套組合？**
> 傳統全端專案需要伺服器、信用卡綁定、複雜前置作業。這套組合讓你專注在「理解全端架構」本身，而不是被環境設定困住。
>
> 學完後，未來後端想換成 Node.js、資料庫換成 MySQL，都會輕鬆許多，因為你已經懂得前後端如何分工、資料如何流動。

[tags]
- [green] 免費 — 不需要伺服器、不用綁信用卡
- [blue] 可部署 — GitHub Pages 免費公開上線
- [orange] 適合學習 — 不適合高流量或複雜邏輯場景
[/tags]

---

# Antigravity 設定：讓 AI 更懂你
> 工具設定做對了，AI 才能給你更精準的回覆 — Rules、模型選擇、對話模式三大設定一次搞定

## 工作區初始化

### 📁 建立工作區
- 新增專案資料夾（例如「pixel-game」）
- 將資料夾拖曳到 Antigravity 中
- AI 才能知道工作區位置，確保操作範圍正確

### 🔧 設定 Global Rules

開啟「Customizations → Rules → Global」，貼上通用規則讓 AI 回覆更精準

```prompt [label="Global Rules（推薦）"]
DO NOT GIVE ME HIGH LEVEL SHIT, IF I ASK FOR FIX OR EXPLANATION, I WANT ACTUAL CODE OR EXPLANATION!!!

- Be casual unless otherwise specified
- Be terse
- Suggest solutions that I didn't think about—anticipate my needs
- Treat me as an expert
- Give the answer immediately. Provide detailed explanations after giving the answer
- Split into multiple responses if one response isn't enough to answer the question.
```

此規則貼上後在「所有專案」生效，也可額外加上語言偏好：

```prompt [label="語言設定"]
- Always respond in 繁體中文
```

若只針對當前專案設定（如程式碼規範），改點「Workspace」設定即可。

## 模型與對話模式

### 🤖 跨模型支援
- Antigravity 除自家 Gemini 外，也支援 Claude 與 GPT
- 每個模型有額度限制，超過後切換其他模型繼續使用

### ⚡ 對話模式選擇
- Planning — 適合複雜任務（如專案初始規劃），思考更深入
- Fast — 適合快速解答，省時省力

---

# 提示詞設計：從需求到專案
> 越精準的提示詞，越短的時間得到期待的結果 — 角色設定、UI/UX、功能需求、資料庫設計四大架構

## 提示詞四要素

[flow]
1. 角色設定 — 讓 AI 扮演對應領域的資深工程師
2. UI/UX 需求 — 框架選擇與設計風格
3. 功能需求 — 明確的操作流程與邏輯說明
4. 資料設計 — 詳細的欄位定義與工具相依性說明
[/flow]

### 🎯 完整專案 Prompt 範例
如果不知道如何下 Prompt，也可以先提出簡單的需求，然後與 AI 釐清細節。

```prompt [label="闖關問答遊戲（完整需求）"]
# 角色
你是一位資深的 React 前端工程師與遊戲設計師。請根據需求描述協助我設計一個網頁的「闖關問答遊戲」

# UI/UX 需求
- 前端框架：React Vite
- 風格：Pixel Art 像素風，像是 2000 年代的街機，樸實但是有設計感。
- 關主圖片處理：使用 DiceBear API 預先載入 100 張不同素材
- 關卡呈現：每一關皆配有一個 Pixel 風格的「關主」圖片

# 功能需求
## 操作流程
- 首頁：使用者需輸入「ID」才能開始遊戲，此 ID 是為了記錄到 Google Sheets
- 題目來源：透過 Google Apps Script 從指定 Google Sheets 的「題目」工作表隨機撈取 N 題（不包含解答欄位）
- 成績計算：將作答結果傳送到 Google Apps Script 計算成績，並記錄到 Google Sheets

## Google Sheets 配置
- 「題目」工作表：題號、題目、A、B、C、D、解答
- 「回答」工作表：ID、闖關次數、總分、最高分、第一次通關分數（若同 ID 已通關過，後續分數不覆蓋，僅在同列增加闖關次數）、花了幾次通關、最近遊玩時間
- Google Apps Script：是直接從這份 Google Sheet 擴充功能配置的

# 環境變數設定 (.env)
- GOOGLE_APP_SCRIPT_URL：Google Apps Script 的後端連結
- PASS_THRESHOLD：通過門檻（需要答對幾題才算通過）
- QUESTION_COUNT：每次遊戲的題目數量
```

## 提示詞設計解析

### 💡 角色設定的作用
- 讓 AI 進入對應領域的思維框架
- 框架選擇提前指定，避免 AI 自行發揮造成技術不一致
- 風格描述越具體，畫面越接近預期（像素風 vs 現代風差異很大）

### 🔒 為什麼透過 Apps Script 取題？
若直接從前端呼叫 Google Sheets API，解答欄位也會被前端取得。透過 Google Apps Script 作為中間層，可以過濾掉「解答」欄位，只回傳題目與選項。
這就是前後端分離的核心概念：`前端只拿它需要的資料，敏感邏輯留在後端處理。`

### 🗄️ 資料庫設計的精確度
- 明確列出每個工作表的`欄位名稱`，減少 AI 自行詮釋的空間
- 針對特殊業務邏輯額外說明（「同 ID 已通關過，後續分數不覆蓋」）
- 說明工具相依性（Apps Script 從 Google Sheet 擴充功能配置）

### ⚙️ 環境變數的易用性設計
- 把「連結、門檻、題目數量」設計為環境變數
- 日後換考題、改評核標準，不需打開程式碼，直接修改設定即可

## 執行與調整

### 🔄 AI 執行流程
執行過程 AI 常常會跑出來跟你確認是否執行，我強烈建議要看懂 AI 做了什麼事。
**如果全部無腦接受，可能幾分鐘後電腦就被格式化了。**

[flow]
1. 貼上 Prompt → AI 思考並規劃任務清單
2. 確認 AI 要執行的指令（不懂可開新視窗詢問）
3. 第一次調整完畢後 Accept All → 在瀏覽器預覽結果
4. 針對不符預期的地方，直接描述調整需求
[/flow]

不懂一定要問，AI Agent 可以做的事很多，包含把你的電腦弄壞

```prompt [label="確認指令安全性"]
請說明下面這段指令，並告訴我是否有危害
[貼上指令]
```

現在 AI Agent 有能力自行打開瀏覽器、尋找元素、操作畫面、截圖結果。

```prompt [label="開啟瀏覽器預覽"]
請開啟瀏覽器，模擬執行並檢查是否有錯誤
```

有錯誤是很正常的，明確描述並讓他開瀏覽器自我檢核即可

```prompt [label="優化 UI（附自我驗證）"]
我覺得畫面沒有考量到 RWD，白底的部分有破版
我希望關主的頭像只占據螢幕高度的 1/3，請你完成後自己打開瀏覽器檢查設計結果是否符合預期
```

請 AI 協助生成專案文件與模擬資訊

```prompt [label="產生 README 與測試資料"]
請為這個專案撰寫操作的 README.md 的文件
讓使用者知道如何完成安裝、Google Sheets、Google Apps Script 的詳細操作
並給我 10 個可以複製貼上測試的選擇題，題目主題為「生成式 AI 基礎知識」，用表格呈現
```

> **生成式 AI 的隨機性**
> AI 每次生成的結果都充滿隨機性，你得到的結果和遇到的問題可能完全不一樣。遇到問題，把錯誤訊息複製貼到對話視窗中，讓 AI 幫你解決。

---

# 安全上線：部署前的必要準備
> 寫完程式 ≠ 可以部署 — .gitignore、.env 安全、GitHub Actions 自動化，三件事確認完再上線

## 認識專案結構

### 📦 package.json
- `scripts`：啟動與建立靜態資源的指令
- `dependencies` / `devDependencies`：套件版本資訊
- 套件安裝在 `node_modules` 資料夾（體積最大，不需上傳）

### 🚫 .gitignore 的作用
告訴 Git 哪些檔案或資料夾不需版本控制：
- node_modules — 套件版本由 package.json 管控，不需上傳
- build — 自動生成的靜態檔案，每次 build 都會重建
- .env — 個人設定與密鑰，絕對不能上傳到公開 repo
- log — 執行日誌，僅供本機除錯使用
- tmp — 系統暫存檔，沒有紀錄意義

> **絕對不能上傳 .env 到 Git！**
> `.env` 通常存放敏感資訊（ex: 資料庫帳密、API Key），一旦上傳到公開 repo，除了資安問題外，你的信用卡也可能被刷爆。

## 部署前的兩個準備

### 📋 建立 .env.example

```prompt [label="建立環境變數範例檔"]
請幫我建立一個 .env.example 的範例檔
```

- 只放 key 名稱，不放實際值
- 讓其他人 clone 專案後知道需要設定哪些環境變數

### 🚀 設定 GitHub Actions 自動部署

```prompt [label="GitHub Actions 設定"]
請設計能自動部署到 Github Pages 的 Action，會使用到的環境變數請參考 .env.example 檔
並將操作流程更新到 README.md 文件
```

---

# GitHub Pages 部署：從本地到上線
> Source Control → GitHub → Pages → 環境變數設定 — 完整部署流程一步步操作

## 初次部署流程

[flow]
1. Source Control → Initialize Repository — 初始化 Git
2. Generate → 讓 AI 生成 commit 訊息 → Commit → Push
3. GitHub 彈窗：輸入專案名稱、選擇 Public
4. Settings → Pages → 部署來源選「GitHub Actions」
5. Actions 分頁確認部署狀況（綠色✓=成功，紅色✗=需排錯）
[/flow]

### ⚙️ 設定 GitHub 環境變數

在 `Settings → Secrets and variables → Actions` 中設定：

- **Secrets** — 存放敏感資訊（如 Google Apps Script URL）
- **Variables** — 存放較不敏感的環境變數（如題目數量、通過門檻）

查看 `.github/deploy.yml` 的 `env` 區塊，確認哪些用 secrets、哪些用 variables，再分別設定。

### 🔄 讓環境變數生效

設定完環境變數後，需要手動重新觸發部署：
1. 到「Actions」分頁，找最後一個 deploy 結果
2. 選擇「Re-run all jobs」
3. 環境變數的變更才會在新的部署中生效

> **部署失敗很正常**
> 一開始失敗很正常，把錯誤訊息複製起來，貼到與 AI 的對話視窗，讓他幫忙解決。看到綠色勾勾後，點擊進去就能看到專案的上線網址。

## 常見踩坑整理

### ⚠️ Vibe Coding 的品質需要自己把關

AI 可以幫我們加速，但品質需要有經驗的人把關。我過去在這個專案踩過的坑：

- [x] 呼叫兩次 Google Apps Script 取得題目（用 F12 → Network 分頁確認次數）
- [x] 成績結算後「第一次通關分數、花了幾次通關」邏輯問題
- [x] 中英文字體大小不一致
- [x] 進入遊戲後刷新頁面（/game）會 404
- [x] 成績頁面刷新後再次計算並累積分數（應直接導向首頁）

---

# 比工具更重要的思維
> 工具永遠在更新，但解決問題的能力才是你真正的護城河

## 選工具的態度

### 🎯 選最順手的主流工具
- 從 VSCode、Cursor 到 Antigravity，工具永遠在競爭更新
- 工具間的差異沒有你以為的大，選順手的主流工具就好
- **完成專案的關鍵在於人，而不是工具**

### 🧱 技術底蘊的價值
**AI 可能只是寫出「看起來能動」的程式**
畫面正常、功能正常，但背後邏輯可能有問題，或你看到的只是假資料。
如果沒有前後端概念，不了解資料庫如何運作，你就沒有能力判斷 AI 給的結果是否正確。
過去 AI 寫錯程式會跑不動，你會知道他錯了。現在他有能力寫出看起來能動的工具，判斷力反而更重要。

### 💡 給初學者的建議
- 從實際需求出發，而不是複製別人的提示詞
- 選一門程式語言深入研究，而不是一直追新工具
- 了解前後端概念後，換技術會輕鬆很多

> 基礎知識在 AI 時代依舊重要，不要讓 Vibe Coding 的「快」，成為你未來的「債」。

---

# 總結

[summary]
- 🏗️ **零成本全端架構** | React + Google Apps Script + Google Sheets，免費打造可上線的全端專案
- 🤖 **Antigravity 設定** | Global Rules + 模型選擇 + Planning/Fast 模式，讓 AI 給更精準的回覆
- 🎯 **提示詞設計四要素** | 角色設定、UI/UX、功能需求、資料庫設計，越精準越有效率
- 🔒 **安全部署準備** | .gitignore 保護、.env.example、GitHub Actions 自動化上線
- 💡 **比工具更重要的思維** | AI 是加速器，但判斷力與基礎知識才是你真正的護城河
[/summary]
