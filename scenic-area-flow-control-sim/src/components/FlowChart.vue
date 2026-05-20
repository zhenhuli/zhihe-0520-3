<template>
  <div class="control-panel">
    <h5 class="mb-3 text-info">
      <i class="bi bi-bar-chart-line me-2"></i>客流趋势
    </h5>
    <div style="height: 200px;">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = () => {
  if (!chartCanvas.value) return
  
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: '总游客数',
          data: [],
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { size: 11 }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            maxTicksLimit: 8,
            font: { size: 10 }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { font: { size: 10 } }
        }
      }
    }
  })
}

const updateChart = () => {
  if (!chartInstance || props.history.length === 0) return
  
  const labels = props.history.slice(-30).map((_, i) => i)
  const data = props.history.slice(-30).map(h => h.total)
  
  chartInstance.data.labels = labels
  chartInstance.data.datasets[0].data = data
  chartInstance.update('none')
}

onMounted(() => {
  createChart()
})

watch(() => props.history.length, () => {
  updateChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
