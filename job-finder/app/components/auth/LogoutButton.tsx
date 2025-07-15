'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion')
      }

      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
    >
      {loading ? 'Déconnexion...' : 'Se déconnecter'}
    </button>
  )
}
