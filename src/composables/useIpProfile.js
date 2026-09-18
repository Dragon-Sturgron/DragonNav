import { ref } from 'vue'

const CACHE_KEY = 'dragonnav-ip-profile-v1'
const CACHE_MS = 10 * 60 * 1000

function getCache() {
  try { return JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null') } catch { return null }
}

function setCache(value) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), value })) } catch {}
}

export function useIpProfile() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function load(force = false) {
    const cached = getCache()
    if (!force && cached?.value && Date.now() - cached.ts < CACHE_MS) {
      data.value = cached.value
      return cached.value
    }

    loading.value = true
    error.value = ''
    try {
      const response = await fetch('/api/ip-profile', { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok || !body?.ip) throw new Error(body?.error || `HTTP ${response.status}`)
      data.value = body
      setCache(body)
      return body
    } catch (err) {
      error.value = err?.message || 'IP 信息获取失败'
      return data.value
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
}
