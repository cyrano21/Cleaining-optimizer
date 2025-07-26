import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeStroller() {
  return (
    <DynamicHomeTemplate 
      templateId="home-stroller" 
      fallbackTemplate="home-stroller"
    />
  );
}

export const metadata = {
  title: 'Home Stroller - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
