import { computed, reactive } from 'vue'

const REFRESH_MS = 5000
const TIMEOUT_MS = 3200
const CONCURRENCY = 4
const HISTORY_SIZE = 5

function median(values) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function classify(ms) {
  if (!Number.isFinite(ms)) return 'unknown'
  if (ms <= 100) return 'excellent'
  if (ms <= 250) return 'good'
  if (ms <= 500) return 'fair'
  return 'slow'
}

function makeProbeUrl(siteUrl) {
  const target = new URL('/favicon.ico', siteUrl)
  target.searchParams.set('__dragonnav_probe', `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
  return target.href
}

export function useLatency() {
  const states = reactive({})
  const sites = new Map()
  const visibleIds = new Set()
  let intervalId = 0
  let scheduled = 0
  let running = false
  let disposed = false
  let clientIp = ''

  function ensure(id) {
    if (!states[id]) {
      states[id] = {
        status: 'idle',
        value: null,
        quality: 'unknown',
        history: [],
        updatedAt: 0,
        error: '',
        testedIp: ''
      }
    }
    return states[id]
  }

  function reset() {
    for (const state of Object.values(states)) {
      state.status = 'idle'
      state.value = null
      state.quality = 'unknown'
      state.history = []
      state.updatedAt = 0
      state.error = ''
      state.testedIp = ''
    }
    schedule(80)
  }

  function setClientIp(nextIp) {
    const next = String(nextIp || '')
    if (next === clientIp) return
    const hadIp = Boolean(clientIp)
    clientIp = next
    // 出口 IP 发生变化时清空旧线路的历史值，避免把两条线路的样本混在一起。
    if (hadIp || next) reset()
  }

  function setSites(list) {
    sites.clear()
    for (const site of list || []) {
      if (!site?.id || !site?.url) continue
      sites.set(site.id, site)
      ensure(site.id)
    }
    for (const id of Object.keys(states)) {
      if (!sites.has(id)) delete states[id]
    }
    schedule(80)
  }

  function markVisible(id, visible) {
    if (!id) return
    if (visible) {
      visibleIds.add(id)
      const state = ensure(id)
      if (state.status === 'idle' || Date.now() - state.updatedAt > REFRESH_MS) schedule(60)
    } else {
      visibleIds.delete(id)
    }
  }

  function schedule(delay = 120) {
    if (disposed || document.hidden) return
    clearTimeout(scheduled)
    scheduled = window.setTimeout(() => runRound(), delay)
  }

  async function directFetchProbe(siteUrl) {
    const controller = new AbortController()
    const timeoutError = new DOMException('Timeout', 'AbortError')
    const timeout = window.setTimeout(() => controller.abort(timeoutError), TIMEOUT_MS)
    const started = performance.now()
    try {
      // 请求直接由当前浏览器发出，因此走的就是用户当前公网 IP / VPN / 代理线路。
      // 使用目标域名的 favicon，避免下载整页 HTML 对结果造成过大干扰。
      await fetch(makeProbeUrl(siteUrl), {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      })
      return Math.max(1, Math.round(performance.now() - started))
    } finally {
      clearTimeout(timeout)
    }
  }

  function imageProbe(siteUrl) {
    return new Promise((resolve, reject) => {
      let probeUrl
      try { probeUrl = makeProbeUrl(siteUrl) } catch {
        reject(new Error('地址无效'))
        return
      }

      const image = new Image()
      const started = performance.now()
      let settled = false
      const timeout = window.setTimeout(() => {
        if (settled) return
        settled = true
        cleanup()
        reject(new DOMException('Timeout', 'AbortError'))
      }, TIMEOUT_MS)

      const cleanup = () => {
        clearTimeout(timeout)
        image.onload = null
        image.onerror = null
        try { image.src = '' } catch {}
      }

      const done = () => {
        if (settled) return
        settled = true
        const ms = Math.max(1, Math.round(performance.now() - started))
        cleanup()
        // 即使返回 404 或非图片内容，onerror 也说明目标域名已经完成一次响应。
        resolve(ms)
      }

      image.onload = done
      image.onerror = done
      image.referrerPolicy = 'no-referrer'
      image.src = probeUrl
    })
  }

  async function measure(site) {
    const state = ensure(site.id)
    state.status = 'testing'
    state.error = ''

    try {
      let ms
      try {
        ms = await directFetchProbe(site.url)
      } catch (error) {
        if (error?.name === 'AbortError') throw error
        ms = await imageProbe(site.url)
      }

      const history = [...state.history, ms].slice(-HISTORY_SIZE)
      const value = median(history)
      state.history = history
      state.value = value
      state.quality = classify(value)
      state.status = 'ok'
      state.updatedAt = Date.now()
      state.testedIp = clientIp
    } catch (error) {
      const timedOut = error?.name === 'AbortError'
      state.status = timedOut ? 'timeout' : 'error'
      state.error = timedOut ? '请求超时' : (error?.message || '无法检测')
      state.updatedAt = Date.now()
      state.testedIp = clientIp
    }
  }

  async function runPool(list) {
    let cursor = 0
    async function worker() {
      while (cursor < list.length) {
        const index = cursor++
        await measure(list[index])
      }
    }
    const workers = Array.from({ length: Math.min(CONCURRENCY, list.length) }, () => worker())
    await Promise.all(workers)
  }

  async function runRound() {
    if (disposed || running || document.hidden) return
    const targets = [...visibleIds].map(id => sites.get(id)).filter(Boolean)
    if (!targets.length) return

    running = true
    try { await runPool(targets) } finally { running = false }
  }

  function start() {
    if (intervalId || disposed) return
    intervalId = window.setInterval(() => runRound(), REFRESH_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
    schedule(100)
  }

  function onVisibilityChange() {
    if (!document.hidden) schedule(120)
  }

  function stop() {
    disposed = true
    clearInterval(intervalId)
    clearTimeout(scheduled)
    intervalId = 0
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  const summary = computed(() => {
    const list = Object.values(states)
    const ready = list.filter(item => item.status === 'ok' && Number.isFinite(item.value))
    return {
      testing: list.filter(item => item.status === 'testing').length,
      ready: ready.length,
      total: sites.size,
      median: median(ready.map(item => item.value))
    }
  })

  return {
    states,
    summary,
    setSites,
    setClientIp,
    markVisible,
    start,
    stop,
    reset,
    refresh: runRound,
    constants: { refreshMs: REFRESH_MS, timeoutMs: TIMEOUT_MS, concurrency: CONCURRENCY }
  }
}
