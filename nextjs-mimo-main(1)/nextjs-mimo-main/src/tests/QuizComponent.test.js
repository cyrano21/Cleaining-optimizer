import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizComponent from '../components/lessons/QuizComponent';

describe('QuizComponent', () => {
  const mockQuiz = {
    title: "Quiz sur Next.js",
    questions: [
      {
        question: "Qui a créé Next.js ?",
        options: ["Facebook", "Google", "Vercel", "Amazon"],
        correctAnswer: "Vercel"
      },
      {
        question: "Quelle année a été lancé Next.js ?",
        options: ["2014", "2016", "2018", "2020"],
        correctAnswer: "2016"
      }
    ]
  };

  it('renders the first question correctly', () => {
    render(<QuizComponent quiz={mockQuiz} />);
    
    // Vérifier que la première question est affichée
    expect(screen.getByText("Qui a créé Next.js ?")).toBeInTheDocument();
    
    // Vérifier que toutes les options sont affichées
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Vercel")).toBeInTheDocument();
    expect(screen.getByText("Amazon")).toBeInTheDocument();
    
    // Vérifier que le bouton est désactivé initialement
    const button = screen.getByText("Question suivante");
    expect(button).toBeDisabled();
  });

  it('enables the next button when an option is selected', () => {
    render(<QuizComponent quiz={mockQuiz} />);
    
    // Sélectionner une option
    fireEvent.click(screen.getByText("Vercel"));
    
    // Vérifier que le bouton est activé
    const button = screen.getByText("Question suivante");
    expect(button).not.toBeDisabled();
  });

  it('navigates to the next question when button is clicked', () => {
    render(<QuizComponent quiz={mockQuiz} />);
    
    // Sélectionner une option et passer à la question suivante
    fireEvent.click(screen.getByText("Vercel"));
    fireEvent.click(screen.getByText("Question suivante"));
    
    // Vérifier que la deuxième question est affichée
    expect(screen.getByText("Quelle année a été lancé Next.js ?")).toBeInTheDocument();
    expect(screen.getByText("2014")).toBeInTheDocument();
    expect(screen.getByText("2016")).toBeInTheDocument();
    expect(screen.getByText("2018")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
  });

  it('shows results after answering all questions', () => {
    render(<QuizComponent quiz={mockQuiz} />);
    
    // Répondre à la première question
    fireEvent.click(screen.getByText("Vercel"));
    fireEvent.click(screen.getByText("Question suivante"));
    
    // Répondre à la deuxième question
    fireEvent.click(screen.getByText("2016"));
    fireEvent.click(screen.getByText("Voir les résultats"));
    
    // Vérifier que les résultats sont affichés
    expect(screen.getByText("Résultats du quiz")).toBeInTheDocument();
    expect(screen.getByText("Vous avez obtenu 2/2 réponses correctes")).toBeInTheDocument();
    expect(screen.getByText("Félicitations ! Vous avez répondu correctement à toutes les questions.")).toBeInTheDocument();
  });
});
