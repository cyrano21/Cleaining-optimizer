import { JobListing } from './types'
import { CV } from '../../cv/utils/types'

export interface JobMatchScore {
  jobId: string
  score: number
  breakdown: {
    skillsMatch: number
    experienceMatch: number
    locationMatch: number
    salaryMatch: number
    remotePrefMatch: number
  }
  recommendations: string[]
  missingSkills: string[]
}

export interface PersonalizedRecommendation {
  type: 'skill_gap' | 'salary_negotiation' | 'location_advice' | 'experience_boost'
  title: string
  description: string
  actionItems: string[]
  priority: 'high' | 'medium' | 'low'
}

export class AIJobMatchingService {
  private huggingFaceKey: string

  constructor() {
    this.huggingFaceKey = process.env.HUGGINGFACE_API_KEY || ''
  }

  // Analyse de compatibilité CV/Offre avec IA
  async calculateJobMatch(cv: CV, job: JobListing): Promise<JobMatchScore> {
    try {
      const cvText = this.extractCVText(cv)
      const jobText = this.extractJobText(job)
      
      // Utiliser Hugging Face pour l'analyse sémantique
      const semanticSimilarity = await this.calculateSemanticSimilarity(cvText, jobText)
      
      // Analyses spécifiques
      const skillsMatch = await this.analyzeSkillsMatch(cv, job)
      const experienceMatch = this.analyzeExperienceMatch(cv, job)
      const locationMatch = this.analyzeLocationMatch(cv, job)
      const salaryMatch = this.analyzeSalaryMatch(cv, job)
      const remotePrefMatch = this.analyzeRemotePreference(cv, job)
      
      // Calcul du score global pondéré
      const globalScore = Math.round(
        (skillsMatch * 0.3 +
         experienceMatch * 0.25 +
         semanticSimilarity * 0.2 +
         locationMatch * 0.1 +
         salaryMatch * 0.1 +
         remotePrefMatch * 0.05) * 100
      )
      
      const recommendations = await this.generateRecommendations(cv, job, globalScore)
      const missingSkills = await this.identifyMissingSkills(cv, job)
      
      return {
        jobId: job.id || '',
        score: globalScore,
        breakdown: {
          skillsMatch: Math.round(skillsMatch * 100),
          experienceMatch: Math.round(experienceMatch * 100),
          locationMatch: Math.round(locationMatch * 100),
          salaryMatch: Math.round(salaryMatch * 100),
          remotePrefMatch: Math.round(remotePrefMatch * 100)
        },
        recommendations,
        missingSkills
      }
      
    } catch (error) {
      console.error('AI Job matching error:', error)
      // Fallback sur une analyse simple
      return this.basicJobMatch(cv, job)
    }
  }

