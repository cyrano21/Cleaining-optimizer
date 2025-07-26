import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeMen() {
  return (
    <DynamicHomeTemplate 
      templateId="home-men" 
      fallbackTemplate="home-men"
    />
  );
}

export const metadata = {
  title: 'Home Men - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
