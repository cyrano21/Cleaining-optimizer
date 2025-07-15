'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { JobListing, JobSearchFilters, defaultFilters } from './types'
import { JOB_SOURCES, convertSalary } from './countries-config'
import { JobScrapingService } from './job-scraping'
import { AIJobMatchingService, JobMatchScore, PersonalizedRecommendation } from './ai-matching'
import { useUser } from '@clerk/nextjs'

interface JobsContextType {
  // État
  jobs: JobListing[]
  filters: JobSearchFilters
  loading: boolean
  selectedCountry: string
  availableCountries: Array<{code: string, name: string, flag: string}>
  aiRecommendations: PersonalizedRecommendation[]
  jobMatches: { [jobId: string]: JobMatchScore }
  
  // Actions
  updateFilters: (filters: Partial<JobSearchFilters>) => void
  setCountry: (country: string) => void
  searchJobs: () => Promise<void>
  toggleFavorite: (jobId: string) => void
  getFavorites: () => JobListing[]
  evaluateJobMatch: (jobId: string) => Promise<number>
  getPersonalizedRecommendations: () => Promise<void>
  
  // Stats
  getSearchStats: () => {
    total: number
    bySource: { [source: string]: number }
    byCountry: { [country: string]: number }
    averageMatch: number
  }
}

