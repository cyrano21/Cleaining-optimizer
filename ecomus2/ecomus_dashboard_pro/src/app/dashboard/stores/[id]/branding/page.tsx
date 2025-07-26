"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function StoreBrandingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1F2937");
  const [accentColor, setAccentColor] = useState("#3B82F6");
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    await fetch(`/api/stores/${resolvedParams.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl, primaryColor, accentColor })
    });
    router.refresh();
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Branding de la boutique</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          URL du logo
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="border p-2 rounded" placeholder="https://..." />
        </label>
        <label className="flex flex-col gap-1">
          Couleur principale
          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          Couleur accent
          <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
        </label>
        <button type="submit" className="py-2 bg-black text-white rounded">Enregistrer</button>
      </form>
    </div>
  );
}
