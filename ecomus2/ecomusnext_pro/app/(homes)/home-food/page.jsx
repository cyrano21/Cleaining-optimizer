import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeFood() {
  return (
    <DynamicHomeTemplate 
      templateId="home-food" 
      fallbackTemplate="home-food"
    />
  );
}

export const metadata = {
  title: 'Home Food - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
