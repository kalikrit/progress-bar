<template>
  <div class="pie-chart-container">
    <!-- Верхний блок с заголовком -->
    <header class="header">
      <h1 class="title">Круговая диаграмма</h1>
    </header>

    <!-- Основное содержимое: две колонки -->
    <div class="content-wrapper">
      <!-- ЛЕВАЯ КОЛОНКА: Список секторов -->
      <div class="left-column">
        <div class="sectors-list">
          <div 
            v-for="sector in store.sectors" 
            :key="sector.id" 
            class="sector-row"
          >
            <!-- Левая часть: название, процент, цвет с разделителями -->
            <div class="sector-left">
              <span class="sector-name">{{ sector.name }}</span>
              
              <!-- Вертикальный разделитель 1 -->
              <div class="vertical-divider"></div>
              
              <span class="sector-percentage">{{ sector.percentage }}%</span>
              
              <!-- Вертикальный разделитель 2 -->
              <div class="vertical-divider"></div>
              
              <div 
                class="color-circle" 
                :style="{ backgroundColor: sector.color }"
              ></div>
            </div>
            
            <!-- Правая часть: иконки действий -->
            <div class="sector-right">
              <button 
                @click="openEditModal(sector)"
                class="icon-btn edit-btn"
                title="Редактировать"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.06 9.02L14.98 9.94L5.92 19H5V18.08L14.06 9.02ZM17.66 3C17.41 3 17.15 3.1 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C18.17 3.09 17.92 3 17.66 3ZM14.06 6.19L3 17.25V21H6.75L17.81 9.94L14.06 6.19Z" fill="#666"/>
                </svg>
              </button>
              <button 
                @click="deleteSector(sector.id)"
                class="icon-btn delete-btn"
                title="Удалить"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#666"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Кнопка Добавить сектор -->
        <button @click="openAddModal" class="add-sector-btn">
          <span class="btn-text">Добавить сектор</span>
        </button>
      </div>

      <!-- ПРАВАЯ КОЛОНКА: Диаграмма и подписи -->
      <div class="right-column">
        <div class="chart-wrapper">
          <svg class="pie-chart" viewBox="0 0 500 500">
            <!-- Классические сектора-дольки из центра -->
            <g v-for="sector in store.sectorsWithAngles" :key="'slice-' + sector.id">
              <path 
                :d="store.getSectorPath(sector)" 
                :fill="sector.color"
                stroke="#FFFFFF"
                stroke-width="2"
                class="sector-path"
              />
            </g>
          </svg>
        </div>
        
        <div class="sector-names">
          <div 
            v-for="sector in store.sectors" 
            :key="'label-' + sector.id"
            class="sector-label"
          >
            {{ sector.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования сектора -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="add-sector-modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ modalMode === 'add' ? 'Добавление сектора' : 'Редактирование сектора' }}</h2>
        </div>

        <div class="modal-form">
          <div class="form-field">
            <input 
              v-model="currentSector.name"
              type="text"
              class="name-input"
              :class="{ 'error-input': nameError }"
              placeholder="Наименование"
              @input="validateNameWithDelay"
            />
            <div v-if="nameError" class="error-message">
              {{ nameError }}
            </div>
          </div>

        <div class="form-field">
          <div class="value-input-container">
            <input 
              v-model.number="currentSector.percentage"
              type="number"
              class="value-input"
              :class="{ 'error-input': percentageError }"
              :min="1"
              :max="getMaxPercentage()"
              placeholder="Значение"
              @input="validatePercentageWithDelay"
            />
            <div v-if="percentageError" class="error-message">
              {{ percentageError }}
            </div>
          </div>
        </div>

          <div class="form-field">
            <div class="color-picker-container">
              <div class="color-palette">
                <div 
                  v-for="color in colorPresets" 
                  :key="color"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  @click="currentSector.color = color"
                  :class="{ active: currentSector.color === color }"
                ></div>
              </div>
              
              <div class="color-input-row">
                <input 
                  v-model="currentSector.color"
                  type="text"
                  class="hex-input"
                  placeholder="Цвет"
                />
                <div class="color-picker-wrapper">
                  <div 
                    class="selected-color-preview"
                    :style="{ backgroundColor: currentSector.color }"
                  ></div>
                  <input 
                    v-model="currentSector.color"
                    type="color"
                    class="native-color-input"
                    title="Выберите цвет"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            @click="handleSubmit"
            class="modal-add-btn"
            :disabled="!isFormValid"
          >
            {{ modalMode === 'add' ? 'Добавить сектор' : 'Редактировать сектор' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { usePieChartStore } from '../stores/pieChartStore'
import type { Sector, SectorFormData } from '@/types/pieChart'

type ModalMode = 'add' | 'edit'

// Используем Pinia store
const store = usePieChartStore()

// Состояние модального окна
const showModal = ref<boolean>(false)
const modalMode = ref<ModalMode>('add')
const editingSectorId = ref<number | null>(null)
const percentageError = ref<string>('')
let validationTimer: number | null = null

// Состояние для ошибки имени
const nameError = ref<string>('')
let nameValidationTimer: number | null = null

// Валидация имени с задержкой
const validateNameWithDelay = () => {
  if (nameValidationTimer) {
    clearTimeout(nameValidationTimer)
  }
  
  // ✅ Если поле пустое - показываем ошибку сразу, без задержки
  if (currentSector.name.trim() === '') {
    nameError.value = 'Название сектора не может быть пустым'
    return
  }
  
  nameValidationTimer = setTimeout(() => {
    const name = currentSector.name.trim()
    
    if (name === '') {
      nameError.value = 'Название сектора не может быть пустым'
    } else if (name.length < 2) {
      nameError.value = 'Название должно содержать минимум 2 символа'
    } else {
      nameError.value = ''
    }
  }, 2000) // 2 секунды только для проверки длины
}

// Данные текущего сектора (для формы)
const currentSector = reactive<SectorFormData>({
  id: null,
  name: '',
  percentage: '',
  color: '#FF6384'
})

// Пресеты цветов для палитры
const colorPresets = ref<string[]>([
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#9966FF',
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
])

const lastUsedColorIndex = ref(0)

// Вычисляем максимальный доступный процент
const getMaxPercentage = (): number => {
  const total = store.sectors.reduce((sum, s) => sum + s.percentage, 0)
  
  if (modalMode.value === 'add') {
    return 100 - total
  } else if (editingSectorId.value !== null) {
    const sector = store.sectors.find(s => s.id === editingSectorId.value)
    if (sector) {
      return 100 - (total - sector.percentage)
    }
  }
  return 100
}

// Валидация с задержкой
const validatePercentageWithDelay = () => {
  if (validationTimer) {
    clearTimeout(validationTimer)
  }
  
  validationTimer = setTimeout(() => {
    const percentage = Number(currentSector.percentage)
    const total = store.sectors.reduce((sum, s) => sum + s.percentage, 0)
    
    if (modalMode.value === 'add') {
      if (total + percentage > 100) {
        percentageError.value = `Сумма превысит 100%! Доступно: ${100 - total}%`
      } else {
        percentageError.value = ''
      }
    } else if (editingSectorId.value !== null) {
      const sector = store.sectors.find(s => s.id === editingSectorId.value)
      if (sector) {
        const newTotal = total - sector.percentage + percentage
        if (newTotal > 100) {
          percentageError.value = `Сумма превысит 100%! Максимум: ${100 - (total - sector.percentage)}%`
        } else {
          percentageError.value = ''
        }
      }
    }
  }, 1500) // 1.5 секунды
}

// Валидация формы
const isFormValid = computed(() => {
  const percentage = Number(currentSector.percentage)
  const total = store.sectors.reduce((sum, s) => sum + s.percentage, 0)
  
  // Проверка суммы процентов
  if (modalMode.value === 'add') {
    if (total + percentage > 100) return false
  } else if (editingSectorId.value !== null) {
    const sector = store.sectors.find(s => s.id === editingSectorId.value)
    if (sector) {
      const newTotal = total - sector.percentage + percentage
      if (newTotal > 100) return false
    }
  }
  
  return currentSector.name.trim() !== '' && 
         percentage >= 1 && 
         percentage <= 100 &&
         percentageError.value === '' && 
         nameError.value === ''
})

// Открытие модального окна для добавления
const openAddModal = (): void => {
  modalMode.value = 'add'
  resetCurrentSector()
  percentageError.value = ''
  nameError.value = ''
  if (validationTimer) clearTimeout(validationTimer)
  if (nameValidationTimer) clearTimeout(nameValidationTimer)

  setTimeout(() => {
    if (currentSector.name.trim() === '') {
      nameError.value = 'Название сектора не может быть пустым'
    }
  }, 100) // Небольшая задержка, чтобы форма успела отрисоваться

  currentSector.color = colorPresets.value[lastUsedColorIndex.value] ?? '#FF6384'
  lastUsedColorIndex.value = (lastUsedColorIndex.value + 1) % colorPresets.value.length
  showModal.value = true
}

// Открытие модального окна для редактирования
const openEditModal = (sector: Sector): void => {
  modalMode.value = 'edit'
  editingSectorId.value = sector.id

  percentageError.value = ''
  nameError.value = ''
  if (validationTimer) clearTimeout(validationTimer)
  if (nameValidationTimer) clearTimeout(nameValidationTimer)

  // Заполняем форму данными редактируемого сектора
  currentSector.id = sector.id
  currentSector.name = sector.name
  currentSector.percentage = sector.percentage
  currentSector.color = sector.color
  
  showModal.value = true
}

// Обработка отправки формы (добавление или редактирование)
const handleSubmit = (): void => {
  if (!isFormValid.value) return
  
  const percentage = Number(currentSector.percentage)
  
  // Дополнительная проверка суммы процентов
  const total = store.sectors.reduce((sum, s) => sum + s.percentage, 0)
  
  if (modalMode.value === 'add') {
    if (total + percentage > 100) {
      alert(`Сумма процентов не может превышать 100%. Доступно: ${100 - total}%`)
      return
    }
    
    // Используем action из store
    store.addSector({
      name: currentSector.name,
      percentage,
      color: currentSector.color
    })
  } else if (editingSectorId.value !== null) {
    const sector = store.sectors.find(s => s.id === editingSectorId.value)
    if (sector) {
      const newTotal = total - sector.percentage + percentage
      if (newTotal > 100) {
        alert(`Сумма процентов не может превышать 100%. Максимум: ${100 - (total - sector.percentage)}%`)
        return
      }
    }
    
    // Используем action из store
    store.updateSector(editingSectorId.value, {
      name: currentSector.name,
      percentage,
      color: currentSector.color
    })
  }
  
  closeModal()
}

// Закрытие модального окна
const closeModal = (): void => {
  showModal.value = false
  editingSectorId.value = null
  resetCurrentSector()
  percentageError.value = ''
  nameError.value = ''
  if (validationTimer) clearTimeout(validationTimer)
  if (nameValidationTimer) clearTimeout(nameValidationTimer)
}

// Сброс данных текущего сектора
const resetCurrentSector = (): void => {
  currentSector.id = null
  currentSector.name = ''
  currentSector.percentage = ''
  currentSector.color = '#FF6384'
}

// Удаление сектора (используем action из store)
const deleteSector = (id: number): void => {
  store.deleteSector(id)
}
</script>

<style scoped>
/* Основные стили */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.pie-chart-container {
  width: 100%;
  max-width: 1170px;
  margin: 0 auto;
  padding: 30px 20px 0;
  position: relative;
}

/* ВЕРХНИЙ БЛОК ЗАГОЛОВКА */
.header {
  width: 100%;
  height: auto;
  min-height: 69px;
  padding: 0 10px 30px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: flex-end;
  margin-bottom: 40px;
}

.title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: clamp(1.5rem, 4vw, 2rem);
  line-height: 100%;
  letter-spacing: 0%;
  margin: 0;
}

/* ОБЩАЯ ОБЕРТКА ДЛЯ ДВУХ КОЛОНОК */
.content-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  width: 100%;
  position: relative;
}

/* ЛЕВАЯ КОЛОНКА */
.left-column {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* СПИСОК СЕКТОРОВ */
.sectors-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* СТРОКА СЕКТОРА */
.sector-row {
  width: 100%;
  min-height: 60px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  flex-wrap: wrap;
}

/* ЛЕВАЯ ЧАСТЬ СТРОКИ С РАЗДЕЛИТЕЛЯМИ */
.sector-left {
  flex: 1;
  min-width: 200px;
  height: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.error-input {
  border-color: #ef4444 !important;
}

.error-input:focus {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 5px;
  padding-left: 5px;
}

@media (min-width: 768px) {
  .sector-left {
    margin-bottom: 0;
    flex-wrap: nowrap;
  }
}

.sector-name {
  font-weight: 500;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #111827;
  white-space: nowrap;
}

.sector-percentage {
  font-weight: 500;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #6B7280;
  white-space: nowrap;
}

.color-circle {
  width: 16px;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #D1D5DB;
}

/* ВЕРТИКАЛЬНЫЙ РАЗДЕЛИТЕЛЬ */
.vertical-divider {
  width: 0;
  min-width: 2px;
  height: 16px;
  border-radius: 2px;
  border: 2px solid #DBDFE9;
  opacity: 1;
}

/* ПРАВАЯ ЧАСТЬ СТРОКИ */
.sector-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  opacity: 0.7;
}

/* КНОПКА ДОБАВИТЬ СЕКТОР */
.add-sector-btn {
  width: 100%;
  min-height: 60px;
  padding: 15px 20px;
  background: #1B84FF;
  border: none;
  border-radius: 10px;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  margin-top: 10px;
}

.btn-text {
  color: white;
  font-weight: 500;
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.5;
  letter-spacing: 0.2px;
  text-align: center;
}

.add-sector-btn:hover {
  background: #0A74EB;
}

.add-sector-btn:active {
  background: #0964D1;
  transform: translateY(1px);
}

/* ПРАВАЯ КОЛОНКА - ДИАГРАММА */
.right-column {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* КОНТЕЙНЕР ДИАГРАММЫ */
.chart-wrapper {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-chart {
  width: 100%;
  height: 100%;
}

.sector-path {
  transition: all 0.3s ease;
  cursor: pointer;
}

.sector-path:hover {
  filter: brightness(0.9);
  transform-origin: center;
  transform: scale(1.02);
}

/* ПОДПИСИ ПОД ДИАГРАММОЙ */
.sector-names {
  width: 100%;
  max-width: 540px;
  height: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 10px;
}

.sector-label {
  font-weight: 500;
  font-size: clamp(0.75rem, 1.5vw, 1rem);
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.sector-label::before {
  content: '';
  width: 10px;
  min-width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* МОДАЛЬНОЕ ОКНО */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.add-sector-modal {
  width: 100%;
  max-width: 390px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 15px;
  opacity: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* ЗАГОЛОВОК МОДАЛЬНОГО ОКНА */
.modal-header {
  border-radius: 15px 15px 0 0;
  padding: 16px 20px;
  margin: -20px -20px 10px -20px;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-title {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: clamp(1rem, 3vw, 1.25rem);
  line-height: 100%;
  letter-spacing: 0%;
  color: #252F4A;
  margin: 0;
}

/* ФОРМА В МОДАЛЬНОМ ОКНЕ */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  padding-top: 10px;
}

/* ПЛЕЙСХОЛДЕРЫ */
.name-input::placeholder,
.value-input::placeholder,
.hex-input::placeholder {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  line-height: 1.33;
  letter-spacing: 0%;
  color: #99A1B7;
}

/* ПОЛЕ "НАИМЕНОВАНИЕ" */
.name-input {
  width: 100%;
  min-height: 60px;
  border-radius: 10px;
  border: 1px solid #D1D5DB;
  padding: 10px 20px;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #111827;
  transition: border-color 0.2s;
}

.name-input:focus {
  outline: none;
  border-color: #1B84FF;
}

/* ПОЛЕ "ЗНАЧЕНИЕ" */
.value-input-container {
  width: 100%;
  min-height: 60px;
}

.value-input {
  width: 100%;
  height: 100%;
  min-height: 60px;
  border-radius: 10px;
  border: 1px solid #D1D5DB;
  padding: 10px 20px;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #111827;
  transition: border-color 0.2s;
}

.value-input:focus {
  outline: none;
  border-color: #1B84FF;
}

/* ПОЛЕ "ЦВЕТ" */
.color-picker-container {
  width: 100%;
  height: auto;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.color-option {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  border: 2px solid white;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.05);
}

.color-option.active {
  border-color: #1B84FF;
  box-shadow: 0 0 0 2px rgba(27, 132, 255, 0.3);
}

.color-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.hex-input {
  flex: 1;
  min-width: 150px;
  height: 40px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  padding: 0 12px;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  color: #111827;
}

.hex-input:focus {
  outline: none;
  border-color: #1B84FF;
}

.color-picker-wrapper {
  position: relative;
  width: 40px;
  min-width: 40px;
  height: 40px;
}

.selected-color-preview {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  border: 1px solid #D1D5DB;
  pointer-events: none;
}

.native-color-input {
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.native-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.native-color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

/* КНОПКА В МОДАЛЬНОМ ОКНЕ */
.modal-add-btn {
  width: 100%;
  min-height: 60px;
  border-radius: 10px;
  background: #1B84FF;
  border: none;
  color: white;
  font-weight: 500;
  font-size: clamp(0.875rem, 2vw, 1rem);
  cursor: pointer;
  transition: background 0.2s;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
}

.modal-add-btn:hover:not(:disabled) {
  background: #0A74EB;
}

.modal-add-btn:active:not(:disabled) {
  background: #0964D1;
}

.modal-add-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.7;
}

/* ЦВЕТНЫЕ ТОЧКИ ПЕРЕД НАЗВАНИЯМИ СЕКТОРОВ */
.sector-label:nth-child(1)::before { background-color: #FF6384; }
.sector-label:nth-child(2)::before { background-color: #36A2EB; }
.sector-label:nth-child(3)::before { background-color: #FFCE56; }
.sector-label:nth-child(4)::before { background-color: #4BC0C0; }
.sector-label:nth-child(5)::before { background-color: #9966FF; }

/* МЕДИА-ЗАПРОСЫ ДЛЯ РАЗНЫХ РАЗРЕШЕНИЙ */
@media (max-width: 1024px) {
  .content-wrapper {
    gap: 30px;
  }
  
  .left-column,
  .right-column {
    min-width: 100%;
  }
  
  .sector-left {
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .pie-chart-container {
    padding: 20px 15px 0;
  }
  
  .header {
    padding: 0 0 20px;
    margin-bottom: 30px;
  }
  
  .content-wrapper {
    gap: 20px;
  }
  
  .sector-row {
    flex-direction: column;
    align-items: stretch;
    padding: 15px;
  }
  
  .sector-left {
    justify-content: space-between;
    margin-bottom: 15px;
    gap: 5px 10px;
  }
  
  .sector-right {
    justify-content: center;
    margin-top: 10px;
  }
  
  .vertical-divider {
    display: none;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .add-sector-modal {
    max-height: 85vh;
  }
}

@media (max-width: 480px) {
  .pie-chart-container {
    padding: 15px 10px 0;
  }
  
  .header {
    margin-bottom: 20px;
  }
  
  .title {
    font-size: 1.25rem;
  }
  
  .sector-names {
    gap: 10px;
    margin-top: 20px;
  }
  
  .color-palette {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .color-input-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .hex-input {
    min-width: 100%;
  }
}
</style>