<template>
  <div class="d-flex flex-column h-100 gap-2">
    <div class="d-flex align-items-center gap-3">
      <small v-if="found" class="text-muted">
        <code>{{ found.path }}</code> · {{ found.items.length }} rows · {{ fields.length }} columns
      </small>
      <BButton size="sm" variant="primary" class="ms-auto" :disabled="!found" @click="copy">
        {{ copied ? 'Copied!' : 'Copy for Excel' }}
      </BButton>
    </div>
    <BAlert :model-value="!!error" variant="danger" class="m-0 py-2">{{ error }}</BAlert>
    <div v-if="found" class="flex-grow-1 min-h-0 overflow-auto border rounded">
      <FormTable :items="found.items" :fields="fields" striped />
    </div>
    <div v-else-if="!error" class="text-muted text-center mt-5">
      {{ 'empty' in parsed ? 'Nothing to show. Paste JSON in the Input view.' : 'No array found in the JSON.' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BButton, BAlert } from 'bootstrap-vue-next'
import { FormTable } from 'bootstrap-vue-jk'
import type { ParsedJson } from './FormattedJson.vue'

type Row = Record<string, unknown>

const props = defineProps<{ parsed: ParsedJson }>()

const copied = ref(false)

const error = computed(() => ('error' in props.parsed ? props.parsed.error : ''))

// Depth-first search for the first array in the document
const findArray = (v: unknown, path: string): { path: string; array: unknown[] } | null => {
  if (Array.isArray(v)) return { path, array: v }
  if (v && typeof v === 'object') {
    for (const [k, child] of Object.entries(v)) {
      const r = findArray(child, path ? `${path}.${k}` : k)
      if (r) return r
    }
  }
  return null
}

const found = computed(() => {
  if (!('value' in props.parsed)) return null
  const r = findArray(props.parsed.value, '')
  if (!r) return null
  const items: Row[] = r.array.map((x) => (x && typeof x === 'object' && !Array.isArray(x) ? (x as Row) : { value: x }))
  return { path: r.path || '(root)', items }
})

const fields = computed(() => {
  const keys = new Set<string>()
  found.value?.items.forEach((row) => Object.keys(row).forEach((k) => keys.add(k)))
  return [...keys].map((key) => ({ key, label: key, sortable: true }))
})

const cell = (v: unknown) => {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  return s.replace(/[\t\r\n]+/g, ' ')
}

const copy = async () => {
  if (!found.value) return
  const keys = fields.value.map((f) => f.key)
  const lines = [keys, ...found.value.items.map((row) => keys.map((k) => cell(row[k])))]
  await navigator.clipboard.writeText(lines.map((l) => l.join('\t')).join('\n'))
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<style lang="scss" scoped>
.min-h-0 {
  min-height: 0;
}
</style>
