import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeSkateboard() {
  return (
    <DynamicHomeTemplate 
      templateId="home-skateboard" 
      fallbackTemplate="home-skateboard"
    />
  );
}

export const metadata = {
  title: 'Home Skateboard - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
