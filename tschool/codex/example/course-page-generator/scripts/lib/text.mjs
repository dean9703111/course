// ─── 共用文字處理：escape、行內 Markdown、id 生成、屬性解析 ───

export function esc(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function raw(s) { return typeof s === 'string' ? s : ''; }

// 解析單行標籤的 key="value" 屬性（[qa-session title="..."]、[pr from="..." to="..."] 等通用）
export function parseAttrs(line) {
  const attrs = {};
  const re = /([\w-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(line))) attrs[m[1]] = m[2];
  return attrs;
}

export function inlineFormat(text) {
  // 行內程式碼先抽成佔位符（私用區字元），反引號內的 **、[[…]]、圖片、連結、網址都不再轉換；
  // 放回時整段跳脫（`<type>`、`a < b` 照字面顯示，不會被瀏覽器當成標籤）
  const codes = [];
  return text
    .replace(/`([^`]+)`/g, (_, code) => `${codes.push(code) - 1}`)
    .replace(/\[\[(?:(red|green|orange|purple|blue):)?([^\]\n]+?)\]\]/g, (_, color, label) =>
      `<span class="inline-tag${color ? ` ${color}` : ''}">${label}</span>`)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{max-width=([^}]+)\})?/g, (_, alt, src, maxWidth) => {
      const style = maxWidth ? ` style="max-width:${maxWidth}"` : '';
      return `<img src="${src}" alt="${alt}" class="inline-image"${style}>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<![("'=>\]])(https?:\/\/[^\s<>"'`)\]，。、；：！？「」『』（）【】]+)/g, '[$1]($1)')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(\d+)/g, (_, n) => `<code>${esc(codes[n])}</code>`);
}

export function inlineFormatWithBreaks(text) {
  return inlineFormat(text).replace(/\n/g, '<br>');
}

export function stripInlineMarkdown(text) {
  return text
    .replace(/\[\[(?:(?:red|green|orange|purple|blue):)?([^\]\n]+?)\]\]/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

// 標題開頭的 emoji 圖示：變體選擇子（U+FE0F）、ZWJ 序列（👨‍💻、🏳️‍🌈）、膚色修飾、國旗（兩個區域指示符）
// 都算同一個圖示，可連續多個。# 章節、### 卡片與 lint 共用，判定才會一致。
export const EMOJI_ICON_SRC = String.raw`(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)+`;
const LEADING_ICON_RE = new RegExp(`^${EMOJI_ICON_SRC}`, 'u');

// 常用標題 → 固定錨點 id 的對照表（文件見 reference/components.md §1）。
// 中文標題預設沒有可讀的 #id，常用的幾個先固定下來；頁面分享出去之後，
// 修改或移除會讓既有連結的錨點失效，請只增不改，可依自己的慣用標題擴充。
const STABLE_ANCHOR_MAP = {
  '新專案': 'new-project', '舊專案': 'old-project', '導入測試': 'testing', '總結': 'summary',
  'OpenSpec 初始化': 'openspec-init', '從零建立專案': 'create-project', '建立專案規則': 'project-rules',
  'OpenSpec 迭代': 'openspec-iterate', '設定 Commit Skill': 'commit-skill', 'Commit Skill': 'commit-skill',
  '設定 PR Skill': 'pr-skill', 'PR Skill': 'pr-skill',
  'Git Worktree 並行開發': 'worktree', 'Worktree': 'worktree',
  'gen-test-cases': 'gen-test', 'GitHub Action 自動化': 'github-action', 'GitHub Action': 'github-action',
  // 2026-10-25 比對改成「完全相等／關鍵字＋冒號」後，為了讓既有課程已分享的錨點不變而補的別名（只增不改）
  '課程總結': 'summary',
  'CI/CD 篇': 'github-action',
  'gen-test-cases 工作流設計': 'gen-test',
  '接受變更並建立專案規則': 'project-rules', '建立專案規則、加入版本控制': 'project-rules',
  '認識 Git Worktree': 'worktree', '透過 Git Worktree 提升協作效率': 'worktree',
  'Git Worktree 提高協作效率': 'worktree', '認識 Git Worktree，了解多人專案協作技巧': 'worktree',
  '更新專案使用套件': 'new-project', '更新專案套件版本、GitHub Action 使用工具': 'new-project',
  '在新的 Worktree 工作區設計 pnpm 環境': 'worktree',
};

// 命中規則：標題（剝除開頭 emoji 後）完全等於關鍵字，或以「關鍵字＋：／:」開頭；不用子字串比對，
// 否則「總結與展望」「新專案常見錯誤」也會搶走固定錨點。branch／tab 標記由呼叫端先剝除。
export function generateId(title) {
  const bare = String(title).replace(LEADING_ICON_RE, '').trim();
  for (const [k, v] of Object.entries(STABLE_ANCHOR_MAP)) {
    if (bare === k || bare.startsWith(k + '：') || bare.startsWith(k + ':')) return v;
  }

  return title
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// 將工具分頁 label（[ChatGPT]/[Gemini]/[Claude]）映射到品牌色票 key；未知工具用 default（主題 accent）。
export function tabColorKey(label) {
  const l = String(label).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (l === 'chatgpt' || l === 'gpt' || l === 'openai') return 'chatgpt';
  if (l === 'gemini' || l === 'google') return 'gemini';
  if (l === 'claude' || l === 'anthropic') return 'claude';
  return 'default';
}

// 可用 `[Label|color]` 手動指定的 5 種常見色。
export const TAB_COLORS = ['red', 'orange', 'green', 'blue', 'purple'];

// 決定分頁色票 key：有指定且合法 → 用指定色；否則沿用品牌自動配色。
export function resolveTabKey(label, explicitColor) {
  if (explicitColor) {
    const c = String(explicitColor).toLowerCase();
    if (TAB_COLORS.includes(c)) return c;
  }
  return tabColorKey(label);
}

// 將分支名（取 `/` 前第一段）映射到色票 key。
export function branchColorKey(name) {
  const head = String(name).split('/')[0].toLowerCase();
  if (head === 'main' || head === 'master') return 'main';
  if (head === 'develop' || head === 'dev' || head === 'development') return 'develop';
  if (head === 'feature' || head === 'feat') return 'feature';
  if (head === 'release' || head === 'rel') return 'release';
  if (head === 'hotfix' || head === 'fix' || head === 'bugfix') return 'hotfix';
  return 'default';
}

// 工具分頁 label chip（網頁隱藏；列印／簡報模式顯示，標示內容屬於哪個工具分頁）
export function tabTag(block) {
  if (!block.tab) return '';
  return `<span class="tab-pane-tag tab-pane-tag--${block.tabKey}">${esc(block.tab)}</span>`;
}

// 錯字建議（lint 未知標籤、config 未知鍵／平台共用）：回傳編輯距離最近、且夠接近的候選；沒有就回傳 null。
// 比較時忽略大小寫，並把 - 視同 _（hero-title → hero_title）。
export function closest(word, candidates) {
  const norm = (s) => String(s).toLowerCase().replace(/-/g, '_');
  const w = norm(word);
  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = editDistance(w, norm(c));
    if (d < bestDist) { best = c; bestDist = d; }
  }
  const limit = w.length >= 8 ? 3 : w.length >= 4 ? 2 : 1;
  return bestDist <= limit ? best : null;
}

function editDistance(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}
