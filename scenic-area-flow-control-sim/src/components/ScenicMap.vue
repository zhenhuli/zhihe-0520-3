<template>
  <div class="map-container" ref="mapContainer" :style="{ height: mapHeight + 'px' }">
    <div
      v-for="area in areas"
      :key="area.id"
      class="map-area"
      :class="[`status-${getStatusLevel(area.currentVisitors, area.maxCapacity).level}`]"
      :style="{
        left: area.x + 'px',
        top: area.y + 'px',
        width: area.width + 'px',
        height: area.height + 'px',
        backgroundColor: area.color,
        opacity: getOpacity(area),
        border: selectedArea?.id === area.id ? '3px solid #fff' : 'none',
        boxShadow: selectedArea?.id === area.id ? '0 0 20px rgba(255,255,255,0.8)' : 'none'
      }"
      @click="$emit('area-click', area)"
    >
      <div class="text-center p-1">
        <div class="small">{{ area.name }}</div>
        <div class="fw-bold">{{ area.currentVisitors }}/{{ area.maxCapacity }}</div>
      </div>
    </div>

    <svg class="position-absolute top-0 start-0 w-100 h-100" style="pointer-events: none; z-index: 3;">
      <line
        v-for="(conn, idx) in connections"
        :key="idx"
        :x1="getAreaCenter(conn.from).x"
        :y1="getAreaCenter(conn.from).y"
        :x2="getAreaCenter(conn.to).x"
        :y2="getAreaCenter(conn.to).y"
        stroke="rgba(100, 100, 100, 0.4)"
        stroke-width="2"
        stroke-dasharray="5,5"
      />
    </svg>

    <svg v-if="routePath.length > 1" class="position-absolute top-0 start-0 w-100 h-100" style="pointer-events: none; z-index: 4;">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ff6b6b" />
        </marker>
      </defs>
      <polyline
        :points="routePoints"
        fill="none"
        stroke="#ff6b6b"
        stroke-width="3"
        marker-end="url(#arrowhead)"
        style="animation: dash 1s linear infinite;"
      />
    </svg>

    <div
      v-for="(dot, idx) in flowDots"
      :key="idx"
      class="flow-dot"
      :style="{
        left: dot.x + 'px',
        top: dot.y + 'px',
        animationDelay: dot.delay + 's'
      }"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getStatusLevel } from '@/utils/scenicData'

const props = defineProps({
  areas: {
    type: Array,
    required: true
  },
  connections: {
    type: Array,
    required: true
  },
  selectedArea: {
    type: Object,
    default: null
  },
  routePath: {
    type: Array,
    default: () => []
  }
})

defineEmits(['area-click'])

const mapHeight = ref(400)

const getOpacity = (area) => {
  const ratio = area.currentVisitors / area.maxCapacity
  return Math.min(0.5 + ratio * 0.5, 1)
}

const getAreaCenter = (areaId) => {
  const area = props.areas.find(a => a.id === areaId)
  if (!area) return { x: 0, y: 0 }
  return {
    x: area.x + area.width / 2,
    y: area.y + area.height / 2
  }
}

const routePoints = computed(() => {
  return props.routePath
    .map(id => {
      const center = getAreaCenter(id)
      return `${center.x},${center.y}`
    })
    .join(' ')
})

const flowDots = computed(() => {
  const dots = []
  props.connections.forEach(conn => {
    const from = getAreaCenter(conn.from)
    const to = getAreaCenter(conn.to)
    for (let i = 0; i < 3; i++) {
      dots.push({
        x: from.x + (to.x - from.x) * (i / 3),
        y: from.y + (to.y - from.y) * (i / 3),
        delay: Math.random() * 3
      })
    }
  })
  return dots.slice(0, 20)
})
</script>

<style scoped>
@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}

polyline {
  stroke-dasharray: 10, 5;
}
</style>
