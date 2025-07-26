"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';

// Types pour les données
interface RolesData {
  success: boolean;
  data?: {
    totalRoles?: number;
    roles?: any[];
    summary?: {
      activeRoles?: number;
      inactiveRoles?: number;
      totalUsers?: number;
    };
  };
}

interface ApiTestResult {
  success: boolean;
  status: string;
  timestamp: string;
  method?: string;
  endpoint?: string;
  error?: string;
  data?: any;
}

function DebugCenterPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // États pour les différentes sections
  const [userDetails, setUserDetails] = useState<any>(null);
  const [rolesData, setRolesData] = useState<RolesData | null>(null);
  const [sessionDebug, setSessionDebug] = useState<any>(null);
  const [apiTestResults, setApiTestResults] = useState<Record<string, ApiTestResult>>({});

  // Gérer les paramètres d'URL pour les onglets
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'user', 'roles', 'apis', 'dashboard', 'vendor', 'system', 'actions'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  // Mettre à jour l'URL quand l'onglet change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Fonctions de fetch
  const fetchUserDetails = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/user/${session.user.id}`);
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      setRolesData(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };
  const debugSession = async () => {
    try {
      const response = await fetch('/api/debug/session');
      const data = await response.json();
      setSessionDebug(data);
      console.log('Debug session:', data);
      return data;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };
  // Nouvelle fonction pour diagnostiquer le problème de rôle
  const diagnoseRoleIssue = async () => {
    console.log('🔍 DIAGNOSTIC DU PROBLÈME DE RÔLE');
    console.log('Session actuelle:', session);
    
    if (session?.user?.email) {
      try {
        // Test direct de l'API d'utilisateur
        const userResponse = await fetch(`/api/auth/user/${session.user.id}`);
        const userData = await userResponse.json();
        console.log('📊 Données utilisateur depuis API:', userData);
        
        // Test de l'API de debug session
        const debugResponse = await fetch('/api/debug/session');
        const debugData = await debugResponse.json();
        console.log('🔍 Debug session complet:', debugData);
        
        // Test de l'API de refresh du rôle
        const refreshResponse = await fetch('/api/auth/refresh-role', { method: 'POST' });
        const refreshData = await refreshResponse.json();
        console.log('🔄 Refresh role data:', refreshData);
        
        // Comparaison
        console.log('📋 COMPARAISON:');
        console.log('- Session.user.role:', session.user.role);
        console.log('- User DB role:', debugData?.data?.userFromDB?.role);
        console.log('- User API role:', userData?.user?.role);
        console.log('- Refresh API role:', refreshData?.data?.realUserRole);
        
        // Mise à jour des états pour affichage
        setUserDetails(userData);
        setSessionDebug(debugData);
        
        // Alerte si incohérence détectée
        if (refreshData?.data?.needsUpdate) {
          alert(`⚠️ INCOHÉRENCE DÉTECTÉE!\n\nSession: ${session.user.role}\nBDD: ${refreshData.data.realUserRole}\n\nUne reconnexion est nécessaire.`);
        }
        
        return {
          sessionRole: session.user.role,
          dbRole: debugData?.data?.userFromDB?.role,
          apiRole: userData?.user?.role,
          refreshRole: refreshData?.data?.realUserRole,
          needsUpdate: refreshData?.data?.needsUpdate
        };
      } catch (error) {
        console.error('Erreur lors du diagnostic:', error);
      }
    }  };

  // Diagnostic du rôle
  const diagnoseRole = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/refresh-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      console.log('🔍 Diagnostic du rôle:', data);
      
      if (data.success) {
        const isRoleOutdated = data.data.needsUpdate;
        const message = `🔍 DIAGNOSTIC DU RÔLE:

📋 Session actuelle: ${data.data.currentSessionRole}
🗄️ Base de données: ${data.data.realUserRole}
⚠️ Mise à jour nécessaire: ${isRoleOutdated ? 'OUI' : 'NON'}

