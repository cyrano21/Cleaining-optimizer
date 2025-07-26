export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner animé */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Texte de chargement */}
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Chargement en cours...
          </h2>
          <p className="text-sm text-gray-600">
            Veuillez patienter quelques instants
          </p>
        </div>

        {/* Barre de progression animée */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
