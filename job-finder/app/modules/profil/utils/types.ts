export interface Profile {
  id?: string;
  slug: string;
  title: string;
  bio: string;
  socialLinks: SocialLink[];
  projects: Project[];
  cvId?: string;
  coverLetterIds?: string[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'github' | 'twitter' | 'portfolio' | 'other';
  url: string;
  label?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  tags: string[];
  startDate?: string;
  endDate?: string;
}

export const defaultProfile: Profile = {
  slug: '',
  title: 'Mon profil professionnel',
  bio: '',
  socialLinks: [],
  projects: []
};