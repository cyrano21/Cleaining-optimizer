// Configuration des APIs et scrapers par pays/région
export const JOB_SOURCES = {
  // EUROPE
  france: {
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    apis: [
      {
        name: 'Adzuna',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/fr/search/',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_ADZUNA_FR_APP_ID,
        appKey: process.env.NEXT_PUBLIC_ADZUNA_FR_APP_KEY
      },
      {
        name: 'PoleEmploi',
        endpoint: 'https://api.emploi-store.fr/partenaire/offresdemploi/v2/offres/search',
        enabled: true,
        clientId: process.env.NEXT_PUBLIC_POLE_EMPLOI_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_POLE_EMPLOI_CLIENT_SECRET
      }
    ],
    scrapers: [
      'indeed.fr',
      'linkedin.com/jobs',
      'monster.fr',
      'apec.fr',
      'regionsjob.com'
    ]
  },
  
  uk: {
    name: 'Royaume-Uni',
    flag: '🇬🇧',
    currency: 'GBP',
    apis: [
      {
        name: 'Adzuna UK',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/gb/search/',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_ADZUNA_UK_APP_ID,
        appKey: process.env.NEXT_PUBLIC_ADZUNA_UK_APP_KEY
      },
      {
        name: 'Reed API',
        endpoint: 'https://www.reed.co.uk/api/1.0/search',
        enabled: true,
        apiKey: process.env.NEXT_PUBLIC_REED_API_KEY
      }
    ],
    scrapers: [
      'indeed.co.uk',
      'linkedin.com/jobs',
      'totaljobs.com',
      'cv-library.co.uk',
      'monster.co.uk'
    ]
  },
  
  germany: {
    name: 'Allemagne',
    flag: '🇩🇪',
    currency: 'EUR',
    apis: [
      {
        name: 'Adzuna DE',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/de/search/',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_ADZUNA_DE_APP_ID,
        appKey: process.env.NEXT_PUBLIC_ADZUNA_DE_APP_KEY
      },
      {
        name: 'TheLocal DE',
        endpoint: 'https://api.thelocal.de/jobs',
        enabled: true,
        apiKey: process.env.NEXT_PUBLIC_THELOCAL_DE_API_KEY
      }
    ],
    scrapers: [
      'indeed.de',
      'linkedin.com/jobs',
      'stepstone.de',
      'xing.com/jobs',
      'monster.de'
    ]
  },
  
  spain: {
    name: 'Espagne',
    flag: '🇪🇸',
    currency: 'EUR',
    apis: [
      {
        name: 'Adzuna ES',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/es/search/',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_ADZUNA_ES_APP_ID,
        appKey: process.env.NEXT_PUBLIC_ADZUNA_ES_APP_KEY
      }
    ],
    scrapers: [
      'indeed.es',
      'linkedin.com/jobs',
      'infojobs.net',
      'monster.es',
      'trabajos.com'
    ]
  },
  
  italy: {
    name: 'Italie',
    flag: '🇮🇹',
    currency: 'EUR',
    apis: [
      {
        name: 'Adzuna IT',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/it/search/',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_ADZUNA_IT_APP_ID,
        appKey: process.env.NEXT_PUBLIC_ADZUNA_IT_APP_KEY
      }
    ],
    scrapers: [
      'indeed.it',
      'linkedin.com/jobs',
      'monster.it',
      'infojobs.it',
      'subito.it/lavoro'
    ]
  },
  
  netherlands: {
    name: 'Pays-Bas',
    flag: '🇳🇱',
    currency: 'EUR',
    apis: [
      {
        name: 'Adzuna NL',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/nl/search/',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_ADZUNA_NL_APP_ID,
        appKey: process.env.NEXT_PUBLIC_ADZUNA_NL_APP_KEY
      }
    ],
    scrapers: [
      'indeed.nl',
      'linkedin.com/jobs',
      'monster.nl',
      'nu.nl/vacatures',
      'nationalevacaturebank.nl'
    ]
  },
  
  // AFRIQUE
  morocco: {
    name: 'Maroc',
    flag: '🇲🇦',
    currency: 'MAD',
    apis: [
      {
        name: 'ReKrute',
        endpoint: 'https://www.rekrute.com/api/offres',
        enabled: true,
        apiKey: process.env.NEXT_PUBLIC_REKRUTE_API_KEY
      }
    ],
    scrapers: [
      'rekrute.com',
      'emploi.ma',
      'marocannonces.com',
      'linkedin.com/jobs',
      'bayt.com'
    ]
  },
  
  tunisia: {
    name: 'Tunisie',
    flag: '🇹🇳',
    currency: 'TND',
    apis: [
      {
        name: 'Tanitjobs',
        endpoint: 'https://www.tanitjobs.com/api/jobs',
        enabled: true,
        apiKey: process.env.NEXT_PUBLIC_TANITJOBS_API_KEY
      }
    ],
    scrapers: [
      'tanitjobs.com',
      'emploitunisie.com',
      'tunisietravail.com',
      'linkedin.com/jobs',
      'bayt.com'
    ]
  },
  
  algeria: {
    name: 'Algérie',
    flag: '🇩🇿',
    currency: 'DZD',
    apis: [],
    scrapers: [
      'emploitic.com',
      'algeriejob.com',
      'linkedin.com/jobs',
      'bayt.com',
      'dzjobs.net'
    ]
  },
  
  senegal: {
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: 'XOF',
    apis: [],
    scrapers: [
      'emploisenegal.com',
      'senjob.com',
      'linkedin.com/jobs',
      'bayt.com',
      'expat-dakar.com'
    ]
  },
  
  cotedivoire: {
    name: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    currency: 'XOF',
    apis: [],
    scrapers: [
      'emploi.ci',
      'jobbingci.com',
      'linkedin.com/jobs',
      'bayt.com',
      'expat.com'
    ]
  },
  
  southafrica: {
    name: 'Afrique du Sud',
    flag: '🇿🇦',
    currency: 'ZAR',
    apis: [
      {
        name: 'Adzuna ZA',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/za/search/',
        enabled: true,
        appId: process.env.NEXT_PUBLIC_ADZUNA_ZA_APP_ID,
        appKey: process.env.NEXT_PUBLIC_ADZUNA_ZA_APP_KEY
      }
    ],
    scrapers: [
      'indeed.co.za',
      'linkedin.com/jobs',
      'careers24.com',
      'pnet.co.za',
      'jobmail.co.za'
    ]
  }
}

