# 第 1 堂素材來源與改編紀錄

本檔供講師備課與追溯；不作為學員頁章節。校園例子均為教學改編，沒有宣稱是真實學生案例。未移植醫療法規、業配產品承諾與其他工具的介面。補充安美諾既有實作與影片中的方法，產品功能另以官方文件核對。官方頁面已於 2026-11-05 以 web open 實際讀取；操作入口仍應於授課前以當時介面確認。

| 講義位置 | 既有素材與原段落 | 本次改編 |
|---|---|---|
| 前導 | [GSK 講義](../../gsk/content.md)「前導：生成式 AI 跟你想的一樣嗎？」及「了解 AI 的能力範圍」（約 32、254 行） | 行政瑣事與幻覺，換成教案、通知、會議摘要；保留人工判斷 |
| 帳號安全 | [GSK 講義](../../gsk/content.md)「帳號安全與基本設定」（約 365 行） | 資料控制入口依官方文件更正，不沿用原稿「個人化」入口；MFA 不限定單一驗證方式 |
| 資料底線 | [三總講義](../../tsgh/content.md)「四條底線」「今天所有練習，都使用去識別化的虛擬範例」（約 42–54 行） | 病人資料改為校園資料；保留虛構材料與機構規範，未沿用醫療法規 |
| 去識別化 | [去識別化影片稿](../../../video/surfshark_esim/surfshark/講稿.md)「手動去識別化的問題」、結語（約 229–258、420–435 行） | Excel 多工作表、PDF 白框、自動偵測人工複核、CSV 編碼表分開保存；工廠稀有特徵改為校園朗讀冠軍與轉學生 |
| Prompt | [GSK 講義](../../gsk/content.md)「Prompt 撰寫要點」（約 385–510 行） | 六要點改為角色、任務、受眾、材料限制、格式與驗收；國貿分析換為閱讀活動與家長通知 |
| 記憶、自訂 | [GSK 講義](../../gsk/content.md)「ChatGPT 記憶功能」「自訂 ChatGPT」（約 540–637 行） | 長期偏好與單次材料分開；不使用作者個人成就或學生個資測試 |
| Projects | [GSK 講義](../../gsk/content.md)「新增專案上傳背景資訊」（約 892 行）；[三總講義](../../tsgh/content.md)「Project 基礎架構／設計專案指令」（約 342–435 行）；[Project 影片原稿](../../../video/manus/ep4-專案（Project）/origin.md)「用指令＋文件建立專案記憶助理」（約 140 行） | 沿用指令＋材料＋引用出處＋缺漏留白；企業競爭分析改為閱讀活動專案。不沿用 Manus 的記憶、方案與操作介面 |

## 官方核對

