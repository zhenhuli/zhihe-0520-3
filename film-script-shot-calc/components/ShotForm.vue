<script setup lang="ts">
import type { Shot } from '~/types'

const props = defineProps<{
  shot: Shot
  index: number
}>()

const emit = defineEmits<{
  update: [shot: Shot]
  remove: []
}>()

const complexityOptions = [
  { value: 'easy', label: '简单', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: '中等', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: '复杂', color: 'bg-red-100 text-red-800' },
]

function updateField(field: keyof Shot, value: any) {
  emit('update', { ...props.shot, [field]: value })
}
</script>

<template>
  <div class="card mb-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">
        镜头 {{ index + 1 }}
        <span
          v-if="shot.sceneNumber"
          class="ml-2 text-sm text-gray-500"
        >
          场景 {{ shot.sceneNumber }}-{{ shot.shotNumber }}
        </span>
      </h3>
      <button
        class="btn btn-danger text-sm px-3 py-1"
        @click="emit('remove')"
      >
        删除
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label class="label">场景号</label>
        <input
          type="text"
          class="input"
          :value="shot.sceneNumber"
          @input="updateField('sceneNumber', ($event.target as HTMLInputElement).value)"
          placeholder="例如: 01"
        />
      </div>

      <div>
        <label class="label">镜头号</label>
        <input
          type="text"
          class="input"
          :value="shot.shotNumber"
          @input="updateField('shotNumber', ($event.target as HTMLInputElement).value)"
          placeholder="例如: 001"
        />
      </div>

      <div>
        <label class="label">拍摄时长(分钟)</label>
        <input
          type="number"
          class="input"
          :value="shot.shotDuration"
          @input="updateField('shotDuration', Number(($event.target as HTMLInputElement).value))"
          min="0"
          step="0.5"
        />
      </div>

      <div>
        <label class="label">机位数量</label>
        <input
          type="number"
          class="input"
          :value="shot.cameraCount"
          @input="updateField('cameraCount', Number(($event.target as HTMLInputElement).value))"
          min="1"
        />
      </div>

      <div>
        <label class="label">布场时间(分钟)</label>
        <input
          type="number"
          class="input"
          :value="shot.setupTime"
          @input="updateField('setupTime', Number(($event.target as HTMLInputElement).value))"
          min="0"
        />
      </div>

      <div>
        <label class="label">拍摄难度</label>
        <select
          class="input"
          :value="shot.complexity"
          @change="updateField('complexity', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="opt in complexityOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="label">镜头描述</label>
        <input
          type="text"
          class="input"
          :value="shot.description"
          @input="updateField('description', ($event.target as HTMLInputElement).value)"
          placeholder="描述镜头内容..."
        />
      </div>
    </div>
  </div>
</template>
