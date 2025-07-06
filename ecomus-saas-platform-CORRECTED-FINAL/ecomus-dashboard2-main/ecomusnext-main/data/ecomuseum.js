// Données pour l'écomusée avec images téléchargées
export const ecomuseumPosts = [
  {
    id: 1,
    title: "Découverte de la faune locale",
    content: "Explorez la riche biodiversité de notre région avec nos guides experts. Découvrez les espèces endémiques et leur habitat naturel.",
    excerpt: "Une aventure fascinante à travers les écosystèmes locaux",
    slug: "decouverte-faune-locale",
    imgSrc: "/images/posts/post-1.jpg",
    category: "Nature",
    author: "Dr. Marie Dubois",
    date: "2024-01-15",
    featured: true,
    tags: ["faune", "biodiversité", "écologie"]
  },
  {
    id: 2,
    title: "Conservation des espèces menacées",
    content: "Nos efforts de préservation et les programmes de protection mis en place pour sauvegarder les espèces en danger.",
    excerpt: "Comment nous protégeons les espèces en danger",
    slug: "conservation-especes-menacees",
    imgSrc: "/images/posts/post-2.jpg",
    category: "Conservation",
    author: "Jean-Pierre Martin",
    date: "2024-01-20",
    featured: false,
    tags: ["conservation", "protection", "espèces menacées"]
  },
  {
    id: 3,
    title: "Ateliers éducatifs pour enfants",
    content: "Des activités ludiques et pédagogiques pour sensibiliser les plus jeunes à l'importance de la protection de l'environnement.",
    excerpt: "Apprendre en s'amusant avec la nature",
    slug: "ateliers-educatifs-enfants",
    imgSrc: "/images/posts/post-3.jpg",
    category: "Éducation",
    author: "Sophie Laurent",
    date: "2024-01-25",
    featured: true,
    tags: ["éducation", "enfants", "ateliers"]
  },
  {
    id: 4,
    title: "Histoire de notre écomusée",
    content: "Retour sur 20 ans de passion pour l'environnement et l'évolution de notre institution depuis sa création.",
    excerpt: "Les origines et l'évolution de notre institution",
    slug: "histoire-ecomusee",
    imgSrc: "/images/posts/post-4.jpg",
    category: "Histoire",
    author: "Michel Rousseau",
    date: "2024-02-01",
    featured: false,
    tags: ["histoire", "écomusée", "patrimoine"]
  },
  {
    id: 5,
    title: "Jardin botanique et plantes rares",
    content: "Une collection unique de plantes endémiques et exotiques soigneusement entretenue par nos botanistes.",
    excerpt: "Découvrez notre jardin botanique exceptionnel",
    slug: "jardin-botanique-plantes-rares",
    imgSrc: "/images/posts/post-5.jpg",
    category: "Botanique",
    author: "Dr. Claire Moreau",
    date: "2024-02-05",
    featured: true,
    tags: ["botanique", "plantes", "jardin"]
  },
  {
    id: 6,
    title: "Recherche scientifique et études",
    content: "Nos programmes de recherche en collaboration avec les universités pour mieux comprendre les écosystèmes.",
    excerpt: "La science au service de la nature",
    slug: "recherche-scientifique-etudes",
    imgSrc: "/images/posts/post-6.jpg",
    category: "Recherche",
    author: "Prof. André Lefevre",
    date: "2024-02-10",
    featured: false,
    tags: ["recherche", "science", "études"]
  },
  {
    id: 7,
    title: "Expositions temporaires 2024",
    content: "Découvrez nos expositions temporaires qui mettent en lumière différents aspects de la biodiversité régionale.",
    excerpt: "Des expositions renouvelées tout au long de l'année",
    slug: "expositions-temporaires-2024",
    imgSrc: "/images/posts/post-7.jpg",
    category: "Expositions",
    author: "Isabelle Dubois",
    date: "2024-02-15",
    featured: true,
    tags: ["expositions", "culture", "art"]
  },
  {
    id: 8,
    title: "Partenariats et collaborations",
    content: "Nos partnerships avec les écoles, universités et organisations environnementales pour sensibiliser le public.",
    excerpt: "Ensemble pour la protection de l'environnement",
    slug: "partenariats-collaborations",
    imgSrc: "/images/posts/post-8.jpg",
    category: "Partenariats",
    author: "Thomas Berger",
    date: "2024-02-20",
    featured: false,
    tags: ["partenariats", "collaborations", "éducation"]
  }
];

