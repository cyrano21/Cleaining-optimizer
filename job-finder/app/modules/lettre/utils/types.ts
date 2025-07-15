export interface CoverLetter {
  id?: string;
  title: string;
  company: string;
  position: string;
  recipientName?: string;
  recipientPosition?: string;
  companyAddress?: string;
  city?: string;
  date: string;
  content: string;
  tone: 'formal' | 'casual' | 'enthusiastic' | 'professional';
  language: 'french' | 'english' | 'spanish' | 'german';
  cvId?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const defaultCoverLetter: CoverLetter = {
  title: 'Ma lettre de motivation',
  company: '',
  position: '',
  recipientName: '',
  recipientPosition: '',
  companyAddress: '',
  city: '',
  date: new Date().toISOString().split('T')[0],
  content: '',
  tone: 'professional',
  language: 'french'
};

export interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export const coverLetterTemplates: CoverLetterTemplate[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Un modèle classique et professionnel adapté à la plupart des secteurs',
    template: `Madame, Monsieur,

Je vous soumets ma candidature pour le poste de {{position}} au sein de {{company}}.

Fort d'une expérience significative dans ce domaine, je suis convaincu de pouvoir apporter une contribution précieuse à votre équipe. Mon parcours m'a permis de développer des compétences en [compétences clés], qui correspondent parfaitement aux exigences mentionnées dans votre offre d'emploi.

Au cours de mes précédentes expériences, j'ai notamment [réalisation importante] ce qui a permis [résultat obtenu]. Je suis particulièrement intéressé par [aspect spécifique de l'entreprise] et souhaite mettre mes compétences au service de votre organisation.

Je serais ravi de pouvoir échanger avec vous lors d'un entretien pour vous présenter plus en détail ma motivation et mes qualifications.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`
  },
  {
    id: 'creative',
    name: 'Créatif',
    description: 'Un modèle dynamique pour les secteurs créatifs et innovants',
    template: `Bonjour,

C'est avec enthousiasme que je postule au poste de {{position}} chez {{company}}.

Passionné par [domaine d'activité], je suis attiré par l'approche innovante de votre entreprise et sa réputation dans le secteur. Votre récent projet [projet spécifique] m'a particulièrement impressionné.

Mon expérience en [domaine d'expertise] m'a permis de développer une approche créative et efficace pour [compétence clé]. Chez [ancien employeur], j'ai pu [réalisation concrète] qui a abouti à [résultat mesurable].

Je serais ravi de pouvoir apporter cette même énergie et créativité à votre équipe. Pourrions-nous échanger sur la façon dont mes compétences pourraient contribuer aux projets de {{company}} ?

Dans l'attente de votre retour, je vous remercie pour votre considération.

Cordialement,`
  },
  {
    id: 'direct',
    name: 'Direct',
    description: 'Un modèle concis et percutant pour aller droit au but',
    template: `Madame, Monsieur,

Je souhaite rejoindre {{company}} en tant que {{position}} et vous présente ma candidature.

Voici pourquoi je serais un atout pour votre équipe :
- [Compétence clé 1] avec [X] années d'expérience
- [Compétence clé 2] ayant permis de [résultat concret]
- [Compétence clé 3] développée lors de [contexte spécifique]

Ce qui m'attire chez {{company}} : [élément spécifique à l'entreprise].

Je suis disponible pour un entretien à votre convenance et vous remercie de l'attention portée à ma candidature.

Cordialement,`
  }
];
