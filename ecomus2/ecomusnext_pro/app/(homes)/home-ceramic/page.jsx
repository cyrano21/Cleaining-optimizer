import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeCeramic() {
  return (
    <DynamicHomeTemplate 
      templateId="home-ceramic" 
      fallbackTemplate="home-ceramic"
    />
  );
}

export const metadata = {
  title: 'Home Ceramic - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
