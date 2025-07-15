import { InterviewQuestion, Affirmation } from './types';

// Données simulées pour les questions d'entretien
export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    id: '1',
    question: 'Parlez-moi de vous et de votre parcours professionnel.',
    category: 'personal',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'Pourquoi souhaitez-vous rejoindre notre entreprise ?',
    category: 'company',
    difficulty: 'medium'
  },
  {
    id: '3',
    question: 'Décrivez une situation difficile que vous avez rencontrée dans votre travail et comment vous l\'avez surmontée.',
    category: 'behavioral',
    difficulty: 'medium'
  },
  {
    id: '4',
    question: 'Quelles sont vos principales forces et faiblesses ?',
    category: 'personal',
    difficulty: 'medium'
  },
  {
    id: '5',
    question: 'Comment gérez-vous les délais serrés et la pression ?',
    category: 'behavioral',
    difficulty: 'medium'
  },
  {
    id: '6',
    question: 'Où vous voyez-vous dans 5 ans ?',
    category: 'personal',
    difficulty: 'easy'
  },
  {
    id: '7',
    question: 'Décrivez un projet dont vous êtes particulièrement fier.',
    category: 'experience',
    difficulty: 'medium'
  },
  {
    id: '8',
    question: 'Comment restez-vous à jour dans votre domaine ?',
    category: 'technical',
    difficulty: 'easy'
  },
  {
    id: '9',
    question: 'Quelle est votre approche pour résoudre des problèmes complexes ?',
    category: 'technical',
    difficulty: 'hard'
  },
  {
    id: '10',
    question: 'Comment gérez-vous les conflits au sein d\'une équipe ?',
    category: 'behavioral',
    difficulty: 'hard'
  }
];

// Données simulées pour les affirmations
export const mockAffirmations: Affirmation[] = [
  {
    id: '1',
    text: 'Je suis parfaitement préparé pour réussir dans ma recherche d\'emploi.',
    category: 'confidence'
  },
  {
    id: '2',
    text: 'Chaque entretien est une opportunité d\'apprentissage, quelle que soit l\'issue.',
    category: 'growth'
  },
  {
    id: '3',
    text: 'Mes compétences et mon expérience apportent une valeur unique aux entreprises.',
    category: 'confidence'
  },
  {
    id: '4',
    text: 'Je transforme les refus en opportunités de croissance et d\'amélioration.',
    category: 'resilience'
  },
  {
    id: '5',
    text: 'Je reste motivé et persévérant, sachant que le bon poste m\'attend.',
    category: 'motivation'
  },
  {
    id: '6',
    text: 'Je mérite un emploi qui valorise mes talents et respecte mes valeurs.',
    category: 'success'
  },
  {
    id: '7',
    text: 'Chaque jour, je fais un pas de plus vers mon objectif professionnel.',
    category: 'motivation'
  },
  {
    id: '8',
    text: 'Je communique avec clarté et assurance lors de mes entretiens.',
    category: 'confidence'
  },
  {
    id: '9',
    text: 'Les défis sont des occasions de démontrer ma capacité d\'adaptation.',
    category: 'resilience'
  },
  {
    id: '10',
    text: 'Je célèbre chaque progrès dans mon parcours professionnel.',
    category: 'success'
  }
];