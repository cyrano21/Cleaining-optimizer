export interface CVSection {
  id: string;
  type: 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications' | 'interests' | 'summary';
  title: string;
  content: (Experience | Education | Skill | Language | Project | Certification | Interest)[] | { content: string };
  order: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Language {
  id: string;
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url?: string;
  startDate: string;
  endDate: string | null;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface Summary {
  content: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  photo?: string;
}

export interface CV {
  id?: string;
  title: string;
  template: 'professional' | 'creative' | 'simple' | 'modern' | 'executive' | 'minimal';
  personalInfo: PersonalInfo;
  sections: CVSection[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const defaultCV: CV = {
  title: 'Mon CV',
  template: 'professional',
  personalInfo: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
  },
  sections: [
    {
      id: 'summary',
      type: 'summary',
      title: 'Résumé',
      content: { content: '' },
      order: 0,
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'Expérience professionnelle',
      content: [],
      order: 1,
    },
    {
      id: 'education',
      type: 'education',
      title: 'Formation',
      content: [],
      order: 2,
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Compétences',
      content: [],
      order: 3,
    },
    {
      id: 'languages',
      type: 'languages',
      title: 'Langues',
      content: [],
      order: 4,
    },
  ],
};
