import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface ScrapingResult {
  jobs: JobResult[]
  total: number
  page: number
}

interface JobResult {
  id: string
  title: string
  company: string
  location: string
  summary: string
  salary?: string
  url: string
  date: string
  key?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const location = searchParams.get('l') || ''
  const start = parseInt(searchParams.get('start') || '0')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  try {
    const jobs = await scrapeIndeedJobs(params.country, query, location, start, limit)
    
    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length,
      page: Math.floor(start / 10) + 1
    })
  } catch (error) {
    console.error('Indeed scraping error:', error)
    return NextResponse.json(
      { success: false, error: 'Scraping failed' },
      { status: 500 }
    )
  }
}

async function scrapeIndeedJobs(
  country: string, 
  query: string, 
  location: string, 
  start: number, 
  limit: number
): Promise<JobResult[]> {
  
  // Mapping des domaines Indeed par pays
  const indeedDomains: { [key: string]: string } = {
    'france': 'fr.indeed.com',
    'uk': 'uk.indeed.com', 
    'germany': 'de.indeed.com',
    'spain': 'es.indeed.com',
    'italy': 'it.indeed.com',
    'netherlands': 'nl.indeed.com',
    'southafrica': 'za.indeed.com'
  }
  
  const domain = indeedDomains[country] || 'indeed.com'
  
  const searchParams = new URLSearchParams({
    q: query,
    l: location,
    start: start.toString(),
    limit: Math.min(limit, 50).toString()
  })
  
  const url = `https://${domain}/jobs?${searchParams.toString()}`
  
  // Utiliser un User-Agent réaliste pour éviter la détection
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
  
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const html = await response.text()
  const $ = cheerio.load(html)
  const jobs: JobResult[] = []
  
  // Sélecteurs Indeed (peuvent changer)
  $('[data-jk]').each((_, element) => {
    const $element = $(element)
    const jobKey = $element.attr('data-jk')
    
    if (!jobKey) return
    
    const titleElement = $element.find('h2.jobTitle a span')
    const companyElement = $element.find('[data-testid="company-name"]')
    const locationElement = $element.find('[data-testid="job-location"]')
    const summaryElement = $element.find('.job-snippet')
    const salaryElement = $element.find('.metadata.salary-snippet-container')
    const dateElement = $element.find('.date')
    
    const title = titleElement.text().trim()
    const company = companyElement.text().trim()
    const location = locationElement.text().trim()
    const summary = summaryElement.text().trim()
    const salary = salaryElement.text().trim() || undefined
    const date = dateElement.text().trim() || new Date().toISOString().split('T')[0]
    
    if (title && company) {
      jobs.push({
        id: jobKey,
        key: jobKey,
        title,
        company,
        location,
        summary,
        salary,
        url: `https://${domain}/viewjob?jk=${jobKey}`,
        date
      })
    }
  })
  
  return jobs
}