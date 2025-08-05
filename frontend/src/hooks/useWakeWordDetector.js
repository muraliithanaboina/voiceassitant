import { useState, useEffect, useRef } from 'react'

const useWakeWordDetector = (wakeWord = 'hey buddy') => {
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  let wakeWordLower = wakeWord.toLowerCase()

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser')
      return
    }

    // Initialize speech recognition for wake word detection
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    const recognition = recognitionRef.current

    // Configure recognition settings for wake word detection
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    // Event handlers
    recognition.onstart = () => {
      setIsDetecting(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsDetecting(false)
      // Restart recognition if it was stopped unexpectedly
      if (isDetecting) {
        setTimeout(() => {
          try {
            recognition.start()
          } catch (error) {
            console.error('Failed to restart wake word detection:', error)
          }
        }, 100)
      }
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Check for wake word in both final and interim results
      const allText = (finalTranscript + ' ' + interimTranscript).toLowerCase()
      
      if (allText.includes(wakeWordLower)) {
        setIsWakeWordDetected(true)
        // Stop recognition temporarily to prevent multiple triggers
        recognition.stop()
        
        // Reset after a short delay
        setTimeout(() => {
          setIsWakeWordDetected(false)
          try {
            recognition.start()
          } catch (error) {
            console.error('Failed to restart wake word detection:', error)
          }
        }, 2000)
      }
    }

    recognition.onerror = (event) => {
      setError(`Wake word detection error: ${event.error}`)
      setIsDetecting(false)
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [wakeWordLower])

  const startWakeWordDetection = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsDetecting(true)
      } catch (error) {
        setError(`Failed to start wake word detection: ${error.message}`)
      }
    }
  }

  const stopWakeWordDetection = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        setIsDetecting(false)
      } catch (error) {
        setError(`Failed to stop wake word detection: ${error.message}`)
      }
    }
  }

  const changeWakeWord = (newWakeWord) => {
    // This would require reinitializing the recognition
    // For now, we'll just update the state
    wakeWordLower = newWakeWord.toLowerCase()
  }

  return {
    isWakeWordDetected,
    isDetecting,
    error,
    startWakeWordDetection,
    stopWakeWordDetection,
    changeWakeWord
  }
}

export default useWakeWordDetector 