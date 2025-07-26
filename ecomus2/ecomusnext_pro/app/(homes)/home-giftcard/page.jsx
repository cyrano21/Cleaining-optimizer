import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeGiftcard() {
  return (
    <DynamicHomeTemplate 
      templateId="home-giftcard" 
      fallbackTemplate="home-giftcard"
    />
  );
}

export const metadata = {
  title: 'Home Giftcard - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
