import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  const { searchParams } = new URL(request.url)
  const keywords = searchParams.get('keywords') || ''
  const location = searchParams.get('location') || ''
  const start = parseInt(searchParams.get('start') || '0')
  
  try {
    const jobs = await scrapeLinkedInJobs(params.country, keywords, location, start)
    
    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length,
      page: Math.floor(start / 25) + 1
    })
  } catch (error) {
    console.error('LinkedIn scraping error:', error)
    return NextResponse.json(
      { success: false, error: 'LinkedIn scraping failed' },
      { status: 500 }
    )
  }
}

async function scrapeLinkedInJobs(
  country: string,
  keywords: string,
  location: string,
  start: number
): Promise<any[]> {
  
  // LinkedIn est plus complexe à scraper à cause des protections anti-bot
  // Pour une version de production, il faudrait utiliser l'API LinkedIn ou un service tiers
  
  const searchParams = new URLSearchParams({
    keywords,
    location,
    start: start.toString(),
    f_TPR: 'r86400' // Jobs posted in last 24 hours
  })
  
  const url = `https://www.linkedin.com/jobs/search?${searchParams.toString()}`
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.linkedin.com/',
    'Connection': 'keep-alive'
  }
  
  try {
    const response = await fetch(url, { 
      headers,
      // Ajouter un délai pour éviter la détection
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      // Si LinkedIn bloque, retourner des données simulées pour l'instant
      return generateMockLinkedInJobs(keywords, location)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    const jobs: any[] = []
    
    // Sélecteurs LinkedIn (approximatifs, LinkedIn change souvent sa structure)
    $('.job-search-card').each((_, element) => {
      const $element = $(element)
      
      const title = $element.find('.base-search-card__title').text().trim()
      const company = $element.find('.base-search-card__subtitle').text().trim()
      const location = $element.find('.job-search-card__location').text().trim()
      const link = $element.find('.base-card__full-link').attr('href')
      const timeAgo = $element.find('.job-search-card__listdate').text().trim()
      
      if (title && company) {
        jobs.push({
          id: Math.random().toString(36).substr(2, 9),
          title,
          companyName: company,
          location,
          url: link ? `https://www.linkedin.com${link}` : '',
          postedDate: convertTimeAgo(timeAgo),
          description: '' // Nécessiterait un scraping supplémentaire
        })
      }
    })
    
    return jobs
    
  } catch (error) {
    console.error('LinkedIn scraping failed, using mock data:', error)
    return generateMockLinkedInJobs(keywords, location)
  }
}

function generateMockLinkedInJobs(keywords: string, location: string): any[] {
  const mockJobs = [
    {
      id: 'ln1',
      title: `${keywords} Specialist`,
      companyName: 'Tech Solutions Inc.',
      location: location || 'Paris, France',
      url: 'https://linkedin.com/jobs/mock1',
      postedDate: new Date().toISOString().split('T')[0],
      description: `Exciting opportunity for a ${keywords} professional in ${location}.`
    },
    {
      id: 'ln2', 
      title: `Senior ${keywords} Developer`,
      companyName: 'Innovation Corp',
      location: location || 'Lyon, France',
      url: 'https://linkedin.com/jobs/mock2',
      postedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      description: `Join our team as a senior ${keywords} developer.`
    },
    {
      id: 'ln3',
      title: `${keywords} Consultant`,
      companyName: 'Global Consulting',
      location: location || 'Remote',
      url: 'https://linkedin.com/jobs/mock3',
      postedDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      description: `Remote consulting position for ${keywords} expert.`
    }
  ]
  
  return mockJobs.filter(job => 
    !keywords || job.title.toLowerCase().includes(keywords.toLowerCase())
  )
}

function convertTimeAgo(timeAgo: string): string {
  const now = new Date()
  
  if (timeAgo.includes('hour')) {
    const hours = parseInt(timeAgo.match(/\d+/)?.[0] || '1')
    return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString().split('T')[0]
  }
  
  if (timeAgo.includes('day')) {
    const days = parseInt(timeAgo.match(/\d+/)?.[0] || '1')
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
  
  if (timeAgo.includes('week')) {
    const weeks = parseInt(timeAgo.match(/\d+/)?.[0] || '1')
    return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
  
  return now.toISOString().split('T')[0]
}