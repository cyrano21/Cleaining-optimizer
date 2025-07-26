import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeKids() {
  return (
    <DynamicHomeTemplate 
      templateId="home-kids" 
      fallbackTemplate="home-kids"
    />
  );
}

export const metadata = {
  title: 'Home Kids - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
