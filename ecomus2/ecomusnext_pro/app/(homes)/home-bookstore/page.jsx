import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeBookstore() {
  return (
    <DynamicHomeTemplate 
      templateId="home-bookstore" 
      fallbackTemplate="home-bookstore"
    />
  );
}

export const metadata = {
  title: 'Home Bookstore - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
