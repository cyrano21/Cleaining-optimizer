"use client";

import { createContext, useState, useEffect, useContext } from 'react';

// Créer le contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  return useContext(AuthContext);
}

// Fournisseur du contexte d'authentification
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simuler le chargement des données utilisateur depuis le stockage local au démarrage
  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('nextmimo_user');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      } finally {
        setLoading(false);
      }
    };

    // Simuler un délai de chargement pour démontrer l'état de chargement
    setTimeout(() => {
      loadUserFromLocalStorage();
    }, 1000);
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Simuler une requête API d'authentification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Vérifier les identifiants (dans une application réelle, cela serait fait par le serveur)
      if (email === 'louiscyrano@gmail.com' && password === 'Figoro21') {
        // Utilisateur admin
        const adminUser = {
          id: 'admin-123',
          email: 'louiscyrano@gmail.com',
          name: 'Louis Cyrano',
          role: 'admin',
          level: 10,
          xp: 8500,
          xpToNextLevel: 10000,
          streak: 15,
          completedLessons: 85,
          badges: 12,
          createdAt: new Date().toISOString()
        };
           setCurrentUser(adminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nextmimo_user', JSON.stringify(adminUser));
        // Définir un cookie pour que le middleware puisse le détecter
        document.cookie = `nextmimo_auth_token=${adminUser.id}; path=/; max-age=86400`;
      }
      return adminUser;
      } else if (email === 'user@example.com' && password === 'password123') {
        // Utilisateur standard
        const standardUser = {
          id: 'user-456',
          email: 'user@example.com',
          name: 'Utilisateur Test',
          role: 'user',
          level: 3,
          xp: 1250,
          xpToNextLevel: 2000,
          streak: 5,
          completedLessons: 24,
          badges: 4,
          createdAt: new Date().toISOString()
        };
           setCurrentUser(standardUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nextmimo_user', JSON.stringify(standardUser));
        // Définir un cookie pour que le middleware puisse le détecter
        document.cookie = `nextmimo_auth_token=${standardUser.id}; path=/; max-age=86400`;
      }
      return standardUser;
      } else {
        throw new Error("Identifiants invalides");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Simuler une requête API d'inscription
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Vérifier si l'email est déjà utilisé (dans une application réelle, cela serait fait par le serveur)
      if (email === 'louiscyrano@gmail.com' || email === 'user@example.com') {
        throw new Error("Cet email est déjà utilisé");
      }

      // Créer un nouvel utilisateur
      const newUser = {
        id: 'user-' + Date.now(),
        email,
        name,
        role: 'user',
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        streak: 0,
        completedLessons: 0,
        badges: 0,
        createdAt: new Date().toISOString()
      };

      setCurrentUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nextmimo_user', JSON.stringify(newUser));
        // Définir un cookie pour que le middleware puisse le détecter
        document.cookie = `nextmimo_auth_token=${newUser.id}; path=/; max-age=86400`;
      }
      return newUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nextmimo_user');
      // Supprimer également le cookie d'authentification
      document.cookie = 'nextmimo_auth_token=; path=/; max-age=0';
    }
  };

  // Fonction de mise à jour du profil utilisateur
  const updateProfile = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nextmimo_user', JSON.stringify(updatedUser));
    }
    return updatedUser;
  };

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return currentUser && currentUser.role === role;
  };

  // Fonction pour mettre à jour la progression de l'utilisateur
  const updateProgress = (lessonId, xpEarned = 0, completed = true) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser };
    
    // Mettre à jour les leçons complétées
    if (completed) {
      updatedUser.completedLessons += 1;
    }
    
    // Ajouter XP
    if (xpEarned > 0) {
      updatedUser.xp += xpEarned;
      
      // Vérifier si l'utilisateur monte de niveau
      if (updatedUser.xp >= updatedUser.xpToNextLevel) {
        updatedUser.level += 1;
        updatedUser.xp = updatedUser.xp - updatedUser.xpToNextLevel;
        updatedUser.xpToNextLevel = Math.round(updatedUser.xpToNextLevel * 1.5); // Augmenter l'XP nécessaire pour le niveau suivant
      }
    }
    
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nextmimo_user', JSON.stringify(updatedUser));
    }
    return updatedUser;
  };

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    updateProgress,
    isAdmin: () => hasRole('admin'),
    isAuthenticated: () => !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