const JobsContext = createContext<JobsContextType | undefined>(undefined)

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [filters, setFilters] = useState<JobSearchFilters>(defaultFilters)
  const [loading, setLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('france')
  const [aiRecommendations, setAiRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [jobMatches, setJobMatches] = useState<{ [jobId: string]: JobMatchScore }>({})
  
  // Services
  const scrapingService = new JobScrapingService()
  const aiService = new AIJobMatchingService()
  
  // Pays disponibles
  const availableCountries = Object.entries(JOB_SOURCES).map(([code, config]) => ({
    code,
    name: config.name,
    flag: config.flag
  }))
  
  const updateFilters = (newFilters: Partial<JobSearchFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }
  
  const setCountry = (country: string) => {
    setSelectedCountry(country)
    // Réinitialiser les résultats quand on change de pays
    setJobs([])
  }
  
  const searchJobs = async () => {
    setLoading(true)
    try {
      const countryConfig = JOB_SOURCES[selectedCountry as keyof typeof JOB_SOURCES]
      if (!countryConfig) {
        throw new Error(`Configuration non trouvée pour le pays: ${selectedCountry}`)
      }
      
      let allJobs: JobListing[] = []
      
      // 1. Recherche via APIs officielles
      const apiResults = await searchViaAPIs(countryConfig, filters)
      allJobs = [...allJobs, ...apiResults]
      
      // 2. Recherche via scraping
      const scrapingResults = await scrapingService.scrapeJobs(selectedCountry, {
        query: filters.query,
        location: filters.location,
        page: 1,
        limit: 50
      })
      allJobs = [...allJobs, ...scrapingResults]
      
      // 3. Filtrage et post-traitement
      const filteredJobs = filterJobs(allJobs, filters)
      const enrichedJobs = await enrichJobsWithAI(filteredJobs)
      
      setJobs(enrichedJobs)
      
      // 4. Générer des recommandations IA si l'utilisateur est connecté
      if (user && enrichedJobs.length > 0) {
        await getPersonalizedRecommendations()
      }
      
    } catch (error) {
      console.error('Erreur lors de la recherche d\'emplois:', error)
      
      // Fallback sur des données de test en cas d'erreur
      const mockJobs = generateMockJobs(filters, selectedCountry)
      setJobs(mockJobs)
    } finally {
      setLoading(false)
    }
  }
  
  // Recherche via APIs officielles
  const searchViaAPIs = async (countryConfig: any, filters: JobSearchFilters): Promise<JobListing[]> => {
    const results: JobListing[] = []
    
    for (const api of countryConfig.apis) {
      if (!api.enabled || !api.appId || !api.appKey) continue
      
      try {
        let endpoint = api.endpoint
        const params = new URLSearchParams({
          app_id: api.appId,
          app_key: api.appKey,
          results_per_page: '50'
        })
        
        if (filters.query) params.append('what', filters.query)
        if (filters.location) params.append('where', filters.location)
        if (filters.postedSince && filters.postedSince !== 'any') {
          const days = filters.postedSince === 'day' ? '1' : 
                       filters.postedSince === 'week' ? '7' : '30'
          params.append('max_days_old', days)
        }
        
        const response = await fetch(`${endpoint}?${params.toString()}`)
        
        if (!response.ok) {
          console.warn(`API ${api.name} failed: ${response.status}`)
          continue
        }
        
        const data = await response.json()
        const jobs = parseAPIResults(data, api.name, countryConfig.currency)
        results.push(...jobs)
        
      } catch (error) {
        console.error(`Erreur API ${api.name}:`, error)
      }
    }
    
    return results
  }
  
  // Parser les résultats d'API
  const parseAPIResults = (data: any, apiName: string, currency: string): JobListing[] => {
    if (!data.results || !Array.isArray(data.results)) return []
    
    return data.results.map((job: any) => ({
      id: String(job.id || Math.random()),
      title: job.title || '',
      company: job.company?.display_name || job.company || '',
      location: job.location?.display_name || job.location || '',
      description: job.description || '',
      salary: formatAPISalary(job, currency),
      contractType: parseContractType(job.contract_type || job.contract_time),
      experienceLevel: parseExperienceLevel(job.title + ' ' + job.description),
      remote: parseRemoteWork(job.title + ' ' + job.description),
      url: job.redirect_url || job.url || '',
      source: apiName.toLowerCase(),
      postedDate: job.created || new Date().toISOString().split('T')[0],
      matchScore: 0
    }))
  }
  
  // Enrichissement avec IA
  const enrichJobsWithAI = async (jobs: JobListing[]): Promise<JobListing[]> => {
    if (!user) return jobs
    
    try {
      // Calculer les scores de correspondance pour chaque job
      const userCV = await getUserCV() // À implémenter
      if (!userCV) return jobs
      
      const enrichedJobs = await Promise.all(
        jobs.map(async (job) => {
          try {
            const matchScore = await aiService.calculateJobMatch(userCV, job)
            setJobMatches(prev => ({ ...prev, [job.id!]: matchScore }))
            return { ...job, matchScore: matchScore.score }
          } catch (error) {
            console.error('Erreur calcul match:', error)
            return job
          }
        })
      )
      
      // Trier par score de correspondance
      return enrichedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      
    } catch (error) {
      console.error('Erreur enrichissement IA:', error)
      return jobs
    }
  }
  
  const getPersonalizedRecommendations = async () => {
    if (!user || jobs.length === 0) return
    
    try {
      const userCV = await getUserCV()
      if (!userCV) return
      
      const recommendations = await aiService.generatePersonalizedRecommendations(userCV, jobs)
      setAiRecommendations(recommendations)
    } catch (error) {
      console.error('Erreur recommandations:', error)
    }
  }
  
  const toggleFavorite = (jobId: string) => {
    setJobs((prev) => 
      prev.map((job) => 
        job.id === jobId ? { ...job, isFavorite: !job.isFavorite } : job
      )
    )
    
    // Sauvegarder en base de données si l'utilisateur est connecté
    if (user) {
      saveFavoriteToDatabase(jobId)
    }
  }
  
  const getFavorites = () => {
    return jobs.filter(job => job.isFavorite)
  }
  
  const evaluateJobMatch = async (jobId: string): Promise<number> => {
    const existingMatch = jobMatches[jobId]
    if (existingMatch) return existingMatch.score
    
    if (!user) return Math.floor(Math.random() * 100)
    
    try {
      const userCV = await getUserCV()
      const job = jobs.find(j => j.id === jobId)
      
      if (!userCV || !job) return 0
      
      const matchScore = await aiService.calculateJobMatch(userCV, job)
      setJobMatches(prev => ({ ...prev, [jobId]: matchScore }))
      
      return matchScore.score
    } catch (error) {
      console.error('Erreur évaluation match:', error)
      return Math.floor(Math.random() * 100)
    }
  }
  
  const getSearchStats = () => {
    const total = jobs.length
    const bySource = jobs.reduce((acc, job) => {
      acc[job.source] = (acc[job.source] || 0) + 1
      return acc
    }, {} as { [source: string]: number })
    
    const byCountry = { [selectedCountry]: total }
    
    const averageMatch = jobs.reduce((sum, job) => sum + (job.matchScore || 0), 0) / (total || 1)
    
    return { total, bySource, byCountry, averageMatch: Math.round(averageMatch) }
  }
  
  // Utilitaires
  const filterJobs = (jobs: JobListing[], filters: JobSearchFilters): JobListing[] => {
    return jobs.filter(job => {
      // Filtrer par type de contrat
      if (filters.contractType && filters.contractType.length > 0) {
        if (!filters.contractType.includes(job.contractType)) return false
      }
      
      // Filtrer par niveau d'expérience
      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        if (!filters.experienceLevel.includes(job.experienceLevel)) return false
      }
      
      // Filtrer par télétravail
      if (filters.remote && filters.remote.length > 0) {
        if (!filters.remote.includes(job.remote)) return false
      }
      
      return true
    })
  }
  
  const formatAPISalary = (job: any, currency: string): string | undefined => {
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min} - ${job.salary_max} ${currency}`
    }
    if (job.salary) {
      return `${job.salary} ${currency}`
    }
    return undefined
  }
  
  const parseContractType = (type: string): JobListing['contractType'] => {
    if (!type) return 'full-time'
    const lower = type.toLowerCase()
    if (lower.includes('stage') || lower.includes('intern')) return 'internship'
    if (lower.includes('freelance') || lower.includes('contract')) return 'freelance'
    if (lower.includes('part') || lower.includes('temps partiel')) return 'part-time'
    if (lower.includes('apprentice') || lower.includes('alternance')) return 'apprenticeship'
    return 'full-time'
  }
  
  const parseExperienceLevel = (text: string): JobListing['experienceLevel'] => {
    const lower = text.toLowerCase()
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) return 'senior'
    if (lower.includes('junior') || lower.includes('débutant') || lower.includes('entry')) return 'entry'
    if (lower.includes('executive') || lower.includes('director') || lower.includes('manager')) return 'executive'
    return 'intermediate'
  }
  
  const parseRemoteWork = (text: string): JobListing['remote'] => {
    const lower = text.toLowerCase()
    if (lower.includes('remote') || lower.includes('télétravail') || lower.includes('100%')) return 'full'
    if (lower.includes('hybrid') || lower.includes('hybride') || lower.includes('mixte')) return 'hybrid'
    return 'no'
  }
  
  const getUserCV = async () => {
    // À implémenter - récupérer le CV de l'utilisateur connecté
    try {
      const response = await fetch('/api/user/cv')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Erreur récupération CV:', error)
    }
    return null
  }
  
  const saveFavoriteToDatabase = async (jobId: string) => {
    try {
      await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      })
    } catch (error) {
      console.error('Erreur sauvegarde favori:', error)
    }
  }
  
  const generateMockJobs = (filters: JobSearchFilters, country: string): JobListing[] => {
    const countryConfig = JOB_SOURCES[country as keyof typeof JOB_SOURCES]
    const jobTitles = [
      'Développeur Full Stack',
      'Data Scientist',
      'Chef de projet',
      'Designer UX/UI',
      'Ingénieur DevOps',
      'Consultant',
      'Analyste financier',
      'Responsable marketing'
    ]
    
    return jobTitles.map((title, index) => ({
      id: `mock-${index}`,
      title: `${title} ${filters.query || ''}`.trim(),
      company: `Entreprise ${index + 1}`,
      location: filters.location || countryConfig.name,
      description: `Description pour le poste de ${title} dans ${filters.location || countryConfig.name}`,
      salary: `${30000 + index * 5000} - ${50000 + index * 5000} ${countryConfig.currency}`,
      contractType: 'full-time',
      experienceLevel: index % 2 === 0 ? 'intermediate' : 'senior',
      remote: index % 3 === 0 ? 'full' : index % 3 === 1 ? 'hybrid' : 'no',
      url: `https://example.com/job/${index}`,
      source: 'mock',
      postedDate: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      matchScore: 60 + Math.floor(Math.random() * 40)
    }))
  }
  
  return (
    <JobsContext.Provider
      value={{
        jobs,
        filters,
        loading,
        selectedCountry,
        availableCountries,
        aiRecommendations,
        jobMatches,
        updateFilters,
        setCountry,
        searchJobs,
        toggleFavorite,
        getFavorites,
        evaluateJobMatch,
        getPersonalizedRecommendations,
        getSearchStats,
      }}
    >
      {children}
    </JobsContext.Provider>
  )
}

export function useJobs() {
  const context = useContext(JobsContext)
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider')
  }
  return context
}
