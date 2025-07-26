import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomePhonecase() {
  return (
    <DynamicHomeTemplate 
      templateId="home-phonecase" 
      fallbackTemplate="home-phonecase"
    />
  );
}

export const metadata = {
  title: 'Home Phonecase - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
