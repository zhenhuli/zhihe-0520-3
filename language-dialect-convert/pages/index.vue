<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <header class="text-center mb-12">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 mb-4 shadow-lg">
        <span class="text-4xl">🗣️</span>
      </div>
      <h1 class="text-4xl font-bold text-gray-800 mb-2">方言语音文字互转工具</h1>
      <p class="text-gray-600 text-lg">输入普通话，一键转换为各地方言，支持读音标注和模拟朗读</p>
    </header>

    <!-- API Configuration Panel -->
    <div class="card mb-8">
      <div class="flex items-center justify-between mb-4 cursor-pointer" @click="showApiConfig = !showApiConfig">
        <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span>⚙️</span>
          <span>语音API配置</span>
        </h2>
        <button class="text-gray-500 hover:text-gray-700 transition-colors">
          {{ showApiConfig ? '收起' : '展开' }}
        </button>
      </div>
      <Transition name="slide">
        <div v-if="showApiConfig" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">百度语音 API Key</label>
              <input
                v-model="apiConfig.apiKey"
                type="password"
                placeholder="输入您的百度语音API Key"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">百度语音 Secret Key</label>
              <input
                v-model="apiConfig.secretKey"
                type="password"
                placeholder="输入您的百度语音Secret Key"
                class="input"
              />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="apiConfig.useBaiduApi"
                type="checkbox"
                class="w-4 h-4 text-primary-600 rounded"
              />
              <span class="text-sm text-gray-700">使用百度语音合成API（更真实的方言效果）</span>
            </label>
          </div>
          <p class="text-xs text-gray-500">
            💡 提示：百度语音API支持粤语、四川话等多种方言。如需获取API Key，请访问
            <a href="https://cloud.baidu.com/product/speech/tts" target="_blank" class="text-primary-500 hover:underline">百度智能云</a>
          </p>
        </div>
      </Transition>
    </div>

    <!-- Dialect Selector -->
    <div class="card mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">选择方言</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          v-for="dialect in dialects"
          :key="dialect.id"
          @click="selectedDialect = dialect.id"
          :class="[
            'p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105',
            selectedDialect === dialect.id
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-primary-300'
          ]"
        >
          <div class="text-3xl mb-2">{{ dialect.icon }}</div>
          <div class="font-semibold text-gray-800">{{ dialect.name }}</div>
          <div class="text-xs text-gray-500 mt-1 line-clamp-2">{{ dialect.region }}</div>
        </button>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-2 gap-8 mb-8">
      <!-- Input Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">标准普通话</h2>
          <button
            @click="clearInput"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            清空
          </button>
        </div>
        <textarea
          v-model="inputText"
          placeholder="请输入普通话文字，例如：你好，请问吃饭了吗？"
          class="input h-40 resize-none mb-4"
          @input="handleConvert"
        />
        <button
          @click="handleConvert"
          class="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <span>🔄</span>
          <span>一键转换</span>
        </button>

        <!-- Common Phrases -->
        <div class="mt-6">
          <h3 class="text-sm font-semibold text-gray-600 mb-3">常用语快捷输入</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(phrase, index) in commonPhrases"
              :key="index"
              @click="inputText = phrase.mandarin; handleConvert()"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full transition-colors"
            >
              {{ phrase.mandarin }}
            </button>
          </div>
        </div>
      </div>

      <!-- Output Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">{{ currentDialect?.name || '方言' }}</h2>
          <button
            @click="copyResult"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            复制
          </button>
        </div>
        <div
          class="bg-gray-50 rounded-lg p-4 min-h-40 mb-4"
        >
          <p v-if="convertedResult" class="text-xl text-gray-800 leading-relaxed">{{ convertedResult }}</p>
          <p v-else class="text-gray-400">转换结果将显示在这里...</p>
        </div>

        <!-- Play Controls -->
        <div v-if="convertedResult" class="space-y-3 mb-4">
          <!-- Current Voice Info -->
          <div v-if="!apiConfig.useBaiduApi && currentVoiceInfo" class="bg-primary-50 rounded-lg p-3 text-sm">
            <div class="flex items-center gap-2 text-primary-700">
              <span>🎙️</span>
              <span class="font-medium">当前语音包:</span>
              <span>{{ currentVoiceInfo.name }}</span>
              <span class="text-primary-500 text-xs">({{ currentVoiceInfo.lang }})</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="speakDialect"
              :disabled="isSpeaking || isLoadingAudio || !voicesReady"
              :class="[
                'btn flex-1 flex items-center justify-center gap-2',
                isSpeaking ? 'bg-accent-500 text-white' : 'btn-primary',
                (isSpeaking || isLoadingAudio || !voicesReady) ? 'opacity-70 cursor-not-allowed' : ''
              ]"
            >
              <span :class="{ 'animate-pulse': isSpeaking }">
                {{ !voicesReady ? '⏳' : isLoadingAudio ? '🔄' : isSpeaking ? '🔊' : '🔈' }}
              </span>
              <span>
                {{ !voicesReady ? '正在加载语音包...' : isLoadingAudio ? '正在合成语音...' : isSpeaking ? '正在播放...' : apiConfig.useBaiduApi ? '百度语音朗读' : '浏览器语音朗读' }}
              </span>
            </button>
            <button
              v-if="isSpeaking"
              @click="stopSpeaking"
              class="btn btn-secondary px-4"
            >
              ⏹️
            </button>
          </div>

          <!-- Voice Selection -->
          <div v-if="!apiConfig.useBaiduApi" class="bg-gray-50 rounded-lg p-3">
            <label class="block text-xs font-medium text-gray-600 mb-2">选择语音包</label>
            <select
              v-model="selectedVoiceName"
              @change="onVoiceSelectChange"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">🔄 自动匹配方言</option>
              <option v-for="voice in allVoices" :key="voice.name" :value="voice.name">
                {{ voice.name }} ({{ voice.lang }}){{ voice.localService ? ' ✓' : '' }}
              </option>
            </select>
            <p v-if="availableVoices.length === 0" class="text-xs text-amber-600 mt-2">
              ⚠️ 未找到{{ currentDialect?.name }}语音包，将使用普通话语音
            </p>
          </div>
        </div>

        <!-- Annotations -->
        <div v-if="annotations.length > 0" class="mt-4">
          <h3 class="text-sm font-semibold text-gray-600 mb-3">读音标注</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="(annotation, index) in annotations"
              :key="index"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <span class="text-gray-500">{{ annotation.original }}</span>
              <span class="text-gray-400">→</span>
              <span class="font-semibold text-primary-600">{{ annotation.converted }}</span>
              <span class="ml-auto text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">{{ annotation.pronunciation }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialect Info Card -->
    <div v-if="currentDialect" class="card">
      <div class="flex items-start gap-6">
        <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl" :style="{ backgroundColor: currentDialect.color + '20' }">
          {{ currentDialect.icon }}
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-800 mb-1">{{ currentDialect.name }}</h3>
          <p class="text-gray-600 mb-3">{{ currentDialect.description }}</p>
          <p class="text-sm text-gray-500 mb-4">使用地区：{{ currentDialect.region }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(rule, index) in currentDialect.toneRules"
              :key="index"
              class="px-3 py-1 text-sm rounded-full"
              :style="{ backgroundColor: currentDialect.color + '15', color: currentDialect.color }"
            >
              {{ rule }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-12 text-center text-gray-500 text-sm">
      <p>方言语音文字互转演示工具 | 内置多地方言常用语词库</p>
    </footer>

    <!-- Hidden Audio Element for Baidu TTS -->
    <audio ref="audioPlayer" @ended="onAudioEnded" @error="onAudioError" />

    <!-- Toast Notification -->
    <Transition name="fade">
      <div
        v-if="showToast"
        class="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-gray-800 text-white rounded-lg shadow-lg z-50"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { dialects, convertToDialect, getDialectById, type DialectWord } from '~/data/dialects'

const { speak: browserSpeak, stop: stopBrowserSpeech, isSpeaking: browserIsSpeaking, voices: allVoices, loadVoices, voicesReady, getBestVoiceForDialect } = useSpeech()

const inputText = ref('')
const selectedDialect = ref('cantonese')
const convertedResult = ref('')
const annotations = ref<Array<{ original: string; converted: string; pronunciation: string }>>([])
const isSpeaking = ref(false)
const isLoadingAudio = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const showApiConfig = ref(false)
const selectedVoiceName = ref('')
const audioPlayer = ref<HTMLAudioElement | null>(null)
const currentVoiceName = ref('')
const currentVoiceLang = ref('')

const apiConfig = ref({
  useBaiduApi: false,
  apiKey: '',
  secretKey: ''
})

const currentDialect = computed(() => getDialectById(selectedDialect.value))
const commonPhrases = computed(() => currentDialect.value?.commonPhrases || [])

const currentVoiceInfo = computed(() => {
  if (currentVoiceName.value) {
    return {
      name: currentVoiceName.value,
      lang: currentVoiceLang.value
    }
  }
  return null
})

const availableVoices = computed(() => {
  const dialectLangs: Record<string, string[]> = {
    cantonese: ['zh-HK', 'yue', 'zh-Hant'],
    shanghainese: ['zh-CN'],
    sichuanese: ['zh-CN'],
    hokkien: ['zh-TW', 'zh-Hant'],
    hunanese: ['zh-CN'],
    shandongese: ['zh-CN']
  }
  const langs = dialectLangs[selectedDialect.value] || ['zh-CN']
  return allVoices.value.filter(v => 
    langs.some(lang => v.lang.toLowerCase().startsWith(lang.toLowerCase().split('-')[0]))
  )
})

function onVoiceSelectChange() {
  if (selectedVoiceName.value) {
    const voice = allVoices.value.find(v => v.name === selectedVoiceName.value)
    if (voice) {
      currentVoiceName.value = voice.name
      currentVoiceLang.value = voice.lang
    }
  } else {
    updateAutoSelectedVoice()
  }
}

function updateAutoSelectedVoice() {
  const voice = getBestVoiceForDialect(selectedDialect.value)
  if (voice) {
    currentVoiceName.value = voice.name
    currentVoiceLang.value = voice.lang
  }
}

function handleConvert() {
  if (!inputText.value.trim()) {
    convertedResult.value = ''
    annotations.value = []
    return
  }
  const { result, annotations: annos } = convertToDialect(inputText.value, selectedDialect.value)
  convertedResult.value = result
  annotations.value = annos
}

function clearInput() {
  inputText.value = ''
  convertedResult.value = ''
  annotations.value = []
  stopSpeaking()
}

async function copyResult() {
  if (!convertedResult.value) return
  await navigator.clipboard.writeText(convertedResult.value)
  showToastMessage('已复制到剪贴板')
}

function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

async function speakDialect() {
  if (!convertedResult.value || isSpeaking.value) return

  stopSpeaking()

  if (apiConfig.value.useBaiduApi && apiConfig.value.apiKey && apiConfig.value.secretKey) {
    await speakWithBaiduApi()
  } else {
    speakWithBrowser()
  }
}

function speakWithBrowser() {
  isSpeaking.value = true
  
  const onEnd = () => {
    isSpeaking.value = false
  }
  
  const onError = (error: any) => {
    console.error('浏览器语音合成失败:', error)
    isSpeaking.value = false
    showToastMessage('浏览器语音合成失败，建议配置百度语音API')
  }

  let usedVoice: SpeechSynthesisVoice | null = null

  if (selectedVoiceName.value) {
    const voiceOption = allVoices.value.find(v => v.name === selectedVoiceName.value)
    if (voiceOption) {
      usedVoice = voiceOption.voice
    }
  } else {
    usedVoice = getBestVoiceForDialect(selectedDialect.value)
  }

  if (usedVoice) {
    currentVoiceName.value = usedVoice.name
    currentVoiceLang.value = usedVoice.lang
    console.log(`[Page] 使用语音: ${usedVoice.name} (${usedVoice.lang})`)
    
    const utterance = new SpeechSynthesisUtterance(convertedResult.value)
    utterance.voice = usedVoice
    
    const dialectConfigs: Record<string, { rate: number; pitch: number; lang: string }> = {
      cantonese: { rate: 0.75, pitch: 1.15, lang: 'zh-HK' },
      shanghainese: { rate: 0.8, pitch: 1.1, lang: 'zh-CN' },
      sichuanese: { rate: 0.85, pitch: 0.95, lang: 'zh-CN' },
      hokkien: { rate: 0.78, pitch: 1.05, lang: 'zh-TW' },
      hunanese: { rate: 0.85, pitch: 1.0, lang: 'zh-CN' },
      shandongese: { rate: 0.82, pitch: 0.98, lang: 'zh-CN' }
    }
    
    const config = dialectConfigs[selectedDialect.value] || { rate: 0.85, pitch: 1, lang: 'zh-CN' }
    utterance.rate = config.rate
    utterance.pitch = config.pitch
    utterance.lang = config.lang
    utterance.volume = 1
    
    utterance.onend = onEnd
    utterance.onerror = onError
    window.speechSynthesis.speak(utterance)
  } else {
    browserSpeak(convertedResult.value, selectedDialect.value, onEnd, onError)
  }
}

async function speakWithBaiduApi() {
  isLoadingAudio.value = true
  
  try {
    const response = await $fetch('/api/speech', {
      query: {
        text: convertedResult.value,
        dialect: selectedDialect.value,
        apiKey: apiConfig.value.apiKey,
        secretKey: apiConfig.value.secretKey
      }
    })

    const data = response as any

    if (data.success && data.audioUrl) {
      if (audioPlayer.value) {
        audioPlayer.value.src = data.audioUrl
        await audioPlayer.value.play()
        isSpeaking.value = true
      }
    } else {
      showToastMessage(data.error || '语音合成失败，使用浏览器语音')
      speakWithBrowser()
    }
  } catch (error: any) {
    console.error('百度语音API调用失败:', error)
    showToastMessage('百度语音API调用失败，使用浏览器语音')
    speakWithBrowser()
  } finally {
    isLoadingAudio.value = false
  }
}

function stopSpeaking() {
  stopBrowserSpeech()
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
  isSpeaking.value = false
  isLoadingAudio.value = false
}

function onAudioEnded() {
  isSpeaking.value = false
}

function onAudioError() {
  isSpeaking.value = false
  isLoadingAudio.value = false
  showToastMessage('语音播放失败')
}

watch(selectedDialect, () => {
  if (inputText.value) {
    handleConvert()
  }
  if (!selectedVoiceName.value) {
    updateAutoSelectedVoice()
  }
})

watch(voicesReady, (ready) => {
  if (ready && !selectedVoiceName.value) {
    updateAutoSelectedVoice()
  }
})

onMounted(() => {
  loadVoices()
  if (voicesReady.value) {
    updateAutoSelectedVoice()
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