export const ecomuseumSponsors = [
  {
    id: 1,
    name: "EcoTech Solutions",
    description: "Leader en technologies environnementales",
    website: "https://ecotech-solutions.com",
    logo: "/images/sponsors/sponsor-1.jpg",
    level: "gold",
    active: true
  },
  {
    id: 2,
    name: "Green Energy Corp",
    description: "Spécialiste en énergies renouvelables",
    website: "https://green-energy.com",
    logo: "/images/sponsors/sponsor-2.jpg",
    level: "silver",
    active: true
  },
  {
    id: 3,
    name: "Nature Conservation Fund",
    description: "Fondation pour la protection de la nature",
    website: "https://natureconservation.org",
    logo: "/images/sponsors/sponsor-3.jpg",
    level: "bronze",
    active: true
  },
  {
    id: 4,
    name: "Biodiversity Research Institute",
    description: "Institut de recherche en biodiversité",
    website: "https://biodiversity-research.edu",
    logo: "/images/sponsors/sponsor-4.jpg",
    level: "gold",
    active: true
  },
  {
    id: 5,
    name: "Sustainable Development Alliance",
    description: "Alliance pour le développement durable",
    website: "https://sustainable-dev.org",
    logo: "/images/sponsors/sponsor-5.jpg",
    level: "silver",
    active: true
  },
  {
    id: 6,
    name: "Wildlife Protection Society",
    description: "Société de protection de la faune",
    website: "https://wildlife-protection.com",
    logo: "/images/sponsors/sponsor-6.jpg",
    level: "bronze",
    active: true
  }
];

export const ecomuseumEvents = [
  {
    id: 1,
    title: "Nuit des musées 2024",
    description: "Découverte nocturne de nos collections avec animations spéciales",
    date: "2024-05-18",
    time: "19:00-23:00",
    location: "Écomusée principal",
    image: "/images/events/event-1.jpg",
    category: "Événement spécial",
    price: "Gratuit",
    maxParticipants: 200
  },
  {
    id: 2,
    title: "Weekend biodiversité",
    description: "Deux jours d'ateliers, conférences et sorties nature",
    date: "2024-06-15",
    time: "09:00-18:00",
    location: "Écomusée et jardins",
    image: "/images/events/event-2.jpg",
    category: "Festival",
    price: "15€",
    maxParticipants: 150
  },
  {
    id: 3,
    title: "Conférence sur le climat",
    description: "Table ronde avec des experts climatologues",
    date: "2024-07-20",
    time: "14:00-17:00",
    location: "Auditorium",
    image: "/images/events/event-3.jpg",
    category: "Conférence",
    price: "10€",
    maxParticipants: 100
  },
  {
    id: 4,
    title: "Journées portes ouvertes",
    description: "Accès libre à toutes nos installations et expositions",
    date: "2024-09-21",
    time: "10:00-18:00",
    location: "Tout l'écomusée",
    image: "/images/events/event-4.jpg",
    category: "Portes ouvertes",
    price: "Gratuit",
    maxParticipants: 500
  },
  {
    id: 5,
    title: "Formation guide nature",
    description: "Session de formation pour devenir guide bénévole",
    date: "2024-10-12",
    time: "09:00-17:00",
    location: "Salle de formation",
    image: "/images/events/event-5.jpg",
    category: "Formation",
    price: "25€",
    maxParticipants: 30
  }
];

export const ecomuseumGallery = [
  {
    id: 1,
    title: "Faune locale",
    description: "Collection d'animaux régionaux",
    imgSrc: "/images/gallery/gallery-2.jpg",
    category: "Animaux",
    width: 600,
    height: 400
  },
  {
    id: 2,
    title: "Flore endémique",
    description: "Plantes rares de la région",
    imgSrc: "/images/gallery/gallery-3.jpg",
    category: "Plantes",
    width: 600,
    height: 400
  },
  {
    id: 3,
    title: "Écosystèmes aquatiques",
    description: "Vie aquatique régionale",
    imgSrc: "/images/gallery/gallery-4.jpg",
    category: "Aquatique",
    width: 600,
    height: 400
  },
  {
    id: 4,
    title: "Forêts et habitats",
    description: "Diversité des habitats forestiers",
    imgSrc: "/images/gallery/gallery-5.jpg",
    category: "Habitats",
    width: 600,
    height: 400
  },
  {
    id: 5,
    title: "Conservation active",
    description: "Nos actions de protection",
    imgSrc: "/images/gallery/gallery-6.jpg",
    category: "Conservation",
    width: 600,
    height: 400
  }
];

