import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeGrocery() {
  return (
    <DynamicHomeTemplate 
      templateId="home-grocery" 
      fallbackTemplate="home-grocery"
    />
  );
}

export const metadata = {
  title: 'Home Grocery - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
