import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeDogAccessories() {
  return (
    <DynamicHomeTemplate 
      templateId="home-dog-accessories" 
      fallbackTemplate="home-dog-accessories"
    />
  );
}

export const metadata = {
  title: 'Home Dog Accessories - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
