import React, { useState, useEffect } from "react";

export default function AttributesAdmin({ storeId, onError }: { storeId: string, onError?: (err: string) => void }) {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", values: "" });
  const [submitting, setSubmitting] = useState(false);

  // TODO: Remplacer par un vrai fetch API quand endpoint prêt
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Simulation d’appel API
    setTimeout(() => {
      setAttributes([
        { id: "1", name: "Couleur", values: ["Rouge", "Bleu"] },
        { id: "2", name: "Taille", values: ["S", "M", "L"] },
      ]);
      setLoading(false);
    }, 500);
  }, [storeId]);

  // Gestion d’erreur centralisée
  useEffect(() => {
    if (error && onError) onError(error);
  }, [error, onError]);

  const handleEdit = (attr: any) => {
    setEditing(attr.id);
    setForm({ name: attr.name, values: attr.values.join(", ") });
  };

  const handleDelete = async (id: string) => {
    // TODO: implémenter DELETE API
    setAttributes(attributes.filter((a) => a.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const valuesArr = form.values.split(",").map((v) => v.trim()).filter(Boolean);
      if (editing) {
        // TODO: implémenter PUT API
        setAttributes(attributes.map((a) => (a.id === editing ? { id: editing, name: form.name, values: valuesArr } : a)));
        setEditing(null);
      } else {
        // TODO: POST API
        setAttributes([{ id: Date.now().toString(), name: form.name, values: valuesArr }, ...attributes]);
      }
      setForm({ name: "", values: "" });
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
      onError?.(e.message || "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Attributs personnalisés</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : (
        <>
          <form className="flex gap-2 mb-4" onSubmit={handleSubmit}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nom de l'attribut" className="border px-2 py-1 rounded" required />
            <input name="values" value={form.values} onChange={handleChange} placeholder="Valeurs (séparées par virgule)" className="border px-2 py-1 rounded w-96" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={submitting}>{editing ? "Modifier" : "Ajouter"}</button>
            {editing && <button type="button" className="ml-2 text-gray-500" onClick={() => { setEditing(null); setForm({ name: "", values: "" }); }}>Annuler</button>}
          </form>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Nom</th>
                <th className="p-2 border">Valeurs</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((a) => (
                <tr key={a.id}>
                  <td className="p-2 border">{a.name}</td>
                  <td className="p-2 border">{a.values.join(", ")}</td>
                  <td className="p-2 border">
                    <button className="text-blue-600 mr-2" onClick={() => handleEdit(a)}>Éditer</button>
                    <button className="text-red-600" onClick={() => handleDelete(a.id)}>Supprimer</button>
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
