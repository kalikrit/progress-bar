import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PieChartView from '../PieChartView.vue'

describe('PieChartView - ColorPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-PCV-15: ColorPicker должен содержать 20 цветов (включая повторы)', () => {
    const wrapper = mount(PieChartView)
    
    // Получаем доступ к внутренним данным компонента
    const colorPresets = wrapper.vm.colorPresets
    
    // Проверяем количество (сейчас 20)
    expect(colorPresets.length).toBe(20)
    
    // Проверяем, что все цвета в формате HEX
    colorPresets.forEach((color: string) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('TC-PCV-16: При добавлении выбирается следующий цвет по кругу', async () => {
    const wrapper = mount(PieChartView)
    
    // Открываем форму добавления 3 раза
    await wrapper.vm.openAddModal()
    const color1 = wrapper.vm.currentSector.color
    
    await wrapper.vm.closeModal()
    await wrapper.vm.openAddModal()
    const color2 = wrapper.vm.currentSector.color
    
    await wrapper.vm.closeModal()
    await wrapper.vm.openAddModal()
    const color3 = wrapper.vm.currentSector.color
    
    // Цвета должны быть разными (или циклически повторяться)
    expect(color1).not.toBe(color2)
    expect(color2).not.toBe(color3)
  })
})