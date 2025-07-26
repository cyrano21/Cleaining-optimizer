import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomePlant() {
  return (
    <DynamicHomeTemplate 
      templateId="home-plant" 
      fallbackTemplate="home-plant"
    />
  );
}

export const metadata = {
  title: 'Home Plant - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
