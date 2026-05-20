import { defineEventHandler, getQuery } from 'h3'

const BAIDU_TTS_URL = 'https://tsn.baidu.com/text2audio'

const dialectVoiceMap: Record<string, {
  per: number
  spd?: number
  pit?: number
  lang?: string
}> = {
  cantonese: { per: 1003, spd: 5, pit: 5, lang: 'zh' },
  shanghainese: { per: 5, spd: 5, pit: 4, lang: 'zh' },
  sichuanese: { per: 6, spd: 5, pit: 5, lang: 'zh' },
  hokkien: { per: 5003, spd: 5, pit: 5, lang: 'zh' },
  hunanese: { per: 5, spd: 5, pit: 5, lang: 'zh' },
  shandongese: { per: 5, spd: 5, pit: 5, lang: 'zh' },
  mandarin: { per: 0, spd: 5, pit: 5, lang: 'zh' }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const text = query.text as string
  const dialect = (query.dialect as string) || 'mandarin'
  const apiKey = query.apiKey as string
  const secretKey = query.secretKey as string

  if (!text) {
    return {
      success: false,
      error: '请输入要朗读的文本'
    }
  }

  if (!apiKey || !secretKey) {
    return {
      success: false,
      error: '请配置百度语音API密钥',
      useFallback: true
    }
  }

  try {
    const config = dialectVoiceMap[dialect] || dialectVoiceMap.mandarin

    const tokenResponse = await $fetch('https://aip.baidubce.com/oauth/2.0/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: secretKey
      })
    })

    const tokenData = tokenResponse as any
    if (!tokenData.access_token) {
      return {
        success: false,
        error: '获取Access Token失败',
        useFallback: true
      }
    }

    const params = new URLSearchParams({
      tex: encodeURIComponent(text),
      tok: tokenData.access_token,
      cuid: 'dialect_converter_' + Date.now(),
      ctp: '1',
      lan: config.lang || 'zh',
      spd: String(config.spd || 5),
      pit: String(config.pit || 5),
      vol: '5',
      per: String(config.per || 0),
      aue: '3'
    })

    const audioResponse = await $fetch(`${BAIDU_TTS_URL}?${params.toString()}`, {
      responseType: 'arrayBuffer'
    })

    const audioBase64 = Buffer.from(audioResponse as ArrayBuffer).toString('base64')

    return {
      success: true,
      audioUrl: `data:audio/mp3;base64,${audioBase64}`
    }

  } catch (error: any) {
    console.error('语音合成失败:', error)
    return {
      success: false,
      error: error.message || '语音合成失败',
      useFallback: true
    }
  }
})
