import React from 'react'
import VoiceAssistant from './components/VoiceAssistant'
import NavigationMap from './components/NavigationMap'
import CommandHistory from './components/CommandHistory'
import Settings from './components/Settings'
import { useState } from 'react'

function App() {
  const [currentView, setCurrentView] = useState('assistant')
  const [isAssistantActive, setIsAssistantActive] = useState(false)

  const views = {
    assistant: <VoiceAssistant isActive={isAssistantActive} setIsActive={setIsAssistantActive} />,
    map: <NavigationMap />,
    history: <CommandHistory />,
    settings: <Settings />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🧠</span>
              </div>
              <h1 className="text-xl font-bold text-white">SmartRoute Buddy</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-4">
              {Object.keys(views).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === view
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          {views[currentView]}
        </div>
      </main>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-4 right-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isAssistantActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span>{isAssistantActive ? 'Assistant Active' : 'Assistant Inactive'}</span>
            </div>
            <div className="text-xs">
              Say "Hey Buddy" to activate
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 