// Types pour les modules dynamiques
declare module './homes/*' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module '@/components/homes/*' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

// Déclarations spécifiques pour chaque home
declare module './homes/home-1' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-2' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-3' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-4' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-5' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-6' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-7' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-8' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-furniture' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-handbag' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-decor' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-grocery' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-skincare' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-swimwear' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-accessories' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-activewear' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-electronic' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-footwear' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-cosmetic' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-jewerly' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-men' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/home-kids' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './homes/multi-brand' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module '@/lib/*' {
  const content: any;
  export default content;
  export const authOptions: any;
  export const createApiResponse: any;
  export const createApiError: any;
  export const checkAdminAccess: any;
  export const normalizeRole: any;
}

declare module '@/config/*' {
  const content: any;
  export default content;
  export const SUBSCRIPTION_TIERS: any;
  export const SUBSCRIPTION_FEATURES: any;
}

declare module '@/components/layout/*' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
  export const Sidebar: ComponentType<any>;
  export const Header: ComponentType<any>;
}

// Extension des types pour NextAuth
declare module 'next-auth' {
  interface Session {
    user?: {
      name?: string;
      email?: string;
      image?: string;
      role?: string;
    };
  }
}

// Type pour les icônes Star
declare global {
  const Star: any;
}
