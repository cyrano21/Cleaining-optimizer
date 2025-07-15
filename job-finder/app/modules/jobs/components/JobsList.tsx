'use client'

import { useEffect } from 'react'
import { useJobs } from '../utils/jobs-context'
import JobCard from './JobCard'

export default function JobsList() {
  const { jobs, loading, searchJobs } = useJobs()
  
  // Effectuer une recherche initiale au chargement du composant
  useEffect(() => {
    if (jobs.length === 0) {
      searchJobs()
    }
  }, [jobs, searchJobs])
  
  if (loading) {
    return (
      <div className="p-8 bg-white rounded-lg shadow flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Recherche d&apos;offres d&apos;emploi en cours...</p>
      </div>
    )
  }
  
  if (jobs.length === 0) {
    return (
      <div className="p-8 bg-white rounded-lg shadow text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune offre trouvée</h3>
        <p className="text-gray-600">Essayez de modifier vos critères de recherche pour obtenir plus de résultats.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{jobs.length} offres trouvées</h3>
          <div>
            <select className="p-2 border border-gray-300 rounded-md text-sm">
              <option value="relevance">Pertinence</option>
              <option value="date">Date</option>
              <option value="match">Score de correspondance</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}