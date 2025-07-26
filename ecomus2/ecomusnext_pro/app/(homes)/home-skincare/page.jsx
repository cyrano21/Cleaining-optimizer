import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeSkincare() {
  return (
    <DynamicHomeTemplate 
      templateId="home-skincare" 
      fallbackTemplate="home-skincare"
    />
  );
}

export const metadata = {
  title: 'Home Skincare - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