  // Analyse sémantique avec Hugging Face
  private async calculateSemanticSimilarity(cvText: string, jobText: string): Promise<number> {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.huggingFaceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: {
              source_sentence: cvText.substring(0, 500),
              sentences: [jobText.substring(0, 500)]
            }
          })
        }
      )
      
      if (!response.ok) {
        throw new Error('Hugging Face API error')
      }
      
      const result = await response.json()
      return result[0] || 0.5
      
    } catch (error) {
      console.error('Semantic similarity error:', error)
      return 0.5
    }
  }

  // Analyse des compétences avec extraction NLP
  private async analyzeSkillsMatch(cv: CV, job: JobListing): Promise<number> {
    const cvSkills = this.extractSkillsFromCV(cv)
    const jobSkills = await this.extractSkillsFromJob(job)
    
    if (jobSkills.length === 0) return 0.5
    
    const matchingSkills = cvSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        this.fuzzyMatch(skill.toLowerCase(), jobSkill.toLowerCase())
      )
    )
    
    return matchingSkills.length / jobSkills.length
  }

  // Extraction des compétences du job avec IA
  private async extractSkillsFromJob(job: JobListing): Promise<string[]> {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.huggingFaceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: job.description
          })
        }
      )
      
      if (!response.ok) {
        return this.extractSkillsBasic(job.description)
      }
      
      const entities = await response.json()
      const skills = entities
        .filter((entity: any) => entity.entity_group === 'MISC' || entity.entity_group === 'ORG')
        .map((entity: any) => entity.word)
        .filter((skill: string) => this.isValidSkill(skill))
      
      return [...new Set(skills)]
      
    } catch (error) {
      return this.extractSkillsBasic(job.description)
    }
  }

  // Extraction basique des compétences (fallback)
  private extractSkillsBasic(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'Docker', 'AWS', 'SQL',
      'Java', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Git', 'Linux',
      'Kubernetes', 'Angular', 'Vue.js', 'PHP', 'Laravel', 'Django',
      'Machine Learning', 'Data Science', 'DevOps', 'Agile', 'Scrum'
    ]
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    )
  }

  private extractSkillsFromCV(cv: CV): string[] {
    const skillsSection = cv.sections.find(section => section.id === 'skills')
    if (!skillsSection || !Array.isArray(skillsSection.content)) return []
    
    return (skillsSection.content as any[]).map(skill => skill.name || skill)
  }

  private analyzeExperienceMatch(cv: CV, job: JobListing): number {
    const experienceSection = cv.sections.find(section => section.id === 'experience')
    if (!experienceSection || !Array.isArray(experienceSection.content)) return 0.5
    
    const totalYears = (experienceSection.content as any[]).reduce((total, exp) => {
      const start = new Date(exp.startDate || '2020-01-01')
      const end = exp.current ? new Date() : new Date(exp.endDate || '2020-01-01')
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
      return total + Math.max(0, years)
    }, 0)
    
    // Correspondance basée sur le niveau requis
    const experienceMapping = {
      'entry': 0,
      'intermediate': 2,
      'senior': 5,
      'executive': 10
    }
    
    const requiredYears = experienceMapping[job.experienceLevel] || 2
    
    if (totalYears >= requiredYears) return 1
    if (totalYears >= requiredYears * 0.7) return 0.8
    if (totalYears >= requiredYears * 0.5) return 0.6
    return 0.3
  }

  private analyzeLocationMatch(cv: CV, job: JobListing): number {
    const cvLocation = cv.personalInfo.city?.toLowerCase() || ''
    const jobLocation = job.location.toLowerCase()
    
    if (!cvLocation || !jobLocation) return 0.5
    
    // Match exact
    if (jobLocation.includes(cvLocation) || cvLocation.includes(jobLocation)) return 1
    
    // Remote
    if (job.remote === 'full') return 0.9
    if (job.remote === 'hybrid') return 0.7
    
    // Même pays (approximation basique)
    const cvCountry = this.extractCountry(cvLocation)
    const jobCountry = this.extractCountry(jobLocation)
    
    if (cvCountry === jobCountry) return 0.6
    
    return 0.2
  }

  private analyzeSalaryMatch(cv: CV, job: JobListing): number {
    // Pour l'instant, retourne un score neutre
    // Dans une version complète, analyserait les attentes salariales du CV
    return job.salary ? 0.7 : 0.5
  }

  private analyzeRemotePreference(cv: CV, job: JobListing): number {
    // Analyse basique - améliorer avec les préférences utilisateur
    if (job.remote === 'full') return 0.8
    if (job.remote === 'hybrid') return 0.9
    return 0.7
  }

  private async generateRecommendations(cv: CV, job: JobListing, score: number): Promise<string[]> {
    const recommendations: string[] = []
    
    if (score < 60) {
      recommendations.push("Ajoutez les compétences clés mentionnées dans l'offre à votre CV")
      recommendations.push("Adaptez votre expérience pour correspondre au niveau requis")
    }
    
    if (score >= 60 && score < 80) {
      recommendations.push("Votre profil correspond bien ! Personnalisez votre lettre de motivation")
      recommendations.push("Mettez en avant vos projets les plus pertinents")
    }
    
    if (score >= 80) {
      recommendations.push("Excellent match ! Postulez rapidement")
      recommendations.push("Préparez-vous pour l'entretien en étudiant l'entreprise")
    }
    
    return recommendations
  }

  private async identifyMissingSkills(cv: CV, job: JobListing): Promise<string[]> {
    const cvSkills = this.extractSkillsFromCV(cv)
    const jobSkills = await this.extractSkillsFromJob(job)
    
    return jobSkills.filter(jobSkill => 
      !cvSkills.some(cvSkill => 
        this.fuzzyMatch(cvSkill.toLowerCase(), jobSkill.toLowerCase())
      )
    )
  }

  // Génération de recommandations personnalisées
  async generatePersonalizedRecommendations(cv: CV, jobs: JobListing[]): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = []
    
    if (jobs.length === 0) return recommendations
    
    // Analyser les tendances des offres
    const allSkills = await Promise.all(
      jobs.map(job => this.extractSkillsFromJob(job))
    )
    
    const skillFrequency = this.calculateSkillFrequency(allSkills.flat())
    const cvSkills = this.extractSkillsFromCV(cv)
    
    // Recommandations de compétences
    const missingTopSkills = Object.entries(skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .filter(([skill]) => !cvSkills.some(cvSkill => 
        this.fuzzyMatch(cvSkill.toLowerCase(), skill.toLowerCase())
      ))
      .map(([skill]) => skill)
    
    if (missingTopSkills.length > 0) {
      recommendations.push({
        type: 'skill_gap',
        title: 'Compétences en demande',
        description: `Les compétences suivantes apparaissent fréquemment dans les offres de votre domaine : ${missingTopSkills.join(', ')}`,
        actionItems: [
          'Suivre une formation en ligne',
          'Ajouter ces compétences à votre plan de développement',
          'Rechercher des projets pour pratiquer ces compétences'
        ],
        priority: 'high'
      })
    }
    
    // Recommandations salariales
    const salaries = jobs
      .filter(job => job.salary)
      .map(job => this.extractSalaryRange(job.salary!))
      .filter(range => range.min > 0)
    
    if (salaries.length > 0) {
      const avgSalary = salaries.reduce((sum, range) => sum + range.max, 0) / salaries.length
      
      recommendations.push({
        type: 'salary_negotiation',
        title: 'Tendances salariales',
        description: `Le salaire moyen pour votre profil est d'environ ${Math.round(avgSalary).toLocaleString()}€`,
        actionItems: [
          'Préparer des arguments pour la négociation salariale',
          'Rechercher les salaires dans votre région',
          'Valoriser vos compétences uniques'
        ],
        priority: 'medium'
      })
    }
    
    return recommendations
  }

  // Utilitaires
  private extractCVText(cv: CV): string {
    const sections = cv.sections.map(section => {
      if (section.id === 'summary') {
        return (section.content as any)?.content || ''
      }
      if (Array.isArray(section.content)) {
        return section.content.map((item: any) => 
          Object.values(item).join(' ')
        ).join(' ')
      }
      return ''
    }).join(' ')
    
    return `${cv.personalInfo.firstName} ${cv.personalInfo.lastName} ${cv.personalInfo.title} ${sections}`
  }

  private extractJobText(job: JobListing): string {
    return `${job.title} ${job.company} ${job.description} ${job.experienceLevel} ${job.contractType}`
  }

  private fuzzyMatch(str1: string, str2: string): boolean {
    const threshold = 0.8
    const distance = this.levenshteinDistance(str1, str2)
    const maxLength = Math.max(str1.length, str2.length)
    return (maxLength - distance) / maxLength >= threshold
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  private isValidSkill(skill: string): boolean {
    return skill.length > 2 && skill.length < 50 && !/^\d+$/.test(skill)
  }

  private extractCountry(location: string): string {
    const countries = ['france', 'uk', 'germany', 'spain', 'italy', 'morocco', 'tunisia']
    return countries.find(country => location.includes(country)) || 'unknown'
  }

  private calculateSkillFrequency(skills: string[]): { [skill: string]: number } {
    return skills.reduce((freq, skill) => {
      freq[skill] = (freq[skill] || 0) + 1
      return freq
    }, {} as { [skill: string]: number })
  }

  private extractSalaryRange(salary: string): { min: number, max: number } {
    const numbers = salary.match(/\d+[\d\s]*/g)?.map(n => parseInt(n.replace(/\s/g, ''))) || []
    if (numbers.length >= 2) {
      return { min: Math.min(...numbers), max: Math.max(...numbers) }
    }
    if (numbers.length === 1) {
      return { min: numbers[0], max: numbers[0] }
    }
    return { min: 0, max: 0 }
  }

  // Fallback analysis
  private basicJobMatch(cv: CV, job: JobListing): JobMatchScore {
    return {
      jobId: job.id || '',
      score: 65,
      breakdown: {
        skillsMatch: 60,
        experienceMatch: 70,
        locationMatch: 80,
        salaryMatch: 60,
        remotePrefMatch: 75
      },
      recommendations: [
        "Personnalisez votre CV pour cette offre",
        "Mettez en avant vos expériences pertinentes"
      ],
      missingSkills: []
    }
  }
}