import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeSneaker() {
  return (
    <DynamicHomeTemplate 
      templateId="home-sneaker" 
      fallbackTemplate="home-sneaker"
    />
  );
}

export const metadata = {
  title: 'Home Sneaker - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
