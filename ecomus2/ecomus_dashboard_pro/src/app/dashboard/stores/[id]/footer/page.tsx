"use client";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

interface FooterLink {
  label: string;
  url: string;
}

export default function StoreFooterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [footerText, setFooterText] = useState("");
  const [links, setLinks] = useState<FooterLink[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/stores/${resolvedParams.id}`).then(r => r.json()).then(data => {
      setFooterText(data.footerText || "");
      setLinks(data.footerLinks || []);
    });
  }, [resolvedParams.id]);

  function updateLink(idx: number, field: keyof FooterLink, value: string) {
    setLinks(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  }

  function addLink() {
    setLinks(prev => [...prev, { label: "", url: "" }]);
  }

  function removeLink(idx: number) {
    setLinks(prev => prev.filter((_, i) => i !== idx));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    await fetch(`/api/stores/${resolvedParams.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ footerText, footerLinks: links })
    });
    router.refresh();
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Footer de la boutique</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Texte de bas de page
          <textarea value={footerText} onChange={e => setFooterText(e.target.value)} rows={4} className="border p-2 rounded" />
        </label>

        <div className="flex flex-col gap-2">
          <h2 className="font-semibold">Liens</h2>
          {links.map((l, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                placeholder="Label"
                value={l.label}
                onChange={e => updateLink(idx, "label", e.target.value)}
                className="border p-2 flex-1 rounded"
              />
              <input
                placeholder="https://example.com"
                value={l.url}
                onChange={e => updateLink(idx, "url", e.target.value)}
                className="border p-2 flex-1 rounded"
              />
              <button type="button" onClick={() => removeLink(idx)} className="px-2">🗑️</button>
            </div>
          ))}
          <button type="button" onClick={addLink} className="py-1 px-3 border rounded w-max">+ Ajouter un lien</button>
        </div>

        <button type="submit" className="py-2 bg-black text-white rounded">Enregistrer</button>
      </form>
    </div>
  );
}
