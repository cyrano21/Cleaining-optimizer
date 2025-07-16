"use client";

import { useEffect, useState } from "react";

export default function ExerciseChecker({ moduleName }) {
  const [exercisesAvailable, setExercisesAvailable] = useState(true);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérifier si les exercices sont disponibles
    const checkExercises = async () => {
      try {
        // Simuler une vérification (remplacer par votre logique réelle)
        const moduleSpecificPath = moduleName
          .toLowerCase()
          .replace(/\s+/g, "-");
        console.log(`Vérification des exercices pour: ${moduleSpecificPath}`);

        // Vérifier si les composants d'exercice sont chargés
        const exerciseElements = document.querySelectorAll(
          ".exercise-container, .quiz-container"
        );

        if (exerciseElements.length === 0) {
          console.warn(`Aucun exercice trouvé pour ${moduleName}`);

          // Vérifier si les éléments existent dans le DOM mais sont cachés
          const hiddenExercises = document.querySelectorAll(
            "[data-exercise], [data-quiz]"
          );
          if (hiddenExercises.length > 0) {
            console.log(
              "Exercices trouvés mais potentiellement cachés:",
              hiddenExercises.length
            );

            // Rendre les exercices visibles
            hiddenExercises.forEach((element) => {
              element.style.display = "block";
              element.classList.add("exercise-container");
            });

            setExercisesAvailable(true);
          } else {
            setExercisesAvailable(false);
          }
        } else {
          console.log(
            `${exerciseElements.length} exercices trouvés pour ${moduleName}`
          );
          setExercisesAvailable(true);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification des exercices:", err);
        setError(err.message);
      } finally {
        setChecking(false);
      }
    };

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === "complete") {
      checkExercises();
    } else {
      window.addEventListener("load", checkExercises);
      return () => window.removeEventListener("load", checkExercises);
    }
  }, [moduleName]);

  if (checking) return null;

  if (!exercisesAvailable && !error) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">
          Exercices non disponibles
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          Les exercices pour <strong>{moduleName}</strong> ne semblent pas être
          chargés correctement.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-sm transition-colors"
        >
          Recharger la page
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-md">
        <h3 className="text-lg font-medium text-red-800">
          Erreur de chargement
        </h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return null;
}
