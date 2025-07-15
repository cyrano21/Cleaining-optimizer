"use client";

import { createContext, useContext, useState } from "react";
import {
  InterviewQuestion,
  InterviewFeedback,
  CVFeedback,
  CoverLetterFeedback,
  ProfileImprovement,
  Affirmation,
} from "./types";
import { mockInterviewQuestions, mockAffirmations } from "./mockData";

interface CoachingContextType {
  // Simulateur d'entretien
  currentQuestion: InterviewQuestion | null;
  interviewHistory: { question: InterviewQuestion; answer: string }[];
  interviewFeedback: InterviewFeedback | null;
  startInterview: (category?: string, difficulty?: string) => void;
  answerQuestion: (answer: string) => Promise<void>;
  getNextQuestion: () => void;
  endInterview: () => Promise<InterviewFeedback>;

  // Corrections CV et lettre
  analyzeCv: (cvId: string) => Promise<CVFeedback>;
  analyzeCoverLetter: (letterId: string) => Promise<CoverLetterFeedback>;

  // Suggestions d'amélioration
  profileImprovements: ProfileImprovement[];
  generateProfileImprovements: () => Promise<ProfileImprovement[]>;
  implementImprovement: (id: string) => void;

  // Affirmations
  dailyAffirmations: Affirmation[];
  generateAffirmations: (category?: string) => Promise<Affirmation[]>;
}

const CoachingContext = createContext<CoachingContextType | undefined>(
  undefined
);

