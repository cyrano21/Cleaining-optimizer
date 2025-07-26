import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomePaddleBoards() {
  return (
    <DynamicHomeTemplate 
      templateId="home-paddle-boards" 
      fallbackTemplate="home-paddle-boards"
    />
  );
}

export const metadata = {
  title: 'Home Paddle Boards - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
