import { useState, useEffect, useRef } from 'react'

const useVoskRecognition = (language = 'en-US') => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser')
      return
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    const recognition = recognitionRef.current

    // Configure recognition settings
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language === 'te-IN' ? 'te-IN' : 'en-US'

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setIsModelLoaded(true)
    }

    recognition.onend = () => {
      setIsListening(false)
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

      if (finalTranscript) {
        setTranscript(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language])

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        setError(`Failed to start listening: ${error.message}`)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        setError(`Failed to stop listening: ${error.message}`)
      }
    }
  }

  const clearTranscript = () => {
    setTranscript('')
  }

  // Telugu command mapping
  const teluguCommands = {
    'ఎడమవైపు తీసుకో': 'take left',
    'కుడివైపు తీసుకో': 'take right',
    'ముందుకు వెళ్లు': 'go straight',
    'నిలిపి వేయి': 'stop',
    'ఎక్కడికి వెళ్లాలి': 'where to go',
    'మార్గం చూపించు': 'show route',
    'ఎక్కడ ఉన్నావు': 'where am I',
    'నమస్కారం': 'hello',
    'ధన్యవాదాలు': 'thank you',
    'సరే': 'okay',
    'లేదు': 'no',
    'అవును': 'yes'
  }

  const translateTeluguCommand = (teluguText) => {
    const lowerText = teluguText.toLowerCase()
    for (const [telugu, english] of Object.entries(teluguCommands)) {
      if (lowerText.includes(telugu.toLowerCase())) {
        return english
      }
    }
    return teluguText // Return original if no translation found
  }

  const getProcessedTranscript = () => {
    if (language === 'te-IN' && transcript) {
      return translateTeluguCommand(transcript)
    }
    return transcript
  }

  return {
    isListening,
    transcript: getProcessedTranscript(),
    rawTranscript: transcript,
    error,
    isModelLoaded,
    startListening,
    stopListening,
    clearTranscript
  }
}

export default useVoskRecognition 