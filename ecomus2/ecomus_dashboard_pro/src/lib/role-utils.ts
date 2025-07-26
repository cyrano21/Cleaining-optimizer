// Mapping des rôles pour assurer la compatibilité entre ancien et nouveau système
export const ROLE_MAPPING = {
  // Ancien système -> Nouveau système
  'admin': 'SUPER_ADMIN',
  'super_admin': 'SUPER_ADMIN', // ← AJOUT pour les rôles en minuscules
  'vendor': 'MODERATOR', 
  'customer': 'customer',
  
  // Nouveau système (reste inchangé)
  'SUPER_ADMIN': 'SUPER_ADMIN',
  'ADMIN': 'ADMIN', 
  'MODERATOR': 'MODERATOR'
};

// Mapping inverse pour la compatibilité
export const LEGACY_ROLE_MAPPING = {
  'SUPER_ADMIN': 'admin',
  'ADMIN': 'admin',
  'MODERATOR': 'vendor',
  'customer': 'customer'
};

// Hiérarchie des rôles
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 3,
  ADMIN: 2, 
  MODERATOR: 1,
  customer: 0
};

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT', 
    'ADMIN_MANAGEMENT',
    'VENDOR_ACCESS',
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT',
    'ANALYTICS_ACCESS',
    'SYSTEM_SETTINGS',
    'ALL_DASHBOARDS',
    'AUDIT_LOGS',
    'SECURITY_SETTINGS'
  ],
  ADMIN: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT',
    'VENDOR_ACCESS', 
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT',
    'ANALYTICS_ACCESS',
    'ALL_DASHBOARDS'
  ],
  MODERATOR: [
    'ADMIN_ACCESS',
    'USER_MANAGEMENT',
    'PRODUCT_MANAGEMENT',
    'ORDER_MANAGEMENT'
  ],
  customer: [] as string[]
};

// Fonction pour normaliser un rôle vers le nouveau système
export function normalizeRole(role: string): string {
  const mappedRole = ROLE_MAPPING[role as keyof typeof ROLE_MAPPING];
  return mappedRole || role;
}

// Fonction pour vérifier si un utilisateur a un rôle ou supérieur
export function hasRoleOrHigher(userRole: string, requiredRole: string): boolean {
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRole = normalizeRole(requiredRole);
  
  const userLevel = ROLE_HIERARCHY[normalizedUserRole as keyof typeof ROLE_HIERARCHY] || 0;
  const requiredLevel = ROLE_HIERARCHY[normalizedRequiredRole as keyof typeof ROLE_HIERARCHY] || 0;
  
  return userLevel >= requiredLevel;
}

// Fonction pour vérifier si un utilisateur a une permission
export function hasPermission(userRole: string, permission: string): boolean {
  const normalizedRole = normalizeRole(userRole);
  const permissions = ROLE_PERMISSIONS[normalizedRole as keyof typeof ROLE_PERMISSIONS] || [];
  return permissions.includes(permission);
}

// Fonction pour vérifier si c'est un admin (ancien ou nouveau système)
export function isAdmin(role: string): boolean {
  const normalizedRole = normalizeRole(role);
  return ['SUPER_ADMIN', 'ADMIN'].includes(normalizedRole);
}

// Fonction pour vérifier l'accès admin (compatible avec l'ancien système)
export function checkAdminAccess(role: string): boolean {
  // Support de l'ancien système (minuscules)
  if (['admin', 'super_admin'].includes(role)) return true;
  
  // Support du nouveau système (majuscules) via normalisation
  return isAdmin(role);
}
