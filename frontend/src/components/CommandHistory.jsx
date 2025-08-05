import React, { useState } from 'react'
import { History, Clock, MessageCircle, Trash2 } from 'lucide-react'

const CommandHistory = () => {
  const [history, setHistory] = useState([
    {
      id: 1,
      command: 'What is the weather like?',
      response: 'The weather is currently sunny with a temperature of 72°F.',
      timestamp: new Date(Date.now() - 300000),
      type: 'question'
    },
    {
      id: 2,
      command: 'Take me to the nearest coffee shop',
      response: 'I found a Starbucks 0.3 miles away. Starting navigation...',
      timestamp: new Date(Date.now() - 600000),
      type: 'navigation'
    },
    {
      id: 3,
      command: 'What is useEffect in React?',
      response: 'useEffect is a React Hook that lets you perform side effects in function components. It runs after every render and can be used for data fetching, subscriptions, or manually changing the DOM.',
      timestamp: new Date(Date.now() - 900000),
      type: 'question'
    },
    {
      id: 4,
      command: 'Stop navigation',
      response: 'Navigation stopped. How else can I help you?',
      timestamp: new Date(Date.now() - 1200000),
      type: 'control'
    }
  ])

  const [filter, setFilter] = useState('all')

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  const clearHistory = () => {
    setHistory([])
  }

  const deleteItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'question':
        return <MessageCircle className="w-4 h-4 text-blue-400" />
      case 'navigation':
        return <Clock className="w-4 h-4 text-green-400" />
      case 'control':
        return <History className="w-4 h-4 text-purple-400" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'question':
        return 'Question'
      case 'navigation':
        return 'Navigation'
      case 'control':
        return 'Control'
      default:
        return 'Command'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <History className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-bold text-white">Command History</h2>
        </div>
        
        <button
          onClick={clearHistory}
          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['all', 'question', 'navigation', 'control'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-primary-600 text-white'
                : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No commands in history</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(item.type)}
                  <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                    {getTypeLabel(item.type)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {formatTime(item.timestamp)}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">Command:</h4>
                  <p className="text-gray-300 text-sm bg-black/20 rounded p-2">
                    "{item.command}"
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-medium text-sm mb-1">Response:</h4>
                  <p className="text-gray-300 text-sm bg-black/20 rounded p-2">
                    {item.response}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Total Commands</span>
            </div>
            <p className="text-gray-300 text-2xl font-bold mt-2">{history.length}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Questions Asked</span>
            </div>
            <p className="text-gray-300 text-2xl font-bold mt-2">
              {history.filter(item => item.type === 'question').length}
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Navigation Requests</span>
            </div>
            <p className="text-gray-300 text-2xl font-bold mt-2">
              {history.filter(item => item.type === 'navigation').length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommandHistory 