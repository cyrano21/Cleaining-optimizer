import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeSetupGear() {
  return (
    <DynamicHomeTemplate 
      templateId="home-setup-gear" 
      fallbackTemplate="home-setup-gear"
    />
  );
}

export const metadata = {
  title: 'Home Setup Gear - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
