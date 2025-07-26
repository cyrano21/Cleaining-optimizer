"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ShoppingCart,
  MessageSquare,
  ChevronDown,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeSettingsModal } from "@/components/modals/ThemeSettingsModal";
import { StoreSelector } from "@/components/store/store-selector";
import { ClientOnly } from "@/components/ui/client-only";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "product" | "system" | "other";
  isRead: boolean;
  createdAt: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: string;
}

interface Store {
  id: string;
  name: string;
}

interface HeaderProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({
  onMenuClick,
  onSidebarToggle,
  sidebarCollapsed,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const router = useRouter();

  // États pour les données réelles
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // État initial mémorisé pour éviter les re-créations
  const initialProfileData = useMemo(
    () => ({
      firstName: "",
      lastName: "",
      email: "",
      avatar: "/images/placeholder.svg",
      role: "User",
    }),
    []
  );

  const [profileData, setProfileData] = useState(initialProfileData);

  // Callbacks mémorisés
  const handleThemeModalOpen = useCallback(() => {
    setIsThemeModalOpen(true);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Fonction de mise à jour mémorisée pour éviter les re-créations d'objets
  const updateProfileData = useCallback((newData: ProfileData) => {
    setProfileData(newData);
  }, []);

  // Charger les données du profil utilisateur
  useEffect(() => {
    const loadProfileData = async () => {
      if (!session?.user) {
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);

      try {
        const response = await fetch("/api/settings/profile");
        if (response.ok) {
          const data = await response.json();
          updateProfileData({
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            email: data.data.email || session.user.email || "",
            avatar: data.data.avatar || "/images/placeholder.svg",
            role: session.user.role || "User",
          });
          setIsProfileLoading(false);
          return;
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      }

      // Fallback avec les données de session
      const nameParts = session.user.name?.split(" ") || [];
      updateProfileData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: session.user.email || "",
        avatar: session.user.image || "/images/placeholder.svg",
        role: session.user.role || "User",
      });
      setIsProfileLoading(false);
    };
    loadProfileData();
  }, [session?.user, updateProfileData]);

  // Charger les notifications réelles
  useEffect(() => {
    const loadNotifications = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/notifications?limit=5&unread=true");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.data.notifications || []);
          setUnreadNotifications(data.data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des notifications:", error);
      }
    };

    loadNotifications();
  }, [session?.user]);

  // Charger les messages réels
  useEffect(() => {
    const loadMessages = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/messages?limit=5&unread=true");
        if (response.ok) {
          const data = await response.json();
          setUnreadMessages(data.data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
      }
    };

    loadMessages();
  }, [session?.user]);

  // Charger le panier réel
  useEffect(() => {
    const loadCart = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          setCartTotal(data.data.totalItems || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
      }
    };

    loadCart();
  }, [session?.user]);

  // Mémoriser les calculs pour éviter les re-renders inutiles
  const fullName = useMemo(() => {
    return (
      `${profileData.firstName} ${profileData.lastName}`.trim() || "Utilisateur"
    );
  }, [profileData.firstName, profileData.lastName]);

  const displayRole = useMemo(() => {
    return profileData.role === "admin"
      ? "Administrateur"
      : profileData.role === "vendor"
        ? "Vendeur"
        : profileData.role === "customer"
          ? "Client"
          : "Utilisateur";
  }, [profileData.role]);

  // Handler pour la sélection de boutique
  const handleStoreChange = (store: Store) => {
    // Redirige vers la page d'administration de la boutique sélectionnée
    if (store && store.id) {
      router.push(`/admin/stores-management/${store.id}`);
    }
  };

  // Utiliser sidebarCollapsed pour améliorer l'UX
  const sidebarToggleTitle = sidebarCollapsed
    ? "Expand sidebar"
    : "Collapse sidebar";

  return (
    <header className="header fixed top-0 left-0 right-0 z-50 flex h-16 items-center gap-1 sm:gap-2 border-b bg-white dark:bg-gray-900 px-2 sm:px-3 md:px-6 shadow-sm backdrop-blur-sm">
      {" "}
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden flex-shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {/* Desktop Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:flex flex-shrink-0"
        onClick={onSidebarToggle}
        title={sidebarToggleTitle}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {/* Store Selector */}
      <div className="hidden md:block flex-shrink-0">
        <ClientOnly
          fallback={
            <div className="h-10 w-64 bg-gray-200 animate-pulse rounded" />
          }
        >
          <StoreSelector className="w-64" onStoreChange={handleStoreChange} />
        </ClientOnly>
      </div>
      {/* Search Bar */}
      <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <Input
            type="search"
            placeholder="Search products, orders, customers..."
            className="pl-10 pr-4 w-full text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {/* Right Side Actions */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {/* Centre de Contrôle Admin - NOUVEAU */}
        {session?.user?.role === "admin" && (
          <Link href="/admin/control-center">
            <Button
              variant="ghost"
              size="icon"
              title="Centre de Contrôle Admin"
              className="relative hidden sm:flex"
            >
              <Monitor className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-purple-500">
                7
              </Badge>
            </Button>
          </Link>
        )}

        {/* Theme Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeModalOpen}
          title="Paramètres de thème"
          className="hidden sm:flex"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          className="flex-shrink-0"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Shopping Cart */}
        <Button variant="ghost" size="icon" className="relative hidden sm:flex">
          <ShoppingCart className="h-5 w-5" />
          {cartTotal > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {cartTotal}
            </Badge>
          )}
        </Button>

        {/* Messages */}
        <Button variant="ghost" size="icon" className="relative hidden sm:flex">
          <MessageSquare className="h-5 w-5" />
          {unreadMessages > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadMessages}
            </Badge>
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative flex-shrink-0"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <Badge variant="secondary">{unreadNotifications} new</Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification._id}
                    className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      // Marquer comme lu si pas encore lu
                      if (!notification.isRead) {
                        fetch("/api/notifications", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            notificationId: notification._id,
                            read: true,
                          }),
                        }).then(() => {
                          // Recharger les notifications
                          setUnreadNotifications((prev) =>
                            Math.max(0, prev - 1)
                          );
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n._id === notification._id
                                ? { ...n, isRead: true }
                                : n
                            )
                          );
                        });
                      }
                    }}
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                        notification.isRead
                          ? "bg-gray-300"
                          : notification.type === "order"
                            ? "bg-blue-500"
                            : notification.type === "payment"
                              ? "bg-green-500"
                              : notification.type === "product"
                                ? "bg-yellow-500"
                                : notification.type === "system"
                                  ? "bg-purple-500"
                                  : "bg-red-500"
                      }`}
                    />

                    <div className="flex-1">
                      <p
                        className={`text-sm ${notification.isRead ? "font-normal" : "font-medium"}`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              )}
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-sm text-primary cursor-pointer"
              onClick={() => {
                // Aller vers la page des notifications
                window.location.href = "/notifications";
              }}
            >
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {!isProfileLoading ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 md:px-3 flex-shrink-0"
              >
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={profileData.avatar}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left min-w-0">
                  <p className="text-sm font-medium truncate">{fullName}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {displayRole}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={profileData.avatar}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="h-full w-full"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{fullName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {profileData.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Placeholder pendant le chargement
          <div className="flex items-center gap-2 px-2 md:px-3 flex-shrink-0">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="hidden md:block min-w-0">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-1" />
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        )}
      </div>
      {/* Theme Settings Modal */}
      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </header>
  );
}
