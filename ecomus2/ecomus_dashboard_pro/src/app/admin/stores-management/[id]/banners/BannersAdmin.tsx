import React, { useState, useEffect, ChangeEvent } from "react";

export default function BannersAdmin(
  { storeId, onError }: { storeId: string; onError?: (err: string) => void }
) {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ url: "" });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // TODO: Remplacer par un vrai fetch API quand endpoint prêt
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Simulation d’appel API
    setTimeout(() => {
      setBanners([
        { id: "1", url: "/banner1.jpg" },
        { id: "2", url: "/banner2.jpg" },
      ]);
      setLoading(false);
    }, 500);
  }, [storeId]);

  // Gestion d’erreur centralisée
  useEffect(() => {
    if (error && onError) onError(error);
  }, [error, onError]);

  const handleEdit = (banner: any) => {
    setEditing(banner);
    setForm({ url: banner.url });
    setImagePreview(banner.url);
    setImage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirmer la suppression de cette bannière ?")) return;
    setDeletingId(id);
    try {
      // TODO: implémenter DELETE API
      setBanners(banners.filter((b) => b.id !== id));
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
        setBanners(
          banners.map((b) => (b.id === editing.id ? { ...editing, ...form } : b))
        );
        setEditing(null);
        setImage(null);
        setImagePreview(null);
      } else {
        let url = form.url;
        if (image) {
          const formData = new FormData();
          formData.append("file", image);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok)
            throw new Error(uploadData.error || "Erreur upload image");
          url = uploadData.url;
        }
        setBanners([{ url, id: Date.now().toString() }, ...banners]);
        setImage(null);
        setImagePreview(null);
      }
      setForm({ url: "" });
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
      onError?.(e.message || "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Bannières</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : (
        <>
          <form
            className="flex gap-2 mb-4 items-center"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <input
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="URL de l'image"
              className="border px-2 py-1 rounded"
              required={!image}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border px-2 py-1 rounded"
              placeholder="Image"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="h-10 w-20 object-cover rounded"
              />
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded"
              disabled={submitting}
            >
              {editing ? "Modifier" : "Ajouter"}
            </button>
            {editing && (
              <button
                type="button"
                className="ml-2 text-gray-500"
                onClick={() => {
                  setEditing(null);
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                Annuler
              </button>
            )}
          </form>
          <div className="flex gap-4 flex-wrap">
            {banners.map((b) => (
              <div key={b.id} className="relative border rounded p-2">
                <img
                  src={b.url}
                  alt="banner"
                  className="h-24 w-48 object-cover rounded"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    className="text-blue-600"
                    onClick={() => handleEdit(b)}
                  >
                    Éditer
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                  >
                    {deletingId === b.id ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
