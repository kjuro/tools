import { describe, it, expect } from 'vitest'

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
