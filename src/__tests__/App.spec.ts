import { describe, it, expect, vi } from 'vitest'

vi.mock('bootstrap-vue-jk', () => ({ FormTable: { template: '<table />' } }))

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders formatted JSON', async () => {
    const wrapper = mount(App)
    await wrapper.find('textarea').setValue('{"a":1}')
    expect(wrapper.text()).toContain('Valid JSON')
    await wrapper.findAll('a.nav-link')[1]!.trigger('click')
    expect(wrapper.find('pre').text()).toBe('{\n  "a": 1\n}')
  })
})

describe('Table view', () => {
  it('shows first array and copies tab separated', async () => {
    const writeText = vi.fn()
    Object.assign(navigator, { clipboard: { writeText } })
    const wrapper = mount(App)
    await wrapper.find('textarea').setValue('{"a":{"rows":[{"x":"1","y":null},{"x":"2","z":"q"}]}}')
    await wrapper.findAll('a.nav-link')[2]!.trigger('click')
    expect(wrapper.text()).toContain('2 rows')
    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Excel'))!
      .trigger('click')
    expect(writeText).toHaveBeenCalledWith('x\ty\tz\n1\t\t\n2\t\tq')
  })
})
