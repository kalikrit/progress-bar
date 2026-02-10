<template>
  <div class="pie-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

// Регистрируем необходимые компоненты Chart.js
Chart.register(...registerables);

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: PieChartData[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  title: 'Pie Chart',
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Форматирование данных для Chart.js
const getChartData = () => {
  return {
    labels: props.data.map(item => item.label),
    datasets: [
      {
        data: props.data.map(item => item.value),
        backgroundColor: props.data.map(item => item.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };
};

// Настройки диаграммы
const getChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      title: {
        display: !!props.title,
        text: props.title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
  };
};

// Инициализация или обновление диаграммы
const updateChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.data = getChartData();
    chartInstance.options = getChartOptions();
    chartInstance.update();
  } else {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'pie',
      data: getChartData(),
      options: getChartOptions(),
    });
  }
};

// Наблюдаем за изменениями данных
watch(() => props.data, () => {
  updateChart();
}, { deep: true });

// Жизненный цикл
onMounted(() => {
  updateChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.pie-chart-container {
  position: relative;
  width: 100%;
  height: 400px;
  margin: 0 auto;
}
</style>