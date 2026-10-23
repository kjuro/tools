<script setup lang="ts">
import { computed, ref } from 'vue'
import { BNavbar, BNavbarBrand, BNavbarNav, BNavItem, BFormTextarea, BButton, BFormSelect, BFormCheckbox, BAlert, BBadge } from 'bootstrap-vue-next'

const view = ref<'input' | 'formatted'>('input')
const input = ref('')
const indent = ref<number | string>(2)
const sortKeys = ref(false)
const copied = ref(false)

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

const parsed = computed(() => {
  if (!input.value.trim()) return { empty: true as const }
  try {
    return { value: JSON.parse(input.value) as unknown }
  } catch (e) {
    return { error: (e as Error).message }
  }
})

const formatted = computed(() => {
  const p = parsed.value
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

const applyToInput = (text: string) => {
  input.value = text
}
const minify = () => {
  const p = parsed.value
  if ('value' in p) applyToInput(JSON.stringify(p.value))
}
const prettify = () => applyToInput(formatted.value)
const clear = () => {
  input.value = ''
  view.value = 'input'
}
const copy = async () => {
  await navigator.clipboard.writeText(formatted.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
const sample = () => {
  input.value = '{"name":"JSON tools","version":1.0,"tags":["vue","bootstrap"],"active":true,"author":null,"nested":{"a":[1,2,{"b":"c"}]}}'
}
</script>

<template>
  <div class="app d-flex flex-column h-100">
    <BNavbar class="app-header px-4 py-2" variant="dark" container="fluid">
      <BNavbarBrand href="#" class="d-flex align-items-center gap-2" @click.prevent="view = 'input'">
        <span class="logo">{ }</span>JSON Tools
      </BNavbarBrand>
      <BNavbarNav class="flex-row gap-3 me-auto">
        <BNavItem href="#" :active="view === 'input'" @click.prevent="view = 'input'">Input</BNavItem>
        <BNavItem href="#" :active="view === 'formatted'" @click.prevent="view = 'formatted'">Formatted</BNavItem>
      </BNavbarNav>
      <BBadge v-if="'value' in parsed" variant="success">Valid JSON</BBadge>
      <BBadge v-else-if="'error' in parsed" variant="danger">Invalid JSON</BBadge>
    </BNavbar>

    <main class="flex-grow-1 min-h-0 p-3">
      <template v-if="view === 'input'">
        <div class="d-flex flex-column h-100 gap-2">
          <div class="d-flex gap-2">
            <BButton size="sm" variant="outline-secondary" @click="sample">Sample</BButton>
            <BButton size="sm" variant="outline-secondary" :disabled="!('value' in parsed)" @click="prettify">Prettify</BButton>
            <BButton size="sm" variant="outline-secondary" :disabled="!('value' in parsed)" @click="minify">Minify</BButton>
            <BButton size="sm" variant="outline-danger" class="ms-auto" :disabled="!input" @click="clear">Clear</BButton>
          </div>
          <BFormTextarea v-model="input" class="flex-grow-1 font-monospace editor" placeholder="Paste JSON here…" spellcheck="false" no-resize />
          <BAlert :model-value="'error' in parsed" variant="danger" class="m-0 py-2">{{ 'error' in parsed ? parsed.error : '' }}</BAlert>
        </div>
      </template>

      <template v-else>
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
          <BAlert :model-value="'error' in parsed" variant="danger" class="m-0 py-2">{{ 'error' in parsed ? parsed.error : '' }}</BAlert>
          <pre v-if="formatted" class="output flex-grow-1 m-0 p-3 rounded border overflow-auto" v-html="highlighted"></pre>
          <div v-else-if="!('error' in parsed)" class="text-muted text-center mt-5">Nothing to show. Paste JSON in the Input tab.</div>
        </div>
      </template>
    </main>
  </div>
</template>

<style lang="scss">
@import '@/assets/main.scss';

.app-header {
  background: linear-gradient(135deg, $primary, #004d38);
  .logo {
    font: 700 1.5rem monospace;
  }
}
.min-h-0 {
  min-height: 0;
}
.tab-content > .tab-pane {
  overflow: hidden;
}
.editor {
  resize: none;
  font-size: 0.9rem;
}
.output {
  background: #1e2a2f;
  color: #d6e2e6;
  font-size: 0.9rem;
  .j-key {
    color: #7fdbca;
  }
  .j-str {
    color: #ecc48d;
  }
  .j-num {
    color: #f78c6c;
  }
  .j-bool {
    color: #c792ea;
  }
  .j-null {
    color: #8a9aa0;
  }
}
</style>
