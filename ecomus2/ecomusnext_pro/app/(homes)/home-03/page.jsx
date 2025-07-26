import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function Home03() {
  return (
    <DynamicHomeTemplate 
      templateId="home-3" 
      fallbackTemplate="home-03"
    />
  );
}

export const metadata = {
  title: 'Home 03 - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
