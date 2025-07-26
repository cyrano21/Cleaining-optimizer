'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Mail,
  Lock,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { NotificationSystem } from '@/components/ui/notification-system';

export default function AdminAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('louiscyrano@gmail.com');
  const [password, setPassword] = useState('Figoro21');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginResult, setLoginResult] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginResult(null);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginResult({ success: true, message: 'Connexion réussie !', user: data.user });
        addNotification('🎉 Connexion administrateur réussie ! Redirection...', 'success');
        
        // Stocker le token et les informations utilisateur
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        setTimeout(() => {
          router.push('/admin/control-center');
        }, 1500);
      } else {
        setLoginResult({ success: false, message: data.error });
        addNotification(data.error || 'Erreur de connexion administrateur', 'error');
      }
    } catch (error) {
      const errorMessage = 'Erreur de connexion au système admin';
      setLoginResult({ success: false, message: errorMessage });
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = () => {
    setEmail('louiscyrano@gmail.com');
    setPassword('Figoro21');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">
              Administration System
            </CardTitle>
            <p className="text-gray-300">
              Accès sécurisé au centre de contrôle
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Formulaire de connexion */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  placeholder="admin@entreprise.fr"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      🔄
                    </motion.div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            {/* Connexion rapide */}
            <div className="border-t border-white/20 pt-4">
              <Button
                onClick={quickLogin}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                ⚡ Connexion rapide (compte existant)
              </Button>
            </div>

            {/* Résultat de la connexion */}
            {loginResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-lg border ${
                  loginResult.success 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-red-500/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {loginResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={`font-medium ${
                    loginResult.success ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {loginResult.success ? 'Connexion réussie !' : 'Erreur de connexion'}
                  </span>
                </div>
                <p className={`text-sm ${
                  loginResult.success ? 'text-green-200' : 'text-red-200'
                }`}>
                  {loginResult.message}
                </p>
                {loginResult.success && loginResult.user && (
                  <div className="mt-3 space-y-1">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {loginResult.user.role}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-green-200">
                      <ArrowRight className="h-4 w-4" />
                      Redirection vers le centre de contrôle...
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Informations d'aide */}
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200">
                💡 <strong>Compte existant :</strong> louiscyrano@gmail.com / Figoro21
              </p>
            </div>

            {/* Navigation */}
            <div className="border-t border-white/20 pt-4 space-y-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth/signin')}
                className="w-full text-gray-300 hover:text-white hover:bg-white/10"
              >
                🔐 Page de connexion utilisateur
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="w-full text-gray-300 hover:text-white hover:bg-white/10"
              >
                🏠 Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <NotificationSystem
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
}

