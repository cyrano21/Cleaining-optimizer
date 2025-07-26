'use client';

import { useSession } from 'next-auth/react';

export function useAuthToken() {
  const { data: session, status } = useSession();
  
  return {
    token: session?.accessToken,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.accessToken,
    user: session?.user
  };
}
