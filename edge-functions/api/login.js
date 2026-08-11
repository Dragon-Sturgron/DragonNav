const encoder = new TextEncoder();

function b64urlEncodeBytes(bytes) {
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlEncodeString(value) {
  return b64urlEncodeBytes(encoder.encode(value));
}

function b64urlDecodeString(value) {
  value = value.replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4) value += "=";
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return b64urlEncodeBytes(new Uint8Array(sig));
}

function secureEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function makeToken(username, secret, ttlSeconds = 43200) {
  const payload = b64urlEncodeString(JSON.stringify({
    u: username,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds
  }));
  return `${payload}.${await sign(payload, secret)}`;
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
  } catch {
    return false;
  }
}

function bearer(request) {
  const header = request.headers.get("Authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

export default async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const adminUsername = env?.ADMIN_USERNAME || "";
  const adminPassword = env?.ADMIN_PASSWORD || "";
  const sessionSecret = env?.SESSION_SECRET || "";

  if (!adminUsername || !adminPassword || !sessionSecret) {
    return json({ error: "后台环境变量未配置完整：ADMIN_USERNAME / ADMIN_PASSWORD / SESSION_SECRET" }, 500);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "请求格式错误" }, 400); }

  if (body?.username !== adminUsername || body?.password !== adminPassword) {
    return json({ error: "账号或密码错误" }, 401);
  }

  const token = await makeToken(adminUsername, sessionSecret);
  return json({ ok: true, token, expiresIn: 43200 });
}