<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-800">📅 日常作息时间规划器</h1>
          <nav class="flex gap-2">
            <NuxtLink to="/" class="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors" :class="{ 'bg-blue-100 text-blue-600': route.path === '/' }">
              今日作息
            </NuxtLink>
            <NuxtLink to="/create" class="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors" :class="{ 'bg-blue-100 text-blue-600': route.path === '/create' }">
              任务库
            </NuxtLink>
            <NuxtLink to="/edit" class="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors" :class="{ 'bg-blue-100 text-blue-600': route.path === '/edit' }">
              编辑时间轴
            </NuxtLink>
            <NuxtLink to="/review" class="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors" :class="{ 'bg-blue-100 text-blue-600': route.path === '/review' }">
              打卡复盘
            </NuxtLink>
            <NuxtLink to="/history" class="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors" :class="{ 'bg-blue-100 text-blue-600': route.path === '/history' }">
              历史记录
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 py-6">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
