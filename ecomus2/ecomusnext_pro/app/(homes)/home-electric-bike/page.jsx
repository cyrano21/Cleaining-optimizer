import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeElectricBike() {
  return (
    <DynamicHomeTemplate 
      templateId="home-electric-bike" 
      fallbackTemplate="home-electric-bike"
    />
  );
}

export const metadata = {
  title: 'Home Electric Bike - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
