<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>📦 仓库周转模拟</h1>
      </div>
      <nav class="nav-menu">
        <NuxtLink to="/" class="nav-item">
          <span class="nav-icon">📊</span>
          <span>数据概览</span>
        </NuxtLink>
        <NuxtLink to="/inbound" class="nav-item">
          <span class="nav-icon">📥</span>
          <span>入库管理</span>
        </NuxtLink>
        <NuxtLink to="/outbound" class="nav-item">
          <span class="nav-icon">📤</span>
          <span>出库管理</span>
        </NuxtLink>
        <NuxtLink to="/inventory" class="nav-item">
          <span class="nav-icon">📋</span>
          <span>库存查询</span>
        </NuxtLink>
        <NuxtLink to="/warnings" class="nav-item">
          <span class="nav-icon">⚠️</span>
          <span>临期预警</span>
          <span v-if="warningCount > 0" class="nav-badge">{{ warningCount }}</span>
        </NuxtLink>
        <NuxtLink to="/locations" class="nav-item">
          <span class="nav-icon">🗺️</span>
          <span>货位管理</span>
        </NuxtLink>
        <NuxtLink to="/rules" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span>出库规则</span>
        </NuxtLink>
        <NuxtLink to="/simulation" class="nav-item">
          <span class="nav-icon">🎮</span>
          <span>模拟控制</span>
        </NuxtLink>
      </nav>
    </aside>
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useWarehouseStore } from '~/stores/warehouse'

const warehouseStore = useWarehouseStore()

onMounted(() => {
  warehouseStore.initMockData()
})

const warningCount = computed(() => warehouseStore.warningItems.length)
</script>

<style lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;

  &-header {
    padding: $spacing-lg;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    h1 {
      font-size: $font-size-lg;
      font-weight: 600;
    }
  }
}

.nav-menu {
  padding: $spacing-sm;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius;
  color: #cbd5e1;
  text-decoration: none;
  margin-bottom: $spacing-xs;
  transition: all $transition-fast;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  &.router-link-active {
    background: $primary-color;
    color: white;
  }

  .nav-icon {
    margin-right: $spacing-sm;
    font-size: $font-size-lg;
  }

  .nav-badge {
    margin-left: auto;
    background: $danger-color;
    color: white;
    padding: 2px 6px;
    border-radius: 9999px;
    font-size: $font-size-xs;
    font-weight: 500;
  }
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
}
</style>
