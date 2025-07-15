import { JobListing } from './types'

// Interface pour les scrapers
export interface JobScraper {
  name: string
  baseUrl: string
  country: string
  enabled: boolean
  scrape: (filters: JobSearchFilters) => Promise<JobListing[]>
}

export interface ScrapingFilters {
  query?: string
  location?: string
  page?: number
  limit?: number
  experience?: string
  contract?: string
  remote?: boolean
}

// Scraper Indeed universel
export class IndeedScraper implements JobScraper {
  name = 'Indeed'
  country: string
  baseUrl: string
  enabled = true

  constructor(country: string, domain: string) {
    this.country = country
    this.baseUrl = `https://${domain}`
  }

  async scrape(filters: ScrapingFilters): Promise<JobListing[]> {
    try {
      const searchParams = new URLSearchParams({
        q: filters.query || '',
        l: filters.location || '',
        start: ((filters.page || 1) - 1 * 10).toString(),
        limit: (filters.limit || 50).toString()
      })

      // Utiliser notre API backend pour éviter les problèmes CORS
      const response = await fetch(`/api/scraping/indeed/${this.country}?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Indeed scraping failed: ${response.status}`)
      }

      const data = await response.json()
      return this.parseIndeedResults(data.jobs || [])
    } catch (error) {
      console.error(`Indeed scraping error for ${this.country}:`, error)
      return []
    }
  }

  private parseIndeedResults(jobs: any[]): JobListing[] {
    return jobs.map((job: any) => ({
      id: job.key || Math.random().toString(),
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      description: job.summary || job.description || '',
      salary: job.salary || undefined,
      contractType: this.parseContractType(job.formattedJobType),
      experienceLevel: this.parseExperienceLevel(job.title + ' ' + job.summary),
      remote: this.parseRemoteWork(job.title + ' ' + job.summary),
      url: job.url || `${this.baseUrl}/viewjob?jk=${job.key}`,
      source: 'indeed',
      postedDate: job.date || new Date().toISOString().split('T')[0]
    }))
  }

  private parseContractType(jobType: string): JobListing['contractType'] {
    const type = jobType?.toLowerCase() || ''
    if (type.includes('stage') || type.includes('intern')) return 'internship'
    if (type.includes('freelance') || type.includes('contract')) return 'freelance'
    if (type.includes('part') || type.includes('temps partiel')) return 'part-time'
    if (type.includes('apprentice') || type.includes('alternance')) return 'apprenticeship'
    return 'full-time'
  }

  private parseExperienceLevel(text: string): JobListing['experienceLevel'] {
    const lower = text.toLowerCase()
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) return 'senior'
    if (lower.includes('junior') || lower.includes('débutant') || lower.includes('entry')) return 'entry'
    if (lower.includes('executive') || lower.includes('director') || lower.includes('manager')) return 'executive'
    return 'intermediate'
  }

  private parseRemoteWork(text: string): JobListing['remote'] {
    const lower = text.toLowerCase()
    if (lower.includes('remote') || lower.includes('télétravail') || lower.includes('100%')) return 'full'
    if (lower.includes('hybrid') || lower.includes('hybride') || lower.includes('mixte')) return 'hybrid'
    return 'no'
  }
}

// Scraper LinkedIn
export class LinkedInScraper implements JobScraper {
  name = 'LinkedIn'
  baseUrl = 'https://www.linkedin.com'
  country: string
  enabled = true

  constructor(country: string) {
    this.country = country
  }

