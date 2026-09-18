import { ref } from 'vue'

const AUTO_REFRESH_MS = 30 * 1000

export function useIpProfile() {
  const data = ref(null)
  const loading = ref(false)
  const refreshing = ref(false)
  const error = ref('')
  const lastSuccessAt = ref(0)
  let intervalId = 0
  let inflight = null
  let disposed = false

  async function load() {
    if (inflight) return inflight

    const firstLoad = !data.value
    if (firstLoad) loading.value = true
    refreshing.value = true
    error.value = ''

    inflight = (async () => {
      try {
        const response = await fetch(`/api/ip-profile?ts=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'cache-control': 'no-cache' }
        })
        const body = await response.json()
        if (!response.ok || !body?.ip) throw new Error(body?.error || `HTTP ${response.status}`)
        data.value = body
        lastSuccessAt.value = Date.now()
        return body
      } catch (err) {
        error.value = err?.message || 'IP 信息获取失败'
        return data.value
      } finally {
        loading.value = false
        refreshing.value = false
        inflight = null
      }
    })()

    return inflight
  }

  function onVisibilityChange() {
    if (document.hidden) return
    if (!lastSuccessAt.value || Date.now() - lastSuccessAt.value >= AUTO_REFRESH_MS) load()
  }

  function start() {
    if (disposed || intervalId) return
    // 打开首页立即检测，不沿用旧 IP 缓存，避免风控判断使用上一次线路的数据。
    load()
    intervalId = window.setInterval(() => {
      if (!document.hidden) load()
    }, AUTO_REFRESH_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  function stop() {
    disposed = true
    clearInterval(intervalId)
    intervalId = 0
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  return {
    data,
    loading,
    refreshing,
    error,
    lastSuccessAt,
    load,
    start,
    stop,
    constants: { autoRefreshMs: AUTO_REFRESH_MS }
  }
}
