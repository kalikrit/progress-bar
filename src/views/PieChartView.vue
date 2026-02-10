<template>
  <div class="pie-chart-page">
    <header class="header">
      <h1 class="title">Интерактивная круговая диаграмма</h1>
      <p class="subtitle">Добавляйте, редактруйте сектора</p>
    </header>

    <main class="main-content">
      <div class="dashboard">
        <!-- Левая колонка: Форма и список -->
        <div class="left-section">
          <!-- Форма -->
          <div class="form-card">
            <h2 class="form-title">
              {{ editingIndex !== null ? 'Редактирование' : 'Добавление сектора' }}
            </h2>
            
            <form @submit.prevent="handleSubmit" class="data-form">
              <div class="form-group">
                <label for="label" class="form-label">Нименование</label>
                <input
                  id="label"
                  v-model="formData.label"
                  type="text"
                  class="form-input"
                  placeholder="Enter label"
                  required
                />
              </div>

              <div class="form-group">
                <label for="value" class="form-label">Значение</label>
                <input
                  id="value"
                  v-model.number="formData.value"
                  type="number"
                  class="form-input"
                  placeholder="Enter value"
                  min="1"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Цвет</label>
                <div class="color-picker-wrapper">
                  <div 
                    class="color-preview"
                    :style="{ backgroundColor: formData.color }"
                  />
                  <input
                    v-model="formData.color"
                    type="color"
                    class="color-input-native"
                    title="Choose color"
                  />
                  <input
                    v-model="formData.color"
                    type="text"
                    class="form-input color-input"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                  {{ editingIndex !== null ? 'Редактировать' : 'Добавить сектор' }}
                </button>
                
                <button 
                  v-if="editingIndex !== null"
                  type="button" 
                  @click="cancelEdit"
                  class="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Список элементов -->
          <div class="list-card">
            <h3 class="list-title">Сектора ({{ chartData.length }})</h3>
            
            <div v-if="chartData.length === 0" class="empty-state">
              <p>No data added yet. Start by adding your first item!</p>
            </div>
            
            <div v-else class="items-list">
              <div 
                v-for="(item, index) in chartData" 
                :key="index"
                class="list-item"
                :class="{ 'is-editing': editingIndex === index }"
              >
                <div class="item-info">
                  <div class="item-color" :style="{ backgroundColor: item.color }" />
                  <div class="item-details">
                    <span class="item-label">{{ item.label }}</span>
                    <span class="item-value">{{ item.value }}</span>
                  </div>
                </div>
                
                <div class="item-actions">
                  <button 
                    @click="editItem(index)"
                    class="btn-icon btn-edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="removeItem(index)"
                    class="btn-icon btn-delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Правая колонка: Диаграмма -->
        <div class="right-section">
          <div class="chart-card">
            <PieChart 
              :data="chartData"
              title="Круговая диаграмма"
            />
            
            <div class="chart-stats">
              <div class="stat">
                <span class="stat-label">Total Items</span>
                <span class="stat-value">{{ chartData.length }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Total Value</span>
                <span class="stat-value">{{ totalValue }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Average</span>
                <span class="stat-value">{{ averageValue }}</span>
              </div>
            </div>
          </div>

          <!-- Предустановленные цвета -->
          <div class="presets-card">
            <h3 class="presets-title">Предустановленные цвета</h3>
            <div class="color-presets">
              <button
                v-for="color in colorPresets"
                :key="color"
                class="color-preset"
                :style="{ backgroundColor: color }"
                @click="formData.color = color"
                :title="color"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import PieChart from '../components/PieChart.vue';

interface ChartItem {
  label: string;
  value: number;
  color: string;
}

// Реактивные данные
const chartData = ref<ChartItem[]>([
  { label: 'Маркетинг', value: 30, color: '#3b82f6' },
  { label: 'Продажи', value: 25, color: '#10b981' },
  { label: 'Разработка', value: 20, color: '#f59e0b' },
  { label: 'Поддержка', value: 15, color: '#ef4444' },
  { label: 'Другое', value: 10, color: '#8b5cf6' },
]);

const formData = ref<ChartItem>({
  label: '',
  value: 10,
  color: '#3b82f6',
});

const editingIndex = ref<number | null>(null);

// Предустановленные цвета
const colorPresets = ref([
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]);

// Вычисляемые свойства
const totalValue = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.value, 0);
});

const averageValue = computed(() => {
  return chartData.value.length 
    ? Math.round(totalValue.value / chartData.value.length) 
    : 0;
});

// Методы
const handleSubmit = () => {
  if (editingIndex.value !== null) {
    chartData.value[editingIndex.value] = { ...formData.value };
    editingIndex.value = null;
  } else {
    chartData.value.push({ ...formData.value });
  }
  
  resetForm();
};

const editItem = (index: number) => {
  editingIndex.value = index;
  formData.value = { ...chartData.value[index] };
};

const removeItem = (index: number) => {
  if (editingIndex.value === index) {
    editingIndex.value = null;
    resetForm();
  }
  chartData.value.splice(index, 1);
};

const cancelEdit = () => {
  editingIndex.value = null;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    label: '',
    value: 10,
    color: '#3b82f6',
  };
};
</script>

<style scoped>
.pie-chart-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Карточки */
.form-card,
.list-card,
.chart-card,
.presets-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Форма */
.form-title {
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.data-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-input-native {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
}

.color-input-native::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input-native::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.color-input {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

/* Список */
.list-title {
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.list-item.is-editing {
  background: #ebf8ff;
  border-color: #4299e1;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #cbd5e0;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-label {
  font-weight: 600;
  color: #2d3748;
}

.item-value {
  color: #4a5568;
  font-size: 0.9rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #e6fffa;
  color: #0d9488;
}

.btn-delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Диаграмма */
.chart-card {
  height: 500px;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.stat {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

/* Пресеты цветов */
.presets-title {
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}

.color-preset {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid white;
}

.color-preset:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .pie-chart-page {
    padding: 1rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .form-card,
  .list-card,
  .chart-card,
  .presets-card {
    padding: 1.5rem;
  }
  
  .chart-stats {
    grid-template-columns: 1fr;
  }
  
  .color-presets {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>