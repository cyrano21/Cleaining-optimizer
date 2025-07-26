import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeFootwear() {
  return (
    <DynamicHomeTemplate 
      templateId="home-footwear" 
      fallbackTemplate="home-footwear"
    />
  );
}

export const metadata = {
  title: 'Home Footwear - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
