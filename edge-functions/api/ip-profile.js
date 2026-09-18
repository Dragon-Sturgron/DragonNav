function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'private, no-store, max-age=0',
      'x-content-type-options': 'nosniff'
    }
  })
}

function text(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function number(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function bool(value) {
  return typeof value === 'boolean' ? value : null
}

async function fetchJson(url, timeoutMs = 3800) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      redirect: 'follow',
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

function safeIp(value) {
  const v = String(value || '').trim().replace(/^\[|\]$/g, '')
  if (!v || v.length > 64 || !/^[0-9a-fA-F:.]+$/.test(v)) return ''
  return v
}

function clientInfo(context) {
  const request = context.request
  const eo = request?.eo || {}
  const geo = eo.geo || context.geo || {}
  const forwarded = request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = safeIp(
    eo.clientIp ||
    context.clientIp ||
    request?.headers?.get('eo-connecting-ip') ||
    request?.headers?.get('x-real-ip') ||
    forwarded
  )
  return { ip, geo }
}

function countryFlag(code) {
  const cc = String(code || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(cc)) return '🌐'
  return String.fromCodePoint(...[...cc].map(ch => 127397 + ch.charCodeAt(0)))
}

function parseAsnFlat(value) {
  const raw = text(value)
  if (!raw) return { asn: null, owner: null }
  const match = raw.match(/^AS(\d+)\s*(.*)$/i)
  return match ? { asn: Number(match[1]), owner: text(match[2]) } : { asn: null, owner: raw }
}

function rdapEntityNames(rdap) {
  const names = []
  for (const entity of Array.isArray(rdap?.entities) ? rdap.entities : []) {
    const card = entity?.vcardArray?.[1]
    if (!Array.isArray(card)) continue
    for (const row of card) {
      if (!Array.isArray(row) || !['fn', 'org'].includes(row[0])) continue
      const value = Array.isArray(row[3]) ? row[3].join(' ') : row[3]
      if (text(value)) names.push(text(value))
    }
  }
  return [...new Set(names)].slice(0, 4)
}

function rdapDate(rdap, actions) {
  const wanted = new Set(actions)
  const events = Array.isArray(rdap?.events) ? rdap.events : []
  const row = events.find(item => wanted.has(String(item?.eventAction || '').toLowerCase()))
  return text(row?.eventDate)
}

function rdapCidr(rdap) {
  const list = Array.isArray(rdap?.cidr0_cidrs) ? rdap.cidr0_cidrs : []
  const first = list[0]
  if (!first) return null
  if (first.v4prefix && Number.isInteger(first.length)) return `${first.v4prefix}/${first.length}`
  if (first.v6prefix && Number.isInteger(first.length)) return `${first.v6prefix}/${first.length}`
  return null
}

function rirName(rdap, ipapi) {
  const direct = text(ipapi?.asn?.rir)
  if (direct) return direct.toUpperCase()
  const source = `${rdap?.port43 || ''} ${rdap?.links?.map?.(x => x?.href).join(' ') || ''}`.toLowerCase()
  if (source.includes('apnic')) return 'APNIC'
  if (source.includes('arin')) return 'ARIN'
  if (source.includes('ripe')) return 'RIPE NCC'
  if (source.includes('lacnic')) return 'LACNIC'
  if (source.includes('afrinic')) return 'AFRINIC'
  return null
}

function ipv4ToBigInt(ip) {
  const parts = String(ip).split('.')
  if (parts.length !== 4 || parts.some(x => !/^\d+$/.test(x) || Number(x) > 255)) return null
  let value = 0n
  for (const part of parts) value = (value << 8n) + BigInt(Number(part))
  return value
}

function addressCount(start, end) {
  const a = ipv4ToBigInt(start)
  const b = ipv4ToBigInt(end)
  if (a === null || b === null || b < a) return null
  return (b - a + 1n).toString()
}

function reverseDnsName(ip) {
  if (ip.includes(':')) {
    const parts = ip.split('::')
    const left = parts[0] ? parts[0].split(':') : []
    const right = parts[1] ? parts[1].split(':') : []
    const missing = 8 - left.length - right.length
    const full = [...left, ...Array(Math.max(0, missing)).fill('0'), ...right]
      .map(x => x.padStart(4, '0'))
      .join('')
    if (!/^[0-9a-fA-F]{32}$/.test(full)) return null
    return `${[...full].reverse().join('.')}.ip6.arpa`
  }
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  return `${parts.reverse().join('.')}.in-addr.arpa`
}

async function ptrLookup(ip) {
  const name = reverseDnsName(ip)
  if (!name) return null
  const data = await fetchJson(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=PTR`, 3000)
  const answer = Array.isArray(data?.Answer) ? data.Answer : []
  const value = answer.find(x => x?.type === 12)?.data
  return text(value)?.replace(/\.$/, '') || null
}

function healthStatus(score) {
  if (!Number.isFinite(score)) return 'unknown'
  if (score >= 75) return 'good'
  if (score >= 45) return 'moderate'
  return 'poor'
}

function ipType(flags) {
  if (flags.mobile === true) return '移动网络'
  if (flags.residential === true) return '住宅 IP'
  if (flags.datacenter === true) return '数据中心 IP'
  if (flags.vpn === true || flags.proxy === true || flags.tor === true) return '代理 / 隧道 IP'
  return '未明确分类'
}

function scenarioReference(score, flags) {
  const base = Number.isFinite(score) ? score : 60
  const severe = flags.abuser === true || flags.tor === true || base < 45
  const tunnel = flags.vpn === true || flags.proxy === true
  const dc = flags.datacenter === true

  function status(kind) {
    if (severe) return { level: 'warn', text: '建议实测' }
    if (kind === 'sensitive' && (tunnel || dc || base < 75)) return { level: 'watch', text: '需实测' }
    if (kind === 'stream' && tunnel) return { level: 'watch', text: '需实测' }
    if (base >= 75) return { level: 'good', text: '低风险信号' }
    return { level: 'watch', text: '需实测' }
  }

  return [
    ['AI 应用', 'sensitive'],
    ['跨境电商', 'sensitive'],
    ['社交与短视频', 'sensitive'],
    ['流媒体影音', 'stream'],
    ['开发与软件源', 'normal'],
    ['云服务与托管', 'normal'],
    ['搜索与资讯', 'normal'],
    ['办公协作', 'normal'],
    ['邮箱与通信', 'sensitive']
  ].map(([name, kind]) => ({ name, ...status(kind) }))
}

export default async function onRequest(context) {
  if (context.request.method !== 'GET') return json({ error: 'Method Not Allowed' }, 405)

  const { ip, geo } = clientInfo(context)
  if (!ip) return json({ error: '无法从 EdgeOne 请求上下文获取当前访问 IP' }, 503)

  const apiKey = text(context.env?.IPAPI_KEY)
  const ipapiUrl = `https://api.ipapi.is/?q=${encodeURIComponent(ip)}${apiKey ? `&key=${encodeURIComponent(apiKey)}` : ''}`

  const [healthResult, ipapiResult, rdapResult, ptrResult] = await Promise.allSettled([
    fetchJson(`https://ip.net.coffee/api/ip/lookup/${encodeURIComponent(ip)}`),
    fetchJson(ipapiUrl),
    fetchJson(`https://rdap.org/ip/${encodeURIComponent(ip)}`),
    ptrLookup(ip)
  ])

  const health = healthResult.status === 'fulfilled' ? healthResult.value : {}
  const ipapi = ipapiResult.status === 'fulfilled' ? ipapiResult.value : {}
  const rdap = rdapResult.status === 'fulfilled' ? rdapResult.value : {}
  const ptr = ptrResult.status === 'fulfilled' ? ptrResult.value : null

  const ipapiFlatAsn = typeof ipapi?.asn === 'string' ? parseAsnFlat(ipapi.asn) : { asn: null, owner: null }
  const flags = {
    residential: bool(health?.isResidential ?? health?.residential),
    datacenter: bool(health?.is_datacenter ?? ipapi?.is_datacenter),
    mobile: bool(health?.is_mobile ?? ipapi?.is_mobile),
    vpn: bool(health?.is_vpn ?? ipapi?.is_vpn),
    proxy: bool(health?.is_proxy ?? ipapi?.is_proxy),
    tor: bool(health?.is_tor ?? ipapi?.is_tor),
    crawler: bool(health?.is_crawler ?? ipapi?.is_crawler),
    abuser: bool(health?.is_abuser ?? ipapi?.is_abuser),
    bogon: bool(ipapi?.is_bogon)
  }

  const score = number(health?.trust_score)
  const asn = number(geo?.asn) ?? number(health?.asn) ?? number(ipapi?.asn?.asn) ?? ipapiFlatAsn.asn
  const asnOwner = text(ipapi?.asn?.org) || ipapiFlatAsn.owner || text(health?.isp)
  const company = text(ipapi?.company?.name) || (typeof ipapi?.company === 'string' ? text(ipapi.company) : null) || rdapEntityNames(rdap)[0] || asnOwner
  const companyDomain = text(ipapi?.company?.domain) || text(ipapi?.asn?.domain)
  const country = text(geo?.countryName) || text(health?.country) || text(ipapi?.location?.country) || text(ipapi?.country) || text(rdap?.country)
  const countryCode = text(geo?.countryCodeAlpha2) || text(ipapi?.location?.country_code) || (String(rdap?.country || '').length === 2 ? String(rdap.country).toUpperCase() : null)
  const region = text(geo?.regionName) || text(health?.region) || text(ipapi?.location?.state) || text(ipapi?.region)
  const city = text(geo?.cityName) || text(health?.city) || text(ipapi?.location?.city) || text(ipapi?.city)
  const latitude = number(geo?.latitude) ?? number(ipapi?.location?.latitude) ?? number(ipapi?.lat)
  const longitude = number(geo?.longitude) ?? number(ipapi?.location?.longitude) ?? number(ipapi?.lon)
  const timezone = text(ipapi?.location?.timezone) || text(ipapi?.timezone)
  const startAddress = text(rdap?.startAddress)
  const endAddress = text(rdap?.endAddress)
  const cidr = text(ipapi?.asn?.route) || rdapCidr(rdap)
  const registeredAt = text(ipapi?.asn?.created) || rdapDate(rdap, ['registration'])
  const updatedAt = text(ipapi?.asn?.updated) || rdapDate(rdap, ['last changed', 'last update of rdap database'])
  const registry = rirName(rdap, ipapi)
  const companyType = text(ipapi?.company?.type) || text(ipapi?.asn?.type)
  const ipVersion = ip.includes(':') ? 'IPv6' : 'IPv4'
  const numeric = ipVersion === 'IPv4' ? ipv4ToBigInt(ip)?.toString() || null : null

  const result = {
    ok: true,
    checkedAt: new Date().toISOString(),
    ip,
    ipVersion,
    numeric,
    flag: countryFlag(countryCode),
    location: { country, countryCode, region, city, latitude, longitude, timezone },
    identity: {
      asn,
      asnOwner,
      isp: text(health?.isp) || asnOwner,
      company,
      companyDomain,
      companyType,
      registry,
      registeredAt,
      updatedAt,
      hostname: ptr,
      cidr,
      range: startAddress && endAddress ? `${startAddress} – ${endAddress}` : null,
      addressCount: addressCount(startAddress, endAddress),
      rdapName: text(rdap?.name),
      rdapHandle: text(rdap?.handle)
    },
    risk: {
      score,
      status: healthStatus(score),
      ipType: ipType(flags),
      flags,
      abuserScore: text(ipapi?.asn?.abuser_score) || text(ipapi?.company?.abuser_score),
      assessment: flags.abuser === true || flags.tor === true
        ? '检测到较强风险信号'
        : flags.vpn === true || flags.proxy === true
          ? '检测到代理或 VPN 信号'
          : score !== null && score >= 75
            ? '当前未发现明显风险信号'
            : '建议结合实际平台访问结果判断'
    },
    scenarios: scenarioReference(score, flags),
    unsupported: {
      nativeIp: '暂无可靠公开数据，未做“原生/广播 IP”结论',
      sharedUsers: '暂无可信公开数据，未估算共享人数',
      platformUnlock: '未把网络风险信号等同于具体平台官方解锁结果'
    },
    sources: {
      edgeOne: true,
      netCoffee: healthResult.status === 'fulfilled',
      ipapi: ipapiResult.status === 'fulfilled',
      ipapiEnhanced: Boolean(apiKey),
      rdap: rdapResult.status === 'fulfilled',
      ptr: ptrResult.status === 'fulfilled' && Boolean(ptr)
    }
  }

  return json(result)
}