export const ecomuseumAnimals = [
  {
    id: 1,
    name: "Lynx boréal",
    scientificName: "Lynx lynx",
    description: "Félin sauvage emblématique de nos forêts",
    habitat: "Forêts de conifères",
    status: "Protégé",
    image: "/images/animals/animal-1.jpg",
    category: "Mammifères"
  },
  {
    id: 2,
    name: "Aigle royal",
    scientificName: "Aquila chrysaetos",
    description: "Rapace majestueux des hautes montagnes",
    habitat: "Zones montagneuses",
    status: "Vulnérable",
    image: "/images/animals/animal-2.jpg",
    category: "Oiseaux"
  },
  {
    id: 3,
    name: "Salamandre tachetée",
    scientificName: "Salamandra salamandra",
    description: "Amphibien indicateur de la qualité environnementale",
    habitat: "Forêts humides",
    status: "Stable",
    image: "/images/animals/animal-3.jpg",
    category: "Amphibiens"
  },
  {
    id: 4,
    name: "Cerf élaphe",
    scientificName: "Cervus elaphus",
    description: "Plus grand cervidé de nos régions",
    habitat: "Forêts mixtes",
    status: "Stable",
    image: "/images/animals/animal-4.jpg",
    category: "Mammifères"
  },
  {
    id: 5,
    name: "Papillon Apollon",
    scientificName: "Parnassius apollo",
    description: "Papillon rare des zones montagneuses",
    habitat: "Prairies alpines",
    status: "En danger",
    image: "/images/animals/animal-5.jpg",
    category: "Insectes"
  }
];

export const ecomuseumBanners = [
  {
    id: 1,
    title: "Bienvenue à l'Écomusée",
    subtitle: "Découvrez la richesse de notre biodiversité locale",
    description: "Un voyage fascinant à travers les écosystèmes de notre région",
    image: "/images/banners/banner-1.jpg",
    link: "/about",
    buttonText: "Découvrir"
  },
  {
    id: 2,
    title: "Protégeons ensemble",
    subtitle: "La nature a besoin de nous",
    description: "Participez à nos actions de conservation et d'éducation environnementale",
    image: "/images/banners/banner-2.jpg",
    link: "/conservation",
    buttonText: "S'engager"
  },
  {
    id: 3,
    title: "Éducation et sensibilisation",
    subtitle: "Apprendre pour mieux protéger",
    description: "Nos programmes éducatifs pour tous les âges",
    image: "/images/banners/banner-3.jpg",
    link: "/education",
    buttonText: "Participer"
  }
];

export const ecomuseumAds = [
  {
    id: 1,
    title: "Nouvelle exposition temporaire",
    content: "Découvrez l'exposition sur les oiseaux migrateurs",
    image: "/images/ads/ad-1.jpg",
    link: "/expositions/oiseaux-migrateurs",
    position: "homepage_banner",
    active: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  },
  {
    id: 2,
    title: "Ateliers famille weekend",
    content: "Inscrivez-vous aux ateliers familiaux du weekend",
    image: "/images/ads/ad-2.jpg",
    link: "/ateliers",
    position: "sidebar",
    active: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  },
  {
    id: 3,
    title: "Boutique écoresponsable",
    content: "Découvrez notre boutique nature et développement durable",
    image: "/images/ads/ad-3.jpg",
    link: "/boutique",
    position: "footer",
    active: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  },
  {
    id: 4,
    title: "Visite guidée gratuite",
    content: "Tous les dimanches à 14h30, visite guidée gratuite",
    image: "/images/ads/ad-4.jpg",
    link: "/visites",
    position: "homepage_banner",
    active: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  },
  {
    id: 5,
    title: "Devenez membre",
    content: "Adhérez à notre association et soutenez nos actions",
    image: "/images/ads/ad-5.jpg",
    link: "/adhesion",
    position: "sidebar",
    active: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  }
];