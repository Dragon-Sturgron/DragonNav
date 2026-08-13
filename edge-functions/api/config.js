const encoder = new TextEncoder();

function b64urlEncodeBytes(bytes) {
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64urlDecodeString(value) {
  value = value.replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4) value += "=";
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return b64urlEncodeBytes(new Uint8Array(sig));
}
function secureEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
async function verifyToken(token, secret, expectedUsername) {
  if (!token || !secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await sign(payload, secret);
  if (!secureEqual(signature, expected)) return false;
  try {
    const data = JSON.parse(b64urlDecodeString(payload));
    return data.u === expectedUsername && Number(data.exp) > Math.floor(Date.now() / 1000);
  } catch { return false; }
}
function bearer(request) {
  const header = request.headers.get("Authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

const KV_KEY = "NAV_CONFIG";
const DEFAULT_CONFIG = {"version":3,"settings":{"title":"龙鲟导航","subtitle":"搜索一下，或者直接打开常用网站","maxSites":0,"engineColorFollowTheme":false,"engineSelectedColor":"#52525b","engineUnselectedColor":"#ffffff","engineHoverColor":"#f1f2f4"},"categories":[{"id":"ai","name":"AI 工具","enabled":true},{"id":"dev","name":"开发与代码","enabled":true},{"id":"cloud","name":"云服务与部署","enabled":true},{"id":"office","name":"日常办公","enabled":true},{"id":"media","name":"影音与社区","enabled":true},{"id":"tools","name":"实用工具","enabled":true}],"sites":[{"id":"chatgpt","name":"ChatGPT","url":"https://chatgpt.com/","desc":"OpenAI AI 助手","icon":"","categoryId":"ai","enabled":true},{"id":"deepseek","name":"DeepSeek","url":"https://chat.deepseek.com/","desc":"DeepSeek AI 助手","icon":"","categoryId":"ai","enabled":true},{"id":"yuanbao","name":"腾讯元宝","url":"https://yuanbao.tencent.com/","desc":"腾讯 AI 助手","icon":"","categoryId":"ai","enabled":true},{"id":"gemini","name":"Gemini","url":"https://gemini.google.com/","desc":"Google AI 助手","icon":"","categoryId":"ai","enabled":true},{"id":"github","name":"GitHub","url":"https://github.com/","desc":"代码托管与协作","icon":"","categoryId":"dev","enabled":true},{"id":"gitee","name":"Gitee","url":"https://gitee.com/","desc":"国内代码托管平台","icon":"","categoryId":"dev","enabled":true},{"id":"mdn","name":"MDN","url":"https://developer.mozilla.org/zh-CN/","desc":"Web 开发文档","icon":"","categoryId":"dev","enabled":true},{"id":"stackoverflow","name":"Stack Overflow","url":"https://stackoverflow.com/","desc":"开发者问答社区","icon":"","categoryId":"dev","enabled":true},{"id":"edgeone","name":"EdgeOne Makers","url":"https://pages.edgeone.ai/","desc":"Tencent EdgeOne 部署平台","icon":"","categoryId":"cloud","enabled":true},{"id":"tencentcloud","name":"腾讯云","url":"https://cloud.tencent.com/","desc":"腾讯云控制台与服务","icon":"","categoryId":"cloud","enabled":true},{"id":"cloudflare","name":"Cloudflare","url":"https://dash.cloudflare.com/","desc":"CDN、DNS 与网络服务","icon":"","categoryId":"cloud","enabled":true},{"id":"vercel","name":"Vercel","url":"https://vercel.com/","desc":"前端应用部署平台","icon":"","categoryId":"cloud","enabled":true},{"id":"docsqq","name":"腾讯文档","url":"https://docs.qq.com/","desc":"在线文档与表格","icon":"","categoryId":"office","enabled":true},{"id":"feishu","name":"飞书","url":"https://www.feishu.cn/","desc":"协同办公平台","icon":"","categoryId":"office","enabled":true},{"id":"wps","name":"WPS","url":"https://www.wps.cn/","desc":"办公软件与云文档","icon":"","categoryId":"office","enabled":true},{"id":"notion","name":"Notion","url":"https://www.notion.so/","desc":"知识库与笔记","icon":"","categoryId":"office","enabled":true},{"id":"bilibili","name":"哔哩哔哩","url":"https://www.bilibili.com/","desc":"视频与社区","icon":"","categoryId":"media","enabled":true},{"id":"youtube","name":"YouTube","url":"https://www.youtube.com/","desc":"在线视频平台","icon":"","categoryId":"media","enabled":true},{"id":"zhihu","name":"知乎","url":"https://www.zhihu.com/","desc":"中文问答社区","icon":"","categoryId":"media","enabled":true},{"id":"weibo","name":"微博","url":"https://weibo.com/","desc":"社交媒体平台","icon":"","categoryId":"media","enabled":true},{"id":"speedtest","name":"Speedtest","url":"https://www.speedtest.net/","desc":"网络速度测试","icon":"","categoryId":"tools","enabled":true},{"id":"ipsb","name":"IP 查询","url":"https://ip.sb/","desc":"查看当前公网 IP","icon":"","categoryId":"tools","enabled":true},{"id":"caniuse","name":"Can I Use","url":"https://caniuse.com/","desc":"浏览器兼容性查询","icon":"","categoryId":"tools","enabled":true},{"id":"tinypng","name":"TinyPNG","url":"https://tinypng.com/","desc":"在线图片压缩","icon":"","categoryId":"tools","enabled":true}],"searchEngines":[{"id":"bing","name":"必应","url":"https://www.bing.com/search?q={q}","icon":"https://www.bing.com/favicon.ico","enabled":true},{"id":"baidu","name":"百度","url":"https://www.baidu.com/s?wd={q}","icon":"https://www.baidu.com/favicon.ico","enabled":true},{"id":"google","name":"Google","url":"https://www.google.com/search?q={q}","icon":"https://www.google.com/favicon.ico","enabled":true},{"id":"sogou","name":"搜狗","url":"https://www.sogou.com/web?query={q}","icon":"https://www.sogou.com/favicon.ico","enabled":true},{"id":"duck","name":"DuckDuckGo","url":"https://duckduckgo.com/?q={q}","icon":"https://duckduckgo.com/favicon.ico","enabled":true}]};
const DEFAULT_SEARCH_ENGINES = DEFAULT_CONFIG.searchEngines;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8", "cache-control": "no-store" }
  });
}
function getKV(env) {
  try { if (typeof NAV_KV !== "undefined" && NAV_KV) return NAV_KV; } catch {}
  return env?.NAV_KV || null;
}
async function isAdmin(request, env) {
  const username = env?.ADMIN_USERNAME || "";
  const secret = env?.SESSION_SECRET || "";
  if (!username || !secret) return false;
  return verifyToken(bearer(request), secret, username);
}

