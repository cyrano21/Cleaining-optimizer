"use client";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

import useSWR from "swr";
function TemplatePicker({ selected, onSelect }: { selected?: string, onSelect: (tpl: any) => void }) {
  const { data, error } = useSWR("/api/templates", (u: string) => fetch(u).then(r => r.json()));
  const [preview, setPreview] = useState<any>(null);

  if (error) return <p>Erreur de chargement des templates</p>;
  if (!data) return <p>Chargement des templates…</p>;

  const handlePreview = (tpl: any) => {
    setPreview(tpl);
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {data.map((tpl: any) => (
          <div
            key={tpl._id}
            className={`border rounded p-4 flex flex-col items-center ${selected === tpl.slug ? "ring-2 ring-blue-600" : ""}`}
          >
            <img
              src={tpl.previewUrl || "/placeholder.png"}
              alt={tpl.name}
              className="mb-2 w-full h-32 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handlePreview(tpl)}
            />
            <h3 className="font-semibold">{tpl.name}</h3>
            <p className="text-sm text-gray-500">{tpl.slug}</p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className={`px-4 py-1 rounded ${selected === tpl.slug ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                onClick={() => onSelect(tpl)}
                disabled={selected === tpl.slug}
              >
                {selected === tpl.slug ? "Sélectionné" : "Choisir"}
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded bg-gray-100 border border-gray-300 text-xs hover:bg-gray-200"
                onClick={() => handlePreview(tpl)}
              >
                Aperçu
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
              onClick={() => setPreview(null)}
              aria-label="Fermer l'aperçu"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-2">Aperçu : {preview.name}</h3>
            <img
              src={preview.previewUrl || "/placeholder.png"}
              alt={preview.name}
              className="w-full h-64 object-cover rounded mb-4"
            />
            {preview.description && <p className="text-gray-700 mb-2">{preview.description}</p>}
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => { onSelect(preview); setPreview(null); }}
                disabled={selected === preview.slug}
              >
                {selected === preview.slug ? "Déjà sélectionné" : "Choisir ce template"}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setPreview(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


interface Link { 
  label: string; 
  url?: string; 
  href?: string; 
  network?: string; 
}

interface Store {
  address?: string;
  email?: string;
  phone?: string;
  navLinks?: Link[];
  socialLinks?: Link[];
  footerText?: string;
  footerLinks?: Link[];
  selectedTemplate?: string;
}

export default function StoreGeneralPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [store, setStore] = useState<Store>({});
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/stores/${resolvedParams.id}`).then(r => r.json()).then(setStore);
  }, [resolvedParams.id]);

  const updateArray = (field: keyof Store, idx: number, key: string, value: string) => {
    setStore((prev: Store) => {
      const arr = [...((prev[field] as Link[]) || [])];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...prev, [field]: arr };
    });
  };

  const addItem = (field: keyof Store, template: Link) => {
    setStore((prev: Store) => ({ ...prev, [field]: [ ...((prev[field] as Link[]) || []), template ] }));
  };

  const removeItem = (field: keyof Store, idx: number) => {
    setStore((prev: Store) => ({ ...prev, [field]: ((prev[field] as Link[]) || []).filter((_, i: number) => i !== idx) }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    await fetch(`/api/stores/${resolvedParams.id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(store) });
    router.refresh();
  }

  return (
    <div className="p-6 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Paramètres généraux</h1>
      <form onSubmit={submit} className="flex flex-col gap-6">
        {/* Contact */}
        <div>
          <h2 className="font-semibold mb-2">Contact</h2>
          <div className="mb-2">
            <label htmlFor="address" className="block text-sm font-medium mb-1">Adresse</label>
            <input 
              id="address"
              className="border p-2 w-full" 
              placeholder="Adresse" 
              value={store.address || ""} 
              onChange={e => setStore({ ...store, address: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input 
              id="email"
              type="email"
              className="border p-2 w-full" 
              placeholder="Email" 
              value={store.email || ""} 
              onChange={e => setStore({ ...store, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Téléphone</label>
            <input 
              id="phone"
              type="tel"
              className="border p-2 w-full" 
              placeholder="Téléphone" 
              value={store.phone || ""} 
              onChange={e => setStore({ ...store, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Nav links */}
        <div>
          <h2 className="font-semibold mb-2">Liens de navigation</h2>
          {(store.navLinks || []).map((l: Link, idx: number) => (
            <div key={idx} className="flex gap-2 mb-1">
              <div className="flex-1">
                <label htmlFor={`navlink-label-${idx}`} className="sr-only">Libellé du lien de navigation {idx + 1}</label>
                <input 
                  id={`navlink-label-${idx}`}
                  value={l.label || ""} 
                  onChange={e => updateArray("navLinks", idx, "label", e.target.value)} 
                  className="border p-2 w-full"
                  placeholder="Libellé"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`navlink-href-${idx}`} className="sr-only">URL du lien de navigation {idx + 1}</label>
                <input 
                  id={`navlink-href-${idx}`}
                  value={l.href || ""} 
                  onChange={e => updateArray("navLinks", idx, "href", e.target.value)} 
                  className="border p-2 w-full" 
                  placeholder="/chemin"
                />
              </div>
              <button type="button" onClick={() => removeItem("navLinks", idx)} aria-label={`Supprimer le lien de navigation ${idx + 1}`}>🗑️</button>
            </div>
          ))}
          <button type="button" onClick={() => addItem("navLinks",{ label:"", href:"" })} className="border px-3 py-1 rounded mt-1">+ Ajouter</button>
        </div>

        {/* Social links */}
        <div>
          <h2 className="font-semibold mb-2">Réseaux sociaux</h2>
          {(store.socialLinks || []).map((l: Link, idx: number) => (
            <div key={idx} className="flex gap-2 mb-1">
              <div className="flex-1">
                <label htmlFor={`social-network-${idx}`} className="sr-only">Réseau social {idx + 1}</label>
                <input 
                  id={`social-network-${idx}`}
                  value={l.network || ""} 
                  onChange={e => updateArray("socialLinks", idx, "network", e.target.value)} 
                  className="border p-2 w-full" 
                  placeholder="facebook"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`social-url-${idx}`} className="sr-only">URL du réseau social {idx + 1}</label>
                <input 
                  id={`social-url-${idx}`}
                  value={l.url || ""} 
                  onChange={e => updateArray("socialLinks", idx, "url", e.target.value)} 
                  className="border p-2 w-full" 
                  placeholder="https://..."
                />
              </div>
              <button type="button" onClick={() => removeItem("socialLinks", idx)} aria-label={`Supprimer le lien social ${idx + 1}`}>🗑️</button>
            </div>
          ))}
          <button type="button" onClick={() => addItem("socialLinks",{ label: "", network:"", url:"" })} className="border px-3 py-1 rounded mt-1">+ Ajouter</button>
        </div>

        {/* Footer text & links */}
        <div>
          <h2 className="font-semibold mb-2">Footer</h2>
          <div className="mb-2">
            <label htmlFor="footerText" className="block text-sm font-medium mb-1">Texte du footer</label>
            <textarea 
              id="footerText"
              rows={4} 
              value={store.footerText || ""} 
              onChange={e => setStore({ ...store, footerText: e.target.value })} 
              className="border p-2 w-full"
              placeholder="Texte du footer"
            />
          </div>
          {(store.footerLinks || []).map((l: Link, idx: number) => (
            <div key={idx} className="flex gap-2 mb-1">
              <div className="flex-1">
                <label htmlFor={`footer-label-${idx}`} className="sr-only">Libellé du lien footer {idx + 1}</label>
                <input 
                  id={`footer-label-${idx}`}
                  value={l.label || ""} 
                  onChange={e => updateArray("footerLinks", idx, "label", e.target.value)} 
                  className="border p-2 w-full"
                  placeholder="Libellé"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`footer-url-${idx}`} className="sr-only">URL du lien footer {idx + 1}</label>
                <input 
                  id={`footer-url-${idx}`}
                  value={l.url || ""} 
                  onChange={e => updateArray("footerLinks", idx, "url", e.target.value)} 
                  className="border p-2 w-full" 
                  placeholder="https://..."
                />
              </div>
              <button type="button" onClick={() => removeItem("footerLinks", idx)} aria-label={`Supprimer le lien footer ${idx + 1}`}>🗑️</button>
            </div>
          ))}
          <button type="button" onClick={() => addItem("footerLinks",{ label:"", url:"" })} className="border px-3 py-1 rounded mt-1">+ Ajouter un lien</button>
        </div>

                {/* Sélection du template visuel */}
        <div>
          <h2 className="font-semibold mb-2">Template de la boutique</h2>
          <TemplatePicker 
            selected={store.selectedTemplate}
            onSelect={tpl => setStore({ ...store, selectedTemplate: tpl.slug })}
          />
        </div>

        <button type="submit" className="py-2 bg-black text-white rounded self-start">Enregistrer</button>
      </form>
    </div>
  );
}
