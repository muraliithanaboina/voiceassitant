import { useState, useEffect, useRef } from 'react'

const useCoquiTTS = (language = 'en-US', tone = 'friendly') => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)

  useEffect(() => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis is not supported in this browser')
      return
    }

    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
      
      // Select a voice based on language
      let preferredVoice = null
      if (language === 'te-IN') {
        // Try to find a Telugu voice
        preferredVoice = voices.find(voice => 
          voice.lang.startsWith('te') || voice.lang.startsWith('hi')
        ) || voices.find(voice => voice.lang.startsWith('en'))
      } else {
        // Find English voice
        preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.default
        ) || voices.find(voice => voice.lang.startsWith('en'))
      }
      
      setSelectedVoice(preferredVoice || voices[0])
      setIsModelLoaded(true)
      setError(null)
    }

    // Load voices when they become available
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices()
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [language])

  const speak = async (text, options = {}) => {
    if (!isModelLoaded) {
      setError('Speech synthesis not available')
      return
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure utterance
      utterance.voice = options.voice || selectedVoice
      utterance.rate = options.rate || 1.0
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 1.0
      utterance.lang = options.lang || language

      // Apply tone modifications
      const toneModifications = getToneModifications(tone)
      utterance.rate *= toneModifications.rate
      utterance.pitch *= toneModifications.pitch

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true)
        setError(null)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = (event) => {
        setError(`Speech synthesis error: ${event.error}`)
        setIsSpeaking(false)
      }

      // Speak
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      setError(`Failed to speak: ${error.message}`)
    }
  }

  const getToneModifications = (tone) => {
    switch (tone) {
      case 'friendly':
        return { rate: 1.0, pitch: 1.1 } // Slightly higher pitch
      case 'polite':
        return { rate: 0.9, pitch: 1.0 } // Slower, normal pitch
      case 'strict':
        return { rate: 1.1, pitch: 0.9 } // Faster, lower pitch
      default:
        return { rate: 1.0, pitch: 1.0 }
    }
  }

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const pauseSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause()
    }
  }

  const resumeSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume()
    }
  }

  const changeVoice = (voice) => {
    setSelectedVoice(voice)
  }

  const changeRate = (rate) => {
    // This would need to be applied to the next utterance
    // For now, we'll store it in a ref or state
  }

  const changePitch = (pitch) => {
    // This would need to be applied to the next utterance
    // For now, we'll store it in a ref or state
  }

  // Telugu navigation phrases
  const teluguPhrases = {
    'take left': 'ఎడమవైపు తీసుకో',
    'take right': 'కుడివైపు తీసుకో',
    'go straight': 'ముందుకు వెళ్లు',
    'stop': 'నిలిపి వేయి',
    'turn around': 'తిరిగి వెళ్లు',
    'destination reached': 'గమ్యం చేరుకున్నారు',
    'wrong turn': 'తప్పు మలుపు',
    'recalculating route': 'మార్గం తిరిగి లెక్కిస్తున్నాను',
    'hello': 'నమస్కారం',
    'thank you': 'ధన్యవాదాలు',
    'okay': 'సరే',
    'yes': 'అవును',
    'no': 'లేదు'
  }

  const translateToTelugu = (englishText) => {
    const lowerText = englishText.toLowerCase()
    for (const [english, telugu] of Object.entries(teluguPhrases)) {
      if (lowerText.includes(english)) {
        return telugu
      }
    }
    return englishText
  }

  const speakWithTranslation = async (text, options = {}) => {
    if (language === 'te-IN') {
      const teluguText = translateToTelugu(text)
      await speak(teluguText, options)
    } else {
      await speak(text, options)
    }
  }

  return {
    isSpeaking,
    error,
    isModelLoaded,
    availableVoices,
    selectedVoice,
    speak,
    speakWithTranslation,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    changeVoice,
    changeRate,
    changePitch
  }
}

export default useCoquiTTS 