export function CoachingProvider({ children }: { children: React.ReactNode }) {
  // État pour le simulateur d'entretien
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<
    { question: InterviewQuestion; answer: string }[]
  >([]);
  const [interviewFeedback, setInterviewFeedback] =
    useState<InterviewFeedback | null>(null);

  // État pour les suggestions d'amélioration
  const [profileImprovements, setProfileImprovements] = useState<
    ProfileImprovement[]
  >([]);

  // État pour les affirmations
  const [dailyAffirmations, setDailyAffirmations] = useState<Affirmation[]>([]);

  // Fonctions pour le simulateur d'entretien
  const startInterview = (category?: string, difficulty?: string) => {
    // Filtrer les questions selon la catégorie et la difficulté si spécifiées
    let filteredQuestions = [...mockInterviewQuestions];

    if (category) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.category === category
      );
    }

    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.difficulty === difficulty
      );
    }

    // Mélanger les questions et en prendre 5 aléatoirement
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    // Réinitialiser l'état de l'entretien
    setInterviewHistory([]);
    setInterviewFeedback(null);

    // Définir la première question
    if (selected.length > 0) {
      setCurrentQuestion(selected[0]);
    } else {
      // Si aucune question ne correspond aux critères, prendre une question aléatoire
      setCurrentQuestion(
        mockInterviewQuestions[
          Math.floor(Math.random() * mockInterviewQuestions.length)
        ]
      );
    }
  };

  const answerQuestion = async (answer: string) => {
    if (!currentQuestion) return;

    // Ajouter la question et la réponse à l'historique
    setInterviewHistory((prev) => [
      ...prev,
      { question: currentQuestion, answer },
    ]);

    // Simuler un délai pour l'analyse IA
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const getNextQuestion = () => {
    // Exclure les questions déjà posées
    const askedQuestionIds = interviewHistory.map((item) => item.question.id);
    const remainingQuestions = mockInterviewQuestions.filter(
      (q) => !askedQuestionIds.includes(q.id)
    );

    if (remainingQuestions.length > 0 && interviewHistory.length < 5) {
      // Prendre une question aléatoire parmi les questions restantes
      const nextQuestion =
        remainingQuestions[
          Math.floor(Math.random() * remainingQuestions.length)
        ];
      setCurrentQuestion(nextQuestion);
    } else {
      // Fin de l'entretien
      setCurrentQuestion(null);
    }
  };

  const endInterview = async (): Promise<InterviewFeedback> => {
    // Simuler un délai pour l'analyse IA
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Générer un feedback simulé
    const feedback: InterviewFeedback = {
      strengths: [
        "Bonne articulation des idées",
        "Exemples concrets et pertinents",
        "Attitude positive et enthousiaste",
      ],
      improvements: [
        "Structurer davantage les réponses",
        "Être plus concis sur certaines questions",
        "Mettre davantage en avant les résultats obtenus",
      ],
      overallScore: Math.floor(70 + Math.random() * 20),
      confidenceScore: Math.floor(65 + Math.random() * 25),
      clarityScore: Math.floor(70 + Math.random() * 20),
      relevanceScore: Math.floor(75 + Math.random() * 20),
      suggestions:
        "Continuez à pratiquer les entretiens en vous enregistrant. Préparez des exemples STAR (Situation, Tâche, Action, Résultat) pour les questions comportementales. Renseignez-vous davantage sur les entreprises avant les entretiens.",
    };

    setInterviewFeedback(feedback);
    return feedback;
  };

  // Fonctions pour les corrections CV et lettre
  const analyzeCv = async (): Promise<CVFeedback> => {
    // Simuler un délai pour l'analyse IA
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Générer un feedback simulé
    const feedback: CVFeedback = {
      strengths: [
        "Structure claire et bien organisée",
        "Expériences professionnelles bien détaillées",
        "Compétences techniques pertinentes",
      ],
      weaknesses: [
        "Manque de quantification des résultats",
        "Certaines descriptions sont trop génériques",
        "Absence de mots-clés spécifiques au secteur",
      ],
      suggestions: [
        "Ajouter des chiffres et des pourcentages pour quantifier vos réalisations",
        "Personnaliser davantage le CV pour chaque candidature",
        'Inclure une section "Réalisations clés" pour chaque expérience',
        "Utiliser des verbes d'action plus percutants",
      ],
      overallScore: Math.floor(65 + Math.random() * 25),
      formatScore: Math.floor(70 + Math.random() * 20),
      contentScore: Math.floor(60 + Math.random() * 30),
      impactScore: Math.floor(65 + Math.random() * 25),
    };

    return feedback;
  };

  const analyzeCoverLetter = async (): Promise<CoverLetterFeedback> => {
    // Simuler un délai pour l'analyse IA
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Générer un feedback simulé
    const feedback: CoverLetterFeedback = {
      strengths: [
        "Bonne introduction qui capte l'attention",
        "Lien clair entre vos compétences et le poste",
        "Ton professionnel et enthousiaste",
      ],
      weaknesses: [
        "Manque de personnalisation pour l'entreprise spécifique",
        "Conclusion qui pourrait être plus percutante",
        "Quelques formulations trop génériques",
      ],
      suggestions: [
        "Mentionner des projets ou réalisations spécifiques de l'entreprise",
        "Renforcer la conclusion avec un appel à l'action clair",
        "Mettre davantage en avant votre valeur ajoutée unique",
        "Adapter le ton à la culture de l'entreprise",
      ],
      overallScore: Math.floor(70 + Math.random() * 20),
      relevanceScore: Math.floor(65 + Math.random() * 25),
      persuasionScore: Math.floor(70 + Math.random() * 20),
      languageScore: Math.floor(75 + Math.random() * 20),
    };

    return feedback;
  };

  // Fonctions pour les suggestions d'amélioration
  const generateProfileImprovements = async (): Promise<
    ProfileImprovement[]
  > => {
    // Simuler un délai pour l'analyse IA
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Générer des suggestions simulées
    const improvements: ProfileImprovement[] = [
      {
        id: "1",
        category: "skills",
        title: "Ajouter des compétences techniques spécifiques",
        description:
          "Précisez les technologies, outils et méthodologies que vous maîtrisez avec leur niveau d'expertise.",
        priority: "high",
        implemented: false,
      },
      {
        id: "2",
        category: "experience",
        title: "Quantifier vos réalisations",
        description:
          "Ajoutez des chiffres, pourcentages et métriques pour démontrer l'impact de votre travail.",
        priority: "high",
        implemented: false,
      },
      {
        id: "3",
        category: "projects",
        title: "Ajouter des projets personnels",
        description:
          "Incluez des projets personnels ou open source qui démontrent votre passion et vos compétences.",
        priority: "medium",
        implemented: false,
      },
      {
        id: "4",
        category: "education",
        title: "Détailler les formations complémentaires",
        description:
          "Mentionnez les certifications, MOOC et formations continues pertinentes pour votre domaine.",
        priority: "medium",
        implemented: false,
      },
      {
        id: "5",
        category: "general",
        title: "Optimiser pour les ATS",
        description:
          "Intégrez des mots-clés pertinents pour passer les systèmes de suivi des candidatures (ATS).",
        priority: "high",
        implemented: false,
      },
    ];

    setProfileImprovements(improvements);
    return improvements;
  };

  const implementImprovement = (id: string) => {
    setProfileImprovements((prev) =>
      prev.map((improvement) =>
        improvement.id === id
          ? { ...improvement, implemented: true }
          : improvement
      )
    );
  };

  // Fonctions pour les affirmations
  const generateAffirmations = async (
    category?: string
  ): Promise<Affirmation[]> => {
    // Simuler un délai pour la génération
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Filtrer les affirmations selon la catégorie si spécifiée
    let filteredAffirmations = [...mockAffirmations];

    if (category) {
      filteredAffirmations = filteredAffirmations.filter(
        (a) => a.category === category
      );
    }

    // Mélanger les affirmations et en prendre 3 aléatoirement
    const shuffled = filteredAffirmations.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    setDailyAffirmations(selected);
    return selected;
  };

  return (
    <CoachingContext.Provider
      value={{
        // Simulateur d'entretien
        currentQuestion,
        interviewHistory,
        interviewFeedback,
        startInterview,
        answerQuestion,
        getNextQuestion,
        endInterview,

        // Corrections CV et lettre
        analyzeCv,
        analyzeCoverLetter,

        // Suggestions d'amélioration
        profileImprovements,
        generateProfileImprovements,
        implementImprovement,

        // Affirmations
        dailyAffirmations,
        generateAffirmations,
      }}
    >
      {children}
    </CoachingContext.Provider>
  );
}

export function useCoaching() {
  const context = useContext(CoachingContext);
  if (context === undefined) {
    throw new Error("useCoaching must be used within a CoachingProvider");
  }
  return context;
}
