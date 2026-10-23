<template>
  <div class="d-flex flex-column h-100 gap-2">
    <div class="d-flex align-items-center gap-3 flex-wrap">
      <BFormSelect
        v-model="indent"
        size="sm"
        class="w-auto"
        :options="[
          { value: 2, text: '2 spaces' },
          { value: 4, text: '4 spaces' },
          { value: 'tab', text: 'Tab' }
        ]"
      />
      <BFormCheckbox v-model="sortKeys" switch>Sort keys</BFormCheckbox>
      <small class="text-muted">{{ stats.lines }} lines · {{ stats.chars }} chars</small>
      <BButton size="sm" variant="primary" class="ms-auto" :disabled="!formatted" @click="copy">{{ copied ? 'Copied!' : 'Copy' }}</BButton>
    </div>
    <BAlert :model-value="!!error" variant="danger" class="m-0 py-2">{{ error }}</BAlert>
    <pre v-if="formatted" class="output flex-grow-1 m-0 p-3 rounded border overflow-auto" v-html="highlighted"></pre>
    <div v-else-if="!error" class="text-muted text-center mt-5">Nothing to show. Paste JSON in the Input view.</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BButton, BFormSelect, BFormCheckbox, BAlert } from 'bootstrap-vue-next'

export type ParsedJson = { empty: true } | { value: unknown } | { error: string }

const props = defineProps<{ parsed: ParsedJson }>()

const indent = ref<number | string>(2)
const sortKeys = ref(false)
const copied = ref(false)

const error = computed(() => ('error' in props.parsed ? props.parsed.error : ''))

const sortDeep = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(sortDeep)
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, val]) => [k, sortDeep(val)])
    )
  }
  return v
}

const formatted = computed(() => {
  const p = props.parsed
  if (!('value' in p)) return ''
  const v = sortKeys.value ? sortDeep(p.value) : p.value
  return JSON.stringify(v, null, indent.value === 'tab' ? '\t' : Number(indent.value))
})

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const highlighted = computed(() =>
  escapeHtml(formatted.value).replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (m, str, colon, bool) => {
      if (str) return colon ? `<span class="j-key">${str}</span>${colon}` : `<span class="j-str">${str}</span>`
      if (bool) return `<span class="j-bool">${m}</span>`
      if (m === 'null') return `<span class="j-null">${m}</span>`
      return `<span class="j-num">${m}</span>`
    }
  )
)

const stats = computed(() => ({
  lines: formatted.value ? formatted.value.split('\n').length : 0,
  chars: formatted.value.length
}))

const copy = async () => {
  await navigator.clipboard.writeText(formatted.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<style lang="scss" scoped>
.output {
  background: #1e2a2f;
  color: #d6e2e6;
  font-size: 0.9rem;
  :deep(.j-key) {
    color: #7fdbca;
  }
  :deep(.j-str) {
    color: #ecc48d;
  }
  :deep(.j-num) {
    color: #f78c6c;
  }
  :deep(.j-bool) {
    color: #c792ea;
  }
  :deep(.j-null) {
    color: #8a9aa0;
  }
}
</style>
