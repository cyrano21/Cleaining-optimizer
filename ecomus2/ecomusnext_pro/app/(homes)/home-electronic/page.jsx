import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeElectronic() {
  return (
    <DynamicHomeTemplate 
      templateId="home-electronic" 
      fallbackTemplate="home-electronic"
    />
  );
}

export const metadata = {
  title: 'Home Electronic - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
