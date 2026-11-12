// ─── Config 載入與分層合併 ───
// 1. config/global.yaml（從課程目錄往上找最多 4 層）
// 2. <course-dir>/config.yaml（deep merge 覆蓋，陣列整個取代）

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import { parseYamlFull } from './yaml.mjs';
import { closest } from './text.mjs';

// Deep merge (arrays replaced, objects merged)
export function deepMerge(base, override) {
  if (!override) return base;
  if (!base) return override;
  if (typeof base !== 'object' || typeof override !== 'object') return override;
  if (Array.isArray(override)) return override;

  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (key in result && typeof result[key] === 'object' && typeof override[key] === 'object'
      && !Array.isArray(result[key]) && !Array.isArray(override[key])) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

// Detect GitHub Pages base URL from git remote（作為 seo.url / seo.image 的自動 fallback）
export function detectGitHubPagesBase(cwd) {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    // Match SSH: git@github.com:user/repo.git or HTTPS: https://github.com/user/repo.git
    // repo 名可含點（my.repo）；<owner>.github.io 是使用者站台，網址沒有 repo 路徑
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
    if (match) {
      const [, owner, repo] = match;
      if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) return `https://${repo.toLowerCase()}`;
      return `https://${owner}.github.io/${repo}`;
    }
  } catch { /* not a git repo or no remote */ }
  return null;
}

