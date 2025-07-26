import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeGlasses() {
  return (
    <DynamicHomeTemplate 
      templateId="home-glasses" 
      fallbackTemplate="home-glasses"
    />
  );
}

export const metadata = {
  title: 'Home Glasses - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
