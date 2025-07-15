export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalCVs: number;
  totalCoverLetters: number;
  totalJobApplications: number;
  revenueThisMonth: number;
  usersByRole: {
    FREE: number;
    PRO: number;
    COACH: number;
    ADMIN: number;
  };
  newUsersThisWeek: number;
  subscriptionsByPlan: {
    pro: number;
    coach: number;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  role: 'FREE' | 'PRO' | 'COACH' | 'ADMIN';
  subscriptionStatus: string | null;
  createdAt: Date;
  lastLogin: Date | null;
  cvCount: number;
  coverLetterCount: number;
}

export interface LogEntry {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  details: string;
  timestamp: Date;
  ip: string | null;
}

// Données simulées pour les statistiques
export const mockAdminStats: AdminStats = {
  totalUsers: 1245,
  activeSubscriptions: 387,
  totalCVs: 2156,
  totalCoverLetters: 1893,
  totalJobApplications: 4521,
  revenueThisMonth: 4256.78,
  usersByRole: {
    FREE: 858,
    PRO: 276,
    COACH: 111,
    ADMIN: 3
  },
  newUsersThisWeek: 87,
  subscriptionsByPlan: {
    pro: 276,
    coach: 111
  }
};

// Données simulées pour la liste des utilisateurs
export const mockUsers: UserListItem[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'PRO',
    subscriptionStatus: 'active',
    createdAt: new Date('2025-01-15'),
    lastLogin: new Date('2025-04-16'),
    cvCount: 3,
    coverLetterCount: 5
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'COACH',
    subscriptionStatus: 'active',
    createdAt: new Date('2025-02-10'),
    lastLogin: new Date('2025-04-15'),
    cvCount: 2,
    coverLetterCount: 4
  },
  {
    id: '3',
    email: 'robert.johnson@example.com',
    name: 'Robert Johnson',
    role: 'FREE',
    subscriptionStatus: null,
    createdAt: new Date('2025-03-05'),
    lastLogin: new Date('2025-04-10'),
    cvCount: 1,
    coverLetterCount: 2
  },
  {
    id: '4',
    email: 'sarah.williams@example.com',
    name: 'Sarah Williams',
    role: 'PRO',
    subscriptionStatus: 'active',
    createdAt: new Date('2025-03-20'),
    lastLogin: new Date('2025-04-17'),
    cvCount: 4,
    coverLetterCount: 3
  },
  {
    id: '5',
    email: 'michael.brown@example.com',
    name: 'Michael Brown',
    role: 'FREE',
    subscriptionStatus: null,
    createdAt: new Date('2025-04-01'),
    lastLogin: new Date('2025-04-12'),
    cvCount: 1,
    coverLetterCount: 0
  }
];

// Données simulées pour les logs
export const mockLogs: LogEntry[] = [
  {
    id: '1',
    userId: '1',
    userEmail: 'john.doe@example.com',
    action: 'LOGIN',
    details: 'Connexion réussie',
    timestamp: new Date('2025-04-16T10:23:45'),
    ip: '192.168.1.1'
  },
  {
    id: '2',
    userId: '2',
    userEmail: 'jane.smith@example.com',
    action: 'SUBSCRIPTION_UPDATED',
    details: 'Passage au plan Coach+',
    timestamp: new Date('2025-04-15T14:12:30'),
    ip: '192.168.1.2'
  },
  {
    id: '3',
    userId: '3',
    userEmail: 'robert.johnson@example.com',
    action: 'CV_CREATED',
    details: 'Création d\'un nouveau CV',
    timestamp: new Date('2025-04-10T09:45:12'),
    ip: '192.168.1.3'
  },
  {
    id: '4',
    userId: '4',
    userEmail: 'sarah.williams@example.com',
    action: 'COVER_LETTER_CREATED',
    details: 'Création d\'une nouvelle lettre de motivation',
    timestamp: new Date('2025-04-17T11:32:18'),
    ip: '192.168.1.4'
  },
  {
    id: '5',
    userId: '5',
    userEmail: 'michael.brown@example.com',
    action: 'LOGIN',
    details: 'Connexion réussie',
    timestamp: new Date('2025-04-12T16:54:23'),
    ip: '192.168.1.5'
  }
];
