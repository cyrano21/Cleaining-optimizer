'use client'

import { useEffect, useState } from 'react'
import { useGeolocation } from '../utils/geolocation-context'
import { GeoLocation, JobWithLocation } from '../utils/types'
import { useJsApiLoader, GoogleMap, MarkerF, CircleF } from '@react-google-maps/api'
import { useUser } from '@clerk/nextjs'

// Composant pour simuler l'intégration de Google Maps
export default function MapComponent() {
  const { 
    homeLocation, 
    selectedJobId,
    searchRadius,
    setHomeLocation,
    selectJob,
    calculateTravelTime,
    getJobsInRadius
  } = useGeolocation()
  const { isSignedIn } = useUser()
  
  const [address, setAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [jobsInRadius, setJobsInRadius] = useState<JobWithLocation[]>([])
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })
  
  // Mettre à jour les emplois dans le rayon lorsque la position ou le rayon change
  useEffect(() => {
    setJobsInRadius(getJobsInRadius())
  }, [homeLocation, searchRadius, getJobsInRadius])
  
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address.trim()) return
    setIsSearching(true)
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0]
        const newLocation: GeoLocation = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          address: result.formatted_address
        }
        setHomeLocation(newLocation)
      } else {
        console.error('Geocoding error', data)
      }
    } catch (error) {
      console.error('Error geocoding address', error)
    } finally {
      setIsSearching(false)
    }
  }
  
  const handleJobClick = async (jobId: string) => {
    selectJob(jobId)
    if (!isSignedIn) {
      alert('Connectez-vous pour voir le temps de trajet.')
      return
    }
    if (homeLocation) {
      await calculateTravelTime(jobId)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Localisation et temps de trajet</h3>
        
        <form onSubmit={handleAddressSearch} className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Entrez votre adresse"
              className="flex-1 p-2 border border-gray-300 rounded-l-md"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </form>
        
        {homeLocation && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium">Votre position :</p>
            <p className="text-sm">{homeLocation.address || `${homeLocation.lat}, ${homeLocation.lng}`}</p>
          </div>
        )}
        
        <div className="w-full h-96 rounded-md mb-4 overflow-hidden">
          {!isLoaded ? (
            <p>Chargement de la carte...</p>
          ) : (
            <GoogleMap
              center={homeLocation ? { lat: homeLocation.lat, lng: homeLocation.lng } : { lat: 48.856614, lng: 2.3522219 }}
              zoom={homeLocation ? 12 : 6}
              mapContainerStyle={{ width: '100%', height: '100%' }}
            >
              {homeLocation && <MarkerF position={{ lat: homeLocation.lat, lng: homeLocation.lng }} />}
              {jobsInRadius.map((job) => (
                <MarkerF key={job.id} position={job.geoLocation} onClick={() => handleJobClick(job.id)} />
              ))}
              {homeLocation && (
                <CircleF
                  center={homeLocation}
                  radius={searchRadius * 1000}
                  options={{ fillColor: '#cce5ff', fillOpacity: 0.2, strokeColor: '#66a3ff' }}
                />
              )}
            </GoogleMap>
          )}
        </div>
      </div>
      
      {/* Liste des emplois avec temps de trajet */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Emplois à proximité</h3>
        
        {jobsInRadius.length > 0 ? (
          <div className="space-y-3">
            {jobsInRadius.map((job) => (
              <div 
                key={job.id} 
                className={`p-3 border rounded-md cursor-pointer ${
                  selectedJobId === job.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleJobClick(job.id)}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                  </div>
                  
                  {job.travelTime && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{job.travelTime.duration.text}</p>
                      <p className="text-xs text-gray-500">{job.travelTime.distance.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">
            {homeLocation 
              ? 'Aucun emploi trouvé dans le rayon de recherche.' 
              : 'Définissez votre position pour voir les emplois à proximité.'}
          </p>
        )}
      </div>
    </div>
  )
}
