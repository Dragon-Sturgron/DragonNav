import { computed, reactive } from 'vue'

const REFRESH_MS = 5000
const TIMEOUT_MS = 3500
const CONCURRENCY = 4
const HISTORY_SIZE = 3

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

export function useLatency() {
  const states = reactive({})
  const sites = new Map()
  const visibleIds = new Set()
  let intervalId = 0
  let scheduled = 0
  let running = false
  let disposed = false

  function ensure(id) {
    if (!states[id]) {
      states[id] = {
        status: 'idle',
        value: null,
        quality: 'unknown',
        history: [],
        updatedAt: 0,
        error: ''
      }
    }
    return states[id]
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

  async function fetchProbe(url) {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort('timeout'), TIMEOUT_MS)
    const started = performance.now()
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      })
      const ms = Math.max(1, Math.round(performance.now() - started))
      try { response?.body?.cancel?.() } catch {}
      controller.abort()
      return ms
    } finally {
      clearTimeout(timeout)
    }
  }

  function imageProbe(url) {
    return new Promise((resolve, reject) => {
      let probeUrl
      try {
        const target = new URL('/favicon.ico', url)
        target.searchParams.set('__dragonnav_latency', String(Date.now()))
        probeUrl = target.href
      } catch {
        reject(new Error('地址无效'))
        return
      }

      const image = new Image()
      const started = performance.now()
      const timeout = window.setTimeout(() => {
        cleanup()
        reject(new DOMException('Timeout', 'AbortError'))
      }, TIMEOUT_MS)
      const cleanup = () => {
        clearTimeout(timeout)
        image.onload = null
        image.onerror = null
        image.src = ''
      }
      const done = () => {
        const ms = Math.max(1, Math.round(performance.now() - started))
        cleanup()
        resolve(ms)
      }
      // HTTP 404、非图片内容等也会触发 onerror，但说明目标站已经返回响应，
      // 因此仍可以把耗时作为访问延迟参考。
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
        ms = await fetchProbe(site.url)
      } catch (error) {
        if (error?.name === 'AbortError') throw error
        // 少数网站会阻止跨域 fetch。此时退回到 favicon 图片探测，
        // 仍由当前浏览器/当前公网 IP 直接访问目标站。
        ms = await imageProbe(site.url)
      }

      const history = [...state.history, ms].slice(-HISTORY_SIZE)
      const value = median(history)
      state.history = history
      state.value = value
      state.quality = classify(value)
      state.status = 'ok'
      state.updatedAt = Date.now()
    } catch (error) {
      const timedOut = error?.name === 'AbortError'
      state.status = timedOut ? 'timeout' : 'error'
      state.error = timedOut ? '请求超时' : (error?.message || '无法检测')
      state.updatedAt = Date.now()
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
    const targets = [...visibleIds]
      .map(id => sites.get(id))
      .filter(Boolean)
    if (!targets.length) return

    running = true
    try {
      await runPool(targets)
    } finally {
      running = false
    }
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
    markVisible,
    start,
    stop,
    refresh: runRound,
    constants: { refreshMs: REFRESH_MS, timeoutMs: TIMEOUT_MS, concurrency: CONCURRENCY }
  }
}
