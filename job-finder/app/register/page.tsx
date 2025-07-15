'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <SignUp path="/register" routing="path" />
        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Déjà un compte ? Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}
