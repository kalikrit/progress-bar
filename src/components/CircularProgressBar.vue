<template>
  <div
    class="circular-progress-bar"
    :class="`status--${status} type--${type}`"
    role="progressbar"
    :aria-valuenow="currentDisplayValue"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-label="ariaLabel || `Progress: ${currentDisplayValue}%`"
    :style="{
      '--progress-bg': progressBg,
      '--size': `${size}px`,
    }"
  >
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
      class="progress-svg"
    >
      <!-- Background circle -->
      <circle
        class="progress-background"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        fill="none"
      />

      <!-- Progress circle -->
      <circle
        ref="progressCircleRef"
        class="progress-circle"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :stroke-linecap="strokeLinecap"
        :transform="`rotate(${rotationAngle} ${center} ${center})`"
      />

      <!-- Center text -->
      <text
        v-if="showText && !hideTextForStatus"
        :x="center"
        :y="center"
        text-anchor="middle"
        dominant-baseline="central"
        class="progress-text"
      >
        {{ displayText }}
      </text>

      <!-- Status icon - only for success, warning, error and when showText is false -->
      <g 
        v-if="showStatusIcon && status !== 'inProgress' && !showText"
        :transform="`translate(${center}, ${center})`"
        class="status-icon"
      >
        <template v-if="status === 'success'">
          <!-- Checkmark -->
          <circle cx="0" cy="0" r="16" fill="#10b981" />
          <path
            d="M -6 -2 L -2 2 L 6 -6"
            fill="none"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            transform="rotate(45)"
          />
          <path
            d="M -6 4 L -2 8 L 6 0"
            fill="none"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            transform="rotate(45)"
          />
        </template>
        <template v-else-if="status === 'warning'">
          <!-- Warning triangle -->
          <path
            d="M 0 -12 L 10 8 L -10 8 Z"
            fill="#f59e0b"
          />
          <circle cx="0" cy="4" r="1.5" fill="white" />
          <rect x="-1" y="6" width="2" height="3" fill="white" rx="0.5" />
        </template>
        <template v-else-if="status === 'error'">
          <!-- Error cross -->
          <circle cx="0" cy="0" r="16" fill="#ef4444" />
          <path
            d="M -8 -8 L 8 8"
            fill="none"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M -8 8 L 8 -8"
            fill="none"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
          />
        </template>
      </g>
    </svg>

    <!-- Slot for custom center content -->
    <div v-if="$slots.default" class="progress-center-slot">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

interface Props {
  modelValue?: number;
  min?: number;
  max?: number;
  status?: 'inProgress' | 'success' | 'warning' | 'error';
  type?: 'circle' | 'dashboard';
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  showStatusIcon?: boolean;
  textFormat?: 'percentage' | 'value' | 'custom';
  customText?: string;
  animationDuration?: number;
  ariaLabel?: string;
  color?: string;
  backgroundColor?: string;
  hideTextForStatus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  status: 'inProgress',
  type: 'circle',
  size: 120,
  strokeWidth: 8,
  showText: true,
  showStatusIcon: true,
  textFormat: 'percentage',
  customText: '',
  animationDuration: 800,
  ariaLabel: '',
  color: '',
  backgroundColor: '#e5e7eb',
  hideTextForStatus: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
  'statusChange': [{ newStatus: string; oldStatus: string }];
  'animationComplete': [value: number];
}>();

// Reactive state
const currentAnimatedValue = ref(props.modelValue);
const currentDisplayValue = ref(props.modelValue);
const animationFrameId = ref<number | null>(null);
const progressCircleRef = ref<SVGCircleElement | null>(null);

// SVG constants
const viewBoxSize = 100;
const center = viewBoxSize / 2;

// Computed properties
const radius = computed(() => {
  const availableRadius = center - props.strokeWidth / 2;
  return Math.max(5, availableRadius);
});

const circumference = computed(() => 2 * Math.PI * radius.value);

const rotationAngle = computed(() => {
  return props.type === 'dashboard' ? -90 : 0;
});

const effectiveCircumference = computed(() => {
  if (props.type === 'dashboard') {
    return circumference.value * 0.75; // 270 degrees
  }
  return circumference.value;
});

const strokeLinecap = computed(() => {
  return props.type === 'dashboard' ? 'round' : 'butt';
});

const normalizedProgress = computed(() => {
  const range = props.max - props.min;
  if (range === 0) return 0;
  const value = Math.min(Math.max(props.modelValue, props.min), props.max);
  const normalized = ((value - props.min) / range) * 100;
  return isNaN(normalized) ? 0 : normalized;
});

const dashOffset = computed(() => {
  const progress = currentAnimatedValue.value;
  const progressOffset = (progress / 100) * effectiveCircumference.value;
  return effectiveCircumference.value - progressOffset;
});

const displayText = computed(() => {
  if (props.textFormat === 'custom' && props.customText) {
    return props.customText;
  }
  
  if (props.textFormat === 'value') {
    return `${Math.round(props.modelValue)}`;
  }
  
  return `${Math.round(currentAnimatedValue.value)}%`;
});

