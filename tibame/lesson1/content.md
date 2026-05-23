# 為什麼使用 IDE：我厭倦在 AI 工具間複製貼上
> 網頁版的 AI 只能告訴你該怎麼做，AI Agent 能直接幫你完成工作

## 工具越多，流程越碎

### ‍💻 一開始的工作方式

[flow]
1. 工程師 — 程式碼編輯器（IDE），就是用來寫程式的
2. 創作文章、資料彙整 — 靠 ChatGPT、NotebookLM
3. 簡報製作 — 先生成 Markdown 初稿，再交給 Gamma
[/flow]

> **不同任務要切換不同工具**
> 我認為自己對 AI 工具很熟悉，但學習的成本太高了，而且流程很瑣碎。

### 😩 痛點 1：複製貼上讓人煩躁

- **資料格式往往不統一**：Word / PDF / PPT / Web Link
- **重複內容難辨真假**：不同來源可能描述不同、甚至相反
- **NotebookLM 能用但感覺自己像機器人**：「上傳 → 複製 → 貼上」的動作無趣又耗時

### 🎬 痛點 2：瑣碎的事情太多

- **影片創作**：每支影片都要處理`腳本設計、字卡規劃、音效建議、宣傳導流`
- **課程講義**：就算 Gamma 簡報很好用，但需要承受`伺服器壞掉、格式受限`等問題
- **商業提案**：純文字`缺乏吸引力`、Word 完成後輸出 PDF `很麻煩`

> **不要讓熱情被瑣事消耗**
> - 這些事情各自不難，但加在一起非常耗時。
> - 沒有成就感的事情重複做，會越來越不想做。
> - 工具掌握在別人手上，就要承擔風險、限制。

![Gamma 製作的簡報，曾在我講課前一晚壞掉](./assets/gamma_error.jpg)

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

# 前製作業：初探 Claude Code & 確認開發環境

## AI 是大腦，工具是雙手

> AI Agent 能做多少事，取決於你給它多少工具。

### 🛠️ 確認開發環境

