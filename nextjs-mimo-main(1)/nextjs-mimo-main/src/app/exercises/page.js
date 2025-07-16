"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ExercisesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Remplacer par votre API réelle
        // const response = await fetch('/api/quizzes');
        // const data = await response.json();

        // Données factices pour les tests
        const mockData = [
          {
            id: 1,
            title: "Les bases de Next.js",
            difficulty: "Débutant",
            questionCount: 10,
          },
          {
            id: 2,
            title: "React et les Hooks",
            difficulty: "Intermédiaire",
            questionCount: 8,
          },
          {
            id: 3,
            title: "Déploiement d'applications Next.js",
            difficulty: "Avancé",
            questionCount: 12,
          },
          {
            id: 4,
            title: "Optimisation des performances",
            difficulty: "Expert",
            questionCount: 15,
          },
        ];

        setTimeout(() => {
          setQuizzes(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Erreur lors du chargement des quiz:", err);
        setError("Impossible de charger les quiz. Veuillez réessayer.");
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Exercices et Quiz</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-4 text-gray-600">Chargement des quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Exercices et Quiz</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1 px-3 rounded-md transition-colors text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Exercices et Quiz</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{quiz.title}</h2>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    quiz.difficulty === "Débutant"
                      ? "bg-green-100 text-green-800"
                      : quiz.difficulty === "Intermédiaire"
                      ? "bg-blue-100 text-blue-800"
                      : quiz.difficulty === "Avancé"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {quiz.difficulty}
                </span>
              </div>

              <p className="text-gray-600 mb-4">
                {quiz.questionCount} questions
              </p>

              <Link
                href={`/exercises/${quiz.id}`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Commencer le quiz
              </Link>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-gray-700">
            Aucun quiz disponible
          </h3>
          <p className="mt-2 text-gray-500">
            Revenez plus tard, de nouveaux quiz seront bientôt ajoutés!
          </p>
        </div>
      )}
    </div>
  );
}
