import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseComponent from '../components/lessons/ExerciseComponent';

describe('ExerciseComponent', () => {
  const mockExercise = {
    title: "Identifier les avantages de Next.js",
    description: "Parmi les options suivantes, sélectionnez les avantages qu'offre Next.js par rapport à React seul.",
    options: [
      { id: 1, text: "Rendu côté serveur (SSR)", correct: true },
      { id: 2, text: "Génération de sites statiques (SSG)", correct: true },
      { id: 3, text: "Routage basé sur les fichiers", correct: true },
      { id: 4, text: "Optimisation des images", correct: true },
      { id: 5, text: "Gestion d'état intégrée", correct: false },
      { id: 6, text: "Animations intégrées", correct: false }
    ],
    type: "multiple"
  };

  it('renders exercise correctly', () => {
    render(<ExerciseComponent exercise={mockExercise} />);
    
    // Vérifier que le titre et la description sont affichés
    expect(screen.getByText("Identifier les avantages de Next.js")).toBeInTheDocument();
    expect(screen.getByText("Parmi les options suivantes, sélectionnez les avantages qu'offre Next.js par rapport à React seul.")).toBeInTheDocument();
    
    // Vérifier que toutes les options sont affichées
    expect(screen.getByText("Rendu côté serveur (SSR)")).toBeInTheDocument();
    expect(screen.getByText("Génération de sites statiques (SSG)")).toBeInTheDocument();
    expect(screen.getByText("Routage basé sur les fichiers")).toBeInTheDocument();
    expect(screen.getByText("Optimisation des images")).toBeInTheDocument();
    expect(screen.getByText("Gestion d'état intégrée")).toBeInTheDocument();
    expect(screen.getByText("Animations intégrées")).toBeInTheDocument();
    
    // Vérifier que le bouton est désactivé initialement
    const button = screen.getByText("Vérifier");
    expect(button).toBeDisabled();
  });

  it('enables the check button when options are selected', () => {
    render(<ExerciseComponent exercise={mockExercise} />);
    
    // Sélectionner une option
    fireEvent.click(screen.getByText("Rendu côté serveur (SSR)"));
    
    // Vérifier que le bouton est activé
    const button = screen.getByText("Vérifier");
    expect(button).not.toBeDisabled();
  });

  it('shows correct feedback when correct options are selected', () => {
    render(<ExerciseComponent exercise={mockExercise} />);
    
    // Sélectionner les options correctes
    fireEvent.click(screen.getByText("Rendu côté serveur (SSR)"));
    fireEvent.click(screen.getByText("Génération de sites statiques (SSG)"));
    fireEvent.click(screen.getByText("Routage basé sur les fichiers"));
    fireEvent.click(screen.getByText("Optimisation des images"));
    
    // Vérifier les réponses
    fireEvent.click(screen.getByText("Vérifier"));
    
    // Vérifier que le feedback positif est affiché
    expect(screen.getByText("Bravo ! Vous avez correctement identifié les bonnes réponses.")).toBeInTheDocument();
    expect(screen.getByText("Continuer")).toBeInTheDocument();
  });

  it('shows incorrect feedback when wrong options are selected', () => {
    render(<ExerciseComponent exercise={mockExercise} />);
    
    // Sélectionner des options incorrectes
    fireEvent.click(screen.getByText("Rendu côté serveur (SSR)"));
    fireEvent.click(screen.getByText("Gestion d'état intégrée"));
    
    // Vérifier les réponses
    fireEvent.click(screen.getByText("Vérifier"));
    
    // Vérifier que le feedback négatif est affiché
    expect(screen.getByText("Ce n'est pas tout à fait ça. Essayez de revoir la théorie et réessayez.")).toBeInTheDocument();
    expect(screen.getByText("Réessayer")).toBeInTheDocument();
  });
});
