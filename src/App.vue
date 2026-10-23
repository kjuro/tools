<template>
  <div class="app d-flex flex-column h-100">
    <BNavbar class="app-header px-4 py-2" variant="dark" container="fluid">
      <BNavbarBrand href="#" class="d-flex align-items-center gap-2" @click.prevent="view = 'input'">
        <span class="logo">{}</span>JSON Tools
      </BNavbarBrand>
      <BNavbarNav class="flex-row gap-3 me-auto">
        <BNavItem href="#" :active="view === 'input'" @click.prevent="view = 'input'">Input</BNavItem>
        <BNavItem href="#" :active="view === 'formatted'" @click.prevent="view = 'formatted'">Formatted</BNavItem>
        <BNavItem href="#" :active="view === 'table'" @click.prevent="view = 'table'">Table</BNavItem>
      </BNavbarNav>
      <BBadge v-if="'value' in parsed" variant="success">Valid JSON</BBadge>
      <BBadge v-else-if="'error' in parsed" variant="danger">Invalid JSON</BBadge>
    </BNavbar>

    <main class="flex-grow-1 min-h-0 p-3">
      <template v-if="view === 'input'">
        <div class="d-flex flex-column h-100 gap-2">
          <div class="d-flex gap-2">
            <BButton size="sm" variant="outline-secondary" @click="sample">Sample</BButton>
            <BButton size="sm" variant="outline-secondary" :disabled="!('value' in parsed)" @click="prettify">Prettify
            </BButton>
            <BButton size="sm" variant="outline-secondary" :disabled="!('value' in parsed)" @click="minify">Minify
            </BButton>
            <BButton size="sm" variant="outline-danger" class="ms-auto" :disabled="!input" @click="clear">Clear
            </BButton>
          </div>
          <BFormTextarea v-model="input" class="flex-grow-1 font-monospace editor" placeholder="Paste JSON here…"
            spellcheck="false" no-resize />
          <BAlert :model-value="'error' in parsed" variant="danger" class="m-0 py-2">{{ 'error' in parsed ? parsed.error
            : '' }}</BAlert>
        </div>
      </template>

      <FormattedJson v-else-if="view === 'formatted'" :parsed="parsed" />
      <ArrayTable v-else :parsed="parsed" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ArrayTable from '@/components/ArrayTable.vue'
import FormattedJson, { type ParsedJson } from '@/components/FormattedJson.vue'
import { BNavbar, BNavbarBrand, BNavbarNav, BNavItem, BFormTextarea, BButton, BAlert, BBadge } from 'bootstrap-vue-next'

const view = ref<'input' | 'formatted' | 'table'>('input')
const input = ref('')
const parsed = computed<ParsedJson>(() => {
  if (!input.value.trim()) return { empty: true as const }
  try {
    return { value: JSON.parse(input.value) as unknown }
  } catch (e) {
    return { error: (e as Error).message }
  }
})

const applyToInput = (text: string) => {
  input.value = text
}
const minify = () => {
  const p = parsed.value
  if ('value' in p) applyToInput(JSON.stringify(p.value))
}
const prettify = () => {
  const p = parsed.value
  if ('value' in p) applyToInput(JSON.stringify(p.value, null, 2))
}
const clear = () => {
  input.value = ''
  view.value = 'input'
}
const sample = () => {
  input.value = '{"name":"JSON tools","version":1.0,"tags":["vue","bootstrap"],"active":true,"author":null,"nested":{"a":[1,2,{"b":"c"}]}}'
}
</script>

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

.editor {
  resize: none;
  font-size: 0.9rem;
}
</style>
