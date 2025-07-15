'use client'

import { useGeolocation } from '../utils/geolocation-context'

export default function TravelTimeSettings() {
  const { 
    searchRadius, 
    travelMode, 
    setSearchRadius, 
    setTravelMode 
  } = useGeolocation()
  
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchRadius(parseInt(e.target.value))
  }
  
  const handleModeChange = (mode: 'driving' | 'transit' | 'walking' | 'bicycling') => {
    setTravelMode(mode)
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Paramètres de trajet</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rayon de recherche : {searchRadius} km
          </label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={searchRadius}
            onChange={handleRadiusChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode de transport
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              className={`p-2 border rounded-md flex flex-col items-center ${
                travelMode === 'driving' ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleModeChange('driving')}
            >
              <span className="text-xl">🚗</span>
              <span className="text-sm">Voiture</span>
            </button>
            <button
              className={`p-2 border rounded-md flex flex-col items-center ${
                travelMode === 'transit' ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleModeChange('transit')}
            >
              <span className="text-xl">🚆</span>
              <span className="text-sm">Transport</span>
            </button>
            <button
              className={`p-2 border rounded-md flex flex-col items-center ${
                travelMode === 'walking' ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleModeChange('walking')}
            >
              <span className="text-xl">🚶</span>
              <span className="text-sm">À pied</span>
            </button>
            <button
              className={`p-2 border rounded-md flex flex-col items-center ${
                travelMode === 'bicycling' ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleModeChange('bicycling')}
            >
              <span className="text-xl">🚲</span>
              <span className="text-sm">Vélo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