- **[Git](https://git-scm.com/install/windows)** — 版本控制工具，用來追蹤每次改動
- **[GitHub 帳號](https://github.com)** — 雲端 Git 儲存庫，用來管理專案
- **[nvm](https://github.com/nvm-sh/nvm)** — Node.js 版本管理工具，方便切換
- **[Python](https://www.python.org/downloads/)** — Agent Skills 的 scripts 大部分使用 Python 撰寫
- **[Cursor](https://cursor.com/)**、**[Antigravity](https://antigravity.google/)**、**[VSCode](https://code.visualstudio.com/)** — 安裝任一款程式碼編輯器（IDE）
- **[cmux](https://cmux.com/zh-TW)** - 更好用的終端機工具（直接使用 IDE 內建的也可以）
- **[Claude 帳號](https://claude.ai/)** — 目前 Claude Code 需要 Pro 級別以上才能使用

#### 確認 Git & GitHub 帳號

```terminal [label="確認 Git 版本與帳號設定"]
git --version
git config --global user.name
git config --global user.email
```

> **若尚未設定，請執行**
> git config --global user.name "你的名字"
> git config --global user.email "你的 Email"

#### 安裝 nvm & 確認版本

**macOS / Linux**

```terminal [label="安裝 nvm"]
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

**Windows**
前往 **[github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)** 下載最新的 `nvm-setup.exe` 安裝程式

安裝完成後，**重新開啟終端機**，確認版本：

```terminal [label="確認 nvm 版本"]
nvm -v
```

#### 安裝最新版本的 Node.js 

```terminal [label="安裝 Node.js（透過 nvm）"]
nvm install --lts
nvm use --lts
node -v
```

#### 確認 Python 版本

**macOS / Linux**：可透過 alias 讓 python 指向 python3 版本

```terminal [label="確認 Python 版本"]
python3 --version
pip3 --version
```

**Windows**

```terminal [label="確認 Python 版本（Windows PowerShell）"]
python --version
pip --version
```

[lab-session title="🛠️  實作練習"]
- 確認 Git & GitHub 帳號
- 確認 nvm & Node.js 版本
- 確認 Python 版本
[/lab-session]

## 在終端機使用 Claude Code

### 🛠️ 安裝 Claude Code

**macOS, Linux, WSL**

```terminal [label="安裝 Claude Code"]
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell**

```terminal [label="安裝 Claude Code"]
irm https://claude.ai/install.ps1 | iex
```

### 🚀 啟動 Claude Code

```terminal [label="啟動 Claude Code"]
claude
```

![第一次啟動，會需要登入 Claude 帳號](./assets/login-claude.png)

## 在 IDE 使用 Claude Code

### 🧩 從 Extensions 安裝

如果不習慣終端機操作，安裝 Claude Code 外掛也能使用大部分的功能。

1. 打開側邊欄 `Extensions`
2. 搜尋 `Claude Code`
3. 點擊 `Install`

![在 Extensions 安裝 Claude Code 外掛](./assets/ide-claude-extensions.png)

![輸入「/login」登入帳號](./assets/ide-claude-login.png)

### 🛡️ 調整隱私設定

Help improve Claude 默認為 `true`，請調整為 `false`。

```prompt [label="調整隱私設定"]
/privacy-settings
```

![將 Help improve Claude 設定為 false](./assets/privacy-settings.png)

### 🚫 禁止 Claude 使用危險指令

AI 執行的指令是無法完全預期的，為了減少損失，可以透過設定來阻止危險操作。

```prompt [label="要求修改設定"]
我希望 Claude 在默認的 settings 禁止下面的指令（其他原有設定要保留）：
- 刪除：rm -rf, rm -fr, rm -r, rm -R, rm -f
- 最高權限：sudo
- 磁碟破壞：dd, mkfs, diskutil erase
- 權限濫用：chmod 777, chmod -R 777
- Git 不可逆操作：reset --hard, push --force, push -f, clean -f, branch -D
- 系統關機/重開：shutdown, reboot
- 檔案清空：: >, truncate
完成後給我看設定檔
```

![Global 設定會儲存在 ~/.claude/settings.json](./assets/global-settings-file.png)

```prompt [label="確認 Claude 當前專案權限設定"]
/permissions
```

![用指令確認是最穩的](./assets/permissions-deny.png)

[lab-session title="🛠️  實作練習"]
- 在終端機使用 Claude Code
- 在 IDE 使用 Claude Code
- 調整隱私設定
- 禁止 Claude 使用危險指令
- 確認指令的禁止有生效
[/lab-session]

### 📂 了解 Claude Code 工作目錄

[html src="./html/claude-folder-structure.html"]

> **Tips**
> .claude/ 就像給 Claude 一本專屬手冊：告訴它你是誰（設定）、你可以做什麼（權限）、你想怎麼做（規則）、你希望它自動完成什麼（技能），以及特別的角色（代理）。
> 專案層級放在 your-project/.claude/，使用者層級放在 ~/.claude/，**兩者會合併生效，專案設定優先。**

### ⚙️ 了解 Rules / Commands / Skills / MCP 應用場景

**1. Rules（CLAUDE.md）：**`每次對話都會參考`，記錄專案技術、規範、注意事項；不要寫太多，會佔用上下文空間
**2. Skills：**把日常工作中執行任務的細節、技巧、判斷模式放進去，AI 遇到`相關任務時會主動觸發`
**3. Commands：**可以設計完整工作流（ex: 執行多個 Skills），要`手動觸發`
**4. MCP：**透過標準介面`呼叫其他工具的 API`，操作方式較穩定、可預期

### 🤖 Claude 不同操作模式

| 模式 | 無需詢問即可執行的操作 | 最適合 |
| --- | --- | --- |
| **default** | 僅讀取 | 入門、敏感工作 |
| **acceptEdits** | 讀取、檔案編輯和常見檔案系統命令（mkdir、touch、mv、cp 等） | 迭代您正在審查的程式碼 |
| **plan** | 僅讀取 | 在變更前探索程式碼庫 |
| **auto** | 所有操作，具有背景安全檢查 | 長時間執行的任務、減少提示疲勞 |
| **dontAsk** | 僅預先批准的工具 | 鎖定的 CI 和指令碼 |
| **bypassPermissions** | 除受保護路徑外的所有操作 | 僅隔離容器和 VM |

> **Tips:**
> **對話時**：可以按 Shift+Tab 循環「default → acceptEdits → plan」
> **啟動時**：可以用「claude --permission-mode `plan`」來設定

### 🤖 Claude 不同模型

- **Sonnet**— 速度與品質平衡，日常開發、寫程式、改 Bug 首選
- **Opus** — 推理能力最強，適合需要深度分析的架構設計、複雜 Debug、長篇規格撰寫
- **Haiku** — 最快最省，適合：簡單問答、格式轉換等不需要推理的任務

```prompt [label="可根據任務調整 Model"]
/model
```

### 📊 設定 Status Line

Context 被壓縮（Compact）、Claude 忘記前面資訊、額度耗盡時，如果沒有 Status Line 完全不會意識到。

```terminal [label="了解目前 Claude Code 額度"]
npx @kamranahmedse/claude-statusline
```

![這樣一目瞭然](./assets/status-line.png)

[lab-session title="🛠️  實作練習"]
- 設定 Status Line
[/lab-session]

### 📝 補充說明

#### 不希望 Claude 成為 Commit & PR 合作者

打開 `~/.claude/settings.json`，加上下面的設定

```code [label="加上 attribution"]
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

---

# 實戰操作：體驗 AI Agent & Agent Skills 的各項能力

## 下載課程範例

### 🗂️ 課程範例 Repository

[下載或 Fork 練習用 Repository](https://github.com/deancourse/tibame-lesson1) 後，可以跟著課程進度操作

```terminal [label="僅 Clone 課程 main branch Repo"]
git clone git@github.com:deancourse/tibame-lesson1.git
cd tibame-lesson1
```

> **還沒設定 SSH Key？**
> 如果 clone 失敗，代表尚未設定 GitHub SSH 金鑰。
> 請參考 [GitHub 官方教學](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) 完成設定。

### 🤖 可以使用不同的 AI Agent

雖然課程講的是 Claude Code，但 Cursor、Codex、Antigravity 這些`主流工具都支援  Rules / Commands / Skills`。

每個 AI Agent 的路徑稍不同，可以使用 [dotagents](https://github.com/dean9703111/dotagents) 來協助建立 symlinks。

```prompt [label="將 Agent Skills 同步到指定的 AI Agent"]
npx @dean9703111/dotagents
```

![培養多個 AI 工具切換的能力](./assets/dotagents.png)

## 了解 AI Agent 能力範圍

> **如果不確定 AI 能不能搞定**
> 先讓 AI 嘗試看看吧，跟**一個人的薪水相比，Token 還是便宜非常多的**。

### 批量整理圖片檔

現在 AI Agent 已經具備多`模態（Multimodal）`能力，下面用**識別圖片**做為範例。

#### 資料夾拖入終端機，讓 AI 了解讀取範圍

![將 images 資料夾拖入終端機](./assets/drag-folder.png)

```prompt [label="讓 AI 辨識圖片完成分類"]
辨識圖片、重新命名，並在 images 資料夾下，根據主題建立並分類到對應資料夾
```

#### 確認 AI 可以辨識圖片、完成分類

![確認圖片處理如預期](./assets/identify-images.png)

> **AI 未必都用相同方案處理**
> 這次 AI 採用「mv」的方案來重新命名，但如果用「cp」的方案來複製，原本的檔案就會全部留下來，因為我們有禁止「rm」這類的刪除指令。

### 彙整不同格式資訊

儘管 AI 可以讀取不同格式，但目前 `PDF/Word/PPT/Excel` 這類格式還是無法讀取；但如果透過 `Python` 就能夠辦到了。

#### 不同主題建議用新對話窗

如果不同主題還用相同對話窗，會`降低對話品質`，且容易`浪費 Token`。

```prompt [label="開啟新對話窗"]
/clear
```

![開啟新對話窗後，如果想恢復先前對話可以用 `/resume`](./assets/new-session.png)

#### 使用「@」來指定資料夾/檔案

除了可以拖曳資料夾/檔案到終端機外，如果大概知道`名稱`，可以用`@`來`搜尋與指定`。

```prompt [label="@可選擇資料夾/檔案"]
@
```

![這邊用 @ 來搜尋 files 資料夾](./assets/use-@-file.png)

#### 透過 Python 套件彙整資訊

AI Agent 也有 **RAG 工具**的作用，能用它`快速檢索、分析、統整資訊`。

但它目前只能檢索「文字檔」（Markdown / txt / JavaScript / Python 等），遇到 Word / PPT / PDF 預設無法解析；不過有了 Python，這一切就變成了可能。

```prompt [label="提取文件內容"]
資料夾有 pdf/ppt/doc 等多種格式的文件，我想請你用 python 套件把所有文件內的「文字」取出來，並確定可以用繁體中文顯示。
並建立一個「doc」的資料夾，用 Markdown 的格式儲存，並整理文字結構，設計合適的大標、中標、小標，方便閱讀。
```

![將不同格式檔案轉換成 Markdown 格式](./assets/file-to-md.png)

> **AI Agent 會自動設計執行步驟**
> 安裝 Python 套件 → 解析文件 → 建立資料夾並儲存
> 完成後，「doc」就能看到提取的內容，`省去手動複製貼上的步驟`；NotebookLM 原理也差不多，都是把`不同格式的資源先轉換為文字檔`

#### 提取文件資訊

文字提取完成後，把「doc」資料夾拖到 AI 對話框，讓 AI 知道要處理的範圍，接著讓他彙整資訊

```
統整出 ShareBox 專案的目標、團隊、時程與預算。
若發生內容不一，請指出來源。
```

![過去資訊整合困難的問題，AI Agent 幫你處理](./assets/ai-agent-rag.png)

## 認識 Agent Skills

### 🎒 Skill 的結構

#### 每個 Skill 會存在一個資料夾下方

[html src="./html/skill-anatomy.html"]

### 🔍 Skill 的三個執行階段

[flow]
1. Discovery（發現）：AI 讀取技能名稱與描述，判斷是否與任務相關
2. Activation（啟動）：匹配成功後，才完整讀取整份 Skill 文件
3. Execution（執行）：根據文件描述逐步執行任務
[/flow]

> **Skill 為什麼能節省 Token？**
> Rule 每次都會讀完整文件；Skill 在匹配需求前`只讀標題與描述（Metadata）`。就像 Google 搜尋時先看標題摘要，確認相關再點進去。

## Agent Skills 實戰

> **目標讓 Skill 自動觸發**
> 只要對應的關鍵字有對應到，就能觸發 Skill，這樣我們就不需要去背誦。

### 🎙️ 讀取音訊轉成逐字稿

```
把 audio/audio-example.m4a 轉成 SRT 字幕
```

#### Skill 執行順序

AI 偵測到「音檔 → 字幕」意圖 → 載入 `audio-to-srt` Skill → 依 workflow 執行：

1. 驗證系統有 `uv` 與 `ffmpeg`（`uv` 會自動找 Python ≥ 3.9，缺了才下載）
2. 依平台自動挑 backend：
   - macOS Apple Silicon → `mlx-whisper`（最快，~5–10×）
   - Linux/Windows + NVIDIA → `faster-whisper`
   - 其他（CPU-only）→ `openai-whisper`
3. 跑 `.agents/skills/audio-to-srt/scripts/run.sh audio/audio-example.m4a`，`uv` 第一次會把 backend 套件裝進快取環境
4. 自動分行（每行 22 字）、合併間隔 < 0.3 秒的片段
5. 輸出 SRT 字幕檔

![觸發 audio-to-srt 的 Skill](./assets/audio-to-srt.png)

### 📄 輸入主題生成 HTML 講義

#### 情境 A：提供主題生成講義

```
幫我做一份「Python 非同步程式設計」的課程網頁
```

#### Skill 執行順序

AI 載入 `course-page-generator` Skill，依 workflow 執行：

1. **判斷輸入類型**（只有主題？有講稿？有現成資料夾？）
2. 若只有主題，自動展開大綱、決定資料夾名（kebab-case），並掃描 repo 既有慣例（例如本 repo 用 `course/`）
3. 把內容轉成**約定格式的 Markdown**（`content.md`）
4. 讀 `course/config/global.yaml` 注入講者資訊、社群連結、SEO 預設值
5. 跑 build：`node .agents/skills/course-page-generator/scripts/build.mjs course/<目錄>`
6. 產 OG 縮圖：`node .agents/skills/course-page-generator/scripts/generate-og.mjs course/<目錄>`

![觸發 course-page-generator 的 Skill]()

![生成的課程網頁]()

#### 情境 B：提供草稿生成講義

```
這是我的講稿（貼上內容），幫我做成課程網頁
```

### 📑 提供大綱生成提案 PDF

```
幫我把這份課綱寫成提案，客戶是「黑寶科技」


```


#### Skill 執行順序

AI 載入 `proposal-writer` Skill，依 workflow 執行：

1. **確定提案資料夾**：`proposal/todo/<客戶名稱>/`（狀態慣例 `todo` / `processing` / `done`）
2. 讀使用者課綱，理解主軸、痛點、會教到的工具
3. 套用版型寫 `README.md`，**六大區塊順序固定**：
   - 課程簡介 / 使用工具 / 預計成效 / 適合對象 / 課程目錄 / 課程大綱
4. 讀 `proposal/config.yaml` 取講師介紹與品牌色（不寫在 README，build 時注入 PDF）
5. 跑 `node build-pdf.mjs proposal/todo/<客戶名稱>` 產 PDF

![生成的提案 PDF]()

## ⚡ 使用 Command 技巧

> **Command 與 Skill 的差別**
> - **Skill**: AI 看到關鍵字`自動`載入
> - **Command**: 使用者`主動`觸發

### 🎯 強制驅動 Skill

### 🔗 串接多個 Skills

讀取音訊轉成逐字稿、字卡、宣傳文案


### 🧐 尋找需要的 Skills

#### 使用 Claude 原生的「/find-skills」

```prompt [label="搜尋需要的 Skills"]
/find-skills 前端美化
```

![Claude 會根據需求列出對應的 Skills](./assets/claude-find-skills.png)

#### 可參考的網路資源

- [SkillAgent Skills Marketplace](https://skillsmp.com/)
- [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills/)
- [UI UX Pro Max](https://ui-ux-pro-max-skill.nextlevelbuilder.io/)

### ⚠️ 安裝第三方 Skill 前，確認這三點

- **來源可信**：從信任的管道安裝，GitHub 上可參考 Star 數量初步判斷
- **Scripts 安全**：查看 `scripts` 目錄下有沒有危險操作（呼叫外部 URL、修改檔案、存取敏感資料）
- **SKILL.md 內容**：確認是否有敏感指令，例如把 `.env` 傳送到特定網址

### ✅ Skill 使用經驗

#### Skill 不是裝越多，AI 就越強

`同一類型的 Skill 裝了兩個以上，當需求命中時，常常會一起觸發`；這不只會增加 Token 消耗，也容易讓 AI 在執行過程中卡住或走偏。

**在提示詞的世界裡，1 + 1 不一定大於 2，甚至可能小於 1。**

> **同類型的 Skill，建議擇優安裝一個**
> 像前端網頁生成這類需求，如果同時安裝多個相近 Skill，AI 反而要花更多成本判斷該遵循哪一套規則，結果未必更好。

#### 很多 Skill 只是看起來有用

- 有些 Skill 描述看起來很厲害，實際使用時`效果卻不穩定`
- 過多的 Skills 只會`增加上下文負擔`，卻沒有提供足夠的專業價值
- 安裝`跟專案無關的 Skills` 甚至會讓 AI 的行為變得更難預測



## 根據需求建立 Skill

> Skill 的出現，讓 AI 的價值可以持續累積。只要教會一次，他就永遠記得怎麼做。


---

# 總結：打造可維護的 AI 工作流

[summary]
- 🧠 **累積 AI 經驗** | 用 CLAUDE.md、Agent Skills 讓 AI 的知識可以複用，**不要每次都從零開始**
- 🏢 **多層次 Skills 管理** | 依照`公司 → 團隊 → 專案 → 個人`分層設計 Skills
- 🔧 **從痛點出發學工具** | 遇到問題再導入工具，工具只是過程中學會的，真正重要的是**辨識問題與設計解法的能力**
[/summary]

## 讓 AI 的經驗可以累積，不要每次都從零開始

- **CLAUDE.md** — 記錄專案背景、使用技術、開發規範，讓 AI 有執行的方向
- **Agent Skills** — 將過去解決過的問題設計成 SOP，並持續優化細節
- **OpenSpec** — 將規格文件版本化，新成員、AI 都有文件可以參考，不怕知識斷層

## 建立公司、團隊、專案、個人的 Agent Skills

| 層級 | 說明 | 範例 |
| --- | --- | --- |
| **公司** | 全公司通用規範 | 工作日誌、Branch 命名、Git Flow |
| **團隊** | 特定團隊工作流 | Coding Style、PR Review 模板、Commit 格式 |
| **專案** | 單一專案情境 | 測試策略、部署流程 |
| **個人** | 個人偏好設定 | AI 不是只會寫程式、文件 |

> 透過 [dotagents](https://github.com/dean9703111/dotagents) 可以讓 Skills 同步到不同 AI Agent，不受工具限制。

## 從解決痛點的角度，來學習 AI 工具

> **培養批判性思考能力**
> 人的精力有限，`技術是學不完的`；要先培養出辨識問題的能力，然後思考如何解決，`工具只是在過程中學會罷了`。
> 現場遇到的問題都是不同的，沒有現成的解決方案，就要`自己設計`出來。
> **好的結果，不該靠消耗 Token 拼運氣；而是靠清楚的方向、可重複的工作流、以及人類在關鍵節點的決策。**

[bonus title="🎁 幕後製作心得"]
這個課程網頁的製作，走過了一段從「結果不可控」到「完全掌控」的歷程。

1. **遇到痛點** — Vibe Coding 出來的網頁，調整內容都要改 HTML，非常不方便
2. **逆推結構** — 讓 AI 把現有網頁拆解，對應成一套可用 Markdown 撰寫的格式
3. **內容與版型分離** — 只需改 Markdown，自動套用對應版型，細節完全可控
4. **設計 Agent Skill** — 不是讓 AI 生成網頁，而是讓 AI 學會「這份 Markdown 怎麼寫」
5. **模板生成器思維** — AI 負責生成結構化內容，程式再把內容轉成最終網頁
[/bonus]

[qa-session title="Q&A 時間"]
[/qa-session]

[survey title="課程滿意度問卷" url="https://www.surveycake.com/s/Xm3vN" hint="您的意見是我進步的動力" btn="填寫問卷"]
[/survey]