// Configuration des devises
export const CURRENCIES = {
  EUR: { symbol: '€', rate: 1, format: 'after' },
  GBP: { symbol: '£', rate: 0.86, format: 'before' },
  MAD: { symbol: 'DH', rate: 10.8, format: 'after' },
  TND: { symbol: 'TND', rate: 3.1, format: 'after' },
  DZD: { symbol: 'DA', rate: 135, format: 'after' },
  XOF: { symbol: 'CFA', rate: 655, format: 'after' },
  ZAR: { symbol: 'R', rate: 18.5, format: 'before' }
}

// Utilitaires de conversion
export const convertSalary = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const from = CURRENCIES[fromCurrency as keyof typeof CURRENCIES]
  const to = CURRENCIES[toCurrency as keyof typeof CURRENCIES]
  
  if (!from || !to) return amount
  
  // Convertir en EUR puis vers la devise cible
  const eurAmount = amount / from.rate
  return Math.round(eurAmount * to.rate)
}

export const formatSalary = (amount: number, currency: string): string => {
  const currencyInfo = CURRENCIES[currency as keyof typeof CURRENCIES]
  if (!currencyInfo) return amount.toString()
  
  const formatted = amount.toLocaleString()
  return currencyInfo.format === 'before' 
    ? `${currencyInfo.symbol}${formatted}`
    : `${formatted} ${currencyInfo.symbol}`
}