import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CircularProgressBar from '../CircularProgressBar.vue'

describe('CircularProgressBar - Визуальные тесты', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Dashboard 270° должен иметь пустую область снизу', () => {
    const wrapper = mount(CircularProgressBar, {
      props: {
        type: 'dashboard',
        modelValue: 50
      }
    })
    
    // Находим progress circle (второй circle)
    const circles = wrapper.findAll('circle')
    const progressCircle = circles[1] // Второй circle - прогресс
    
    expect(progressCircle.exists()).toBe(true)
    
    const transform = progressCircle.attributes('transform')
    expect(transform).toBeDefined()
    
    // Проверяем, что поворот содержит -225 (для пустой области снизу)
    expect(transform).toContain('rotate(-225')
  })
})