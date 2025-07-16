import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';

// Tests pour le composant Button
describe('Button Component', () => {
  it('renders correctly with primary variant', () => {
    render(<Button>Cliquez-moi</Button>);
    const button = screen.getByText('Cliquez-moi');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-indigo-600');
  });

  it('renders as a link when href is provided', () => {
    render(<Button href="/test">Lien</Button>);
    const link = screen.getByText('Lien');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondaire</Button>);
    expect(screen.getByText('Secondaire')).toHaveClass('bg-emerald-500');
    
    rerender(<Button variant="outline">Contour</Button>);
    expect(screen.getByText('Contour')).toHaveClass('border-indigo-600');
    
    rerender(<Button variant="ghost">Fantôme</Button>);
    expect(screen.getByText('Fantôme')).toHaveClass('text-indigo-600');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Cliquer</Button>);
    fireEvent.click(screen.getByText('Cliquer'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// Tests pour le composant Card
describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <p>Contenu de la carte</p>
      </Card>
    );
    expect(screen.getByText('Contenu de la carte')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Card title="Titre de la carte">
        <p>Contenu</p>
      </Card>
    );
    expect(screen.getByText('Titre de la carte')).toBeInTheDocument();
  });

  it('renders with border when bordered prop is true', () => {
    render(
      <Card bordered>
        <p>Carte avec bordure</p>
      </Card>
    );
    const card = screen.getByText('Carte avec bordure').closest('div');
    expect(card).toHaveClass('border-t-4');
    expect(card).toHaveClass('border-indigo-500');
  });

  it('renders footer when provided', () => {
    render(
      <Card 
        footer={<button>Action</button>}
      >
        <p>Contenu</p>
      </Card>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});

// Tests pour le composant Modal
describe('Modal Component', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal 
        isOpen={false} 
        onClose={() => {}} 
        title="Modal fermée"
      >
        <p>Contenu invisible</p>
      </Modal>
    );
    expect(screen.queryByText('Modal fermée')).not.toBeInTheDocument();
    expect(screen.queryByText('Contenu invisible')).not.toBeInTheDocument();
  });

  it('renders content when isOpen is true', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Modal ouverte"
      >
        <p>Contenu visible</p>
      </Modal>
    );
    expect(screen.getByText('Modal ouverte')).toBeInTheDocument();
    expect(screen.getByText('Contenu visible')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal 
        isOpen={true} 
        onClose={handleClose} 
        title="Modal avec bouton"
      >
        <p>Contenu</p>
      </Modal>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

// Tests pour le composant Alert
describe('Alert Component', () => {
  it('renders with correct type styles', () => {
    const { rerender } = render(
      <Alert type="info" message="Information" />
    );
    expect(screen.getByText('Information')).toBeInTheDocument();
    let alert = screen.getByText('Information').closest('div');
    expect(alert).toHaveClass('bg-blue-50');
    
    rerender(<Alert type="success" message="Succès" />);
    alert = screen.getByText('Succès').closest('div');
    expect(alert).toHaveClass('bg-green-50');
    
    rerender(<Alert type="warning" message="Attention" />);
    alert = screen.getByText('Attention').closest('div');
    expect(alert).toHaveClass('bg-yellow-50');
    
    rerender(<Alert type="error" message="Erreur" />);
    alert = screen.getByText('Erreur').closest('div');
    expect(alert).toHaveClass('bg-red-50');
  });

  it('can be dismissed when dismissible is true', () => {
    render(<Alert message="Alerte à fermer" dismissible={true} />);
    expect(screen.getByText('Alerte à fermer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Alerte à fermer')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Alert title="Titre d'alerte" message="Message" />);
    expect(screen.getByText("Titre d'alerte")).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <Alert 
        message="Alerte avec actions" 
        actions={<button>Action</button>}
      />
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
