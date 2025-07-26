import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeFurniture() {
  return (
    <DynamicHomeTemplate 
      templateId="home-furniture" 
      fallbackTemplate="home-furniture"
    />
  );
}

export const metadata = {
  title: 'Home Furniture - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
