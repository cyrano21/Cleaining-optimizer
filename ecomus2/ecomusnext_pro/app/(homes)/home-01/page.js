import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function Home01() {
  return (
    <DynamicHomeTemplate 
      templateId="home-1" 
      fallbackTemplate="home-01"
    />
  );
}

export const metadata = {
  title: 'Home 01 - Ecomus',
  description: 'Modern e-commerce template with clean design',
};