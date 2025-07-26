import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeCosmetic() {
  return (
    <DynamicHomeTemplate 
      templateId="home-cosmetic" 
      fallbackTemplate="home-cosmetic"
    />
  );
}

export const metadata = {
  title: 'Home Cosmetic - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
