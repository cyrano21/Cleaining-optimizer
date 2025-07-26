import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeHeadphone() {
  return (
    <DynamicHomeTemplate 
      templateId="home-headphone" 
      fallbackTemplate="home-headphone"
    />
  );
}

export const metadata = {
  title: 'Home Headphone - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
