<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  engines: { type: Array, default: () => [] }
})

const query = ref('')
const open = ref(false)
const selectedId = ref(localStorage.getItem('nav-engine') || '')
const root = ref(null)

const activeEngines = computed(() => props.engines.filter(x => x?.enabled !== false && x?.url))
const selected = computed(() => activeEngines.value.find(x => x.id === selectedId.value) || activeEngines.value[0] || null)

watch(activeEngines, list => {
  if (!list.length) return
  if (!list.some(x => x.id === selectedId.value)) selectedId.value = list[0].id
}, { immediate: true })

watch(selectedId, value => {
  if (value) localStorage.setItem('nav-engine', value)
})

function engineIcon(item) {
  if (item?.icon && /^https?:\/\//i.test(item.icon)) return item.icon
  try { return new URL('/favicon.ico', item?.url || '').href } catch { return '' }
}

function selectEngine(id) {
  selectedId.value = id
  open.value = false
}

function buildSearchUrl(item, text) {
  const encoded = encodeURIComponent(text)
  const template = String(item?.url || '')
  return template.includes('{q}') ? template.split('{q}').join(encoded) : template + encoded
}

function submit() {
  const text = query.value.trim()
  if (!text) return
  const looksLikeUrl = /^(https?:\/\/)/i.test(text) || /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(text) || /^localhost(:\d+)?/i.test(text)
  const url = looksLikeUrl
    ? (/^https?:\/\//i.test(text) ? text : 'https://' + text)
    : buildSearchUrl(selected.value, text)
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

function clickOutside(event) {
  if (!root.value?.contains(event.target)) open.value = false
}

onMounted(() => document.addEventListener('click', clickOutside))
onBeforeUnmount(() => document.removeEventListener('click', clickOutside))
</script>

<template>
  <form class="search-bar" @submit.prevent="submit">
    <div ref="root" class="engine-picker">
      <button class="engine-trigger" type="button" :aria-expanded="open" @click.stop="open = !open">
        <span class="engine-logo">
          <img v-if="selected && engineIcon(selected)" :src="engineIcon(selected)" alt="" />
          <span v-else>{{ selected?.name?.slice(0, 1) || '?' }}</span>
        </span>
        <span class="engine-name">{{ selected?.name || '搜索' }}</span>
        <span class="engine-caret">⌄</span>
      </button>
      <div v-if="open" class="engine-menu">
        <button
          v-for="engine in activeEngines"
          :key="engine.id"
          class="engine-option"
          :class="{ active: engine.id === selected?.id }"
          type="button"
          @click="selectEngine(engine.id)"
        >
          <span class="engine-option__icon">
            <img v-if="engineIcon(engine)" :src="engineIcon(engine)" alt="" />
            <span v-else>{{ engine.name?.slice(0, 1) }}</span>
          </span>
          <span>{{ engine.name }}</span>
          <span class="engine-check">{{ engine.id === selected?.id ? '✓' : '' }}</span>
        </button>
      </div>
    </div>

    <span class="search-divider"></span>
    <input v-model="query" autocomplete="off" placeholder="搜索内容，或输入网址直接打开…" />
    <button class="search-submit" type="submit">搜索</button>
  </form>
</template>
