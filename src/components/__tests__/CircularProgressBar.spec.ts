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

  it('TC-CPB-16: При 0% цвет должен быть красным (rgb(255, 0, 0))', () => {
    const wrapper = mount(CircularProgressBar, {
        props: {
        modelValue: 0,
        status: 'inProgress'
        }
    })
    
    // Находим progress circle (второй circle)
    const circles = wrapper.findAll('circle')
    const progressCircle = circles[1]
    
    expect(progressCircle.exists()).toBe(true)
    
    const stroke = progressCircle.attributes('stroke')
    expect(stroke).toBe('rgb(255, 0, 0)')
  })
  
  it('TC-CPB-17: При 50% цвет должен быть жёлтым (rgb(255, 255, 0))', () => {
    const wrapper = mount(CircularProgressBar, {
        props: {
        modelValue: 50,
        status: 'inProgress'
        }
    })
    
    const circles = wrapper.findAll('circle')
    const progressCircle = circles[1]
    
    expect(progressCircle.exists()).toBe(true)
    
    const stroke = progressCircle.attributes('stroke')
    expect(stroke).toBe('rgb(255, 255, 0)')
  })

  it('TC-CPB-18: При 100% цвет должен быть зелёным (rgb(0, 255, 0))', () => {
    const wrapper = mount(CircularProgressBar, {
        props: {
        modelValue: 100,
        status: 'inProgress'
        }
    })
    
    const circles = wrapper.findAll('circle')
    const progressCircle = circles[1]
    
    expect(progressCircle.exists()).toBe(true)
    
    const stroke = progressCircle.attributes('stroke')
    expect(stroke).toBe('rgb(0, 255, 0)')
  })  
})