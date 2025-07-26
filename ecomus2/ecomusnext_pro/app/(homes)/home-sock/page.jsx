import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeSock() {
  return (
    <DynamicHomeTemplate 
      templateId="home-sock" 
      fallbackTemplate="home-sock"
    />
  );
}

export const metadata = {
  title: 'Home Sock - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
