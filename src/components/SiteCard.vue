<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  site: { type: Object, required: true },
  latency: { type: Object, default: null },
  access: { type: Object, default: () => ({ allowed: true }) },
  clientIp: { type: String, default: '' }
})
const emit = defineEmits(['visibility', 'blocked'])
const root = ref(null)
const imageFailed = ref(false)
let observer

const icon = computed(() => {
  if (props.site?.icon && /^https?:\/\//i.test(props.site.icon)) return props.site.icon
  try { return new URL('/favicon.ico', props.site.url).href } catch { return '' }
})

const initials = computed(() => String(props.site?.name || '?').replace(/\s+/g, '').slice(0, 2).toUpperCase())
const blocked = computed(() => props.access?.allowed === false)

const latencyText = computed(() => {
  const state = props.latency
  if (!state || state.status === 'idle') return '等待检测'
  if (state.status === 'testing') return '检测中…'
  if (state.status === 'timeout') return '访问超时'
  if (state.status === 'error') return '暂不可测'
  return Number.isFinite(state.value) ? `${state.value} ms` : '暂不可测'
})

const qualityLabel = computed(() => {
  const q = props.latency?.quality
  if (q === 'excellent') return '很快'
  if (q === 'good') return '良好'
  if (q === 'fair') return '一般'
  if (q === 'slow') return '较慢'
  return ''
})

const latencyTitle = computed(() => {
  const ip = props.latency?.testedIp || props.clientIp
  return ip
    ? `当前 IP ${ip} 由浏览器直接访问目标域名进行测试；显示 HTTP/HTTPS 响应耗时，不是 ICMP Ping。`
    : '由当前浏览器直接访问目标域名进行测试；显示 HTTP/HTTPS 响应耗时，不是 ICMP Ping。'
})

function handleClick(event) {
  if (!blocked.value) return
  event.preventDefault()
  event.stopPropagation()
  emit('blocked', props.access?.label || '当前 IP 不满足访问条件')
}

onMounted(() => {
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) emit('visibility', props.site.id, entry.isIntersecting)
  }, { rootMargin: '220px 0px' })
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => {
  emit('visibility', props.site.id, false)
  observer?.disconnect()
})
</script>

<template>
  <a
    ref="root"
    class="site-card"
    :class="{ 'site-card--blocked': blocked, 'site-card--checking-access': access?.pending }"
    :href="blocked ? undefined : site.url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-disabled="blocked ? 'true' : 'false'"
    :data-quality="latency?.quality || 'unknown'"
    @click="handleClick"
  >
    <div class="site-card__glow"></div>
    <div v-if="blocked" class="site-card__access" :data-state="access?.pending ? 'pending' : 'blocked'">
      <span>{{ access?.pending ? '◌' : '🔒' }}</span>
      <span>{{ access?.label || '当前 IP 不满足访问条件' }}</span>
    </div>
    <div class="site-card__icon">
      <img v-if="icon && !imageFailed" :src="icon" alt="" loading="lazy" @error="imageFailed = true" />
      <span v-else>{{ initials }}</span>
    </div>
    <div class="site-card__name" :title="site.name">{{ site.name }}</div>
    <div class="site-card__desc" :title="site.desc || '点击打开'">{{ site.desc || '点击打开' }}</div>
    <div class="site-card__latency" :title="latencyTitle">
      <span class="latency-dot" :data-state="latency?.status || 'idle'"></span>
      <span>{{ latencyText }}</span>
      <span v-if="qualityLabel" class="latency-quality">{{ qualityLabel }}</span>
    </div>
  </a>
</template>
