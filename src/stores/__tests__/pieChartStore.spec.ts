import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePieChartStore } from '../pieChartStore'

describe('PieChart Store - Регрессионные тесты', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-PCV-20: Один сектор 100% должен иметь угол ~360°', () => {
    const store = usePieChartStore()
    
    // Удаляем все сектора
    store.sectors.forEach(s => store.deleteSector(s.id))
    
    // Добавляем один сектор со 100%
    const result = store.addSector({ 
      name: 'Тест', 
      percentage: 100, 
      color: '#FF6384' 
    })
    
    // Проверяем успешность добавления
    expect(result.success).toBe(true)
    
    // Проверяем, что сектор есть
    expect(store.sectors.length).toBe(1)
    expect(store.sectors[0].percentage).toBe(100)
    
    // ✅ Проверяем угол (должен быть ~360°)
    const sectorWithAngle = store.sectorsWithAngles[0]
    expect(sectorWithAngle.angle).toBeCloseTo(360, 1)
    
    // Проверяем, что угол не 0 и не NaN
    expect(sectorWithAngle.angle).toBeGreaterThan(350)
    expect(Number.isNaN(sectorWithAngle.angle)).toBe(false)
  })

  it('TC-PCV-21: Редактирование сектора с 99% до 100% должно сохранить угол ~360°', () => {
    const store = usePieChartStore()
    
    // Удаляем все сектора
    store.sectors.forEach(s => store.deleteSector(s.id))
    
    // Добавляем один сектор с 99%
    const addResult = store.addSector({ 
        name: 'Тест', 
        percentage: 99, 
        color: '#FF6384' 
    })
    expect(addResult.success).toBe(true)
    
    const sectorId = store.sectors[0].id
    
    // Проверяем угол до редактирования
    const beforeAngle = store.sectorsWithAngles[0].angle
    expect(beforeAngle).toBeCloseTo(356.4, 1) // 99% от 360° = 356.4°
    
    // Обновляем до 100%
    const updateResult = store.updateSector(sectorId, { percentage: 100 })
    expect(updateResult.success).toBe(true)
    
    // проверяем, что процент около 100 (из-за 359.99°)
    expect(store.sectors[0].percentage).toBeCloseTo(100, 2)
    
    // Проверяем угол после редактирования (~360°)
    const afterAngle = store.sectorsWithAngles[0].angle
    expect(afterAngle).toBeCloseTo(360, 1)
    
    // Убеждаемся, что угол изменился (увеличился)
    expect(afterAngle).toBeGreaterThan(beforeAngle)
  })

  it('TC-PCV-22: Удаление всех секторов должно дать пустой список', () => {
    const store = usePieChartStore()
    
    // Запоминаем начальное количество (3 сектора по умолчанию)
    const initialCount = store.sectors.length
    expect(initialCount).toBe(3)
    
    // Удаляем все сектора
    store.sectors.forEach(s => store.deleteSector(s.id))
    
    // Проверяем, что список пуст
    expect(store.sectors.length).toBe(0)
    
    // Проверяем, что sectorsWithAngles тоже пуст
    expect(store.sectorsWithAngles.length).toBe(0)
    
    // Проверяем, что totalPercentage = 0
    expect(store.totalPercentage).toBe(0)
    
    // Проверяем, что remainingPercentage = 100
    expect(store.remainingPercentage).toBe(100)
  })

  it('TC-PCV-23: Добавление сектора после удаления всех должно работать', () => {
    const store = usePieChartStore()
    
    // Удаляем все сектора
    store.sectors.forEach(s => store.deleteSector(s.id))
    expect(store.sectors.length).toBe(0)
    
    // Добавляем новый сектор 50%
    const addResult = store.addSector({ 
        name: 'Новый после удаления', 
        percentage: 50, 
        color: '#36A2EB' 
    })
    
    // Проверяем успешность добавления
    expect(addResult.success).toBe(true)
    
    // Проверяем, что сектор появился
    expect(store.sectors.length).toBe(1)
    expect(store.sectors[0].name).toBe('Новый после удаления')
    expect(store.sectors[0].percentage).toBe(50)
    expect(store.sectors[0].color).toBe('#36A2EB')
    
    // Проверяем ID (должен быть 1, так как массив был пуст)
    expect(store.sectors[0].id).toBe(1)
    
    // Проверяем углы
    const angle = store.sectorsWithAngles[0].angle
    expect(angle).toBeCloseTo(180, 1) // 50% от 360° = 180°
    
    // Проверяем сумму процентов
    expect(store.totalPercentage).toBe(50)
    expect(store.remainingPercentage).toBe(50)
  })

  it('TC-PCV-24: Редактирование сектора с теми же значениями не должно ничего ломать', () => {
    const store = usePieChartStore()
    
    // Удаляем все сектора
    store.sectors.forEach(s => store.deleteSector(s.id))
    
    // Добавляем один сектор 75%
    store.addSector({ 
        name: 'Тестовый', 
        percentage: 75, 
        color: '#FF6384' 
    })
    
    const sectorId = store.sectors[0].id
    const originalAngle = store.sectorsWithAngles[0].angle
    
    // Редактируем с теми же значениями
    const updateResult = store.updateSector(sectorId, {
        name: 'Тестовый',
        percentage: 75,
        color: '#FF6384'
    })
    
    // Проверяем успешность
    expect(updateResult.success).toBe(true)
    
    // Проверяем, что данные не изменились
    expect(store.sectors[0].name).toBe('Тестовый')
    expect(store.sectors[0].percentage).toBe(75)
    expect(store.sectors[0].color).toBe('#FF6384')
    
    // Проверяем, что угол не изменился
    const newAngle = store.sectorsWithAngles[0].angle
    expect(newAngle).toBe(originalAngle)
    expect(newAngle).toBeCloseTo(270, 1) // 75% от 360° = 270°
    
    // Проверяем сумму
    expect(store.totalPercentage).toBe(75)
    expect(store.remainingPercentage).toBe(25)
  })
})