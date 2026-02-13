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

  it('должен блокировать добавление сектора, если сумма превысит 100%', () => {
    const store = usePieChartStore()
    // 3 сектора по 20% = 60%
    
    const result = store.addSector({ 
        name: 'Новый', 
        percentage: 50, // 60 + 50 = 110%
        color: '#000' 
    })
    
    expect(result.success).toBe(false)
    expect(result.message).toContain('не может превышать 100%')
    expect(store.sectors.length).toBe(3) // Не добавился
  })
  
  it('должен блокировать редактирование, если новая сумма превысит 100%', () => {
    const store = usePieChartStore()
    // Сектора: 20%, 20%, 20% (сумма 60%)
    
    const sectorId = store.sectors[0].id // 20%
    
    const result = store.updateSector(sectorId, { percentage: 50 })
    // Новая сумма: 60 - 20 + 50 = 90% (ок)
    expect(result.success).toBe(true)
    
    const result2 = store.updateSector(sectorId, { percentage: 80 })
    // Новая сумма: 60 - 20 + 80 = 120% (ошибка)
    expect(result2.success).toBe(false)
    expect(result2.message).toContain('не может превышать 100%')
  })

  it('TC-PCS-07: должен блокировать добавление сектора, если сумма превысит 100%', () => {
    const store = usePieChartStore()
    
    // По умолчанию 3 сектора по 20% = 60%
    expect(store.totalPercentage).toBe(60)
    expect(store.sectors.length).toBe(3)
    
    // Пытаемся добавить сектор 50% (60+50=110%)
    const result = store.addSector({ 
        name: 'Новый', 
        percentage: 50, 
        color: '#000' 
    })
    
    // Проверяем, что добавление не удалось
    expect(result.success).toBe(false)
    expect(result.message).toContain('не может превышать 100%')
    
    // Проверяем, что сектор не добавился
    expect(store.sectors.length).toBe(3)
    expect(store.totalPercentage).toBe(60)
    
    // Добавляем сектор 40% (60+40=100%)
    const result2 = store.addSector({ 
        name: 'Успех', 
        percentage: 40, 
        color: '#00f' 
    })
    
    // Проверяем, что добавилось
    expect(result2.success).toBe(true)
    expect(store.sectors.length).toBe(4)
    expect(store.totalPercentage).toBe(100)
  })

  it('TC-PCS-11: должен блокировать редактирование, если новая сумма превысит 100%', () => {
    const store = usePieChartStore()
    
    // По умолчанию 3 сектора по 20% = 60%
    expect(store.totalPercentage).toBe(60)
    expect(store.sectors.length).toBe(3)
    
    const sectorId = store.sectors[0].id // первый сектор с 20%
    
    // Пытаемся увеличить до 50% (новая сумма: 60-20+50=90% - должно работать)
    const result1 = store.updateSector(sectorId, { percentage: 50 })
    expect(result1.success).toBe(true)
    expect(store.totalPercentage).toBe(90)
    
    // Пытаемся увеличить до 60% (новая сумма: 90-50+60=100% - должно работать)
    const result2 = store.updateSector(sectorId, { percentage: 60 })
    expect(result2.success).toBe(true)
    expect(store.totalPercentage).toBe(100)
    
    // Пытаемся увеличить до 61% (новая сумма: 100-60+61=101% - должно быть ошибкой)
    const result3 = store.updateSector(sectorId, { percentage: 61 })
    expect(result3.success).toBe(false)
    expect(result3.message).toContain('не может превышать 100%')
    
    // Проверяем, что значение не изменилось
    expect(store.sectors[0].percentage).toBe(60)
    expect(store.totalPercentage).toBe(100)
  })
})