// Вычисляем текущий цвет на основе анимированного значения
const currentColor = computed(() => {
  if (props.color) return props.color;
  
  if (props.status !== 'inProgress') {
    const statusColors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    };
    return statusColors[props.status] || '#3b82f6';
  }
  
  // Color interpolation from red to green for inProgress
  const progress = currentAnimatedValue.value;
  let r, g;
  
  if (progress < 50) {
    r = 255;
    g = Math.round(5.1 * progress);
  } else {
    r = Math.round(510 - 5.1 * progress);
    g = 255;
  }
  
  const color = `rgb(${r}, ${g}, 0)`;
  console.log('Current color calculation:', {
    progress,
    r,
    g,
    color,
    type: props.type,
    status: props.status
  });
  
  return color;
});

const progressBg = computed(() => props.backgroundColor);

// Функция для принудительного обновления цвета SVG элемента
const updateCircleColor = () => {
  console.log('updateCircleColor called, ref:', progressCircleRef.value);
  
  if (progressCircleRef.value) {
    console.log('Setting color to:', currentColor.value);
    progressCircleRef.value.style.stroke = currentColor.value;
    
    // Проверяем, установился ли цвет
    setTimeout(() => {
      console.log('Current stroke after update:', progressCircleRef.value?.style.stroke);
    }, 50);
  }
};

// Анимация с обновлением цвета
const animateProgress = (fromValue: number, toValue: number, duration: number) => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  
  const startTime = performance.now();
  const startValue = fromValue;
  const valueChange = toValue - startValue;
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Cubic easing function
    const easedProgress = progress < 0.5 
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    currentAnimatedValue.value = startValue + (valueChange * easedProgress);
    currentDisplayValue.value = Math.round(currentAnimatedValue.value);
    
    // Обновляем цвет на каждом кадре анимации
    updateCircleColor();
    
    if (progress < 1) {
      animationFrameId.value = requestAnimationFrame(animate);
    } else {
      currentAnimatedValue.value = toValue;
      currentDisplayValue.value = Math.round(toValue);
      animationFrameId.value = null;
      
      // Финальное обновление цвета
      updateCircleColor();
      emit('animationComplete', toValue);
    }
  };
  
  animationFrameId.value = requestAnimationFrame(animate);
};

// Watchers
watch(() => props.modelValue, (newValue, oldValue) => {
  const normalizedOld = ((oldValue - props.min) / (props.max - props.min)) * 100 || 0;
  const normalizedNew = ((newValue - props.min) / (props.max - props.min)) * 100 || 0;
  
  animateProgress(normalizedOld, normalizedNew, props.animationDuration);
}, { immediate: true });

watch(() => props.status, (newStatus, oldStatus) => {
  emit('statusChange', { newStatus, oldStatus });
});

// Следим за изменением цвета и обновляем SVG
watch(currentColor, (newColor, oldColor) => {
  console.log('Color changed!', { 
    oldColor, 
    newColor,
    currentValue: currentColor.value 
  });
  nextTick(() => {
    console.log('Calling updateCircleColor from watcher');
    updateCircleColor();
  });
}, { immediate: true });

// Lifecycle
onMounted(() => {
  currentAnimatedValue.value = normalizedProgress.value;
  currentDisplayValue.value = Math.round(normalizedProgress.value);
  nextTick(updateCircleColor);
    console.log('progressCircleRef value:', progressCircleRef.value);
  console.log('Component mounted, forcing color update');
  setTimeout(updateCircleColor, 100);
});

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
});

// Expose methods
defineExpose({
  getCurrentValue: () => currentDisplayValue.value,
  getCurrentColor: () => currentColor.value,
  animateTo: (targetValue: number, duration?: number) => {
    const targetNormalized = ((targetValue - props.min) / (props.max - props.min)) * 100;
    animateProgress(currentAnimatedValue.value, targetNormalized, duration || props.animationDuration);
  },
});
</script>

<style scoped>
.circular-progress-bar {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.progress-svg {
  display: block;
  transition: all 0.5s ease;
}

.progress-background {
  stroke: var(--progress-bg, #e5e7eb);
  transition: stroke 0.5s ease;
}

.circular-progress-bar.status--inProgress .progress-circle {
  stroke: currentColor; 
  transition: 
    stroke-dashoffset var(--animation-duration, 0.8s) cubic-bezier(0.4, 0, 0.2, 1),
    stroke 0.5s ease;
}

.progress-text {
  font-size: 20px;
  font-weight: 600;
  fill: #374151;
  transition: fill 0.3s ease;
}

.status-icon {
  pointer-events: none;
}

.progress-center-slot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* Status animations */
.circular-progress-bar.status--success .progress-circle {
  animation: pulse-success 2s infinite;
}

.circular-progress-bar.status--warning .progress-circle {
  animation: pulse-warning 2s infinite;
}

.circular-progress-bar.status--error .progress-circle {
  animation: pulse-error 2s infinite;
}

@keyframes pulse-success {
  0%, 100% { stroke-opacity: 1; }
  50% { stroke-opacity: 0.7; }
}

@keyframes pulse-warning {
  0%, 100% { stroke-opacity: 1; }
  50% { stroke-opacity: 0.7; }
}

@keyframes pulse-error {
  0%, 100% { stroke-opacity: 1; }
  50% { stroke-opacity: 0.7; }
}

/* Dashboard specific */
.circular-progress-bar.type--dashboard .progress-circle {
  stroke-linecap: round;
}

/* Важное правило для анимации цвета */
.circular-progress-bar.status--inProgress .progress-circle {
  transition: 
    stroke-dashoffset var(--animation-duration, 0.8s) cubic-bezier(0.4, 0, 0.2, 1),
    stroke 0.5s ease;
}
</style>