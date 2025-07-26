import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeActivewear() {
  return (
    <DynamicHomeTemplate 
      templateId="home-activewear" 
      fallbackTemplate="home-activewear"
    />
  );
}

export const metadata = {
  title: 'Home Activewear - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
