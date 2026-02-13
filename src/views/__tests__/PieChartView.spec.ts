import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PieChartView from '../PieChartView.vue'

describe('PieChartView - ColorPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.restoreAllMocks()
  })

  it('TC-PCV-15: ColorPicker должен содержать 20 цветов (включая повторы)', () => {
    const wrapper = mount(PieChartView)
    const colorPresets = wrapper.vm.colorPresets
    expect(colorPresets.length).toBe(20)
    colorPresets.forEach((color: string) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('TC-PCV-16: При добавлении выбирается следующий цвет по кругу', async () => {
    const wrapper = mount(PieChartView)
    
    await wrapper.vm.openAddModal()
    const color1 = wrapper.vm.currentSector.color
    
    await wrapper.vm.closeModal()
    await wrapper.vm.openAddModal()
    const color2 = wrapper.vm.currentSector.color
    
    await wrapper.vm.closeModal()
    await wrapper.vm.openAddModal()
    const color3 = wrapper.vm.currentSector.color
    
    expect(color1).not.toBe(color2)
    expect(color2).not.toBe(color3)
  })

  describe('PieChartView - Валидация', () => {
    beforeEach(() => {
      setActivePinia(createPinia())
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.clearAllTimers()
      vi.restoreAllMocks()
    })

    it('TC-PCV-08a: При открытии пустой формы появляется ошибка', async () => {
      const wrapper = mount(PieChartView)
      
      await wrapper.vm.openAddModal()
      vi.advanceTimersByTime(100)
      
      expect(wrapper.vm.nameError).toBe('Название сектора не может быть пустым')
    })
  })
})