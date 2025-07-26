import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeJewerly() {
  return (
    <DynamicHomeTemplate 
      templateId="home-jewerly" 
      fallbackTemplate="home-jewerly"
    />
  );
}

export const metadata = {
  title: 'Home Jewerly - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
