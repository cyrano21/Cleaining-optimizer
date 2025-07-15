'use client'

import { useJobs } from '../utils/jobs-context'
import { JobListing } from '../utils/types'
import { useState } from 'react'

interface JobCardProps {
  job: JobListing
}

export default function JobCard({ job }: JobCardProps) {
  const { toggleFavorite, evaluateJobMatch } = useJobs()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date)
  }
  
  const handleEvaluateMatch = async () => {
    if (!job.matchScore) {
      setIsEvaluating(true)
      try {
        await evaluateJobMatch(job.id!)
      } finally {
        setIsEvaluating(false)
      }
    }
  }
  
  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-200'
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'CDI'
      case 'part-time': return 'Temps partiel'
      case 'freelance': return 'Freelance'
      case 'internship': return 'Stage'
      case 'apprenticeship': return 'Alternance'
      default: return type
    }
  }
  
  const getRemoteLabel = (remote: string) => {
    switch (remote) {
      case 'no': return 'Sur site'
      case 'hybrid': return 'Hybride'
      case 'full': return '100% télétravail'
      default: return remote
    }
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col sm:flex-row gap-4 relative group">
      {/* Logo (placeholder) */}
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 font-bold text-xl">
        {job.company?.charAt(0) || 'C'}
      </div>

      {/* Informations principales */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-blue-700 mb-1">
          {job.title}
        </h3>
        <p className="text-sm text-gray-700 mb-1">{job.company} • {job.location}</p>
        
        {/* Tags et badges */}
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {getContractTypeLabel(job.contractType)}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {getRemoteLabel(job.remote)}
          </span>
          {job.salary && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {job.salary}
            </span>
          )}
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            Publié le {formatDate(job.postedDate)}
          </span>
        </div>
        
        {/* Description */}
        <div className="mt-3">
          <div className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-3'}`}>
            {job.description}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Voir moins' : 'Voir plus'}
          </button>
        </div>
      </div>

      {/* Informations secondaires et Actions */}
      <div className="flex-shrink-0 flex flex-col items-end justify-between">
        {/* Score de correspondance */}
        {job.matchScore !== undefined && (
          <div className="flex items-center mb-3">
            <div 
              className={`w-10 h-10 rounded-full ${getMatchScoreColor(job.matchScore)} flex items-center justify-center text-white font-bold`}
            >
              {job.matchScore}
            </div>
          </div>
        )}
        
        {/* Bouton favori */}
        <button
          onClick={() => toggleFavorite(job.id!)}
          className="text-gray-400 hover:text-yellow-500 mb-3"
          aria-label={job.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {job.isFavorite ? (
            <span className="text-yellow-500 text-xl">★</span>
          ) : (
            <span className="text-xl">☆</span>
          )}
        </button>
        
        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          {!job.matchScore && (
            <button
              onClick={handleEvaluateMatch}
              disabled={isEvaluating}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-md hover:bg-indigo-200 whitespace-nowrap"
            >
              {isEvaluating ? 'Évaluation...' : 'Évaluer'}
            </button>
          )}
          
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 text-center"
          >
            Postuler
          </a>
        </div>
      </div>
    </div>
  )
}
