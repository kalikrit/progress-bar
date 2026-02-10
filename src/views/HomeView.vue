<template>
  <div class="home">
    <header class="header">
      <h1 class="title">Vue 3 Круговой Прогресс Бар</h1>
      <p class="subtitle">Продвинутый, настраиваемый компонент индикатора прогресса</p>
    </header>

    <main class="main-content">
      <!-- Basic Examples -->
      <section class="demo-section">
        <h2>Основные Примеры</h2>
        <div class="examples">
          <div class="example-card">
            <h3>Default Progress Bar</h3>
            <CircularProgressBar 
              :model-value="basicProgress" 
              :size="100"
            />
            <div class="controls">
              <input 
                type="range" 
                v-model.number="basicProgress" 
                min="0" 
                max="100" 
                class="slider"
              />
              <span class="value-label">{{ basicProgress }}%</span>
            </div>
          </div>

        <div class="example-card">
            <h3>Dashboard Type</h3>
            <CircularProgressBar 
                :model-value="dashboardProgress"
                type="dashboard"
                :size="100"
            />
            <div class="controls">
                <input 
                type="range" 
                v-model.number="dashboardProgress" 
                min="0" 
                max="100" 
                class="slider"
                />
                <span class="value-label">{{ dashboardProgress }}%</span>
            </div>
            <p class="description">270° arc with rounded ends</p>
        </div>
        </div>
      </section>

      <!-- Status Examples -->
      <section class="demo-section">
        <h2>Примеры Состояний</h2>
        <div class="status-grid">
          <div 
            v-for="statusExample in statusExamples" 
            :key="statusExample.status"
            class="status-card"
          >
            <CircularProgressBar 
              :model-value="statusExample.value"
              :status="statusExample.status"
              :size="90"
              :show-text="statusExample.status === 'inProgress'"
              :show-status-icon="statusExample.status !== 'inProgress'"
            />
            <div class="status-info">
              <span :class="`status-badge status-${statusExample.status}`">
                {{ statusExample.label }}
              </span>
              <p>{{ statusExample.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Interactive Playground -->
      <section class="demo-section">
        <h2>Интерактивная Песочница</h2>
        <div class="playground">
          <div class="playground-controls">
            <div class="control-group">
              <label>Progress: {{ playground.progress }}%</label>
              <input 
                type="range" 
                v-model.number="playground.progress" 
                min="0" 
                max="100"
                class="slider wide"
              />
            </div>

            <div class="control-group">
              <label>Status</label>
              <div class="button-group">
                <button
                  v-for="status in statusOptions"
                  :key="status"
                  @click="setPlaygroundStatus(status)"
                  :class="{ active: playground.status === status }"
                >
                  {{ statusLabels[status] }}
                </button>
              </div>
            </div>

            <div class="control-group">
              <label>Type</label>
              <div class="button-group">
                <button
                  v-for="type in typeOptions"
                  :key="type"
                  @click="playground.type = type"
                  :class="{ active: playground.type === type }"
                >
                  {{ typeLabels[type] }}
                </button>
              </div>
            </div>

            <div class="control-group">
              <label>Display Mode</label>
              <div class="button-group">
                <button
                  @click="playground.showText = true; playground.showIcon = false"
                  :class="{ active: playground.showText && !playground.showIcon }"
                >
                  Show Text
                </button>
                <button
                  @click="playground.showText = false; playground.showIcon = true"
                  :class="{ active: !playground.showText && playground.showIcon }"
                >
                  Show Icon
                </button>
                <button
                  @click="playground.showText = true; playground.showIcon = true"
                  :class="{ active: playground.showText && playground.showIcon }"
                >
                  Both
                </button>
              </div>
            </div>
          </div>

          <div class="playground-preview">
            <CircularProgressBar 
              :model-value="playground.progress"
              :status="playground.status"
              :type="playground.type"
              :size="140"
              :stroke-width="10"
              :show-text="playground.showText"
              :show-status-icon="playground.showIcon"
              :hide-text-for-status="playground.status !== 'inProgress'"
            />
            
            <div class="preview-info">
              <p><strong>Current Value:</strong> {{ playground.progress }}%</p>
              <p><strong>Status:</strong> {{ statusLabels[playground.status] }}</p>
              <p><strong>Type:</strong> {{ typeLabels[playground.type] }}</p>
              <p><strong>Display:</strong> 
                {{ playground.showText ? 'Text' : '' }}
                {{ playground.showText && playground.showIcon ? '+ ' : '' }}
                {{ playground.showIcon ? 'Icon' : '' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Status Icons Showcase -->
      <section class="demo-section">
        <h2>Демонстрация Иконок Состояний</h2>
        <div class="icons-showcase">
          <div class="icon-example">
            <h3>Success (100%)</h3>
            <CircularProgressBar 
              :model-value="100"
              status="success"
              :size="100"
              :show-text="false"
              :show-status-icon="true"
            />
            <p>Green checkmark icon</p>
          </div>
          
          <div class="icon-example">
            <h3>Warning (85%)</h3>
            <CircularProgressBar 
              :model-value="85"
              status="warning"
              :size="100"
              :show-text="false"
              :show-status-icon="true"
            />
            <p>Yellow warning triangle</p>
          </div>
          
          <div class="icon-example">
            <h3>Error (30%)</h3>
            <CircularProgressBar 
              :model-value="30"
              status="error"
              :size="100"
              :show-text="false"
              :show-status-icon="true"
            />
            <p>Red cross icon</p>
          </div>
          
          <div class="icon-example">
            <h3>In Progress (65%)</h3>
            <CircularProgressBar 
              :model-value="65"
              status="inProgress"
              :size="100"
              :show-text="true"
              :show-status-icon="false"
            />
            <p>Dynamic color + percentage</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>Vue 3 Circular Progress Bar Component</p>
      <p>Built with Vue 3 Composition API & SVG</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CircularProgressBar from '../components/CircularProgressBar.vue';

// Basic example
const basicProgress = ref(35);
const dashboardProgress = ref(75);

// Status examples - теперь для warning и error показываем иконки вместо текста
const statusExamples = ref([
  { 
    status: 'inProgress' as const, 
    value: 65, 
    label: 'In Progress', 
    description: 'Color changes with progress' 
  },
  { 
    status: 'success' as const, 
    value: 100, 
    label: 'Success', 
    description: 'Green checkmark icon' 
  },
  { 
    status: 'warning' as const, 
    value: 85, 
    label: 'Warning', 
    description: 'Yellow warning triangle' 
  },
  { 
    status: 'error' as const, 
    value: 30, 
    label: 'Error', 
    description: 'Red cross icon' 
  },
]);

// Interactive playground
const playground = ref({
  progress: 65,
  status: 'inProgress' as const,
  type: 'circle' as const,
  showText: true,
  showIcon: false,
});

const statusOptions = ['inProgress', 'success', 'warning', 'error'] as const;
const typeOptions = ['circle', 'dashboard'] as const;

const statusLabels = {
  inProgress: 'In Progress',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

const typeLabels = {
  circle: 'Circle',
  dashboard: 'Dashboard',
};

const setPlaygroundStatus = (status: typeof statusOptions[number]) => {
  playground.value.status = status;
  
  // Автоматически настраиваем отображение в зависимости от статуса
  if (status === 'inProgress') {
    playground.value.showText = true;
    playground.value.showIcon = false;
  } else {
    playground.value.showText = false;
    playground.value.showIcon = true;
  }
};
</script>

<style scoped>
.home {
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
  max-width: 1000px;
  margin: 0 auto;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.example-card {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.example-card h3 {
  margin-top: 0;
  color: #4a5568;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4299e1;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider.wide {
  width: 100%;
}

.value-label {
  font-weight: 600;
  color: #2d3748;
  min-width: 40px;
}

.description {
  margin-top: 0.5rem;
  color: #718096;
  font-size: 0.9rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.status-info {
  margin-top: 1rem;
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.status-inProgress {
  background: #dbeafe;
  color: #1e40af;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.playground {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .playground {
    grid-template-columns: 1fr;
  }
}

.playground-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.button-group button {
  padding: 0.5rem 0.75rem;
  background: #edf2f7;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.button-group button:hover {
  background: #e2e8f0;
}

.button-group button.active {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.playground-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.preview-info {
  text-align: center;
  font-size: 0.9rem;
}

.preview-info p {
  margin: 0.25rem 0;
}

.icons-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.icon-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.icon-example h3 {
  margin-top: 0;
  color: #4a5568;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.icon-example p {
  margin-top: 0.5rem;
  color: #718096;
  font-size: 0.85rem;
}

.footer {
  text-align: center;
  color: white;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer p {
  margin: 0.25rem 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .demo-section {
    padding: 1rem;
  }
  
  .playground {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .icons-showcase {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>