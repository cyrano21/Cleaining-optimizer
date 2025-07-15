export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface TravelTimeInfo {
  duration: {
    text: string;
    value: number; // seconds
  };
  distance: {
    text: string;
    value: number; // meters
  };
  mode: 'driving' | 'transit' | 'walking' | 'bicycling';
}

export interface JobWithLocation {
  id: string;
  title: string;
  company: string;
  location: string;
  geoLocation: GeoLocation;
  travelTime?: TravelTimeInfo;
}

// Données simulées pour les offres d'emploi avec géolocalisation
export const mockJobsWithLocation: JobWithLocation[] = [
  {
    id: '1',
    title: 'Développeur Full Stack JavaScript',
    company: 'TechCorp',
    location: 'Paris, France',
    geoLocation: {
      lat: 48.856614,
      lng: 2.3522219,
      address: '12 Rue de Rivoli, 75001 Paris, France'
    }
  },
  {
    id: '2',
    title: 'Développeur Frontend React',
    company: 'StartupInnovante',
    location: 'Lyon, France',
    geoLocation: {
      lat: 45.764043,
      lng: 4.835659,
      address: '25 Rue de la République, 69002 Lyon, France'
    }
  },
  {
    id: '3',
    title: 'Ingénieur DevOps',
    company: 'CloudSolutions',
    location: 'Toulouse, France',
    geoLocation: {
      lat: 43.604652,
      lng: 1.444209,
      address: '8 Place du Capitole, 31000 Toulouse, France'
    }
  },
  {
    id: '4',
    title: 'Designer UX/UI',
    company: 'AgenceDigitale',
    location: 'Bordeaux, France',
    geoLocation: {
      lat: 44.837789,
      lng: -0.57918,
      address: '15 Cours de l\'Intendance, 33000 Bordeaux, France'
    }
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'DataInsights',
    location: 'Paris, France',
    geoLocation: {
      lat: 48.873792,
      lng: 2.295028,
      address: '45 Avenue des Champs-Élysées, 75008 Paris, France'
    }
  }
];
