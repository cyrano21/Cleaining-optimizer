import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeMultiBrand() {
  return (
    <DynamicHomeTemplate 
      templateId="home-multi-brand" 
      fallbackTemplate="home-multi-brand"
    />
  );
}

export const metadata = {
  title: 'Home Multi Brand - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
