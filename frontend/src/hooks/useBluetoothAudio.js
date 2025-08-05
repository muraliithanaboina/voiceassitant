import { useState, useEffect, useRef } from 'react'

const useBluetoothAudio = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [error, setError] = useState(null)
  const [audioContext, setAudioContext] = useState(null)
  const [bluetoothDevice, setBluetoothDevice] = useState(null)
  const [audioDestination, setAudioDestination] = useState(null)

  const connectToBluetooth = async () => {
    if (!navigator.bluetooth) {
      setError('Bluetooth is not supported in this browser')
      return
    }

    try {
      setIsConnecting(true)
      setError(null)

      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access', 'audio_sink']
      })

      setBluetoothDevice(device)
      setDeviceName(device.name || 'Unknown Device')

      // Connect to GATT server
      const server = await device.gatt.connect()
      
      // Get audio service
      const audioService = await server.getPrimaryService('audio_sink')
      
      // Create audio context for Bluetooth
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      setAudioContext(audioCtx)

      // Create audio destination for Bluetooth
      const destination = audioCtx.createMediaStreamDestination()
      setAudioDestination(destination)

      setIsConnected(true)
      setIsConnecting(false)

      // Handle device disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false)
        setDeviceName('')
        setAudioContext(null)
        setAudioDestination(null)
        setBluetoothDevice(null)
      })

    } catch (error) {
      console.error('Bluetooth connection error:', error)
      setError(`Failed to connect: ${error.message}`)
      setIsConnecting(false)
    }
  }

  const disconnectBluetooth = () => {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect()
    }
    
    if (audioContext) {
      audioContext.close()
    }

    setIsConnected(false)
    setDeviceName('')
    setAudioContext(null)
    setAudioDestination(null)
    setBluetoothDevice(null)
  }

  const playAudioThroughBluetooth = async (audioBuffer) => {
    if (!isConnected || !audioContext || !audioDestination) {
      setError('Not connected to Bluetooth device')
      return
    }

    try {
      // Create audio source from buffer
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      
      // Connect to Bluetooth destination
      source.connect(audioDestination)
      
      // Play audio
      source.start(0)
      
    } catch (error) {
      console.error('Failed to play audio through Bluetooth:', error)
      setError(`Failed to play audio: ${error.message}`)
    }
  }

  const speakThroughBluetooth = async (text, options = {}) => {
    if (!isConnected) {
      setError('Not connected to Bluetooth device')
      return
    }

    try {
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate || 1.0
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 1.0

      // Route audio through Bluetooth
      if (audioDestination) {
        // Create media stream from speech synthesis
        const stream = new MediaStream()
        const track = new MediaStreamTrack()
        stream.addTrack(track)
        
        // Connect to Bluetooth destination
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(audioDestination)
      }

      utterance.onstart = () => console.log('Speaking through Bluetooth')
      utterance.onend = () => console.log('Finished speaking')
      utterance.onerror = (event) => {
        setError(`Speech error: ${event.error}`)
      }

      speechSynthesis.speak(utterance)

    } catch (error) {
      console.error('Failed to speak through Bluetooth:', error)
      setError(`Failed to speak: ${error.message}`)
    }
  }

  const getAvailableDevices = async () => {
    if (!navigator.bluetooth) {
      return []
    }

    try {
      // Get previously paired devices
      const devices = await navigator.bluetooth.getAvailability()
      return devices
    } catch (error) {
      console.error('Failed to get available devices:', error)
      return []
    }
  }

  const isBluetoothSupported = () => {
    return 'bluetooth' in navigator
  }

  const isBluetoothAvailable = async () => {
    if (!isBluetoothSupported()) {
      return false
    }

    try {
      return await navigator.bluetooth.getAvailability()
    } catch (error) {
      return false
    }
  }

  return {
    isConnected,
    isConnecting,
    deviceName,
    error,
    audioContext,
    audioDestination,
    connectToBluetooth,
    disconnectBluetooth,
    playAudioThroughBluetooth,
    speakThroughBluetooth,
    getAvailableDevices,
    isBluetoothSupported,
    isBluetoothAvailable
  }
}

export default useBluetoothAudio 