export function findGlobalConfig(courseDir) {
  let dir = dirname(courseDir);
  for (let i = 0; i < 4; i++) {
    const candidate = join(dir, 'config/global.yaml');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// opts.quiet：不印載入了哪些檔（build --quiet／--json 用）
// YAML 寫錯（引號未閉合）時丟 YamlError，訊息含檔案路徑與行號。
// layers：合併前的兩層原始設定（沒有該檔時為 null），給 validateConfig 標明值來自哪個檔
export function loadConfig(courseDir, opts = {}) {
  const log = opts.quiet ? () => {} : (msg) => console.log(msg);
  let cfg = {};
  let globalRoot = dirname(courseDir);
  const layers = { global: null, course: null };

  const globalConfig = findGlobalConfig(courseDir);
  if (globalConfig) {
    const globalRaw = readFileSync(globalConfig, 'utf-8');
    cfg = parseYamlFull(globalRaw, globalConfig);
    layers.global = cfg;
    globalRoot = dirname(dirname(globalConfig)); // dir containing config/
    log(`   Global config: ${globalConfig}`);
  }

  const courseConfig = join(courseDir, 'config.yaml');
  if (existsSync(courseConfig)) {
    const courseRaw = readFileSync(courseConfig, 'utf-8');
    const courseCfg = parseYamlFull(courseRaw, courseConfig);
    layers.course = courseCfg;
    cfg = deepMerge(cfg, courseCfg);
    log(`   Course config: ${courseConfig}`);
  } else {
    log(`   Course config: (none, using global only)`);
  }

  return { cfg, globalRoot, layers };
}

// ─── Config 驗證（介面 C）：寫錯不會中斷 build，但要講出來 ───
//
// 白名單來源：reference/config-example.yaml 出現過的所有鍵（含註解掉的 nav、quotes.*.author、
// LinkedIn／Email），另加三組 build 實際會讀、但範例沒列的鍵（標 ※）：
//   page.mode（build.mjs → data-mode）、seo.default_image（build.mjs og:image 備援）、
//   instructor.stats[].value/icon/unit（render.mjs buildInstructor 的舊格式）。
// config-example.yaml 增刪鍵時請同步改這裡。
const LEAF = true;
const CONFIG_SCHEMA = {
  page: { lang: LEAF, favicon: LEAF, title: LEAF, badge: LEAF, hero_title: LEAF, subtitle: LEAF, mode: LEAF /* ※ */ },
  instructor: {
    name: LEAF, tagline: LEAF, bio: LEAF, avatar: LEAF,
    stats: [{ text: LEAF, url: LEAF, value: LEAF /* ※ */, icon: LEAF /* ※ */, unit: LEAF /* ※ */ }],
    socials: [{ platform: LEAF, url: LEAF }],
  },
  quotes: {
    opening: { text: LEAF, author: LEAF },
    closing: { text: LEAF, author: LEAF },
  },
  nav: [{ text: LEAF, href: LEAF }],
  footer: { cta: LEAF, copyright: LEAF, show_socials: LEAF },
  seo: { site_name: LEAF, type: LEAF, title: LEAF, description: LEAF, image: LEAF, url: LEAF, default_image: LEAF /* ※ */ },
};

// render.mjs SOCIAL_SVGS 支援的平台（大小寫需一致，否則圖示空白）
export const SOCIAL_PLATFORMS = ['Medium', 'Facebook', 'Threads', 'YouTube', 'GitHub', 'LinkedIn', 'Email'];

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function checkUnknownKeys(value, schema, path, out) {
  if (Array.isArray(schema)) {
    if (!Array.isArray(value)) return;
    value.forEach((item, idx) => {
      if (isPlainObject(item)) checkUnknownKeys(item, schema[0], `${path}[${idx}]`, out);
    });
    return;
  }
  if (!isPlainObject(schema) || !isPlainObject(value)) return;
  const allowed = Object.keys(schema);
  for (const key of Object.keys(value)) {
    const p = path ? `${path}.${key}` : key;
    if (!(key in schema)) {
      const guess = closest(key, allowed);
      out.push({
        path: p, rule: 'unknown-key', level: 'warn',
        msg: `設定鍵 \`${p}\` 不認得，會被忽略；`
          + (guess ? `是不是要寫 \`${guess}\`？` : `這一層可用的鍵：${allowed.join(', ')}`),
      });
      continue;
    }
    if (schema[key] !== LEAF) checkUnknownKeys(value[key], schema[key], p, out);
  }
}

// opts.layers：loadConfig 回傳的 { global, course }；給了才在訊息裡標明值寫在哪個檔
export function validateConfig(cfg, opts = {}) {
  const out = [];
  if (!isPlainObject(cfg)) return out;

  checkUnknownKeys(cfg, CONFIG_SCHEMA, '', out);

  // 必須是絕對網址的欄位（社群平台、瀏覽器分頁都抓不到相對路徑）；空值＝沒設定，不報
  // from：值寫在哪個檔（global.yaml／config.yaml），只用在訊息
  const absUrl = (path, v, allowMailto, from) => {
    if (v === undefined || v === null || v === '' || typeof v !== 'string') return;
    if (/^https?:\/\//i.test(v)) return;
    if (allowMailto && /^mailto:/i.test(v)) return;
    out.push({
      path, rule: 'url-not-absolute', level: 'warn',
      msg: `\`${path}\`${from ? `（寫在 ${from}）` : ''} 要用 https:// 開頭的完整網址（目前是 "${v}"）${allowMailto ? '，Email 用 mailto:' : '，相對路徑在社群預覽與部署後會失效'}`,
    });
  };
  absUrl('seo.image', cfg.seo?.image);
  // seo.default_image 只在沒有 seo.image 時才會用到（build.mjs og:image 備援），有 seo.image 就不報
  if (!cfg.seo?.image) {
    const { layers } = opts;
    const from = !layers ? null
      : layers.course?.seo?.default_image !== undefined ? 'config.yaml'
        : layers.global?.seo?.default_image !== undefined ? 'global.yaml' : null;
    absUrl('seo.default_image', cfg.seo?.default_image, false, from);
  }
  absUrl('seo.url', cfg.seo?.url);
  absUrl('page.favicon', cfg.page?.favicon);

  const socials = Array.isArray(cfg.instructor?.socials) ? cfg.instructor.socials : [];
  socials.forEach((s, idx) => {
    if (!isPlainObject(s)) return;
    const base = `instructor.socials[${idx}]`;
    if (s.platform !== undefined && !SOCIAL_PLATFORMS.includes(s.platform)) {
      const guess = closest(s.platform, SOCIAL_PLATFORMS);
      out.push({
        path: `${base}.platform`, rule: 'unknown-platform', level: 'warn',
        msg: `社群平台「${s.platform}」不在支援清單，圖示會是空白；`
          + (guess ? `是不是要寫「${guess}」？` : '')
          + `可用：${SOCIAL_PLATFORMS.join('／')}（大小寫要一致）`,
      });
    }
    absUrl(`${base}.url`, s.url, true);
  });

  if (!cfg.page?.title) {
    out.push({
      path: 'page.title', rule: 'missing-required', level: 'warn',
      msg: '`page.title` 是空的：瀏覽器分頁標題與側欄品牌會空白，請在課程 config.yaml 的 page: 底下補上 title',
    });
  }

  return out;
}
