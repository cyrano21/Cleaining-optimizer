import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GamificationProvider, useGamification } from '../components/gamification/GamificationContext';

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const { xp, level, addXp, unlockBadge, badges } = useGamification();
  
  return (
    <div>
      <div data-testid="xp">{xp}</div>
      <div data-testid="level">{level}</div>
      <div data-testid="badges-count">{badges.length}</div>
      <button onClick={() => addXp(100)}>Ajouter XP</button>
      <button onClick={() => unlockBadge('first_step')}>Débloquer badge</button>
    </div>
  );
};

describe('GamificationContext', () => {
  it('provides initial values', () => {
    render(
      <GamificationProvider>
        <TestComponent />
      </GamificationProvider>
    );
    
    // Vérifier les valeurs initiales
    expect(screen.getByTestId('xp').textContent).toBe('0');
    expect(screen.getByTestId('level').textContent).toBe('1');
    expect(screen.getByTestId('badges-count').textContent).toBe('0');
  });

  it('allows adding XP points', () => {
    render(
      <GamificationProvider>
        <TestComponent />
      </GamificationProvider>
    );
    
    // Ajouter des points XP
    fireEvent.click(screen.getByText('Ajouter XP'));
    
    // Vérifier que les points ont été ajoutés
    expect(screen.getByTestId('xp').textContent).toBe('100');
  });

  it('updates level when enough XP is earned', () => {
    render(
      <GamificationProvider>
        <TestComponent />
      </GamificationProvider>
    );
    
    // Ajouter suffisamment de points XP pour monter de niveau
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByText('Ajouter XP'));
    }
    
    // Vérifier que le niveau a été mis à jour
    expect(screen.getByTestId('xp').textContent).toBe('600');
    expect(screen.getByTestId('level').textContent).toBe('2');
  });

  it('allows unlocking badges', () => {
    render(
      <GamificationProvider>
        <TestComponent />
      </GamificationProvider>
    );
    
    // Débloquer un badge
    fireEvent.click(screen.getByText('Débloquer badge'));
    
    // Vérifier que le badge a été débloqué
    expect(screen.getByTestId('badges-count').textContent).toBe('1');
  });
});
