import React, { useState } from "react";

export default function StoreAdminPanel({ store, onError }: { store: any, onError?: (err: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // TODO: Remplacer le type any par le vrai type Store
  return (
    <div className="space-y-8">
      {/* Infos principales */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Informations générales</h2>
        <div className="flex items-center gap-6 mb-4">
          <img src={store.logoUrl || "/default-store-logo.png"} alt={store.name} className="h-20 w-20 rounded object-cover border" />
          <div>
            <div className="text-lg font-bold">{store.name}</div>
            <div className="text-gray-500">{store.slug}</div>
            <div className="text-sm text-gray-400">ID : {store.id}</div>
          </div>
        </div>
        <div className="mb-2">{store.description}</div>
        <div className="flex gap-4 text-sm">
          <div><span className="font-medium">Statut :</span> {store.isActive ? 'Actif' : 'Inactif'}</div>
          <div><span className="font-medium">Plan :</span> {store.subscription?.plan || 'free'}</div>
          <div><span className="font-medium">Créée le :</span> {new Date(store.createdAt).toLocaleDateString('fr-FR')}</div>
        </div>
      </section>

      {/* Statistiques */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Statistiques</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded p-4 text-center">
            <div className="text-2xl font-bold">{store.stats?.totalProducts ?? 0}</div>
            <div className="text-xs text-gray-500">Produits</div>
          </div>
          <div className="bg-gray-50 rounded p-4 text-center">
            <div className="text-2xl font-bold">{store.stats?.totalOrders ?? 0}</div>
            <div className="text-xs text-gray-500">Commandes</div>
          </div>
          <div className="bg-gray-50 rounded p-4 text-center">
            <div className="text-2xl font-bold">{store.stats?.totalRevenue ?? 0} €</div>
            <div className="text-xs text-gray-500">Chiffre d'affaires</div>
          </div>
          <div className="bg-gray-50 rounded p-4 text-center">
            <div className="text-2xl font-bold">{store.stats?.averageRating ?? 0}★</div>
            <div className="text-xs text-gray-500">Note moyenne</div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Modifier</button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Activer/Désactiver</button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={deleting}
            onClick={async () => {
              if (!window.confirm("Confirmer la suppression de cette boutique ?")) return;
              setDeleting(true);
              setError(null);
              setSuccess(null);
              try {
                // TODO: remplacer par appel API DELETE réel
                setSuccess("Boutique supprimée (simulation)");
              } catch (e: any) {
                setError(e.message || "Erreur inconnue");
                onError?.(e.message || "Erreur inconnue");
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
      </section>

      {/* TODO: Ajouter gestion vendeurs, catégories, produits, etc. */}
    </div>
  );
}
