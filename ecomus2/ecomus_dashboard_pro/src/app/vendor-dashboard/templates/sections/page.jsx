"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function TemplateDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "home-01"; // fallback to a default template
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch template details from API or fallback
    async function fetchTemplate() {
      setLoading(true);
      try {
        const res = await fetch(`/api/templates/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setTemplate(data.template || null);
        } else {
          setTemplate(null);
        }
      } catch {
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement du template...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Template introuvable</h2>
        <p className="mb-4">Aucun template ne correspond à ce slug.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-4">{template.name || slug}</h1>
      <Image
        src={template.previewImage || `/images/templates/${slug}.svg`}
        alt={template.name}
        width={384}
        height={256}
        className="w-96 h-64 object-contain rounded shadow mb-6"
      />
      <div className="max-w-2xl text-center">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {template.description || "Aucune description."}
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ID: {template._id || slug}
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retour à la galerie
          </button>
        </div>
      </div>
    </div>
  );
}