  async scrape(filters: ScrapingFilters): Promise<JobListing[]> {
    try {
      const searchParams = new URLSearchParams({
        keywords: filters.query || '',
        location: filters.location || '',
        start: ((filters.page || 1) - 1 * 25).toString()
      })

      const response = await fetch(`/api/scraping/linkedin/${this.country}?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`LinkedIn scraping failed: ${response.status}`)
      }

      const data = await response.json()
      return this.parseLinkedInResults(data.jobs || [])
    } catch (error) {
      console.error(`LinkedIn scraping error for ${this.country}:`, error)
      return []
    }
  }

  private parseLinkedInResults(jobs: any[]): JobListing[] {
    return jobs.map((job: any) => ({
      id: job.id || Math.random().toString(),
      title: job.title || '',
      company: job.companyName || '',
      location: job.location || '',
      description: job.description || '',
      salary: undefined, // LinkedIn ne fournit pas toujours le salaire
      contractType: 'full-time', // Par défaut
      experienceLevel: this.parseExperienceLevel(job.title + ' ' + job.description),
      remote: this.parseRemoteWork(job.location + ' ' + job.description),
      url: job.url || '',
      source: 'linkedin',
      postedDate: job.postedDate || new Date().toISOString().split('T')[0]
    }))
  }

  private parseExperienceLevel(text: string): JobListing['experienceLevel'] {
    const lower = text.toLowerCase()
    if (lower.includes('senior') || lower.includes('lead')) return 'senior'
    if (lower.includes('junior') || lower.includes('entry')) return 'entry'
    if (lower.includes('director') || lower.includes('manager')) return 'executive'
    return 'intermediate'
  }

  private parseRemoteWork(text: string): JobListing['remote'] {
    const lower = text.toLowerCase()
    if (lower.includes('remote') || lower.includes('télétravail')) return 'full'
    if (lower.includes('hybrid') || lower.includes('hybride')) return 'hybrid'
    return 'no'
  }
}

// Scraper pour sites africains spécialisés
export class AfricanJobsScraper implements JobScraper {
  name: string
  baseUrl: string
  country: string
  enabled = true

  constructor(country: string, site: string, baseUrl: string) {
    this.country = country
    this.name = site
    this.baseUrl = baseUrl
  }

  async scrape(filters: ScrapingFilters): Promise<JobListing[]> {
    try {
      const searchParams = new URLSearchParams({
        query: filters.query || '',
        location: filters.location || '',
        page: (filters.page || 1).toString()
      })

      const response = await fetch(`/api/scraping/african/${this.country}/${this.name}?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`${this.name} scraping failed: ${response.status}`)
      }

      const data = await response.json()
      return this.parseResults(data.jobs || [])
    } catch (error) {
      console.error(`${this.name} scraping error for ${this.country}:`, error)
      return []
    }
  }

  private parseResults(jobs: any[]): JobListing[] {
    return jobs.map((job: any) => ({
      id: job.id || Math.random().toString(),
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      description: job.description || '',
      salary: job.salary || undefined,
      contractType: 'full-time',
      experienceLevel: 'intermediate',
      remote: 'no',
      url: job.url || '',
      source: 'other',
      postedDate: job.date || new Date().toISOString().split('T')[0]
    }))
  }
}

// Factory pour créer les scrapers
export class ScraperFactory {
  static createScrapers(country: string): JobScraper[] {
    const scrapers: JobScraper[] = []

    // Indeed est disponible dans la plupart des pays
    const indeedDomains: { [key: string]: string } = {
      france: 'indeed.fr',
      uk: 'indeed.co.uk',
      germany: 'indeed.de',
      spain: 'indeed.es',
      italy: 'indeed.it',
      netherlands: 'indeed.nl',
      southafrica: 'indeed.co.za'
    }

    if (indeedDomains[country]) {
      scrapers.push(new IndeedScraper(country, indeedDomains[country]))
    }

    // LinkedIn est universel
    scrapers.push(new LinkedInScraper(country))

    // Sites spécialisés pour l'Afrique
    const africanSites: { [key: string]: Array<{name: string, url: string}> } = {
      morocco: [
        { name: 'rekrute', url: 'https://www.rekrute.com' },
        { name: 'emploi.ma', url: 'https://www.emploi.ma' }
      ],
      tunisia: [
        { name: 'tanitjobs', url: 'https://www.tanitjobs.com' },
        { name: 'emploitunisie', url: 'https://www.emploitunisie.com' }
      ],
      algeria: [
        { name: 'emploitic', url: 'https://www.emploitic.com' },
        { name: 'algeriejob', url: 'https://www.algeriejob.com' }
      ],
      senegal: [
        { name: 'emploisenegal', url: 'https://www.emploisenegal.com' },
        { name: 'senjob', url: 'https://www.senjob.com' }
      ]
    }

    if (africanSites[country]) {
      africanSites[country].forEach(site => {
        scrapers.push(new AfricanJobsScraper(country, site.name, site.url))
      })
    }

    return scrapers
  }
}

// Service de scraping principal
export class JobScrapingService {
  private scrapers: { [country: string]: JobScraper[] } = {}

  constructor() {
    // Initialiser les scrapers pour tous les pays
    Object.keys(JOB_SOURCES).forEach(country => {
      this.scrapers[country] = ScraperFactory.createScrapers(country)
    })
  }

  async scrapeJobs(country: string, filters: ScrapingFilters): Promise<JobListing[]> {
    const countryScrapers = this.scrapers[country] || []
    const results: JobListing[] = []

    // Exécuter tous les scrapers en parallèle
    const scrapingPromises = countryScrapers
      .filter(scraper => scraper.enabled)
      .map(async (scraper) => {
        try {
          const jobs = await scraper.scrape(filters)
          return jobs.map(job => ({ ...job, source: scraper.name.toLowerCase() }))
        } catch (error) {
          console.error(`Scraper ${scraper.name} failed:`, error)
          return []
        }
      })

    const scrapingResults = await Promise.all(scrapingPromises)
    
    // Fusionner tous les résultats
    scrapingResults.forEach(jobs => {
      results.push(...jobs)
    })

    // Dédupliquer par titre et entreprise
    return this.deduplicateJobs(results)
  }

  private deduplicateJobs(jobs: JobListing[]): JobListing[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}

// Types pour les imports
import type { JobSearchFilters } from './types'
import { JOB_SOURCES } from './countries-config'