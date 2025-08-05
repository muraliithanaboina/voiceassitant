import React, { useState } from 'react'
import { Settings as SettingsIcon, Mic, Volume2, Globe, Bluetooth, Moon, Sun } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    wakeWord: 'hey buddy',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    voiceVolume: 1.0,
    selectedVoice: 'default',
    language: 'en-US',
    bluetoothEnabled: false,
    darkMode: true,
    autoStart: false,
    notifications: true,
    locationTracking: true
  })

  const [availableVoices, setAvailableVoices] = useState([
    { name: 'Default', value: 'default' },
    { name: 'Alex (Male)', value: 'alex' },
    { name: 'Samantha (Female)', value: 'samantha' },
    { name: 'Tom (Male)', value: 'tom' }
  ])

  const [languages] = useState([
    { name: 'English (US)', value: 'en-US' },
    { name: 'English (UK)', value: 'en-GB' },
    { name: 'Spanish', value: 'es-ES' },
    { name: 'French', value: 'fr-FR' },
    { name: 'German', value: 'de-DE' }
  ])

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        'Hello! This is a test of the voice settings.'
      )
      utterance.rate = settings.voiceSpeed
      utterance.pitch = settings.voicePitch
      utterance.volume = settings.voiceVolume
      speechSynthesis.speak(utterance)
    }
  }

  const toggleBluetooth = async () => {
    if (settings.bluetoothEnabled) {
      updateSetting('bluetoothEnabled', false)
    } else {
      try {
        if ('bluetooth' in navigator) {
          const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['generic_access']
          })
          updateSetting('bluetoothEnabled', true)
        } else {
          alert('Bluetooth is not supported in this browser')
        }
      } catch (error) {
        console.error('Bluetooth error:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className="w-6 h-6 text-primary-400" />
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Settings */}
        <div className="space-y-6">
          <div className="bg-white/10 rounded-lg p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-400" />
              Voice Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Wake Word
                </label>
                <input
                  type="text"
                  value={settings.wakeWord}
                  onChange={(e) => updateSetting('wakeWord', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter wake word..."
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Voice Speed
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.voiceSpeed}
                  onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Slow</span>
                  <span>{settings.voiceSpeed}x</span>
                  <span>Fast</span>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Voice Pitch
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.voicePitch}
                  onChange={(e) => updateSetting('voicePitch', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Low</span>
                  <span>{settings.voicePitch}x</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Voice Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.voiceVolume}
                  onChange={(e) => updateSetting('voiceVolume', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Mute</span>
                  <span>{Math.round(settings.voiceVolume * 100)}%</span>
                  <span>Max</span>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Voice Type
                </label>
                <select
                  value={settings.selectedVoice}
                  onChange={(e) => updateSetting('selectedVoice', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {availableVoices.map(voice => (
                    <option key={voice.value} value={voice.value}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={testVoice}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Test Voice
              </button>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="space-y-6">
          <div className="bg-white/10 rounded-lg p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              General Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Dark Mode</h4>
                  <p className="text-gray-400 text-sm">Use dark theme</p>
                </div>
                <button
                  onClick={() => updateSetting('darkMode', !settings.darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? 'bg-primary-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Auto Start</h4>
                  <p className="text-gray-400 text-sm">Start assistant on app launch</p>
                </div>
                <button
                  onClick={() => updateSetting('autoStart', !settings.autoStart)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoStart ? 'bg-primary-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoStart ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Notifications</h4>
                  <p className="text-gray-400 text-sm">Show notification alerts</p>
                </div>
                <button
                  onClick={() => updateSetting('notifications', !settings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-primary-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Location Tracking</h4>
                  <p className="text-gray-400 text-sm">Allow location access</p>
                </div>
                <button
                  onClick={() => updateSetting('locationTracking', !settings.locationTracking)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.locationTracking ? 'bg-primary-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.locationTracking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Bluetooth Settings */}
          <div className="bg-white/10 rounded-lg p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Bluetooth className="w-5 h-5 text-purple-400" />
              Bluetooth Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Bluetooth Audio</h4>
                  <p className="text-gray-400 text-sm">Connect to Bluetooth devices</p>
                </div>
                <button
                  onClick={toggleBluetooth}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.bluetoothEnabled ? 'bg-primary-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.bluetoothEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.bluetoothEnabled && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                  <p className="text-green-400 text-sm">
                    Bluetooth is enabled. Audio will be routed to connected devices.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings 