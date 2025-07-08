'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  HomeIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

const navigation = {
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Produits', href: '/dashboard/products', icon: ShoppingBagIcon },
    { name: 'Boutiques', href: '/dashboard/stores', icon: BuildingStorefrontIcon },
    { name: 'Commandes', href: '/dashboard/orders', icon: ShoppingCartIcon },
    { name: 'Utilisateurs', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Paramètres', href: '/dashboard/settings', icon: CogIcon },
  ],
  vendor: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Mes Produits', href: '/dashboard/products', icon: ShoppingBagIcon },
    { name: 'Commandes', href: '/dashboard/orders', icon: ShoppingCartIcon },
    { name: 'Ma Boutique', href: '/dashboard/store', icon: BuildingStorefrontIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Paramètres', href: '/dashboard/settings', icon: CogIcon },
  ],
  client: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Mes Commandes', href: '/dashboard/orders', icon: ShoppingCartIcon },
    { name: 'Mes Favoris', href: '/dashboard/wishlist', icon: HeartIcon },
    { name: 'Adresses', href: '/dashboard/addresses', icon: DocumentTextIcon },
    { name: 'Paramètres', href: '/dashboard/settings', icon: CogIcon },
  ]
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardSidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  if (!session) return null

  const userNavigation = navigation[session.user.role] || []

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="d-flex flex-column h-100 bg-white px-3 pb-3 shadow-sm border-end">
      <div className="d-flex align-items-center py-3" style={{height: '4rem'}}>
        <img
          className="me-2"
          src="/images/logo/logo.svg"
          alt="Ecomus"
          style={{height: '2rem', width: 'auto'}}
        />
        <span className="fs-5 fw-bold text-dark">Dashboard</span>
      </div>
      
      <nav className="flex-fill d-flex flex-column">
        <ul className="list-unstyled flex-fill d-flex flex-column">
          <li className="flex-fill">
            <ul className="list-unstyled">
              {userNavigation.map((item) => (
                <li key={item.name} className="mb-1">
                  <button
                    onClick={() => router.push(item.href)}
                    className={`btn w-100 text-start d-flex align-items-center gap-2 p-2 rounded ${
                      pathname === item.href
                        ? 'btn-primary'
                        : 'btn-outline-light text-dark'
                    }`}
                    style={{
                      backgroundColor: pathname === item.href ? '#0d6efd' : 'transparent',
                      borderColor: pathname === item.href ? '#0d6efd' : 'transparent'
                    }}
                  >
                    <item.icon
                      style={{width: '1.5rem', height: '1.5rem'}}
                      className={pathname === item.href ? 'text-white' : 'text-muted'}
                    />
                    <span className={pathname === item.href ? 'text-white' : 'text-dark'}>
                      {item.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="d-flex align-items-center gap-3 p-2 mb-2">
              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{width: '2rem', height: '2rem'}}>
                <span className="text-white small fw-medium">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-fill">
                <div className="small fw-medium text-dark">{session.user.name}</div>
                <div className="text-muted" style={{fontSize: '0.75rem'}}>{session.user.role}</div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="btn btn-outline-danger w-100 text-start d-flex align-items-center gap-2 p-2"
            >
              <LogoutIcon
                style={{width: '1.5rem', height: '1.5rem'}}
                className="text-danger"
              />
              <span>Déconnexion</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
