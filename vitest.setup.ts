import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Настройка Pinia для тестов
beforeEach(() => {
  setActivePinia(createPinia())
})