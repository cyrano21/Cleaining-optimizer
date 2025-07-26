import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomePickleball() {
  return (
    <DynamicHomeTemplate 
      templateId="home-pickleball" 
      fallbackTemplate="home-pickleball"
    />
  );
}

export const metadata = {
  title: 'Home Pickleball - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
