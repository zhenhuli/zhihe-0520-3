<script setup lang="ts">
import type { CrewRole } from '~/types'

const props = defineProps<{
  crew: CrewRole
  index: number
}>()

const emit = defineEmits<{
  update: [crew: CrewRole]
  remove: []
}>()

const commonRoles = [
  '导演', '副导演', '摄影师', '摄影助理', '灯光师', '灯光助理',
  '录音师', '录音助理', '美术指导', '场记', '场务', '化妆师',
  '服装师', '道具师', '剪辑师', '调色师',
]

function updateField(field: keyof CrewRole, value: any) {
  emit('update', { ...props.crew, [field]: value })
}
</script>

<template>
  <div class="flex gap-3 items-end mb-3 p-3 bg-gray-50 rounded-lg">
    <div class="flex-1">
      <label class="label">岗位名称</label>
      <select
        class="input"
        :value="crew.name"
        @change="updateField('name', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">-- 选择岗位 --</option>
        <option
          v-for="role in commonRoles"
          :key="role"
          :value="role"
        >
          {{ role }}
        </option>
      </select>
    </div>

    <div class="w-24">
      <label class="label">人数</label>
      <input
        type="number"
        class="input"
        :value="crew.count"
        @input="updateField('count', Number(($event.target as HTMLInputElement).value))"
        min="1"
      />
    </div>

    <div class="w-36">
      <label class="label">日薪(元)</label>
      <input
        type="number"
        class="input"
        :value="crew.dailyRate"
        @input="updateField('dailyRate', Number(($event.target as HTMLInputElement).value))"
        min="0"
      />
    </div>

    <button
      class="btn btn-danger text-sm px-3 py-2 mb-1"
      @click="emit('remove')"
    >
      删除
    </button>
  </div>
</template>
