import DynamicHomeTemplate from '../../../components/DynamicHomeTemplate';

export default function HomeCampAndHike() {
  return (
    <DynamicHomeTemplate 
      templateId="home-camp-and-hike" 
      fallbackTemplate="home-camp-and-hike"
    />
  );
}

export const metadata = {
  title: 'Home Camp And Hike - Ecomus',
  description: 'Modern e-commerce template with clean design',
};