- [Data controls in ChatGPT](https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt)：設定中的 Data controls 與 Improve the model for everyone；校務上傳許可另依校方判斷。
- [Managing MFA](https://help.openai.com/en/articles/7967234-managing-multi-factor-authentication-mfa)：Security and login、方法可用性依帳號等條件不同。
- [Personalize ChatGPT](https://learn.chatgpt.com/docs/personalize)：已讀取頁面，自訂指令用於跨對話偏好。
- [Projects and chats](https://learn.chatgpt.com/docs/projects)：已讀取頁面，專案共用文件與指令，ChatGPT Project 不直接提供電腦資料夾存取權。
- [Memory in ChatGPT](https://help.openai.com/en/articles/8590148-memory-in-chatgpt)：作為授課前覆核記憶選項的延伸入口；本次未逐段引用其操作細節。

## 待補圖片

Markdown 已在對應段落留 HTML 註解，不建立不存在的圖片連結。

| 建議檔名 | 對應位置／截圖要求 |
|---|---|
| `assets/data-controls.png` | 第 2 章資料控制；不露帳號信箱，虛線紅框標開關 |
| `assets/mfa.png` | 第 2 章 MFA 入口；不露驗證碼、QR Code 或恢復碼 |
| `assets/deidentify-comparison.png` | 第 2 章虛構紀錄前後對照，標示只換姓名的不足 |
| `assets/personalization.png` | 第 4 章自訂與記憶管理入口，使用非敏感背景 |
| `assets/project-setup.png` | 第 5 章建立 Project、指令與三份虛構文件，可拆多張實截 |

## 100 分鐘擴充與新增素材依據

講師節奏已放在 content.md 開頭的 HTML 註解，不含休息及 QA：前導 10＋安全 18＋Prompt／三角色挑錯 25＋記憶自訂 12＋Projects 與延伸 30（Project 12／Skill 8／Google 6／排程 4）＋保存成果 5＝100 分鐘。主線只做自己選的一個教學或行政成果；Skill、Google、排程以講師預跑過的測試帳號示範，可用帳號跟做、課後再做。

| 新增段落 | 既有依據 | 本次改編與限制 |
|---|---|---|
| 快速成功、三讀者挑錯 | [安美諾講義](../../amiino/content.md)「提示詞四要素」「扮演目標客群」「紅藍隊攻防」（約196、519、567行） | 產品多切角換成同概念不同年齡、同活動不同讀者；紅隊改為家長／新同事／審稿老師，不把角色模擬稱為真實訪談 |
| 去識別化小示範 | [安美諾講義](../../amiino/content.md)「去識別化工具：三步驟上手」（約1168行）；[工具網站](https://deanlin.net/data-deidentification/) | 本次已讀取工具頁的操作說明；只用虛構校園文字，不沿用「無任何資安問題」「所有校務資料皆可用」等推論 |
| 三份材料各自用途 | [安美諾講義](../../amiino/content.md)「用Projects建立工作資料夾」（約385–480行） | 品牌語氣／規格／範例，換為通知格式／活動條件／教學目標，明確區分格式與事實 |
| Skill保存與跨情境測試 | [安美諾講義](../../amiino/content.md)「技能封裝」（約1250–1332行）；[Skill影片稿](../../../video/manus/ep3-技能（Skill）/origin.md)「最珍貴的是打磨成果的流程」 | 沿用先做好再保存SOP，換閱讀交流會驗證；不沿用「第二次零成本」或一次成功就保證穩定；不將Manus技能入口套給ChatGPT |
| Google應用與籌備摘要 | [安美諾講義](../../amiino/content.md)「生成週報」（約1094行）；[Connector影片稿](../../../video/manus/ep2-連結器（Connector／MCP）/origin.md) Gmail／Calendar案例 | 只借從來源整理摘要的工作方法，改為虛構籌備會；帳號授權、可用動作及定時執行另查OpenAI官方，不假設全校可用 |
| Project／Skill／排程的分工 | [Project影片稿](../../../video/manus/ep4-專案（Project）/origin.md)「技能＋連接器＋定時任務」（約333行） | 借用規則、事實、方法、時間各自分工的觀念；ChatGPT實際功能由官方核對，未照搬Manus排程與專案介面 |

### 新增官方核對（2026-11-05 實際 web open／find）

- [Build skills](https://learn.chatgpt.com/docs/build-skills)：Skills側欄、ChatGPT Work使用 `@skill-creator`、Codex使用 `$skill-creator`、明確及意圖觸發、Skill檔案構成。`/docs/skills` 本次404，未當成來源。
- [Plugins and skills 官方訓練](https://developers.openai.com/training/walkthroughs/plugins-and-skills)：連接Gmail與Calendar、先做成功brief再保存方法與新情境重跑。講義的角色與通知內容是教學改編。
- [Google Drive app and setup](https://help.openai.com/en/articles/10929079-google-drive-app-and-setup-in-chatgpt)：Plugins／Apps入口、Google帳號權限與管理員限制、找到檔名不等於讀到全文、Docs／Sheets／Slides經Drive應用提供。
- [Scheduled tasks](https://learn.chatgpt.com/docs/automations)：網頁任務可用該對話可取得的上傳檔案／工具／技能／外掛，不保留本機資料夾；先跑通再排程、檢查實際結果。
- [Set up scheduled tasks 官方訓練](https://developers.openai.com/training/walkthroughs/scheduled-tasks)：Gmail＋Calendar先手動生成來源brief，再在同一流程要求定時更新；依來源位置可能需要電腦與桌面程式保持可用。
- [Scheduled tasks Help](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt)：任務卡、Scheduled／通知管理、可用性與核准暫停。本次Help對「專案上傳檔」有較窄敘述，故不概括保證任務能讀全部專案材料；講義依Learn詳述可達來源，並要求先跑通。

### 可下載的真實虛構素材包

- 原始目錄：[example/reading-assistant](example/reading-assistant/使用說明.md)，build會打成 `assets/reading-assistant.zip`，content已用 `[download dir="reading-assistant"]` 接好。
- 內含活動條件、教學目標、通知格式、虛構郵件與行事曆，均為本次新寫的練習材料，不是產品已實測成果。
- 郵件與行事曆文字需由講師放進可使用的測試帳號，才可示範實際Google連接；單純下載或上傳文字檔不等於連接服務。
- 與第2堂共用「閱讀探索日」v1事實：高年級、免費、鉛筆水壺、活動日期未定、原訂圖書室；多功能教室為待確認提議。

### 新增待補圖片

- `assets/chatgpt-school-notice-skill.png`：桌面Skills入口、建立及新對話觸發；用實際帳號功能截圖。
- `assets/google-school-brief.png`：已連接測試帳號與虛構籌備摘要，引用連結可查回來源。
- `assets/scheduled-school-check.png`：任務確認卡、時區、下一次執行、暫停入口，不能只截聊天文字當已建立。

### 金句來源

「技能是把最好的一次，變成每一次」沿用安美諾講義約1272行。文中接續新情境驗收與人工檢查，沒有把這句當品質保證。未新增作者親身經驗或聲稱已跑過新的校園案例。
