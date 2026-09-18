<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  site: { type: Object, required: true },
  latency: { type: Object, default: null }
})
const emit = defineEmits(['visibility'])
const root = ref(null)
const imageFailed = ref(false)
let observer

const icon = computed(() => {
  if (props.site?.icon && /^https?:\/\//i.test(props.site.icon)) return props.site.icon
  try { return new URL('/favicon.ico', props.site.url).href } catch { return '' }
})

const initials = computed(() => String(props.site?.name || '?').replace(/\s+/g, '').slice(0, 2).toUpperCase())

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
    :href="site.url"
    target="_blank"
    rel="noopener noreferrer"
    :data-quality="latency?.quality || 'unknown'"
  >
    <div class="site-card__glow"></div>
    <div class="site-card__icon">
      <img v-if="icon && !imageFailed" :src="icon" alt="" loading="lazy" @error="imageFailed = true" />
      <span v-else>{{ initials }}</span>
    </div>
    <div class="site-card__name" :title="site.name">{{ site.name }}</div>
    <div class="site-card__desc" :title="site.desc || '点击打开'">{{ site.desc || '点击打开' }}</div>
    <div class="site-card__latency">
      <span class="latency-dot" :data-state="latency?.status || 'idle'"></span>
      <span>{{ latencyText }}</span>
      <span v-if="qualityLabel" class="latency-quality">{{ qualityLabel }}</span>
    </div>
  </a>
</template>
