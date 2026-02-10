<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/" class="nav-link">Progress Bars</router-link>
      <router-link to="/pie-chart" class="nav-link">Pie Chart</router-link>
    </nav>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style>
#app {
  min-height: 100vh;
}

.navbar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-link.router-link-exact-active {
  background: rgba(255, 255, 255, 0.3);
}
</style>