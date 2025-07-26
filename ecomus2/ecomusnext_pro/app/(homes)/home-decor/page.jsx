import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeDecor() {
  return (
    <DynamicHomeTemplate 
      templateId="home-decor" 
      fallbackTemplate="home-decor"
    />
  );
}

export const metadata = {
  title: 'Home Decor - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
