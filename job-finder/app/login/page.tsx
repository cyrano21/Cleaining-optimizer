'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <SignIn path="/login" routing="path" />
        <div className="mt-4 text-center">
          <Link href="/register" className="text-blue-600 hover:underline">
            Pas encore de compte ? Inscrivez-vous
          </Link>
        </div>
      </div>
    </div>
  )
}
