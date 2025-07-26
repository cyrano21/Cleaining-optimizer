'use client';

import { useState } from 'react';

export default function TestAuth() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testForgotPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        forgotPassword: { status: response.status, data }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        forgotPassword: { error: error.message }
      }));
    }
    setLoading(false);
  };

  const testResetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        resetPassword: { status: response.status, data }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        resetPassword: { error: error.message }
      }));
    }
    setLoading(false);
  };

  const testValidateToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`);
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        validateToken: { status: response.status, data }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        validateToken: { error: error.message }
      }));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test API Authentication</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaires de test */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Forgot Password</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={testForgotPassword}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Test en cours...' : 'Tester Forgot Password'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Reset Password</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Token de réinitialisation"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={testValidateToken}
                    disabled={loading || !token}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Valider Token
                  </button>
                  <button
                    onClick={testResetPassword}
                    disabled={loading || !token || !password}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Résultats des tests</h2>
              <div className="space-y-4">
                {Object.entries(results).map(([key, result]) => (
                  <div key={key} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-gray-900">{key}</h3>
                    <pre className="mt-1 text-sm text-gray-600 overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>1. <strong>Test Forgot Password :</strong> Entrez un email pour tester l'envoi du lien de réinitialisation</p>
                <p>2. <strong>Valider Token :</strong> Copiez le token depuis le résultat de forgot password et testez sa validité</p>
                <p>3. <strong>Reset Password :</strong> Utilisez le token valide pour réinitialiser le mot de passe</p>
                <p className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>Note :</strong> En mode développement, le token de réinitialisation est retourné dans la réponse pour faciliter les tests.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Liens utiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/auth/login" className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg text-center transition-colors">
                <div className="font-medium text-blue-800">Page de Login</div>
                <div className="text-sm text-blue-600">Tester la connexion</div>
              </a>
              <a href="/auth/forgot-password" className="bg-green-100 hover:bg-green-200 p-4 rounded-lg text-center transition-colors">
                <div className="font-medium text-green-800">Mot de passe oublié</div>
                <div className="text-sm text-green-600">Interface utilisateur</div>
              </a>
              <a href="/dashboard-redirect" className="bg-purple-100 hover:bg-purple-200 p-4 rounded-lg text-center transition-colors">
                <div className="font-medium text-purple-800">Dashboard</div>
                <div className="text-sm text-purple-600">Redirection vers le tableau de bord</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
