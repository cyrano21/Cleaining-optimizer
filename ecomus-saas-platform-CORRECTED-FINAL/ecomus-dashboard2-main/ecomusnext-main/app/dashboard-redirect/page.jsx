'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirection vers le dashboard
    window.location.href = '/dashboard';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">
          Redirection vers le tableau de bord...
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Si vous n'êtes pas redirigé automatiquement, 
          <a href="/dashboard" className="text-blue-600 hover:underline ml-1">
            cliquez ici
          </a>
        </p>
      </div>
    </div>
  );
}
