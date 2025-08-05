import { useState, useEffect, useRef } from 'react'

const useVoiceSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState(null)
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const synthesisRef = useRef(null)

  useEffect(() => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis is not supported in this browser')
      return
    }

    synthesisRef.current = window.speechSynthesis

    // Load available voices
    const loadVoices = () => {
      const voices = synthesisRef.current.getVoices()
      setAvailableVoices(voices)
      
      // Select a default voice (preferably English)
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.default
      ) || voices[0]
      
      setSelectedVoice(englishVoice)
    }

    // Load voices when they become available
    if (synthesisRef.current.getVoices().length > 0) {
      loadVoices()
    } else {
      synthesisRef.current.onvoiceschanged = loadVoices
    }

    // Cleanup
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
    }
  }, [])

  const speak = (text, options = {}) => {
    if (!synthesisRef.current) {
      setError('Speech synthesis not available')
      return
    }

    try {
      // Cancel any ongoing speech
      synthesisRef.current.cancel()

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure utterance
      utterance.voice = options.voice || selectedVoice
      utterance.rate = options.rate || 1.0
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 1.0
      utterance.lang = options.lang || 'en-US'

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
      synthesisRef.current.speak(utterance)
    } catch (error) {
      setError(`Failed to speak: ${error.message}`)
    }
  }

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const pauseSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.pause()
    }
  }

  const resumeSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.resume()
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

  return {
    isSpeaking,
    error,
    availableVoices,
    selectedVoice,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    changeVoice,
    changeRate,
    changePitch
  }
}

export default useVoiceSynthesis 