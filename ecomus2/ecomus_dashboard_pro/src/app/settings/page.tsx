"use client";

import { useState, useEffect } from "react";
import {
  Save,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Palette,
  Camera,
  Mail,
  Phone,
  Building,
  Link,
  FileText,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  Clock,
  Calendar,
  Hash,
  DollarSign,
  MapPin,
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ParamètresPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [ProfilData, setProfilData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "sophie.martin@entreprise.fr",
    phone: "+1 (555) 123-4567",
    company: "Acme Corp",
    website: "https://acme.com",
    bio: "E-commerce manager with 5+ years of experience",
    avatar: "/images/placeholder.svg",
    location: "",
    position: "",
  });

  const [notifications, setNotifications] = useState({
    emailCommandes: true,
    emailMarketing: false,
    pushCommandes: true,
    pushMarketing: false,
    smsCommandes: false,
    smsMarketing: false,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: "30",
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC-5",
    currency: "USD",
    theme: "light",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "european",
  });

  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Mettre à jour l'avatar dans le profil
        const updatedProfilData = {
          ...ProfilData,
          avatar: result.data.url,
        };
        setProfilData(updatedProfilData);

        // Sauvegarder le nouveau profil avec l'avatar
        const saveResponse = await fetch("/api/settings/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProfilData),
        });

        const saveResult = await saveResponse.json();

        if (saveResponse.ok && saveResult.success) {
          toast.success("Avatar mis à jour avec succès!");
        } else {
          toast.error("Erreur lors de la sauvegarde du profil");
        }
      } else {
        toast.error(result.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur upload avatar:", error);
      toast.error("Erreur lors de l'upload de l'avatar");
    } finally {
      setAvatarUploading(false);
      // Reset input file
      event.target.value = "";
    }
  };

  const loadProfilData = async () => {
    try {
      const response = await fetch("/api/settings/profile");
      const result = await response.json();

      console.log("📞 Paramètres PAGE - Données reçues de l'API:", result.data);

      if (response.ok && result.success) {
        // Mapper les données de l'API vers le state local
        const apiData = result.data;
        setProfilData({
          firstName: apiData.firstName || "",
          lastName: apiData.lastName || "",
          email: apiData.email || "",
          phone: apiData.phone || "",
          company: apiData.company || "",
          website: apiData.website || "",
          bio: apiData.bio || "",
          avatar: apiData.avatar || "/images/placeholder.svg",
          location: apiData.location || "",
          position: apiData.position || "",
        });

        console.log("📞 Paramètres PAGE - State mis à jour:", {
          firstName: apiData.firstName,
          lastName: apiData.lastName,
          fullName: apiData.name,
          email: apiData.email,
        });
      }
    } catch (error) {
      console.error("Error loading Profil:", error);
    }
  };

  const handleProfilSave = async () => {
    setLoading(true);
    try {
      console.log("📞 Paramètres PAGE - Données à sauvegarder:", ProfilData);

      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ProfilData),
      });

      const result = await response.json();

      console.log("📞 Paramètres PAGE - Réponse de sauvegarde:", result);

      if (response.ok && result.success) {
        console.log("Profil saved successfully:", result.data);
        // Update local state with saved data
        const apiData = result.data;
        setProfilData({
          firstName: apiData.firstName || "",
          lastName: apiData.lastName || "",
          email: apiData.email || "",
          phone: apiData.phone || "",
          company: apiData.company || "",
          website: apiData.website || "",
          bio: apiData.bio || "",
          avatar: apiData.avatar || "/images/placeholder.svg",
          location: apiData.location || "",
          position: apiData.position || "",
        });
        // Show success message to user
        toast.success("Profil sauvegardé avec succès!");
      } else {
        throw new Error(result.error || "Failed to save Profil");
      }
    } catch (error) {
      console.error("Error saving Profil:", error);
      toast.error(
        "Erreur lors de la sauvegarde du profil. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfilData();
  }, []);

  const handleNotificationsSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Notifications saved:", notifications);
      toast.success("Préférences de notification sauvegardées!");
    } catch (error) {
      console.error("Error saving notifications:", error);
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Security saved:", security);
      toast.success("Paramètres de sécurité sauvegardés!");
    } catch (error) {
      console.error("Error saving security:", error);
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Preferences saved:", preferences);
      toast.success("Préférences sauvegardées!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header avec gradient */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Paramètres du compte
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Gérez vos informations personnelles et préférences
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="Profil" className="space-y-8">
            {/* Navigation améliorée */}
            <div className="bg-white rounded-2xl shadow-lg p-2">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-transparent gap-1 md:gap-2 overflow-x-auto">
                <TabsTrigger
                  value="Profil"
                  className="flex items-center space-x-2 md:space-x-3 px-3 md:px-6 py-3 md:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-gray-50 text-xs md:text-sm whitespace-nowrap"
                >
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium">Profil</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center space-x-2 md:space-x-3 px-3 md:px-6 py-3 md:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-gray-50 text-xs md:text-sm whitespace-nowrap"
                >
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium">Notifications</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center space-x-2 md:space-x-3 px-3 md:px-6 py-3 md:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-gray-50 text-xs md:text-sm whitespace-nowrap"
                >
                  <Shield className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium">Sécurité</span>
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className="flex items-center space-x-2 md:space-x-3 px-3 md:px-6 py-3 md:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-gray-50 text-xs md:text-sm whitespace-nowrap"
                >
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium">Facturation</span>
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="flex items-center space-x-2 md:space-x-3 px-3 md:px-6 py-3 md:py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-gray-50 text-xs md:text-sm whitespace-nowrap"
                >
                  <Globe className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium">Préférences</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profil Tab */}
            <TabsContent value="Profil">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <Card className="lg:col-span-1 bg-white shadow-xl rounded-2xl border-0">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Photo de profil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div className="relative inline-block">
                      <Avatar className="w-32 h-32 mx-auto ring-4 ring-blue-100">
                        <AvatarImage src={ProfilData.avatar} alt="Profil" />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                          {ProfilData.firstName[0]}
                          {ProfilData.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                        disabled={avatarUploading}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className={`absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors cursor-pointer ${
                          avatarUploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {ProfilData.firstName} {ProfilData.lastName}
                      </h3>
                      <p className="text-gray-600">{ProfilData.email}</p>
                      <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compte vérifié
                      </Badge>
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className={`inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${
                        avatarUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {avatarUploading
                        ? "Upload en cours..."
                        : "Changer la photo"}
                    </label>
                  </CardContent>
                </Card>

                {/* Profil Information */}
                <Card className="lg:col-span-2 bg-white shadow-xl rounded-2xl border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                      <User className="h-6 w-6 mr-3 text-blue-600" />
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          Prénom
                        </label>
                        <Input
                          value={ProfilData.firstName}
                          onChange={(e) =>
                            setProfilData({
                              ...ProfilData,
                              firstName: e.target.value,
                            })
                          }
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl py-3 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          Nom
                        </label>
                        <Input
                          value={ProfilData.lastName}
                          onChange={(e) =>
                            setProfilData({
                              ...ProfilData,
                              lastName: e.target.value,
                            })
                          }
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl py-3 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Mail className="h-4 w-4 mr-2 text-green-500" />
                          Email
                        </label>
                        <Input
                          type="email"
                          value={ProfilData.email}
                          onChange={(e) =>
                            setProfilData({
                              ...ProfilData,
                              email: e.target.value,
                            })
                          }
                          className="border-2 border-gray-200 focus:border-green-500 rounded-xl py-3 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Phone className="h-4 w-4 mr-2 text-purple-500" />
                          Téléphone
                        </label>
                        <Input
                          value={ProfilData.phone}
                          onChange={(e) =>
                            setProfilData({
                              ...ProfilData,
                              phone: e.target.value,
                            })
                          }
                          className="border-2 border-gray-200 focus:border-purple-500 rounded-xl py-3 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Building className="h-4 w-4 mr-2 text-orange-500" />
                          Entreprise
                        </label>
                        <Input
                          value={ProfilData.company}
                          onChange={(e) =>
                            setProfilData({
                              ...ProfilData,
                              company: e.target.value,
                            })
                          }
                          className="border-2 border-gray-200 focus:border-orange-500 rounded-xl py-3 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Link className="h-4 w-4 mr-2 text-indigo-500" />
                          Site web
                        </label>
                        <Input
                          value={ProfilData.website}
                          onChange={(e) =>
                            setProfilData({
                              ...ProfilData,
                              website: e.target.value,
                            })
                          }
                          className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl py-3 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <MapPin className="h-4 w-4 mr-2 text-teal-500" />
                        Localisation
                      </label>
                      <Input
                        type="text"
                        placeholder="Votre localisation"
                        value={ProfilData.location}
                        onChange={(e) =>
                          setProfilData({
                            ...ProfilData,
                            location: e.target.value,
                          })
                        }
                        className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl py-3 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Building className="h-4 w-4 mr-2 text-teal-500" />
                        Poste
                      </label>
                      <Input
                        type="text"
                        placeholder="Votre poste"
                        value={ProfilData.position}
                        onChange={(e) =>
                          setProfilData({
                            ...ProfilData,
                            position: e.target.value,
                          })
                        }
                        className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl py-3 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <FileText className="h-4 w-4 mr-2 text-teal-500" />
                        Biographie
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors resize-none"
                        rows={4}
                        value={ProfilData.bio}
                        onChange={(e) =>
                          setProfilData({
                            ...ProfilData,
                            bio: e.target.value,
                          })
                        }
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>
                    <Button
                      onClick={handleProfilSave}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {loading
                        ? "Sauvegarde..."
                        : "Sauvegarder les modifications"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="bg-white shadow-xl rounded-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <Bell className="h-6 w-6 mr-3 text-green-600" />
                    Préférences de notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-blue-600" />
                        Notifications par email
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800">
                              Mises à jour des commandes
                            </p>
                            <p className="text-sm text-gray-600">
                              Être notifié des changements de statut des
                              commandes
                            </p>
                          </div>
                          <Switch
                            checked={notifications.emailCommandes}
                            onCheckedChange={(checked) =>
                              setNotifications({
                                ...notifications,
                                emailCommandes: checked,
                              })
                            }
                            className="data-[state=checked]:bg-blue-500"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800">
                              Emails marketing
                            </p>
                            <p className="text-sm text-gray-600">
                              Recevoir des emails promotionnels et newsletters
                            </p>
                          </div>
                          <Switch
                            checked={notifications.emailMarketing}
                            onCheckedChange={(checked) =>
                              setNotifications({
                                ...notifications,
                                emailMarketing: checked,
                              })
                            }
                            className="data-[state=checked]:bg-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-purple-600" />
                        Notifications push
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800">
                              Mises à jour des commandes
                            </p>
                            <p className="text-sm text-gray-600">
                              Notifications push pour les changements de
                              commandes
                            </p>
                          </div>
                          <Switch
                            checked={notifications.pushCommandes}
                            onCheckedChange={(checked) =>
                              setNotifications({
                                ...notifications,
                                pushCommandes: checked,
                              })
                            }
                            className="data-[state=checked]:bg-purple-500"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800">
                              Marketing
                            </p>
                            <p className="text-sm text-gray-600">
                              Notifications push promotionnelles
                            </p>
                          </div>
                          <Switch
                            checked={notifications.pushMarketing}
                            onCheckedChange={(checked) =>
                              setNotifications({
                                ...notifications,
                                pushMarketing: checked,
                              })
                            }
                            className="data-[state=checked]:bg-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-orange-600" />
                        Notifications SMS
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800">
                              Mises à jour des commandes
                            </p>
                            <p className="text-sm text-gray-600">
                              SMS pour les changements de commandes
                            </p>
                          </div>
                          <Switch
                            checked={notifications.smsCommandes}
                            onCheckedChange={(checked) =>
                              setNotifications({
                                ...notifications,
                                smsCommandes: checked,
                              })
                            }
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800">
                              Marketing SMS
                            </p>
                            <p className="text-sm text-gray-600">
                              SMS promotionnels
                            </p>
                          </div>
                          <Switch
                            checked={notifications.smsMarketing}
                            onCheckedChange={(checked) =>
                              setNotifications({
                                ...notifications,
                                smsMarketing: checked,
                              })
                            }
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleNotificationsSave}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {loading ? "Sauvegarde..." : "Sauvegarder les préférences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-8">
                {/* Security Paramètres */}
                <Card className="bg-white shadow-xl rounded-2xl border-0">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                      <Shield className="h-6 w-6 mr-3 text-red-600" />
                      Paramètres de sécurité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-green-500 rounded-full">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Authentification à deux facteurs
                            </h3>
                            <p className="text-sm text-gray-600">
                              Ajouter une couche de sécurité supplémentaire à
                              votre compte
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={security.twoFactorEnabled}
                            onCheckedChange={(checked) =>
                              setSecurity({
                                ...security,
                                twoFactorEnabled: checked,
                              })
                            }
                            className="data-[state=checked]:bg-green-500"
                          />
                          {security.twoFactorEnabled && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activé
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-500 rounded-full">
                            <AlertCircle className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Alertes de connexion
                            </h3>
                            <p className="text-sm text-gray-600">
                              Être notifié des nouvelles tentatives de connexion
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={security.loginAlerts}
                          onCheckedChange={(checked) =>
                            setSecurity({ ...security, loginAlerts: checked })
                          }
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>

                      <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-purple-500 rounded-full">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Délai d&#39;expiration de session
                            </h3>
                            <p className="text-sm text-gray-600">
                              Définir quand votre session expire automatiquement
                            </p>
                          </div>
                        </div>
                        <Select
                          value={security.sessionTimeout}
                          onValueChange={(value) =>
                            setSecurity({
                              ...security,
                              sessionTimeout: value,
                            })
                          }
                        >
                          <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 rounded-xl">
                            <SelectValue placeholder="Sélectionner la durée d'expiration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 heure</SelectItem>
                            <SelectItem value="120">2 heures</SelectItem>
                            <SelectItem value="480">8 heures</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleSecuritySave}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {loading
                        ? "Sauvegarde..."
                        : "Sauvegarder les paramètres de sécurité"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="bg-white shadow-xl rounded-2xl border-0">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                      <Lock className="h-6 w-6 mr-3 text-indigo-600" />
                      Changer le mot de passe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Lock className="h-4 w-4 mr-2 text-gray-500" />
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword.current ? "text" : "password"}
                            className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl py-3 pr-12 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                current: !showPassword.current,
                              })
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.current ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Lock className="h-4 w-4 mr-2 text-green-500" />
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword.new ? "text" : "password"}
                            className="border-2 border-gray-200 focus:border-green-500 rounded-xl py-3 pr-12 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                new: !showPassword.new,
                              })
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.new ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Lock className="h-4 w-4 mr-2 text-blue-500" />
                          Confirmer le nouveau mot de passe
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword.confirm ? "text" : "password"}
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl py-3 pr-12 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                confirm: !showPassword.confirm,
                              })
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.confirm ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Mettre à jour le mot de passe
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <div className="space-y-8">
                {/* Current Plan */}
                <Card className="bg-white shadow-xl rounded-2xl border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                      <CreditCard className="h-6 w-6 mr-3 text-emerald-600" />
                      Plan actuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl border border-blue-200">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-blue-500 rounded-full">
                          <CreditCard className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            Plan Premium
                          </h3>
                          <p className="text-gray-600">
                            Accès complet à toutes les fonctionnalités
                          </p>
                          <Badge className="mt-2 bg-blue-100 text-blue-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          29€
                        </div>
                        <div className="text-gray-600">par mois</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Prochain paiement: 15 Jan 2024
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card className="bg-white shadow-xl rounded-2xl border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                      <CreditCard className="h-6 w-6 mr-3 text-purple-600" />
                      Méthodes de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    {/* Existing Card */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-700 rounded-lg">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            •••• •••• •••• 4242
                          </h3>
                          <p className="text-gray-600">Expire 12/25</p>
                          <Badge className="mt-1 bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Par défaut
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300"
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>

                    {/* Add New Card */}
                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 transition-colors">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
                        Ajouter une méthode de paiement
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing History */}
                <Card className="bg-white shadow-xl rounded-2xl border-0">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                      <FileText className="h-6 w-6 mr-3 text-orange-600" />
                      Historique de facturation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {[
                        {
                          date: "15 Déc 2023",
                          amount: "29€",
                          status: "Payé",
                          invoice: "INV-001",
                        },
                        {
                          date: "15 Nov 2023",
                          amount: "29€",
                          status: "Payé",
                          invoice: "INV-002",
                        },
                        {
                          date: "15 Oct 2023",
                          amount: "29€",
                          status: "Payé",
                          invoice: "INV-003",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-500 rounded-full">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {item.invoice}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {item.amount}
                              </p>
                              <Badge className="bg-green-100 text-green-800">
                                {item.status}
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm">
                              PDF
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card className="bg-white shadow-xl rounded-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <Settings className="h-6 w-6 mr-3 text-indigo-600" />
                    Préférences de l&#39;application
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Language */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Globe className="h-4 w-4 mr-2 text-blue-500" />
                        Langue
                      </label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            language: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl py-3 transition-colors">
                          <SelectValue placeholder="Sélectionner la langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">🇫🇷 Français</SelectItem>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                          <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        Fuseau horaire
                      </label>
                      <Select
                        value={preferences.timezone}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            timezone: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-green-500 rounded-xl py-3 transition-colors">
                          <SelectValue placeholder="Sélectionner le fuseau horaire" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC+1">
                            🇪🇺 Europe/Paris (UTC+1)
                          </SelectItem>
                          <SelectItem value="UTC+0">🌍 UTC</SelectItem>
                          <SelectItem value="UTC-5">
                            🇺🇸 Eastern Time (UTC-5)
                          </SelectItem>
                          <SelectItem value="UTC-8">
                            🇺🇸 Pacific Time (UTC-8)
                          </SelectItem>
                          <SelectItem value="UTC+9">
                            🇯🇵 Japan Time (UTC+9)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Currency */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                        Devise
                      </label>
                      <Select
                        value={preferences.currency}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            currency: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-yellow-500 rounded-xl py-3 transition-colors">
                          <SelectValue placeholder="Sélectionner la devise" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">💶 EUR - Euro</SelectItem>
                          <SelectItem value="USD">
                            💵 USD - Dollar américain
                          </SelectItem>
                          <SelectItem value="GBP">
                            💷 GBP - Livre sterling
                          </SelectItem>
                          <SelectItem value="CAD">
                            🇨🇦 CAD - Dollar canadien
                          </SelectItem>
                          <SelectItem value="CHF">
                            🇨🇭 CHF - Franc suisse
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Theme */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Palette className="h-4 w-4 mr-2 text-purple-500" />
                        Thème
                      </label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            theme: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-purple-500 rounded-xl py-3 transition-colors">
                          <SelectValue placeholder="Sélectionner le thème" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">☀️ Clair</SelectItem>
                          <SelectItem value="dark">🌙 Sombre</SelectItem>
                          <SelectItem value="auto">💻 Automatique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Format */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Calendar className="h-4 w-4 mr-2 text-red-500" />
                        Format de date
                      </label>
                      <Select
                        value={preferences.dateFormat}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            dateFormat: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-red-500 rounded-xl py-3 transition-colors">
                          <SelectValue placeholder="Sélectionner le format de date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">
                            📅 DD/MM/YYYY (15/12/2023)
                          </SelectItem>
                          <SelectItem value="MM/DD/YYYY">
                            📅 MM/DD/YYYY (12/15/2023)
                          </SelectItem>
                          <SelectItem value="YYYY-MM-DD">
                            📅 YYYY-MM-DD (2023-12-15)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Number Format */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Hash className="h-4 w-4 mr-2 text-teal-500" />
                        Format des nombres
                      </label>
                      <Select
                        value={preferences.numberFormat || "european"}
                        onValueChange={(value) =>
                          setPreferences({
                            ...preferences,
                            numberFormat: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-teal-500 rounded-xl py-3 transition-colors">
                          <SelectValue placeholder="Sélectionner le format des nombres" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="european">
                            🇪🇺 Européen (1 234,56)
                          </SelectItem>
                          <SelectItem value="american">
                            🇺🇸 Américain (1,234.56)
                          </SelectItem>
                          <SelectItem value="indian">
                            🇮🇳 Indien (1,23,456.78)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      onClick={handlePreferencesSave}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {loading
                        ? "Sauvegarde..."
                        : "Sauvegarder les préférences"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
