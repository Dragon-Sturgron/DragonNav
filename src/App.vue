<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import SearchBar from './components/SearchBar.vue'
import SiteCard from './components/SiteCard.vue'
import { useLatency } from './composables/useLatency'
import { useWeather, weatherInfo } from './composables/useWeather'

const DEFAULT_CONFIG = {
  version: 9,
  settings: {
    title: '龙鲟导航',
    subtitle: '搜索一下，或者直接打开常用网站',
    maxSites: 0,
    engineSelectedColor: '#52525b',
    engineUnselectedColor: '#ffffff',
    engineHoverColor: '#f1f2f4'
  },
  categories: [],
  sites: [],
  searchEngines: [
    { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q={q}', icon: 'https://www.bing.com/favicon.ico', enabled: true },
    { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={q}', icon: 'https://www.baidu.com/favicon.ico', enabled: true },
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={q}', icon: 'https://www.google.com/favicon.ico', enabled: true }
  ]
}

const config = reactive(structuredClone(DEFAULT_CONFIG))
const configError = ref('')
const configLoading = ref(true)
const filterText = ref('')
const now = ref(new Date())
const forecastOpen = ref(false)
const theme = ref(localStorage.getItem('nav-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
let clockTimer = 0

const latency = useLatency()
const weather = useWeather()

const title = computed(() => config.settings?.title || '龙鲟导航')
const subtitle = computed(() => config.settings?.subtitle || '搜索一下，或者直接打开常用网站')
const currentWeather = computed(() => weather.data.value ? weatherInfo(weather.data.value.code) : null)

const timeText = computed(() => now.value.toLocaleTimeString('zh-CN', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
}))
const dateText = computed(() => now.value.toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
}))

const grouped = computed(() => {
  const categories = (config.categories || []).filter(x => x.enabled !== false)
  let sites = (config.sites || []).filter(x => x.enabled !== false)
  const max = Number(config.settings?.maxSites || 0)
  if (max > 0) {
    const ordered = []
    for (const cat of categories) {
      for (const site of sites.filter(s => s.categoryId === cat.id)) ordered.push(site)
    }
    const allowed = new Set(ordered.slice(0, max).map(x => x.id))
    sites = sites.filter(x => allowed.has(x.id))
  }

  const key = filterText.value.trim().toLowerCase()
  if (key) {
    sites = sites.filter(site => {
      const cat = categories.find(c => c.id === site.categoryId)
      return `${site.name} ${site.desc || ''} ${cat?.name || ''}`.toLowerCase().includes(key)
    })
  }

  return categories
    .map(cat => ({ ...cat, sites: sites.filter(site => site.categoryId === cat.id) }))
    .filter(cat => cat.sites.length)
})

const allVisibleSites = computed(() => grouped.value.flatMap(cat => cat.sites))

watch(allVisibleSites, list => {
  latency.setSites(list)
}, { immediate: true })

watch(theme, value => {
  document.documentElement.dataset.theme = value
  localStorage.setItem('nav-theme', value)
})

watch(() => config.settings, settings => {
  document.documentElement.style.setProperty('--engine-selected', settings?.engineSelectedColor || '#52525b')
  document.documentElement.style.setProperty('--engine-unselected', settings?.engineUnselectedColor || '#ffffff')
  document.documentElement.style.setProperty('--engine-hover', settings?.engineHoverColor || '#f1f2f4')
}, { deep: true, immediate: true })

function applyConfig(next) {
  if (!next || typeof next !== 'object') return
  Object.assign(config, structuredClone(next))
  document.title = config.settings?.title || '龙鲟导航'
}

async function loadConfig() {
  configLoading.value = true
  configError.value = ''
  try {
    const response = await fetch('/api/config', { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok || !data?.config) throw new Error(data?.error || `HTTP ${response.status}`)
    applyConfig(data.config)
  } catch (error) {
    configError.value = '暂时无法读取 KV 配置，请检查 EdgeOne Functions 与 NAV_KV。'
    console.warn(error)
  } finally {
    configLoading.value = false
    await nextTick()
  }
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

function forecastDateLabel(date, index) {
  const [year, month, day] = String(date || '').split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return {
    week: index === 0 ? '今天' : index === 1 ? '明天' : week,
    date: `${month}月${day}日`
  }
}

function handleShortcut(event) {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    event.preventDefault()
    document.querySelector('.search-bar input')?.focus()
  }
  if (event.key === 'Escape') forecastOpen.value = false
}

onMounted(() => {
  clockTimer = window.setInterval(() => { now.value = new Date() }, 1000)
  document.addEventListener('keydown', handleShortcut)
  loadConfig()
  weather.load()
  latency.start()
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  document.removeEventListener('keydown', handleShortcut)
  latency.stop()
})
</script>

<template>
  <main class="shell">
    <header class="topbar">
      <div class="brand-wrap">
        <div class="brand-mark">D</div>
        <div>
          <div class="brand-title">{{ title }}</div>
          <div class="brand-subtitle">{{ subtitle }}</div>
        </div>
      </div>

      <div class="top-actions">
        <button class="weather-card" type="button" @click="forecastOpen = true">
          <div class="weather-icon">{{ currentWeather?.icon || (weather.loading.value ? '…' : '⌖') }}</div>
          <div class="weather-body">
            <div class="weather-location">{{ weather.data.value?.location || '当前位置' }}</div>
            <div class="weather-line" v-if="weather.data.value">
              <strong>{{ Math.round(weather.data.value.temp) }}°</strong>
              <span>{{ currentWeather?.text }}</span>
              <span>· {{ Math.round(weather.data.value.max) }}°/{{ Math.round(weather.data.value.min) }}°</span>
            </div>
            <div class="weather-line" v-else>{{ weather.error.value || '正在获取天气…' }}</div>
          </div>
          <span class="weather-arrow">›</span>
        </button>

        <button class="round-btn" type="button" :title="theme === 'dark' ? '切换浅色模式' : '切换深色模式'" @click="toggleTheme">
          {{ theme === 'dark' ? '☀' : '◐' }}
        </button>
      </div>
    </header>

    <section class="hero">
      <div class="clock-card">
        <div class="clock-time">{{ timeText }}</div>
        <div class="clock-date">{{ dateText }}</div>
      </div>

      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>

      <SearchBar :engines="config.searchEngines || []" />

      <div class="hero-meta">
        <span class="meta-pill"><i class="live-dot"></i> 每 5 秒刷新网站访问延迟</span>
        <span class="meta-pill">当前浏览器线路 · 最多 4 并发</span>
        <span v-if="latency.summary.value.median" class="meta-pill">当前中位延迟 {{ latency.summary.value.median }} ms</span>
      </div>

      <div v-if="configError" class="warning">{{ configError }}</div>
    </section>

    <section class="nav-section">
      <div class="section-toolbar">
        <div>
          <div class="eyebrow">DRAGONNAV</div>
          <h2>网站导航</h2>
          <p>延迟由当前访问者浏览器发起，反映当前公网 IP / VPN / 代理线路的实际网站访问响应。</p>
        </div>
        <label class="filter-box">
          <span>⌕</span>
          <input v-model="filterText" placeholder="筛选网站或分类" />
        </label>
      </div>

      <div v-if="configLoading" class="empty-panel">正在加载导航配置…</div>
      <template v-else-if="grouped.length">
        <section v-for="category in grouped" :key="category.id" class="category-block">
          <div class="category-head">
            <div class="category-title"><span class="category-dot"></span>{{ category.name }}</div>
            <span class="category-count">{{ category.sites.length }}</span>
          </div>
          <div class="site-grid">
            <SiteCard
              v-for="site in category.sites"
              :key="site.id"
              :site="site"
              :latency="latency.states[site.id]"
              @visibility="latency.markVisible"
            />
          </div>
        </section>
      </template>
      <div v-else class="empty-panel">没有找到匹配的网站。</div>
    </section>

    <footer>
      <span>© {{ new Date().getFullYear() }} {{ title }}</span>
      <span>Vue 3 · Vite · Tencent EdgeOne Makers</span>
    </footer>

    <div v-if="forecastOpen" class="modal-backdrop" @click.self="forecastOpen = false">
      <section class="forecast-modal">
        <header class="forecast-head">
          <div>
            <div class="eyebrow">WEATHER</div>
            <h3>未来 7 天天气</h3>
            <p>{{ weather.data.value?.location || '当前位置' }}</p>
          </div>
          <div class="forecast-actions">
            <button class="soft-btn" type="button" @click="weather.load(true)">重新定位</button>
            <button class="round-btn" type="button" @click="forecastOpen = false">×</button>
          </div>
        </header>
        <div class="forecast-grid">
          <article v-for="(day, index) in weather.data.value?.forecast || []" :key="day.date" class="forecast-day" :class="{ today: index === 0 }">
            <strong>{{ forecastDateLabel(day.date, index).week }}</strong>
            <span class="forecast-date">{{ forecastDateLabel(day.date, index).date }}</span>
            <span class="forecast-icon">{{ weatherInfo(day.code).icon }}</span>
            <span>{{ weatherInfo(day.code).text }}</span>
            <b>{{ Math.round(day.max) }}° <small>/ {{ Math.round(day.min) }}°</small></b>
            <span class="forecast-rain">降雨 {{ Number.isFinite(day.rain) ? Math.round(day.rain) : 0 }}%</span>
          </article>
          <div v-if="!weather.data.value?.forecast?.length" class="empty-panel">{{ weather.error.value || '正在获取天气…' }}</div>
        </div>
        <div class="forecast-source">天气数据：Open-Meteo · 地址数据：© OpenStreetMap contributors</div>
      </section>
    </div>
  </main>
</template>
