import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeSearch() {
  return (
    <DynamicHomeTemplate 
      templateId="home-search" 
      fallbackTemplate="home-search"
    />
  );
}

export const metadata = {
  title: 'Home Search - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
