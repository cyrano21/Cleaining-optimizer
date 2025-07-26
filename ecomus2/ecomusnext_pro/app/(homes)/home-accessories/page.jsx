import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeAccessories() {
  return (
    <DynamicHomeTemplate 
      templateId="home-accessories" 
      fallbackTemplate="home-accessories"
    />
  );
}

export const metadata = {
  title: 'Home Accessories - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
