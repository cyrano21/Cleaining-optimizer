import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function Home02() {
  return (
    <DynamicHomeTemplate 
      templateId="home-2" 
      fallbackTemplate="home-02"
    />
  );
}

export const metadata = {
  title: 'Home 02 - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
