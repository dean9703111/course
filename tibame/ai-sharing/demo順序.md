# 不管 Prompt 多完美，AI 都可能犯錯

- Coding Style 未必根據 Rule
- Unit test 有可能會漏跑

> 我們不需要想如何優化 Prompt，而是直接使用程式原本就有的功能

# 每堂課都會有 Git Repo 讓大家練習

- 有詳細的講義與 Prompt
- 不怕跟不上進度

> 直接 Clone 專案，在 main 的 branch，輸入 `npm intsall` 後，操作 lint 風格錯誤與 unit test 錯誤

# 可以使用不同的 AI Agent

- AI 工具間的落差，比你想像的更小
- 主流 AI 工具都支援 Rules / Commands / Skills

> 展示輸入 `npx @dean9703111/dotagents` 來建立軟連結的方案

# 規格文件非常重要，否則不知道誰是對的

- 這個系統需要具備哪些功能
- 使用到的前端、後端、資料庫是什麼

> 一個指令就能生成全端系統，但你連他有什麼功能都不確定

# 新專案:OpenSpec 能帶來哪些幫助？

```
npm install -g @fission-ai/openspec@latest
openspec init
```

我們沒有背指令的必要性

```prompt [label="查看 Skill"]
我想知道 openspec 目前安裝的 skill 用途
請使用表格呈現，用白話簡短描述
```

- 幫你釐清問題
- 確認使用的技術
- 有具體的 Task 讓 AI 參考

```
設計車輛管理系統，包含以下功能：
- 登入頁面（帳號密碼驗證，區分管理者與一般使用者）
- 首頁儀表板（上方顯示關鍵數據卡片，下面顯示資料圖表）
- 車輛管理頁（可檢視、新增、編輯、刪除車輛資料）
- 員工管理頁（僅管理者可檢視、新增、編輯、刪除員工資料）

前端使用 React，後端使用 Express，資料庫用 Postgres
Postgres 與 Postgres admin 希望透過 docker 啟動
參考 openspec 的 skill 執行，以最小可行性方案來規劃
```

> 切換到 develop 的 branch，講解 OpenSpec 做到的事
> 可以輸入 `幫我啟動系統`，但其實很浪費 Token，你也不知道系統是如何啟動的
> 了解 docker-compose.yml，並用他啟動資料庫與資料庫管理介面 `docker compose up -d`
> 在 frontend/backend 輸入 `npm intsall` 來安裝必要套件，前往 package.json 輸入 `npm run dev` 啟動專案

# 舊專案:OpenSpec 如何協助專案迭代？

- 一個專案有多個人在協作，完成後的 Spec 可以整合
- 可以了解過去完成過的功能
- AI 了解架構、功能、技術
- 了解為什麼需要加入版本控制

> 切換到 `feature/auditlog` 的 branch，說明 OpenSpec 迭代後的架構
> 用產品流程讓大家理解分之的重要性

# 導入測試:確保專案基礎的穩定度

- 口說無憑，測試是跟著規格走的
- 需要先從小範圍驗證，確認符合預期後，再擴大
- 可以透過覆蓋率報告了解狀況

> 執行 `npm run test` 讓大家了解測試情境

# 加入 CI/CD:更新會自動測試程式、檢查格式

- 透過自動化工作流保證系統穩定度
- 設計保護分支的規則，只允許通過測試才能合併

> 到 GitHub 上面，確認 Action 有在執行
> 確認測試失敗的，會無法合併

# 專案協作:建立適合的 Agent Skills

- 每間公司都有自己的工作流（commit/pr/branch）
- 不同專案也有各自的情境（unit-test）
- 讓每次達成的目標，成為下次的起點
- 因為只讀取 Meta data，所以節省 Token

> 打開幾個 Agent Skills，說明讀取邏輯，以及 reference 與 scripts 的概念
> 這其實也是在解決跨專案協作的問題，每個專案的文件是散落的，Agent Skill 漸進式揭露的功能，有需要時，再去讀取
> 終端機輸入 `git checkout -b feature/test` 切換到測試的分支
> 將內容恢復到尚未 commit `git reset --soft head~` 然後於 AI 對話窗輸入 `生成 commit`
> 測試 PR 就直接輸入 `生成 PR 合併到 develop`

# 專案協作: 用 Git Worktree 多工處理

- 多人協作一個專案時，你可以要撰寫新功能、Code Review、修 Bug
- 用 Git Stash 時常會混亂
- 使用 Worktree 可以區隔工作區，AI 可以獨立運作

