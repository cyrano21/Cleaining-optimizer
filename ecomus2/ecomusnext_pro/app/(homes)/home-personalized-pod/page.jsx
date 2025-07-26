import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomePersonalizedPod() {
  return (
    <DynamicHomeTemplate 
      templateId="home-personalized-pod" 
      fallbackTemplate="home-personalized-pod"
    />
  );
}

export const metadata = {
  title: 'Home Personalized Pod - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
