import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeTee() {
  return (
    <DynamicHomeTemplate 
      templateId="home-tee" 
      fallbackTemplate="home-tee"
    />
  );
}

export const metadata = {
  title: 'Home Tee - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
