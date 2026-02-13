import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import type { Sector, SectorWithAngles } from '@/types/pieChart'

export const usePieChartStore = defineStore('pieChart', () => {
  // Состояние с типизацией
  const sectors = ref<Sector[]>([
    { id: 1, name: 'Сектор-1', percentage: 20, color: '#FF6384' },
    { id: 2, name: 'Сектор-2', percentage: 20, color: '#36A2EB' },
    { id: 3, name: 'Сектор-3', percentage: 20, color: '#FFCE56' },
  ])
  
  // Геттеры (вычисляемые свойства) с типами
  const totalPercentage = computed(() => {
    return sectors.value.reduce((sum, sector) => sum + sector.percentage, 0)
  })
  
  const remainingPercentage = computed(() => {
    return 100 - totalPercentage.value
  })
  
  const sectorsWithAngles = computed<SectorWithAngles[]>(() => {
    const total = 100
    
    let currentAngle = 0
    
    return sectors.value.map(sector => {
      let angle = (sector.percentage / total) * 360
      
      // Если это единственный сектор и он 100% — отдаём 359.99° (почти полный круг)
      if (sectors.value.length === 1 && sector.percentage === 100) {
        // Chart.js не рисует сектор в 360°, даём чуть меньше
        angle = 359.9999
      }

      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      
      currentAngle = endAngle
      
      return {
        ...sector,
        startAngle,
        endAngle,
        angle
      }
    })
  })
  
  // Действия (методы) с типами
  const addSector = (sectorData: Omit<Sector, 'id'>): { success: boolean; message?: string } => {
    const newPercentage = Number(sectorData.percentage)
    const currentTotal = totalPercentage.value
    
    // Проверка суммы процентов
    if (currentTotal + newPercentage > 100) {
      return {
        success: false,
        message: `Сумма процентов не может превышать 100%. Доступно: ${100 - currentTotal}%`
      }
    }
    
    const nextId = sectors.value.length > 0 
      ? Math.max(...sectors.value.map(s => s.id)) + 1 
      : 1
    
    sectors.value.push({
      id: nextId,
      name: sectorData.name || `Сектор-${nextId}`,
      percentage: newPercentage,
      color: sectorData.color || '#FF6384'
    })
    
    return { success: true }
  }

  const updateSector = (id: number, updates: Partial<Omit<Sector, 'id'>>): { success: boolean; message?: string } => {
      const sectorToUpdate = sectors.value.find(sector => sector.id === id)
      
      if (!sectorToUpdate) {
        return { success: false, message: 'Сектор не найден' }
      }
      
      const currentTotal = totalPercentage.value
      const currentSectorPercentage = sectorToUpdate.percentage
      const newPercentage = updates.percentage !== undefined 
        ? Number(updates.percentage) 
        : currentSectorPercentage
      
      // Проверка суммы процентов при обновлении
      const newTotal = currentTotal - currentSectorPercentage + newPercentage
      
      if (newTotal > 100) {
        const maxAllowed = 100 - (currentTotal - currentSectorPercentage)
        return {
          success: false,
          message: `Сумма процентов не может превышать 100%. Максимум для этого сектора: ${maxAllowed}%`
        }
      }
      
      const index = sectors.value.indexOf(sectorToUpdate)
      
      const updatedSector: Sector = {
        id: sectorToUpdate.id,
        name: updates.name !== undefined ? updates.name : sectorToUpdate.name,
        percentage: newPercentage,
        color: updates.color !== undefined ? updates.color : sectorToUpdate.color
      }
      
      if (sectors.value.length === 1 && newPercentage === 100) {
        // Сначала ставим 99.999%
        sectors.value[index] = {
          ...updatedSector,
          percentage: 99.999
        }
        
        // В следующем тике ставим 100%
        setTimeout(() => {
          sectors.value[index] = updatedSector
        }, 10)
      } else {
        // Обычное обновление
        sectors.value[index] = updatedSector
      }
      
      return { success: true }
  }
  
  const deleteSector = (id: number) => {
    sectors.value = sectors.value.filter(sector => sector.id !== id)
  }
  
  const getSectorById = (id: number): Sector | undefined => {
    return sectors.value.find(sector => sector.id === id)
  }
  
  // Вспомогательные методы для валидации
  const canAddSector = (percentage: number): boolean => {
    return totalPercentage.value + percentage <= 100
  }
  
  const canUpdateSector = (sectorId: number, newPercentage: number): boolean => {
    const sector = sectors.value.find(s => s.id === sectorId)
    if (!sector) return false
    
    const newTotal = totalPercentage.value - sector.percentage + newPercentage
    return newTotal <= 100
  }
  
  const getMaxPercentageForNewSector = (): number => {
    return 100 - totalPercentage.value
  }
  
  const getMaxPercentageForSector = (sectorId: number): number => {
    const sector = sectors.value.find(s => s.id === sectorId)
    if (!sector) return 0
    
    return 100 - (totalPercentage.value - sector.percentage)
  }
  
  // Вспомогательная функция для диаграммы
  const getSectorPath = (sector: SectorWithAngles): string => {
    const centerX = 250
    const centerY = 250
    const radius = 200
    
    const startAngleRad = (sector.startAngle - 90) * Math.PI / 180
    const endAngleRad = (sector.endAngle - 90) * Math.PI / 180
    
    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)
    
    const largeArcFlag = sector.angle > 180 ? 1 : 0
    
    return [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
  }
  
  return {
    // Состояние
    sectors,
    
    // Геттеры
    totalPercentage,
    remainingPercentage,
    sectorsWithAngles,
    
    // Действия
    addSector,
    updateSector,
    deleteSector,
    getSectorById,
    
    // Валидация
    canAddSector,
    canUpdateSector,
    getMaxPercentageForNewSector,
    getMaxPercentageForSector,
    
    // Утилиты
    getSectorPath
  }
})