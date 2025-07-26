import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomePodStore() {
  return (
    <DynamicHomeTemplate 
      templateId="home-pod-store" 
      fallbackTemplate="home-pod-store"
    />
  );
}

export const metadata = {
  title: 'Home Pod Store - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
