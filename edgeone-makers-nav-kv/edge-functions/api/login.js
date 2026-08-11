import { makeToken } from "../_lib/auth.js";

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