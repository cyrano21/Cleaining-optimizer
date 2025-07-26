'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function DashboardHeader() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="sticky-top bg-white border-bottom shadow-sm px-3 px-lg-4 d-flex align-items-center" style={{height: '4rem', zIndex: 40}}>
      <button
        type="button"
        className="btn btn-link text-dark d-lg-none p-2"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="visually-hidden">Ouvrir le menu</span>
        <Bars3Icon style={{width: '1.5rem', height: '1.5rem'}} />
      </button>

      {/* Separator */}
      <div className="vr d-lg-none mx-2" style={{height: '1.5rem'}} />

      <div className="d-flex flex-fill align-items-center gap-3 gap-lg-4">
        <form className="position-relative flex-fill" action="#" method="GET">
          <label htmlFor="search-field" className="visually-hidden">
            Rechercher
          </label>
          <MagnifyingGlassIcon
            className="position-absolute text-muted"
            style={{
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.25rem',
              height: '1.25rem',
              pointerEvents: 'none'
            }}
          />
          <input
            id="search-field"
            className="form-control ps-5"
            placeholder="Rechercher..."
            type="search"
            name="search"
            style={{border: 'none', backgroundColor: '#f8f9fa'}}
          />
        </form>
        
        <div className="d-flex align-items-center gap-3 gap-lg-4">
          <button
            type="button"
            className="btn btn-link text-muted p-2"
          >
            <span className="visually-hidden">Voir les notifications</span>
            <BellIcon style={{width: '1.5rem', height: '1.5rem'}} />
          </button>

          {/* Separator */}
          <div className="vr d-none d-lg-block" style={{height: '1.5rem'}} />

          {/* Profile dropdown */}
          <div className="position-relative">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{width: '2rem', height: '2rem'}}>
                <span className="text-white small fw-medium">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="d-none d-lg-block">
                <div className="small fw-medium text-dark">{session?.user?.name}</div>
                <div className="text-muted" style={{fontSize: '0.75rem'}}>{session?.user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