${isRoleOutdated ? 
  '🔄 SOLUTION: Votre session contient un ancien rôle.\nVous devez vous reconnecter pour voir les changements.' : 
  '✅ Votre rôle est à jour dans la session.'}

Voulez-vous vous reconnecter maintenant ?`;

        if (isRoleOutdated && confirm(message)) {
          await forceReconnection();
        } else {
          alert(message);
        }
      } else {
        alert('❌ Erreur lors du diagnostic: ' + data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors du diagnostic du rôle');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour forcer la reconnexion
  const forceReconnection = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous reconnecter pour mettre à jour votre rôle ?')) {
      try {
        // Déconnexion
        await fetch('/api/auth/signout', { method: 'POST' });
        // Redirection vers la page de connexion
        window.location.href = '/auth/signin';
      } catch (error) {
        console.error('Erreur lors de la reconnexion:', error);
        alert('Erreur lors de la reconnexion. Veuillez vous déconnecter manuellement.');
      }
    }
  };

  // Actions d'attribution de rôles
  const assignSuperAdminRole = async () => {
    setUpdating(true);
    try {
      const response = await fetch('/api/setup/super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Rôle Super Admin attribué avec succès !');
        await fetchUserDetails();
        await fetchRoles();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'attribution du rôle');
    } finally {
      setUpdating(false);
    }
  };

  const assignVendorRole = async () => {
    setUpdating(true);
    try {
      const response = await fetch('/api/setup/vendor-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Rôle vendeur attribué avec succès !');
        await fetchUserDetails();
        await fetchRoles();
      } else {
        alert('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'attribution du rôle');
    } finally {
      setUpdating(false);
    }
  };
  // Tests d'APIs étendus
  const testAPI = async (apiName: string, endpoint: string, method: string = 'GET', body: any = null) => {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(endpoint, options);
      let data;
      let parseError = null;
      
      try {
        data = await response.json();
      } catch (e) {
        parseError = 'JSON parse failed';
        data = await response.text();
      }
      
      const result = {
        status: response.status.toString(),
        statusText: response.statusText,
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
        parseError,
        timestamp: new Date().toISOString(),
        method,
        endpoint
      };
      
      setApiTestResults(prev => ({
        ...prev,
        [apiName]: result
      }));
      
      return result;
    } catch (error) {      const result = {
        status: 'NETWORK_ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        method,
        endpoint
      };
      
      setApiTestResults(prev => ({
        ...prev,
        [apiName]: result
      }));
      
      return result;
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    try {
      await Promise.all([
        // APIs principales vendeur
        testAPI('vendor-orders', '/api/vendor/orders'),
        testAPI('vendor-products', '/api/vendor/products'),
        testAPI('vendor-analytics', '/api/vendor/analytics'),
        
        // APIs dashboard
        testAPI('dashboard-stats', '/api/dashboard/stats'),
        testAPI('revenue-chart', '/api/dashboard/revenue-chart?period=month'),
        testAPI('category-sales', '/api/dashboard/category-sales'),
        testAPI('recent-orders', '/api/dashboard/recent-orders'),
        testAPI('top-products', '/api/dashboard/top-products'),
        testAPI('weather', '/api/dashboard/weather'),
        
        // APIs système
        testAPI('stores', '/api/stores'),
        testAPI('session', '/api/auth/session'),
        testAPI('admin-roles', '/api/admin/roles'),
        
        // Tests spécifiques
        testAPI('debug-session', '/api/debug/session'),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Tests spécifiques par catégorie
  const runDashboardTests = async () => {
    setLoading(true);
    try {
      await Promise.all([
        testAPI('dashboard-stats', '/api/dashboard/stats'),
        testAPI('revenue-chart-month', '/api/dashboard/revenue-chart?period=month'),
        testAPI('revenue-chart-year', '/api/dashboard/revenue-chart?period=year'),
        testAPI('category-sales', '/api/dashboard/category-sales'),
        testAPI('recent-orders', '/api/dashboard/recent-orders'),
        testAPI('top-products', '/api/dashboard/top-products'),
        testAPI('weather', '/api/dashboard/weather'),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const runVendorTests = async () => {
    setLoading(true);
    try {
      await Promise.all([
        testAPI('vendor-orders', '/api/vendor/orders'),
        testAPI('vendor-products', '/api/vendor/products'),
        testAPI('vendor-analytics', '/api/vendor/analytics'),
        testAPI('vendor-categories', '/api/vendor/categories'),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const runSystemTests = async () => {
    setLoading(true);
    try {
      await Promise.all([
        testAPI('auth-session', '/api/auth/session'),
        testAPI('debug-session', '/api/debug/session'),
        testAPI('admin-roles', '/api/admin/roles'),
        testAPI('stores', '/api/stores'),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserDetails();
      fetchRoles();
      debugSession();
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="p-6">Chargement de la session...</div>;
  }

  if (!session?.user) {
    return <div className="p-6">Vous devez être connecté pour accéder au centre de debug.</div>;
  }

  const tabs = [
    { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
    { id: 'user', label: '👤 Utilisateur', icon: '👤' },
    { id: 'roles', label: '🔒 Rôles', icon: '🔒' },
    { id: 'apis', label: '🧪 Tests API', icon: '🧪' },
    { id: 'dashboard', label: '📈 Dashboard APIs', icon: '📈' },
    { id: 'vendor', label: '🏪 Vendor APIs', icon: '🏪' },
    { id: 'system', label: '⚙️ Système', icon: '⚙️' },
    { id: 'actions', label: '⚡ Actions', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔧</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Centre de Debug
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {session.user.email} • {session.user.role || 'No role'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Session */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">🔐</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Session Status</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {status === 'authenticated' ? 'Connecté' : 'Déconnecté'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Rôle Actuel */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">👑</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rôle Actuel</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {session.user.role || 'Non défini'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Total Rôles */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">🎭</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Rôles</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {rolesData?.data?.totalRoles || 'Chargement...'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ Actions Rapides</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={runAllTests}
                  disabled={loading}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
                >
                  {loading ? 'Test...' : '🧪 Tous APIs'}
                </button>
                <button
                  onClick={runDashboardTests}
                  disabled={loading}
                  className="bg-cyan-500 text-white px-3 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400 text-sm"
                >
                  {loading ? 'Test...' : '📈 Dashboard'}
                </button>
                <button
                  onClick={runVendorTests}
                  disabled={loading}
                  className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
                >
                  {loading ? 'Test...' : '🏪 Vendeur'}
                </button>
                <button
                  onClick={runSystemTests}
                  disabled={loading}
                  className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400 text-sm"
                >
                  {loading ? 'Test...' : '⚙️ Système'}
                </button>
                <button
                  onClick={assignSuperAdminRole}
                  disabled={updating}
                  className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
                >
                  {updating ? 'Attribution...' : '👑 Super Admin'}
                </button>
                <button
                  onClick={assignVendorRole}
                  disabled={updating}
                  className="bg-emerald-500 text-white px-3 py-2 rounded hover:bg-emerald-600 disabled:bg-gray-400 text-sm"
                >
                  {updating ? 'Attribution...' : '🏪 Vendeur'}
                </button>                <button
                  onClick={() => window.location.href = '/vendor-dashboard'}
                  className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 text-sm"
                >
                  🏪 Dashboard
                </button><button
                  onClick={() => window.location.reload()}
                  className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
                >
                  🔄 Recharger
                </button>                <button
                  onClick={diagnoseRole}
                  disabled={loading}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 text-sm"
                >
                  {loading ? 'Diagnostic...' : '🩺 Diagnostic Rôle'}
                </button>
              </div>
            </div>

            {/* Statistiques Détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tests API en cours */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📊 État des Tests</h3>
                <div className="space-y-3">
                  {Object.keys(apiTestResults).length > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span>Total APIs testées:</span>
                        <span className="font-semibold">{Object.keys(apiTestResults).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Succès:</span>
                        <span className="font-semibold text-green-600">
                          {Object.values(apiTestResults).filter(r => r.success).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Échecs:</span>
                        <span className="font-semibold text-red-600">
                          {Object.values(apiTestResults).filter(r => !r.success).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux de réussite:</span>
                        <span className="font-semibold">
                          {Math.round((Object.values(apiTestResults).filter(r => r.success).length / Object.keys(apiTestResults).length) * 100)}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Aucun test exécuté
                    </div>
                  )}
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">👤 Détails Session</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>ID Utilisateur:</span>
                    <span className="font-mono text-sm">{session?.user?.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nom:</span>
                    <span className="font-semibold">{session?.user?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-sm">{session?.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Store ID:</span>
                    <span className="font-mono text-sm">{(session?.user as any)?.storeId || 'N/A'}</span>
                  </div>
                  {userDetails && (
                    <div className="flex justify-between">
                      <span>DB Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        userDetails.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {userDetails.success ? 'Connecté' : 'Erreur'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Utilisateur */}
        {activeTab === 'user' && (
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="text-lg font-semibold mb-3">Session NextAuth</h2>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>

            {loading && (
              <div className="text-center">Chargement des détails utilisateur...</div>
            )}

            {userDetails && (
              <div className="bg-blue-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-3">Détails Utilisateur (DB)</h2>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(userDetails, null, 2)}
                </pre>
              </div>
            )}

            {sessionDebug && (
              <div className="bg-purple-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-3">Debug Session Complet</h2>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(sessionDebug, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Onglet Rôles */}
        {activeTab === 'roles' && rolesData && (
          <div className="space-y-6">
            {/* Résumé */}
            <div className="bg-blue-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">📊 Résumé des Rôles</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{rolesData.data?.totalRoles || 0}</div>
                  <div className="text-sm text-gray-600">Total Rôles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{rolesData.data?.summary?.activeRoles || 0}</div>
                  <div className="text-sm text-gray-600">Actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{rolesData.data?.summary?.inactiveRoles || 0}</div>
                  <div className="text-sm text-gray-600">Inactifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{rolesData.data?.summary?.totalUsers || 0}</div>
                  <div className="text-sm text-gray-600">Total Utilisateurs</div>
                </div>
              </div>
            </div>

            {/* Liste des rôles */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🎭 Rôles Disponibles</h2>
              
              {rolesData.data?.roles?.map((role, index) => (
                <div key={role._id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {role.name === 'admin' || role.name === 'super_admin' ? '👑' : 
                         role.name === 'vendor' ? '🏪' : '👤'}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold">{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded text-xs ${
                        role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {role.isActive ? 'Actif' : 'Inactif'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {role.userCount} utilisateur(s)
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Permissions ({role.permissions?.length || 0}) :
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions?.map((permission: string, idx: number) => (
                        <span 
                          key={idx}
                          className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Utilisateurs */}
                  {role.users && role.users.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Utilisateurs avec ce rôle :
                      </h4>
                      <div className="space-y-1">
                        {role.users.map((user: any, idx: number) => (
                          <div key={user._id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{user.name || 'Sans nom'}</span>
                            <span className="text-gray-600">{user.email}</span>
                          </div>
                        ))}
                        {role.userCount > role.users.length && (
                          <div className="text-xs text-gray-500 italic">
                            ... et {role.userCount - role.users.length} autre(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Tests API */}
        {activeTab === 'apis' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">🧪 Tests d'APIs - Tous</h2>
              <button
                onClick={runAllTests}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Test en cours...' : 'Relancer tous les tests'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(apiTestResults).map(([apiName, result]) => (
                <div key={apiName} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{apiName}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div>{result.method} {result.endpoint}</div>
                    <div>{result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Timestamp non disponible'}</div>
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer">Voir la réponse</summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs max-h-60">
                      {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>

            {Object.keys(apiTestResults).length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Aucun test d'API exécuté. Cliquez sur "Relancer tous les tests" pour commencer.
              </div>
            )}
          </div>
        )}

        {/* Onglet Dashboard APIs */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">📈 Tests APIs Dashboard</h2>
              <button
                onClick={runDashboardTests}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Test en cours...' : 'Tester APIs Dashboard'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tests individuels */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-3">📊 Tests Individuels</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => testAPI('dashboard-stats', '/api/dashboard/stats')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    📊 Dashboard Stats
                  </button>
                  <button
                    onClick={() => testAPI('revenue-month', '/api/dashboard/revenue-chart?period=month')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    💰 Revenue (Mois)
                  </button>
                  <button
                    onClick={() => testAPI('revenue-year', '/api/dashboard/revenue-chart?period=year')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    💰 Revenue (Année)
                  </button>
                  <button
                    onClick={() => testAPI('category-sales', '/api/dashboard/category-sales')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    🏷️ Ventes par Catégorie
                  </button>
                  <button
                    onClick={() => testAPI('recent-orders', '/api/dashboard/recent-orders')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    📋 Commandes Récentes
                  </button>
                  <button
                    onClick={() => testAPI('top-products', '/api/dashboard/top-products')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    🔝 Top Produits
                  </button>
                  <button
                    onClick={() => testAPI('weather', '/api/dashboard/weather')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    🌤️ Météo
                  </button>
                </div>
              </div>

              {/* Résultats récents */}
              <div className="md:col-span-2 space-y-4">
                {Object.entries(apiTestResults)
                  .filter(([key]) => key.includes('dashboard') || key.includes('revenue') || key.includes('category') || key.includes('recent') || key.includes('top') || key.includes('weather'))
                  .map(([apiName, result]) => (
                    <div key={apiName} className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{apiName}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Timestamp non disponible'}
                      </div>
                      <details className="text-sm">
                        <summary className="cursor-pointer">Voir les données</summary>
                        <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs max-h-40">
                          {JSON.stringify(result.data || result.error, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Vendor APIs */}
        {activeTab === 'vendor' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">🏪 Tests APIs Vendeur</h2>
              <button
                onClick={runVendorTests}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Test en cours...' : 'Tester APIs Vendeur'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tests individuels */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-3">🏪 Tests Vendeur</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => testAPI('vendor-orders', '/api/vendor/orders')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    📋 Commandes Vendeur
                  </button>
                  <button
                    onClick={() => testAPI('vendor-products', '/api/vendor/products')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    📦 Produits Vendeur
                  </button>
                  <button
                    onClick={() => testAPI('vendor-analytics', '/api/vendor/analytics')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    📊 Analytics Vendeur
                  </button>
                  <button
                    onClick={() => testAPI('vendor-categories', '/api/vendor/categories')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    🏷️ Catégories
                  </button>
                </div>
              </div>

              {/* Résultats récents */}
              <div className="md:col-span-2 space-y-4">
                {Object.entries(apiTestResults)
                  .filter(([key]) => key.includes('vendor'))
                  .map(([apiName, result]) => (
                    <div key={apiName} className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{apiName}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Timestamp non disponible'}
                      </div>
                      <details className="text-sm">
                        <summary className="cursor-pointer">Voir les données</summary>
                        <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs max-h-40">
                          {JSON.stringify(result.data || result.error, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Système */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">⚙️ Tests Système</h2>
              <button
                onClick={runSystemTests}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
              >
                {loading ? 'Test en cours...' : 'Tester APIs Système'}
              </button>
            </div>            {/* Diagnostics système */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">🔍 Diagnostics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Status Session</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      status === 'authenticated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>User Role (Session)</span>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {session?.user?.role || 'Non défini'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>User Role (DB)</span>
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                      {sessionDebug?.data?.userFromDB?.role || 'Non récupéré'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cohérence Rôle</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      session?.user?.role === sessionDebug?.data?.userFromDB?.role 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {session?.user?.role === sessionDebug?.data?.userFromDB?.role ? '✓ OK' : '⚠️ Incohérent'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>User Email</span>
                    <span className="text-sm text-gray-600">
                      {session?.user?.email || 'Non défini'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Store ID</span>
                    <span className="text-sm text-gray-600">
                      {(session?.user as any)?.storeId || 'Non défini'}
                    </span>
                  </div>
                </div>                  <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={diagnoseRole}
                    disabled={loading}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400 mb-2"
                  >
                    {loading ? 'Diagnostic...' : '🩺 Lancer Diagnostic Complet'}
                  </button>
                  <button
                    onClick={forceReconnection}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    🔄 Forcer Reconnexion
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">🧪 Tests Rapides</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => testAPI('auth-session', '/api/auth/session')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    🔐 Test Session Auth
                  </button>
                  <button
                    onClick={() => testAPI('debug-session', '/api/debug/session')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    🔍 Debug Session
                  </button>
                  <button
                    onClick={() => testAPI('admin-roles', '/api/admin/roles')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    👑 Admin Roles
                  </button>
                  <button
                    onClick={() => testAPI('stores', '/api/stores')}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-2 rounded text-sm"
                  >
                    🏪 Stores
                  </button>
                </div>
              </div>
            </div>

            {/* Résultats système */}
            <div className="space-y-4">
              {Object.entries(apiTestResults)
                .filter(([key]) => key.includes('auth') || key.includes('debug') || key.includes('admin') || key.includes('stores'))
                .map(([apiName, result]) => (
                  <div key={apiName} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{apiName}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer">Voir les données</summary>
                      <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs max-h-40">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Onglet Actions */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">⚡ Actions Système</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attribution de rôles */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">👑 Attribution de Rôles</h3>
                <div className="space-y-3">
                  <button
                    onClick={assignSuperAdminRole}
                    disabled={updating}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
                  >
                    {updating ? 'Attribution...' : '👑 Attribuer Super Admin'}
                  </button>
                  
                  <button
                    onClick={assignVendorRole}
                    disabled={updating}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                  >
                    {updating ? 'Attribution...' : '🏪 Attribuer Vendeur'}
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">🧭 Navigation</h3>
                <div className="space-y-3">                  <button
                    onClick={() => window.location.href = '/vendor-dashboard'}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    🏪 Dashboard Vendeur
                  </button>
                    <button
                    onClick={() => window.location.href = '/vendor-dashboard/products'}
                    className="w-full bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
                  >
                    📦 Gestion Produits
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/vendor-dashboard/orders'}
                    className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                  >
                    📋 Gestion Commandes
                  </button>
                </div>
              </div>

              {/* Tests manuels */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">🧪 Tests Manuels</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => testAPI('vendor-orders', '/api/vendor/orders')}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    Test API Commandes
                  </button>
                  
                  <button
                    onClick={() => testAPI('vendor-products', '/api/vendor/products')}
                    className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Test API Produits
                  </button>
                  
                  <button
                    onClick={debugSession}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Debug Session
                  </button>
                </div>
              </div>

              {/* Actualisation */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">🔄 Actualisation</h3>
                <div className="space-y-3">
                  <button
                    onClick={fetchRoles}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    🔄 Actualiser Rôles
                  </button>
                  
                  <button
                    onClick={fetchUserDetails}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    🔄 Actualiser Utilisateur
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    🔄 Recharger la Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DebugCenterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Chargement...</div></div>}>
      <DebugCenterPageContent />
    </Suspense>
  );
}
