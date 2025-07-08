export default function ErrorMessage({ 
  title = "Erreur", 
  message, 
  actionLabel, 
  onAction,
  className = '' 
}) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mb-4 text-red-400">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      {message && (
        <p className="mb-4 text-gray-600">{message}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
