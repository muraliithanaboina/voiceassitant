import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import { MapPin, Navigation, Route, Clock, Car } from 'lucide-react'
import L from 'leaflet'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const NavigationMap = () => {
  const [currentLocation, setCurrentLocation] = useState([17.3850, 78.4867]) // Default to Hyderabad
  const [destination, setDestination] = useState('')
  const [route, setRoute] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(null)
  const [distance, setDistance] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [destinationCoords, setDestinationCoords] = useState(null)

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [
            position.coords.latitude,
            position.coords.longitude
          ]
          setCurrentLocation(location)
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  const searchDestination = async () => {
    if (!destination.trim()) return

    try {
      // Use OpenRouteService for geocoding
      const response = await fetch(`/api/navigation/geocode?query=${encodeURIComponent(destination)}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates
          setDestinationCoords([coords[1], coords[0]]) // Leaflet uses [lat, lng]
          
          // Get route to destination
          await getRoute(currentLocation, [coords[1], coords[0]])
        }
      }
    } catch (error) {
      console.error('Error searching destination:', error)
    }
  }

  const getRoute = async (origin, destination) => {
    try {
      const response = await fetch('/api/navigation/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: { lat: origin[0], lng: origin[1] },
          destination: { lat: destination[0], lng: destination[1] }
        })
      })

      if (response.ok) {
        const routeData = await response.json()
        setRoute(routeData)
        setEstimatedTime(routeData.duration)
        setDistance(routeData.distance)
        
        // Extract route coordinates for display
        if (routeData.coordinates) {
          setRouteCoordinates(routeData.coordinates)
        }
      }
    } catch (error) {
      console.error('Error getting route:', error)
    }
  }

  const startNavigation = () => {
    if (!route) return
    setIsNavigating(true)
  }

  const stopNavigation = () => {
    setIsNavigating(false)
    setRoute(null)
    setRouteCoordinates([])
    setDestinationCoords(null)
  }

  // Component to update map center when location changes
  const MapUpdater = ({ center }) => {
    const map = useMap()
    useEffect(() => {
      map.setView(center, map.getZoom())
    }, [center, map])
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyPress={(e) => e.key === 'Enter' && searchDestination()}
            />
            <button
              onClick={searchDestination}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {!isNavigating ? (
            <button
              onClick={startNavigation}
              disabled={!route}
              className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Start Navigation
            </button>
          ) : (
            <button
              onClick={stopNavigation}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Route className="w-5 h-5" />
              Stop Navigation
            </button>
          )}
        </div>
      </div>

      {/* Route Information */}
      {route && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Estimated Time</span>
            </div>
            <p className="text-gray-300 text-lg mt-2">{estimatedTime}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Car className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Distance</span>
            </div>
            <p className="text-gray-300 text-lg mt-2">{distance}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Destination</span>
            </div>
            <p className="text-gray-300 text-lg mt-2">{destination}</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative">
        <MapContainer
          center={currentLocation}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          className="rounded-lg border border-white/20"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Current Location Marker */}
          <Marker position={currentLocation}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">Your Location</p>
                <p className="text-sm text-gray-600">
                  {currentLocation[0].toFixed(6)}, {currentLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          {destinationCoords && (
            <Marker position={destinationCoords}>
              <Popup>
                <div className="text-center">
                  <p className="font-medium">Destination</p>
                  <p className="text-sm text-gray-600">{destination}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              color="#3b82f6"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Update map center when location changes */}
          <MapUpdater center={currentLocation} />
        </MapContainer>

        {/* Navigation Status Overlay */}
        {isNavigating && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Navigating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Current Location Display */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <h3 className="text-white font-medium mb-2">Current Location</h3>
        <p className="text-gray-300 text-sm">
          Latitude: {currentLocation[0].toFixed(6)}, Longitude: {currentLocation[1].toFixed(6)}
        </p>
      </div>
    </div>
  )
}

export default NavigationMap 