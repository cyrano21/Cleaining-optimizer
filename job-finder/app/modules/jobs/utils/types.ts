export interface JobListing {
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  contractType: 'full-time' | 'part-time' | 'freelance' | 'internship' | 'apprenticeship';
  experienceLevel: 'entry' | 'intermediate' | 'senior' | 'executive';
  remote: 'no' | 'hybrid' | 'full';
  url: string;
  source: 'indeed' | 'linkedin' | 'monster' | 'glassdoor' | 'other';
  postedDate: string;
  matchScore?: number;
  isFavorite?: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobSearchFilters {
  query: string;
  location: string;
  radius?: number;
  contractType?: string[];
  experienceLevel?: string[];
  remote?: string[];
  salary?: {
    min?: number;
    max?: number;
  };
  postedSince?: 'day' | 'week' | 'month' | 'any';
}

export const defaultFilters: JobSearchFilters = {
  query: '',
  location: '',
  radius: 50,
  contractType: [],
  experienceLevel: [],
  remote: [],
  postedSince: 'any'
};

export interface JobAlert {
  id?: string;
  name: string;
  filters: JobSearchFilters;
  frequency: 'daily' | 'weekly' | 'instant';
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Données simulées pour les offres d'emploi
export const mockJobListings: JobListing[] = [
  {
    id: '1',
    title: 'Développeur Full Stack JavaScript',
    company: 'TechCorp',
    location: 'Paris, France',
    description: 'Nous recherchons un développeur Full Stack JavaScript expérimenté pour rejoindre notre équipe. Vous travaillerez sur des projets passionnants utilisant React, Node.js et MongoDB.',
    salary: '45 000 € - 60 000 €',
    contractType: 'full-time',
    experienceLevel: 'intermediate',
    remote: 'hybrid',
    url: 'https://example.com/job/1',
    source: 'linkedin',
    postedDate: '2025-04-15',
    matchScore: 85
  },
  {
    id: '2',
    title: 'Développeur Frontend React',
    company: 'StartupInnovante',
    location: 'Lyon, France',
    description: 'Startup en pleine croissance cherche un développeur Frontend React pour créer des interfaces utilisateur modernes et réactives.',
    contractType: 'full-time',
    experienceLevel: 'entry',
    remote: 'no',
    url: 'https://example.com/job/2',
    source: 'indeed',
    postedDate: '2025-04-16',
    matchScore: 72
  },
  {
    id: '3',
    title: 'Ingénieur DevOps',
    company: 'CloudSolutions',
    location: 'Toulouse, France',
    description: 'Rejoignez notre équipe DevOps pour mettre en place et maintenir notre infrastructure cloud. Expérience avec AWS, Docker et Kubernetes requise.',
    salary: '55 000 € - 70 000 €',
    contractType: 'full-time',
    experienceLevel: 'senior',
    remote: 'full',
    url: 'https://example.com/job/3',
    source: 'glassdoor',
    postedDate: '2025-04-10',
    matchScore: 65
  },
  {
    id: '4',
    title: 'Designer UX/UI',
    company: 'AgenceDigitale',
    location: 'Bordeaux, France',
    description: 'Agence digitale recherche un designer UX/UI talentueux pour concevoir des expériences utilisateur exceptionnelles pour nos clients.',
    contractType: 'freelance',
    experienceLevel: 'intermediate',
    remote: 'hybrid',
    url: 'https://example.com/job/4',
    source: 'linkedin',
    postedDate: '2025-04-12',
    matchScore: 78
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'DataInsights',
    location: 'Paris, France',
    description: 'Nous recherchons un Data Scientist pour analyser de grands ensembles de données et développer des modèles prédictifs. Expérience en Python et ML requise.',
    salary: '50 000 € - 65 000 €',
    contractType: 'full-time',
    experienceLevel: 'senior',
    remote: 'hybrid',
    url: 'https://example.com/job/5',
    source: 'monster',
    postedDate: '2025-04-14',
    matchScore: 92
  }
];
