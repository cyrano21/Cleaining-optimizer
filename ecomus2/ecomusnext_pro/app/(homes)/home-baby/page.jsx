import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeBaby() {
  return (
    <DynamicHomeTemplate 
      templateId="home-baby" 
      fallbackTemplate="home-baby"
    />
  );
}

export const metadata = {
  title: 'Home Baby - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
