import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeEditor from '../components/editor/CodeEditor';

// Mock des fonctions
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('CodeEditor Component', () => {
  const initialCode = "// Exemple de code\nconsole.log('Hello world');";
  const solution = "// Solution\nconsole.log('Hello world!');";

  it('renders correctly with initial code', () => {
    render(<CodeEditor initialCode={initialCode} solution={solution} />);
    
    // Vérifier que l'éditeur est rendu avec le code initial
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe(initialCode);
    
    // Vérifier que les boutons sont présents
    expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    expect(screen.getByText('Voir solution')).toBeInTheDocument();
    expect(screen.getByText('Exécuter le code')).toBeInTheDocument();
  });

  it('shows solution when button is clicked', () => {
    render(<CodeEditor initialCode={initialCode} solution={solution} />);
    
    // Cliquer sur le bouton pour voir la solution
    fireEvent.click(screen.getByText('Voir solution'));
    
    // Vérifier que la solution est affichée
    expect(screen.getByText(solution)).toBeInTheDocument();
    expect(screen.getByText('Cacher solution')).toBeInTheDocument();
  });

  it('resets code when reset button is clicked', () => {
    render(<CodeEditor initialCode={initialCode} solution={solution} />);
    
    // Modifier le code
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Modified code' } });
    expect(textarea.value).toBe('Modified code');
    
    // Cliquer sur le bouton de réinitialisation
    fireEvent.click(screen.getByText('Réinitialiser'));
    
    // Vérifier que le code est réinitialisé
    expect(textarea.value).toBe(initialCode);
  });

  it('checks code when execute button is clicked', () => {
    render(<CodeEditor initialCode={initialCode} solution={solution} />);
    
    // Modifier le code pour qu'il soit correct
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: "return <h1>Titre</h1><p>Paragraphe</p>;" } });
    
    // Cliquer sur le bouton d'exécution
    fireEvent.click(screen.getByText('Exécuter le code'));
    
    // Vérifier que le message de succès est affiché
    expect(screen.getByText('Bravo ! Votre code fonctionne correctement.')).toBeInTheDocument();
    expect(screen.getByText('Continuer')).toBeInTheDocument();
  });
});
