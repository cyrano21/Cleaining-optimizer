import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeSwimwear() {
  return (
    <DynamicHomeTemplate 
      templateId="home-swimwear" 
      fallbackTemplate="home-swimwear"
    />
  );
}

export const metadata = {
  title: 'Home Swimwear - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
