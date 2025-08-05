import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, MapPin, Navigation, Brain, Globe } from 'lucide-react'
import useVoskRecognition from '../hooks/useVoskRecognition'
import useCoquiTTS from '../hooks/useCoquiTTS'
import useBluetoothAudio from '../hooks/useBluetoothAudio'

const VoiceAssistant = ({ isActive, setIsActive }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentCommand, setCurrentCommand] = useState('')
  const [response, setResponse] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [location, setLocation] = useState(null)
  const [navigationMode, setNavigationMode] = useState(false)
  const [route, setRoute] = useState(null)
  const [language, setLanguage] = useState('en-US')
  const [tone, setTone] = useState('friendly')

  const {
    startListening,
    stopListening,
    transcript,
    isListening: voiceListening,
    error: recognitionError,
    isModelLoaded: recognitionLoaded
  } = useVoskRecognition(language)

  const {
    speak,
    speakWithTranslation,
    stopSpeaking,
    isSpeaking: voiceSpeaking,
    error: synthesisError,
    isModelLoaded: synthesisLoaded,
    availableVoices,
    selectedVoice,
    changeVoice
  } = useCoquiTTS(language, tone)

  const {
    isConnected: bluetoothConnected,
    deviceName,
    connectToBluetooth,
    disconnectBluetooth,
    speakThroughBluetooth,
    error: bluetoothError
  } = useBluetoothAudio()

  // Handle voice recognition
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setCurrentCommand(transcript)
      processCommand(transcript)
    }
  }, [transcript])

  // Handle voice synthesis
  useEffect(() => {
    setIsSpeaking(voiceSpeaking)
  }, [voiceSpeaking])

  // Handle listening state
  useEffect(() => {
    setIsListening(voiceListening)
  }, [voiceListening])

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  const processCommand = async (command) => {
    const lowerCommand = command.toLowerCase()
    
    // Add to history
    setCommandHistory(prev => [...prev, { command, timestamp: new Date() }])

    try {
      // Navigation commands
      if (lowerCommand.includes('take me to') || lowerCommand.includes('navigate to')) {
        const destination = command.replace(/take me to|navigate to/gi, '').trim()
        await handleNavigation(destination)
        return
      }

      // Stop commands
      if (lowerCommand.includes('stop') || lowerCommand.includes('cancel')) {
        stopSpeaking()
        setNavigationMode(false)
        const responseText = language === 'te-IN' ? 'నిలిపి వేసాను. మరేమైనా సహాయం చేయగలనా?' : 'Stopped. How else can I help?'
        setResponse(responseText)
        await speakWithTranslation(responseText)
        return
      }

      // Language switch commands
      if (lowerCommand.includes('switch to telugu') || lowerCommand.includes('telugu మాట్లాడు')) {
        setLanguage('te-IN')
        const responseText = 'తెలుగులో మాట్లాడుతున్నాను'
        setResponse(responseText)
        await speak(responseText, { lang: 'te-IN' })
        return
      }

      if (lowerCommand.includes('switch to english') || lowerCommand.includes('english మాట్లాడు')) {
        setLanguage('en-US')
        const responseText = 'Now speaking in English'
        setResponse(responseText)
        await speak(responseText)
        return
      }

      // Tone change commands
      if (lowerCommand.includes('friendly tone')) {
        setTone('friendly')
        const responseText = language === 'te-IN' ? 'స్నేహపూర్వక ధోరణిలో మాట్లాడుతున్నాను' : 'Now speaking in a friendly tone'
        setResponse(responseText)
        await speakWithTranslation(responseText)
        return
      }

      if (lowerCommand.includes('strict tone')) {
        setTone('strict')
        const responseText = language === 'te-IN' ? 'కఠినమైన ధోరణిలో మాట్లాడుతున్నాను' : 'Now speaking in a strict tone'
        setResponse(responseText)
        await speakWithTranslation(responseText)
        return
      }

      // General questions - send to backend
      const response = await fetch('/api/assistant/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          location,
          context: { navigationMode, currentRoute: route, language }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResponse(data.response)
        
        // Speak through Bluetooth if connected, otherwise normal
        if (bluetoothConnected) {
          await speakThroughBluetooth(data.response)
        } else {
          await speakWithTranslation(data.response)
        }
      } else {
        throw new Error('Failed to process command')
      }
    } catch (error) {
      console.error('Error processing command:', error)
      const errorText = language === 'te-IN' ? 'క్షమించండి, ఒక లోపం జరిగింది. మళ్లీ ప్రయత్నించండి.' : 'Sorry, I encountered an error. Please try again.'
      setResponse(errorText)
      await speakWithTranslation(errorText)
    }
  }

  const handleNavigation = async (destination) => {
    setNavigationMode(true)
    const startText = language === 'te-IN' 
      ? `${destination}కి నావిగేషన్ ప్రారంభిస్తున్నాను...`
      : `Starting navigation to ${destination}...`
    setResponse(startText)
    await speakWithTranslation(startText)

    try {
      // Get route from backend
      const response = await fetch('/api/navigation/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: location,
          destination
        })
      })

      if (response.ok) {
        const routeData = await response.json()
        setRoute(routeData)
        
        // Start turn-by-turn navigation
        startTurnByTurnNavigation(routeData)
      }
    } catch (error) {
      console.error('Navigation error:', error)
      const errorText = language === 'te-IN' 
        ? 'క్షమించండి, ఆ గమ్యానికి మార్గం కనుగొనలేకపోయాను.'
        : 'Sorry, I could not find a route to that destination.'
      setResponse(errorText)
      await speakWithTranslation(errorText)
    }
  }

  const startTurnByTurnNavigation = (routeData) => {
    // Simulate turn-by-turn navigation
    const steps = routeData.steps || []
    let currentStep = 0

    const speakNextDirection = async () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep]
        const instruction = step.instruction || `Continue for ${step.distance}`
        
        if (bluetoothConnected) {
          await speakThroughBluetooth(instruction)
        } else {
          await speakWithTranslation(instruction)
        }
        currentStep++
      }
    }

    // Speak first direction
    speakNextDirection()

    // Set up interval for continuous navigation
    const navigationInterval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(navigationInterval)
        setNavigationMode(false)
        const endText = language === 'te-IN' ? 'మీరు మీ గమ్యానికి చేరుకున్నారు.' : 'You have reached your destination.'
        speakWithTranslation(endText)
      } else {
        speakNextDirection()
      }
    }, 30000) // Check every 30 seconds
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const toggleLanguage = () => {
    const newLanguage = language === 'en-US' ? 'te-IN' : 'en-US'
    setLanguage(newLanguage)
    const message = newLanguage === 'te-IN' ? 'తెలుగులో మాట్లాడుతున్నాను' : 'Now speaking in English'
    speakWithTranslation(message)
  }

  const toggleTone = () => {
    const tones = ['friendly', 'polite', 'strict']
    const currentIndex = tones.indexOf(tone)
    const newTone = tones[(currentIndex + 1) % tones.length]
    setTone(newTone)
    
    const toneMessages = {
      friendly: { en: 'Friendly tone activated', te: 'స్నేహపూర్వక ధోరణి ప్రారంభించాను' },
      polite: { en: 'Polite tone activated', te: 'మర్యాదపూర్వక ధోరణి ప్రారంభించాను' },
      strict: { en: 'Strict tone activated', te: 'కఠినమైన ధోరణి ప్రారంభించాను' }
    }
    
    const message = language === 'te-IN' ? toneMessages[newTone].te : toneMessages[newTone].en
    speakWithTranslation(message)
  }

  return (
    <div className="space-y-6">
      {/* Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span className="text-white font-medium">Assistant Status</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            {isActive ? 'Active and listening' : 'Inactive'}
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
            <span className="text-white font-medium">Voice Recognition</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            {isListening ? 'Listening...' : 'Not listening'}
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${navigationMode ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
            <span className="text-white font-medium">Navigation</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            {navigationMode ? 'Active' : 'Inactive'}
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${bluetoothConnected ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
            <span className="text-white font-medium">Bluetooth</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            {bluetoothConnected ? deviceName : 'Not connected'}
          </p>
        </div>
      </div>

      {/* Language and Tone Controls */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          {language === 'en-US' ? 'Switch to Telugu' : 'Switch to English'}
        </button>

        <button
          onClick={toggleTone}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Volume2 className="w-4 h-4" />
          {tone.charAt(0).toUpperCase() + tone.slice(1)} Tone
        </button>

        {!bluetoothConnected ? (
          <button
            onClick={connectToBluetooth}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Connect Bluetooth
          </button>
        ) : (
          <button
            onClick={disconnectBluetooth}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Disconnect Bluetooth
          </button>
        )}
      </div>

      {/* Main Voice Interface */}
      <div className="flex flex-col items-center space-y-6">
        {/* Voice Button */}
        <button
          onClick={toggleListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-blue-500 scale-110 listening' 
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          {isListening ? (
            <Mic className="w-8 h-8 text-white" />
          ) : (
            <MicOff className="w-8 h-8 text-white" />
          )}
        </button>

        {/* Current Command Display */}
        {currentCommand && (
          <div className="bg-white/10 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-white font-medium mb-2">Current Command:</h3>
            <p className="text-gray-300">{currentCommand}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-white/10 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-white font-medium mb-2">Assistant Response:</h3>
            <p className="text-gray-300">{response}</p>
          </div>
        )}

        {/* Error Display */}
        {(recognitionError || synthesisError || bluetoothError) && (
          <div className="bg-red-500/20 rounded-lg p-4 w-full max-w-md border border-red-500/50">
            <h3 className="text-red-400 font-medium mb-2">Error:</h3>
            <p className="text-red-300">
              {recognitionError || synthesisError || bluetoothError}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => processCommand('What is the weather like?')}
          className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors"
        >
          <div className="flex flex-col items-center space-y-2">
            <Brain className="w-6 h-6 text-blue-400" />
            <span className="text-white text-sm">Ask Question</span>
          </div>
        </button>

        <button
          onClick={() => processCommand('Take me to the nearest coffee shop')}
          className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors"
        >
          <div className="flex flex-col items-center space-y-2">
            <Navigation className="w-6 h-6 text-green-400" />
            <span className="text-white text-sm">Navigate</span>
          </div>
        </button>

        <button
          onClick={() => processCommand('Stop all activities')}
          className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors"
        >
          <div className="flex flex-col items-center space-y-2">
            <VolumeX className="w-6 h-6 text-red-400" />
            <span className="text-white text-sm">Stop</span>
          </div>
        </button>

        <button
          onClick={() => processCommand('What time is it?')}
          className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors"
        >
          <div className="flex flex-col items-center space-y-2">
            <MapPin className="w-6 h-6 text-purple-400" />
            <span className="text-white text-sm">Time</span>
          </div>
        </button>
      </div>
    </div>
  )
}

export default VoiceAssistant 