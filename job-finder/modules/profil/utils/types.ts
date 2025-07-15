// Types pour le module Profil
export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  biography?: string;
  jobTitle?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfilePreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    jobAlerts: boolean;
    marketing: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
  jobSearchPreferences: {
    roles: string[];
    locations: string[];
    remote: boolean;
    contractTypes: ('CDI' | 'CDD' | 'Freelance' | 'Stage' | 'Alternance')[];
    minSalary?: number;
  };
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface ProfileContextType {
  profile: UserProfile | null;
  preferences: ProfilePreferences | null;
  subscription: UserSubscription | null;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (data: Partial<ProfilePreferences>) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  resetProfile: () => void;
}