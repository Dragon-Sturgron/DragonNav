<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  code: { type: String, default: '' },
  label: { type: String, default: '' },
  size: { type: String, default: 'normal' }
})

const failed = ref(false)
const normalizedCode = computed(() => {
  const value = String(props.code || '').trim().toLowerCase()
  return /^[a-z]{2}$/.test(value) ? value : ''
})

watch(normalizedCode, () => { failed.value = false })

const flagUrl = computed(() => normalizedCode.value
  ? `https://flagcdn.com/w80/${normalizedCode.value}.png`
  : '')

const altText = computed(() => props.label ? `${props.label}国旗` : (normalizedCode.value ? `${normalizedCode.value.toUpperCase()} 国旗` : '国家/地区'))
</script>

<template>
  <span class="country-flag" :class="`country-flag--${size}`">
    <img
      v-if="flagUrl && !failed"
      :src="flagUrl"
      :alt="altText"
      loading="eager"
      decoding="async"
      referrerpolicy="no-referrer"
      @error="failed = true"
    />
    <span v-else class="country-flag__fallback">🌐</span>
  </span>
</template>
