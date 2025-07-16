"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CodeEditor from "../editor/CodeEditor";
import QuizComponent from "../lessons/QuizComponent";
import ExerciseComponent from "../lessons/ExerciseComponent";
import ExerciseWithPreview from "../editor/ExerciseWithPreview";
import Tabs from "../ui/Tabs";
import AIAssistant from "./AIAssistant";

/**
 * Composant pédagogique complet qui structure l'apprentissage d'un concept
 * selon une approche progressive: théorie, exemple, pratique, évaluation
 */
export default function LearningSection({
  title,
  description,
  theory,
  example,
  quiz,
  practice,
  codeExercise,
  keyPoints,
  onComplete,
  moduleId,
  lessonId,
  difficulty = "débutant"
}) {
  const [progress, setProgress] = useState("theory");
  const [completed, setCompleted] = useState({
    theory: false,
    example: false,
    quiz: false,
    practice: false,
    exercise: false,
  });
  const [xpEarned, setXpEarned] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const handleSectionComplete = (section, xpPoints = 0) => {
    setCompleted((prev) => ({
      ...prev,
      [section]: true,
    }));

    setXpEarned((prev) => prev + xpPoints);

    if (onComplete) {
      onComplete(section, xpPoints);
    }
  };

  const tabs = [
    {
      label: "Théorie",
      content: (
        <div className="space-y-4">
          <div className="prose max-w-none">{theory}</div>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            onClick={() => {
              handleSectionComplete("theory", 5);
              setProgress("example");
            }}
          >
            J'ai compris
          </button>
        </div>
      ),
    },
    {
      label: "Exemple",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{example.description}</p>
          <CodeEditor
            initialCode={example.code}
            language={example.language}
            height="250px"
            showPreview={true}
            autoPreview={true}
            readOnly={example.readOnly !== false}
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            onClick={() => {
              handleSectionComplete("example", 5);
              setProgress("quiz");
            }}
          >
            Continuer
          </button>
        </div>
      ),
    },
    {
      label: "Quiz",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Vérifiez votre compréhension en répondant à ces questions :
          </p>
          <QuizComponent
            quiz={quiz}
            onComplete={() => {
              handleSectionComplete("quiz", 15);
              setProgress("practice");
            }}
          />
        </div>
      ),
    },
    {
      label: "Exercice guidé",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Mettez en pratique ce que vous avez appris avec cet exercice guidé :
          </p>
          {practice && (
            <ExerciseComponent
              exercise={practice}
              onComplete={() => {
                handleSectionComplete("practice", 20);
                setProgress("exercise");
              }}
            />
          )}
        </div>
      ),
    },
    {
      label: "Exercice pratique",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            À vous de jouer ! Réalisez cet exercice pour valider vos acquis :
          </p>
          {codeExercise && (
            <ExerciseWithPreview
              exercise={codeExercise}
              onComplete={(id, points) => {
                handleSectionComplete("exercise", points || 30);
              }}
            />
          )}
        </div>
      ),
    },
    {
      label: "Points clés",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Points clés à retenir
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {keyPoints && keyPoints.length > 0 ? (
              keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))
            ) : (
              <li>Aucun point clé disponible pour cette leçon.</li>
            )}
          </ul>
          <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 mt-6">
            <p className="text-indigo-700">
              <span className="font-bold">Félicitations !</span> Vous avez gagné{" "}
              {xpEarned} points XP en complétant cette section.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const getActiveTabIndex = () => {
    switch (progress) {
      case "theory":
        return 0;
      case "example":
        return 1;
      case "quiz":
        return 2;
      case "practice":
        return 3;
      case "exercise":
        return 4;
      default:
        return 5; // Points clés
    }
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-gray-600">{description}</p>
        </motion.div>

        <Tabs tabs={tabs} defaultTab={getActiveTabIndex()} className="mt-6" />
      </motion.div>
      
      {/* Assistant IA intégré à chaque leçon */}
      <AIAssistant 
        lessonContext={{
          id: lessonId,
          title: title,
          moduleId: moduleId,
          concepts: keyPoints
        }}
        currentDifficulty={difficulty}
      />
    </>
  );
}
