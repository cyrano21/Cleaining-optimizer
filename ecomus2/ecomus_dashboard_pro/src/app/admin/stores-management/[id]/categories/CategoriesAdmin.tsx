import React, { useState, useEffect } from "react";

export default function CategoriesAdmin({ storeId, onError }: { storeId: string, onError?: (err: string) => void }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Charger les catégories depuis l’API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/categories?limit=100`); // On récupère tout pour la boutique
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors du chargement");
        setCategories(data.categories || []);
      } catch (e: any) {
        setError(e.message || "Erreur inconnue");
        if (onError) onError(e.message || "Erreur inconnue lors du chargement des catégories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [storeId]);

  const handleEdit = (cat: any) => {
    setEditing(cat);
    setForm({ name: cat.name || "" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirmer la suppression de cette catégorie ?")) return;
    setDeletingId(id);
    try {
      // TODO: implémenter DELETE API
      setCategories(categories.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        // TODO: implémenter PUT API
        setCategories(categories.map((c) => (c.id === editing.id ? { ...editing, ...form } : c)));
        setEditing(null);
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form })
        });
        const data = await res.json();
        if (!res.ok) {
          if (onError) onError(data.error || "Erreur lors de l’ajout");
          throw new Error(data.error || "Erreur lors de l’ajout");
        }
        setCategories([data.category, ...categories]);
      }
      setForm({ name: "" });
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
      if (onError) onError(e.message || "Erreur inconnue lors de l’ajout/modification catégorie");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Catégories</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : (
        <>
          <form className="flex gap-2 mb-4" onSubmit={handleSubmit}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" className="border px-2 py-1 rounded" required />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={submitting}>{editing ? "Modifier" : "Ajouter"}</button>
            {editing && <button type="button" className="ml-2 text-gray-500" onClick={() => setEditing(null)}>Annuler</button>}
          </form>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border">Nom</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="p-2 border">{c.name}</td>
                  <td className="p-2 border">
                    <button className="text-blue-600 mr-2" onClick={() => handleEdit(c)}>Éditer</button>
                    <button className="text-red-600" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}>
                      {deletingId === c.id ? "Suppression..." : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