function legacyOrder(items) {
  return items.map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const as = Number(a.item?.sort);
      const bs = Number(b.item?.sort);
      const av = Number.isFinite(as) ? as : a.index * 10;
      const bv = Number.isFinite(bs) ? bs : b.index * 10;
      return av === bv ? a.index - b.index : av - bv;
    })
    .map(x => x.item);
}

function normalizeId(value, fallback) {
  const cleaned = String(value || fallback).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
  return cleaned || fallback;
}

function cleanHexColor(value, fallback) {
  const v = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : fallback;
}

function cleanSearchEngines(input) {
  const source = Array.isArray(input) && input.length ? input.slice(0, 50) : DEFAULT_SEARCH_ENGINES;
  const used = new Set();
  const out = [];
  source.forEach((e, i) => {
    let url = String(e?.url || "").trim();
    let icon = String(e?.icon || "").trim();
    const checkUrl = url.split("{q}").join("test");
    try {
      const u = new URL(checkUrl);
      if (!["http:", "https:"].includes(u.protocol)) url = "";
    } catch { url = ""; }
    if (!url) return;
    if (icon) {
      try {
        const u = new URL(icon);
        if (!["http:", "https:"].includes(u.protocol)) icon = "";
      } catch { icon = ""; }
    }

    let id = normalizeId(e?.id, `engine_${i}`);
    let n = 2;
    const base = id;
    while (used.has(id)) id = `${base}_${n++}`;
    used.add(id);

    out.push({
      id,
      name: String(e?.name || "未命名搜索").slice(0, 80),
      url,
      icon,
      enabled: e?.enabled !== false
    });
  });
  return out.length ? out : DEFAULT_SEARCH_ENGINES.map(e => ({ ...e }));
}

