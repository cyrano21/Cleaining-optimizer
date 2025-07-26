import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MonitoringDashboard from '@/components/admin/MonitoringDashboard'

export const metadata: Metadata = {
  title: 'Monitoring - Administration',
  description: 'Dashboard de monitoring et métriques de l\'application'
}

export default async function MonitoringPage() {
  // Vérifier l'authentification et les permissions
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  if (session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-6">
      <MonitoringDashboard />
    </div>
  )
}