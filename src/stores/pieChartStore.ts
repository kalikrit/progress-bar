import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Sector, SectorWithAngles } from '@/types/pieChart'

// Утилитарный тип для фильтрации undefined
type DefinedProperties<T> = {
  [K in keyof T]: T[K] extends undefined ? never : T[K]
}

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
  
  const sectorsWithAngles = computed<SectorWithAngles[]>(() => {
    const total = totalPercentage.value
    let currentAngle = 0
    
    return sectors.value.map(sector => {
      const angle = (sector.percentage / total) * 360
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
  const addSector = (sectorData: Omit<Sector, 'id'>) => {
    const nextId = sectors.value.length > 0 
      ? Math.max(...sectors.value.map(s => s.id)) + 1 
      : 1
    
    sectors.value.push({
      id: nextId,
      name: sectorData.name || `Сектор-${nextId}`,
      percentage: Number(sectorData.percentage),
      color: sectorData.color || '#FF6384'
    })
  }
  
  const updateSector = (id: number, updates: Partial<Omit<Sector, 'id'>>) => {
    const index = sectors.value.findIndex(sector => sector.id === id)
    
    if (index !== -1) {
      // Используем утверждение типа, что сектор существует
      const currentSector = sectors.value[index]!
      
      // Явное создание нового объекта сектора
      const updatedSector: Sector = {
        id: currentSector.id,
        name: updates.name !== undefined ? updates.name : currentSector.name,
        percentage: updates.percentage !== undefined ? Number(updates.percentage) : currentSector.percentage,
        color: updates.color !== undefined ? updates.color : currentSector.color
      }
      
      sectors.value[index] = updatedSector
    }
  }
  
  const deleteSector = (id: number) => {
    sectors.value = sectors.value.filter(sector => sector.id !== id)
  }
  
  const getSectorById = (id: number): Sector | undefined => {
    return sectors.value.find(sector => sector.id === id)
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
    sectorsWithAngles,
    
    // Действия
    addSector,
    updateSector,
    deleteSector,
    getSectorById,
    getSectorPath
  }
})