function cleanConfig(input) {
  const cfg = input && typeof input === "object" ? input : {};
  const settings = cfg.settings && typeof cfg.settings === "object" ? cfg.settings : {};
  let categories = Array.isArray(cfg.categories) ? cfg.categories.slice(0, 200) : [];
  let sites = Array.isArray(cfg.sites) ? cfg.sites.slice(0, 2000) : [];

  if (Number(cfg.version || 1) < 2) {
    categories = legacyOrder(categories);
    const grouped = new Map();
    sites.forEach((s, i) => {
      const key = String(s?.categoryId || "");
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push({ ...s, __legacyIndex: i });
    });
    const rebuilt = [];
    categories.forEach(c => {
      const group = grouped.get(String(c?.id || "")) || [];
      legacyOrder(group).forEach(s => rebuilt.push(s));
      grouped.delete(String(c?.id || ""));
    });
    grouped.forEach(group => legacyOrder(group).forEach(s => rebuilt.push(s)));
    sites = rebuilt;
  }

  const cleanCats = categories.map((c, i) => ({
    id: normalizeId(c?.id, `cat_${i}`).slice(0, 80),
    name: String(c?.name || "未命名分类").slice(0, 80),
    enabled: c?.enabled !== false
  }));
  const validCatIds = new Set(cleanCats.map(c => c.id));

  const cleanSites = sites.map((s, i) => {
    let url = String(s?.url || "").trim();
    let icon = String(s?.icon || "").trim();
    try { const u = new URL(url); if (!["http:", "https:"].includes(u.protocol)) url = ""; } catch { url = ""; }
    if (icon) {
      try { const u = new URL(icon); if (!["http:", "https:"].includes(u.protocol)) icon = ""; } catch { icon = ""; }
    }
    return {
      id: normalizeId(s?.id, `site_${i}`),
      name: String(s?.name || "未命名网站").slice(0, 100),
      url,
      desc: String(s?.desc || "").slice(0, 200),
      icon,
      categoryId: validCatIds.has(String(s?.categoryId)) ? String(s.categoryId) : (cleanCats[0]?.id || ""),
      enabled: s?.enabled !== false
    };
  }).filter(s => s.url && s.categoryId);

  return {
    version: 8,
    settings: {
      title: String(settings.title || "龙鲟导航").slice(0, 80),
      subtitle: String(settings.subtitle || "").slice(0, 200),
      maxSites: Math.max(0, Math.min(2000, Number(settings.maxSites || 0) | 0)),
      engineColorFollowTheme: false,
      engineSelectedColor: cleanHexColor(settings.engineSelectedColor, "#52525b"),
      engineUnselectedColor: "#ffffff",
      engineHoverColor: cleanHexColor(settings.engineHoverColor, "#f1f2f4")
    },
    searchEngines: cleanSearchEngines(cfg.searchEngines),
    categories: cleanCats,
    sites: cleanSites
  };
}

export default async function onRequest(context) {
  const { request, env } = context;
  const kv = getKV(env);
  if (!kv) return json({ error: "未绑定 KV。请将 KV Namespace 绑定变量名设置为 NAV_KV。" }, 500);

  if (request.method === "GET") {
    const url = new URL(request.url);
    const wantsAdmin = url.searchParams.get("admin") === "1";
    if (wantsAdmin && !(await isAdmin(request, env))) return json({ error: "登录状态已失效" }, 401);
    try {
      let config = await kv.get(KV_KEY, { type: "json" });
      if (!config) {
        config = DEFAULT_CONFIG;
        await kv.put(KV_KEY, JSON.stringify(config));
      }
      return json({ ok: true, config: cleanConfig(config) });
    } catch (error) {
      return json({ error: error?.message || "读取 KV 失败" }, 500);
    }
  }

  if (request.method === "POST") {
    if (!(await isAdmin(request, env))) return json({ error: "未登录或登录已过期" }, 401);
    let body;
    try { body = await request.json(); } catch { return json({ error: "请求格式错误" }, 400); }
    const config = cleanConfig(body?.config);
    if (!config.categories.length) return json({ error: "至少保留一个分类" }, 400);
    if (!config.searchEngines.length) return json({ error: "至少保留一个搜索引擎" }, 400);
    try {
      await kv.put(KV_KEY, JSON.stringify(config));
      return json({ ok: true, config });
    } catch (error) {
      return json({ error: error?.message || "写入 KV 失败" }, 500);
    }
  }
  return json({ error: "Method Not Allowed" }, 405);
}
