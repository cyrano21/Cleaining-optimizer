import React, { useState, useEffect, ChangeEvent } from "react";

export default function ProductsAdmin({ storeId, onError }: { storeId: string, onError?: (err: string) => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category: "" });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Charger les produits depuis l’API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products?storeId=${storeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors du chargement");
        setProducts(data.products || []);
      } catch (e: any) {
        setError(e.message || "Erreur inconnue");
        if (onError) onError(e.message || "Erreur inconnue lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [storeId]);

  const handleEdit = (product: any) => {
    setEditing(product);
    setForm({
      name: product.name || product.title || "",
      price: product.price?.toString() || "",
      category: product.category || ""
    });
    setImagePreview(product.images?.[0] || null);
    setImage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirmer la suppression de ce produit ?")) return;
    setDeletingId(id);
    try {
      // TODO: implémenter DELETE API réelle
      setProducts(products.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        // TODO: implémenter PUT API
        setProducts(products.map((p) => (p.id === editing.id ? { ...editing, ...form } : p)));
        setEditing(null);
        setImage(null);
        setImagePreview(null);
      } else {
        const productData: any = { ...form, storeId };
        let imageUrl = null;
        if (image) {
          // Upload image
          const formData = new FormData();
          formData.append("file", image);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            if (onError) onError(uploadData.error || "Erreur upload image");
            throw new Error(uploadData.error || "Erreur upload image");
          }
          imageUrl = uploadData.url;
          productData.images = [imageUrl];
        }
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData)
        });
        const data = await res.json();
        if (!res.ok) {
          if (onError) onError(data.error || "Erreur lors de l’ajout");
          throw new Error(data.error || "Erreur lors de l’ajout");
        }
        setProducts([data.product, ...products]);
        setImage(null);
        setImagePreview(null);
      }
      setForm({ name: "", price: "", category: "" });
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
      if (onError) onError(e.message || "Erreur inconnue lors de l’ajout/modification produit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Produits</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : (
        <>
          <form className="flex gap-2 mb-4 items-center" onSubmit={handleSubmit} encType="multipart/form-data">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" className="border px-2 py-1 rounded" required />
            <input name="price" value={form.price} onChange={handleChange} placeholder="Prix" className="border px-2 py-1 rounded" required type="number" step="0.01" />
            <input name="category" value={form.category} onChange={handleChange} placeholder="Catégorie" className="border px-2 py-1 rounded" required />
            <label htmlFor="product-image-upload" className="sr-only">Image du produit</label>
            <input
              id="product-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border px-2 py-1 rounded"
              title="Sélectionner une image pour le produit"
            />
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="h-10 w-10 object-cover rounded" />
            )}
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={submitting}>{editing ? "Modifier" : "Ajouter"}</button>
            {editing && <button type="button" className="ml-2 text-gray-500" onClick={() => { setEditing(null); setImage(null); setImagePreview(null); }}>Annuler</button>}
          </form>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border">Nom</th>
                <th className="p-2 border">Prix</th>
                <th className="p-2 border">Catégorie</th>
                <th className="p-2 border">Image</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border">{p.price} €</td>
                  <td className="p-2 border">{typeof p.category === "object" ? (p.category?.name || 'Catégorie non définie') : p.category}</td>
                  <td className="p-2 border">{p.images && p.images[0] && <img src={p.images[0]} alt="img" className="h-10 w-10 object-cover rounded" />}</td>
                  <td className="p-2 border">
                    <button className="text-blue-600 mr-2" onClick={() => handleEdit(p)}>Éditer</button>
                    <button className="text-red-600" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                      {deletingId === p.id ? "Suppression..." : "Supprimer"}
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
