'use client';

import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Contactez-nous
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}