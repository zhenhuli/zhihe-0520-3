export interface VoiceOption {
  name: string
  lang: string
  localService: boolean
  default: boolean
  voice: SpeechSynthesisVoice
}

export interface SpeechConfig {
  rate: number
  pitch: number
  volume: number
}

const dialectVoiceMap: Record<string, { langs: string[], keywords: string[] }> = {
  cantonese: {
    langs: ['zh-HK', 'yue-HK', 'zh-Hant-HK', 'yue'],
    keywords: ['Hong Kong', 'Cantonese', '粤语', '香港', 'HK']
  },
  shanghainese: {
    langs: ['zh-CN', 'cmn-Hans-CN', 'zh'],
    keywords: ['Chinese', '普通话', '中国', 'Simplified']
  },
  sichuanese: {
    langs: ['zh-CN', 'cmn-Hans-CN', 'zh'],
    keywords: ['Chinese', '普通话', '中国', 'Simplified']
  },
  hokkien: {
    langs: ['zh-TW', 'zh-Hant-TW', 'nan-TW', 'zh-Hant'],
    keywords: ['Taiwan', '台湾', 'Taipei', 'Traditional']
  },
  hunanese: {
    langs: ['zh-CN', 'cmn-Hans-CN', 'zh'],
    keywords: ['Chinese', '普通话', '中国', 'Simplified']
  },
  shandongese: {
    langs: ['zh-CN', 'cmn-Hans-CN', 'zh'],
    keywords: ['Chinese', '普通话', '中国', 'Simplified']
  }
}

const dialectLangCodes: Record<string, string> = {
  cantonese: 'zh-HK',
  hokkien: 'zh-TW',
  shanghainese: 'zh-CN',
  sichuanese: 'zh-CN',
  hunanese: 'zh-CN',
  shandongese: 'zh-CN'
}

let voicesLoaded = false
let voicesCache: VoiceOption[] = []
let availableVoicesCache: Record<string, VoiceOption[]> = {}

