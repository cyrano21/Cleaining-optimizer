"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function TemplatesPage() {
  const { data, error } = useSWR("/api/templates", fetcher);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function createTpl() {
    if (!name || !slug) return;
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        components: { sections: ["hero"] },
      }),
    });
    setName("");
    setSlug("");
    mutate("/api/templates");
  }

  if (error) return <p>Erreur de chargement</p>;
  if (!data) return <p>Chargement…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Templates</h1>

      <div className="flex gap-2 mb-8">
        <input
          className="border p-2 flex-1"
          placeholder="Nom (ex. Minimal)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="border p-2 flex-1"
          placeholder="slug (ex. minimal)"
          value={slug}
          onChange={e => setSlug(e.target.value)}
        />
        <button
          onClick={createTpl}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Créer
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {data.map((tpl: any) => (
          <div
            key={tpl._id}
            className="border rounded p-4 flex flex-col items-center"
          >
            <img
              src={tpl.previewUrl || "/placeholder.png"}
              alt={tpl.name}
              className="mb-2 w-full h-32 object-cover rounded"
            />
            <h2 className="font-semibold">{tpl.name}</h2>
            <p className="text-sm text-gray-500">{tpl.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
