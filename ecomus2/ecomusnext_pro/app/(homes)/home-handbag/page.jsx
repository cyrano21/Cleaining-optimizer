import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeHandbag() {
  return (
    <DynamicHomeTemplate 
      templateId="home-handbag" 
      fallbackTemplate="home-handbag"
    />
  );
}

export const metadata = {
  title: 'Home Handbag - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