export function useSpeech() {
  const voices = ref<VoiceOption[]>([])
  const selectedVoice = ref<SpeechSynthesisVoice | null>(null)
  const isSpeaking = ref(false)
  const isPaused = ref(false)
  const isSupported = ref(false)
  const availableVoicesByDialect = ref<Record<string, VoiceOption[]>>({})
  const voicesReady = ref(false)

  const config = ref<SpeechConfig>({
    rate: 0.85,
    pitch: 1,
    volume: 1
  })

  function loadVoices(force = false) {
    if (!('speechSynthesis' in window)) {
      isSupported.value = false
      return
    }

    isSupported.value = true

    if (voicesLoaded && !force && voicesCache.length > 0) {
      voices.value = voicesCache
      availableVoicesByDialect.value = availableVoicesCache
      voicesReady.value = true
      return
    }

    const allVoices = window.speechSynthesis.getVoices()
    
    if (allVoices.length === 0) {
      setTimeout(() => loadVoices(force), 100)
      return
    }

    voicesCache = allVoices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
      voice
    }))

    voices.value = voicesCache

    for (const dialectId of Object.keys(dialectVoiceMap)) {
      const { langs, keywords } = dialectVoiceMap[dialectId]
      const matchedVoices: VoiceOption[] = []

      for (const voice of voicesCache) {
        const voiceLang = voice.lang.toLowerCase()
        const voiceName = voice.name.toLowerCase()

        let score = 0

        for (const lang of langs) {
          const langLower = lang.toLowerCase()
          if (voiceLang === langLower) {
            score += 100
          } else if (voiceLang.startsWith(langLower.split('-')[0])) {
            score += 50
          }
        }

        for (const keyword of keywords) {
          if (voiceName.includes(keyword.toLowerCase())) {
            score += 30
          }
        }

        if (score > 0) {
          matchedVoices.push({ ...voice, default: score > 50 })
        }
      }

      matchedVoices.sort((a, b) => {
        if (a.localService && !b.localService) return -1
        if (!a.localService && b.localService) return 1
        if (a.default && !b.default) return -1
        if (!a.default && b.default) return 1
        return 0
      })

      availableVoicesCache[dialectId] = matchedVoices
    }

    availableVoicesByDialect.value = availableVoicesCache
    voicesLoaded = true
    voicesReady.value = true
  }

  function getBestVoiceForDialect(dialectId: string): SpeechSynthesisVoice | null {
    if (!voicesLoaded || voicesCache.length === 0) {
      loadVoices(true)
    }

    const available = availableVoicesCache[dialectId]
    if (available && available.length > 0) {
      console.log(`[Speech] 找到 ${available.length} 个 ${dialectId} 语音包，选择: ${available[0].name} (${available[0].lang})`)
      return available[0].voice
    }

    const chineseVoice = voicesCache.find(v => v.lang.toLowerCase().startsWith('zh'))
    if (chineseVoice) {
      console.log(`[Speech] 未找到方言语音包，使用中文语音: ${chineseVoice.name}`)
      return chineseVoice.voice
    }

    if (voicesCache.length > 0) {
      console.log(`[Speech] 使用默认语音: ${voicesCache[0].name}`)
      return voicesCache[0].voice
    }

    console.log(`[Speech] 没有可用语音包`)
    return null
  }

  function speak(text: string, dialectId: string, onEnd?: () => void, onError?: (error: any) => void) {
    if (!isSupported.value) {
      onError?.('浏览器不支持语音合成')
      return
    }

    if (!voicesLoaded) {
      loadVoices(true)
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    const voice = getBestVoiceForDialect(dialectId)
    if (voice) {
      utterance.voice = voice
      console.log(`[Speech] 使用语音: ${voice.name} (${voice.lang})`)
    }

    const dialectConfig = getDialectSpeechConfig(dialectId)
    utterance.rate = dialectConfig.rate
    utterance.pitch = dialectConfig.pitch
    utterance.volume = config.value.volume

    const langCode = dialectLangCodes[dialectId] || 'zh-CN'
    utterance.lang = langCode
    console.log(`[Speech] 语言代码: ${langCode}`)

    utterance.onstart = () => {
      isSpeaking.value = true
      isPaused.value = false
    }

    utterance.onend = () => {
      isSpeaking.value = false
      isPaused.value = false
      onEnd?.()
    }

    utterance.onerror = (event) => {
      console.error('[Speech] 语音合成错误:', event)
      isSpeaking.value = false
      isPaused.value = false
      onError?.(event)
    }

    utterance.onpause = () => {
      isPaused.value = true
    }

    utterance.onresume = () => {
      isPaused.value = false
    }

    window.speechSynthesis.speak(utterance)
  }

  function getDialectSpeechConfig(dialectId: string): { rate: number; pitch: number } {
    const configs: Record<string, { rate: number; pitch: number }> = {
      cantonese: { rate: 0.75, pitch: 1.15 },
      shanghainese: { rate: 0.8, pitch: 1.1 },
      sichuanese: { rate: 0.85, pitch: 0.95 },
      hokkien: { rate: 0.78, pitch: 1.05 },
      hunanese: { rate: 0.85, pitch: 1.0 },
      shandongese: { rate: 0.82, pitch: 0.98 }
    }
    return configs[dialectId] || { rate: 0.85, pitch: 1 }
  }

  function pause() {
    if (isSpeaking.value && !isPaused.value) {
      window.speechSynthesis.pause()
      isPaused.value = true
    }
  }

  function resume() {
    if (isPaused.value) {
      window.speechSynthesis.resume()
      isPaused.value = false
    }
  }

  function stop() {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    isPaused.value = false
  }

  function waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (voicesLoaded && voicesCache.length > 0) {
        resolve()
        return
      }
      const checkVoices = () => {
        if (voicesLoaded && voicesCache.length > 0) {
          resolve()
        } else {
          setTimeout(checkVoices, 100)
        }
      }
      loadVoices()
      checkVoices()
    })
  }

  if (typeof window !== 'undefined') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices(true)
      }
    }
    loadVoices()
  }

  return {
    voices,
    selectedVoice,
    isSpeaking,
    isPaused,
    isSupported,
    availableVoicesByDialect,
    voicesReady,
    config,
    speak,
    pause,
    resume,
    stop,
    getBestVoiceForDialect,
    loadVoices,
    waitForVoices
  }
}
